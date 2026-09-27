/**
 * Fixed Asset Management, Depreciation Schedule & IRD Tax Pool Engine
 * (स्थिर सम्पत्ति व्यवस्थापन तथा आयकर ऐन अनुसूची २ ह्रासकट्टी तालिका प्रणाली)
 * 
 * Complies with:
 * - Nepal Income Tax Act 2058 (आयकर ऐन २०५८) Schedule 2 (Pool A, B, C, D, E)
 * - Timing of Additions: 3/3 (Shrawan-Poush), 2/3 (Magh-Chaitra), 1/3 (Baisakh-Ashadh)
 * - Cooperative Accounting Standard (COPAS) - Depreciation & Revaluation Framework
 */

export type AssetPoolCategory = 'POOL_A' | 'POOL_B' | 'POOL_C' | 'POOL_D' | 'POOL_E';

export type AssetStatus = 'ACTIVE' | 'DISPOSED' | 'WRITTEN_OFF' | 'UNDER_MAINTENANCE';

export type AdditionTiming = 'SHRAWAN_TO_POUSH' | 'MAGH_TO_CHAITRA' | 'BAISAKH_TO_ASHADH';

export interface FixedAsset {
  id: string;
  assetCode: string;
  name: string;
  category: AssetPoolCategory;
  purchaseDate: string;
  purchaseCost: number;
  additionTiming: AdditionTiming;
  branchName: string;
  location: string;
  assignedEmployee?: string;
  status: AssetStatus;
  accumulatedDepreciation: number;
  currentWdv: number;
  disposalDetails?: {
    date: string;
    saleProceeds: number;
    gainOrLoss: number;
  };
}

export interface PoolDepreciationSchedule {
  pool: AssetPoolCategory;
  poolNameNp: string;
  poolNameEn: string;
  depreciationRate: number; // e.g. 0.05, 0.25, 0.20
  openingWdv: number;
  additionsFull: number; // Shrawan to Poush (100% absorbed)
  additionsTwoThirds: number; // Magh to Chaitra (66.67% absorbed)
  additionsOneThird: number; // Baisakh to Ashadh (33.33% absorbed)
  absorbedAdditions: number;
  unabsorbedAdditions: number;
  disposalsDeduction: number;
  depreciationBase: number;
  depreciationAmount: number;
  closingWdv: number;
}

export interface DepreciationReportSummary {
  fiscalYear: string;
  totalAssetsCount: number;
  totalOpeningWdv: number;
  totalAdditions: number;
  totalAbsorbedAdditions: number;
  totalUnabsorbedAdditions: number;
  totalDisposals: number;
  totalDepreciationExpense: number;
  totalClosingWdv: number;
  poolSchedules: Record<AssetPoolCategory, PoolDepreciationSchedule>;
}

export const POOL_METADATA: Record<
  AssetPoolCategory,
  {
    nameNp: string;
    nameEn: string;
    rate: number;
    method: 'DIMINISHING_VALUE' | 'STRAIGHT_LINE';
    description: string;
  }
> = {
  POOL_A: {
    nameNp: 'वर्ग क: भवन, गोदाम तथा स्थायी संरचना',
    nameEn: 'Pool A: Buildings & Structures',
    rate: 0.05,
    method: 'DIMINISHING_VALUE',
    description: '५% ह्रासकट्टी दर - संस्थाको भवन, गोदाम, बाउन्ड्री वाल तथा स्थायी सिभिल संरचना',
  },
  POOL_B: {
    nameNp: 'वर्ग ख: फर्निचर, फिक्चर्स तथा कार्यालय उपकरण',
    nameEn: 'Pool B: Furniture, Fixtures & Equipment',
    rate: 0.25,
    method: 'DIMINISHING_VALUE',
    description: '२५% ह्रासकट्टी दर - काउन्टर डेस्क, दराज, सोफा, टेबल, लकर तथा फलामका तिजोरी',
  },
  POOL_C: {
    nameNp: 'वर्ग ग: सवारी साधन तथा अटोमोबाइल्स',
    nameEn: 'Pool C: Automobiles & Vehicles',
    rate: 0.20,
    method: 'DIMINISHING_VALUE',
    description: '२०% ह्रासकट्टी दर - मोटरसाइकल, स्कुटर, भ्यान, जिप तथा अन्य सवारी साधन',
  },
  POOL_D: {
    nameNp: 'वर्ग घ: कम्प्युटर, प्रिन्टर तथा डाटा प्रोसेसिङ उपकरण',
    nameEn: 'Pool D: Computers, Printers & Software',
    rate: 0.25,
    method: 'DIMINISHING_VALUE',
    description: '२५% ह्रासकट्टी दर - मुख्य सर्भर, कम्प्युटर, ल्यापटप, प्रिन्टर, क्यास काउन्टर मेसिन र सफ्टवेयर',
  },
  POOL_E: {
    nameNp: 'वर्ग ङ: अमूर्त सम्पत्ति तथा लिजहोल्ड सुधार',
    nameEn: 'Pool E: Intangible Assets & Leasehold',
    rate: 0.20, // Default 5 years straight line
    method: 'STRAIGHT_LINE',
    description: '२०% ह्रासकट्टी दर - ५ वर्षे लिजहोल्ड सम्झौता सुधार, पेटेन्ट तथा प्रतिलिपि अधिकार',
  },
};

