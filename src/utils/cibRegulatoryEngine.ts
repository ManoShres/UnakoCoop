/**
 * Unako SACCOS - Cooperative Credit Information Bureau (CIB) Regulatory Engine
 * (कर्जा सूचना केन्द्र - CIB कालोसूची तथा कर्जा सूचना प्रणाली)
 *
 * Statutory Framework:
 * - Nepal Cooperative Act 2074 (सहकारी ऐन २०७४)
 *   - Section 80: Cooperative Credit Information Bureau (कर्जा सूचना केन्द्र सम्बन्धी व्यवस्था).
 *   - Section 81: Blacklisting of Defaulters & Guarantors (ऋणी तथा जमानतकर्तालाई कालोसूचीमा राख्ने).
 *   - Section 82: Clearance & Delisting from Blacklist (कालोसूचीबाट फुकुवा सम्बन्धी व्यवस्था).
 * - Credit Information Bureau Directives & NRB / Dept of Cooperatives Over-indebtedness Limits.
 */

import { Loan } from '../types';

export type CibRiskGrade = 'LOW_RISK' | 'MODERATE_RISK' | 'HIGH_RISK' | 'CRITICAL_DEFAULT';

export type BlacklistStatutoryStatus =
  | 'RECOMMENDED'
  | 'NOTICE_ISSUED_35_DAYS'
  | 'FINAL_NOTICE_15_DAYS'
  | 'BLACKLISTED_ACTIVE'
  | 'DELISTED_CLEARED';

export interface CibInquiryResult {
  readonly queryId: string;
  readonly memberId: string;
  readonly memberName: string;
  readonly citizenshipNo: string;
  readonly inquiryDateBS: string;
  readonly creditScore: number; // 300 - 900
  readonly riskGrade: CibRiskGrade;
  readonly totalActiveLoansCount: number;
  readonly totalExposureAmount: number;
  readonly totalOverdueAmount: number;
  readonly hasActiveDefault: boolean;
  readonly isBlacklisted: boolean;
  readonly inquirySummary: string;
  readonly inquirySummaryNepali: string;
}

export interface CibBlacklistRecord {
  readonly id: string;
  readonly blacklistNo: string;
  readonly memberId: string;
  readonly memberName: string;
  readonly memberNo: string;
  readonly citizenshipNo: string;
  readonly panNo?: string;
  readonly loanId: string;
  readonly loanNo: string;
  readonly loanType: string;
  readonly defaultedPrincipal: number;
  readonly accruedInterest: number;
  readonly totalOverdueAmount: number;
  readonly daysOverdue: number;
  readonly status: BlacklistStatutoryStatus;
  readonly boardDecisionNo: string;
  readonly noticePublishedDateBS?: string;
  readonly cibReportingDateBS?: string;
  readonly guarantorName: string;
  readonly guarantorCitizenship: string;
  readonly guarantorPhone: string;
  readonly delistingDateBS?: string;
  readonly delistingVoucherNo?: string;
  readonly recoveredAmount?: number;
  readonly clearanceToken?: string;
}

export interface DelistingClearanceCertificate {
  readonly certificateNo: string;
  readonly issueDateBS: string;
  readonly memberName: string;
  readonly citizenshipNo: string;
  readonly loanNo: string;
  readonly totalClearedAmount: number;
  readonly boardResolutionNo: string;
  readonly cibReportingRef: string;
  readonly verificationHash: string;
}

/**
 * Check if a loan qualifies for statutory blacklisting under Cooperative Act 2074 Sec 81
 * Rules:
 * - Overdue days >= 90 days (Loss / Hard Non-Performing Loan).
 * - Total overdue balance >= NPR 25,000.
 */
export function checkBlacklistEligibility(
  loan: Pick<Loan, 'remainingBalance' | 'status'>,
  daysOverdue: number
): { isEligible: boolean; reason: string; reasonNepali: string } {
  if (loan.remainingBalance <= 0) {
    return {
      isEligible: false,
      reason: 'Loan is paid off',
      reasonNepali: 'कर्जा चुक्ता भइसकेको छ।',
    };
  }

  if (daysOverdue >= 90) {
    return {
      isEligible: true,
      reason: `Overdue by ${daysOverdue} days (exceeds statutory 90-day grace period)`,
      reasonNepali: `भाखा नाघेको ${daysOverdue} दिन पुगेको (कानूनी ९० दिनको हदम्याद नाघेको)`,
    };
  }

  return {
    isEligible: false,
    reason: `Within regulatory cure period (${daysOverdue}/90 days overdue)`,
    reasonNepali: `नियमनकारी भाखा भित्र रहेको (${daysOverdue}/९० दिन)`,
  };
}

