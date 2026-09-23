import { describe, it, expect } from 'vitest';
import { toNepaliDigits, toWesternDigits, formatNPR, formatBSDate, getFiscalYear } from '../../utils/nepaliDate';
import { generateCopomisXml, generateCopomisCsv } from '../../utils/copomisExport';
import { useCoopStore } from '../useCoopStore';
import { Member, SavingsAccount, Loan, Employee } from '../../types';

describe('Nepali Bikram Sambat & Number Utilities', () => {
  it('converts Western numbers to Nepali Devanagari numerals', () => {
    expect(toNepaliDigits(2081)).toBe('२०८१');
    expect(toNepaliDigits('9857840123')).toBe('९८५७८४०१२३');
    expect(toNepaliDigits(0)).toBe('०');
  });

  it('converts Nepali Devanagari digits back to Western digits', () => {
    expect(toWesternDigits('२०८१')).toBe('2081');
    expect(toWesternDigits('९८५७८४०१२३')).toBe('9857840123');
  });

  it('formats NPR currency in South Asian grouping', () => {
    expect(formatNPR(184500)).toBe('NPR 1,84,500');
    expect(formatNPR(184500, true)).toBe('रु १,८४,५००');
    expect(formatNPR(5000)).toBe('NPR 5,000');
    expect(formatNPR(10000000)).toBe('NPR 1,00,00,000');
  });

  it('formats BS dates into human readable strings', () => {
    expect(formatBSDate('2081-11-14', 'en')).toBe('Falgun 14, 2081 B.S.');
    expect(formatBSDate('2081-11-14', 'np')).toBe('२०८१ फागुन १४');
  });

  it('computes Nepalese Cooperative Fiscal Year according to Ashad/Shrawan boundaries', () => {
    // Month 11 (Falgun) -> current fiscal year span
    expect(getFiscalYear(2081, 11)).toBe('2081/82');
    // Month 2 (Jestha) -> previous year/current year
    expect(getFiscalYear(2081, 2)).toBe('2080/81');
  });
});

describe('COPOMIS Compliance Export Utility', () => {
  const mockCoopSettings = {
    name: 'Unako Saving & Credit Cooperative Ltd.',
    nameNepali: 'उनको बचत तथा ऋण सहकारी संस्था लि.',
    regNo: '१२९०/०६७/०६८',
    panNo: '३००१२४८९०',
    address: 'Gadhwa-5, Dang',
    phone: '082-412055',
    email: 'info@unako.coop.np',
    openingHours: '10 AM - 4 PM',
    operatingStatus: 'NORMAL' as const,
  };

  const mockMembers: Member[] = [
    {
      id: 'm1',
      memberNo: 'UK-88219',
      name: 'Ram Bahadur Shrestha',
      email: 'ram@example.com',
      phone: '9851023456',
      citizenshipNo: '27-01-72-04912',
      joinedDate: '2021-04-12',
      address: 'Kalanki, Kathmandu',
      status: 'VERIFIED',
      avatarUrl: '',
      shareCapital: 150000,
      totalSavings: 485600,
      activeLoanBalance: 320000,
      accruedDividend: 27800,
      creditScore: 785,
      bankDetails: { bankName: 'NIMB', accountNo: '1234', branch: 'Kalanki', holderName: 'Ram' },
      kycDocuments: { citizenshipFront: true, citizenshipBack: true, photo: true, signature: true, utilityBill: true },
    },
  ];

  const mockSavings: SavingsAccount[] = [
    {
      id: 's1',
      accountNo: 'SAV-001',
      accountType: 'Regular Savings',
      balance: 485600,
      interestRate: 8.0,
      openedDate: '2021-04-12',
      status: 'ACTIVE',
    },
  ];

  const mockLoans: Loan[] = [
    {
      id: 'l1',
      loanNo: 'LN-101',
      loanType: 'Agricultural & Livestock',
      principalAmount: 500000,
      remainingBalance: 320000,
      interestRate: 9.5,
      tenureMonths: 36,
      monthlyEmi: 15000,
      disbursedDate: '2080-04-12',
      nextDueDate: '2081-12-01',
      status: 'ACTIVE',
      collateralDescription: 'Land Plot 4492, Gadhwa-5',
    },
  ];

  it('generates valid COPOMIS regulatory XML structure', () => {
    const xml = generateCopomisXml({
      coopSettings: mockCoopSettings,
      members: mockMembers,
      savings: mockSavings,
      loans: mockLoans,
      fiscalYear: '2081/82',
    });

    expect(xml).toContain('<COPOMIS_REGULATORY_SUBMISSION');
    expect(xml).toContain('<COOP_REG_NO>१२९०/०६७/०६८</COOP_REG_NO>');
    expect(xml).toContain('<TOTAL_SHARE_CAPITAL_NPR>150000</TOTAL_SHARE_CAPITAL_NPR>');
    expect(xml).toContain('<MEMBER_CODE>UK-88219</MEMBER_CODE>');
    expect(xml).toContain('<LOAN_NO>LN-101</LOAN_NO>');
  });

  it('generates CSV with required headers and values', () => {
    const csv = generateCopomisCsv(mockMembers);
    expect(csv).toContain('Member Code,Full Name,Citizenship No');
    expect(csv).toContain('"UK-88219"');
    expect(csv).toContain('"Ram Bahadur Shrestha"');
  });
});

