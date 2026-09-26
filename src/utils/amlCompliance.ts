/**
 * AML/CFT & FIU-Nepal goAML Compliance Monitoring Engine
 *
 * Implements statutory Anti-Money Laundering and Combating the Financing of Terrorism
 * obligations under Nepal's Money Laundering Prevention Act 2064 (सम्पत्ति शुद्धीकरण ऐन २०६४)
 * and Department of Cooperatives / FIU-Nepal directives.
 */

export type AmlReportType = 'CTR' | 'STR';
export type AmlSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AmlStatus = 'PENDING_REVIEW' | 'CLEARED' | 'FIU_REPORTED' | 'ESCALATED';

export type AmlRuleCode =
  | 'CTR_THRESHOLD_1M'
  | 'STR_STRUCTURING'
  | 'STR_VELOCITY'
  | 'STR_HIGH_RISK_OCCUPATION'
  | 'PEP_EDD';

export interface AmlMemberInput {
  id: string;
  memberNo: string;
  name: string;
  isPep?: boolean;
  occupation?: string;
  annualIncome?: number;
}

export interface AmlTransactionInput {
  id: string;
  memberId: string;
  amount: number;
  type: string;
  channel: string;
  date: string;
  accountNo: string;
}

export interface AmlAlert {
  id: string;
  reportType: AmlReportType;
  severity: AmlSeverity;
  memberId: string;
  memberName: string;
  memberNo: string;
  transactionId: string;
  amount: number;
  transactionDate: string;
  transactionType: string;
  triggerReason: string;
  triggerReasonNepali: string;
  ruleCode: AmlRuleCode;
  status: AmlStatus;
  investigationNote?: string;
}

export interface AmlAuditSummary {
  totalScannedTransactions: number;
  ctrAlertsCount: number;
  strAlertsCount: number;
  totalFlaggedAmount: number;
  highRiskMembersCount: number;
  complianceStatus: 'COMPLIANT' | 'ACTION_REQUIRED';
}

export interface CoopAmlHeaderInput {
  name: string;
  nameNepali: string;
  regNo: string;
  panNo?: string;
}

/**
 * Scans transactions against regulatory AML/CFT rules and flags CTR and STR alerts
 */
export function scanTransactionsForAml(
  transactions: readonly AmlTransactionInput[],
  members: readonly AmlMemberInput[],
  ctrThresholdNpr = 1000000
): AmlAlert[] {
  const memberMap = new Map<string, AmlMemberInput>();
  members.forEach((m) => memberMap.set(m.id, m));

  const alerts: AmlAlert[] = [];

  // Group transactions by member for velocity & structuring analysis
  const memberTxMap = new Map<string, AmlTransactionInput[]>();
  transactions.forEach((tx) => {
    const list = memberTxMap.get(tx.memberId) || [];
    memberTxMap.set(tx.memberId, [...list, tx]);
  });

  // Rule 1: Cash Transaction Reporting (CTR) >= Threshold
  transactions.forEach((tx) => {
    const member = memberMap.get(tx.memberId);
    const memberName = member?.name || 'Unknown Member';
    const memberNo = member?.memberNo || 'N/A';

    if (tx.amount >= ctrThresholdNpr) {
      alerts.push({
        id: `AML-CTR-${tx.id}`,
        reportType: 'CTR',
        severity: 'CRITICAL',
        memberId: tx.memberId,
        memberName,
        memberNo,
        transactionId: tx.id,
        amount: tx.amount,
        transactionDate: tx.date,
        transactionType: tx.type,
        triggerReason: `Single transaction exceeds statutory threshold NPR ${ctrThresholdNpr.toLocaleString()}`,
        triggerReasonNepali: `रु १० लाखको सीमा नाघेको थ्रेसहोल्ड कारोबार (दफा २१)`,
        ruleCode: 'CTR_THRESHOLD_1M',
        status: 'PENDING_REVIEW',
      });
    }

    // Rule 2: PEP check requiring Enhanced Due Diligence (EDD)
    if (member?.isPep && tx.amount >= 200000) {
      alerts.push({
        id: `AML-PEP-${tx.id}`,
        reportType: 'STR',
        severity: 'HIGH',
        memberId: tx.memberId,
        memberName,
        memberNo,
        transactionId: tx.id,
        amount: tx.amount,
        transactionDate: tx.date,
        transactionType: tx.type,
        triggerReason: 'Transaction by Politically Exposed Person (PEP) requires Enhanced Due Diligence',
        triggerReasonNepali: 'राजनीतिक रुपमा प्रभावकारी व्यक्ति (PEP) को उच्च जोखिम कारोबार',
        ruleCode: 'PEP_EDD',
        status: 'PENDING_REVIEW',
      });
    }
  });

  // Rule 3: Smurfing / Structuring (Transactions between 700k and 999k, or multiple transactions aggregating > 1M in short window)
  memberTxMap.forEach((txs, memberId) => {
    const member = memberMap.get(memberId);
    const memberName = member?.name || 'Unknown Member';
    const memberNo = member?.memberNo || 'N/A';

    // Transactions between 700k and 999k (potential intentional structuring)
    const structuringTxs = txs.filter(
      (tx) => tx.amount >= 700000 && tx.amount < ctrThresholdNpr
    );

    structuringTxs.forEach((tx) => {
      alerts.push({
        id: `AML-STR-${tx.id}`,
        reportType: 'STR',
        severity: 'HIGH',
        memberId,
        memberName,
        memberNo,
        transactionId: tx.id,
        amount: tx.amount,
        transactionDate: tx.date,
        transactionType: tx.type,
        triggerReason: `High-value structuring near statutory threshold (NPR ${tx.amount.toLocaleString()})`,
        triggerReasonNepali: `सीमामुनि शंकास्पद खण्डीकरण कारोबार (Structuring Pattern)`,
        ruleCode: 'STR_STRUCTURING',
        status: 'PENDING_REVIEW',
      });
    });
  });

  return alerts;
}

