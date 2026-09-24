import {
  Notice,
  LoanScheme,
  GatewayRail,
  SharePool,
  AgmDetails,
  FieldOfficer,
  Employee,
  CoopSettings,
} from '../types';

/** Live status of the Supabase <-> local HR registry bridge. */
export interface EmployeeSyncStatus {
  source: 'supabase' | 'local';
  state: 'idle' | 'syncing' | 'synced' | 'error';
  message?: string;
}

export const INITIAL_NOTICES: Notice[] = [
  {
    id: 'not-1',
    title: '31st Annual General Meeting (AGM): Asar 1, 2083 - Gadhwa Community Hall, Chainpur-5, Dang',
    titleNepali: '३१औं वार्षिक साधारण सभा (AGM): असार १, २०८३ - गढवा सामुदायिक भवन, चैनपुर-५, दाङ',
    category: 'AGM',
    content: 'All certified shareholder members are formally invited to participate in the 31st AGM. Digital entry passes and QR vouchers are now accessible via Member Portal.',
    publishedDate: '2081-11-01',
    isUrgent: true,
    isActive: true,
  },
  {
    id: 'not-2',
    title: 'Special Agriculture Loan Subsidized Window - 1.5% Ministry of Agriculture Rebate',
    titleNepali: 'विशेष कृषि तथा पशुपालन कर्जा सहुलियत विन्डो - १.५% कृषि मन्त्रालय अनुदान सुविधा',
    category: 'POLICY',
    content: 'Eligible commercial dairy and seed producers can avail subsidized loans at 8.5% interest rate. Contact Branch Officer or apply online.',
    publishedDate: '2081-10-15',
    isUrgent: false,
    isActive: true,
  },
  {
    id: 'not-3',
    title: 'Annual Member Dividend Distribution (14.5%) Credited to Regular Savings',
    titleNepali: 'वार्षिक सेयर लाभांश (१४.५%) सम्पूर्ण सदस्यहरूको ऐच्छिक बचत खातामा जम्मा भयो',
    category: 'DIVIDEND',
    content: 'The 14.5% equity dividend approved by the Board has been credited directly to all active member passbooks.',
    publishedDate: '2081-09-28',
    isUrgent: false,
    isActive: true,
  },
];

export const INITIAL_LOAN_SCHEMES: LoanScheme[] = [
  {
    id: 'sch-1',
    name: 'Agriculture & Dairy Loan',
    nameNepali: 'कृषि तथा पशुपालन कर्जा',
    interestRate: 9.5,
    subsidizedRate: 8.0,
    maxAmount: 500000,
    maxTenureMonths: 36,
    isActive: true,
    desc: 'Low-interest credit facility for livestock purchase, seed procurement, and dairy sheds.',
  },
  {
    id: 'sch-2',
    name: 'Women Entrepreneurship Loan',
    nameNepali: 'महिला उद्यमशीलता कर्जा',
    interestRate: 7.0,
    subsidizedRate: 5.5,
    maxAmount: 300000,
    maxTenureMonths: 24,
    isActive: true,
    desc: 'Collateral-free subsidized micro-credit for female-run cottage enterprises and weaving units.',
  },
  {
    id: 'sch-3',
    name: 'Emergency & Medical Loan',
    nameNepali: 'आकस्मिक तथा स्वास्थ्य कर्जा',
    interestRate: 10.5,
    maxAmount: 150000,
    maxTenureMonths: 18,
    isActive: true,
    desc: 'Fast-track medical and disaster emergency relief disbursed within 4 hours.',
  },
  {
    id: 'sch-4',
    name: 'Higher Education Loan',
    nameNepali: 'उच्च शिक्षा तथा प्राविधिक कर्जा',
    interestRate: 8.5,
    maxAmount: 400000,
    maxTenureMonths: 48,
    isActive: true,
    desc: 'Tuition and technical education credit with grace period during study tenure.',
  },
  {
    id: 'sch-5',
    name: 'Micro Small Business Enterprise',
    nameNepali: 'साना तथा मझौला व्यवसाय कर्जा',
    interestRate: 11.0,
    maxAmount: 1000000,
    maxTenureMonths: 60,
    isActive: true,
    desc: 'Working capital and retail machinery expansion for local Dang Valley merchants.',
  },
];