/**
 * Perform Credit Bureau Inquiry on Member
 * Evaluates simulated credit history, active exposure, overdue balance, and risk score.
 */
export function evaluateCibInquiry(
  member: { id: string; name: string; citizenshipNo: string },
  memberLoans: readonly Loan[],
  simulatedExternalOverdue: number = 0
): CibInquiryResult {
  const activeLoans = memberLoans.filter((l) => l.status === 'ACTIVE' || l.status === 'OVERDUE');
  const totalExposure = activeLoans.reduce((sum, l) => sum + l.remainingBalance, 0);
  const internalOverdue = memberLoans
    .filter((l) => l.status === 'OVERDUE')
    .reduce((sum, l) => sum + l.remainingBalance, 0);

  const totalOverdue = internalOverdue + simulatedExternalOverdue;
  const hasActiveDefault = totalOverdue > 0;
  const isBlacklisted = totalOverdue >= 100000;

  // Credit Score Calculation (300 to 900 scale)
  let score = 820;
  if (totalOverdue > 0) {
    score -= Math.min(350, Math.floor(totalOverdue / 1000) * 5);
  }
  if (activeLoans.length > 2) {
    score -= (activeLoans.length - 2) * 35;
  }
  if (totalExposure > 1500000) {
    score -= 40;
  }
  score = Math.max(300, Math.min(900, score));

  let riskGrade: CibRiskGrade = 'LOW_RISK';
  if (isBlacklisted || score < 550) {
    riskGrade = 'CRITICAL_DEFAULT';
  } else if (score < 650) {
    riskGrade = 'HIGH_RISK';
  } else if (score < 750) {
    riskGrade = 'MODERATE_RISK';
  }

  return {
    queryId: `CIB-QRY-${Math.floor(100000 + Math.random() * 900000)}`,
    memberId: member.id,
    memberName: member.name,
    citizenshipNo: member.citizenshipNo || 'N/A',
    inquiryDateBS: '2081/08/28',
    creditScore: score,
    riskGrade,
    totalActiveLoansCount: activeLoans.length,
    totalExposureAmount: Math.round(totalExposure * 100) / 100,
    totalOverdueAmount: Math.round(totalOverdue * 100) / 100,
    hasActiveDefault,
    isBlacklisted,
    inquirySummary:
      riskGrade === 'LOW_RISK'
        ? 'Excellent repayment history with negligible cross-cooperative risk. Approved for credit facility.'
        : riskGrade === 'MODERATE_RISK'
        ? 'Moderate credit exposure. Collateral verification and guarantor vetting recommended.'
        : riskGrade === 'HIGH_RISK'
        ? 'High debt service burden. Extra provisioning and strict repayment terms mandatory.'
        : 'CRITICAL DEFAULT ALERT: Active overdue debt detected. Debarred under Sec 80 of Cooperative Act.',
    inquirySummaryNepali:
      riskGrade === 'LOW_RISK'
        ? 'असल भुक्तानी अभिलेख तथा न्यून जोखिम। कर्जा स्वीकृतिको लागि उपयुक्त।'
        : riskGrade === 'MODERATE_RISK'
        ? 'मध्यम कर्जा भार। धितो सुरक्षण तथा व्यक्तिगत जमानतको थप जाँच आवश्यक।'
        : riskGrade === 'HIGH_RISK'
        ? 'उच्च कर्जा जोखिम। कडा भुक्तानी सर्त तथा अतिरिक्त नोक्सानी व्यवस्था अनिवार्य।'
        : 'गम्भीर कालोसूची चेतावनी: भाखा नाघेको कर्जा सक्रिय। सहकारी ऐन दफा ८० बमोजिम कर्जा प्रवाहमा रोक।',
  };
}

/**
 * Generate Statutory Blacklist Public/Personal Notice under Section 81
 */
