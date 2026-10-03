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
               check (type in ('DEPOSIT', 'WITHDRAWAL', 'LOAN_EMI', 'DIVIDEND', 'SHARE_PURCHASE')),
  description  text not null default '',
  amount       numeric(14, 2) not null default 0,
  reference_no text not null default '',
  status       text not null default 'COMPLETED'
               check (status in ('COMPLETED', 'PENDING', 'FAILED')),
  created_at   timestamptz not null default now()
);

create index if not exists transactions_date_idx on public.transactions (date desc);

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

-- Auto-link: when an auth user is created, link to employees if staff email matches,
-- or members if member email matches.
create or replace function public.handle_auth_user_link()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- 1. Check and link to employees
  update public.employees
     set auth_user_id = new.id
   where auth_user_id is null
     and lower(email) = lower(coalesce(new.email, ''));

  -- 2. Check and link to members
  update public.members
     set auth_user_id = new.id
   where auth_user_id is null
     and lower(email) = lower(coalesce(new.email, ''));

  return new;
end;
$$;

drop trigger if exists trg_auth_user_member_link on auth.users;
drop trigger if exists trg_auth_user_link on auth.users;
create trigger trg_auth_user_link
  after insert on auth.users
  for each row execute function public.handle_auth_user_link();

-- Column guard: a signed-in member may edit only the contact fields of their
-- own row; financial / governance columns are frozen unless staff writes.
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
  if new.auth_user_id is not null and new.auth_user_id = auth.uid() then
    new.member_no           := old.member_no;
    new.citizenship_no      := old.citizenship_no;
    new.joined_date         := old.joined_date;
    new.status              := old.status;
    new.share_capital       := old.share_capital;
    new.total_savings       := old.total_savings;
    new.active_loan_balance := old.active_loan_balance;
    new.accrued_dividend    := old.accrued_dividend;
    new.credit_score        := old.credit_score;
    new.kyc_documents       := old.kyc_documents;
    new.auth_user_id        := old.auth_user_id;
    return new;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_members_guard_self_writes on public.members;
create trigger trg_members_guard_self_writes
  before update on public.members
  for each row execute function public.members_guard_self_writes();

do $$
declare
  t text;
  staff_only     text[] := array['employees'];
  member_scoped  text[] := array[
    'savings_accounts', 'loans', 'transactions', 'notifications',
    'loan_applications'
  ];
  staff_data     text[] := array[
    'trading_transactions', 'bank_statements', 'reconciliation_entries',
    'mother_group_deposits', 'inquiries'
  ];
  member_visible text[] := array[
    'mother_groups', 'mother_group_members', 'mother_group_meetings'
  ];
  public_read    text[] := array[
    'notices', 'coop_settings', 'share_pool', 'agm_details', 'loan_schemes',
    'gateway_rails', 'field_officers', 'generated_reports'
  ];
begin
  -- members: signed-in members read/update only their own profile (column
  -- guard trigger freezes protected fields), staff keep full control, the
  -- public website may only submit a PENDING application row.
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
  execute 'create policy members_public_apply on public.members for insert '
    || 'to anon with check (status = ''PENDING'' and auth_user_id is null)';

  execute 'drop policy if exists members_staff_delete on public.members';
  execute 'create policy members_staff_delete on public.members for delete '
    || 'to authenticated using (public.is_staff())';

  -- HR registry: staff eyes only
  foreach t in array staff_only loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists %I on public.%I', t || '_staff_all', t);
    execute format(
      'create policy %I on public.%I for all to authenticated using (public.is_staff()) with check (public.is_staff())',
      t || '_staff_all', t
    );
  end loop;

  -- Member-owned tables: members read/insert rows linked to their own
  -- member id; updates/deletes stay staff-only.
  foreach t in array member_scoped loop
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
      || 'with check (member_id = public.current_member_id() or public.is_staff())',
      t || '_member_insert', t
    );

    execute format('drop policy if exists %I on public.%I', t || '_staff_update', t);
    execute format(
      'create policy %I on public.%I for update to authenticated '
      || 'using (public.is_staff()) with check (public.is_staff())',
      t || '_staff_update', t
    );

    execute format('drop policy if exists %I on public.%I', t || '_staff_delete', t);
    execute format(
      'create policy %I on public.%I for delete to authenticated using (public.is_staff())',
      t || '_staff_delete', t
    );
  end loop;

  -- Members may mark their own notifications as read.
  execute 'drop policy if exists notifications_member_update on public.notifications';
  execute 'create policy notifications_member_update on public.notifications for update '
    || 'to authenticated '
    || 'using (member_id = public.current_member_id()) '
    || 'with check (member_id = public.current_member_id())';

  -- Operational / financial data: staff only (anon + member read removed).
  foreach t in array staff_data loop
    execute format('alter table public.%I enable row level security', t);

    execute format('drop policy if exists %I on public.%I', t || '_public_read', t);
    execute format('drop policy if exists %I on public.%I', t || '_staff_read', t);
    execute format(
      'create policy %I on public.%I for select to authenticated using (public.is_staff())',
      t || '_staff_read', t
    );

    execute format('drop policy if exists %I on public.%I', t || '_staff_insert', t);
    execute format(
      'create policy %I on public.%I for insert to authenticated with check (public.is_staff())',
      t || '_staff_insert', t
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

  -- Cooperative directories (SHG / mother groups): visible to any signed-in
  -- user (staff + members), writes stay staff-only.
  foreach t in array member_visible loop
    execute format('alter table public.%I enable row level security', t);

    execute format('drop policy if exists %I on public.%I', t || '_public_read', t);
    execute format('drop policy if exists %I on public.%I', t || '_auth_read', t);
    execute format(
      'create policy %I on public.%I for select to authenticated using (true)',
      t || '_auth_read', t
    );

    execute format('drop policy if exists %I on public.%I', t || '_staff_insert', t);
    execute format(
      'create policy %I on public.%I for insert to authenticated with check (public.is_staff())',
      t || '_staff_insert', t
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

  -- Public website directory / rate cards: anon read-only, staff write.
  foreach t in array public_read loop
    execute format('alter table public.%I enable row level security', t);

    execute format('drop policy if exists %I on public.%I', t || '_public_read', t);
    execute format(
      'create policy %I on public.%I for select to anon, authenticated using (true)',
      t || '_public_read', t
    );

    execute format('drop policy if exists %I on public.%I', t || '_staff_insert', t);
    execute format(
      'create policy %I on public.%I for insert to authenticated with check (public.is_staff())',
      t || '_staff_insert', t
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
end $$;

grant usage on schema public to anon, authenticated;
grant select on all tables in schema public to anon;
grant select, insert, update, delete on all tables in schema public to authenticated;
-- Public website write paths (RLS still scopes what those rows may contain):
grant insert on public.members, public.inquiries to anon;
