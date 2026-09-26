import { describe, it, expect } from 'vitest';
import { validateCopomisData, isValidNepaliMobile, isValidNepaliPan } from '../copomisValidator';
import { generateCopomisXml, generateCopomisJson, generateCopomisCsv } from '../copomisExport';
import { Member, SavingsAccount, Loan, CoopSettings } from '../../types';

describe('COPOMIS Regulatory Compliance & Export Validator', () => {
  const mockCoopSettings: CoopSettings = {
    name: 'Unako Saving and Credit Cooperative Ltd.',
    nameNepali: 'उनको बचत तथा ऋण सहकारी संस्था लि.',
    regNo: '234/065/066',
    panNo: '302847591',
    address: 'Gadhwa-5, Dang, Lumbini, Nepal',
    phone: '+977-82-540123',
    email: 'info@unako.org.np',
    openingHours: '10:00 AM - 4:00 PM',
    operatingStatus: 'NORMAL',
  };

  const mockMembers: Member[] = [
    {
      id: 'm-1',
      memberNo: 'UK-1001',
      name: 'Radha Chaudhary',
      nameNepali: 'राधा चौधरी',
      email: 'radha@example.com',
      phone: '9847123456',
      citizenshipNo: '12-01-75-01234',
      joinedDate: '2075-01-10',
      address: 'Gadhwa Ward 5, Dang',
      wardNo: '5',
      district: 'Dang',
      gender: 'FEMALE',
      status: 'VERIFIED',
      avatarUrl: '',
      shareCapital: 10000,
      totalSavings: 25000,
      activeLoanBalance: 50000,
      accruedDividend: 800,
      creditScore: 780,
      bankDetails: { bankName: '', accountNo: '', branch: '', holderName: '' },
      kycDocuments: { citizenshipFront: true, citizenshipBack: true, photo: true, signature: true, utilityBill: true },
    },
    {
      id: 'm-2',
      memberNo: 'UK-1002',
      name: 'Sunita Pun Magar',
      nameNepali: 'सुनिता पुन मगर',
      email: 'sunita@example.com',
      phone: '9857890123',
      citizenshipNo: '12-01-76-04567',
      nationalIdNo: 'NID-88291039',
      joinedDate: '2076-02-15',
      address: 'Gadhwa-5, Dang',
      wardNo: '5',
      district: 'Dang',
      gender: 'FEMALE',
      status: 'VERIFIED',
      avatarUrl: '',
      shareCapital: 5000,
      totalSavings: 15000,
      activeLoanBalance: 0,
      accruedDividend: 400,
      creditScore: 740,
      bankDetails: { bankName: '', accountNo: '', branch: '', holderName: '' },
      kycDocuments: { citizenshipFront: true, citizenshipBack: true, photo: true, signature: true, utilityBill: true },
    },
  ];

  const mockSavings: SavingsAccount[] = [
    {
      id: 'sav-1',
      memberId: 'm-1',
      accountNo: 'SAV-001-1001',
      accountType: 'Regular Savings',
      balance: 25000,
      interestRate: 7.5,
      status: 'ACTIVE',
      openedDate: '2075-01-10',
    },
    {
      id: 'sav-2',
      memberId: 'm-2',
      accountNo: 'SAV-001-1002',
      accountType: 'Regular Savings',
      balance: 15000,
      interestRate: 8.0,
      status: 'ACTIVE',
      openedDate: '2076-02-15',
    },
  ];

  const mockLoans: Loan[] = [
    {
      id: 'ln-1',
      memberId: 'm-1',
      loanNo: 'LN-001-1001',
      loanType: 'Agricultural & Livestock',
      principalAmount: 100000,
      remainingBalance: 50000,
      interestRate: 11.5,
      tenureMonths: 24,
      monthlyEmi: 4680,
      disbursedDate: '2078-01-15',
      nextDueDate: '2081-05-15',
      status: 'ACTIVE',
      collateralDescription: 'Group guarantee from Malika Mother Group',
    },
  ];

  describe('Format Validators', () => {
    it('validates 10-digit Nepali mobile numbers accurately', () => {
      expect(isValidNepaliMobile('9847123456')).toBe(true);
      expect(isValidNepaliMobile('+977 9857890123')).toBe(true);
      expect(isValidNepaliMobile('9741234567')).toBe(true);
      expect(isValidNepaliMobile('12345')).toBe(false);
      expect(isValidNepaliMobile('984123')).toBe(false);
      expect(isValidNepaliMobile('')).toBe(false);
    });

    it('validates 9-digit Nepali PAN numbers accurately', () => {
      expect(isValidNepaliPan('302847591')).toBe(true);
      expect(isValidNepaliPan('12345678')).toBe(false); // 8 digits
      expect(isValidNepaliPan('ABC456789')).toBe(false);
      expect(isValidNepaliPan('')).toBe(false);
    });
  });

  describe('COPOMIS Validation Engine', () => {
    it('validates clean data with high compliance score and zero fatal errors', () => {
      const result = validateCopomisData({
        coopSettings: mockCoopSettings,
        members: mockMembers,
        savings: mockSavings,
        loans: mockLoans,
      });

      expect(result.isValid).toBe(true);
      expect(result.summary.fatalErrorCount).toBe(0);
      expect(result.summary.isReadyForSubmission).toBe(true);
      expect(result.summary.totalMembers).toBe(2);
      expect(result.summary.genderStats.female).toBe(2);
      expect(result.summary.genderStats.femalePercent).toBe(100);
      expect(result.summary.totalShareCapital).toBe(15000);
      expect(result.summary.totalShareUnits).toBe(150); // 15,000 / 100
      expect(result.summary.nplRatio).toBe(0);
    });

    it('detects invalid share capital not divisible by 100 as FATAL', () => {
      const invalidMembers: Member[] = [
        {
          ...mockMembers[0],
          shareCapital: 10055, // Not divisible by 100
        },
      ];

      const result = validateCopomisData({
        coopSettings: mockCoopSettings,
        members: invalidMembers,
        savings: mockSavings,
        loans: mockLoans,
      });

      expect(result.isValid).toBe(false);
      expect(result.summary.fatalErrorCount).toBeGreaterThanOrEqual(1);
      const shareError = result.errors.find((e) => e.field === 'shareCapital');
      expect(shareError).toBeDefined();
      expect(shareError?.severity).toBe('FATAL');
    });

    it('flags missing or placeholder citizenship numbers as FATAL', () => {
      const invalidMembers: Member[] = [
        {
          ...mockMembers[0],
          citizenshipNo: 'N/A', // Placeholder
        },
      ];

      const result = validateCopomisData({
        coopSettings: mockCoopSettings,
        members: invalidMembers,
        savings: mockSavings,
        loans: mockLoans,
      });

      expect(result.isValid).toBe(false);
      const citError = result.errors.find((e) => e.field === 'citizenshipNo');
      expect(citError).toBeDefined();
      expect(citError?.severity).toBe('FATAL');
    });

    it('detects duplicate member codes and duplicate account numbers', () => {
      const duplicateMembers: Member[] = [
        mockMembers[0],
        { ...mockMembers[1], memberNo: mockMembers[0].memberNo }, // Duplicate
      ];

      const result = validateCopomisData({
        coopSettings: mockCoopSettings,
        members: duplicateMembers,
        savings: mockSavings,
        loans: mockLoans,
      });

      expect(result.isValid).toBe(false);
      const dupError = result.errors.find((e) => e.message.includes('Duplicate Member Code'));
      expect(dupError).toBeDefined();
    });

    it('correctly calculates NPL ratio for overdue/defaulted loans', () => {
      const loansWithNpl: Loan[] = [
        mockLoans[0], // 50,000 active
        {
          id: 'ln-2',
          memberId: 'm-2',
          loanNo: 'LN-002-1002',
          loanType: 'Small Business Enterprise',
          principalAmount: 50000,
          remainingBalance: 50000,
          interestRate: 12.0,
          tenureMonths: 12,
          monthlyEmi: 4500,
          disbursedDate: '2077-01-01',
          nextDueDate: '2078-01-01',
          status: 'OVERDUE',
          collateralDescription: 'Small business machinery pledge',
        },
      ];

      const result = validateCopomisData({
        coopSettings: mockCoopSettings,
        members: mockMembers,
        savings: mockSavings,
        loans: loansWithNpl,
      });

      // Total loan outstanding = 50,000 + 50,000 = 100,000. NPL = 50,000 (50%)
      expect(result.summary.totalLoansOutstanding).toBe(100000);
      expect(result.summary.nplRatio).toBe(50);
    });
  });

  describe('COPOMIS Export Generators', () => {
    it('generates valid COPOMIS XML schema v2.5 with demographic tags', () => {
      const xml = generateCopomisXml({
        coopSettings: mockCoopSettings,
        members: mockMembers,
        savings: mockSavings,
        loans: mockLoans,
        fiscalYear: '2081/82',
      });

      expect(xml).toContain('<COPOMIS_REGULATORY_SUBMISSION xmlns="urn:gov:np:cooperatives:copomis:v2.5">');
      expect(xml).toContain('<COOP_PAN>302847591</COOP_PAN>');
      expect(xml).toContain('<TOTAL_SHARE_KITTA>150</TOTAL_SHARE_KITTA>');
      expect(xml).toContain('<MEMBER_CODE>UK-1001</MEMBER_CODE>');
      expect(xml).toContain('<GENDER>FEMALE</GENDER>');
      expect(xml).toContain('<CITIZENSHIP_NO>12-01-75-01234</CITIZENSHIP_NO>');
      expect(xml).toContain('</COPOMIS_REGULATORY_SUBMISSION>');
    });

    it('generates valid JSON export with metadata and validated summary', () => {
      const jsonStr = generateCopomisJson({
        coopSettings: mockCoopSettings,
        members: mockMembers,
        savings: mockSavings,
        loans: mockLoans,
        fiscalYear: '2081/82',
      });

      const parsed = JSON.parse(jsonStr);
      expect(parsed.submissionMetadata.schemaVersion).toBe('2.5');
      expect(parsed.institution.regNo).toBe('234/065/066');
      expect(parsed.summary.totalMembers).toBe(2);
      expect(parsed.members.length).toBe(2);
      expect(parsed.savingsAccounts.length).toBe(2);
      expect(parsed.loans.length).toBe(1);
    });

    it('generates standard CSV with member records and share kitta', () => {
      const csv = generateCopomisCsv(mockMembers);
      expect(csv).toContain('Member Code,Full Name,Citizenship No');
      expect(csv).toContain('"UK-1001"');
      expect(csv).toContain('"Radha Chaudhary"');
      expect(csv).toContain('"FEMALE"');
    });
  });
});
