import { EmployeeAccessRole, EmployeeStatus } from '../../../../types';

export const DEFAULT_AVATAR = '/assets/kyc/avatar_officer.png';

export const ACCESS_ROLE_LABELS: Record<EmployeeAccessRole, { ne: string; en: string }> = {
  SUPER_ADMIN: { ne: 'सुपर एडमिन', en: 'Super Admin' },
  BRANCH_MANAGER: { ne: 'शाखा प्रबन्धक', en: 'Branch Manager' },
  LOAN_OFFICER: { ne: 'कर्जा अधिकृत', en: 'Loan Officer' },
  TELLER: { ne: 'टेलर / क्यासियर', en: 'Teller' },
  ACCOUNTANT: { ne: 'लेखापाल', en: 'Accountant' },
  FIELD_OFFICER: { ne: 'क्षेत्र सहजकर्ता', en: 'Field Officer' },
};

export const ACCESS_ROLE_IDS: EmployeeAccessRole[] = [
  'SUPER_ADMIN',
  'BRANCH_MANAGER',
  'LOAN_OFFICER',
  'TELLER',
  'ACCOUNTANT',
  'FIELD_OFFICER',
];

export const STATUS_IDS: EmployeeStatus[] = ['ACTIVE', 'ON_LEAVE', 'INACTIVE'];

export interface EmployeeDraft {
  name: string;
  nameNepali: string;
  designation: string;
  designationNepali: string;
  phone: string;
  email: string;
  department: string;
  branch: string;
  accessRole: EmployeeAccessRole;
  status: EmployeeStatus;
  joinedDate: string;
  wardsText: string;
  avatarUrl: string;
  notes: string;
}

export const createEmptyDraft = (): EmployeeDraft => ({
  name: '',
  nameNepali: '',
  designation: '',
  designationNepali: '',
  phone: '',
  email: '',
  department: 'Field Operations',
  branch: 'Gadhwa Main Branch',
  accessRole: 'FIELD_OFFICER',
  status: 'ACTIVE',
  joinedDate: new Date().toISOString().split('T')[0],
  wardsText: '',
  avatarUrl: DEFAULT_AVATAR,
  notes: '',
});

export const parseWards = (wardsText: string): string[] =>
  wardsText
    .split(',')
    .map((ward) => ward.trim())
    .filter((ward) => ward.length > 0);
