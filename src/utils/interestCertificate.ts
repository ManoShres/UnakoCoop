/**
 * Interest Certificate & 5% Statutory TDS Breakdown Engine
 *
 * Compliant with Nepal Income Tax Act 2058 (आयकर ऐन २०५८) Section 88
 * certifying withholding tax on savings interest and fixed deposit earnings.
 */

export interface InterestCertificateMemberInput {
  id: string;
  name: string;
  memberNo: string;
  panNo?: string;
  citizenshipNo?: string;
  phone?: string;
  address?: string;
}

export interface InterestAccountInput {
  accountNo: string;
  accountType: string;
  productName: string;
  balance: number;
  interestRate: number;
  grossInterestEarned: number;
}

export interface InterestEarningItem {
  accountNo: string;
  accountType: string;
  productName: string;
  principalBalance: number;
  interestRatePercent: number;
  grossInterestEarned: number;
  tdsRatePercent: number;
  tdsDeducted: number;
  netInterestPaid: number;
}

export interface InterestCertificateData {
  certificateNo: string;
  fiscalYear: string;
  issueDateBs: string;
  issueDateAd: string;
  memberId: string;
  memberName: string;
  memberNo: string;
  panNo?: string;
  citizenshipNo?: string;
  phone?: string;
  address?: string;
  earnings: readonly InterestEarningItem[];
  totalGrossInterest: number;
  totalTdsDeducted: number;
  totalNetInterest: number;
  verificationHash: string;
}

export interface CoopTaxHeaderInput {
  name: string;
  nameNepali: string;
  panNo?: string;
  regNo?: string;
  address?: string;
}

/**
 * Calculates interest breakdown and 5% statutory withholding tax (TDS)
 */
export function calculateInterestCertificate(
  member: InterestCertificateMemberInput,
  accounts: readonly InterestAccountInput[],
  fiscalYear: string,
  issueDateBs: string,
  issueDateAd: string
): InterestCertificateData {
  const earnings: InterestEarningItem[] = accounts.map((acc) => {
    const gross = acc.grossInterestEarned;
    const tds = Math.round(gross * 0.05 * 10) / 10;
    const net = Math.round((gross - tds) * 10) / 10;

    return {
      accountNo: acc.accountNo,
      accountType: acc.accountType,
      productName: acc.productName,
      principalBalance: acc.balance,
      interestRatePercent: acc.interestRate,
      grossInterestEarned: gross,
      tdsRatePercent: 5,
      tdsDeducted: tds,
      netInterestPaid: net,
    };
  });

  const totalGrossInterest = earnings.reduce((sum, e) => sum + e.grossInterestEarned, 0);
  const totalTdsDeducted = Math.round(earnings.reduce((sum, e) => sum + e.tdsDeducted, 0) * 10) / 10;
  const totalNetInterest = Math.round(earnings.reduce((sum, e) => sum + e.netInterestPaid, 0) * 10) / 10;

  // Normalized fiscal year token for certificate number (converts Devanagari to ASCII digits)
  const nepaliDigits: Record<string, string> = {
    '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
    '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',
  };
  const asciiFy = fiscalYear.replace(/[०-९]/g, (d) => nepaliDigits[d] || d);
  let fySanitized = asciiFy
    .replace(/[^\d/]/g, '')
    .replace('/', '-') || '2080-81';

  const parts = fySanitized.split('-');
  if (parts.length === 2 && parts[0].length === 4 && parts[1].length === 4) {
    fySanitized = `${parts[0]}-${parts[1].slice(-2)}`;
  }

  const memberShort = member.memberNo.replace(/[^A-Za-z0-9]/g, '').slice(-4) || '0000';
  const certificateNo = `UNAKO-IC-${fySanitized}-${memberShort}`;

  // Deterministic verification hash
  const rawHashPayload = `${certificateNo}:${member.id}:${totalGrossInterest}:${totalTdsDeducted}:${issueDateAd}`;
  let hashVal = 0;
  for (let i = 0; i < rawHashPayload.length; i++) {
    hashVal = (hashVal << 5) - hashVal + rawHashPayload.charCodeAt(i);
    hashVal |= 0;
  }
  const verificationHash = 'UKO-' + Math.abs(hashVal).toString(16).toUpperCase().padStart(8, '0');

  return {
    certificateNo,
    fiscalYear,
    issueDateBs,
    issueDateAd,
    memberId: member.id,
    memberName: member.name,
    memberNo: member.memberNo,
    panNo: member.panNo,
    citizenshipNo: member.citizenshipNo,
    phone: member.phone,
    address: member.address,
    earnings,
    totalGrossInterest,
    totalTdsDeducted,
    totalNetInterest,
    verificationHash,
  };
}

/**
 * Generates an official CSV statement for tax filings and member audit reporting
 */
export function generateInterestCertificateCsv(
  cert: InterestCertificateData,
  coop: CoopTaxHeaderInput
): string {
  const lines: string[] = [];

  lines.push(`"${coop.nameNepali} (${coop.name})"`);
  lines.push(`"ब्याज आम्दानी तथा अग्रिम कर कट्टी (TDS) प्रमाणपत्र - आयकर ऐन २०५८ दफा ८८"`);
  lines.push(`"प्रमाणपत्र नं: ${cert.certificateNo} | प्रमाणीकरण कोड: ${cert.verificationHash}"`);
  lines.push(`"आर्थिक वर्ष: ${cert.fiscalYear} | जारी मिति: ${cert.issueDateBs} (${cert.issueDateAd})"`);
  lines.push(
    `"सदस्यको नाम: ${cert.memberName} | सदस्यता नं: ${cert.memberNo} | स्थायी लेखा नं (PAN): ${
      cert.panNo || 'N/A'
    }"`
  );
  lines.push('');
  lines.push(
    'क्र.सं.,खाता शीर्षक,खाता नं.,मौज्दात रकम,ब्याज दर (%),कुल ब्याज (Gross),कर कट्टी दर,TDS रकम (५%),खुद भुक्तानी (Net)'
  );

  cert.earnings.forEach((e, idx) => {
    lines.push(
      `${idx + 1},"${e.productName}",${e.accountNo},${e.principalBalance},${e.interestRatePercent}%,${
        e.grossInterestEarned
      },${e.tdsRatePercent}%,${e.tdsDeducted},${e.netInterestPaid}`
    );
  });

  lines.push('');
  lines.push(
    `कुल जम्मा (Grand Total),-,-,-,-,${cert.totalGrossInterest},-,${cert.totalTdsDeducted},${cert.totalNetInterest}`
  );

  return lines.join('\n');
}

/**
 * Initiates browser download of the Interest & TDS Certificate CSV
 */
export function downloadInterestCertificateCsv(
  cert: InterestCertificateData,
  coop: CoopTaxHeaderInput
): void {
  const csv = generateInterestCertificateCsv(cert, coop);
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${cert.certificateNo}-TDS.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