/**
 * Calculates statutory absorption according to Income Tax Act 2058.
 */
export function calculateAdditionAbsorption(
  cost: number,
  timing: AdditionTiming
): { absorbedAmount: number; deferredAmount: number } {
  if (cost <= 0) return { absorbedAmount: 0, deferredAmount: 0 };

  switch (timing) {
    case 'SHRAWAN_TO_POUSH':
      // 100% (3/3 parts) eligible in the current tax year
      return { absorbedAmount: cost, deferredAmount: 0 };
    case 'MAGH_TO_CHAITRA':
      // 66.67% (2/3 parts) eligible, 1/3 deferred to next year's opening WDV
      const absorbed2 = Math.round((cost * 2) / 3);
      return { absorbedAmount: absorbed2, deferredAmount: cost - absorbed2 };
    case 'BAISAKH_TO_ASHADH':
      // 33.33% (1/3 parts) eligible, 2/3 deferred to next year's opening WDV
      const absorbed1 = Math.round(cost / 3);
      return { absorbedAmount: absorbed1, deferredAmount: cost - absorbed1 };
    default:
      return { absorbedAmount: cost, deferredAmount: 0 };
  }
}

/**
 * Computes pool-level depreciation according to IRD Schedule 2 formulas.
 */
export function calculatePoolDepreciation(
  pool: AssetPoolCategory,
  openingWdv: number,
  additions: { cost: number; timing: AdditionTiming }[],
  disposals: number = 0
): PoolDepreciationSchedule {
  const meta = POOL_METADATA[pool];

  let additionsFull = 0;
  let additionsTwoThirds = 0;
  let additionsOneThird = 0;
  let totalAbsorbed = 0;
  let totalUnabsorbed = 0;

  additions.forEach((add) => {
    if (add.timing === 'SHRAWAN_TO_POUSH') additionsFull += add.cost;
    else if (add.timing === 'MAGH_TO_CHAITRA') additionsTwoThirds += add.cost;
    else if (add.timing === 'BAISAKH_TO_ASHADH') additionsOneThird += add.cost;

    const { absorbedAmount, deferredAmount } = calculateAdditionAbsorption(add.cost, add.timing);
    totalAbsorbed += absorbedAmount;
    totalUnabsorbed += deferredAmount;
  });

  // Base for depreciation = Opening WDV + Absorbed Additions - Disposal Proceeds
  const base = Math.max(0, openingWdv + totalAbsorbed - disposals);
  const depreciationAmount = Math.round(base * meta.rate);

  // Closing WDV = Base - Depreciation Amount + Deferred/Unabsorbed Additions
  const closingWdv = base - depreciationAmount + totalUnabsorbed;

  return {
    pool,
    poolNameNp: meta.nameNp,
    poolNameEn: meta.nameEn,
    depreciationRate: meta.rate,
    openingWdv,
    additionsFull,
    additionsTwoThirds,
    additionsOneThird,
    absorbedAdditions: totalAbsorbed,
    unabsorbedAdditions: totalUnabsorbed,
    disposalsDeduction: disposals,
    depreciationBase: base,
    depreciationAmount,
    closingWdv,
  };
}

/**
 * Computes comprehensive depreciation across all pools and assets.
 */
