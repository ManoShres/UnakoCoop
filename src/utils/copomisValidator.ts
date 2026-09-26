/**
 * COPOMIS (Cooperative Management Information System) Pre-Submission Audit & Compliance Validator
 * Standards: Nepal Cooperative Act 2074, Department of Cooperatives (सहकारी विभाग) COPOMIS Schema v2.5
 */

import { Member, SavingsAccount, Loan, CoopSettings } from '../types';

export interface CopomisValidationError {
  id: string;
  severity: 'FATAL' | 'WARNING' | 'INFO';
  category: 'INSTITUTION' | 'MEMBER' | 'SAVINGS' | 'LOAN';
  recordId?: string;
  recordIdentifier?: string; // e.g. Member No, Account No, Loan No
  recordName?: string;
  field: string;
  message: string;
  messageNepali: string;
}

export interface CopomisGenderStats {
  female: number;
  male: number;
  other: number;
  femalePercent: number;
}

export interface CopomisAuditSummary {
  totalMembers: number;
  verifiedMembers: number;
  pendingMembers: number;
  genderStats: CopomisGenderStats;
  totalShareCapital: number;
  totalShareUnits: number;
  totalSavingsBalance: number;
  totalLoansOutstanding: number;
  activeLoanCount: number;
  nplRatio: number; // Non-Performing Loans %
  complianceScore: number; // 0 to 100%
  fatalErrorCount: number;
  warningCount: number;
  infoCount: number;
  isReadyForSubmission: boolean;
}

export interface CopomisValidationResult {
  isValid: boolean;
  errors: CopomisValidationError[];
  summary: CopomisAuditSummary;
  timestamp: string;
}

export interface CopomisValidationInput {
  coopSettings: CoopSettings;
  members: Member[];
  savings: SavingsAccount[];
  loans: Loan[];
  fiscalYear?: string;
}

/**
 * Validates whether a mobile number matches standard Nepali telecom numbering
 * (10 digits starting with 98 or 97, or 96)
 */
export function isValidNepaliMobile(phone?: string): boolean {
  if (!phone) return false;
  const cleaned = phone.replace(/[\s\-+]/g, '');
  // Handles +97798XXXXXXXX or 98XXXXXXXX
  const localNum = cleaned.startsWith('977') ? cleaned.slice(3) : cleaned;
  return /^(98|97|96)\d{8}$/.test(localNum);
}

/**
 * Validates Nepali PAN format (9 numeric digits)
 */
export function isValidNepaliPan(pan?: string): boolean {
  if (!pan) return false;
  const cleaned = pan.replace(/[\s\-]/g, '');
  return /^\d{9}$/.test(cleaned);
}

/**
 * Performs rigorous pre-submission verification for COPOMIS statutory upload
 */
