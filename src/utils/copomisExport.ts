/**
 * COPOMIS (Cooperative Management Information System) Data Export & Schema Generator
 * Formatted for Ministry of Land Management, Cooperatives and Poverty Alleviation (Nepal)
 * Department of Cooperatives compliance standards v2.5.
 */

import { Member, SavingsAccount, Loan, CoopSettings } from '../types';
import { validateCopomisData, CopomisValidationResult } from './copomisValidator';

export interface CopomisPayload {
  coopSettings: CoopSettings;
  members: Member[];
  savings: SavingsAccount[];
  loans: Loan[];
  fiscalYear: string;
}

/**
 * Generate standard COPOMIS XML schema string (v2.5) with full demographic and portfolio tags
 */
export function generateCopomisXml(data: CopomisPayload): string {
  const { coopSettings, members, savings, loans, fiscalYear } = data;

  const totalShareCapital = members.reduce((sum, m) => sum + (m.shareCapital || 0), 0);
  const totalSavings = members.reduce((sum, m) => sum + (m.totalSavings || 0), 0);
  const totalLoanOutstanding = loans.reduce((sum, l) => sum + (l.remainingBalance || 0), 0);

  const femaleCount = members.filter((m) => (m.gender || '').toUpperCase() === 'FEMALE').length;
  const maleCount = members.filter((m) => (m.gender || '').toUpperCase() === 'MALE').length;
  const otherGenderCount = members.length - (femaleCount + maleCount);

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<COPOMIS_REGULATORY_SUBMISSION xmlns="urn:gov:np:cooperatives:copomis:v2.5">\n`;
  xml += `  <HEADER>\n`;
  xml += `    <SCHEMA_VERSION>2.5</SCHEMA_VERSION>\n`;
  xml += `    <COOP_REG_NO>${coopSettings.regNo}</COOP_REG_NO>\n`;
  xml += `    <COOP_PAN>${coopSettings.panNo}</COOP_PAN>\n`;
  xml += `    <COOP_NAME_EN><![CDATA[${coopSettings.name}]]></COOP_NAME_EN>\n`;
  xml += `    <COOP_NAME_NP><![CDATA[${coopSettings.nameNepali}]]></COOP_NAME_NP>\n`;
  xml += `    <PROVINCE>Lumbini Province</PROVINCE>\n`;
  xml += `    <DISTRICT>Dang</DISTRICT>\n`;
  xml += `    <LOCAL_BODY>Gadhwa Rural Municipality</LOCAL_BODY>\n`;
  xml += `    <WARD_NO>5</WARD_NO>\n`;
  xml += `    <FISCAL_YEAR>${fiscalYear}</FISCAL_YEAR>\n`;
  xml += `    <GENERATED_DATE>${new Date().toISOString()}</GENERATED_DATE>\n`;
  xml += `    <TOTAL_ACTIVE_MEMBERS>${members.length}</TOTAL_ACTIVE_MEMBERS>\n`;
  xml += `    <MEMBER_GENDER_FEMALE>${femaleCount}</MEMBER_GENDER_FEMALE>\n`;
  xml += `    <MEMBER_GENDER_MALE>${maleCount}</MEMBER_GENDER_MALE>\n`;
  xml += `    <MEMBER_GENDER_OTHER>${otherGenderCount}</MEMBER_GENDER_OTHER>\n`;
  xml += `    <TOTAL_SHARE_CAPITAL_NPR>${totalShareCapital}</TOTAL_SHARE_CAPITAL_NPR>\n`;
  xml += `    <TOTAL_SHARE_KITTA>${Math.floor(totalShareCapital / 100)}</TOTAL_SHARE_KITTA>\n`;
  xml += `    <TOTAL_SAVINGS_DEPOSIT_NPR>${totalSavings}</TOTAL_SAVINGS_DEPOSIT_NPR>\n`;
  xml += `    <TOTAL_LOAN_DISBURSED_NPR>${totalLoanOutstanding}</TOTAL_LOAN_DISBURSED_NPR>\n`;
  xml += `  </HEADER>\n`;

  // Member Section
  xml += `  <MEMBERS>\n`;
  members.forEach((m) => {
    xml += `    <MEMBER>\n`;
    xml += `      <MEMBER_CODE>${m.memberNo}</MEMBER_CODE>\n`;
    xml += `      <FULL_NAME><![CDATA[${m.name}]]></FULL_NAME>\n`;
    xml += `      <FULL_NAME_NP><![CDATA[${m.nameNepali || m.name}]]></FULL_NAME_NP>\n`;
    xml += `      <GENDER>${(m.gender || 'FEMALE').toUpperCase()}</GENDER>\n`;
    xml += `      <CITIZENSHIP_NO>${m.citizenshipNo}</CITIZENSHIP_NO>\n`;
    xml += `      <NATIONAL_ID_NO>${m.nationalIdNo || ''}</NATIONAL_ID_NO>\n`;
    xml += `      <PHONE>${m.phone}</PHONE>\n`;
    xml += `      <DISTRICT>${m.district || 'Dang'}</DISTRICT>\n`;
    xml += `      <LOCAL_BODY>${m.palika || 'Gadhwa'}</LOCAL_BODY>\n`;
    xml += `      <WARD_NO>${m.wardNo || '5'}</WARD_NO>\n`;
    xml += `      <STATUS>${m.status}</STATUS>\n`;
    xml += `      <SHARE_UNITS>${Math.floor((m.shareCapital || 0) / 100)}</SHARE_UNITS>\n`;
    xml += `      <SHARE_CAPITAL_NPR>${m.shareCapital || 0}</SHARE_CAPITAL_NPR>\n`;
    xml += `      <SAVINGS_BALANCE_NPR>${m.totalSavings || 0}</SAVINGS_BALANCE_NPR>\n`;
    xml += `      <LOAN_BALANCE_NPR>${m.activeLoanBalance || 0}</LOAN_BALANCE_NPR>\n`;
    xml += `    </MEMBER>\n`;
  });
  xml += `  </MEMBERS>\n`;

  // Savings Accounts Section
  xml += `  <SAVINGS_ACCOUNTS>\n`;
  savings.forEach((s) => {
    xml += `    <ACCOUNT>\n`;
    xml += `      <ACCOUNT_NO>${s.accountNo}</ACCOUNT_NO>\n`;
    xml += `      <MEMBER_ID>${s.memberId}</MEMBER_ID>\n`;
    xml += `      <ACCOUNT_TYPE>${s.accountType}</ACCOUNT_TYPE>\n`;
    xml += `      <BALANCE_NPR>${s.balance}</BALANCE_NPR>\n`;
    xml += `      <INTEREST_RATE_PA>${s.interestRate}</INTEREST_RATE_PA>\n`;
    xml += `      <STATUS>${s.status}</STATUS>\n`;
    xml += `    </ACCOUNT>\n`;
  });
  xml += `  </SAVINGS_ACCOUNTS>\n`;

  // Loan Portfolios Section
  xml += `  <LOAN_PORTFOLIO>\n`;
  loans.forEach((l) => {
    xml += `    <LOAN>\n`;
    xml += `      <LOAN_NO>${l.loanNo}</LOAN_NO>\n`;
    xml += `      <MEMBER_ID>${l.memberId}</MEMBER_ID>\n`;
    xml += `      <LOAN_TYPE>${l.loanType}</LOAN_TYPE>\n`;
    xml += `      <PRINCIPAL_DISBURSED_NPR>${l.principalAmount}</PRINCIPAL_DISBURSED_NPR>\n`;
    xml += `      <OUTSTANDING_BALANCE_NPR>${l.remainingBalance}</OUTSTANDING_BALANCE_NPR>\n`;
    xml += `      <INTEREST_RATE_PA>${l.interestRate}</INTEREST_RATE_PA>\n`;
    xml += `      <STATUS>${l.status}</STATUS>\n`;
    xml += `      <COLLATERAL><![CDATA[${l.collateralDescription || 'Group Guarantee'}]]></COLLATERAL>\n`;
    xml += `    </LOAN>\n`;
  });
  xml += `  </LOAN_PORTFOLIO>\n`;

  xml += `</COPOMIS_REGULATORY_SUBMISSION>`;
  return xml;
}

/**
 * Generate COPOMIS JSON Payload for modern REST API integration
 */
export function generateCopomisJson(data: CopomisPayload): string {
  const { coopSettings, members, savings, loans, fiscalYear } = data;
  const validation: CopomisValidationResult = validateCopomisData(data);

  const payload = {
    submissionMetadata: {
      schemaVersion: '2.5',
      exportTimestamp: new Date().toISOString(),
      fiscalYear,
      isCompliant: validation.isValid,
      complianceScore: validation.summary.complianceScore,
    },
    institution: {
      regNo: coopSettings.regNo,
      panNo: coopSettings.panNo,
      name: coopSettings.name,
      nameNepali: coopSettings.nameNepali,
      province: 'Lumbini Province',
      district: 'Dang',
      palika: 'Gadhwa Rural Municipality',
      ward: 5,
    },
    summary: validation.summary,
    members: members.map((m) => ({
      memberNo: m.memberNo,
      fullName: m.name,
      fullNameNepali: m.nameNepali || m.name,
      gender: m.gender || 'FEMALE',
      citizenshipNo: m.citizenshipNo,
      nationalIdNo: m.nationalIdNo || null,
      phone: m.phone,
      wardNo: m.wardNo || '5',
      district: m.district || 'Dang',
      shareCapital: m.shareCapital,
      shareKitta: Math.floor((m.shareCapital || 0) / 100),
      savingsBalance: m.totalSavings,
      loanBalance: m.activeLoanBalance,
      status: m.status,
    })),
    savingsAccounts: savings.map((s) => ({
      accountNo: s.accountNo,
      memberId: s.memberId,
      accountType: s.accountType,
      balance: s.balance,
      interestRate: s.interestRate,
      status: s.status,
    })),
    loans: loans.map((l) => ({
      loanNo: l.loanNo,
      memberId: l.memberId,
      loanType: l.loanType,
      principalAmount: l.principalAmount,
      remainingBalance: l.remainingBalance,
      interestRate: l.interestRate,
      status: l.status,
      collateral: l.collateralDescription || 'Group Guarantee',
    })),
  };

  return JSON.stringify(payload, null, 2);
}

/**
 * Generate COPOMIS CSV for Excel/Office import
 */
export function generateCopomisCsv(members: Member[]): string {
  const headers = [
    'Member Code',
    'Full Name',
    'Citizenship No',
    'Phone',
    'Address',
    'Status',
    'Share Capital (NPR)',
    'Total Savings (NPR)',
    'Active Loan (NPR)',
    'Accrued Dividend (NPR)',
    'Gender',
    'National ID No',
    'Ward No',
    'District',
    'Share Units (Kitta)',
  ];

  const rows = members.map((m) => [
    `"${m.memberNo}"`,
    `"${m.name}"`,
    `"${m.citizenshipNo}"`,
    `"${m.phone}"`,
    `"${m.address}"`,
    `"${m.status}"`,
    m.shareCapital,
    m.totalSavings,
    m.activeLoanBalance,
    m.accruedDividend,
    `"${m.gender || 'FEMALE'}"`,
    `"${m.nationalIdNo || ''}"`,
    `"${m.wardNo || '5'}"`,
    `"${m.district || 'Dang'}"`,
    Math.floor((m.shareCapital || 0) / 100),
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

/**
 * Browser file download helper
 */
export function triggerBrowserDownload(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
