-- ============================================================================
--  UNAKO SACCOS · MIGRATION 0001 — SERVER-SIDE TRANSACTIONAL LEDGER
--  ---------------------------------------------------------------------------
--  WHY THIS EXISTS
--    Deposits, withdrawals, dividend payouts and loan disbursements used to be
--    computed in the browser (Zustand arrays seeded from mock data). Balances
--    were lost on reload, a replayed click could mint money, any savings account
--    could be credited, and nothing was atomic. This migration makes PostgreSQL
--    the single source of truth for money: every posting is a SECURITY DEFINER
--    function that validates its inputs, locks the rows it touches, is replayable
--    through an idempotency key, and returns a signed receipt.
--
--  DEPLOYMENT (exact step)
--    Option A (CLI)   : supabase db push                 -- applies supabase/migrations/*.sql
--    Option B (manual): Dashboard -> SQL Editor -> New query -> paste this ENTIRE file -> RUN
--    Prerequisite: supabase/schema.sql must already be applied (this file needs
--      public.members, public.savings_accounts, public.transactions, public.loans,
--      public.employees and the auth schema).
--    Apply as the SAME role that owns those tables (Supabase: `postgres`).
--    If a lesser role applies it, SECURITY DEFINER will not bypass RLS and the
--    ledger will raise "member not found" instead of posting.
--    This file is idempotent: re-running it changes nothing
--    (IF NOT EXISTS / CREATE OR REPLACE / REVOKE / GRANT are all re-runnable).
--
--  STATUS OF THIS FILE
--    It has NOT been executed against any database (no live project was touched
--    during this task). It is self-reviewed only. Run it against a disposable
--    Postgres/Supabase branch and execute the integration checklist in the task
--    report before production.
--
--  ADDITIVE / SAFE TO SHIP FIRST
--    Nothing is dropped or rewritten, no policy is dropped. The store keeps
--    working (it writes to localStorage, not to these tables) until it is wired
--    to these RPCs. The only behaviour change for existing code is the REVOKEs in
--    section 6, which remove direct INSERT/UPDATE on the two money tables that
--    these functions now own.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 0. MONEY DISCIPLINE HELPERS
--    MAX_SINGLE_POSTING = 100000000.00 (NPR 10 crore). A single API/ledger
--    posting above this is treated as an input error, not a business event.
-- ---------------------------------------------------------------------------
create or replace function public.ledger_max_amount()
returns numeric
language sql
immutable
as $$
  select 100000000::numeric;
$$;

comment on function public.ledger_max_amount() is
  'Maximum amount accepted by a single ledger posting (NPR 10 crore).';

-- Validates and canonicalises a money input: rejects NULL, NaN, +/-Infinity,
-- zero/negative values and anything above ledger_max_amount(), then rounds to
-- numeric(14,2) precision. Every posting function calls this first, so no
-- client-supplied amount can be trusted as-is.
create or replace function public.ledger_amount(p_amount numeric)
returns numeric
language plpgsql
immutable
as $$
declare
  v_amount numeric(14,2);
begin
  if p_amount is null then
    raise exception 'ledger: amount is required'
      using errcode = '22023';
  end if;

  -- PostgreSQL numeric marks NaN as greater than every other value, so both the
  -- explicit test and the ceiling test below catch it.
  if p_amount = 'NaN'::numeric then
    raise exception 'ledger: amount must be a finite number, got NaN'
      using errcode = '22023';
  end if;

  v_amount := round(p_amount, 2);

  if v_amount <= 0 then
    raise exception 'ledger: amount must be greater than zero (got %)', p_amount
      using errcode = '22023';
  end if;

  if v_amount > public.ledger_max_amount() then
    raise exception 'ledger: amount % exceeds the maximum single posting of %',
      p_amount, public.ledger_max_amount()
      using errcode = '22023';
  end if;

  return v_amount;
end;
$$;

comment on function public.ledger_amount(numeric) is
  'Rejects NULL/NaN/non-positive/oversized money inputs and rounds to numeric(14,2).';

-- ---------------------------------------------------------------------------
-- 1. IDEMPOTENCY / RECEIPT REGISTRY
--    One row per money operation. The PRIMARY KEY on idempotency_key is what
--    serialises concurrent duplicates: the second concurrent transaction blocks
--    on the unique index until the first commits, then sees the stored receipt
--    and returns it verbatim instead of posting a second time.
--    RLS is enabled with NO policies on purpose: only the SECURITY DEFINER
--    functions (running as the table owner) may read or write this table.
-- ---------------------------------------------------------------------------
create table if not exists public.ledger_idempotency (
  idempotency_key text primary key,
  operation       text not null,
  member_id       uuid,
  amount          numeric(14, 2),
  result          jsonb,
  created_at      timestamptz not null default now()
);

comment on table public.ledger_idempotency is
  'Replay registry for the server-side ledger. Written only by SECURITY DEFINER posting functions.';

create index if not exists ledger_idempotency_operation_idx
  on public.ledger_idempotency (operation, created_at desc);
create index if not exists ledger_idempotency_member_idx
  on public.ledger_idempotency (member_id, created_at desc);

alter table public.ledger_idempotency enable row level security;

-- Deliberately no policies: direct access is impossible for anon/authenticated.
revoke all on table public.ledger_idempotency from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 2. AUTHORIZATION + IDEMPOTENCY PRIMITIVES
-- ---------------------------------------------------------------------------

-- Money may only be posted by an ACTIVE member of staff. Self-contained on
-- purpose (does not depend on helpers owned by the schema file), and evaluated
-- as the function owner so RLS on public.employees cannot hide the row.
create or replace function public.ledger_require_staff()
returns void
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if coalesce(auth.role(), 'anon') <> 'authenticated' then
    raise exception 'ledger: authentication is required to post money movements'
      using errcode = '42501';
  end if;

  if not exists (
    select 1
      from public.employees e
     where e.auth_user_id = auth.uid()
       and e.status = 'ACTIVE'
  ) then
    raise exception 'ledger: an ACTIVE staff employee account is required to post money movements'
      using errcode = '42501';
  end if;
end;
$$;

comment on function public.ledger_require_staff() is
  'Raises 42501 unless the caller is an authenticated, ACTIVE employee.';

-- Claims an idempotency key for an operation.
--   {"replay": false}                    -> caller owns the key, must post and then store the receipt
--   {"replay": true, "result": {...}}    -> already processed; return this receipt, change nothing
-- Reusing a key for a different operation, or with a different payload, is an
-- error (a client bug must never be silently masked into a wrong receipt).
create or replace function public.ledger_claim(
  p_idempotency_key text,
  p_operation       text,
  p_member_id       uuid,
  p_amount          numeric
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.ledger_idempotency%rowtype;
begin
  if p_idempotency_key is null or btrim(p_idempotency_key) = '' then
    raise exception 'ledger: an idempotency key is required for every money movement'
      using errcode = '22023';
  end if;

  if length(p_idempotency_key) < 8 or length(p_idempotency_key) > 200 then
    raise exception 'ledger: idempotency key must be between 8 and 200 characters'
      using errcode = '22023';
  end if;

  insert into public.ledger_idempotency (idempotency_key, operation, member_id, amount)
  values (p_idempotency_key, p_operation, p_member_id, p_amount)
  on conflict (idempotency_key) do nothing;

  -- FOUND is false when the key already existed (this or a concurrent call).
  if found then
    return jsonb_build_object('replay', false);
  end if;

  select *
    into v_row
    from public.ledger_idempotency
   where idempotency_key = p_idempotency_key;

  if not found then
    -- The competing transaction rolled back between our insert and this select.
    raise exception 'ledger: idempotency key % could not be claimed, please retry', p_idempotency_key
      using errcode = '40001';
  end if;

  if v_row.operation <> p_operation then
    raise exception 'ledger: idempotency key % was already used for operation % (this call is %)',
      p_idempotency_key, v_row.operation, p_operation
      using errcode = '22023';
  end if;

  if v_row.member_id is distinct from p_member_id or v_row.amount is distinct from p_amount then
    raise exception 'ledger: idempotency key % was already used with a different payload', p_idempotency_key
      using errcode = '22023';
  end if;

  if v_row.result is null then
    raise exception 'ledger: operation % with key % is already in flight, please retry shortly',
      p_operation, p_idempotency_key
      using errcode = '40001';
  end if;

  return jsonb_build_object('replay', true, 'result', v_row.result);
end;
$$;

comment on function public.ledger_claim(text, text, uuid, numeric) is
  'Claims or replays an idempotency key. Prevents double posting on retries and concurrent duplicate calls.';

-- The transactions.type CHECK in supabase/schema.sql does not include a loan
-- disbursement type. Read the live constraint so the ledger books the precise
-- type when the schema owner adds it, and otherwise falls back to WITHDRAWAL
-- (money leaving the co-operative). Resolved at runtime, no DDL, never fails.
create or replace function public.ledger_loan_disbursement_txn_type()
returns text
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_type text;
begin
  select case
           when bool_or(pg_get_constraintdef(c.oid) like '%LOAN_DISBURSEMENT%')
             then 'LOAN_DISBURSEMENT'
           else 'WITHDRAWAL'
         end
    into v_type
    from pg_constraint c
   where c.conrelid = 'public.transactions'::regclass
     and c.contype = 'c';

  return coalesce(v_type, 'WITHDRAWAL');
end;
$$;

comment on function public.ledger_loan_disbursement_txn_type() is
  'Returns LOAN_DISBURSEMENT when the transactions.type CHECK allows it, else WITHDRAWAL. Never DEPOSIT.';

-- ---------------------------------------------------------------------------
-- 3. public.post_deposit(...)
--    Credits ONE savings account that must belong to p_member_id, and the
--    member aggregate, in a single transaction.
-- ---------------------------------------------------------------------------
create or replace function public.post_deposit(
  p_idempotency_key text,
  p_member_id       uuid,
  p_account_no      text,
  p_amount          numeric,
  p_reference       text default null,
  p_description     text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_amount  numeric(14,2);
  v_claim   jsonb;
  v_member  public.members%rowtype;
  v_account public.savings_accounts%rowtype;
  v_tx_id   uuid;
  v_result  jsonb;
begin
  perform public.ledger_require_staff();

  v_amount := public.ledger_amount(p_amount);

  if p_member_id is null then
    raise exception 'ledger: member id is required' using errcode = '22023';
  end if;
  if p_account_no is null or btrim(p_account_no) = '' then
    raise exception 'ledger: destination account number is required' using errcode = '22023';
  end if;

  v_claim := public.ledger_claim(p_idempotency_key, 'post_deposit', p_member_id, v_amount);
  if coalesce((v_claim ->> 'replay')::boolean, false) then
    return coalesce(v_claim -> 'result', '{}'::jsonb) || jsonb_build_object('replayed', true);
  end if;

  -- Lock order is members -> savings_accounts -> loans in every function, so
  -- concurrent postings for different keys cannot deadlock.
  select * into v_member from public.members where id = p_member_id for update;
  if not found then
    raise exception 'ledger: member % not found', p_member_id using errcode = '23503';
  end if;

  -- Ownership and the row lock are established by ONE query: an account that
  -- does not belong to this member simply does not exist for this call.
  select * into v_account
    from public.savings_accounts
   where account_no = p_account_no
     and member_id = p_member_id
   for update;

  if not found then
    raise exception 'ledger: savings account % does not exist for member % (refusing to credit any other account)',
      p_account_no, p_member_id
      using errcode = '23503';
  end if;

  if v_account.status <> 'ACTIVE' then
    raise exception 'ledger: savings account % is % and cannot accept postings',
      v_account.account_no, v_account.status
      using errcode = '23514';
  end if;

  insert into public.transactions (member_id, type, description, amount, reference_no, status)
  values (
    p_member_id,
    'DEPOSIT',
    coalesce(nullif(btrim(coalesce(p_description, '')), ''), 'Deposit'),
    v_amount,
    coalesce(p_reference, ''),
    'COMPLETED'
  )
  returning id into v_tx_id;

  update public.savings_accounts
     set balance = balance + v_amount
   where id = v_account.id;

  update public.members
     set total_savings = total_savings + v_amount
   where id = p_member_id;

  v_result := jsonb_build_object(
    'ok', true,
    'operation', 'post_deposit',
    'idempotency_key', p_idempotency_key,
    'member_id', p_member_id,
    'account_no', v_account.account_no,
    'transaction_id', v_tx_id,
    'amount', v_amount,
    'previous_balance', v_account.balance,
    'balance', v_account.balance + v_amount,
    'posted_by', auth.uid(),
    'posted_at', now(),
    'replayed', false
  );

  update public.ledger_idempotency
     set result = v_result
   where idempotency_key = p_idempotency_key;

  return v_result;
end;
$$;

comment on function public.post_deposit(text, uuid, text, numeric, text, text) is
  'Atomic, idempotent, account-verified deposit credit. Never falls back to another account.';

-- ---------------------------------------------------------------------------
-- 4. public.post_withdrawal(...)
--    Same shape as post_deposit, but fails closed on insufficient funds.
-- ---------------------------------------------------------------------------
create or replace function public.post_withdrawal(
  p_idempotency_key text,
  p_member_id       uuid,
  p_account_no      text,
  p_amount          numeric,
  p_reference       text default null,
  p_description     text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_amount  numeric(14,2);
  v_claim   jsonb;
  v_member  public.members%rowtype;
  v_account public.savings_accounts%rowtype;
  v_tx_id   uuid;
  v_result  jsonb;
begin
  perform public.ledger_require_staff();

  v_amount := public.ledger_amount(p_amount);

  if p_member_id is null then
    raise exception 'ledger: member id is required' using errcode = '22023';
  end if;
  if p_account_no is null or btrim(p_account_no) = '' then
    raise exception 'ledger: source account number is required' using errcode = '22023';
  end if;

  v_claim := public.ledger_claim(p_idempotency_key, 'post_withdrawal', p_member_id, v_amount);
  if coalesce((v_claim ->> 'replay')::boolean, false) then
    return coalesce(v_claim -> 'result', '{}'::jsonb) || jsonb_build_object('replayed', true);
  end if;

  select * into v_member from public.members where id = p_member_id for update;
  if not found then
    raise exception 'ledger: member % not found', p_member_id using errcode = '23503';
  end if;

  select * into v_account
    from public.savings_accounts
   where account_no = p_account_no
     and member_id = p_member_id
   for update;

  if not found then
    raise exception 'ledger: savings account % does not exist for member % (refusing to debit any other account)',
      p_account_no, p_member_id
      using errcode = '23503';
  end if;

  if v_account.status <> 'ACTIVE' then
    raise exception 'ledger: savings account % is % and cannot be debited',
      v_account.account_no, v_account.status
      using errcode = '23514';
  end if;

  -- No overdraft: the balance of the LOCKED row is authoritative.
  if v_account.balance < v_amount then
    raise exception 'ledger: insufficient funds on account % (balance %, requested %)',
      v_account.account_no, v_account.balance, v_amount
      using errcode = '23514';
  end if;

  -- Fail closed rather than create a negative member aggregate.
  if coalesce(v_member.total_savings, 0) < v_amount then
    raise exception 'ledger: member total savings (%) is below the requested withdrawal (%) - ledger and member aggregate disagree',
      coalesce(v_member.total_savings, 0), v_amount
      using errcode = '23514';
  end if;

  insert into public.transactions (member_id, type, description, amount, reference_no, status)
  values (
    p_member_id,
    'WITHDRAWAL',
    coalesce(nullif(btrim(coalesce(p_description, '')), ''), 'Withdrawal'),
    v_amount,
    coalesce(p_reference, ''),
    'COMPLETED'
  )
  returning id into v_tx_id;

  update public.savings_accounts
     set balance = balance - v_amount
   where id = v_account.id;

  update public.members
     set total_savings = total_savings - v_amount
   where id = p_member_id;

  v_result := jsonb_build_object(
    'ok', true,
    'operation', 'post_withdrawal',
    'idempotency_key', p_idempotency_key,
    'member_id', p_member_id,
    'account_no', v_account.account_no,
    'transaction_id', v_tx_id,
    'amount', v_amount,
    'previous_balance', v_account.balance,
    'balance', v_account.balance - v_amount,
    'posted_by', auth.uid(),
    'posted_at', now(),
    'replayed', false
  );

  update public.ledger_idempotency
     set result = v_result
   where idempotency_key = p_idempotency_key;

  return v_result;
end;
$$;

comment on function public.post_withdrawal(text, uuid, text, numeric, text, text) is
  'Atomic, idempotent, no-overdraft withdrawal debit.';

-- ---------------------------------------------------------------------------
-- 5. public.post_dividend_payout(...)
--    * 18% statutory ceiling on the declared rate
--    * TDS derived server-side at 5% of the APPLIED gross
--    * payout capped at the member's accrued_dividend
--    * accrued_dividend is reduced only in the same transaction as the credit
-- ---------------------------------------------------------------------------
create or replace function public.post_dividend_payout(
  p_idempotency_key text,
  p_member_id       uuid,
  p_account_no      text,
  p_gross_amount    numeric,
  p_rate_percent    numeric,
  p_destination     text,
  p_reference       text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_gross       numeric(14,2);
  v_rate        numeric(5,2);
  v_destination text;
  v_claim       jsonb;
  v_member      public.members%rowtype;
  v_account     public.savings_accounts%rowtype;
  v_applied     numeric(14,2);
  v_capped      boolean := false;
  v_tds         numeric(14,2);
  v_net         numeric(14,2);
  v_tx_id       uuid;
  v_result      jsonb;
begin
  perform public.ledger_require_staff();

  v_gross := public.ledger_amount(p_gross_amount);

  if p_rate_percent is null or p_rate_percent = 'NaN'::numeric then
    raise exception 'ledger: dividend rate is required' using errcode = '22023';
  end if;

  v_rate := round(p_rate_percent, 2);

  if v_rate < 0 or v_rate > 18 then
    raise exception 'ledger: dividend rate % is outside the statutory 0-18%% range', p_rate_percent
      using errcode = '22023';
  end if;

  v_destination := upper(btrim(coalesce(p_destination, 'SAVINGS')));
  if v_destination not in ('SAVINGS', 'CASH', 'BANK') then
    raise exception 'ledger: dividend destination must be SAVINGS, CASH or BANK (got %)', p_destination
      using errcode = '22023';
  end if;

  if p_member_id is null then
    raise exception 'ledger: member id is required' using errcode = '22023';
  end if;

  if v_destination = 'SAVINGS' and (p_account_no is null or btrim(p_account_no) = '') then
    raise exception 'ledger: a savings account number is required when the destination is SAVINGS'
      using errcode = '22023';
  end if;

  v_claim := public.ledger_claim(p_idempotency_key, 'post_dividend_payout', p_member_id, v_gross);
  if coalesce((v_claim ->> 'replay')::boolean, false) then
    return coalesce(v_claim -> 'result', '{}'::jsonb) || jsonb_build_object('replayed', true);
  end if;

  select * into v_member from public.members where id = p_member_id for update;
  if not found then
    raise exception 'ledger: member % not found', p_member_id using errcode = '23503';
  end if;

  if coalesce(v_member.accrued_dividend, 0) <= 0 then
    raise exception 'ledger: member % has no accrued dividend to pay out', p_member_id
      using errcode = '23514';
  end if;

  -- Cap the payout at what the member has actually accrued.
  v_applied := least(v_gross, v_member.accrued_dividend);
  v_capped  := v_applied < v_gross;

  -- TDS is derived here, never accepted from the client.
  v_tds := round(v_applied * 0.05, 2);
  v_net := v_applied - v_tds;

  if v_net <= 0 then
    raise exception 'ledger: net dividend % is not positive after 5%% TDS on %', v_net, v_applied
      using errcode = '23514';
  end if;

  if v_destination = 'SAVINGS' then
    select * into v_account
      from public.savings_accounts
     where account_no = p_account_no
       and member_id = p_member_id
     for update;

    if not found then
      raise exception 'ledger: savings account % does not exist for member % (refusing to credit any other account)',
        p_account_no, p_member_id
        using errcode = '23503';
    end if;

    if v_account.status <> 'ACTIVE' then
      raise exception 'ledger: savings account % is % and cannot be credited',
        v_account.account_no, v_account.status
        using errcode = '23514';
    end if;

    update public.savings_accounts
       set balance = balance + v_net
     where id = v_account.id;
  end if;

  insert into public.transactions (member_id, type, description, amount, reference_no, status)
  values (
    p_member_id,
    'DIVIDEND',
    format(
      'Dividend payout %s%% (%s) [Gross: NPR %s, TDS 5%%: NPR %s, Net: NPR %s]',
      v_rate,
      case when v_destination = 'SAVINGS' then 'Credited to Regular Savings' else 'Paid at counter/bank' end,
      v_applied, v_tds, v_net
    ),
    v_net,
    coalesce(nullif(btrim(coalesce(p_reference, '')), ''), p_idempotency_key),
    'COMPLETED'
  )
  returning id into v_tx_id;

  -- Runs in the same transaction as the credit above: if the credit fails, the
  -- whole function rolls back and accrued_dividend is untouched.
  update public.members
     set accrued_dividend = accrued_dividend - v_applied,
         total_savings = total_savings + case when v_destination = 'SAVINGS' then v_net else 0 end
   where id = p_member_id;

  v_result := jsonb_build_object(
    'ok', true,
    'operation', 'post_dividend_payout',
    'idempotency_key', p_idempotency_key,
    'member_id', p_member_id,
    'account_no', case when v_destination = 'SAVINGS' then v_account.account_no else null end,
    'transaction_id', v_tx_id,
    'amount', v_net,
    'gross_requested', v_gross,
    'gross_applied', v_applied,
    'capped', v_capped,
    'rate_percent', v_rate,
    'tds', v_tds,
    'net_amount', v_net,
    'destination', v_destination,
    'accrued_dividend_remaining', coalesce(v_member.accrued_dividend, 0) - v_applied,
    'balance', case when v_destination = 'SAVINGS' then v_account.balance + v_net else null end,
    'posted_by', auth.uid(),
    'posted_at', now(),
    'replayed', false
  );

  update public.ledger_idempotency
     set result = v_result
   where idempotency_key = p_idempotency_key;

  return v_result;
end;
$$;

comment on function public.post_dividend_payout(text, uuid, text, numeric, numeric, text, text) is
  'Idempotent dividend payout: 18% rate ceiling, server-derived 5% TDS, capped at accrued_dividend.';

-- ---------------------------------------------------------------------------
-- 6. public.post_loan_disbursement(...)
--    * the loan must belong to the member and must not be disbursed yet
--    * the disbursement account must belong to the member
--    * proceeds are booked with LOAN_DISBURSEMENT (or WITHDRAWAL when the
--      transactions.type CHECK has not been extended) - NEVER 'DEPOSIT'
-- ---------------------------------------------------------------------------
create or replace function public.post_loan_disbursement(
  p_idempotency_key text,
  p_member_id       uuid,
  p_loan_no         text,
  p_account_no      text,
  p_amount          numeric,
  p_reference       text default null,
  p_description     text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_amount  numeric(14,2);
  v_claim   jsonb;
  v_member  public.members%rowtype;
  v_account public.savings_accounts%rowtype;
  v_loan    public.loans%rowtype;
  v_tx_type text;
  v_tx_id   uuid;
  v_result  jsonb;
begin
  perform public.ledger_require_staff();

  v_amount := public.ledger_amount(p_amount);

  if p_member_id is null then
    raise exception 'ledger: member id is required' using errcode = '22023';
  end if;
  if p_loan_no is null or btrim(p_loan_no) = '' then
    raise exception 'ledger: loan number is required' using errcode = '22023';
  end if;
  if p_account_no is null or btrim(p_account_no) = '' then
    raise exception 'ledger: disbursement account number is required' using errcode = '22023';
  end if;

  v_claim := public.ledger_claim(p_idempotency_key, 'post_loan_disbursement', p_member_id, v_amount);
  if coalesce((v_claim ->> 'replay')::boolean, false) then
    return coalesce(v_claim -> 'result', '{}'::jsonb) || jsonb_build_object('replayed', true);
  end if;

  select * into v_member from public.members where id = p_member_id for update;
  if not found then
    raise exception 'ledger: member % not found', p_member_id using errcode = '23503';
  end if;

  -- The loan must exist AND belong to this member.
  select * into v_loan
    from public.loans
   where loan_no = p_loan_no
     and member_id = p_member_id
   for update;

  if not found then
    raise exception 'ledger: loan % does not exist for member %', p_loan_no, p_member_id
      using errcode = '23503';
  end if;

  -- Single-disbursement guard. disbursed_date is set by this function, so a
  -- second call (even with a different idempotency key) cannot pay twice.
  if v_loan.disbursed_date is not null then
    raise exception 'ledger: loan % was already disbursed on %', v_loan.loan_no, v_loan.disbursed_date
      using errcode = '23514';
  end if;

  if v_loan.status not in ('UNDER_REVIEW', 'ACTIVE') then
    raise exception 'ledger: loan % is in status % and cannot be disbursed', v_loan.loan_no, v_loan.status
      using errcode = '23514';
  end if;

  select * into v_account
    from public.savings_accounts
   where account_no = p_account_no
     and member_id = p_member_id
   for update;

  if not found then
    raise exception 'ledger: savings account % does not exist for member % (refusing to disburse to any other account)',
      p_account_no, p_member_id
      using errcode = '23503';
  end if;

  if v_account.status <> 'ACTIVE' then
    raise exception 'ledger: savings account % is % and cannot receive a disbursement',
      v_account.account_no, v_account.status
      using errcode = '23514';
  end if;

  v_tx_type := public.ledger_loan_disbursement_txn_type();

  insert into public.transactions (member_id, type, description, amount, reference_no, status)
  values (
    p_member_id,
    v_tx_type,
    coalesce(
      nullif(btrim(coalesce(p_description, '')), ''),
      format('Loan disbursement %s credited to savings account %s', v_loan.loan_no, v_account.account_no)
    ),
    v_amount,
    coalesce(nullif(btrim(coalesce(p_reference, '')), ''), v_loan.loan_no),
    'COMPLETED'
  )
  returning id into v_tx_id;

  -- Proceeds land in the member's own account; the loan becomes an asset.
  update public.savings_accounts
     set balance = balance + v_amount
   where id = v_account.id;

  update public.members
     set total_savings = total_savings + v_amount,
         active_loan_balance = active_loan_balance + v_amount
   where id = p_member_id;

  update public.loans
     set remaining_balance = remaining_balance + v_amount,
         disbursed_date = current_date,
         status = case when status = 'UNDER_REVIEW' then 'ACTIVE' else status end
   where id = v_loan.id;

  v_result := jsonb_build_object(
    'ok', true,
    'operation', 'post_loan_disbursement',
    'idempotency_key', p_idempotency_key,
    'member_id', p_member_id,
    'account_no', v_account.account_no,
    'loan_no', v_loan.loan_no,
    'transaction_id', v_tx_id,
    'transaction_type', v_tx_type,
    'amount', v_amount,
    'previous_balance', v_account.balance,
    'balance', v_account.balance + v_amount,
    'remaining_balance', v_loan.remaining_balance + v_amount,
    'disbursed_date', current_date,
    'posted_by', auth.uid(),
    'posted_at', now(),
    'replayed', false
  );

  update public.ledger_idempotency
     set result = v_result
   where idempotency_key = p_idempotency_key;

  return v_result;
end;
$$;

comment on function public.post_loan_disbursement(text, uuid, text, text, numeric, text, text) is
  'Idempotent, single-run loan disbursement into the member''s own savings account.';

-- ---------------------------------------------------------------------------
-- 7. PRIVILEGES
-- ---------------------------------------------------------------------------

-- Helpers are internal: nobody may call them directly.
revoke all on function public.ledger_max_amount() from public, anon, authenticated;
revoke all on function public.ledger_amount(numeric) from public, anon, authenticated;
revoke all on function public.ledger_require_staff() from public, anon, authenticated;
revoke all on function public.ledger_claim(text, text, uuid, numeric) from public, anon, authenticated;
revoke all on function public.ledger_loan_disbursement_txn_type() from public, anon, authenticated;

-- Posting functions: authenticated staff only, never anon.
revoke all on function public.post_deposit(text, uuid, text, numeric, text, text) from public, anon;
revoke all on function public.post_withdrawal(text, uuid, text, numeric, text, text) from public, anon;
revoke all on function public.post_dividend_payout(text, uuid, text, numeric, numeric, text, text) from public, anon;
revoke all on function public.post_loan_disbursement(text, uuid, text, text, numeric, text, text) from public, anon;

grant execute on function public.post_deposit(text, uuid, text, numeric, text, text) to authenticated;
grant execute on function public.post_withdrawal(text, uuid, text, numeric, text, text) to authenticated;
grant execute on function public.post_dividend_payout(text, uuid, text, numeric, numeric, text, text) to authenticated;
grant execute on function public.post_loan_disbursement(text, uuid, text, text, numeric, text, text) to authenticated;

-- Money tables the functions now own: remove direct writes from `authenticated`
-- so a client bug cannot bypass validation, locking or idempotency.
revoke insert, update on table public.transactions from authenticated;
revoke insert, update on table public.savings_accounts from authenticated;

-- NOT revoked, on purpose (needs a coordinated change with the schema owner):
--   public.members   - UPDATE must stay for member self-service profile edits and
--                      staff KYC work, so total_savings / accrued_dividend /
--                      active_loan_balance remain directly writable. A column-level
--                      REVOKE would be a no-op while the table-level UPDATE grant
--                      exists, so this must be done with a policy/trigger change.
--   public.loans     - UPDATE must stay for EMI/servicing flows; the single
--                      disbursement guard lives in post_loan_disbursement().
-- Follow-up: once every store path is wired to these RPCs, revoke those too.
-- ============================================================================