export const INITIAL_GATEWAY_RAILS: GatewayRail[] = [
  { id: 'gw-1', name: 'eSewa Direct Wallet', type: 'WALLET', status: 'ACTIVE', dailyLimit: 100000, surchargePercent: 0, reconciliationCycle: 'Instant CBS RTGS' },
  { id: 'gw-2', name: 'Khalti Digital Wallet', type: 'WALLET', status: 'ACTIVE', dailyLimit: 100000, surchargePercent: 0, reconciliationCycle: 'Instant CBS RTGS' },
  { id: 'gw-3', name: 'ConnectIPS (NCHL)', type: 'IPS', status: 'ACTIVE', dailyLimit: 500000, surchargePercent: 0, reconciliationCycle: 'National Payment Switch (NPS)' },
  { id: 'gw-4', name: 'NepalPay / Fonepay QR', type: 'QR', status: 'ACTIVE', dailyLimit: 200000, surchargePercent: 0, reconciliationCycle: 'Instant Interbank Merchant Settlement' },
  { id: 'gw-5', name: 'Agricultural Development Bank (ADBL)', type: 'BANK', status: 'ACTIVE', dailyLimit: 1000000, surchargePercent: 0, reconciliationCycle: 'T+0 End-of-Day EOD Batch' },
];

export const INITIAL_SHARE_POOL: SharePool = {
  parValue: 100,
  totalAllottedKitta: 500000,
  totalReserveFund: 18450000,
  annualDividendPercent: 14.5,
  patronageBonusPercent: 3.0,
  sharePurchaseOpen: true,
};

export const INITIAL_AGM_DETAILS: AgmDetails = {
  edition: '३१औं वार्षिक साधारण सभा',
  dateNepali: '२०८१ चैत्र २५',
  dateEnglish: 'April 7, 2025',
  time: '०९:०० बजे',
  venue: 'गढवा सामुदायिक भवन, चैनपुर-५, दाङ',
  totalDelegates: 1250,
  digitalPassEnabled: true,
};

export const INITIAL_FIELD_OFFICERS: FieldOfficer[] = [
  {
    id: 'fo-1',
    name: 'Sita Chaudhary',
    phone: '98578-40123',
    email: 'sita.chaudhary@unako.coop.np',
    role: 'Senior Field Supervisor',
    assignedWards: ['Ward 4', 'Ward 5', 'Ward 6'],
    activeUnit: 'Gadhwa Women-Men Self-help Unit #03',
    avatarUrl: '/assets/kyc/avatar_officer.png',
  },
  {
    id: 'fo-2',
    name: 'Bishnu Prasad Pokhrel',
    phone: '98478-22190',
    email: 'bishnu.pokhrel@unako.coop.np',
    role: 'Credit Assessment Officer',
    assignedWards: ['Ward 1', 'Ward 2', 'Ward 3'],
    activeUnit: 'Lamahi Valley Farmers Collective #01',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&q=80',
  },
];

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-seed-1',
    employeeNo: 'EMP-2078-0011',
    name: 'Aarati Kumari Yadav',
    nameNepali: 'आरती कुमारी यादव',
    designation: 'Branch Manager',
    designationNepali: 'शाखा प्रबन्धक',
    department: 'Branch Operations',
    branch: 'Gadhwa Main Branch',
    phone: '98578-21011',
    email: 'aarati.yadav@unako.coop.np',
    joinedDate: '2021-05-02',
    status: 'ACTIVE',
    accessRole: 'BRANCH_MANAGER',
    assignedWards: ['Ward 4', 'Ward 5'],
    avatarUrl: '/assets/kyc/avatar_officer.png',
    notes: 'Authorised CBS approver for savings, withdrawal and membership certification.',
  },
  {
    id: 'emp-seed-2',
    employeeNo: 'EMP-2078-0014',
    name: 'Sita Chaudhary',
    nameNepali: 'सीता चौधरी',
    designation: 'Senior Field Supervisor',
    designationNepali: 'वरिष्ठ क्षेत्र सुपरभाइजर',
    department: 'Field Operations',
    branch: 'Gadhwa Main Branch',
    phone: '98578-40123',
    email: 'sita.chaudhary@unako.coop.np',
    joinedDate: '2021-07-18',
    status: 'ACTIVE',
    accessRole: 'FIELD_OFFICER',
    assignedWards: ['Ward 4', 'Ward 5', 'Ward 6'],
    avatarUrl: '/assets/kyc/avatar_officer.png',
    notes: 'Leads the Gadhwa Women-Men Self-help Unit #03 savings mobilisation drive.',
  },
  {
    id: 'emp-seed-3',
    employeeNo: 'EMP-2079-0021',
    name: 'Bishnu Prasad Pokhrel',
    nameNepali: 'विष्णु प्रसाद पोख्रेल',
    designation: 'Credit Assessment Officer',
    designationNepali: 'कर्जा मूल्याङ्कन अधिकृत',
    department: 'Credit & Loan',
    branch: 'Lamahi Sub-Branch',
    phone: '98478-22190',
    email: 'bishnu.pokhrel@unako.coop.np',
    joinedDate: '2022-02-09',
    status: 'ACTIVE',
    accessRole: 'LOAN_OFFICER',
    assignedWards: ['Ward 1', 'Ward 2', 'Ward 3'],
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&q=80',
    notes: 'Prepares appraisal files for the Credit Committee and monitors collateral verification.',
  },
  {
    id: 'emp-seed-4',
    employeeNo: 'EMP-2080-0032',
    name: 'Kamala Devi Sharma',
    nameNepali: 'कमला देवी शर्मा',
    designation: 'Head Teller (Cash Counter)',
    designationNepali: 'प्रमुख क्यासियर',
    department: 'Cash & Counter Services',
    branch: 'Gadhwa Main Branch',
    phone: '98578-33421',
    email: 'kamala.sharma@unako.coop.np',
    joinedDate: '2023-01-16',
    status: 'ON_LEAVE',
    accessRole: 'TELLER',
    assignedWards: ['Ward 5'],
    avatarUrl: '/assets/kyc/avatar_hari.png',
    notes: 'On maternity leave until Kartik; counter duties temporarily re-assigned.',
  },
  {
    id: 'emp-seed-5',
    employeeNo: 'EMP-2080-0038',
    name: 'Dipak Bahadur Thapa',
    nameNepali: 'दिपक बहादुर थापा',
    designation: 'Cooperative Accountant',
    designationNepali: 'सहकारी लेखापाल',
    department: 'Accounts & Audit',
    branch: 'Gadhwa Main Branch',
    phone: '98478-55230',
    email: 'dipak.thapa@unako.coop.np',
    joinedDate: '2023-08-01',
    status: 'ACTIVE',
    accessRole: 'ACCOUNTANT',
    assignedWards: ['Ward 1', 'Ward 6'],
    avatarUrl: '/assets/kyc/avatar_nominee.png',
    notes: 'Handles COPOMIS regulatory returns and annual statutory audit coordination.',
  },
  {
    id: 'emp-seed-6',
    employeeNo: 'EMP-2077-0004',
    name: 'Sunita K.C.',
    nameNepali: 'सुनिता के.सी.',
    designation: 'CBS System Administrator',
    designationNepali: 'सीबीएस प्रणाली प्रशासक',
    department: 'IT & Digital Banking',
    branch: 'Gadhwa Main Branch',
    phone: '98578-10004',
    email: 'admin@unako.coop',
    joinedDate: '2020-11-05',
    status: 'ACTIVE',
    accessRole: 'SUPER_ADMIN',
    assignedWards: [],
    avatarUrl: '/assets/kyc/avatar_officer.png',
    notes: 'Universal configuration authority for portal access, roles and CBS audit console.',
  },
];

