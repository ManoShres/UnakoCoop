-- ============================================================================
--  UNAKO SACCOS · SUPABASE SEED DATA (fresh install)
--  Run AFTER supabase/schema.sql.  Safe to re-run (upserts on business keys).
-- ============================================================================

-- ---------------------------------------------------------------------------
-- EMPLOYEES (HR registry — matches the app's INITIAL_EMPLOYEES)
-- ---------------------------------------------------------------------------
insert into public.employees
  (employee_no, name, name_nepali, designation, designation_nepali, department, branch,
   phone, email, joined_date, status, access_role, assigned_wards, avatar_url, notes)
values
  ('EMP-2078-0011', 'Aarati Kumari Yadav', 'आरती कुमारी यादव', 'Branch Manager', 'शाखा प्रबन्धक',
   'Branch Operations', 'Gadhwa Main Branch', '98578-21011', 'aarati.yadav@unako.coop.np',
   '2021-05-02', 'ACTIVE', 'BRANCH_MANAGER', array['Ward 4', 'Ward 5'],
   '/assets/kyc/avatar_officer.png',
   'Authorised CBS approver for savings, withdrawal and membership certification.'),
  ('EMP-2078-0014', 'Sita Chaudhary', 'सीता चौधरी', 'Senior Field Supervisor', 'वरिष्ठ क्षेत्र सुपरभाइजर',
   'Field Operations', 'Gadhwa Main Branch', '98578-40123', 'sita.chaudhary@unako.coop.np',
   '2021-07-18', 'ACTIVE', 'FIELD_OFFICER', array['Ward 4', 'Ward 5', 'Ward 6'],
   '/assets/kyc/avatar_officer.png',
   'Leads the Gadhwa Women-Men Self-help Unit #03 savings mobilisation drive.'),
  ('EMP-2079-0021', 'Bishnu Prasad Pokhrel', 'विष्णु प्रसाद पोख्रेल', 'Credit Assessment Officer', 'कर्जा मूल्याङ्कन अधिकृत',
   'Credit & Loan', 'Lamahi Sub-Branch', '98478-22190', 'bishnu.pokhrel@unako.coop.np',
   '2022-02-09', 'ACTIVE', 'LOAN_OFFICER', array['Ward 1', 'Ward 2', 'Ward 3'],
   'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&q=80',
   'Prepares appraisal files for the Credit Committee and monitors collateral verification.'),
  ('EMP-2080-0032', 'Kamala Devi Sharma', 'कमला देवी शर्मा', 'Head Teller (Cash Counter)', 'प्रमुख क्यासियर',
   'Cash & Counter Services', 'Gadhwa Main Branch', '98578-33421', 'kamala.sharma@unako.coop.np',
   '2023-01-16', 'ON_LEAVE', 'TELLER', array['Ward 5'],
   '/assets/kyc/avatar_hari.png',
   'On maternity leave until Kartik; counter duties temporarily re-assigned.'),
  ('EMP-2080-0038', 'Dipak Bahadur Thapa', 'दिपक बहादुर थापा', 'Cooperative Accountant', 'सहकारी लेखापाल',
   'Accounts & Audit', 'Gadhwa Main Branch', '98478-55230', 'dipak.thapa@unako.coop.np',
   '2023-08-01', 'ACTIVE', 'ACCOUNTANT', array['Ward 1', 'Ward 6'],
   '/assets/kyc/avatar_nominee.png',
   'Handles COPOMIS regulatory returns and annual statutory audit coordination.'),
  ('EMP-2077-0004', 'Sunita K.C.', 'सुनिता के.सी.', 'CBS System Administrator', 'सीबीएस प्रणाली प्रशासक',
   'IT & Digital Banking', 'Gadhwa Main Branch', '98578-10004', 'admin@unako.coop',
   '2020-11-05', 'ACTIVE', 'SUPER_ADMIN', array[]::text[],
   '/assets/kyc/avatar_officer.png',
   'Universal configuration authority for portal access, roles and CBS audit console.')
on conflict (employee_no) do update set
  name = excluded.name,
  name_nepali = excluded.name_nepali,
  designation = excluded.designation,
  designation_nepali = excluded.designation_nepali,
  department = excluded.department,
  branch = excluded.branch,
  phone = excluded.phone,
  email = excluded.email,
  joined_date = excluded.joined_date,
  status = excluded.status,
  access_role = excluded.access_role,
  assigned_wards = excluded.assigned_wards,
  avatar_url = excluded.avatar_url,
  notes = excluded.notes;

-- ---------------------------------------------------------------------------
-- MEMBERS (cooperative shareholders)
-- ---------------------------------------------------------------------------
insert into public.members
  (member_no, name, name_nepali, email, phone, citizenship_no, joined_date, address, status,
   avatar_url, share_capital, total_savings, active_loan_balance, accrued_dividend, credit_score,
   bank_details, kyc_documents, notes)
values
  ('UK-88219', 'Ram Bahadur Shrestha', 'राम बहादुर श्रेष्ठ', 'ram.shrestha@unako.coop.np',
   '9851023456', '27-01-72-04912', '2021-04-12', 'Kalanki, Kathmandu', 'VERIFIED',
   '/assets/kyc/avatar_hari.png', 150000, 485600, 320000, 27800, 785,
   '{"bankName":"Nabil Bank","accountNo":"023-441299","branch":"Kalanki","holderName":"Ram Bahadur Shrestha"}'::jsonb,
   '{"citizenshipFront":true,"citizenshipBack":true,"photo":true,"signature":true,"utilityBill":true}'::jsonb,
   'Founding shareholder of the Gadhwa collective.'),
  ('UK-88220', 'Sita Devi Chaudhary', 'सीता देवी चौधरी', 'sita.chaudhary@example.com',
   '9847811200', '52-01-78-09142', '2026-08-21', 'Gadhwa-5, Dang', 'PENDING',
   '/assets/kyc/avatar_nominee.png', 5000, 5000, 0, 0, 700,
   '{"bankName":"Agricultural Development Bank Ltd","accountNo":"023-778812","branch":"Gadhwa","holderName":"Sita Devi Chaudhary"}'::jsonb,
   '{"citizenshipFront":true,"citizenshipBack":true,"photo":true,"signature":false,"utilityBill":false}'::jsonb,
   'Membership application submitted through the public onboarding form.')
on conflict (member_no) do update set
  name = excluded.name,
  name_nepali = excluded.name_nepali,
  email = excluded.email,
  phone = excluded.phone,
  citizenship_no = excluded.citizenship_no,
  joined_date = excluded.joined_date,
  address = excluded.address,
  status = excluded.status,
  avatar_url = excluded.avatar_url,
  share_capital = excluded.share_capital,
  total_savings = excluded.total_savings,
  active_loan_balance = excluded.active_loan_balance,
  accrued_dividend = excluded.accrued_dividend,
  credit_score = excluded.credit_score,
  bank_details = excluded.bank_details,
  kyc_documents = excluded.kyc_documents,
  notes = excluded.notes;

-- ---------------------------------------------------------------------------
-- COOPERATIVE CMS SETTINGS · SHARE POOL · AGM
-- ---------------------------------------------------------------------------
insert into public.coop_settings
  (coop_key, name, name_nepali, reg_no, reg_no_english, pan_no, address, address_nepali,
   address_english, phone, phone_english, email, opening_hours, opening_hours_nepali,
   opening_hours_english, operating_status)
values
  ('primary', 'Unako Saving & Credit Cooperative Ltd.', 'उनको बचत तथा ऋण सहकारी संस्था लि.',
   '१२९०/०६७/०६८', '1290/067/068', '३००१२४८९०',
   'गढवा-५, चैनपुर, दाङ, लुम्बिनी प्रदेश, नेपाल',
   'गढवा-५, चैनपुर, दाङ, लुम्बिनी प्रदेश, नेपाल',
   'Gadhwa-5, Chainpur, Dang, Lumbini Province, Nepal',
   '०८२-४१२०५५ / ९८५७८२१०००', '+977-82-412055 / +977-9857821000',
   'info@unako.coop.np',
   'आइतबार - शुक्रबार: बिहान १०:०० देखि दिउँसो ४:०० सम्म',
   'आइतबार - शुक्रबार: बिहान १०:०० देखि दिउँसो ४:०० सम्म',
   'Sunday – Friday: 10:00 AM – 04:00 PM', 'NORMAL')
on conflict (coop_key) do update set
  name = excluded.name,
  name_nepali = excluded.name_nepali,
  reg_no = excluded.reg_no,
  pan_no = excluded.pan_no,
  address = excluded.address,
  phone = excluded.phone,
  email = excluded.email,
  opening_hours = excluded.opening_hours,
  operating_status = excluded.operating_status;

insert into public.share_pool
  (pool_key, par_value, total_allotted_kitta, total_reserve_fund,
   annual_dividend_percent, patronage_bonus_percent, share_purchase_open)
values ('primary', 100, 500000, 18450000, 14.5, 3.0, true)
on conflict (pool_key) do update set
  par_value = excluded.par_value,
  total_allotted_kitta = excluded.total_allotted_kitta,
  total_reserve_fund = excluded.total_reserve_fund,
  annual_dividend_percent = excluded.annual_dividend_percent,
  patronage_bonus_percent = excluded.patronage_bonus_percent,
  share_purchase_open = excluded.share_purchase_open;

insert into public.agm_details
  (agm_key, edition, date_nepali, date_english, time, venue, total_delegates, digital_pass_enabled)
values
  ('primary', '३१औं वार्षिक साधारण सभा', '२०८१ चैत्र २५', 'April 7, 2025', '०९:०० बजे',
   'गढवा सामुदायिक भवन, चैनपुर-५, दाङ', 1250, true)
on conflict (agm_key) do update set
  edition = excluded.edition,
  date_nepali = excluded.date_nepali,
  date_english = excluded.date_english,
  time = excluded.time,
  venue = excluded.venue,
  total_delegates = excluded.total_delegates,
  digital_pass_enabled = excluded.digital_pass_enabled;

-- ---------------------------------------------------------------------------
-- LOAN SCHEMES · GATEWAY RAILS · FIELD OFFICERS
-- ---------------------------------------------------------------------------
insert into public.loan_schemes
  (scheme_key, name, name_nepali, interest_rate, max_amount, max_tenure_months,
   subsidized_rate, is_active, description)
values
  ('SCH-01', 'Women Entrepreneurship Credit', 'महिला उद्यमशीलता कर्जा', 9.5, 500000, 36, 6.5, true,
   'Subsidised working-capital loan for women-led micro enterprises in Dang Valley.'),
  ('SCH-02', 'Agricultural & Livestock Development', 'कृषि तथा पशुपालन विकास कर्जा', 8.5, 800000, 48, 5.5, true,
   'Seasonal crop, irrigation and livestock purchase credit with harvest-aligned repayments.'),
  ('SCH-03', 'Home & Land Improvement', 'घर तथा जग्गा सुधार कर्जा', 11.0, 1500000, 84, null, true,
   'Long-tenure mortgage-backed financing for housing and land development.'),
  ('SCH-04', 'Education & Skill Development', 'शिक्षा तथा सीप विकास कर्जा', 10.0, 500000, 48, 7.0, true,
   'Tuition and technical education credit with grace period during study tenure.'),
  ('SCH-05', 'Micro Small Business Enterprise', 'साना तथा मझौला व्यवसाय कर्जा', 11.0, 1000000, 60, null, true,
   'Working capital and retail machinery expansion for local Dang Valley merchants.')
on conflict (scheme_key) do update set
  name = excluded.name,
  name_nepali = excluded.name_nepali,
  interest_rate = excluded.interest_rate,
  max_amount = excluded.max_amount,
  max_tenure_months = excluded.max_tenure_months,
  subsidized_rate = excluded.subsidized_rate,
  is_active = excluded.is_active,
  description = excluded.description;

insert into public.gateway_rails
  (gateway_key, name, type, status, daily_limit, surcharge_percent, reconciliation_cycle)
values
  ('GW-01', 'eSewa Direct Wallet', 'WALLET', 'ACTIVE', 100000, 0, 'Instant CBS RTGS'),
  ('GW-02', 'Khalti Digital Wallet', 'WALLET', 'ACTIVE', 100000, 0, 'Instant CBS RTGS'),
  ('GW-03', 'ConnectIPS (NCHL)', 'IPS', 'ACTIVE', 500000, 0, 'National Payment Switch (NPS)'),
  ('GW-04', 'NepalPay / Fonepay QR', 'QR', 'ACTIVE', 200000, 0, 'Instant Interbank Merchant Settlement'),
  ('GW-05', 'Agricultural Development Bank (ADBL)', 'BANK', 'ACTIVE', 1000000, 0, 'T+0 End-of-Day EOD Batch')
on conflict (gateway_key) do update set
  name = excluded.name,
  type = excluded.type,
  status = excluded.status,
  daily_limit = excluded.daily_limit,
  surcharge_percent = excluded.surcharge_percent,
  reconciliation_cycle = excluded.reconciliation_cycle;

insert into public.field_officers
  (name, name_nepali, phone, email, role, role_nepali, assigned_wards, active_unit, avatar_url)
select 'Sita Chaudhary', 'सीता चौधरी', '98578-40123', 'sita.chaudhary@unako.coop.np',
       'Senior Field Supervisor', 'वरिष्ठ क्षेत्र सुपरभाइजर', array['Ward 4', 'Ward 5', 'Ward 6'],
       'Gadhwa Women-Men Self-help Unit #03', '/assets/kyc/avatar_officer.png'
where not exists (select 1 from public.field_officers where email = 'sita.chaudhary@unako.coop.np');

insert into public.field_officers
  (name, name_nepali, phone, email, role, role_nepali, assigned_wards, active_unit, avatar_url)
select 'Bishnu Prasad Pokhrel', 'विष्णु प्रसाद पोख्रेल', '98478-22190', 'bishnu.pokhrel@unako.coop.np',
       'Credit Assessment Officer', 'कर्जा मूल्याङ्कन अधिकृत', array['Ward 1', 'Ward 2', 'Ward 3'],
       'Lamahi Valley Farmers Collective #01',
       'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&q=80'
where not exists (select 1 from public.field_officers where email = 'bishnu.pokhrel@unako.coop.np');