describe('Zustand useCoopStore Immutability & State Transitions', () => {
  it('updates member verification status immutably', () => {
    const store = useCoopStore.getState();
    const initialMembers = store.members;
    const testMemberId = initialMembers[1]?.id; // e.g. m2 which is PENDING

    if (testMemberId) {
      store.updateMemberStatus(testMemberId, 'VERIFIED', 'Documents certified by branch manager');
      const updatedMembers = useCoopStore.getState().members;

      // Immutability: array reference changes
      expect(updatedMembers).not.toBe(initialMembers);

      const verified = updatedMembers.find((m) => m.id === testMemberId);
      expect(verified?.status).toBe('VERIFIED');
      expect(verified?.notes).toContain('Documents certified');
    }
  });

  it('adjusts savings balance correctly for counter deposit', () => {
    const store = useCoopStore.getState();
    const targetAccount = store.savings[0];
    const initialBalance = targetAccount.balance;

    store.adjustSavingsBalance(targetAccount.accountNo, 5000, 'DEPOSIT', 'Counter Cash Deposit');
    const updatedAccount = useCoopStore.getState().savings.find((s) => s.accountNo === targetAccount.accountNo);

    expect(updatedAccount?.balance).toBe(initialBalance + 5000);
  });

  it('records loan repayments and reduces outstanding balance', () => {
    const store = useCoopStore.getState();
    const targetLoan = store.loans[0];
    const initialRemaining = targetLoan.remainingBalance;

    store.recordLoanRepayment(targetLoan.loanNo, 10000, 'Monthly EMI payment');
    const updatedLoan = useCoopStore.getState().loans.find((l) => l.loanNo === targetLoan.loanNo);

    expect(updatedLoan?.remainingBalance).toBe(initialRemaining - 10000);
  });
});

describe('Employee (HR) Registry State Transitions', () => {
  const buildEmployee = (overrides: Partial<Employee> = {}): Omit<Employee, 'id'> => ({
    employeeNo: 'EMP-2081-9001',
    name: 'Test Employee',
    nameNepali: 'परीक्षण कर्मचारी',
    designation: 'Teller',
    designationNepali: 'टेलर',
    department: 'Cash & Counter Services',
    branch: 'Gadhwa Main Branch',
    phone: '98578-00001',
    email: 'test.employee@unako.coop.np',
    joinedDate: '2026-01-05',
    status: 'ACTIVE',
    accessRole: 'TELLER',
    assignedWards: ['Ward 5'],
    avatarUrl: '/assets/kyc/avatar_officer.png',
    notes: 'Added from unit test',
    ...overrides,
  });

  it('seeds the cooperative HR directory with initial staff records', () => {
    const employees = useCoopStore.getState().employees;
    expect(employees.length).toBeGreaterThan(0);
    expect(employees.some((emp) => emp.accessRole === 'FIELD_OFFICER')).toBe(true);
  });

  it('creates, updates and removes employee records immutably', () => {
    const initialEmployees = useCoopStore.getState().employees;
    const created = useCoopStore.getState().addEmployee(buildEmployee());

    const afterAdd = useCoopStore.getState().employees;
    // Immutability: array reference changes and the new record is prepended
    expect(afterAdd).not.toBe(initialEmployees);
    expect(afterAdd[0].id).toBe(created.id);
    expect(afterAdd.length).toBe(initialEmployees.length + 1);
    expect(created.id.startsWith('emp-')).toBe(true);

    useCoopStore.getState().updateEmployee(created.id, { status: 'ON_LEAVE', designation: 'Head Teller' });
    const updated = useCoopStore.getState().employees.find((emp) => emp.id === created.id);
    expect(updated?.status).toBe('ON_LEAVE');
    expect(updated?.designation).toBe('Head Teller');
    expect(updated?.employeeNo).toBe(created.employeeNo);
    expect(updated?.assignedWards).toEqual(['Ward 5']);

    useCoopStore.getState().removeEmployee(created.id);
    const afterRemove = useCoopStore.getState().employees;
    expect(afterRemove.some((emp) => emp.id === created.id)).toBe(false);
    expect(afterRemove.length).toBe(initialEmployees.length);
  });
});

