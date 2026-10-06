-- ============================================================================
--  UNAKO SAVINGS & CREDIT COOPERATIVE · SUPABASE FRESH SCHEMA
--  Run once in:  Supabase Dashboard → SQL Editor → New query → paste → RUN
--  Safe to re-run: every statement is idempotent (IF NOT EXISTS / OR REPLACE).
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- 0. SHARED HELPERS
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 1. EMPLOYEES  (HR / staff registry behind /admin/employees)
-- ---------------------------------------------------------------------------
create table if not exists public.employees (
  id                 uuid primary key default gen_random_uuid(),
  employee_no        text not null unique,
  name               text not null,
  name_nepali        text,
  designation        text not null,
  designation_nepali text,
  department         text not null default 'General Administration',
  branch             text not null default 'Gadhwa Main Branch',
  phone              text not null,
  email              text not null,
  joined_date        date not null default current_date,
  status             text not null default 'ACTIVE'
                     check (status in ('ACTIVE', 'ON_LEAVE', 'INACTIVE')),
  access_role        text not null default 'FIELD_OFFICER'
                     check (access_role in ('SUPER_ADMIN', 'BRANCH_MANAGER', 'LOAN_OFFICER',
                                            'TELLER', 'ACCOUNTANT', 'FIELD_OFFICER')),
  assigned_wards     text[] not null default '{}',
  avatar_url         text not null default '/assets/kyc/avatar_officer.png',
  notes              text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists employees_status_idx on public.employees (status);
create index if not exists employees_role_idx   on public.employees (access_role);

drop trigger if exists trg_employees_updated_at on public.employees;
create trigger trg_employees_updated_at
  before update on public.employees
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 2. MEMBERS  (cooperative shareholders / members)
-- ---------------------------------------------------------------------------
create table if not exists public.members (
  id                 uuid primary key default gen_random_uuid(),
  member_no          text not null unique,
  name               text not null,
  name_nepali        text,
  email              text not null,
  phone              text not null,
  citizenship_no     text not null,
  pan_no             text,
  joined_date        date not null default current_date,
  address            text not null default 'Gadhwa-5, Dang',
  status             text not null default 'PENDING'
                     check (status in ('VERIFIED', 'PENDING', 'ACTION_REQUIRED', 'REJECTED')),
  avatar_url         text not null default '/assets/kyc/avatar_hari.png',
  share_capital      numeric(14, 2) not null default 0,
  total_savings      numeric(14, 2) not null default 0,
  active_loan_balance numeric(14, 2) not null default 0,
  accrued_dividend   numeric(14, 2) not null default 0,
  credit_score       integer not null default 700 check (credit_score between 300 and 850),
  bank_details       jsonb not null default '{}'::jsonb,
  kyc_documents      jsonb not null default '{}'::jsonb,
  -- Links the member to their Supabase Auth login (members.auth_user_id = auth.users.id).
  -- Set when a member account is activated; see section 6 helpers + auto-link trigger.
  auth_user_id       uuid references auth.users (id) on delete set null,
  notes              text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists members_status_idx on public.members (status);

drop trigger if exists trg_members_updated_at on public.members;
create trigger trg_members_updated_at
  before update on public.members
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 3. SAVINGS ACCOUNTS · LOANS · LOAN APPLICATIONS
-- ---------------------------------------------------------------------------
create table if not exists public.savings_accounts (
  id            uuid primary key default gen_random_uuid(),
  member_id     uuid references public.members (id) on delete cascade,
  account_no    text not null unique,
  account_type  text not null default 'Regular Savings',
  balance       numeric(14, 2) not null default 0,
  interest_rate numeric(5, 2) not null default 8.0,
  opened_date   date not null default current_date,
  maturity_date date,
  status        text not null default 'ACTIVE'
                check (status in ('ACTIVE', 'DORMANT', 'MATURED')),
  created_at    timestamptz not null default now()
);

create table if not exists public.loans (
  id                     uuid primary key default gen_random_uuid(),
  member_id              uuid references public.members (id) on delete cascade,
  loan_no                text not null unique,
  loan_type              text not null,
  principal_amount       numeric(14, 2) not null default 0,
  remaining_balance      numeric(14, 2) not null default 0,
  interest_rate          numeric(5, 2) not null default 9.5,
  tenure_months          integer not null default 12,
  monthly_emi            numeric(14, 2) not null default 0,
  disbursed_date         date,
  next_due_date          date,
  status                 text not null default 'ACTIVE'
                         check (status in ('ACTIVE', 'UNDER_REVIEW', 'PAID_OFF', 'OVERDUE')),
  collateral_description text not null default '',
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

drop trigger if exists trg_loans_updated_at on public.loans;
create trigger trg_loans_updated_at
  before update on public.loans
  for each row execute function public.set_updated_at();

create table if not exists public.loan_applications (
  id                 uuid primary key default gen_random_uuid(),
  application_no     text not null unique,
  member_id          uuid references public.members (id) on delete set null,
  member_name        text not null,
  member_no          text not null,
  loan_type          text not null,
  requested_amount   numeric(14, 2) not null default 0,
  tenure_months      integer not null default 12,
  monthly_income     numeric(14, 2) not null default 0,
  existing_debt      numeric(14, 2) not null default 0,
  purpose            text not null default '',
  collateral_details text not null default '',
  applied_date       date not null default current_date,
  status             text not null default 'SUBMITTED'
                     check (status in ('SUBMITTED', 'UNDER_COMMITTEE_REVIEW', 'APPROVED',
                                        'REJECTED', 'DOCUMENT_REQUIRED')),
  documents          jsonb not null default '{}'::jsonb,
  committee_notes    text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists loan_applications_status_idx on public.loan_applications (status);

drop trigger if exists trg_loan_applications_updated_at on public.loan_applications;
create trigger trg_loan_applications_updated_at
  before update on public.loan_applications
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 4. TRANSACTIONS · INQUIRIES · NOTIFICATIONS · NOTICES
-- ---------------------------------------------------------------------------
create table if not exists public.transactions (
  id           uuid primary key default gen_random_uuid(),
  member_id    uuid references public.members (id) on delete set null,
  date         date not null default current_date,
  type         text not null
               check (type in ('DEPOSIT', 'WITHDRAWAL', 'LOAN_EMI', 'DIVIDEND', 'SHARE_PURCHASE',
                               'LOAN_DISBURSEMENT')),
  description  text not null default '',
  amount       numeric(14, 2) not null default 0,
  reference_no text not null default '',
  status       text not null default 'COMPLETED'
               check (status in ('COMPLETED', 'PENDING', 'FAILED')),
  created_at   timestamptz not null default now()
);

create index if not exists transactions_date_idx on public.transactions (date desc);

-- LOAN_DISBURSEMENT was added for the server-side ledger
-- (supabase/migrations/0001_ledger.sql). The inline CHECK above covers fresh
-- installs; this block re-points the auto-named column constraint on databases
-- that were created before the value existed. Idempotent: drop + re-add, and
-- safe to re-run because the inline CHECK already rejected every other value.
alter table public.transactions drop constraint if exists transactions_type_check;
alter table public.transactions add constraint transactions_type_check
  check (type in ('DEPOSIT', 'WITHDRAWAL', 'LOAN_EMI', 'DIVIDEND', 'SHARE_PURCHASE',
                  'LOAN_DISBURSEMENT'));

create table if not exists public.inquiries (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  email      text not null,
  phone      text not null default '',
  subject    text not null default '',
  message    text not null default '',
  category   text not null default 'General'
             check (category in ('Membership', 'Loan Request', 'Savings & Rates',
                                 'Technical Issue', 'General')),
  status     text not null default 'NEW' check (status in ('NEW', 'IN_PROGRESS', 'RESOLVED')),
  date       date not null default current_date,
  reply      text,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  member_id  uuid references public.members (id) on delete cascade,
  title      text not null,
  message    text not null default '',
  date       date not null default current_date,
  type       text not null default 'SYSTEM' check (type in ('SYSTEM', 'FINANCE', 'ALERT', 'PROMO')),
  is_read    boolean not null default false,
  action_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.notices (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  title_nepali   text not null default '',
  category       text not null default 'GENERAL'
                 check (category in ('AGM', 'FESTIVAL', 'DIVIDEND', 'POLICY', 'GENERAL')),
  content        text not null default '',
  published_date date not null default current_date,
  is_urgent      boolean not null default false,
  is_active      boolean not null default true,
  created_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 5. CONFIGURATION TABLES (CMS settings · share pool · AGM · schemes · gateways)
-- ---------------------------------------------------------------------------
create table if not exists public.coop_settings (
  id                 uuid primary key default gen_random_uuid(),
  coop_key           text not null unique default 'primary',
  name               text not null,
  name_nepali        text not null default '',
  reg_no             text not null default '',
  reg_no_english     text,
  pan_no             text not null default '',
  address            text not null default '',
  address_nepali     text,
  address_english    text,
  phone              text not null default '',
  phone_english      text,
  email              text not null default '',
  opening_hours      text not null default '',
  opening_hours_nepali text,
  opening_hours_english text,
  operating_status   text not null default 'NORMAL'
                     check (operating_status in ('NORMAL', 'MAINTENANCE')),
  updated_at         timestamptz not null default now()
);

drop trigger if exists trg_coop_settings_updated_at on public.coop_settings;
create trigger trg_coop_settings_updated_at
  before update on public.coop_settings
  for each row execute function public.set_updated_at();

create table if not exists public.share_pool (
  id                       uuid primary key default gen_random_uuid(),
  pool_key                 text not null unique default 'primary',
  par_value                numeric(10, 2) not null default 100,
  total_allotted_kitta     integer not null default 0,
  total_reserve_fund       numeric(14, 2) not null default 0,
  annual_dividend_percent  numeric(5, 2) not null default 0,
  patronage_bonus_percent  numeric(5, 2) not null default 0,
  share_purchase_open      boolean not null default true,
  updated_at               timestamptz not null default now()
);

create table if not exists public.agm_details (
  id                   uuid primary key default gen_random_uuid(),
  agm_key              text not null unique default 'primary',
  edition              text not null default '',
  edition_nepali       text,
  edition_english      text,
  date_nepali          text not null default '',
  date_english         text not null default '',
  time                 text not null default '',
  time_nepali          text,
  time_english         text,
  venue                text not null default '',
  venue_nepali         text,
  venue_english        text,
  total_delegates      integer not null default 0,
  digital_pass_enabled boolean not null default true,
  updated_at           timestamptz not null default now()
);

create table if not exists public.loan_schemes (
  id                uuid primary key default gen_random_uuid(),
  scheme_key        text not null unique,
  name              text not null,
  name_nepali       text not null default '',
  interest_rate     numeric(5, 2) not null default 9.5,
  max_amount        numeric(14, 2) not null default 0,
  max_tenure_months integer not null default 12,
  subsidized_rate   numeric(5, 2),
  is_active         boolean not null default true,
  description       text not null default ''
);

create table if not exists public.gateway_rails (
  id                  uuid primary key default gen_random_uuid(),
  gateway_key         text not null unique,
  name                text not null,
  type                text not null check (type in ('WALLET', 'BANK', 'IPS', 'QR')),
  status              text not null default 'ACTIVE'
                      check (status in ('ACTIVE', 'MAINTENANCE', 'DISABLED')),
  daily_limit         numeric(14, 2) not null default 0,
  surcharge_percent   numeric(5, 2) not null default 0,
  reconciliation_cycle text not null default ''
);

create table if not exists public.field_officers (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  name_nepali   text,
  phone         text not null default '',
  email         text not null default '',
  role          text not null default '',
  role_nepali   text,
  assigned_wards text[] not null default '{}',
  active_unit   text not null default '',
  active_unit_nepali text,
  avatar_url    text not null default '/assets/kyc/avatar_officer.png',
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 5b. MOTHER GROUPS (parent SHG groups that collect & deposit monthly)
--     Group names are NOT unique globally — the same name may exist in
--     different places, so uniqueness is enforced on (name, location).
-- ---------------------------------------------------------------------------
create table if not exists public.mother_groups (
  id                 uuid primary key default gen_random_uuid(),
  name               text not null,
  name_nepali        text,
  location           text not null,
  location_nepali    text,
  contact_person     text not null default '',
  contact_phone      text not null default '',
  meeting_day        text not null default 'Monthly',
  monthly_target_amount numeric(14, 2) not null default 0,
  total_members      integer not null default 0,
  notes              text,
  created_at         timestamptz not null default now(),
  is_active          boolean not null default true
);

create unique index if not exists mother_groups_name_location_uq
  on public.mother_groups (name, location);
create index if not exists mother_groups_location_idx on public.mother_groups (location);

create table if not exists public.mother_group_members (
  id                 uuid primary key default gen_random_uuid(),
  mother_group_id    uuid not null references public.mother_groups (id) on delete cascade,
  member_id          uuid references public.members (id) on delete set null,
  member_name        text not null,
  member_no          text not null default '',
  joined_date        date not null default current_date,
  monthly_contribution numeric(14, 2) not null default 0,
  is_active          boolean not null default true,
  created_at         timestamptz not null default now()
);

create index if not exists mgm_group_idx on public.mother_group_members (mother_group_id);
create index if not exists mgm_member_idx on public.mother_group_members (member_id);

create table if not exists public.mother_group_meetings (
  id                 uuid primary key default gen_random_uuid(),
  mother_group_id    uuid not null references public.mother_groups (id) on delete cascade,
  meeting_date       date not null default current_date,
  scheduled_time     text,
  conducted_by       text not null default '',
  conducted_by_name  text,
  total_collected    numeric(14, 2) not null default 0,
  member_count       integer not null default 0,
  status             text not null default 'SCHEDULED'
                     check (status in ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
  notes              text,
  created_at         timestamptz not null default now()
);

create index if not exists mgmeeting_group_date_idx
  on public.mother_group_meetings (mother_group_id, meeting_date desc);

-- ---------------------------------------------------------------------------
-- 5c. TRADING TRANSACTIONS (investment / FX / commodity P&L ledger)
-- ---------------------------------------------------------------------------
create table if not exists public.trading_transactions (
  id                 uuid primary key default gen_random_uuid(),
  date               date not null default current_date,
  type               text not null
                     check (type in ('PURCHASE', 'SALE', 'FX_GAIN', 'FX_LOSS',
                                     'DIVIDEND_INCOME', 'INTEREST_INCOME',
                                     'CAPITAL_GAIN', 'CAPITAL_LOSS',
                                     'FEE_INCOME', 'EXPENSE')),
  description        text not null default '',
  category           text not null default 'INVESTMENT'
                     check (category in ('INVESTMENT', 'FOREIGN_EXCHANGE',
                                         'COMMODITY', 'SERVICE_FEE', 'OPERATING_EXPENSE')),
  buy_amount         numeric(14, 2),
  sell_amount        numeric(14, 2),
  quantity           numeric(14, 4),
  unit_price         numeric(14, 4),
  currency           text not null default 'NPR',
  exchange_rate      numeric(14, 6),
  amount_in_npr      numeric(14, 2) not null default 0,
  reference_no       text,
  recorded_by        text not null default '',
  recorded_by_name   text,
  status             text not null default 'COMPLETED'
                     check (status in ('PENDING', 'COMPLETED', 'VOID')),
  created_at         timestamptz not null default now()
);

create index if not exists trading_date_idx on public.trading_transactions (date desc);
create index if not exists trading_type_idx on public.trading_transactions (type);
create index if not exists trading_status_idx on public.trading_transactions (status);

create table if not exists public.mother_group_deposits (
  id                 uuid primary key default gen_random_uuid(),
  meeting_id         uuid not null references public.mother_group_meetings (id) on delete cascade,
  mother_group_id    uuid not null references public.mother_groups (id) on delete cascade,
  member_id          uuid references public.members (id) on delete set null,
  member_name        text not null,
  member_no          text not null default '',
  amount             numeric(14, 2) not null default 0,
  deposit_date       date not null default current_date,
  recorded_by        text not null default '',
  recorded_by_name   text,
  status             text not null default 'PENDING'
                     check (status in ('PENDING', 'COMPLETED', 'RECONCILED', 'VOID')),
  reference_no       text,
  notes              text,
  created_at         timestamptz not null default now()
);

create index if not exists mgdeposit_meeting_idx on public.mother_group_deposits (meeting_id);
create index if not exists mgdeposit_group_idx on public.mother_group_deposits (mother_group_id);
create index if not exists mgdeposit_status_idx on public.mother_group_deposits (status);

-- ---------------------------------------------------------------------------
-- 5d. BANK RECONCILIATION (statement upload + entry mismatch tracking)
-- ---------------------------------------------------------------------------
create table if not exists public.bank_statements (
  id                 uuid primary key default gen_random_uuid(),
  statement_date     date not null default current_date,
  description        text not null default '',
  amount             numeric(14, 2) not null default 0,
  reference_no       text,
  debit_or_credit    text not null default 'CREDIT'
                     check (debit_or_credit in ('DEBIT', 'CREDIT')),
  uploaded_by        text not null default '',
  uploaded_by_name   text,
  file_path          text,
  uploaded_at        timestamptz not null default now()
);

create index if not exists bankstmt_date_idx on public.bank_statements (statement_date desc);

create table if not exists public.reconciliation_entries (
  id                 uuid primary key default gen_random_uuid(),
  transaction_id     uuid references public.transactions (id) on delete set null,
  transaction_amount numeric(14, 2),
  transaction_date   date,
  transaction_ref    text,
  statement_entry_id uuid references public.bank_statements (id) on delete set null,
  statement_amount   numeric(14, 2),
  statement_date     date,
  statement_ref      text,
  amount             numeric(14, 2) not null default 0,
  date               date not null default current_date,
  description        text not null default '',
  reference_no       text,
  status             text not null default 'PENDING'
                     check (status in ('PENDING', 'MATCHED', 'MISMATCH', 'RESOLVED')),
  mismatch_type      text
                     check (mismatch_type is null or mismatch_type in
                            ('AMOUNT_MISMATCH', 'MISSING_ENTRY', 'DUPLICATE_ENTRY',
                             'WRONG_DATE', 'WRONG_REFERENCE')),
  mismatch_details   text,
  resolved_by        text,
  resolved_by_name   text,
  resolved_date      timestamptz,
  resolution_notes   text,
  flagged_at         timestamptz not null default now(),
  created_at         timestamptz not null default now()
);

create index if not exists reconciliation_status_idx on public.reconciliation_entries (status);
create index if not exists reconciliation_date_idx on public.reconciliation_entries (date desc);

-- ---------------------------------------------------------------------------
-- 5e. GENERATED REPORTS (dynamically computed audit / transparency registry)
-- ---------------------------------------------------------------------------
create table if not exists public.generated_reports (
  id                 text primary key,
  title              text not null,
  title_nepali       text not null default '',
  category           text not null default 'FINANCIAL'
                     check (category in ('FINANCIAL', 'REGULATORY', 'GOVERNANCE',
                                         'SUPERVISORY', 'OPERATIONAL')),
  fiscal_year        text not null default '',
  period             text not null default '',
  generated_at       timestamptz not null default now(),
  generated_by       text not null default '',
  generated_by_name  text,
  data               jsonb not null default '{}'::jsonb,
  download_url       text,
  status             text not null default 'READY'
                     check (status in ('READY', 'GENERATING', 'ERROR'))
);

create index if not exists generated_reports_category_idx on public.generated_reports (category);

-- ---------------------------------------------------------------------------
-- 6. ROW LEVEL SECURITY

-- 6a. Auth link column FIRST: the helper functions below reference
--     members.auth_user_id, and SQL function bodies are validated at creation
--     time - so on databases where the members table predates this schema,
--     (Idempotent: one auth user per member via the partial unique index.)
alter table public.members
  add column if not exists auth_user_id uuid references auth.users (id) on delete set null;
create unique index if not exists members_auth_user_id_uq
  on public.members (auth_user_id) where auth_user_id is not null;
create index if not exists members_auth_user_id_idx on public.members (auth_user_id);

alter table public.employees
  add column if not exists auth_user_id uuid references auth.users (id) on delete set null;
create unique index if not exists employees_auth_user_id_uq
  on public.employees (auth_user_id) where auth_user_id is not null;
create index if not exists employees_auth_user_id_idx on public.employees (auth_user_id);

-- Explicit invite/allowlist gate for staff accounts (SECURITY FIX 1/2).
-- Defaults to true so a fresh install can still bootstrap its first
-- SUPER_ADMIN through a verified email signup (otherwise nobody could ever
-- reach a staff-only policy to approve anyone). Operators who want strict
-- invite-only staff onboarding should run:
--     update public.employees set auth_link_allowed = false;   -- lock down
-- and then link each officer through public.admin_link_employee_auth(...)
-- or by setting the column back to true for that one row.
alter table public.employees
  add column if not exists auth_link_allowed boolean not null default true;

-- SECURITY FIX 2: an employee email must be unique (case-insensitively).
-- Without this, two employee rows can share an email and the auth-link trigger
-- becomes ambiguous; a duplicate-email signup could also make the trigger's
-- UPDATE hit the employees_auth_user_id_uq index and abort the auth.users
-- INSERT (a denial-of-service on staff signup). The trigger now updates at most
-- one deterministic row, and this index removes the duplicate source entirely.
--
-- MIGRATION: on an existing database that already contains duplicate employee
-- emails this statement fails with 23505. The block below prints the offending
-- addresses first so the operator can merge them and re-run. Find/fix with:
--     select lower(email), count(*) from public.employees
--      group by 1 having count(*) > 1;
do $$
declare
  dup_list text;
begin
  select string_agg(format('%s (%s rows)', email, cnt), ', ')
    into dup_list
  from (
    select lower(email) as email, count(*) as cnt
    from public.employees
    group by lower(email)
    having count(*) > 1
  ) d;
  if dup_list is not null then
    raise warning 'employees: duplicate emails must be merged before employees_email_lower_uq can be created: %', dup_list;
  end if;
end $$;

create unique index if not exists employees_email_lower_uq
  on public.employees (lower(email));

-- ---------------------------------------------------------------------------
-- RLS HELPER FUNCTIONS
--    • anon (public website)  → read-only access to directories & rate cards
--    • authenticated (staff)  → read/write on operational tables ONLY IF active employee
--    • authenticated (member) → read/write strictly scoped to own member rows
-- ---------------------------------------------------------------------------
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  -- Staff = signed in via Supabase Auth AND strictly linked to an ACTIVE employee row.
  -- Eliminates the S1 vulnerability where arbitrary authenticated users gained staff access.
  select coalesce(auth.role(), 'anon') = 'authenticated'
     and exists (
       select 1 from public.employees e
       where e.auth_user_id = auth.uid()
         and e.status = 'ACTIVE'
     );
$$;

-- Returns the access_role (SUPER_ADMIN, BRANCH_MANAGER, TELLER, etc.) of current staff.
create or replace function public.current_staff_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select e.access_role from public.employees e
  where e.auth_user_id = auth.uid() and e.status = 'ACTIVE';
$$;

-- members.id of the signed-in portal member (null for staff / guests).
create or replace function public.current_member_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select m.id from public.members m where m.auth_user_id = auth.uid();
$$;

-- Role helpers (SECURITY FIX 6). Mirror the intent of src/utils/permissions.ts:
-- staff policies must key on the acting employee's access_role, not merely on
-- "is an authenticated employee". Otherwise any TELLER/FIELD_OFFICER can write
-- employees, share_pool, coop_settings and loan ledgers.
create or replace function public.staff_role_in(p_roles text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.employees e
    where e.auth_user_id = auth.uid()
      and e.status = 'ACTIVE'
      and e.access_role = any(p_roles)
  );
$$;

-- Supervisory write gate for CMS / cooperative configuration. Note this is
-- deliberately slightly broader than permissions.ts (where manage_settings is
-- SUPER_ADMIN-only) so branch managers can keep operating the branch CMS;
-- tighten to public.staff_has_permission('manage_settings') for strict parity.
create or replace function public.staff_can_manage_config()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.staff_role_in(array['SUPER_ADMIN', 'BRANCH_MANAGER']);
$$;

-- Permission check kept in sync (by hand) with ROLE_PERMISSIONS in
-- src/utils/permissions.ts. Update BOTH when a role's grants change.
create or replace function public.staff_has_permission(p_permission text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.employees e
    where e.auth_user_id = auth.uid()
      and e.status = 'ACTIVE'
      and p_permission = any((
        case e.access_role
          when 'SUPER_ADMIN' then array[
            'manage_employees', 'manage_members', 'manage_loans', 'manage_savings',
            'process_transactions', 'view_reports', 'manage_mother_groups',
            'record_mother_group_meetings', 'record_deposits', 'record_trading',
            'reconcile_entries', 'manage_settings', 'export_data', 'view_audit_logs'
          ]
          when 'BRANCH_MANAGER' then array[
            'manage_members', 'manage_loans', 'manage_savings', 'process_transactions',
            'view_reports', 'manage_mother_groups', 'record_mother_group_meetings',
            'record_deposits', 'record_trading', 'reconcile_entries', 'export_data',
            'view_audit_logs'
          ]
          when 'ACCOUNTANT' then array[
            'manage_savings', 'view_reports', 'record_trading', 'reconcile_entries',
            'export_data', 'view_audit_logs'
          ]
          when 'TELLER' then array[
            'process_transactions', 'record_mother_group_meetings', 'record_deposits',
            'view_reports'
          ]
          when 'LOAN_OFFICER' then array[
            'manage_loans', 'process_transactions', 'view_reports'
          ]
          when 'FIELD_OFFICER' then array[
            'record_mother_group_meetings', 'view_reports'
          ]
          else array[]::text[]
        end
      )));
$$;

-- SECURITY FIX 1: link an auth user to a staff/member row ONLY from a verified
-- account, and never let a linking failure abort the auth.users INSERT.
--
-- Threat closed: the previous trigger linked rows purely on an email string
-- match for ANY auth.users INSERT. An attacker could self-register using a
-- known employee or member email and immediately inherit staff policies
-- (is_staff() looked only at employees.auth_user_id) or that member's portal
-- data before the real owner ever confirmed the address. Requiring
-- email_confirmed_at means the registrant must actually control the mailbox.
-- Employees are additionally gated on employees.auth_link_allowed so a
-- cooperative can run invite-only staff onboarding.
--
-- MIGRATION IMPLICATION: links created before this change from unverified
-- accounts are NOT touched (no data is rewritten). Review them with
--     select employee_no, email, auth_user_id from public.employees
--      where auth_user_id is not null;
-- and, if any are suspect, re-link them with public.admin_link_employee_auth()
-- or by updating auth_user_id as service_role. Members whose auth users were
-- never email-confirmed likewise keep their old link until an admin re-links
-- or the member confirms; see the note on trg_auth_user_link_confirm.
create or replace function public.link_auth_user_account(
  p_auth_user_id uuid,
  p_email text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- 1. Staff link: verified email + allowlisted employee + deterministic single row.
  update public.employees e
     set auth_user_id = p_auth_user_id
   where e.auth_link_allowed
     and e.id = (
       select e2.id from public.employees e2
       where e2.auth_user_id is null
         and e2.auth_link_allowed
         and lower(e2.email) = lower(coalesce(p_email, ''))
       order by e2.created_at, e2.id
       limit 1
     )
     and not exists (
       select 1 from public.employees x where x.auth_user_id = p_auth_user_id
     );

  -- 2. Member link: verified email + deterministic single row.
  update public.members m
     set auth_user_id = p_auth_user_id
   where m.id = (
       select m2.id from public.members m2
       where m2.auth_user_id is null
         and lower(m2.email) = lower(coalesce(p_email, ''))
       order by m2.created_at, m2.id
       limit 1
     )
     and not exists (
       select 1 from public.members x where x.auth_user_id = p_auth_user_id
     );
exception
  -- A malformed/duplicate link must never roll back the caller's auth.users
  -- INSERT (DoS). Report and move on; an admin can link manually.
  when others then
    raise warning 'link_auth_user_account: skipped link for auth user % (%): %',
      p_auth_user_id, p_email, sqlerrm;
end;
$$;

create or replace function public.handle_auth_user_link()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Only verified accounts may claim a staff/member identity.
  if new.email_confirmed_at is not null then
    perform public.link_auth_user_account(new.id, new.email);
  end if;
  return new;
end;
$$;

-- Confirmation may happen after INSERT when Supabase "Confirm email" is on, so
-- link on the null -> not-null transition as well.
create or replace function public.handle_auth_user_confirm()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.link_auth_user_account(new.id, new.email);
  return new;
end;
$$;

drop trigger if exists trg_auth_user_member_link on auth.users;
drop trigger if exists trg_auth_user_link on auth.users;
create trigger trg_auth_user_link
  after insert on auth.users
  for each row execute function public.handle_auth_user_link();

drop trigger if exists trg_auth_user_link_confirm on auth.users;
create trigger trg_auth_user_link_confirm
  after update of email_confirmed_at on auth.users
  for each row
  when (old.email_confirmed_at is null and new.email_confirmed_at is not null)
  execute function public.handle_auth_user_confirm();

-- Staff-only recovery path for MIGRATION: re-link (or unlink) an employee auth
-- account after verifying identity out-of-band. SUPER_ADMIN only.
create or replace function public.admin_link_employee_auth(
  p_employee_no text,
  p_auth_user_id uuid default null
)
returns public.employees
language plpgsql
security definer
set search_path = public
as $$
declare
  v_emp public.employees;
begin
  if not public.staff_has_permission('manage_employees') then
    raise exception 'admin_link_employee_auth: SUPER_ADMIN only' using errcode = '42501';
  end if;

  update public.employees
     set auth_user_id = p_auth_user_id,
         auth_link_allowed = true,
         updated_at = now()
   where employee_no = p_employee_no
  returning * into v_emp;

  if not found then
    raise exception 'admin_link_employee_auth: employee % not found', p_employee_no
      using errcode = 'P0002';
  end if;

  return v_emp;
end;
$$;

-- SECURITY FIX 5: complete column guard.
-- A signed-in member may change only the contact fields on their own row.
-- Everything else - identity, KYC, payout/bank details, balances, credit score,
-- status, notes, timestamps and auth linkage - is reset to its previous value.
-- A jsonb diff safety net freezes any column added by a future migration until
-- it is explicitly allowlisted here.
--
-- COMPANION STAFF PATH (so the member portal is not read-only): legitimate
-- changes to frozen fields (name, email, avatar, bank details, KYC, status, ...)
-- are performed by staff through the admin portal, where members_self_update
-- permits public.is_staff() and this trigger returns early. Members retain
-- self-service updates to phone and address.
create or replace function public.members_guard_self_writes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_staff() then
    return new;
  end if;

  -- Ownership is decided from the EXISTING row, never from the client-supplied
  -- new value: otherwise a member could send auth_user_id = null (or another id)
  -- to skip the freeze below. RLS has already restricted this UPDATE to the row
  -- owner (or staff, returned above).
  if old.auth_user_id is null or old.auth_user_id is distinct from auth.uid() then
    return new;
  end if;

  -- Frozen: identity & governance.
  new.id              := old.id;
  new.member_no       := old.member_no;
  new.name            := old.name;
  new.name_nepali     := old.name_nepali;
  new.email           := old.email;
  new.citizenship_no  := old.citizenship_no;
  new.pan_no          := old.pan_no;
  new.joined_date     := old.joined_date;
  new.status          := old.status;
  new.avatar_url      := old.avatar_url;
  new.notes           := old.notes;
  new.created_at      := old.created_at;
  new.auth_user_id    := old.auth_user_id;

  -- Frozen: financial & KYC.
  new.share_capital       := old.share_capital;
  new.total_savings       := old.total_savings;
  new.active_loan_balance := old.active_loan_balance;
  new.accrued_dividend    := old.accrued_dividend;
  new.credit_score        := old.credit_score;
  new.bank_details        := old.bank_details;
  new.kyc_documents       := old.kyc_documents;

  -- Intentionally NOT reset (explicitly-allowed contact set): phone, address.
  -- updated_at is owned by trg_members_updated_at, which runs after this trigger.

  -- Safety net: reject a change to any column that is neither frozen above nor
  -- on the allowlist - catches columns added by future migrations.
  if (to_jsonb(new) - array['phone', 'address', 'updated_at'])
     is distinct from (to_jsonb(old) - array['phone', 'address', 'updated_at']) then
    raise exception 'members: only phone and address may be changed by a member; use the staff approval workflow for other profile changes'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_members_guard_self_writes on public.members;
create trigger trg_members_guard_self_writes
  before update on public.members
  for each row execute function public.members_guard_self_writes();

-- SECURITY FIX 4: members may submit loan applications for their own profile
-- only, and only into the SUBMITTED state. Staff (manage_loans) bypass this and
-- keep full workflow control. This backstops the RLS insert check below.
create or replace function public.loan_applications_guard_member_submit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_member public.members%rowtype;
begin
  if public.is_staff() then
    return new;
  end if;

  if new.member_id is distinct from public.current_member_id() then
    raise exception 'loan_applications: members may only submit applications for their own member profile'
      using errcode = '42501';
  end if;

  select * into v_member from public.members m where m.id = new.member_id;
  if not found then
    raise exception 'loan_applications: unknown member profile' using errcode = '42501';
  end if;

  -- Server-authoritative fields: the applicant may not self-approve, inject
  -- committee notes, backdate the application, or claim another member identity.
  new.status          := 'SUBMITTED';
  new.committee_notes := null;
  new.member_name     := v_member.name;
  new.member_no       := v_member.member_no;
  new.applied_date    := current_date;
  return new;
end;
$$;

drop trigger if exists trg_loan_applications_guard_member_submit on public.loan_applications;
create trigger trg_loan_applications_guard_member_submit
  before insert or update on public.loan_applications
  for each row execute function public.loan_applications_guard_member_submit();

-- ===========================================================================
-- 6b. PUBLIC MEMBERSHIP APPLICATION RPC  (SECURITY FIX 3)
-- ---------------------------------------------------------------------------
-- The direct anon INSERT policy on public.members used to accept ANY column
-- value as long as status = 'PENDING'. An anonymous visitor could therefore
-- forge share_capital / total_savings / credit_score / kyc_documents /
-- bank_details / member_no and even impersonate another person's identity
-- fields. That policy is gone; this SECURITY DEFINER function is the ONLY
-- anon-reachable write path into public.members.
--
-- It whitelists the applicant-supplied columns and server-generates every
-- sensitive field: member_no, status, auth_user_id and all financial/KYC data.
--
-- NOTE: the previous anon INSERT accepted a full row payload. Any public
-- onboarding form must now call:
--     select public.submit_member_application(
--              p_name, p_email, p_phone, p_citizenship_no,
--              p_name_nepali, p_pan_no, p_address);
-- ===========================================================================
create sequence if not exists public.member_application_no_seq start with 900001;

create or replace function public.submit_member_application(
  p_name           text,
  p_email          text,
  p_phone          text,
  p_citizenship_no text,
  p_name_nepali    text default null,
  p_pan_no         text default null,
  p_address        text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_member_no text;
  v_id        uuid;
begin
  if p_name is null or length(btrim(p_name)) < 2 then
    raise exception 'submit_member_application: name is required' using errcode = '22023';
  end if;
  if p_email is null or p_email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$' then
    raise exception 'submit_member_application: a valid email is required' using errcode = '22023';
  end if;
  if p_phone is null or length(btrim(p_phone)) < 7 then
    raise exception 'submit_member_application: a valid phone is required' using errcode = '22023';
  end if;
  if p_citizenship_no is null or length(btrim(p_citizenship_no)) < 4 then
    raise exception 'submit_member_application: citizenship_no is required' using errcode = '22023';
  end if;

  -- Server-generated, collision-free member number (sequence-backed).
  v_member_no := 'UK-' || lpad(nextval('public.member_application_no_seq')::text, 6, '0');

  insert into public.members (
    member_no, name, name_nepali, email, phone, citizenship_no, pan_no,
    address, status, avatar_url,
    share_capital, total_savings, active_loan_balance, accrued_dividend,
    credit_score, bank_details, kyc_documents, auth_user_id
  ) values (
    v_member_no,
    btrim(p_name),
    nullif(btrim(coalesce(p_name_nepali, '')), ''),
    lower(btrim(p_email)),
    btrim(p_phone),
    btrim(p_citizenship_no),
    nullif(btrim(coalesce(p_pan_no, '')), ''),
    coalesce(nullif(btrim(coalesce(p_address, '')), ''), 'Gadhwa-5, Dang'),
    'PENDING',
    '/assets/kyc/avatar_hari.png',
    0, 0, 0, 0,
    700,
    '{}'::jsonb,
    '{}'::jsonb,
    null
  )
  returning id into v_id;

  return jsonb_build_object(
    'id', v_id,
    'member_no', v_member_no,
    'status', 'PENDING'
  );
end;
$$;

revoke all on function public.submit_member_application(text, text, text, text, text, text, text) from public;
grant execute on function public.submit_member_application(text, text, text, text, text, text, text) to anon, authenticated;

do $$
declare
  t    text;
  perm text;
  staff_only     text[] := array['employees'];
  -- Member-readable ledgers whose writes are staff-only (SECURITY FIX 4).
  member_owned   text[] := array['savings_accounts', 'loans', 'transactions'];
  -- The single member self-INSERT surface.
  member_apps    text[] := array['loan_applications'];
  member_notif   text[] := array['notifications'];
  staff_data     text[] := array[
    'trading_transactions', 'bank_statements', 'reconciliation_entries',
    'mother_group_deposits', 'inquiries'
  ];
  member_visible text[] := array[
    'mother_groups', 'mother_group_members', 'mother_group_meetings'
  ];
  -- Public read-only directories / rate cards / CMS.
  -- SECURITY FIX 8: generated_reports has been REMOVED from this list.
  public_read    text[] := array[
    'notices', 'coop_settings', 'share_pool', 'agm_details', 'loan_schemes',
    'gateway_rails', 'field_officers'
  ];
  internal_read  text[] := array['generated_reports'];
begin
  -- ------------------------------------------------------------------
  -- members: owner read/update (column guard trigger), staff full control.
  -- SECURITY FIX 3: the anonymous members_public_apply INSERT policy is
  -- REMOVED - anon writes go exclusively through
  -- public.submit_member_application() created above.
  -- ------------------------------------------------------------------
  execute 'alter table public.members enable row level security';

  execute 'drop policy if exists members_public_read on public.members';
  execute 'drop policy if exists members_self_read on public.members';
  execute 'create policy members_self_read on public.members for select '
    || 'to authenticated using (auth_user_id = auth.uid() or public.is_staff())';

  execute 'drop policy if exists members_self_update on public.members';
  execute 'create policy members_self_update on public.members for update '
    || 'to authenticated '
    || 'using (auth_user_id = auth.uid() or public.is_staff()) '
    || 'with check (auth_user_id = auth.uid() or public.is_staff())';

  execute 'drop policy if exists members_staff_insert on public.members';
  execute 'create policy members_staff_insert on public.members for insert '
    || 'to authenticated with check (public.is_staff())';

  execute 'drop policy if exists members_public_apply on public.members';

  execute 'drop policy if exists members_staff_delete on public.members';
  execute 'create policy members_staff_delete on public.members for delete '
    || 'to authenticated using (public.is_staff())';

  -- ------------------------------------------------------------------
  -- SECURITY FIX 6a: employees (HR registry). All staff may READ; only
  -- SUPER_ADMIN (manage_employees, mirrored from permissions.ts) may INSERT,
  -- UPDATE or DELETE. Previously `for all ... is_staff()` let any TELLER or
  -- FIELD_OFFICER edit the HR registry and their own access_role.
  -- ------------------------------------------------------------------
  foreach t in array staff_only loop
    execute format('alter table public.%I enable row level security', t);

    execute format('drop policy if exists %I on public.%I', t || '_staff_all', t);
    execute format('drop policy if exists %I on public.%I', t || '_staff_read', t);
    execute format(
      'create policy %I on public.%I for select to authenticated using (public.is_staff())',
      t || '_staff_read', t
    );

    execute format('drop policy if exists %I on public.%I', t || '_staff_insert', t);
    execute format(
      'create policy %I on public.%I for insert to authenticated with check (public.staff_has_permission(''manage_employees''))',
      t || '_staff_insert', t
    );

    execute format('drop policy if exists %I on public.%I', t || '_staff_update', t);
    execute format(
      'create policy %I on public.%I for update to authenticated using (public.staff_has_permission(''manage_employees'')) with check (public.staff_has_permission(''manage_employees''))',
      t || '_staff_update', t
    );

    execute format('drop policy if exists %I on public.%I', t || '_staff_delete', t);
    execute format(
      'create policy %I on public.%I for delete to authenticated using (public.staff_has_permission(''manage_employees''))',
      t || '_staff_delete', t
    );
  end loop;

  -- ------------------------------------------------------------------
  -- SECURITY FIX 4: savings_accounts / loans / transactions.
  -- Members may READ their own rows but may NOT insert or update them (the
  -- legacy _member_insert policy is dropped). Writes require the matching
  -- staff permission (SECURITY FIX 6b uses the same role map as
  -- src/utils/permissions.ts).
  -- ------------------------------------------------------------------
  foreach t in array member_owned loop
    execute format('alter table public.%I enable row level security', t);

    perm := case t
              when 'savings_accounts' then 'manage_savings'
              when 'loans'            then 'manage_loans'
              else                         'process_transactions'
            end;

    execute format('drop policy if exists %I on public.%I', t || '_public_read', t);
    execute format('drop policy if exists %I on public.%I', t || '_member_read', t);
    execute format(
      'create policy %I on public.%I for select to authenticated '
      || 'using (member_id = public.current_member_id() or public.is_staff())',
      t || '_member_read', t
    );

    execute format('drop policy if exists %I on public.%I', t || '_member_insert', t);
    execute format('drop policy if exists %I on public.%I', t || '_staff_insert', t);
    execute format(
      'create policy %I on public.%I for insert to authenticated with check (public.staff_has_permission(%L))',
      t || '_staff_insert', t, perm
    );

    execute format('drop policy if exists %I on public.%I', t || '_staff_update', t);
    execute format(
      'create policy %I on public.%I for update to authenticated using (public.staff_has_permission(%L)) with check (public.staff_has_permission(%L))',
      t || '_staff_update', t, perm, perm
    );

    execute format('drop policy if exists %I on public.%I', t || '_staff_delete', t);
    execute format(
      'create policy %I on public.%I for delete to authenticated using (public.staff_has_permission(%L))',
      t || '_staff_delete', t, perm
    );
  end loop;

  -- ------------------------------------------------------------------
  -- SECURITY FIX 4b: loan_applications - the ONLY member self-INSERT surface.
  -- Members read their own applications and may submit for their own
  -- member_id; trg_loan_applications_guard_member_submit forces
  -- status='SUBMITTED' and freezes staff-only fields. Staff writes need
  -- manage_loans.
  -- ------------------------------------------------------------------
  foreach t in array member_apps loop
    execute format('alter table public.%I enable row level security', t);

    execute format('drop policy if exists %I on public.%I', t || '_public_read', t);
    execute format('drop policy if exists %I on public.%I', t || '_member_read', t);
    execute format(
      'create policy %I on public.%I for select to authenticated '
      || 'using (member_id = public.current_member_id() or public.is_staff())',
      t || '_member_read', t
    );

    execute format('drop policy if exists %I on public.%I', t || '_staff_insert', t);
    execute format('drop policy if exists %I on public.%I', t || '_member_insert', t);
    execute format(
      'create policy %I on public.%I for insert to authenticated '
      || 'with check (member_id = public.current_member_id() or public.staff_has_permission(''manage_loans''))',
      t || '_member_insert', t
    );

    execute format('drop policy if exists %I on public.%I', t || '_staff_update', t);
    execute format(
      'create policy %I on public.%I for update to authenticated '
      || 'using (public.staff_has_permission(''manage_loans'')) '
      || 'with check (public.staff_has_permission(''manage_loans''))',
      t || '_staff_update', t
    );

    execute format('drop policy if exists %I on public.%I', t || '_staff_delete', t);
    execute format(
      'create policy %I on public.%I for delete to authenticated using (public.staff_has_permission(''manage_loans''))',
      t || '_staff_delete', t
    );
  end loop;

  -- ------------------------------------------------------------------
  -- notifications: members read their own and may mark them read; creation
  -- and deletion stay staff-side so members cannot forge SYSTEM/FINANCE/ALERT
  -- messages for themselves.
  -- ------------------------------------------------------------------
  foreach t in array member_notif loop
    execute format('alter table public.%I enable row level security', t);

    execute format('drop policy if exists %I on public.%I', t || '_public_read', t);
    execute format('drop policy if exists %I on public.%I', t || '_member_read', t);
    execute format(
      'create policy %I on public.%I for select to authenticated '
      || 'using (member_id = public.current_member_id() or public.is_staff())',
      t || '_member_read', t
    );

    execute format('drop policy if exists %I on public.%I', t || '_member_insert', t);
    execute format('drop policy if exists %I on public.%I', t || '_staff_insert', t);
    execute format(
      'create policy %I on public.%I for insert to authenticated with check (public.is_staff())',
      t || '_staff_insert', t
    );

    execute format('drop policy if exists %I on public.%I', t || '_member_update', t);
    execute format(
      'create policy %I on public.%I for update to authenticated '
      || 'using (member_id = public.current_member_id()) '
      || 'with check (member_id = public.current_member_id())',
      t || '_member_update', t
    );

    execute format('drop policy if exists %I on public.%I', t || '_staff_update', t);
    execute format(
      'create policy %I on public.%I for update to authenticated using (public.is_staff()) with check (public.is_staff())',
      t || '_staff_update', t
    );

    execute format('drop policy if exists %I on public.%I', t || '_staff_delete', t);
    execute format(
      'create policy %I on public.%I for delete to authenticated using (public.is_staff())',
      t || '_staff_delete', t
    );
  end loop;

  -- ------------------------------------------------------------------
  -- SECURITY FIX 6c: operational / financial registries. All staff may read;
  -- writes are keyed to the acting role's permission. (inquiries is the
  -- public contact queue - any staff member may triage it.)
  -- ------------------------------------------------------------------
  foreach t in array staff_data loop
    execute format('alter table public.%I enable row level security', t);

    perm := case t
              when 'trading_transactions'   then 'record_trading'
              when 'bank_statements'        then 'reconcile_entries'
              when 'reconciliation_entries' then 'reconcile_entries'
              when 'mother_group_deposits'  then 'record_deposits'
              else null
            end;

    execute format('drop policy if exists %I on public.%I', t || '_public_read', t);
    execute format('drop policy if exists %I on public.%I', t || '_staff_read', t);
    execute format(
      'create policy %I on public.%I for select to authenticated using (public.is_staff())',
      t || '_staff_read', t
    );

    execute format('drop policy if exists %I on public.%I', t || '_staff_insert', t);
    execute format('drop policy if exists %I on public.%I', t || '_staff_update', t);
    execute format('drop policy if exists %I on public.%I', t || '_staff_delete', t);

    if perm is null then
      execute format(
        'create policy %I on public.%I for insert to authenticated with check (public.is_staff())',
        t || '_staff_insert', t
      );
      execute format(
        'create policy %I on public.%I for update to authenticated using (public.is_staff()) with check (public.is_staff())',
        t || '_staff_update', t
      );
      execute format(
        'create policy %I on public.%I for delete to authenticated using (public.is_staff())',
        t || '_staff_delete', t
      );
    else
      execute format(
        'create policy %I on public.%I for insert to authenticated with check (public.staff_has_permission(%L))',
        t || '_staff_insert', t, perm
      );
      execute format(
        'create policy %I on public.%I for update to authenticated using (public.staff_has_permission(%L)) with check (public.staff_has_permission(%L))',
        t || '_staff_update', t, perm, perm
      );
      execute format(
        'create policy %I on public.%I for delete to authenticated using (public.staff_has_permission(%L))',
        t || '_staff_delete', t, perm
      );
    end if;
  end loop;

  -- ------------------------------------------------------------------
  -- SECURITY FIX 7: SHG / mother-group directories. Previously
  -- `using (true)` exposed every member name and contribution to ANY
  -- authenticated account, including self-signed-up non-members. Now only
  -- staff or a linked portal member may read. (SECURITY FIX 6d gates writes.)
  -- ------------------------------------------------------------------
  foreach t in array member_visible loop
    execute format('alter table public.%I enable row level security', t);

    perm := case t
              when 'mother_group_meetings' then 'record_mother_group_meetings'
              else                              'manage_mother_groups'
            end;

    execute format('drop policy if exists %I on public.%I', t || '_public_read', t);
    execute format('drop policy if exists %I on public.%I', t || '_auth_read', t);
    execute format(
      'create policy %I on public.%I for select to authenticated '
      || 'using (public.is_staff() or public.current_member_id() is not null)',
      t || '_auth_read', t
    );

    execute format('drop policy if exists %I on public.%I', t || '_staff_insert', t);
    execute format(
      'create policy %I on public.%I for insert to authenticated with check (public.staff_has_permission(%L))',
      t || '_staff_insert', t, perm
    );

    execute format('drop policy if exists %I on public.%I', t || '_staff_update', t);
    execute format(
      'create policy %I on public.%I for update to authenticated using (public.staff_has_permission(%L)) with check (public.staff_has_permission(%L))',
      t || '_staff_update', t, perm, perm
    );

    execute format('drop policy if exists %I on public.%I', t || '_staff_delete', t);
    execute format(
      'create policy %I on public.%I for delete to authenticated using (public.staff_has_permission(%L))',
      t || '_staff_delete', t, perm
    );
  end loop;

  -- ------------------------------------------------------------------
  -- SECURITY FIX 6e: public website directory / rate cards / CMS. anon may
  -- READ (transparency pages); writes are limited to supervisory roles
  -- (SUPER_ADMIN + BRANCH_MANAGER) instead of any staff member.
  -- SECURITY FIX 8: generated_reports is NOT in this list any more - report
  -- payloads are internal and handled by the staff-only block below.
  -- ------------------------------------------------------------------
  foreach t in array public_read loop
    execute format('alter table public.%I enable row level security', t);

    execute format('drop policy if exists %I on public.%I', t || '_public_read', t);
    execute format(
      'create policy %I on public.%I for select to anon, authenticated using (true)',
      t || '_public_read', t
    );

    execute format('drop policy if exists %I on public.%I', t || '_staff_insert', t);
    execute format(
      'create policy %I on public.%I for insert to authenticated with check (public.staff_can_manage_config())',
      t || '_staff_insert', t
    );

    execute format('drop policy if exists %I on public.%I', t || '_staff_update', t);
    execute format(
      'create policy %I on public.%I for update to authenticated using (public.staff_can_manage_config()) with check (public.staff_can_manage_config())',
      t || '_staff_update', t
    );

    execute format('drop policy if exists %I on public.%I', t || '_staff_delete', t);
    execute format(
      'create policy %I on public.%I for delete to authenticated using (public.staff_can_manage_config())',
      t || '_staff_delete', t
    );
  end loop;

  -- ------------------------------------------------------------------
  -- SECURITY FIX 8: generated_reports is internal. No anon read; only active
  -- staff may SELECT, and report generation/writes require view_reports.
  -- The legacy generated_reports_public_read policy (created by earlier
  -- versions of this schema) is dropped explicitly so re-running is clean.
  -- ------------------------------------------------------------------
  foreach t in array internal_read loop
    execute format('alter table public.%I enable row level security', t);

    execute format('drop policy if exists %I on public.%I', t || '_public_read', t);
    execute format('drop policy if exists %I on public.%I', t || '_staff_read', t);
    execute format(
      'create policy %I on public.%I for select to authenticated using (public.is_staff())',
      t || '_staff_read', t
    );

    execute format('drop policy if exists %I on public.%I', t || '_staff_insert', t);
    execute format(
      'create policy %I on public.%I for insert to authenticated with check (public.staff_has_permission(''view_reports''))',
      t || '_staff_insert', t
    );

    execute format('drop policy if exists %I on public.%I', t || '_staff_update', t);
    execute format(
      'create policy %I on public.%I for update to authenticated using (public.staff_has_permission(''view_reports'')) with check (public.staff_has_permission(''view_reports''))',
      t || '_staff_update', t
    );

    execute format('drop policy if exists %I on public.%I', t || '_staff_delete', t);
    execute format(
      'create policy %I on public.%I for delete to authenticated using (public.staff_has_permission(''view_reports''))',
      t || '_staff_delete', t
    );
  end loop;
end $$;

grant usage on schema public to anon, authenticated;
grant select on all tables in schema public to anon;
grant select, insert, update, delete on all tables in schema public to authenticated;
-- NOTE: the blanket GRANT above is deliberately narrowed again at the very end
-- of this file for the ledger-owned money tables (transactions / savings_accounts).
-- Those REVOKEs are the LAST privilege statements so that re-running
-- schema.sql can never silently re-grant direct writes.
-- SECURITY FIX 3: anon may no longer write public.members directly (the RLS
-- INSERT policy was removed above). Membership applications go through the
-- SECURITY DEFINER RPC instead.
-- NOTE (pre-existing, deliberately unchanged): anon holds INSERT on
-- public.inquiries but inquiries has no anon policy, so that insert is blocked
-- by RLS both before and after this change. Widening the public contact form is
-- a product decision, not part of this hardening task.
revoke insert on public.members from anon;
grant insert on public.inquiries to anon;
grant execute on function public.submit_member_application(text, text, text, text, text, text, text) to anon, authenticated;
grant execute on function public.admin_link_employee_auth(text, uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- MONEY-TABLE PRIVILEGE LOCKDOWN
-- Coordinated with supabase/migrations/0001_ledger.sql, which owns transactional
-- posting (post_deposit / post_withdrawal / post_dividend_payout /
-- post_loan_disbursement). Those SECURITY DEFINER functions are the only writers
-- of these two tables; direct INSERT/UPDATE by `authenticated` is removed here
-- AND in that migration, so the final state is identical whichever file runs last.
-- The role-aware RLS policies created earlier remain as defense-in-depth.
--
-- Effective privileges for `authenticated` once this file and 0001_ledger.sql
-- are both applied:
--   public.transactions     : SELECT, DELETE   (NO INSERT, NO UPDATE)
--   public.savings_accounts : SELECT, DELETE   (NO INSERT, NO UPDATE)
-- `anon` keeps SELECT only, and RLS still returns zero rows to it.
--
-- MIGRATION IMPLICATION: src/services/transactionService.ts and
-- src/services/savingsService.ts currently INSERT/UPDATE these tables directly
-- and will now fail with "permission denied for table ...". They must be wired
-- to the post_* RPCs (this is the explicit intent of migration 0001); no store
-- path in src/ writes these two tables today at runtime in this snapshot.
-- ---------------------------------------------------------------------------
revoke insert, update on table public.transactions from authenticated;
revoke insert, update on table public.savings_accounts from authenticated;
