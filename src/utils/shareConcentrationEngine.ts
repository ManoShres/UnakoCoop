/**
 * Unako SACCOS - Share Capital Ceiling, Holding Concentration Risk & Regulatory Divestment Engine
 * (सहकारी सेयर पूँजी सीमा, सेयर केन्द्रीकरण जोखिम तथा कानुनसम्मत फिर्ता/हस्तान्तरण प्रणाली)
 * 
 * Statutory Authority:
 * - Nepal Cooperative Act 2074 (सहकारी ऐन २०७४) Section 37
 *   (कुनै एक सदस्यले संस्थाको कुल सेयर पूँजीको २०% भन्दा बढी सेयर लिन नपाउने व्यवस्था)
 * - Section 38 (सेयर खरिद, नामसारी तथा फिर्ता सम्बन्धी व्यवस्था)
 * - Cooperative Directives & PEARLS Standards (E9 - Net Worth & Capital Concentration)
 */

export interface ShareholderRecord {
  memberId: string;
  memberNo: string;
  name: string;
  phone: string;
  shareKitta: number;
  shareCapital: number;
  percentageOfTotal: number;
  exceedsStatutoryLimit: boolean; // > 20% per Sec 37
  exceedsInternalLimit: boolean; // > internal threshold (e.g. 5% or 10%)
  joinDateNepali?: string;
  status: 'ACTIVE' | 'RESTRICTED' | 'DIVESTMENT_ORDERED';
}

export interface ShareConcentrationMetrics {
  totalIssuedCapital: number;
  totalIssuedShares: number;
  totalShareholders: number;
  statutoryLimitPercent: number; // 20.0%
  internalLimitPercent: number; // 5.0% or 10.0%
  maxAllowedKittaPerMember: number;
  top1ShareholderPercent: number;
  top5ShareholdersPercent: number;
  top10ShareholdersPercent: number;
  top20ShareholdersPercent: number;
  herfindahlIndex: number; // HHI score (0 to 10,000)
  concentrationRiskLevel: 'LOW' | 'MODERATE' | 'HIGH';
  statutoryViolationsCount: number;
  internalThresholdExceededCount: number;
  averageKittaPerMember: number;
  bracketDistribution: {
    bracket1To10: number; // 1-10 shares
    bracket11To50: number; // 11-50 shares
    bracket51To200: number; // 51-200 shares
    bracket201To500: number; // 201-500 shares
    bracket501Plus: number; // 501+ shares
  };
}

export interface ShareTransferParams {
  sourceMemberId: string;
  sourceMemberName: string;
  sourceMemberNo: string;
  sourceCurrentKitta: number;
  targetMemberId: string;
  targetMemberName: string;
  targetMemberNo: string;
  targetCurrentKitta: number;
  transferKitta: number;
  shareFaceValue: number; // typically Rs 100
  transferReason: 'VOLUNTARY_PARTIAL' | 'CEILING_COMPLIANCE' | 'MEMBERSHIP_EXIT' | 'FAMILY_TRANSFER';
  boardMinuteNo: string;
  approvalDateNepali: string;
  transferFee: number;
}

export interface ShareTransferResult {
  isValid: boolean;
  error?: string;
  warning?: string;
  transferAmount: number;
  sourceNewKitta: number;
  targetNewKitta: number;
  targetProjectedSharePercent: number;
  transferDeedNo: string;
}

/**
 * Calculates member-by-member shareholding proportions and concentration metrics
 */
