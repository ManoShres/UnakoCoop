/**
 * FIU-Nepal & Department of Cooperatives goAML XML & Regulatory Dispatch Engine
 *
 * Implements UNODC goAML v2.0 XML Schema Standards, Money Laundering Prevention Act 2064 (Rule 21),
 * and Department of Cooperatives AML/CFT Directives 2079.
 *
 * Features:
 * - Formal goAML XML generation (TTR/CTR & STR)
 * - Regulatory compliance validation & sanitization
 * - Bilingual STR Investigation Dossier & AMLCO Sign-off generator
 * - Client-side safe file dispatch (.xml, .html)
 */

import { AmlAlert } from './amlCompliance';

export type GoAmlReportCode = 'TTR' | 'CTR' | 'STR';
export type GoAmlTransactionMode = 'CASH' | 'TRANSFER' | 'CHEQUE' | 'CLEARING' | 'MOBILE';

export interface AmlcoOfficer {
  name: string;
  nameNepali: string;
  designation: string;
  phone: string;
  email: string;
}

export interface GoAmlEntity {
  entityId: string;
  branchCode: string;
  name: string;
  nameNepali: string;
  panNo: string;
  regNo: string;
  district: string;
  province: string;
}

export interface GoAmlMemberParty {
  id: string;
  memberNo: string;
  fullName: string;
  fatherName?: string;
  grandfatherName?: string;
  citizenshipNo?: string;
  nid?: string;
  dateOfBirth?: string;
  gender?: string;
  occupation: string;
  annualIncome: number;
  address: string;
  isPep: boolean;
  phone: string;
}

export interface GoAmlTransactionItem {
  transactionId: string;
  accountNo: string;
  amount: number;
  date: string;
  valueDate: string;
  mode: GoAmlTransactionMode;
  debitCredit: 'DEBIT' | 'CREDIT';
  purpose?: string;
  remarks?: string;
}

export interface GoAmlReportData {
  reportCode: GoAmlReportCode;
  reportRef: string;
  reportDate: string;
  entity: GoAmlEntity;
  complianceOfficer: AmlcoOfficer;
  subject: GoAmlMemberParty;
  transactions: GoAmlTransactionItem[];
  suspicionNarrative?: string;
  suspicionNarrativeNepali?: string;
  indicators: string[];
  internalActionTaken: string;
  amlcoRecommendation: string;
}

export interface GoAmlValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export const DEFAULT_UNAKO_AMLCO: AmlcoOfficer = {
  name: 'Sunil Kumar Sharma',
  nameNepali: 'सुनिल कुमार शर्मा',
  designation: 'Chief Compliance & AML/CFT Officer (AMLCO)',
  phone: '+977-82-410023',
  email: 'compliance@unako.coop.np',
};

export const DEFAULT_UNAKO_ENTITY: GoAmlEntity = {
  entityId: 'COOP-UNAKO-2070',
  branchCode: 'GADHAWA-05',
  name: 'Unako Saving and Credit Cooperative Society Ltd.',
  nameNepali: 'उनको बचत तथा ऋण सहकारी संस्था लि.',
  panNo: '302918274',
  regNo: '2070/071/582',
  district: 'Dang',
  province: 'Lumbini Province',
};

/**
 * Escapes characters for XML safely to prevent XML injection
 */
export function escapeXml(str: string | undefined | null): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Validates report data against FIU-Nepal goAML constraints
 */
