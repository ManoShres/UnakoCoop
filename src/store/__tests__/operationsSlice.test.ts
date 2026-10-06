/**
 * Regression tests for ledger-integrity defects in `operationsSlice` (task-7 group A).
 *
 * These tests deliberately assert the CORRECTED behaviour of:
 *  A1 unrelated-account deposit credit
 *  A2 dividend entitlement cap / no phantom payout
 *  A3 single-account warehouse surplus credit + idempotency
 *  A4 pledge-loan status/LTV/ownership/idempotency + LOAN_DISBURSEMENT booking
 *  A5 accrued dividend preserved when no savings account matched
 *  A6 crop release retires the pledge liability
 *  A7 bulk dividend rate ceiling, surplus cap and per-fiscal-year lock
 *
 * Created by the financial-logic workstream; the file lives under src/store/__tests__
 * because the slice can only be exercised through the composed store.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { useCoopStore } from '../useCoopStore';
import { Member, SavingsAccount, Transaction, WarehouseReceipt, WarehousePledgeLoan, SharePool } from '../../types';

const buildMember = (overrides: Partial<Member>): Member => ({
  id: 'mem-x',
  memberNo: 'UK-X',
  name: 'Test Member',
  email: 'test@example.com',
  phone: '9800000000',
  citizenshipNo: '000',
  joinedDate: '2020-01-01',
  address: 'Gadhwa',
  status: 'VERIFIED',
  avatarUrl: '',
  shareCapital: 0,
  totalSavings: 0,
  activeLoanBalance: 0,
  accruedDividend: 0,
  creditScore: 700,
  bankDetails: { bankName: '', accountNo: '', branch: '', holderName: '' },
  kycDocuments: {
    citizenshipFront: true,
    citizenshipBack: true,
    photo: true,
    signature: true,
    utilityBill: true,
  },
  ...overrides,
});

const savingsAccount = (
  accountNo: string,
  memberId: string | undefined,
  balance: number
): SavingsAccount => ({
  id: 'sav-' + accountNo,
  memberId,
  accountNo,
  accountType: 'Regular Savings',
  balance,
  interestRate: 8,
  openedDate: '2024-01-01',
  status: 'ACTIVE',
});

const MEMBER_A = buildMember({
  id: 'mem-A',
  memberNo: 'UK-A',
  name: 'Member A',
  shareCapital: 100000,
  totalSavings: 3000,
  activeLoanBalance: 50000,
  accruedDividend: 0,
});
const MEMBER_B = buildMember({
  id: 'mem-B',
  memberNo: 'UK-B',
  name: 'Member B',
  shareCapital: 100000,
  totalSavings: 5000,
  accruedDividend: 14500,
});
// Member C has an accrued dividend but NO savings account anywhere.
const MEMBER_C = buildMember({
  id: 'mem-C',
  memberNo: 'UK-C',
  name: 'Member C',
  shareCapital: 100000,
  totalSavings: 0,
  accruedDividend: 5000,
});

const SAV_A1 = savingsAccount('SAV-A1', 'mem-A', 1000);
const SAV_A2 = savingsAccount('SAV-A2', 'mem-A', 2000);
const SAV_B1 = savingsAccount('SAV-B1', 'mem-B', 5000);

const buildReceipt = (overrides: Partial<WarehouseReceipt>): WarehouseReceipt => ({
  id: 'whr-test',
  receiptNo: 'WHR-2081-9999',
  memberId: 'mem-A',
  memberName: 'Member A',
  memberNo: 'UK-A',
  memberPhone: '9800000000',
  commodity: 'PADDY_DHAN',
  varietyName: 'Sona Mansuli',
  bagCount: 20,
  netWeightQuintals: 10,
  storageLocation: 'Gadhwa Silo',
  qualityInspection: {
    moisturePercent: 13,
    foreignMatterPercent: 1,
    grade: 'GRADE_A',
    isMoistureAcceptable: true,
    rateAdjustmentFactor: 1,
    inspectorNotes: 'ok',
  },
  baseMarketRatePerQuintal: 3450,
  effectiveRatePerQuintal: 3450,
  totalMarketValuation: 86250,
  maxEligiblePledgeLoanAmount: 60375,
  storageMonthlyChargePerQuintal: 25,
  depositDate: '2081-06-15',
  expiryDate: '2081-12-15',
  status: 'STORED',
  createdAt: '2024-10-01T10:00:00Z',
  ...overrides,
});

const pledgeLoan = (overrides: Partial<WarehousePledgeLoan> = {}): WarehousePledgeLoan => ({
  id: 'wln-test',
  loanNo: 'CROP-LN-2081-9999',
  receiptId: 'whr-test',
  receiptNo: 'WHR-2081-9999',
  memberId: 'mem-A',
  memberName: 'Member A',
  principalDisbursed: 1000,
  annualInterestRate: 8.5,
  disbursedDate: '2081-06-16',
  dueDate: '2081-12-16',
  tenureMonths: 6,
  monthlyStorageRatePerQuintal: 25,
  savingsAccountNo: 'SAV-A1',
  status: 'ACTIVE',
  ...overrides,
});

const sharePool = (overrides: Partial<SharePool> = {}): SharePool => ({
  parValue: 100,
  totalAllottedKitta: 2000,
  totalReserveFund: 1000000,
  annualDividendPercent: 14.5,
  patronageBonusPercent: 40,
  sharePurchaseOpen: true,
  ...overrides,
});

interface StateOverrides {
  members?: Member[];
  savings?: SavingsAccount[];
  transactions?: Transaction[];
  warehouseReceipts?: WarehouseReceipt[];
  warehousePledgeLoans?: WarehousePledgeLoan[];
  sharePool?: SharePool;
}

const resetState = (overrides: StateOverrides = {}) => {
  useCoopStore.setState({
    members: overrides.members ?? [MEMBER_A, MEMBER_B, MEMBER_C],
    savings: overrides.savings ?? [SAV_A1, SAV_A2, SAV_B1],
    transactions: overrides.transactions ?? [],
    warehouseReceipts: overrides.warehouseReceipts ?? [],
    warehousePledgeLoans: overrides.warehousePledgeLoans ?? [],
    sharePool: overrides.sharePool ?? sharePool(),
  });
};

const savingsBalance = (accountNo: string) =>
  useCoopStore.getState().savings.find((s) => s.accountNo === accountNo)?.balance ?? 0;
const memberById = (id: string) => useCoopStore.getState().members.find((m) => m.id === id);

describe('A1 confirmPendingDeposit — no unrelated-account credit', () => {
  beforeEach(() => resetState());

  it('credits the depositor\'s own account and completes the transaction', () => {
    resetState({
      transactions: [
        {
          id: 'tx-dep-1',
          memberId: 'mem-A',
          date: '2024-01-01',
          type: 'DEPOSIT',
          description: 'Counter deposit',
          amount: 700,
          referenceNo: 'DEP-1',
          status: 'PENDING',
        },
      ],
    });

    useCoopStore.getState().confirmPendingDeposit('tx-dep-1');

    expect(savingsBalance('SAV-A1')).toBe(1700);
    expect(savingsBalance('SAV-A2')).toBe(2000);
    expect(memberById('mem-A')?.totalSavings).toBe(3700);
    expect(useCoopStore.getState().transactions[0].status).toBe('COMPLETED');
  });

  it('hard-fails when the depositor has no savings account (never credits savings[0])', () => {
    resetState({
      transactions: [
        {
          id: 'tx-dep-orphan',
          memberId: 'mem-C',
          date: '2024-01-01',
          type: 'DEPOSIT',
          description: 'Deposit for member with no account',
          amount: 9999,
          referenceNo: 'DEP-ORPHAN',
          status: 'PENDING',
        },
      ],
    });

    useCoopStore.getState().confirmPendingDeposit('tx-dep-orphan');

    // No account was credited at all — least of all savings[0] (SAV-A1).
    expect(savingsBalance('SAV-A1')).toBe(1000);
    expect(savingsBalance('SAV-A2')).toBe(2000);
    expect(savingsBalance('SAV-B1')).toBe(5000);
    expect(memberById('mem-C')?.totalSavings).toBe(0);
    expect(memberById('mem-A')?.totalSavings).toBe(3000);
    // The deposit stays pending for manual resolution.
    expect(useCoopStore.getState().transactions[0].status).toBe('PENDING');
  });
});

describe('A2 executeSingleMemberDividend — entitlement-derived payout', () => {
  beforeEach(() => resetState());

  it('rejects a caller-supplied amount above the accrued entitlement and changes nothing', () => {
    resetState({ members: [MEMBER_B], savings: [SAV_B1] });

    const res = useCoopStore.getState().executeSingleMemberDividend({
      memberId: 'mem-B',
      amount: 999999,
      deductTax: true,
      destination: 'SAVINGS',
      savingsAccountNo: 'SAV-B1',
    });

    expect(res.netAmount).toBe(0);
    expect(res.transactionRef).toBe('');
    expect(savingsBalance('SAV-B1')).toBe(5000);
    expect(memberById('mem-B')?.accruedDividend).toBe(14500);
    expect(useCoopStore.getState().transactions).toHaveLength(0);
  });

  it('rejects a payout above the 18% statutory ceiling when nothing is accrued', () => {
    const noAccrual = buildMember({ id: 'mem-D', memberNo: 'UK-D', shareCapital: 100000, accruedDividend: 0 });
    resetState({ members: [noAccrual], savings: [savingsAccount('SAV-D1', 'mem-D', 0)] });

    // 18,000 is the ceiling; 18,500 must be rejected even though it is < 18% + misc.
    const res = useCoopStore.getState().executeSingleMemberDividend({
      memberId: 'mem-D',
      amount: 18500,
      deductTax: true,
      destination: 'SAVINGS',
      savingsAccountNo: 'SAV-D1',
    });

    expect(res.netAmount).toBe(0);
    expect(savingsBalance('SAV-D1')).toBe(0);
  });

  it('pays within the entitlement, credits one account and reduces the accrual by gross', () => {
    resetState({ members: [MEMBER_B], savings: [SAV_B1] });

    const res = useCoopStore.getState().executeSingleMemberDividend({
      memberId: 'mem-B',
      amount: 14500,
      deductTax: true,
      destination: 'SAVINGS',
      savingsAccountNo: 'SAV-B1',
    });

    expect(res.taxDeducted).toBe(725);
    expect(res.netAmount).toBe(13775);
    expect(savingsBalance('SAV-B1')).toBe(5000 + 13775);
    expect(memberById('mem-B')?.accruedDividend).toBe(0);
    expect(useCoopStore.getState().transactions[0].type).toBe('DIVIDEND');
  });

  it('refuses a SAVINGS payout when the member has no matching account, preserving the accrual (A2/A5)', () => {
    resetState({ members: [MEMBER_C], savings: [] });

    const res = useCoopStore.getState().executeSingleMemberDividend({
      memberId: 'mem-C',
      amount: 5000,
      deductTax: false,
      destination: 'SAVINGS',
    });

    expect(res.netAmount).toBe(0);
    expect(memberById('mem-C')?.accruedDividend).toBe(5000);
    expect(useCoopStore.getState().transactions).toHaveLength(0);
  });
});

describe('A3 settleWarehouseReceipt — exactly one credit + idempotency', () => {
  beforeEach(() => resetState());

  it('credits only one of the member\'s savings accounts and is idempotent', () => {
    const receipt = buildReceipt({ status: 'PLEDGED' });
    resetState({ warehouseReceipts: [receipt], warehousePledgeLoans: [pledgeLoan()] });

    const params = {
      receipt,
      pledgeLoan: pledgeLoan(),
      actualSaleRatePerQuintal: 4000,
      saleDate: '2081-09-15',
      buyerName: 'Dang Food Industries',
    };

    const result = useCoopStore.getState().settleWarehouseReceipt(params, 3);
    expect(result.netSurplusPayableToMember).toBeGreaterThan(0);

    const credited = result.netSurplusPayableToMember;
    expect(savingsBalance('SAV-A1')).toBe(1000 + credited);
    expect(savingsBalance('SAV-A2')).toBe(2000); // second account untouched
    expect(memberById('mem-A')?.activeLoanBalance).toBe(49000);

    const txCount = useCoopStore.getState().transactions.length;
    expect(txCount).toBeGreaterThan(0);

    // Re-running the settlement must not credit again.
    useCoopStore.getState().settleWarehouseReceipt(params, 3);
    expect(savingsBalance('SAV-A1')).toBe(1000 + credited);
    expect(useCoopStore.getState().transactions.length).toBe(txCount);
  });
});

describe('A4 disbursePledgeLoan — guards and booking', () => {
  beforeEach(() => resetState());

  it('disburses once, books LOAN_DISBURSEMENT and refuses a second disbursement', () => {
    const receipt = buildReceipt({ status: 'STORED' });
    resetState({ warehouseReceipts: [receipt] });

    const loan = useCoopStore.getState().disbursePledgeLoan({
      receiptId: 'whr-test',
      principalAmount: 40000,
      savingsAccountNo: 'SAV-A1',
      tenureMonths: 6,
    });

    expect(loan.principalDisbursed).toBe(40000);
    expect(savingsBalance('SAV-A1')).toBe(41000);
    expect(memberById('mem-A')?.activeLoanBalance).toBe(90000);

    const tx = useCoopStore.getState().transactions[0];
    expect(tx.type).toBe('LOAN_DISBURSEMENT');

    // Second attempt must throw and must not credit again.
    expect(() =>
      useCoopStore.getState().disbursePledgeLoan({
        receiptId: 'whr-test',
        principalAmount: 40000,
        savingsAccountNo: 'SAV-A1',
      })
    ).toThrow(/STORED|already has an active/i);
    expect(savingsBalance('SAV-A1')).toBe(41000);
  });

  it('rejects a principal above the receipt\'s permitted LTV ceiling', () => {
    const receipt = buildReceipt({ status: 'STORED', maxEligiblePledgeLoanAmount: 60375 });
    resetState({ warehouseReceipts: [receipt] });

    expect(() =>
      useCoopStore.getState().disbursePledgeLoan({
        receiptId: 'whr-test',
        principalAmount: 70000,
        savingsAccountNo: 'SAV-A1',
      })
    ).toThrow(/ceiling/i);
    expect(savingsBalance('SAV-A1')).toBe(1000);
  });

  it('rejects a savings account that does not belong to the receipt owner', () => {
    const receipt = buildReceipt({ status: 'STORED' });
    resetState({ warehouseReceipts: [receipt] });

    expect(() =>
      useCoopStore.getState().disbursePledgeLoan({
        receiptId: 'whr-test',
        principalAmount: 40000,
        savingsAccountNo: 'SAV-B1',
      })
    ).toThrow(/belong/i);
    expect(savingsBalance('SAV-B1')).toBe(5000);
  });

  it('rejects disbursement on a receipt that is not STORED', () => {
    const receipt = buildReceipt({ status: 'LIQUIDATED_SOLD' });
    resetState({ warehouseReceipts: [receipt] });

    expect(() =>
      useCoopStore.getState().disbursePledgeLoan({
        receiptId: 'whr-test',
        principalAmount: 1000,
        savingsAccountNo: 'SAV-A1',
      })
    ).toThrow(/STORED/i);
  });
});

describe('A5 claimMemberDividend — entitlement never silently zeroed', () => {
  beforeEach(() => resetState());

  it('preserves accruedDividend when no savings account matched', () => {
    resetState({ members: [MEMBER_C], savings: [] });

    const res = useCoopStore.getState().claimMemberDividend({
      memberId: 'mem-C',
      destination: 'SAVINGS',
    });

    expect(res.success).toBe(false);
    expect(res.amountClaimed).toBe(0);
    expect(memberById('mem-C')?.accruedDividend).toBe(5000);
    expect(useCoopStore.getState().transactions).toHaveLength(0);
  });

  it('zeros the accrual only after a confirmed savings credit', () => {
    const member = buildMember({ id: 'mem-A', accruedDividend: 3000, shareCapital: 100000 });
    resetState({ members: [member], savings: [SAV_A1] });

    const res = useCoopStore.getState().claimMemberDividend({
      memberId: 'mem-A',
      destination: 'SAVINGS',
      savingsAccountNo: 'SAV-A1',
    });

    expect(res.success).toBe(true);
    expect(res.amountClaimed).toBe(3000);
    expect(savingsBalance('SAV-A1')).toBe(4000);
    expect(memberById('mem-A')?.accruedDividend).toBe(0);
  });
});

describe('A6 releaseWarehouseReceiptCrop — retires the pledge liability', () => {
  beforeEach(() => resetState());

  it('reduces activeLoanBalance through the repayment arithmetic and is idempotent', () => {
    const receipt = buildReceipt({ status: 'PLEDGED' });
    resetState({ warehouseReceipts: [receipt], warehousePledgeLoans: [pledgeLoan()] });

    useCoopStore.getState().releaseWarehouseReceiptCrop('whr-test', 'Crop returned');

    expect(memberById('mem-A')?.activeLoanBalance).toBe(49000);
    expect(useCoopStore.getState().warehouseReceipts[0].status).toBe('RELEASED');
    expect(useCoopStore.getState().warehousePledgeLoans[0].status).toBe('SETTLED');
    expect(useCoopStore.getState().transactions[0].type).toBe('LOAN_EMI');

    // Idempotent: a second release must not reduce the balance again.
    useCoopStore.getState().releaseWarehouseReceiptCrop('whr-test');
    expect(memberById('mem-A')?.activeLoanBalance).toBe(49000);
  });
});

describe('A7 bulk dividend — rate ceiling, surplus cap and fiscal-year lock', () => {
  beforeEach(() => resetState({ members: [MEMBER_A, MEMBER_B], savings: [SAV_A1, SAV_B1] }));

  it('rejects a rate above the 18% statutory ceiling', () => {
    expect(() =>
      useCoopStore.getState().executeBulkDividendDistribution({
        ratePercent: 18.5,
        fiscalYear: '2081/82',
        destination: 'SAVINGS',
      })
    ).toThrow(/18%/);
    expect(savingsBalance('SAV-A1')).toBe(1000);
  });

  it('rejects a non-positive rate', () => {
    expect(() =>
      useCoopStore.getState().executeBulkDividendDistribution({
        ratePercent: 0,
        fiscalYear: '2081/82',
        destination: 'SAVINGS',
      })
    ).toThrow(/Invalid dividend rate/);
  });

  it('distributes once per fiscal year and rejects a replay', () => {
    const summary = useCoopStore.getState().executeBulkDividendDistribution({
      ratePercent: 12,
      fiscalYear: '2081/82',
      destination: 'SAVINGS',
    });

    expect(summary.totalGross).toBe(24000);
    const afterFirstA = savingsBalance('SAV-A1');
    const afterFirstB = savingsBalance('SAV-B1');
    expect(afterFirstA).toBeGreaterThan(1000);
    expect(afterFirstB).toBeGreaterThan(5000);

    expect(() =>
      useCoopStore.getState().executeBulkDividendDistribution({
        ratePercent: 12,
        fiscalYear: '2081/82',
        destination: 'SAVINGS',
      })
    ).toThrow(/already been executed/i);

    expect(savingsBalance('SAV-A1')).toBe(afterFirstA);
    expect(savingsBalance('SAV-B1')).toBe(afterFirstB);

    // A different fiscal year is a different period and remains available.
    const next = useCoopStore.getState().executeBulkDividendDistribution({
      ratePercent: 5,
      fiscalYear: '2082/83',
      destination: 'SAVINGS',
    });
    expect(next.totalGross).toBe(10000);
  });

  it('caps aggregate gross at the distributable surplus', () => {
    resetState({
      members: [MEMBER_A, MEMBER_B],
      savings: [SAV_A1, SAV_B1],
      sharePool: sharePool({ totalReserveFund: 100 }),
    });

    expect(() =>
      useCoopStore.getState().executeBulkDividendDistribution({
        ratePercent: 12,
        fiscalYear: '2081/82',
        destination: 'SAVINGS',
      })
    ).toThrow(/distributable surplus/i);
    expect(savingsBalance('SAV-A1')).toBe(1000);
  });
});