export function calculateShareConcentration(params: {
  members: Array<{
    id: string;
    memberNo: string;
    name: string;
    phone: string;
    shareKitta?: number;
    shareCapital?: number;
    joinDateNepali?: string;
  }>;
  faceValue?: number;
  internalLimitPercent?: number; // default 5.0%
}): {
  shareholders: ShareholderRecord[];
  metrics: ShareConcentrationMetrics;
} {
  const { members, faceValue = 100, internalLimitPercent = 5.0 } = params;
  const statutoryLimitPercent = 20.0;

  // 1. Calculate individual kitta and total pool
  let totalIssuedShares = 0;

  const rawHoldings = members.map((m) => {
    const kitta = m.shareKitta || (m.shareCapital ? Math.round(m.shareCapital / faceValue) : 0);
    totalIssuedShares += kitta;
    return {
      memberId: m.id,
      memberNo: m.memberNo,
      name: m.name,
      phone: m.phone,
      shareKitta: kitta,
      shareCapital: kitta * faceValue,
      joinDateNepali: m.joinDateNepali,
    };
  });

  const totalIssuedCapital = totalIssuedShares * faceValue;
  const maxAllowedKittaPerMember = Math.floor((totalIssuedShares * statutoryLimitPercent) / 100);

  // 2. Sort descending by kitta
  const sortedRaw = [...rawHoldings].sort((a, b) => b.shareKitta - a.shareKitta);

  // 3. Compute percentages, HHI, and limits
  let sumOfSquaredShares = 0;
  let statutoryViolationsCount = 0;
  let internalThresholdExceededCount = 0;

  const bracketDistribution = {
    bracket1To10: 0,
    bracket11To50: 0,
    bracket51To200: 0,
    bracket201To500: 0,
    bracket501Plus: 0,
  };

  const shareholders: ShareholderRecord[] = sortedRaw.map((s) => {
    const percentageOfTotal = totalIssuedShares > 0
      ? Math.round((s.shareKitta / totalIssuedShares) * 10000) / 100
      : 0;

    const exceedsStatutoryLimit = percentageOfTotal > statutoryLimitPercent;
    const exceedsInternalLimit = percentageOfTotal > internalLimitPercent;

    if (exceedsStatutoryLimit) statutoryViolationsCount++;
    if (exceedsInternalLimit) internalThresholdExceededCount++;

    sumOfSquaredShares += Math.pow(percentageOfTotal, 2);

    // Brackets
    if (s.shareKitta <= 10) bracketDistribution.bracket1To10++;
    else if (s.shareKitta <= 50) bracketDistribution.bracket11To50++;
    else if (s.shareKitta <= 200) bracketDistribution.bracket51To200++;
    else if (s.shareKitta <= 500) bracketDistribution.bracket201To500++;
    else bracketDistribution.bracket501Plus++;

    return {
      memberId: s.memberId,
      memberNo: s.memberNo,
      name: s.name,
      phone: s.phone,
      shareKitta: s.shareKitta,
      shareCapital: s.shareCapital,
      percentageOfTotal,
      exceedsStatutoryLimit,
      exceedsInternalLimit,
      joinDateNepali: s.joinDateNepali,
      status: exceedsStatutoryLimit ? 'DIVESTMENT_ORDERED' : 'ACTIVE',
    };
  });

  // HHI is sum of squared percentage points
  const herfindahlIndex = Math.round(sumOfSquaredShares);
  let concentrationRiskLevel: 'LOW' | 'MODERATE' | 'HIGH' = 'LOW';
  if (herfindahlIndex > 2500 || statutoryViolationsCount > 0) {
    concentrationRiskLevel = 'HIGH';
  } else if (herfindahlIndex >= 1500) {
    concentrationRiskLevel = 'MODERATE';
  }

  // Concentration ratios
  const top1ShareholderPercent = shareholders[0]?.percentageOfTotal || 0;
  const top5ShareholdersPercent = shareholders.slice(0, 5).reduce((sum, s) => sum + s.percentageOfTotal, 0);
  const top10ShareholdersPercent = shareholders.slice(0, 10).reduce((sum, s) => sum + s.percentageOfTotal, 0);
  const top20ShareholdersPercent = shareholders.slice(0, 20).reduce((sum, s) => sum + s.percentageOfTotal, 0);

  const averageKittaPerMember = shareholders.length > 0
    ? Math.round(totalIssuedShares / shareholders.length)
    : 0;

  const metrics: ShareConcentrationMetrics = {
    totalIssuedCapital,
    totalIssuedShares,
    totalShareholders: shareholders.length,
    statutoryLimitPercent,
    internalLimitPercent,
    maxAllowedKittaPerMember,
    top1ShareholderPercent: Math.round(top1ShareholderPercent * 100) / 100,
    top5ShareholdersPercent: Math.round(top5ShareholdersPercent * 100) / 100,
    top10ShareholdersPercent: Math.round(top10ShareholdersPercent * 100) / 100,
    top20ShareholdersPercent: Math.round(top20ShareholdersPercent * 100) / 100,
    herfindahlIndex,
    concentrationRiskLevel,
    statutoryViolationsCount,
    internalThresholdExceededCount,
    averageKittaPerMember,
    bracketDistribution,
  };

  return { shareholders, metrics };
}

