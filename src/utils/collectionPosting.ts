/**
 * Mother Group collection posting engine.
 *
 * Teller-entered meeting collections start life as PENDING MotherGroupDeposit
 * rows. Posting resolves each row to a cooperative member and their active
 * savings account, creates a member-ledger DEPOSIT transaction and stamps the
 * deposit with the account number and transaction reference (MGCOL-...).
 */

import type {
  DepositStatus,
  Member,
  MotherGroupDeposit,
  MotherGroupMember,
  SavingsAccount,
} from '../types';

export interface CollectionPostingTarget {
  memberId?: string;
  memberName?: string;
  accountNo?: string;
  error?: string;
}

export interface CollectionPostingResult {
  ok: boolean;
  transactionRef?: string;
  error?: string;
}

/** One roster line of the teller meeting-collection sheet. */
export interface CollectionSheetRow {
  groupMemberId: string;
  memberId?: string;
  memberNo: string;
  memberName: string;
  monthlyContribution: number;
  /** Amount pre-filled for this meeting (existing value or the monthly commitment). */
  amount: number;
  depositId?: string;
  status?: DepositStatus;
  transactionRef?: string;
  /** Savings account found for the linked cooperative member (blank for unregistered savers). */
  linkedAccountNo?: string;
  canPost: boolean;
}

const norm = (value: string | undefined): string => (value ?? '').trim().toLowerCase();

/**
 * Matches a roster row / deposit to a cooperative member and their default
 * savings account. Unregistered group savers return an `error` so the sheet
 * can flag them before posting.
 */
export function resolveCollectionTarget(
  entry: { memberId?: string; memberNo: string },
  members: Member[],
  savings: SavingsAccount[]
): CollectionPostingTarget {
  const member =
    (entry.memberId ? members.find((m) => m.id === entry.memberId) : undefined) ??
    members.find((m) => norm(m.memberNo) === norm(entry.memberNo));

  if (!member) {
    return { error: 'No matching cooperative member found for this collection.' };
  }

  const accounts = savings.filter((s) => s.memberId === member.id && s.status === 'ACTIVE');
  const account = accounts.find((s) => s.accountType === 'Regular Savings') ?? accounts[0];

  if (!account) {
    return {
      memberId: member.id,
      memberName: member.name,
      error: 'Member has no active savings account to receive this collection.',
    };
  }

  return { memberId: member.id, memberName: member.name, accountNo: account.accountNo };
}

/** `MGCOL-2081-000142` style teller reference (fiscal year part before any `/`). */
export function buildCollectionReference(fiscalYear: string, sequence: number): string {
  const fyPart = fiscalYear.split('/')[0] || fiscalYear;
  return `MGCOL-${fyPart}-${String(Math.max(1, Math.trunc(sequence))).padStart(6, '0')}`;
}

/**
 * True when a non-void collection with the same member + meeting + amount
 * already exists (prevents accidental double entry during meeting capture).
 */
export function isDuplicateCollection(
  candidate: Pick<MotherGroupDeposit, 'motherGroupId' | 'meetingId' | 'memberNo' | 'amount'>,
  existing: MotherGroupDeposit[]
): boolean {
  return existing.some(
    (d) =>
      d.status !== 'VOID' &&
      d.motherGroupId === candidate.motherGroupId &&
      d.meetingId === candidate.meetingId &&
      norm(d.memberNo) === norm(candidate.memberNo) &&
      d.amount === candidate.amount
  );
}

/** Sum + non-void attendee count for a meeting's collections. */
export function summariseMeetingDeposits(deposits: MotherGroupDeposit[]): {
  totalCollected: number;
  memberCount: number;
} {
  const valid = deposits.filter((d) => d.status !== 'VOID');
  return {
    totalCollected: Math.round(valid.reduce((sum, d) => sum + d.amount, 0) * 100) / 100,
    memberCount: valid.length,
  };
}

/**
 * Builds the teller collection sheet for a meeting: every active roster member
 * with their monthly commitment, any existing collection for the meeting, and
 * whether their savings account is linkable.
 */
export function buildCollectionSheet(
  groupId: string,
  motherGroupMembers: MotherGroupMember[],
  deposits: MotherGroupDeposit[],
  meetingId: string,
  members: Member[],
  savings: SavingsAccount[]
): CollectionSheetRow[] {
  return motherGroupMembers
    .filter((m) => m.motherGroupId === groupId && m.isActive)
    .map((m) => {
      const existing = deposits.find(
        (d) =>
          d.meetingId === meetingId &&
          norm(d.memberNo) === norm(m.memberNo) &&
          d.status !== 'VOID'
      );
      const target = resolveCollectionTarget(m, members, savings);
      return {
        groupMemberId: m.id,
        memberId: target.memberId ?? m.memberId,
        memberNo: m.memberNo,
        memberName: m.memberName,
        monthlyContribution: m.monthlyContribution,
        amount: existing?.amount ?? m.monthlyContribution,
        depositId: existing?.id,
        status: existing?.status,
        transactionRef: existing?.transactionRef,
        linkedAccountNo: target.accountNo,
        canPost: !target.error,
      };
    })
    .sort((a, b) => a.memberName.localeCompare(b.memberName));
}
