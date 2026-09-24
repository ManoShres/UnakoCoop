/**
 * Zod validation schemas for Member entities.
 *
 * Validates all user input at the service boundary before sending to Supabase.
 * Covers the full KYM (Know Your Member) statutory fields required by
 * Nepal Rastra Bank cooperative regulations.
 */
import { z } from 'zod';

export const VERIFICATION_STATUS = ['VERIFIED', 'PENDING', 'ACTION_REQUIRED', 'REJECTED'] as const;

export const VerificationStatusSchema = z.enum(VERIFICATION_STATUS);

/** Bank details sub-object. */
export const BankDetailsSchema = z.object({
  bankName: z.string().trim().max(100).default(''),
  accountNo: z.string().trim().max(30).default(''),
  branch: z.string().trim().max(100).default(''),
  holderName: z.string().trim().max(100).default(''),
});

/** KYC document flags sub-object. */
export const KycDocumentsSchema = z.object({
  citizenshipFront: z.boolean().default(false),
  citizenshipBack: z.boolean().default(false),
  photo: z.boolean().default(false),
  signature: z.boolean().default(false),
  utilityBill: z.boolean().default(false),
});

/** Nominee sub-object. */
export const NomineeSchema = z.object({
  name: z.string().trim().min(1, 'Nominee name is required').max(100),
  relation: z.string().trim().min(1, 'Relation is required').max(50),
  citizenshipNo: z.string().trim().max(30).optional(),
  phone: z.string().trim().max(20).optional(),
  dobBs: z.string().trim().optional(),
  isMinor: z.boolean().optional(),
  guardianName: z.string().trim().max(100).optional(),
  guardianRelation: z.string().trim().max(50).optional(),
});

/** Schema for creating a new member via the public application form. */
export const CreateMemberSchema = z.object({
  memberNo: z
    .string()
    .trim()
    .min(1, 'Member number is required')
    .max(20, 'Member number must be 20 characters or less'),
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less'),
  nameNepali: z.string().trim().max(100).optional(),
  email: z
    .string()
    .trim()
    .email('Invalid email address')
    .max(255, 'Email must be 255 characters or less'),
  phone: z
    .string()
    .trim()
    .min(7, 'Phone number must be at least 7 digits')
    .max(20, 'Phone number must be 20 characters or less'),
  citizenshipNo: z
    .string()
    .trim()
    .min(1, 'Citizenship number is required')
    .max(30, 'Citizenship number must be 30 characters or less'),
  panNo: z.string().trim().max(20).optional(),
  joinedDate: z.string().trim().min(1, 'Joined date is required'),
  address: z
    .string()
    .trim()
    .min(1, 'Address is required')
    .max(200, 'Address must be 200 characters or less'),
  addressNepali: z.string().trim().max(200).optional(),
  status: VerificationStatusSchema.default('PENDING'),
  avatarUrl: z.string().trim().default('/assets/kyc/avatar_hari.png'),
  shareCapital: z.number().min(0).default(0),
  totalSavings: z.number().min(0).default(0),
  activeLoanBalance: z.number().min(0).default(0),
  accruedDividend: z.number().min(0).default(0),
  creditScore: z.number().int().min(300).max(850).default(700),
  bankDetails: BankDetailsSchema.default({
    bankName: '',
    accountNo: '',
    branch: '',
    holderName: '',
  }),
  kycDocuments: KycDocumentsSchema.default({
    citizenshipFront: false,
    citizenshipBack: false,
    photo: false,
    signature: false,
    utilityBill: false,
  }),
  notes: z.string().trim().max(2000).optional(),

  // Statutory KYM fields
  gender: z.enum(['FEMALE', 'MALE', 'OTHER']).optional(),
  maritalStatus: z.enum(['UNMARRIED', 'MARRIED', 'WIDOWED', 'DIVORCED', 'OTHER']).optional(),
  dobBs: z.string().trim().optional(),
  dobAd: z.string().trim().optional(),
  occupation: z.string().trim().max(100).optional(),
  fatherName: z.string().trim().max(100).optional(),
  motherName: z.string().trim().max(100).optional(),
  grandfatherName: z.string().trim().max(100).optional(),
  spouseName: z.string().trim().max(100).optional(),
  province: z.string().trim().max(50).optional(),
  district: z.string().trim().max(50).optional(),
  palika: z.string().trim().max(100).optional(),
  wardNo: z.string().trim().max(5).optional(),
  tole: z.string().trim().max(100).optional(),
  tempAddress: z.string().trim().max(200).optional(),
  motherGroupId: z.string().trim().optional(),
  citizenshipIssueDateBs: z.string().trim().optional(),
  citizenshipIssueDistrict: z.string().trim().max(50).optional(),
  nationalIdNo: z.string().trim().max(30).optional(),
  nominee: NomineeSchema.optional(),
  shareKitta: z.number().int().min(0).optional(),
  entranceFee: z.number().min(0).optional(),
  monthlySavingsCommitment: z.number().min(0).optional(),
});

/** Schema for partial member updates. */
export const UpdateMemberSchema = CreateMemberSchema.partial();

export type CreateMemberInput = z.infer<typeof CreateMemberSchema>;
export type UpdateMemberInput = z.infer<typeof UpdateMemberSchema>;