/**
 * Validates and executes a statutory share transfer or divestment under Section 38
 */
export function validateAndProcessShareTransfer(
  params: ShareTransferParams,
  totalIssuedShares: number,
  statutoryLimitPercent: number = 20.0
): ShareTransferResult {
  const {
    sourceCurrentKitta,
    targetCurrentKitta,
    transferKitta,
    shareFaceValue,
  } = params;

  if (transferKitta <= 0) {
    return {
      isValid: false,
      error: 'हस्तान्तरण गर्न खोजिएको सेयर कित्ता ० भन्दा बढी हुनुपर्दछ।',
      transferAmount: 0,
      sourceNewKitta: sourceCurrentKitta,
      targetNewKitta: targetCurrentKitta,
      targetProjectedSharePercent: 0,
      transferDeedNo: '',
    };
  }

  if (transferKitta > sourceCurrentKitta) {
    return {
      isValid: false,
      error: `दाता सदस्यसँग जम्मा ${sourceCurrentKitta} कित्ता मात्र सेयर छ। ${transferKitta} कित्ता हस्तान्तरण गर्न मिल्दैन।`,
      transferAmount: 0,
      sourceNewKitta: sourceCurrentKitta,
      targetNewKitta: targetCurrentKitta,
      targetProjectedSharePercent: 0,
      transferDeedNo: '',
    };
  }

  const sourceNewKitta = sourceCurrentKitta - transferKitta;
  const targetNewKitta = targetCurrentKitta + transferKitta;
  const targetProjectedSharePercent = totalIssuedShares > 0
    ? Math.round((targetNewKitta / totalIssuedShares) * 10000) / 100
    : 0;

  // Validate that the target member does not exceed 20% limit under Section 37
  if (targetProjectedSharePercent > statutoryLimitPercent) {
    return {
      isValid: false,
      error: `सहकारी ऐन २०७४, दफा ३७ अनुसार कुनै पनि सदस्यले कुल सेयर पूँजीको २०% भन्दा बढी लिन मिल्दैन। प्रस्तावित हस्तान्तरण पछि प्राप्तकर्ताको सेयर ${targetProjectedSharePercent}% पुग्नेछ।`,
      transferAmount: transferKitta * shareFaceValue,
      sourceNewKitta,
      targetNewKitta,
      targetProjectedSharePercent,
      transferDeedNo: '',
    };
  }

  const transferDeedNo = `UNAKO-TRF-${Date.now().toString().slice(-6)}`;
  const transferAmount = transferKitta * shareFaceValue;

  let warning: string | undefined = undefined;
  if (sourceNewKitta < 10) {
    warning = `हस्तान्तरण पश्चात् दाता सदस्यसँग ${sourceNewKitta} कित्ता मात्र सेयर रहनेछ, जुन संस्थाको न्यूनतम सदस्यता सेयर मापदण्ड (१० कित्ता) भन्दा कम हुन सक्छ।`;
  }

  return {
    isValid: true,
    warning,
    transferAmount,
    sourceNewKitta,
    targetNewKitta,
    targetProjectedSharePercent,
    transferDeedNo,
  };
}

/**
 * Generates an official bilingual Share Transfer & Divestment Deed (सेयर नामसारी तमसुक)
 */