export function calculateComprehensiveDepreciation(
  assets: readonly FixedAsset[],
  fiscalYear: string = '२०८०/०८१'
): DepreciationReportSummary {
  const pools: AssetPoolCategory[] = ['POOL_A', 'POOL_B', 'POOL_C', 'POOL_D', 'POOL_E'];

  const poolSchedules = {} as Record<AssetPoolCategory, PoolDepreciationSchedule>;

  let totalOpeningWdv = 0;
  let totalAdditions = 0;
  let totalAbsorbedAdditions = 0;
  let totalUnabsorbedAdditions = 0;
  let totalDisposals = 0;
  let totalDepreciationExpense = 0;
  let totalClosingWdv = 0;

  pools.forEach((p) => {
    const poolAssets = assets.filter((a) => a.category === p);

    // Sum opening WDV (assets that were purchased before the current year)
    // For our model, currentWdv of active existing assets represents opening baseline
    const openingWdv = poolAssets.reduce((acc, a) => {
      // If purchased previously
      return acc + (a.status === 'ACTIVE' || a.status === 'UNDER_MAINTENANCE' ? a.currentWdv : 0);
    }, 0);

    // Filter newly acquired assets during the fiscal year
    const newAdditions = poolAssets.map((a) => ({
      cost: a.purchaseCost,
      timing: a.additionTiming,
    }));

    // Sum disposals
    const poolDisposals = poolAssets.reduce((acc, a) => {
      return acc + (a.status === 'DISPOSED' && a.disposalDetails ? a.disposalDetails.saleProceeds : 0);
    }, 0);

    const schedule = calculatePoolDepreciation(p, openingWdv, newAdditions, poolDisposals);
    poolSchedules[p] = schedule;

    totalOpeningWdv += schedule.openingWdv;
    totalAdditions += schedule.additionsFull + schedule.additionsTwoThirds + schedule.additionsOneThird;
    totalAbsorbedAdditions += schedule.absorbedAdditions;
    totalUnabsorbedAdditions += schedule.unabsorbedAdditions;
    totalDisposals += schedule.disposalsDeduction;
    totalDepreciationExpense += schedule.depreciationAmount;
    totalClosingWdv += schedule.closingWdv;
  });

  return {
    fiscalYear,
    totalAssetsCount: assets.length,
    totalOpeningWdv,
    totalAdditions,
    totalAbsorbedAdditions,
    totalUnabsorbedAdditions,
    totalDisposals,
    totalDepreciationExpense,
    totalClosingWdv,
    poolSchedules,
  };
}

/**
 * Adds a new fixed asset immutably.
 */