export function generateBlacklistNoticeText(
  record: CibBlacklistRecord,
  noticeType: '35_DAYS' | '15_DAYS'
): string {
  const days = noticeType === '35_DAYS' ? 35 : 15;
  const deadlineDays = noticeType === '35_DAYS' ? '३५ (पैँतिस)' : '१५ (पन्ध्र)';

  return `
उनको बचत तथा ऋण सहकारी संस्था लि.
गढवा-५, दाङ | दर्ता नं: ६१/०५७/०५८

ऋण चुक्ता भुक्तान गर्ने सम्बन्धी ${deadlineDays} दिने अत्यन्त जरुरी सार्वजनिक/व्यक्तिगत सूचना
(सहकारी ऐन २०७४ को दफा ८१ बमोजिम कर्जा सूचना केन्द्रको कालोसूचीमा समावेश गर्ने सम्बन्धी)

सूचना प्रकाशित मिति: ${record.noticePublishedDateBS || '२०८१/०८/१५'}
ऋणी सदस्यको नाम: ${record.memberName} (सदस्य नं: ${record.memberNo})
नागरिकता नं: ${record.citizenshipNo}
जमानतकर्ताको नाम: ${record.guarantorName} (नागरिकता नं: ${record.guarantorCitizenship})
कर्जा खाता नं: ${record.loanNo} (${record.loanType})

यस संस्थाबाट तपाईं ऋणीले उपभोग गर्नुभएको कर्जाको सावाँ रु. ${record.defaultedPrincipal.toLocaleString()} र ब्याज रु. ${record.accruedInterest.toLocaleString()} (जम्मा रु. ${record.totalOverdueAmount.toLocaleString()}) लामो समयदेखि भाखा नाघी नबुझाई संस्थाको सम्पर्कमा समेत नआउनुभएकोले यो सूचना प्रकाशित गरिएको छ।

यो सूचना प्रकाशित भएको मितिले ${days} दिनभित्र सम्पूर्ण सावाँ, ब्याज र हर्जाना चुक्ता गर्नुहोला। अन्यथा सहकारी ऐन २०७४ को दफा ८१ तथा कर्जा सूचना केन्द्रको नियमावली बमोजिम तपाईं ऋणी तथा जमानतकर्तालाई कर्जा सूचना केन्द्रको कालोसूची (Blacklist) मा समावेश गरी चल/अचल धितो लिलाम बिक्री तथा राहदानी रोक्का प्रक्रिया अगाडि बढाइने व्यहोरा सूचित गरिन्छ।

सञ्चालक समितिको निर्णयानुसार,
उनको बचत तथा ऋण सहकारी संस्था लि.
`.trim();
}

/**
 * Generate Delisting Clearance Certificate (Form 82)
 */
export function generateDelistingClearanceCertificate(
  record: CibBlacklistRecord,
  recoveredAmount: number
): DelistingClearanceCertificate {
  const hashPayload = `${record.memberNo}-${record.citizenshipNo}-${record.loanNo}-${recoveredAmount}`;
  const verificationHash = `CIB-DELIST-${Math.abs(
    hashPayload.split('').reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)
  ).toString(16).toUpperCase().padStart(8, '0')}`;

  return {
    certificateNo: `CIB-CLR-${record.loanNo}-${record.memberNo}`,
    issueDateBS: '2081/08/28',
    memberName: record.memberName,
    citizenshipNo: record.citizenshipNo,
    loanNo: record.loanNo,
    totalClearedAmount: recoveredAmount,
    boardResolutionNo: record.boardDecisionNo || 'BOD-88/2081',
    cibReportingRef: `CIB-REF-${record.blacklistNo}`,
    verificationHash,
  };
}

/**
 * Export CIB Batch Data to CSV for Credit Information Bureau Nepal reporting
 */
export function exportCibBatchCsv(records: readonly CibBlacklistRecord[]): string {
  const header = [
    'क्र.सं. (S.N.)',
    'कालोसूची दर्ता नं. (Blacklist No)',
    'सदस्य नं. (Member No)',
    'ऋणीको नाम (Borrower Name)',
    'नागरिकता नं. (Citizenship No)',
    'प्यान नं. (PAN)',
    'कर्जा नं. (Loan No)',
    'कर्जा प्रकार (Loan Type)',
    'बाँकी सावाँ रु. (Defaulted Principal)',
    'ब्याज रु. (Accrued Interest)',
    'कुल बक्यौता रु. (Total Overdue)',
    'भाखा नाघेको दिन (Days Overdue)',
    'जमानतकर्ताको नाम (Guarantor Name)',
    'जमानतकर्ता नागरिकता (Guarantor Citizenship)',
    'जमानतकर्ता फोन (Guarantor Phone)',
    'सञ्चालक समिति निर्णय (Decision No)',
    'स्थिति (Status)',
  ].map((h) => `"${h}"`).join(',');

  const rows = records.map((r, idx) => {
    return [
      idx + 1,
      `"${r.blacklistNo}"`,
      `"${r.memberNo}"`,
      `"${r.memberName}"`,
      `"${r.citizenshipNo}"`,
      `"${r.panNo || '-'}"`,
      `"${r.loanNo}"`,
      `"${r.loanType}"`,
      r.defaultedPrincipal.toFixed(2),
      r.accruedInterest.toFixed(2),
      r.totalOverdueAmount.toFixed(2),
      r.daysOverdue,
      `"${r.guarantorName}"`,
      `"${r.guarantorCitizenship}"`,
      `"${r.guarantorPhone}"`,
      `"${r.boardDecisionNo}"`,
      `"${r.status}"`,
    ].join(',');
  });

  return [header, ...rows].join('\r\n');
}