export const INITIAL_COOP_SETTINGS: CoopSettings = {
  name: 'Unako Saving & Credit Cooperative Ltd.',
  nameNepali: 'उनको बचत तथा ऋण सहकारी संस्था लि.',
  regNo: '१२९०/०६७/०६८',
  regNoEnglish: '1290/067/068',
  panNo: '३००१२४८९०',
  address: 'गढवा-५, चैनपुर, दाङ, लुम्बिनी प्रदेश, नेपाल',
  addressNepali: 'गढवा-५, चैनपुर, दाङ, लुम्बिनी प्रदेश, नेपाल',
  addressEnglish: 'Gadhwa-5, Chainpur, Dang, Lumbini Province, Nepal',
  phone: '०८२-४१२०५५ / ९८५७८२१०००',
  phoneEnglish: '+977-82-412055 / +977-9857821000',
  email: 'info@unako.coop.np',
  openingHours: 'आइतबार - शुक्रबार: बिहान १०:०० देखि दिउँसो ४:०० सम्म',
  openingHoursNepali: 'आइतबार - शुक्रबार: बिहान १०:०० देखि दिउँसो ४:०० सम्म',
  openingHoursEnglish: 'Sunday – Friday: 10:00 AM – 04:00 PM',
  operatingStatus: 'NORMAL',
};

export const getStoredCoopSettings = (): CoopSettings => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('unako_coop_settings');
      if (saved) {
        return { ...INITIAL_COOP_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {
      // ignore
    }
  }
  return INITIAL_COOP_SETTINGS;
};

const EMPLOYEE_STORAGE_KEY = 'unako_employees';

export const getStoredEmployees = (): Employee[] => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(EMPLOYEE_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed as Employee[];
        }
      }
    } catch {
      // ignore corrupted or unavailable storage
    }
  }
  return INITIAL_EMPLOYEES;
};

export const persistEmployees = (employees: Employee[]): void => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(EMPLOYEE_STORAGE_KEY, JSON.stringify(employees));
    } catch {
      // ignore storage write errors
    }
  }
};