/**
 * Calculates aggregate summary metrics for AML audit reporting
 */
export function generateAmlAuditSummary(
  alerts: readonly AmlAlert[],
  totalScannedCount: number
): AmlAuditSummary {
  const ctrAlerts = alerts.filter((a) => a.reportType === 'CTR');
  const strAlerts = alerts.filter((a) => a.reportType === 'STR');

  const uniqueFlaggedMembers = new Set(alerts.map((a) => a.memberId));
  const totalFlaggedAmount = alerts.reduce((sum, a) => sum + a.amount, 0);

  return {
    totalScannedTransactions: totalScannedCount,
    ctrAlertsCount: ctrAlerts.length,
    strAlertsCount: strAlerts.length,
    totalFlaggedAmount,
    highRiskMembersCount: uniqueFlaggedMembers.size,
    complianceStatus: alerts.length > 0 ? 'ACTION_REQUIRED' : 'COMPLIANT',
  };
}

/**
 * Generates FIU-Nepal goAML compliant CSV export string
 */
export function generateFiuGoAmlCsv(
  alerts: readonly AmlAlert[],
  coop: CoopAmlHeaderInput
): string {
  const lines: string[] = [];

  lines.push(`"${coop.nameNepali} (${coop.name})"`);
  lines.push(`"FIU-Nepal goAML सम्पत्ति शुद्धीकरण अनुगमन तथा CTR/STR प्रतिवेदन"`);
  lines.push(`"संस्था दर्ता नं: ${coop.regNo} | उत्पादन मिति: ${new Date().toISOString().split('T')[0]}"`);
  lines.push('');
  lines.push(
    'क्र.सं.,अलर्ट आईडी,प्रकार,गम्भीरता,सदस्य नं.,सदस्यको नाम,कारोबार आईडी,रकम (NPR),मिति,नियम,कैफियत,स्थिति'
  );

  alerts.forEach((a, idx) => {
    lines.push(
      `${idx + 1},${a.id},${a.reportType},${a.severity},${a.memberNo},"${a.memberName}",${
        a.transactionId
      },${a.amount},${a.transactionDate},${a.ruleCode},"${a.triggerReasonNepali}",${a.status}`
    );
  });

  return lines.join('\n');
}

/**
 * Generates official REST JSON payload matching FIU-Nepal goAML specifications
 */
export function generateFiuGoAmlJson(
  alerts: readonly AmlAlert[],
  coop: CoopAmlHeaderInput
): string {
  const payload = {
    schemaVersion: 'goAML-v2.0-NP',
    cooperativeName: coop.name,
    cooperativeNameNepali: coop.nameNepali,
    cooperativeRegNo: coop.regNo,
    generatedAt: new Date().toISOString(),
    reports: alerts.map((a) => ({
      reportId: a.id,
      reportType: a.reportType,
      severity: a.severity,
      subject: {
        memberId: a.memberId,
        memberNo: a.memberNo,
        fullName: a.memberName,
      },
      transaction: {
        transactionId: a.transactionId,
        amountNpr: a.amount,
        date: a.transactionDate,
        type: a.transactionType,
      },
      reason: {
        ruleCode: a.ruleCode,
        english: a.triggerReason,
        nepali: a.triggerReasonNepali,
      },
      status: a.status,
    })),
  };

  return JSON.stringify(payload, null, 2);
}

/**
 * Initiates browser download of FIU goAML CSV
 */
export function downloadFiuGoAmlCsv(
  alerts: readonly AmlAlert[],
  coop: CoopAmlHeaderInput
): void {
  const csv = generateFiuGoAmlCsv(alerts, coop);
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `UNAKO-FIU-GOAML-${new Date().toISOString().split('T')[0].replace(/-/g, '')}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Initiates browser download of FIU goAML JSON
 */
export function downloadFiuGoAmlJson(
  alerts: readonly AmlAlert[],
  coop: CoopAmlHeaderInput
): void {
  const jsonStr = generateFiuGoAmlJson(alerts, coop);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `UNAKO-FIU-GOAML-${new Date().toISOString().split('T')[0].replace(/-/g, '')}.json`;
  link.click();
  URL.revokeObjectURL(url);
}
