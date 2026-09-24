import { describe, it, expect } from 'vitest';
import {
  LoginSchema,
  CreateEmployeeSchema,
  UpdateEmployeeSchema,
  CreateMemberSchema,
  UpdateMemberSchema,
  CreateLoanApplicationSchema,
  CreateSavingsAccountSchema,
  CreateTransactionSchema,
  CreateInquirySchema,
} from '../index';

describe('Auth Schemas', () => {
  it('validates correct login credentials', () => {
    const valid = { email: 'officer@unako.coop.np', password: 'password123' };
    const result = LoginSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const invalid = { email: 'not-an-email', password: 'password123' };
    const result = LoginSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('rejects short password', () => {
    const invalid = { email: 'test@unako.coop.np', password: '123' };
    const result = LoginSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});

describe('Employee Schemas', () => {
  const validEmployee = {
    employeeNo: 'EMP-001',
    name: 'Sita Sharma',
    nameNepali: 'सीता शर्मा',
    designation: 'Senior Loan Officer',
    department: 'Credit',
    branch: 'Birtamode',
    phone: '9841234567',
    email: 'sita@unako.coop.np',
    joinedDate: '2023-01-15',
    status: 'ACTIVE' as const,
    accessRole: 'LOAN_OFFICER' as const,
    avatarUrl: 'https://example.com/avatar.jpg',
  };

  it('validates a valid employee creation payload', () => {
    const result = CreateEmployeeSchema.safeParse(validEmployee);
    expect(result.success).toBe(true);
  });

  it('rejects missing required fields', () => {
    const invalid = { name: 'Incomplete' };
    const result = CreateEmployeeSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('rejects invalid email and phone in employee', () => {
    const invalid = {
      ...validEmployee,
      email: 'invalid-email',
      phone: '123',
    };
    const result = CreateEmployeeSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('validates partial employee update', () => {
    const update = { designation: 'Branch Manager', status: 'ON_LEAVE' as const };
    const result = UpdateEmployeeSchema.safeParse(update);
    expect(result.success).toBe(true);
  });
});

describe('Member Schemas', () => {
  const validMember = {
    memberNo: 'UK-1001',
    name: 'Ram Bahadur',
    email: 'ram@gmail.com',
    phone: '9800000000',
    citizenshipNo: '12-01-78-12345',
    joinedDate: '2023-05-10',
    address: 'Mechinagar-06, Jhapa',
    status: 'VERIFIED' as const,
    avatarUrl: 'https://example.com/avatar.jpg',
    shareCapital: 10000,
    totalSavings: 25000,
    activeLoanBalance: 0,
    accruedDividend: 500,
    creditScore: 720,
    bankDetails: {
      bankName: 'Nabil Bank',
      accountNo: '01234567890123',
      branch: 'Damak',
      holderName: 'Ram Bahadur',
    },
    kycDocuments: {
      citizenshipFront: true,
      citizenshipBack: true,
      photo: true,
      signature: true,
      utilityBill: false,
    },
  };

  it('validates a complete valid member payload', () => {
    const result = CreateMemberSchema.safeParse(validMember);
    expect(result.success).toBe(true);
  });

  it('rejects negative share capital or credit score out of range', () => {
    const invalid = {
      ...validMember,
      shareCapital: -100,
      creditScore: 950,
    };
    const result = CreateMemberSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('validates partial member update', () => {
    const update = { phone: '9811111111', totalSavings: 30000 };
    const result = UpdateMemberSchema.safeParse(update);
    expect(result.success).toBe(true);
  });
});

describe('Financial Schemas', () => {
  it('validates valid loan application', () => {
    const loanApp = {
      memberId: 'mem-123',
      loanSchemeId: 'scheme-agri',
      requestedAmount: 150000,
      purpose: 'Agriculture input, seeds, and fertilizer purchase',
      requestedTermMonths: 12,
    };
    const result = CreateLoanApplicationSchema.safeParse(loanApp);
    expect(result.success).toBe(true);
  });

  it('rejects loan application with zero amount or negative tenure', () => {
    const invalid = {
      memberId: 'mem-123',
      loanSchemeId: 'scheme-agri',
      requestedAmount: 0,
      purpose: 'Too short',
      requestedTermMonths: 0,
    };
    const result = CreateLoanApplicationSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('validates savings account creation', () => {
    const savings = {
      memberId: 'mem-123',
      accountNo: 'SAV-00123',
      accountType: 'Regular Voluntary Savings',
      balance: 5000,
      interestRate: 7.5,
      status: 'ACTIVE' as const,
      openedDate: '2023-01-01',
    };
    const result = CreateSavingsAccountSchema.safeParse(savings);
    expect(result.success).toBe(true);
  });

  it('validates transaction creation', () => {
    const txn = {
      memberId: 'mem-123',
      accountId: 'SAV-00123',
      type: 'DEPOSIT' as const,
      amount: 2000,
      description: 'Monthly savings deposit',
      reference: 'TXN-998811',
    };
    const result = CreateTransactionSchema.safeParse(txn);
    expect(result.success).toBe(true);
  });

  it('validates public inquiry and rejects short message', () => {
    const validInquiry = {
      name: 'Hari Prasad',
      email: 'hari@yahoo.com',
      phone: '9840000000',
      subject: 'Inquiry on micro-loan scheme',
      message: 'I want to inquire about loan schemes for poultry farm in Jhapa.',
      category: 'LOAN' as const,
    };
    expect(CreateInquirySchema.safeParse(validInquiry).success).toBe(true);

    const invalidInquiry = {
      ...validInquiry,
      message: 'Hi',
    };
    expect(CreateInquirySchema.safeParse(invalidInquiry).success).toBe(false);
  });
});