export function generateShareTransferDeed(
  params: ShareTransferParams,
  result: ShareTransferResult
): string {
  return `================================================================================
                    उनको बचत तथा ऋण सहकारी संस्था लिमिटेड
                UNAKO SAVING & CREDIT COOPERATIVE SOCIETY LTD.
                     गढवा-५, दाङ, लुम्बिनी प्रदेश, नेपाल
             दर्ता नं: २८३/०६५/०६६ | सहकारी ऐन २०७४, दफा ३७ र ३८
================================================================================
                    सेयर नामसारी तथा लगत कट्टा आधिकारिक तमसुक
                  OFFICIAL SHARE TRANSFER & DIVESTMENT DEED
--------------------------------------------------------------------------------
तमसुक नं (Deed No.): ${result.transferDeedNo}
सञ्चालक समिति निर्णय नं: ${params.boardMinuteNo}
स्वीकृत मिति: ${params.approvalDateNepali}

सहकारी ऐन २०७४ को दफा ३७ (सेयर सीमा) तथा दफा ३८ (सेयर खरिद/बिक्री तथा फिर्ता) 
बमोजिम संस्थाको अभिलेखमा रहेको सेयर पूँजी देहाय बमोजिम हस्तान्तरण/नामसारी गरिएको छ।

१. सेयर दाता सदस्य विवरण (Transferor / Divesting Member):
   नाम (Name): ${params.sourceMemberName}
   सदस्य नं (Member No.): ${params.sourceMemberNo}
   हस्तान्तरण पूर्व सेयर कित्ता: ${params.sourceCurrentKitta} कित्ता
   हस्तान्तरण पछिको बाँकी कित्ता: ${result.sourceNewKitta} कित्ता

२. सेयर प्राप्तकर्ता सदस्य विवरण (Transferee / Receiving Member):
   नाम (Name): ${params.targetMemberName}
   सदस्य नं (Member No.): ${params.targetMemberNo}
   हस्तान्तरण पूर्व सेयर कित्ता: ${params.targetCurrentKitta} कित्ता
   हस्तान्तरण पछिको नयाँ सेयर कित्ता: ${result.targetNewKitta} कित्ता
   कुल पूँजीमा स्वामित्व प्रतिशत: ${result.targetProjectedSharePercent}% (दफा ३७ को २०% सीमा भित्र)

३. हस्तान्तरण सेयर विवरण (Transaction Particulars):
   हस्तान्तरण कित्ता संख्या (Shares Transferred): ${params.transferKitta} कित्ता
   प्रति सेयर दर (Face Value): रु. ${params.shareFaceValue}
   जम्मा सेयर मूल्य (Total Transferred Capital): रु. ${result.transferAmount.toLocaleString('en-IN')}
   हस्तान्तरण शुल्क (Transfer Fee): रु. ${params.transferFee}
   प्रयोजन (Transfer Reason): ${params.transferReason}

उपरोक्त बमोजिमको सेयर नामसारी अभिलेख संस्थाको सेयर दर्ता किताब (Share Register) 
मा विधिवत अद्यावधिक गरिएको प्रमाणित गर्दछौं।
--------------------------------------------------------------------------------
............................                   ............................
     सेयर दाता सदस्य                                सेयर प्राप्तकर्ता सदस्य
 (Transferor Signature)                          (Transferee Signature)

............................                   ............................
      सेयर शाखा अधिकृत                                अध्यक्ष / व्यवस्थापक
     Share Officer                                  Chairman / Manager
================================================================================`;
}

/**
 * Generates an official Share Holding Ceiling Notice for members exceeding limits
 */