export function validateGoAmlReport(report: GoAmlReportData): GoAmlValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!report.reportRef || report.reportRef.trim().length === 0) {
    errors.push('Report Reference number is mandatory.');
  }

  if (!report.entity.entityId) {
    errors.push('Reporting Entity (RE) ID assigned by FIU-Nepal is required.');
  }

  if (!report.complianceOfficer.name || !report.complianceOfficer.email) {
    errors.push('AML Compliance Officer (AMLCO) name and email are mandatory.');
  }

  if (!report.subject.memberNo) {
    errors.push('Member account number / Member ID is missing.');
  }

  if (!report.subject.fullName) {
    errors.push('Subject full name is required.');
  }

  if (!report.subject.citizenshipNo && !report.subject.nid) {
    warnings.push('Neither Citizenship No nor National ID (NID) is provided for the subject.');
  }

  if (!report.transactions || report.transactions.length === 0) {
    errors.push('At least one transaction record must be included in the goAML report.');
  } else {
    report.transactions.forEach((tx, idx) => {
      if (tx.amount <= 0) {
        errors.push(`Transaction #${idx + 1} (${tx.transactionId}) has non-positive amount.`);
      }
      if (!tx.date) {
        errors.push(`Transaction #${idx + 1} (${tx.transactionId}) is missing transaction date.`);
      }
    });
  }

  if (report.reportCode === 'STR') {
    if (!report.suspicionNarrative || report.suspicionNarrative.trim().length < 15) {
      errors.push('STR reports require a detailed suspicion narrative (minimum 15 characters).');
    }
    if (report.indicators.length === 0) {
      warnings.push('No suspicious activity indicators selected for this STR.');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Generates official UNODC goAML Schema XML string
 */
export function generateGoAmlXml(report: GoAmlReportData): string {
  const entity = report.entity;
  const officer = report.complianceOfficer;
  const sub = report.subject;

  // Split member name into first and last
  const nameParts = sub.fullName.trim().split(/\s+/);
  const firstName = nameParts[0] || 'Unknown';
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Member';

  const xmlParts: string[] = [];

  xmlParts.push('<?xml version="1.0" encoding="utf-8"?>');
  xmlParts.push(
    `<report report_code="${escapeXml(report.reportCode)}" submission_code="E" report_date="${escapeXml(
      report.reportDate
    )}" currency_code_local="NPR">`
  );

  // Entity Details
  xmlParts.push('  <rentity_id>' + escapeXml(entity.entityId) + '</rentity_id>');
  xmlParts.push('  <rentity_branch>' + escapeXml(entity.branchCode) + '</rentity_branch>');
  xmlParts.push('  <submission_date>' + escapeXml(report.reportDate) + 'T00:00:00</submission_date>');
  xmlParts.push('  <report_number>' + escapeXml(report.reportRef) + '</report_number>');

  // Reporting Person (AMLCO)
  xmlParts.push('  <reporting_person>');
  xmlParts.push('    <gender>M</gender>');
  xmlParts.push('    <title>Mr</title>');
  xmlParts.push('    <first_name>' + escapeXml(officer.name.split(' ')[0]) + '</first_name>');
  xmlParts.push('    <last_name>' + escapeXml(officer.name.split(' ').slice(1).join(' ')) + '</last_name>');
  xmlParts.push('    <occupation>' + escapeXml(officer.designation) + '</occupation>');
  xmlParts.push('    <phones>');
  xmlParts.push('      <phone>');
  xmlParts.push('        <tph_contact_type>WORK</tph_contact_type>');
  xmlParts.push('        <tph_number>' + escapeXml(officer.phone) + '</tph_number>');
  xmlParts.push('      </phone>');
  xmlParts.push('    </phones>');
  xmlParts.push('    <email>' + escapeXml(officer.email) + '</email>');
  xmlParts.push('  </reporting_person>');

  // Reason & Action for STR
  if (report.reportCode === 'STR') {
    xmlParts.push('  <reason>');
    xmlParts.push('    <reason_description>' + escapeXml(report.suspicionNarrative) + '</reason_description>');
    if (report.suspicionNarrativeNepali) {
      xmlParts.push('    <reason_description_local>' + escapeXml(report.suspicionNarrativeNepali) + '</reason_description_local>');
    }
    if (report.indicators.length > 0) {
      xmlParts.push('    <indicators>');
      report.indicators.forEach((ind) => {
        xmlParts.push('      <indicator>' + escapeXml(ind) + '</indicator>');
      });
      xmlParts.push('    </indicators>');
    }
    xmlParts.push('  </reason>');
    xmlParts.push('  <action>' + escapeXml(report.internalActionTaken) + '</action>');
  }

  // Transactions
  report.transactions.forEach((tx) => {
    xmlParts.push('  <transaction>');
    xmlParts.push('    <transactionnumber>' + escapeXml(tx.transactionId) + '</transactionnumber>');
    xmlParts.push('    <internal_ref_number>' + escapeXml(tx.transactionId) + '</internal_ref_number>');
    xmlParts.push('    <transaction_location>' + escapeXml(entity.branchCode) + '</transaction_location>');
    xmlParts.push('    <transaction_description>' + escapeXml(tx.purpose || 'Cooperative Savings/Loan Transaction') + '</transaction_description>');
    xmlParts.push('    <date_transaction>' + escapeXml(tx.date) + 'T10:00:00</date_transaction>');
    xmlParts.push('    <value_date>' + escapeXml(tx.valueDate || tx.date) + 'T10:00:00</value_date>');
    xmlParts.push('    <transmode_code>' + escapeXml(tx.mode) + '</transmode_code>');
    xmlParts.push('    <amount_local>' + tx.amount.toFixed(2) + '</amount_local>');

    // T_FROM (Originator)
    xmlParts.push('    <t_from>');
    xmlParts.push('      <from_funds_code>' + (tx.mode === 'CASH' ? 'CASH' : 'ACC') + '</from_funds_code>');
    xmlParts.push('      <from_account>');
    xmlParts.push('        <institution_name>' + escapeXml(entity.name) + '</institution_name>');
    xmlParts.push('        <account>' + escapeXml(tx.accountNo) + '</account>');
    xmlParts.push('        <account_name>' + escapeXml(sub.fullName) + '</account_name>');
    xmlParts.push('        <account_type>SAVINGS</account_type>');
    xmlParts.push('        <client_number>' + escapeXml(sub.memberNo) + '</client_number>');
    xmlParts.push('        <signatory>');
    xmlParts.push('          <is_primary>true</is_primary>');
    xmlParts.push('          <t_person>');
    xmlParts.push('            <first_name>' + escapeXml(firstName) + '</first_name>');
    xmlParts.push('            <last_name>' + escapeXml(lastName) + '</last_name>');
    if (sub.fatherName) {
      xmlParts.push('            <fathers_name>' + escapeXml(sub.fatherName) + '</fathers_name>');
    }
    if (sub.grandfatherName) {
      xmlParts.push('            <grandfathers_name>' + escapeXml(sub.grandfatherName) + '</grandfathers_name>');
    }
    xmlParts.push('            <id_number>' + escapeXml(sub.citizenshipNo || sub.nid || 'N/A') + '</id_number>');
    xmlParts.push('            <nationality1>NPL</nationality1>');
    xmlParts.push('            <residence>NPL</residence>');
    xmlParts.push('            <occupation>' + escapeXml(sub.occupation) + '</occupation>');
    xmlParts.push('            <pep_flag>' + (sub.isPep ? 'true' : 'false') + '</pep_flag>');
    xmlParts.push('            <addresses>');
    xmlParts.push('              <address>');
    xmlParts.push('                <address_type>RESIDENTIAL</address_type>');
    xmlParts.push('                <address>' + escapeXml(sub.address) + '</address>');
    xmlParts.push('                <city>' + escapeXml(entity.district) + '</city>');
    xmlParts.push('                <country_code>NPL</country_code>');
    xmlParts.push('              </address>');
    xmlParts.push('            </addresses>');
    xmlParts.push('            <phones>');
    xmlParts.push('              <phone>');
    xmlParts.push('                <tph_contact_type>MOBILE</tph_contact_type>');
    xmlParts.push('                <tph_number>' + escapeXml(sub.phone) + '</tph_number>');
    xmlParts.push('              </phone>');
    xmlParts.push('            </phones>');
    xmlParts.push('          </t_person>');
    xmlParts.push('        </signatory>');
    xmlParts.push('      </from_account>');
    xmlParts.push('    </t_from>');

    // T_TO (Destination)
    xmlParts.push('    <t_to>');
    xmlParts.push('      <to_funds_code>' + (tx.mode === 'CASH' ? 'CASH' : 'ACC') + '</to_funds_code>');
    xmlParts.push('      <to_account>');
    xmlParts.push('        <institution_name>' + escapeXml(entity.name) + '</institution_name>');
    xmlParts.push('        <account>' + escapeXml(tx.accountNo) + '</account>');
    xmlParts.push('        <account_name>' + escapeXml(sub.fullName) + '</account_name>');
    xmlParts.push('      </to_account>');
    xmlParts.push('    </t_to>');

    xmlParts.push('  </transaction>');
  });

  xmlParts.push('</report>');

  return xmlParts.join('\n');
}

/**
 * Builds standard GoAmlReportData from an active alert and member
 */
export function buildGoAmlReportFromAlert(
  alert: AmlAlert,
  member: GoAmlMemberParty,
  entity: GoAmlEntity = DEFAULT_UNAKO_ENTITY,
  officer: AmlcoOfficer = DEFAULT_UNAKO_AMLCO
): GoAmlReportData {
  const isStr = alert.reportType === 'STR';
  const reportCode: GoAmlReportCode = isStr ? 'STR' : 'TTR';
  const today = new Date().toISOString().split('T')[0];

  const txItem: GoAmlTransactionItem = {
    transactionId: alert.transactionId,
    accountNo: '004-10294-88-01',
    amount: alert.amount,
    date: alert.transactionDate,
    valueDate: alert.transactionDate,
    mode: 'CASH',
    debitCredit: 'CREDIT',
    purpose: alert.triggerReason,
    remarks: alert.triggerReasonNepali,
  };

  const indicators: string[] = [];
  if (alert.ruleCode === 'STR_STRUCTURING') {
    indicators.push('TRANSACTION_BELOW_STATUTORY_THRESHOLD_PATTERN');
    indicators.push('UNUSUAL_VOLUME_FOR_ECONOMIC_PROFILE');
  } else if (alert.ruleCode === 'PEP_EDD') {
    indicators.push('POLITICALLY_EXPOSED_PERSON_HIGH_EXPOSURE');
  } else if (alert.ruleCode === 'CTR_THRESHOLD_1M') {
    indicators.push('THRESHOLD_CASH_TRANSACTION_EXCEEDING_1M');
  }

  return {
    reportCode,
    reportRef: `GOAML-UNAKO-${today.replace(/-/g, '')}-${alert.transactionId}`,
    reportDate: today,
    entity,
    complianceOfficer: officer,
    subject: member,
    transactions: [txItem],
    suspicionNarrative: isStr
      ? `Transaction of NPR ${alert.amount.toLocaleString()} triggered AML rule ${alert.ruleCode}. ${alert.triggerReason}. Source of funds verification conducted.`
      : undefined,
    suspicionNarrativeNepali: isStr
      ? `रकम रु ${alert.amount.toLocaleString()} को कारोबारमा सम्पत्ति शुद्धीकरण निवारण नियम ${alert.ruleCode} अन्तर्गत शंकास्पद खण्डीकरण वा उच्च जोखिम भेटिएकोले प्रतिवेदन गरिएको छ।`
      : undefined,
    indicators,
    internalActionTaken: isStr
      ? 'Account tagged for Enhanced Due Diligence (EDD), KYC source of funds declaration obtained, report submitted to FIU-Nepal via goAML portal.'
      : 'Threshold cash transaction recorded in statutory register and reported under Section 21.',
    amlcoRecommendation: isStr
      ? 'Board and Supervisory Committee notified; enhanced post-transaction transaction monitoring active.'
      : 'Routine threshold filing; regular account monitoring maintained.',
  };
}

/**
 * Generates bilingual printable HTML for official STR/TTR Investigation Dossier
 */
export function generateStrInvestigationDossierHtml(report: GoAmlReportData): string {
  const { entity, complianceOfficer, subject, transactions } = report;
  const totalAmount = transactions.reduce((acc, t) => acc + t.amount, 0);

  return `<!DOCTYPE html>
<html lang="ne">
<head>
  <meta charset="UTF-8">
  <title>FIU goAML STR/TTR Dossier - ${report.reportRef}</title>
  <style>
    @page { size: A4 portrait; margin: 15mm; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Mukti", sans-serif; color: #1e293b; line-height: 1.4; padding: 20px; font-size: 12px; }
    .header { text-align: center; border-bottom: 2px solid #b91c1c; padding-bottom: 12px; margin-bottom: 16px; }
    .title-np { font-size: 18px; font-weight: bold; color: #991b1b; margin: 0; }
    .sub-np { font-size: 13px; color: #475569; margin: 2px 0; }
    .badge { display: inline-block; padding: 3px 8px; border-radius: 4px; font-weight: bold; font-size: 11px; margin-top: 4px; }
    .badge-str { background: #fee2e2; color: #991b1b; border: 1px solid #f87171; }
    .badge-ttr { background: #e0e7ff; color: #3730a3; border: 1px solid #818cf8; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
    .box { border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; background: #f8fafc; }
    .box h4 { margin: 0 0 6px 0; font-size: 12px; color: #0f172a; border-bottom: 1px dashed #cbd5e1; padding-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; margin-top: 6px; font-size: 11px; }
    th, td { border: 1px solid #cbd5e1; padding: 6px; text-align: left; }
    th { background: #f1f5f9; color: #334155; }
    .narrative-box { border-left: 4px solid #dc2626; padding: 8px 12px; background: #fff1f2; margin: 12px 0; }
    .signature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 40px; }
    .sig-line { border-top: 1px solid #64748b; padding-top: 4px; text-align: center; font-size: 11px; }
    .footer { text-align: center; font-size: 10px; color: #94a3b8; margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 8px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="title-np">${entity.nameNepali}</div>
    <div class="sub-np">${entity.name}</div>
    <div class="sub-np">${entity.district}, ${entity.province} | दर्ता नं: ${entity.regNo} | PAN: ${entity.panNo}</div>
    <div class="sub-np" style="font-weight: bold; color: #0f172a; margin-top: 6px;">
      सम्पत्ति शुद्धीकरण तथा आतंकवादी कार्यमा वित्तीय लगानी निवारण (AML/CFT) अनुपालन विभाग
    </div>
    <span class="badge ${report.reportCode === 'STR' ? 'badge-str' : 'badge-ttr'}">
      FIU-Nepal goAML ${report.reportCode} आधिकारिक अनुसन्धान मिसिल (Dossier Ref: ${report.reportRef})
    </span>
  </div>

  <div class="grid">
    <div class="box">
      <h4>१. प्रतिवेदन तथा अनुपालन अधिकृत विवरण (Reporting Particulars)</h4>
      <div><strong>प्रतिवेदन प्रकार:</strong> ${report.reportCode} (${report.reportCode === 'STR' ? 'शंकास्पद कारोबार' : 'थ्रेसहोल्ड नगद कारोबार'})</div>
      <div><strong>प्रतिवेदन मिति:</strong> ${report.reportDate}</div>
      <div><strong>FIU RE Code:</strong> ${entity.entityId} (${entity.branchCode})</div>
      <div><strong>AMLCO अधिकृत:</strong> ${complianceOfficer.nameNepali} (${complianceOfficer.name})</div>
      <div><strong>सम्पर्क:</strong> ${complianceOfficer.phone} | ${complianceOfficer.email}</div>
    </div>

    <div class="box">
      <h4>२. सदस्य तथा कारोबारी विवरण (Subject / Member Profile)</h4>
      <div><strong>सदस्य नाम:</strong> ${subject.fullName}</div>
      <div><strong>सदस्य नं.:</strong> ${subject.memberNo}</div>
      <div><strong>नागरिकता / NID:</strong> ${subject.citizenshipNo || subject.nid || 'N/A'}</div>
      <div><strong>ठेगाना:</strong> ${subject.address}</div>
      <div><strong>पेशा / वार्षिक आय:</strong> ${subject.occupation} (रु ${subject.annualIncome.toLocaleString()})</div>
      <div><strong>PEP स्थिति:</strong> ${subject.isPep ? 'हो (Politically Exposed Person - उच्च जोखिम)' : 'होइन (Regular)'}</div>
    </div>
  </div>

  ${
    report.reportCode === 'STR'
      ? `
  <div class="narrative-box">
    <strong style="color: #991b1b; display: block; margin-bottom: 4px;">३. शंकास्पद हुनुको आधार तथा कारण (Grounds of Suspicion):</strong>
    <p style="margin: 0 0 6px 0;"><strong>नेपाली:</strong> ${report.suspicionNarrativeNepali || 'N/A'}</p>
    <p style="margin: 0; color: #475569;"><strong>English:</strong> ${report.suspicionNarrative || 'N/A'}</p>
    ${
      report.indicators.length > 0
        ? `<div style="margin-top: 6px; font-size: 10px; color: #b91c1c;"><strong>संकेतहरू (Indicators):</strong> ${report.indicators.join(', ')}</div>`
        : ''
    }
  </div>
  `
      : ''
  }

  <div class="box">
    <h4>४. संलग्न कारोबारहरूको तालिका (Transaction Manifest)</h4>
    <table>
      <thead>
        <tr>
          <th>कारोबार नं. (Txn ID)</th>
          <th>खाता नं.</th>
          <th>मिति</th>
          <th>माध्यम</th>
          <th>प्रकार</th>
          <th style="text-align: right;">रकम (NPR)</th>
        </tr>
      </thead>
      <tbody>
        ${transactions
          .map(
            (tx) => `
          <tr>
            <td><code>${tx.transactionId}</code></td>
            <td>${tx.accountNo}</td>
            <td>${tx.date}</td>
            <td>${tx.mode}</td>
            <td>${tx.debitCredit}</td>
            <td style="text-align: right; font-weight: bold;">रु ${tx.amount.toLocaleString()}</td>
          </tr>
        `
          )
          .join('')}
        <tr>
          <td colspan="5" style="text-align: right; font-weight: bold; background: #f8fafc;">जम्मा रकम (Total Exposure):</td>
          <td style="text-align: right; font-weight: bold; color: #b91c1c; background: #f8fafc;">रु ${totalAmount.toLocaleString()}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="box" style="margin-top: 12px;">
    <h4>५. आन्तरिक कारबाही तथा AMLCO को सिफारिस (Action Taken & Recommendations)</h4>
    <div><strong>संस्थाले गरेको कारबाही:</strong> ${report.internalActionTaken}</div>
    <div style="margin-top: 4px;"><strong>AMLCO को राय/सिफारिस:</strong> ${report.amlcoRecommendation}</div>
  </div>

  <div class="signature-grid">
    <div>
      <div class="sig-line">
        <strong>${complianceOfficer.nameNepali}</strong><br>
        सम्पत्ति शुद्धीकरण अनुपालन अधिकृत (AMLCO)<br>
        उनको बचत तथा ऋण सहकारी संस्था लि.
      </div>
    </div>
    <div>
      <div class="sig-line">
        <strong>प्रमुख कार्यकारी अधिकृत / अध्यक्ष</strong><br>
        संस्थागत अनुमोदन<br>
        उनको बचत तथा ऋण सहकारी संस्था लि.
      </div>
    </div>
  </div>

  <div class="footer">
    गोप्य दस्तावेज • सम्पत्ति शुद्धीकरण निवारण ऐन २०६४ को दफा २१ तथा सहकारी विभाग निर्देशिका २०७९ बमोजिम संरक्षित।<br>
    UNAKO Core Banking System • FIU-Nepal goAML Subsystem • Generated on ${new Date().toLocaleString()}
  </div>
</body>
</html>`;
}

/**
 * Downloads goAML XML file directly to browser
 */
export function downloadGoAmlXml(report: GoAmlReportData): void {
  const xml = generateGoAmlXml(report);
  const blob = new Blob([xml], { type: 'application/xml;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${report.reportRef}.xml`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Prints or downloads the STR/TTR Investigation Dossier HTML
 */
export function printStrInvestigationDossier(report: GoAmlReportData): void {
  const html = generateStrInvestigationDossierHtml(report);
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }
}