export function addFixedAsset(
  assets: readonly FixedAsset[],
  newAsset: Omit<FixedAsset, 'id' | 'accumulatedDepreciation' | 'currentWdv'>
): FixedAsset[] {
  const assetId = `fa-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const item: FixedAsset = {
    ...newAsset,
    id: assetId,
    accumulatedDepreciation: 0,
    currentWdv: newAsset.purchaseCost,
  };

  return [...assets, item];
}

/**
 * Disposes an asset with sale proceeds and computes Gain/Loss immutably.
 */
export function disposeFixedAsset(
  assets: readonly FixedAsset[],
  assetId: string,
  saleProceeds: number,
  disposalDate: string
): FixedAsset[] {
  return assets.map((a) => {
    if (a.id !== assetId) return a;

    const gainOrLoss = saleProceeds - a.currentWdv;
    return {
      ...a,
      status: 'DISPOSED' as AssetStatus,
      disposalDetails: {
        date: disposalDate,
        saleProceeds,
        gainOrLoss,
      },
    };
  });
}

/**
 * Generates official COPAS Opening Depreciation Journal Voucher.
 */
export function generateCopasJournalVoucher(
  summary: DepreciationReportSummary,
  coopName: string = 'उनको बचत तथा ऋण सहकारी संस्था लि. (Unako SACCOS)'
): string {
  const dateStr = new Date().toISOString().split('T')[0];

  return `================================================================================
               ${coopName}
            केन्द्रीय कार्यालय: गढवा-५, दाङ | दर्ता नं: ०७१/०७२
       COPAS स्थिर सम्पत्ति ह्रासकट्टी प्रविष्टि गोश्वारा भौचर (DEPRECIATION JV)
================================================================================
भौचर नम्बर: JV-DEP-${summary.fiscalYear.replace('/', '-')}-01
आर्थिक वर्ष: ${summary.fiscalYear}
मिति: ${dateStr}

[ १. ह्रासकट्टी खर्च तथा पुँजीगत सञ्चिति लेखा प्रविष्टि (JOURNAL ENTRIES) ]
खाताको नाम (Account Head)                     | खाता नं (A/C) | डेबिट रु. (Dr.) | क्रेडिट रु. (Cr.)
---------------------------------------------+---------------+-----------------+-----------------
Dr. ह्रासकट्टी खर्च हिसाब (Depreciation Exp)     | 402-12        |  ${summary.totalDepreciationExpense.toLocaleString('en-IN').padStart(14, ' ')} |               -
Cr. भवन ह्रासकट्टी कोष (Accum Dep - Pool A)   | 108-01        |               - |  ${summary.poolSchedules.POOL_A.depreciationAmount.toLocaleString('en-IN').padStart(14, ' ')}
Cr. फर्निचर ह्रास कोष (Accum Dep - Pool B)   | 108-02        |               - |  ${summary.poolSchedules.POOL_B.depreciationAmount.toLocaleString('en-IN').padStart(14, ' ')}
Cr. सवारी साधन कोष (Accum Dep - Pool C)      | 108-03        |               - |  ${summary.poolSchedules.POOL_C.depreciationAmount.toLocaleString('en-IN').padStart(14, ' ')}
Cr. कम्प्युटर/आईटी कोष (Accum Dep - Pool D)   | 108-04        |               - |  ${summary.poolSchedules.POOL_D.depreciationAmount.toLocaleString('en-IN').padStart(14, ' ')}
Cr. अमूर्त सम्पत्ति कोष (Accum Dep - Pool E) | 108-05        |               - |  ${summary.poolSchedules.POOL_E.depreciationAmount.toLocaleString('en-IN').padStart(14, ' ')}
---------------------------------------------+---------------+-----------------+-----------------
कुल जम्मा (Total Dr. = Cr.)                   |               |  ${summary.totalDepreciationExpense.toLocaleString('en-IN').padStart(14, ' ')} |  ${summary.totalDepreciationExpense.toLocaleString('en-IN').padStart(14, ' ')}

[ २. आयकर ऐन २०५८ अनुसूची २ बमोजिम ह्रासकट्टी संक्षेप ]
१. प्रारम्भिक खुद मूल्य (Opening WDV)          : रु. ${summary.totalOpeningWdv.toLocaleString('en-IN')}
२. चालु आ.व. कुल थप खरिद (Total Additions)     : रु. ${summary.totalAdditions.toLocaleString('en-IN')}
   - योग्य पुँजीकृत रकम (Absorbed)             : रु. ${summary.totalAbsorbedAdditions.toLocaleString('en-IN')}
   - आगामी आ.व.मा सर्ने (Deferred to Next Year): रु. ${summary.totalUnabsorbedAdditions.toLocaleString('en-IN')}
३. लिलाम/बिक्री घटी रकम (Disposals)             : रु. ${summary.totalDisposals.toLocaleString('en-IN')}
४. चालु आ.व. कुल ह्रासकट्टी खर्च (Depreciation) : रु. ${summary.totalDepreciationExpense.toLocaleString('en-IN')}
५. अन्तिम खुद मूल्य (Closing WDV)               : रु. ${summary.totalClosingWdv.toLocaleString('en-IN')}

कैफियत (Narration):
आयकर ऐन २०५८ को अनुसूची २ तथा नेपाल सहकारी लेखामान (COPAS) बमोजिम आर्थिक वर्ष ${summary.fiscalYear} को
स्थिर सम्पत्ति ह्रासकट्टी हिसाब किताब गरी नाफा नोक्सान हिसाबमा खर्च लेखी सम्बन्धित ह्रासकट्टी कोषमा
क्रेडिट गरिएको।

तयार गर्ने (लेखापाल): _______________     जाँच गर्ने (प्रबन्धक): _______________     स्वीकृत गर्ने: _______________
================================================================================`;
}

/**
 * Exports fixed asset registry to standard CSV.
 */
export function exportFixedAssetsToCSV(assets: readonly FixedAsset[]): string {
  const headers = [
    'Asset Code',
    'Asset Name',
    'Pool Category',
    'Purchase Date',
    'Purchase Cost (NPR)',
    'Addition Timing',
    'Branch',
    'Location',
    'Assigned To',
    'Status',
    'Current WDV (NPR)',
    'Accumulated Dep (NPR)',
  ];

  const rows = assets.map((a) => [
    `"${a.assetCode}"`,
    `"${a.name.replace(/"/g, '""')}"`,
    `"${a.category}"`,
    `"${a.purchaseDate}"`,
    a.purchaseCost,
    `"${a.additionTiming}"`,
    `"${a.branchName}"`,
    `"${a.location}"`,
    `"${a.assignedEmployee || '-'}"`,
    `"${a.status}"`,
    a.currentWdv,
    a.accumulatedDepreciation,
  ].join(','));

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Realistic default seed assets for Unako SACCOS.
 */