describe('Mother Group Collection Posting', () => {
  const buildDeposit = (overrides: Partial<Parameters<ReturnType<typeof useCoopStore.getState>['recordDeposit']>[0]> = {}) => ({
    meetingId: 'mgmt-test-01',
    motherGroupId: 'mg-001',
    memberId: 'm1',
    memberName: 'Ram Bahadur Shrestha',
    memberNo: 'UK-88219',
    amount: 2500,
    recordedBy: 'EMP-TEST-01',
    recordedByName: 'Test Teller',
    status: 'PENDING' as const,
    ...overrides,
  });

  const balanceOf = (accountNo: string) =>
    useCoopStore.getState().savings.find((s) => s.accountNo === accountNo)?.balance ?? 0;

  it('records PENDING collection drafts with MGCOL references without touching passbooks', () => {
    const before = balanceOf('SAV-001-88219');

    const deposit = useCoopStore.getState().recordDeposit(buildDeposit());

    expect(deposit.status).toBe('PENDING');
    expect(deposit.referenceNo).toMatch(/^MGCOL-\d{4}-\d{6}$/);
    expect(deposit.transactionRef).toBeUndefined();
    expect(balanceOf('SAV-001-88219')).toBe(before);
  });

  it('posts a collection into the member savings account exactly once', () => {
    const created = useCoopStore.getState().recordDeposit(buildDeposit({ amount: 1200 }));
    const before = balanceOf('SAV-001-88219');

    const result = useCoopStore.getState().postDepositToMemberAccount(created.id);

    expect(result.ok).toBe(true);
    expect(result.transactionRef).toMatch(/^MGCOL-\d{4}-\d{6}$/);

    const posted = useCoopStore.getState().motherGroupDeposits.find((d) => d.id === created.id);
    expect(posted?.status).toBe('COMPLETED');
    expect(posted?.savingsAccountNo).toBe('SAV-001-88219');
    expect(posted?.postedAt).toBeTruthy();
    expect(balanceOf('SAV-001-88219')).toBe(before + 1200);

    const tx = useCoopStore.getState().transactions[0];
    expect(tx.type).toBe('DEPOSIT');
    expect(tx.memberId).toBe('m1');
    expect(tx.referenceNo).toBe(result.transactionRef);

    // Idempotent: posting again must not credit the account twice.
    const second = useCoopStore.getState().postDepositToMemberAccount(created.id);
    expect(second.ok).toBe(true);
    expect(second.transactionRef).toBe(result.transactionRef);
    expect(balanceOf('SAV-001-88219')).toBe(before + 1200);
  });

  it('refuses to post collections for unregistered group savers', () => {
    const created = useCoopStore.getState().recordDeposit(
      buildDeposit({ memberId: undefined, memberName: 'Anita Devi Magar', memberNo: 'UK-99102' })
    );

    const result = useCoopStore.getState().postDepositToMemberAccount(created.id);

    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/no matching cooperative member/i);
    const still = useCoopStore.getState().motherGroupDeposits.find((d) => d.id === created.id);
    expect(still?.status).toBe('PENDING');
  });

  it('bulk-posts pending collections and recomputes meeting totals', () => {
    const meeting = useCoopStore.getState().recordMeeting({
      motherGroupId: 'mg-001',
      meetingDate: '2026-09-20',
      conductedBy: 'EMP-TEST-01',
      conductedByName: 'Test Teller',
      totalCollected: 0,
      memberCount: 0,
      status: 'COMPLETED',
    });
    useCoopStore.getState().recordDeposit(buildDeposit({ meetingId: meeting.id, amount: 1000 }));
    useCoopStore.getState().recordDeposit(
      buildDeposit({
        meetingId: meeting.id,
        amount: 2000,
        memberId: 'm3',
        memberName: 'Gopal Krishna Thapa',
        memberNo: 'UK-76102',
      })
    );

    const result = useCoopStore.getState().postMeetingCollections(meeting.id);

    expect(result.posted).toBe(2);
    expect(result.failed).toBe(0);
    const updated = useCoopStore.getState().motherGroupMeetings.find((m) => m.id === meeting.id);
    expect(updated?.totalCollected).toBe(3000);
    expect(updated?.memberCount).toBe(2);
  });

  it('voids a posted collection with a compensating withdrawal', () => {
    const created = useCoopStore.getState().recordDeposit(buildDeposit({ amount: 800 }));
    useCoopStore.getState().postDepositToMemberAccount(created.id);
    const before = balanceOf('SAV-001-88219');

    useCoopStore.getState().voidMotherGroupDeposit(created.id, 'Bank deposit bounced');

    expect(balanceOf('SAV-001-88219')).toBe(before - 800);
    const voided = useCoopStore.getState().motherGroupDeposits.find((d) => d.id === created.id);
    expect(voided?.status).toBe('VOID');
    expect(voided?.notes).toBe('Bank deposit bounced');

    const reversal = useCoopStore.getState().transactions[0];
    expect(reversal.type).toBe('WITHDRAWAL');
    expect(reversal.referenceNo.startsWith('MGVOID-')).toBe(true);
  });

  it('lists member deposit history via linked group memberships', () => {
    const history = useCoopStore.getState().getMemberDepositHistory('m1');

    expect(history.length).toBeGreaterThan(0);
    expect(history.every((d) => d.memberNo === 'UK-88219')).toBe(true);
  });
});