export function validateCopomisData(input: CopomisValidationInput): CopomisValidationResult {
  const { coopSettings, members, savings, loans } = input;
  const errors: CopomisValidationError[] = [];

  let errorSeq = 1;
  const addError = (
    err: Omit<CopomisValidationError, 'id'>
  ) => {
    errors.push({
      ...err,
      id: `COP-VAL-${String(errorSeq++).padStart(4, '0')}`,
    });
  };

  // -------------------------------------------------------------
  // 1. INSTITUTION CHECKS
  // -------------------------------------------------------------
  if (!coopSettings.regNo || coopSettings.regNo.trim().length === 0) {
    addError({
      severity: 'FATAL',
      category: 'INSTITUTION',
      field: 'regNo',
      message: 'Cooperative Registration Number is missing.',
      messageNepali: 'सहकारी दर्ता नम्बर अनिवार्य छ।',
    });
  }

  if (!coopSettings.panNo || !isValidNepaliPan(coopSettings.panNo)) {
    addError({
      severity: 'FATAL',
      category: 'INSTITUTION',
      field: 'panNo',
      message: `Invalid or missing 9-digit PAN number: "${coopSettings.panNo || ''}".`,
      messageNepali: 'सहकारीको ९ अंकको स्थायी लेखा नम्बर (PAN) अमान्य वा रिक्त छ।',
    });
  }

  if (!coopSettings.name || coopSettings.name.trim().length < 3) {
    addError({
      severity: 'FATAL',
      category: 'INSTITUTION',
      field: 'name',
      message: 'Cooperative English name is missing or too short.',
      messageNepali: 'सहकारीको अंग्रेजी नाम छुटेको वा अपूर्ण छ।',
    });
  }

  // -------------------------------------------------------------
  // 2. MEMBER CHECKS
  // -------------------------------------------------------------
  const seenMemberNos = new Set<string>();
  const seenCitizenshipNos = new Set<string>();
  const memberIdSet = new Set<string>();

  let femaleCount = 0;
  let maleCount = 0;
  let otherGenderCount = 0;
  let verifiedCount = 0;
  let totalShareCapital = 0;
  let totalSavingsBalance = 0;

  members.forEach((m) => {
    memberIdSet.add(m.id);
    totalShareCapital += m.shareCapital || 0;
    totalSavingsBalance += m.totalSavings || 0;

    if (m.status === 'VERIFIED') verifiedCount++;

    // Gender aggregation
    const genderUpper = (m.gender || '').toUpperCase();
    if (genderUpper === 'FEMALE') {
      femaleCount++;
    } else if (genderUpper === 'MALE') {
      maleCount++;
    } else {
      otherGenderCount++;
    }

    // Member No
    if (!m.memberNo || m.memberNo.trim().length === 0) {
      addError({
        severity: 'FATAL',
        category: 'MEMBER',
        recordId: m.id,
        recordIdentifier: 'UNKNOWN',
        recordName: m.name,
        field: 'memberNo',
        message: `Member "${m.name}" does not have a member code assigned.`,
        messageNepali: `सदस्य "${m.name}" को सदस्य नम्बर छुटेको छ।`,
      });
    } else if (seenMemberNos.has(m.memberNo.trim())) {
      addError({
        severity: 'FATAL',
        category: 'MEMBER',
        recordId: m.id,
        recordIdentifier: m.memberNo,
        recordName: m.name,
        field: 'memberNo',
        message: `Duplicate Member Code detected: ${m.memberNo}.`,
        messageNepali: `दोहोरिएको सदस्य नम्बर भेटियो: ${m.memberNo}।`,
      });
    } else {
      seenMemberNos.add(m.memberNo.trim());
    }

    // Full Name
    if (!m.name || m.name.trim().length < 3) {
      addError({
        severity: 'FATAL',
        category: 'MEMBER',
        recordId: m.id,
        recordIdentifier: m.memberNo,
        recordName: m.name,
        field: 'name',
        message: `Member name is required and must be at least 3 characters.`,
        messageNepali: `सदस्यको नाम अनिवार्य र कम्तिमा ३ अक्षरको हुनुपर्दछ।`,
      });
    }

    // Citizenship No
    const citizenNo = (m.citizenshipNo || '').trim();
    if (!citizenNo || citizenNo.toUpperCase() === 'N/A' || citizenNo.length < 3) {
      addError({
        severity: 'FATAL',
        category: 'MEMBER',
        recordId: m.id,
        recordIdentifier: m.memberNo,
        recordName: m.name,
        field: 'citizenshipNo',
        message: `Statutory Citizenship Number missing for member "${m.name}".`,
        messageNepali: `सदस्य "${m.name}" को नागरिकता नम्बर छुटेको छ।`,
      });
    } else if (seenCitizenshipNos.has(citizenNo)) {
      addError({
        severity: 'FATAL',
        category: 'MEMBER',
        recordId: m.id,
        recordIdentifier: m.memberNo,
        recordName: m.name,
        field: 'citizenshipNo',
        message: `Duplicate Citizenship Number detected: ${citizenNo}.`,
        messageNepali: `दोहोरिएको नागरिकता नम्बर भेटियो: ${citizenNo}।`,
      });
    } else {
      seenCitizenshipNos.add(citizenNo);
    }

    // Share Capital multiple check (रु. १०० प्रति कित्ता)
    if (m.shareCapital < 0 || m.shareCapital % 100 !== 0) {
      addError({
        severity: 'FATAL',
        category: 'MEMBER',
        recordId: m.id,
        recordIdentifier: m.memberNo,
        recordName: m.name,
        field: 'shareCapital',
        message: `Share Capital (NPR ${m.shareCapital}) must be a positive multiple of 100.`,
        messageNepali: `सेयर पुँजी (रु. ${m.shareCapital}) रु. १०० को गुणक हुनुपर्छ।`,
      });
    }

    // Mobile Phone Check
    if (!m.phone || !isValidNepaliMobile(m.phone)) {
      addError({
        severity: 'WARNING',
        category: 'MEMBER',
        recordId: m.id,
        recordIdentifier: m.memberNo,
        recordName: m.name,
        field: 'phone',
        message: `Non-standard mobile number "${m.phone || ''}". Expected 10-digit Nepali mobile (98/97...).`,
        messageNepali: `अमान्य वा छुटेको मोबाइल नम्बर "${m.phone || ''}"।`,
      });
    }

    // Ward Number Check
    if (!m.wardNo && (!m.address || !m.address.match(/\b(?:ward|वडा)?\s*\d+\b/i))) {
      addError({
        severity: 'WARNING',
        category: 'MEMBER',
        recordId: m.id,
        recordIdentifier: m.memberNo,
        recordName: m.name,
        field: 'wardNo',
        message: `Ward number / local jurisdiction missing for member "${m.name}".`,
        messageNepali: `सदस्य "${m.name}" को वडा नम्बर वा स्थानीय ठेगाना स्पष्ट छैन।`,
      });
    }

    // National ID check (COPOMIS 2.0 recommendation)
    if (!m.nationalIdNo) {
      addError({
        severity: 'INFO',
        category: 'MEMBER',
        recordId: m.id,
        recordIdentifier: m.memberNo,
        recordName: m.name,
        field: 'nationalIdNo',
        message: `National Identity Number (राष्ट्रिय परिचयपत्र) not linked yet.`,
        messageNepali: `राष्ट्रिय परिचयपत्र नम्बर अझै प्रविष्ट गरिएको छैन।`,
      });
    }
  });

  // -------------------------------------------------------------
  // 3. SAVINGS ACCOUNT CHECKS
  // -------------------------------------------------------------
  const seenSavingAccNos = new Set<string>();

  savings.forEach((s) => {
    if (!s.accountNo || seenSavingAccNos.has(s.accountNo.trim())) {
      addError({
        severity: 'FATAL',
        category: 'SAVINGS',
        recordId: s.id,
        recordIdentifier: s.accountNo,
        field: 'accountNo',
        message: `Duplicate or empty savings account number: ${s.accountNo}.`,
        messageNepali: `दोहोरिएको वा खाली बचत खाता नम्बर: ${s.accountNo}।`,
      });
    } else {
      seenSavingAccNos.add(s.accountNo.trim());
    }

    if (s.balance < 0) {
      addError({
        severity: 'FATAL',
        category: 'SAVINGS',
        recordId: s.id,
        recordIdentifier: s.accountNo,
        field: 'balance',
        message: `Savings account balance cannot be negative (${s.balance}).`,
        messageNepali: `बचत खाताको मौज्दात ऋणात्मक हुन सक्दैन (${s.balance})।`,
      });
    }

    if (s.memberId && !memberIdSet.has(s.memberId)) {
      addError({
        severity: 'FATAL',
        category: 'SAVINGS',
        recordId: s.id,
        recordIdentifier: s.accountNo,
        field: 'memberId',
        message: `Savings account ${s.accountNo} references non-existent member ID "${s.memberId}".`,
        messageNepali: `बचत खाता ${s.accountNo} ले अस्तित्वमा नभएको सदस्य संकेत गर्दछ।`,
      });
    }
  });

  // -------------------------------------------------------------
  // 4. LOAN CHECKS & NPL CALCULATION
  // -------------------------------------------------------------
  const seenLoanNos = new Set<string>();
  let totalLoanOutstanding = 0;
  let nonPerformingLoanBalance = 0;

  loans.forEach((l) => {
    totalLoanOutstanding += l.remainingBalance || 0;

    if (!l.loanNo || seenLoanNos.has(l.loanNo.trim())) {
      addError({
        severity: 'FATAL',
        category: 'LOAN',
        recordId: l.id,
        recordIdentifier: l.loanNo,
        field: 'loanNo',
        message: `Duplicate or missing loan number: ${l.loanNo}.`,
        messageNepali: `दोहोरिएको वा छुटेको ऋण नम्बर: ${l.loanNo}।`,
      });
    } else {
      seenLoanNos.add(l.loanNo.trim());
    }

    if (l.remainingBalance < 0) {
      addError({
        severity: 'FATAL',
        category: 'LOAN',
        recordId: l.id,
        recordIdentifier: l.loanNo,
        field: 'remainingBalance',
        message: `Remaining loan balance cannot be negative (${l.remainingBalance}).`,
        messageNepali: `बाँकी ऋण रकम ऋणात्मक हुन सक्दैन (${l.remainingBalance})।`,
      });
    }

    if (l.memberId && !memberIdSet.has(l.memberId)) {
      addError({
        severity: 'FATAL',
        category: 'LOAN',
        recordId: l.id,
        recordIdentifier: l.loanNo,
        field: 'memberId',
        message: `Loan ledger ${l.loanNo} references non-existent member ID "${l.memberId}".`,
        messageNepali: `ऋण खाता ${l.loanNo} ले अस्तित्वमा नभएको सदस्य संकेत गर्दछ।`,
      });
    }

    // NPL identification (loans marked OVERDUE)
    if (l.status === 'OVERDUE') {
      nonPerformingLoanBalance += l.remainingBalance;
    }
  });

  // -------------------------------------------------------------
  // 5. SUMMARY METRICS & COMPLIANCE SCORE
  // -------------------------------------------------------------
  const fatalErrorCount = errors.filter((e) => e.severity === 'FATAL').length;
  const warningCount = errors.filter((e) => e.severity === 'WARNING').length;
  const infoCount = errors.filter((e) => e.severity === 'INFO').length;

  const totalMembers = members.length;
  const femalePercent = totalMembers > 0 ? (femaleCount / totalMembers) * 100 : 0;
  const nplRatio = totalLoanOutstanding > 0 ? (nonPerformingLoanBalance / totalLoanOutstanding) * 100 : 0;

  // Compliance score algorithm:
  // Starts at 100.
  // -6 points per fatal error (clamped at 0)
  // -1 point per warning (clamped at 0)
  const penalty = fatalErrorCount * 6 + warningCount * 1;
  const complianceScore = Math.max(0, Math.min(100, Math.round(100 - penalty)));

  const summary: CopomisAuditSummary = {
    totalMembers,
    verifiedMembers: verifiedCount,
    pendingMembers: totalMembers - verifiedCount,
    genderStats: {
      female: femaleCount,
      male: maleCount,
      other: otherGenderCount,
      femalePercent: Number(femalePercent.toFixed(1)),
    },
    totalShareCapital,
    totalShareUnits: Math.floor(totalShareCapital / 100),
    totalSavingsBalance,
    totalLoansOutstanding: totalLoanOutstanding,
    activeLoanCount: loans.filter((l) => l.status === 'ACTIVE' || l.status === 'OVERDUE').length,
    nplRatio: Number(nplRatio.toFixed(2)),
    complianceScore,
    fatalErrorCount,
    warningCount,
    infoCount,
    isReadyForSubmission: fatalErrorCount === 0,
  };

  return {
    isValid: fatalErrorCount === 0,
    errors,
    summary,
    timestamp: new Date().toISOString(),
  };
}
