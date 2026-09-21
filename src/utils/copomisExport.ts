/**
 * COPOMIS (Cooperative Management Information System) Data Export
 * Formatted for Ministry of Land Management, Cooperatives and Poverty Alleviation (Nepal)
 * Department of Cooperatives compliance standards.
 */

import { Member, SavingsAccount, Loan, CoopSettings } from '../types';

export interface CopomisPayload {
  coopSettings: CoopSettings;
  members: Member[];
  savings: SavingsAccount[];
  loans: Loan[];
  fiscalYear: string;
}

/**
 * Generate standard COPOMIS XML schema string
 */
export function generateCopomisXml(data: CopomisPayload): string {
  const { coopSettings, members, savings, loans, fiscalYear } = data;

  const totalShareCapital = members.reduce((sum, m) => sum + m.shareCapital, 0);
  const totalSavings = members.reduce((sum, m) => sum + m.totalSavings, 0);
  const totalLoanOutstanding = loans.reduce((sum, l) => sum + l.remainingBalance, 0);

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<COPOMIS_REGULATORY_SUBMISSION xmlns="urn:gov:np:cooperatives:copomis:v2">\n`;
  xml += `  <HEADER>\n`;
  xml += `    <COOP_REG_NO>${coopSettings.regNo}</COOP_REG_NO>\n`;
  xml += `    <COOP_PAN>${coopSettings.panNo}</COOP_PAN>\n`;
  xml += `    <COOP_NAME_EN><![CDATA[${coopSettings.name}]]></COOP_NAME_EN>\n`;
  xml += `    <COOP_NAME_NP><![CDATA[${coopSettings.nameNepali}]]></COOP_NAME_NP>\n`;
  xml += `    <PROVINCE>Lumbini Province</PROVINCE>\n`;
  xml += `    <DISTRICT>Dang</DISTRICT>\n`;
  xml += `    <LOCAL_BODY>Gadhwa Rural Municipality</LOCAL_BODY>\n`;
  xml += `    <FISCAL_YEAR>${fiscalYear}</FISCAL_YEAR>\n`;
  xml += `    <GENERATED_DATE>${new Date().toISOString()}</GENERATED_DATE>\n`;
  xml += `    <TOTAL_ACTIVE_MEMBERS>${members.length}</TOTAL_ACTIVE_MEMBERS>\n`;
  xml += `    <TOTAL_SHARE_CAPITAL_NPR>${totalShareCapital}</TOTAL_SHARE_CAPITAL_NPR>\n`;
  xml += `    <TOTAL_SAVINGS_DEPOSIT_NPR>${totalSavings}</TOTAL_SAVINGS_DEPOSIT_NPR>\n`;
  xml += `    <TOTAL_LOAN_DISBURSED_NPR>${totalLoanOutstanding}</TOTAL_LOAN_DISBURSED_NPR>\n`;
  xml += `  </HEADER>\n`;

  // Member Section
  xml += `  <MEMBERS>\n`;
  members.forEach((m) => {
    xml += `    <MEMBER>\n`;
    xml += `      <MEMBER_CODE>${m.memberNo}</MEMBER_CODE>\n`;
    xml += `      <FULL_NAME><![CDATA[${m.name}]]></FULL_NAME>\n`;
    xml += `      <CITIZENSHIP_NO>${m.citizenshipNo}</CITIZENSHIP_NO>\n`;
    xml += `      <PHONE>${m.phone}</PHONE>\n`;
    xml += `      <STATUS>${m.status}</STATUS>\n`;
    xml += `      <SHARE_UNITS>${m.shareCapital / 100}</SHARE_UNITS>\n`;
    xml += `      <SHARE_CAPITAL_NPR>${m.shareCapital}</SHARE_CAPITAL_NPR>\n`;
    xml += `      <SAVINGS_BALANCE_NPR>${m.totalSavings}</SAVINGS_BALANCE_NPR>\n`;
    xml += `      <LOAN_BALANCE_NPR>${m.activeLoanBalance}</LOAN_BALANCE_NPR>\n`;
    xml += `    </MEMBER>\n`;
  });
  xml += `  </MEMBERS>\n`;

  // Savings Accounts Section
  xml += `  <SAVINGS_ACCOUNTS>\n`;
  savings.forEach((s) => {
    xml += `    <ACCOUNT>\n`;
    xml += `      <ACCOUNT_NO>${s.accountNo}</ACCOUNT_NO>\n`;
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
    xml += `      <LOAN_TYPE>${l.loanType}</LOAN_TYPE>\n`;
    xml += `      <PRINCIPAL_DISBURSED_NPR>${l.principalAmount}</PRINCIPAL_DISBURSED_NPR>\n`;
    xml += `      <OUTSTANDING_BALANCE_NPR>${l.remainingBalance}</OUTSTANDING_BALANCE_NPR>\n`;
    xml += `      <INTEREST_RATE_PA>${l.interestRate}</INTEREST_RATE_PA>\n`;
    xml += `      <STATUS>${l.status}</STATUS>\n`;
    xml += `      <COLLATERAL><![CDATA[${l.collateralDescription}]]></COLLATERAL>\n`;
    xml += `    </LOAN>\n`;
  });
  xml += `  </LOAN_PORTFOLIO>\n`;

  xml += `</COPOMIS_REGULATORY_SUBMISSION>`;
  return xml;
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
