/**
 * Mother Group (Self-Help Group) Domain Types
 */

export type MeetingDay = 'Daily' | 'Weekly' | 'Bi-Weekly' | 'Monthly' | 'Custom';

export interface MotherGroup {
  id: string;
  name: string;
  nameNepali?: string;
  groupCode?: string;
  location: string;
  locationNepali?: string;
  contactPerson: string;
  contactPhone: string;
  meetingDay: string;
  meetingDayNepali?: string;
  meetingTime?: string;
  monthlyTargetAmount: number;
  totalMembers: number;
  createdAt: string;
  isActive: boolean;
  notes?: string;
  chairpersonName?: string;
  secretaryName?: string;
  treasurerName?: string;
  fieldStaffName?: string;
  mandatoryContributionPerMember?: number;
}

export interface MotherGroupMember {
  id: string;
  motherGroupId: string;
  /** Linked cooperative member id. Optional: groups also hold unregistered savers. */
  memberId?: string;
  memberName: string;
  memberNo: string;
  joinedDate: string;
  monthlyContribution: number;
  isActive: boolean;
  createdAt: string;
}

export type MeetingStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface MotherGroupMeeting {
  id: string;
  motherGroupId: string;
  meetingDate: string;
  scheduledTime?: string;
  conductedBy: string;
  conductedByName?: string;
  totalCollected: number;
  memberCount: number;
  status: MeetingStatus;
  notes?: string;
  /** Free-text minutes / agenda outcome captured by the conductor. */
  minutes?: string;
  /** Expected members from the group roster at meeting-open time. */
  expectedMembers?: number;
  createdAt: string;
}

export type DepositStatus = 'PENDING' | 'COMPLETED' | 'RECONCILED' | 'VOID';

export interface MotherGroupDeposit {
  id: string;
  meetingId: string;
  motherGroupId: string;
  /** Linked cooperative member id. Optional: groups also hold unregistered savers. */
  memberId?: string;
  memberName: string;
  memberNo: string;
  amount: number;
  depositDate: string;
  recordedBy: string;
  recordedByName?: string;
  status: DepositStatus;
  referenceNo?: string;
  /** Member savings account number the collection was posted into (set on posting). */
  savingsAccountNo?: string;
  /** Teller-ledger transaction reference created when posted (e.g. MGCOL-2081-000142). */
  transactionRef?: string;
  /** Bank deposit slip / voucher number entered by the teller for the group deposit. */
  bankDepositSlipNo?: string;
  /** ISO timestamp when the deposit was posted to the member passbook. */
  postedAt?: string;
  /** Free-text note used when a teller updates/voids a deposit. */
  notes?: string;
  createdAt: string;
}