export function generateCeilingComplianceNotice(
  shareholder: ShareholderRecord,
  metrics: ShareConcentrationMetrics
): string {
  const excessKitta = Math.max(0, shareholder.shareKitta - metrics.maxAllowedKittaPerMember);

  return `================================================================================
                    उनको बचत तथा ऋण सहकारी संस्था लिमिटेड
                UNAKO SAVING & CREDIT COOPERATIVE SOCIETY LTD.
                     गढवा-५, दाङ, लुम्बिनी प्रदेश, नेपाल
================================================================================
            सहकारी ऐन २०७४, दफा ३७ बमोजिम सेयर सीमा समायोजन सूचना
            STATUTORY SHARE CAPITAL CEILING RECTIFICATION NOTICE
--------------------------------------------------------------------------------
पत्र संख्या: उन/सेयर/२०८१-८२
चलानी नं: ${Math.floor(Math.random() * 900 + 100)}
मिति: २०८१-०६-०१

श्री: ${shareholder.name}
सदस्य नं: ${shareholder.memberNo}
सम्पर्क नं: ${shareholder.phone}

विषय: सेयर स्वामित्व सीमा (२०%) समायोजन सम्बन्धमा।

महोदय/महोदया,
सहकारी ऐन २०७४ को दफा ३७ मा "कुनै एक सदस्यले संस्थाको कुल सेयर पूँजीको 
२० प्रतिशतभन्दा बढी सेयर लिन नपाउने" बाध्यात्मक कानुनी व्यवस्था रहेको छ।

हाल संस्थाको कुल सेयर कित्ता ${metrics.totalIssuedShares.toLocaleString('en-IN')} रहेकोमा यहाँको नाममा 
${shareholder.shareKitta.toLocaleString('en-IN')} कित्ता (${shareholder.percentageOfTotal}%) सेयर कायम रहेको देखिन्छ।

कानुनी अधिकतम सीमा: ${metrics.maxAllowedKittaPerMember.toLocaleString('en-IN')} कित्ता (२०.०%)
हाल कायम सेयर: ${shareholder.shareKitta.toLocaleString('en-IN')} कित्ता
समायोजन / नामसारी गर्नुपर्ने अधिक कित्ता: ${excessKitta.toLocaleString('en-IN')} कित्ता

अतः यो सूचना प्राप्त भएको मितिले ३५ (पैंतीस) दिनभित्र ऐनको दफा ३८ तथा संस्थाको 
विनियम बमोजिम अधिक भएको ${excessKitta.toLocaleString('en-IN')} कित्ता सेयर अन्य योग्य सदस्यलाई 
हस्तान्तरण वा संस्थाको निर्णय अनुसार समायोजन गरी कानुनी दायित्व पूरा गर्नुहुन 
अनुरोध गरिन्छ।

............................                   ............................
      सेयर उपसमिति संयोजक                             कार्यकारी व्यवस्थापक
   Share Committee Convener                          Executive Manager
================================================================================`;
}

/**
 * Exports Shareholder Concentration & Ceiling Compliance Ledger to CSV
 */
export function exportShareConcentrationToCSV(
  shareholders: ShareholderRecord[],
  metrics: ShareConcentrationMetrics
): string {
  const header = [
    'Rank (क्र.सं.)',
    'Member No (सदस्य नं)',
    'Member Name (सदस्यको नाम)',
    'Phone (सम्पर्क)',
    'Share Kitta (कित्ता)',
    'Share Capital (रकम रु)',
    'Percentage Holding (% स्वामित्व)',
    'Section 37 Violation (>20%)',
    'Internal Threshold (>5%)',
    'Compliance Status',
  ].join(',');

  const rows = shareholders.map((s, idx) => {
    return [
      idx + 1,
      `"${s.memberNo}"`,
      `"${s.name.replace(/"/g, '""')}"`,
      `"${s.phone}"`,
      s.shareKitta,
      s.shareCapital,
      `${s.percentageOfTotal}%`,
      s.exceedsStatutoryLimit ? 'YES (उल्लङ्घन)' : 'NO (अनुकूल)',
      s.exceedsInternalLimit ? 'YES (मध्यम)' : 'NO',
      `"${s.status}"`,
    ].join(',');
  });

  const summary = [
    '',
    '--- SHARE CAPITAL CONCENTRATION & REGULATORY CEILING SUMMARY ---',
    `Total Issued Shares (कुल जारी कित्ता),${metrics.totalIssuedShares}`,
    `Total Share Capital (कुल सेयर पूँजी रु),${metrics.totalIssuedCapital}`,
    `Total Shareholders (कुल सेयरधनी सदस्य),${metrics.totalShareholders}`,
    `Statutory Limit (दफा ३७ वैधानिक सीमा),${metrics.statutoryLimitPercent}% (${metrics.maxAllowedKittaPerMember} kitta)`,
    `Top 1 Shareholder Concentration,${metrics.top1ShareholderPercent}%`,
    `Top 5 Shareholders Concentration,${metrics.top5ShareholdersPercent}%`,
    `Top 10 Shareholders Concentration,${metrics.top10ShareholdersPercent}%`,
    `Herfindahl-Hirschman Index (HHI),${metrics.herfindahlIndex}`,
    `Concentration Risk Level (केन्द्रीकरण जोखिम),${metrics.concentrationRiskLevel}`,
    `Section 37 Violations Count (वैधानिक उल्लङ्घन संख्या),${metrics.statutoryViolationsCount}`,
  ].join('\n');

  return [header, ...rows, summary].join('\n');
}
