/**
 * Member and User Identity Domain Types
 */

export type VerificationStatus = 'VERIFIED' | 'PENDING' | 'ACTION_REQUIRED' | 'REJECTED';

export type UserRole = 'MEMBER' | 'ADMIN' | 'GUEST';

export interface Member {
  id: string;
  memberNo: string; // e.g., 'UK-88219'
  name: string;
  nameNepali?: string;
  email: string;
  phone: string;
  citizenshipNo: string;
  panNo?: string;
  joinedDate: string;
  address: string;
  addressNepali?: string;
  status: VerificationStatus;
  avatarUrl: string;
  shareCapital: number;
  totalSavings: number;
  activeLoanBalance: number;
  accruedDividend: number;
  creditScore: number;
  bankDetails: {
    bankName: string;
    accountNo: string;
    branch: string;
    holderName: string;
  };
  kycDocuments: {
    citizenshipFront: boolean;
    citizenshipBack: boolean;
    photo: boolean;
    signature: boolean;
    utilityBill: boolean;
  };
  notes?: string;
  /** Supabase Auth user id linked to this member (live mode only). */
  authUserId?: string | null;

  // Statutory Nepalese KYM (Know Your Member) fields
  gender?: 'FEMALE' | 'MALE' | 'OTHER';
  maritalStatus?: 'UNMARRIED' | 'MARRIED' | 'WIDOWED' | 'DIVORCED' | 'OTHER';
  dobBs?: string;
  dobAd?: string;
  occupation?: string;
  fatherName?: string;
  motherName?: string;
  grandfatherName?: string;
  spouseName?: string;
  province?: string;
  district?: string;
  palika?: string;
  wardNo?: string;
  tole?: string;
  tempAddress?: string;
  motherGroupId?: string;
  citizenshipIssueDateBs?: string;
  citizenshipIssueDistrict?: string;
  nationalIdNo?: string;
  nominee?: {
    name: string;
    relation: string;
    citizenshipNo?: string;
    phone?: string;
    dobBs?: string;
    isMinor?: boolean;
    guardianName?: string;
    guardianRelation?: string;
  };
  shareKitta?: number;
  entranceFee?: number;
  monthlySavingsCommitment?: number;
}