export const DEFAULT_FIXED_ASSETS: FixedAsset[] = [
  {
    id: 'fa-001',
    assetCode: 'FA-A-001',
    name: 'गढवा मुख्य कार्यालय ३ तले पक्की भवन तथा सिभिल संरचना',
    category: 'POOL_A',
    purchaseDate: '2075-04-01',
    purchaseCost: 18500000,
    additionTiming: 'SHRAWAN_TO_POUSH',
    branchName: 'गढवा मुख्य शाखा',
    location: 'गढवा बजार, दाङ',
    status: 'ACTIVE',
    accumulatedDepreciation: 4125000,
    currentWdv: 14375000,
  },
  {
    id: 'fa-002',
    assetCode: 'FA-B-001',
    name: 'केन्द्रीय बैंकिङ काउन्टर, फायरप्रूफ सेफ तिजोरी तथा क्यास क्याबिन',
    category: 'POOL_B',
    purchaseDate: '2078-05-10',
    purchaseCost: 1250000,
    additionTiming: 'SHRAWAN_TO_POUSH',
    branchName: 'गढवा मुख्य शाखा',
    location: 'काउन्टर हल',
    status: 'ACTIVE',
    accumulatedDepreciation: 520000,
    currentWdv: 730000,
  },
  {
    id: 'fa-003',
    assetCode: 'FA-C-001',
    name: 'शाखा बजार संकलन तथा अनुगमन मोटरसाइकल (रा ६ प ४३२०)',
    category: 'POOL_C',
    purchaseDate: '2079-02-15',
    purchaseCost: 285000,
    additionTiming: 'MAGH_TO_CHAITRA',
    branchName: 'लमही सेवा केन्द्र',
    location: 'लमही शाखा पार्किङ',
    assignedEmployee: 'सुमन केसी (ऋण अधिकृत)',
    status: 'ACTIVE',
    accumulatedDepreciation: 75000,
    currentWdv: 210000,
  },
  {
    id: 'fa-004',
    assetCode: 'FA-D-001',
    name: 'केन्द्रीय कोर बैंकिङ डेल पावरएज सर्भर तथा सेक्युरिटी फायरवाल',
    category: 'POOL_D',
    purchaseDate: '2079-08-12',
    purchaseCost: 850000,
    additionTiming: 'SHRAWAN_TO_POUSH',
    branchName: 'गढवा मुख्य शाखा',
    location: 'सर्भर रुम',
    assignedEmployee: 'प्रविण चौधरी (आइटी अधिकृत)',
    status: 'ACTIVE',
    accumulatedDepreciation: 295000,
    currentWdv: 555000,
  },
  {
    id: 'fa-005',
    assetCode: 'FA-D-002',
    name: 'काउन्टर कम्प्युटर सेट, क्युआर स्क्यानर र पासबुक प्रिन्टर (५ सेट)',
    category: 'POOL_D',
    purchaseDate: '2080-11-20',
    purchaseCost: 450000,
    additionTiming: 'SHRAWAN_TO_POUSH',
    branchName: 'भालुवाङ सेवा केन्द्र',
    location: 'टेलरिङ काउन्टर',
    status: 'ACTIVE',
    accumulatedDepreciation: 0,
    currentWdv: 450000,
  },
  {
    id: 'fa-006',
    assetCode: 'FA-E-001',
    name: 'भालुवाङ सेवा केन्द्र १० वर्षे घरभाडा लिजहोल्ड पार्टिसन तथा डेकोरेसन',
    category: 'POOL_E',
    purchaseDate: '2080-01-10',
    purchaseCost: 600000,
    additionTiming: 'MAGH_TO_CHAITRA',
    branchName: 'भालुवाङ सेवा केन्द्र',
    location: 'शाखा कार्यालय',
    status: 'ACTIVE',
    accumulatedDepreciation: 80000,
    currentWdv: 520000,
  },
];
