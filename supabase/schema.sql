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
-- 6. ROW LEVEL SECURITY
--    • anon (public website)  → read-only access to directories & rate cards
--    • authenticated (staff)  → read/write on all operational tables
--    Tighten later by matching auth.uid() against members.auth_user_id.
-- ---------------------------------------------------------------------------
create or replace function public.is_staff()
returns boolean
language sql
stable
as $$
  select auth.uid() is not null and coalesce(auth.role(), 'anon') = 'authenticated';
$$;

do $$
declare
  t text;
  staff_only  text[] := array['employees'];
  staff_write text[] := array[
    'members', 'savings_accounts', 'loans', 'loan_applications', 'transactions',
    'inquiries', 'notifications', 'notices', 'coop_settings', 'share_pool',
    'agm_details', 'loan_schemes', 'gateway_rails', 'field_officers'
  ];
begin
  -- HR registry: staff eyes only
  foreach t in array staff_only loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists %I on public.%I', t || '_staff_all', t);
    execute format(
      'create policy %I on public.%I for all to authenticated using (public.is_staff()) with check (public.is_staff())',
      t || '_staff_all', t
    );
  end loop;

  -- Operational + directory tables: public read, staff write
  foreach t in array staff_write loop
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
