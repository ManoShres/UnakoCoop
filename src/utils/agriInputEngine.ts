/**
 * Subsidized Fertilizer & Seed Quota Engine
 * Unako SACCOS - Dang, Lumbini, Nepal
 *
 * Implements Terai Landholding (Bigha-Kattha-Dhur) conversion,
 * Nepal Ministry of Agriculture recommended crop nutrient quota formulas,
 * Government fertilizer subsidy calculations, and seasonal harvest credit limits.
 */

import {
  AgriCropType,
  AgriInputItemType,
  LandholdingArea,
  QuotaEntitlement,
  MemberAgriQuota,
  RequisitionItem,
  AgriInputRequisition,
  FertilizerStockItem,
  CoopSettings,
} from '../types';

/**
 * Recommended quota rates per Kattha (१ कठ्ठा = ३३८.६३ वर्ग मिटर)
 * based on Ministry of Agriculture Terai guidelines
 */
export const CROP_QUOTA_RATES: Record<
  AgriCropType,
  { ureaKg: number; dapKg: number; potashKg: number; seedKg: number; nepaliName: string }
> = {
  PADDY: { ureaKg: 4.5, dapKg: 2.5, potashKg: 1.5, seedKg: 1.5, nepaliName: 'धान (Paddy)' },
  MUSTARD: { ureaKg: 2.0, dapKg: 2.0, potashKg: 1.0, seedKg: 0.25, nepaliName: 'तोरी (Mustard)' },
  MAIZE: { ureaKg: 5.0, dapKg: 3.0, potashKg: 2.0, seedKg: 1.0, nepaliName: 'मकै (Maize)' },
  WHEAT: { ureaKg: 4.0, dapKg: 2.5, potashKg: 1.5, seedKg: 3.0, nepaliName: 'गहुँ (Wheat)' },
  LENTILS: { ureaKg: 1.0, dapKg: 2.0, potashKg: 1.0, seedKg: 1.5, nepaliName: 'दाल/मसुरो (Lentils)' },
};

/**
 * Subsidized vs Open Market Price Catalog (NPR / kg)
 */
export const INPUT_PRICING_CATALOG: Record<
  AgriInputItemType,
  {
    nameNepali: string;
    nameEnglish: string;
    subsidizedRatePerKg: number;
    marketRatePerKg: number;
    bagSizeKg: number;
  }
> = {
  UREA: {
    nameNepali: 'युरिया मल (Urea)',
    nameEnglish: 'Urea Fertilizer 46% N',
    subsidizedRatePerKg: 18, // NPR 900 / 50kg bag
    marketRatePerKg: 35,
    bagSizeKg: 50,
  },
  DAP: {
    nameNepali: 'डीएपी मल (DAP)',
    nameEnglish: 'DAP Fertilizer 18:46:0',
    subsidizedRatePerKg: 48, // NPR 2400 / 50kg bag
    marketRatePerKg: 84,
    bagSizeKg: 50,
  },
  POTASH: {
    nameNepali: 'पोटास मल (Potash MOP)',
    nameEnglish: 'Muriate of Potash 60% K2O',
    subsidizedRatePerKg: 34, // NPR 1700 / 50kg bag
    marketRatePerKg: 62,
    bagSizeKg: 50,
  },
  SEED: {
    nameNepali: 'उन्नत बीउबिजन (Certified Seed)',
    nameEnglish: 'Certified Foundation Seed',
    subsidizedRatePerKg: 75,
    marketRatePerKg: 110,
    bagSizeKg: 25,
  },
  BIO_FERTILIZER: {
    nameNepali: 'जैविक/कम्पोस्ट मल (Organic Fertilizer)',
    nameEnglish: 'Microbial Bio-Fertilizer',
    subsidizedRatePerKg: 22,
    marketRatePerKg: 38,
    bagSizeKg: 40,
  },
  MICRONUTRIENT: {
    nameNepali: 'जिंक तथा सूक्ष्म पोषक (Micronutrients)',
    nameEnglish: 'Zinc Sulphate & Boron Pack',
    subsidizedRatePerKg: 120,
    marketRatePerKg: 180,
    bagSizeKg: 5,
  },
};

/**
 * Converts Terai Bigha, Kattha, Dhur into decimal Kattha units
 * 1 Bigha = 20 Kattha, 1 Kattha = 20 Dhur
 */
export function toTotalKattha(area: LandholdingArea): number {
  const bighaKattha = (area.bigha || 0) * 20;
  const kattha = area.kattha || 0;
  const dhurKattha = (area.dhur || 0) / 20;
  return Number((bighaKattha + kattha + dhurKattha).toFixed(2));
}

/**
 * Formats a clean Devanagari Bigha-Kattha-Dhur string
 */
export function toBighaKatthaDhurString(area: LandholdingArea): string {
  const parts: string[] = [];
  if (area.bigha > 0) parts.push(`${area.bigha.toLocaleString('ne-NP')} बिघा`);
  if (area.kattha > 0) parts.push(`${area.kattha.toLocaleString('ne-NP')} कठ्ठा`);
  if (area.dhur > 0) parts.push(`${area.dhur.toLocaleString('ne-NP')} धुर`);
  return parts.length > 0 ? parts.join(' ') : '० कठ्ठा';
}

/**
 * Calculates statutory quota entitlement for a crop and land area
 */
export function calculateCropQuota(cropType: AgriCropType, totalKattha: number): QuotaEntitlement {
  const rates = CROP_QUOTA_RATES[cropType] || CROP_QUOTA_RATES.PADDY;
  return {
    cropType,
    totalKattha,
    ureaKg: Number((rates.ureaKg * totalKattha).toFixed(1)),
    dapKg: Number((rates.dapKg * totalKattha).toFixed(1)),
    potashKg: Number((rates.potashKg * totalKattha).toFixed(1)),
    seedKg: Number((rates.seedKg * totalKattha).toFixed(2)),
  };
}

/**
 * Calculates pricing, bag count, and government subsidy for an agri input item
 */
export function calculateItemPricing(itemType: AgriInputItemType, quantityKg: number): RequisitionItem {
  const meta = INPUT_PRICING_CATALOG[itemType] || INPUT_PRICING_CATALOG.UREA;
  const bagCount = Math.ceil(quantityKg / meta.bagSizeKg);
  const totalAmount = Math.round(quantityKg * meta.subsidizedRatePerKg);
  const totalMarket = Math.round(quantityKg * meta.marketRatePerKg);
  const governmentSubsidyAmount = totalMarket - totalAmount;

  return {
    itemType,
    itemNameNepali: meta.nameNepali,
    itemNameEnglish: meta.nameEnglish,
    quantityKg,
    bagSizeKg: meta.bagSizeKg,
    bagCount,
    subsidizedRatePerKg: meta.subsidizedRatePerKg,
    marketRatePerKg: meta.marketRatePerKg,
    totalAmount,
    governmentSubsidyAmount,
  };
}

/**
 * Computes requisition financial totals
 */
export function calculateRequisitionTotals(items: readonly any[]): {
  totalMarketValue: number;
  totalSubsidySavings: number;
  netPayableAmount: number;
  marketValueTotal: number;
  subsidyAmount: number;
  subsidizedTotal: number;
} {
  let totalMarketValue = 0;
  let totalSubsidySavings = 0;
  let netPayableAmount = 0;

  for (const item of items) {
    const marketRate = item.marketRatePerKg ?? (INPUT_PRICING_CATALOG[item.itemType as AgriInputItemType]?.marketRatePerKg ?? 0);
    const subRate = item.subsidizedRatePerKg ?? item.ratePerKg ?? (INPUT_PRICING_CATALOG[item.itemType as AgriInputItemType]?.subsidizedRatePerKg ?? 0);
    const qty = item.quantityKg || 0;
    const market = typeof item.marketValue === 'number' ? item.marketValue : Math.round(qty * marketRate);
    const sub = typeof item.totalAmount === 'number' ? item.totalAmount : (typeof item.totalNpr === 'number' ? item.totalNpr : Math.round(qty * subRate));
    const subsidy = typeof item.governmentSubsidyAmount === 'number' ? item.governmentSubsidyAmount : (market - sub);

    totalMarketValue += market;
    totalSubsidySavings += subsidy;
    netPayableAmount += sub;
  }

  return {
    totalMarketValue,
    totalSubsidySavings,
    netPayableAmount,
    marketValueTotal: totalMarketValue,
    subsidyAmount: totalSubsidySavings,
    subsidizedTotal: netPayableAmount,
  };
}

/**
 * Generates official sequential requisition voucher number
 */
export function generateAgriVoucherNumber(dateBS = '2081-04-15', seq = 1): string {
  const cleanDate = (dateBS || '20810415').replace(/[^\d]/g, '') || '20810415';
  const seqFormatted = (seq || 1).toString().padStart(4, '0');
  return `AGR-${cleanDate}-${seqFormatted}`;
}

/**
 * Formats official printable delivery challan
 */
export function formatAgriDeliveryChallan(
  req: AgriInputRequisition,
  coopSettings: CoopSettings
): string {
  const div = '--------------------------------';
  const cropNepali = CROP_QUOTA_RATES[req.cropType]?.nepaliName || req.cropType;

  const itemLines = req.items.map(
    (item) =>
      `- ${item.itemNameNepali}: ${item.quantityKg} केजी (${item.bagCount} बोरा) @ रु. ${item.subsidizedRatePerKg} = रु. ${item.totalAmount.toLocaleString()}`
  );

  return [
    coopSettings.nameNepali,
    coopSettings.name,
    coopSettings.address,
    `दर्ता नं: ${coopSettings.regNo} | पान: ${coopSettings.panNo}`,
    div,
    '*** रासायनिक मल तथा बीउबिजन वितरण चलानी ***',
    `(GOVERNMENT SUBSIDIZED AGRI-INPUT CHALLAN)`,
    div,
    `चलानी नं: ${req.requisitionNo}`,
    `मिति: ${req.dateBS}`,
    `गोदाम स्थान: ${req.warehouseLocation}`,
    `वितरण कर्मचारी: ${req.issuedBy}`,
    div,
    `सदस्य नं: ${req.memberNo}`,
    `सदस्य नाम: ${req.memberName}`,
    `ठेगाना/वार्ड: ${req.ward}`,
    `बाली प्रकार: ${cropNepali}`,
    div,
    'सामग्री विवरण (Items Distributed):',
    ...itemLines,
    div,
    `खुला बजार मूल्य   : रु. ${req.totalMarketValue.toLocaleString()}`,
    `सरकारी अनुदान बचत: रु. ${req.totalSubsidySavings.toLocaleString()}`,
    `खुद बुझाएको रकम  : रु. ${req.netPayableAmount.toLocaleString('ne-NP')}`,
    `भुक्तानी विधि     : ${req.paymentType === 'CASH' ? 'नगद (Cash)' : 'मौसमी कृषि कर्जा (Crop Credit)'}`,
    req.creditDueDate ? `ऋण चुक्ता म्याद   : ${req.creditDueDate}` : '',
    div,
    'प्राप्तकर्ता किसानको दस्तखत: ................',
    'गोदाम प्रमुखको दस्तखत     : ................',
    '',
    'धन्यवाद ! उनाको साकोस कृषि विकास शाखा',
  ]
    .filter(Boolean)
    .join('\n');
}

/**
 * Realistic Mock Quota Registry for Gadhwa, Dang farmers
 */
export const MOCK_MEMBER_AGRI_QUOTAS: MemberAgriQuota[] = [
  {
    id: 'quota-01',
    memberId: 'mem-1',
    memberNo: 'M-00101',
    memberName: 'रामबहादुर चौधरी',
    ward: 'वार्ड नं. १ (गढवा बजार)',
    phone: '9847890123',
    landArea: { bigha: 1, kattha: 5, dhur: 0 }, // 25 Kattha
    totalKattha: 25,
    cropType: 'PADDY',
    entitlement: {
      ureaKg: 112.5,
      dapKg: 62.5,
      potashKg: 37.5,
      seedKg: 37.5,
    },
    consumed: {
      ureaKg: 50,
      dapKg: 50,
      potashKg: 0,
      seedKg: 25,
    },
    remaining: {
      ureaKg: 62.5,
      dapKg: 12.5,
      potashKg: 37.5,
      seedKg: 12.5,
    },
    creditLimit: 30000,
    outstandingCredit: 4500,
  },
  {
    id: 'quota-02',
    memberId: 'mem-2',
    memberNo: 'M-00088',
    memberName: 'सीता देवी यादव',
    ward: 'वार्ड नं. २ (बेला)',
    phone: '9857812345',
    landArea: { bigha: 0, kattha: 15, dhur: 10 }, // 15.5 Kattha
    totalKattha: 15.5,
    cropType: 'MUSTARD',
    entitlement: {
      ureaKg: 31,
      dapKg: 31,
      potashKg: 15.5,
      seedKg: 3.88,
    },
    consumed: {
      ureaKg: 0,
      dapKg: 0,
      potashKg: 0,
      seedKg: 0,
    },
    remaining: {
      ureaKg: 31,
      dapKg: 31,
      potashKg: 15.5,
      seedKg: 3.88,
    },
    creditLimit: 20000,
    outstandingCredit: 0,
  },
  {
    id: 'quota-03',
    memberId: 'mem-4',
    memberNo: 'M-00412',
    memberName: 'अनिता महतो',
    ward: 'वार्ड नं. ३ (बनगाउँ)',
    phone: '9867123987',
    landArea: { bigha: 2, kattha: 0, dhur: 0 }, // 40 Kattha
    totalKattha: 40,
    cropType: 'PADDY',
    entitlement: {
      ureaKg: 180,
      dapKg: 100,
      potashKg: 60,
      seedKg: 60,
    },
    consumed: {
      ureaKg: 100,
      dapKg: 50,
      potashKg: 50,
      seedKg: 50,
    },
    remaining: {
      ureaKg: 80,
      dapKg: 50,
      potashKg: 10,
      seedKg: 10,
    },
    creditLimit: 50000,
    outstandingCredit: 12000,
  },
];

/**
 * Godown Fertilizer & Seed Stock
 */
export const MOCK_FERTILIZER_STOCK: FertilizerStockItem[] = [
  {
    itemType: 'UREA',
    nameNepali: 'युरिया मल (Urea 46% N)',
    nameEnglish: 'Urea Fertilizer',
    totalBagsInStock: 450,
    bagWeightKg: 50,
    subsidizedPricePerBag: 900,
    supplier: 'KRISHI_SAMAGRI_COMPANY',
    quotaAllocatedBags: 280,
    availableBags: 170,
  },
  {
    itemType: 'DAP',
    nameNepali: 'डीएपी मल (DAP 18:46:0)',
    nameEnglish: 'DAP Fertilizer',
    totalBagsInStock: 300,
    bagWeightKg: 50,
    subsidizedPricePerBag: 2400,
    supplier: 'KRISHI_SAMAGRI_COMPANY',
    quotaAllocatedBags: 195,
    availableBags: 105,
  },
  {
    itemType: 'POTASH',
    nameNepali: 'पोटास मल (MOP)',
    nameEnglish: 'Muriate of Potash',
    totalBagsInStock: 180,
    bagWeightKg: 50,
    subsidizedPricePerBag: 1700,
    supplier: 'SALT_TRADING_CORP',
    quotaAllocatedBags: 110,
    availableBags: 70,
  },
  {
    itemType: 'SEED',
    nameNepali: 'उन्नत धान बीउ (साँवा मन्सुली / राधा-४)',
    nameEnglish: 'Certified Paddy Seed',
    totalBagsInStock: 250,
    bagWeightKg: 25,
    subsidizedPricePerBag: 1875,
    supplier: 'LOCAL_SEED_PRODUCER',
    quotaAllocatedBags: 160,
    availableBags: 90,
  },
];

// Ergonomic Aliases
export const MOCK_AGRI_QUOTAS = MOCK_MEMBER_AGRI_QUOTAS;
export const calculateRequisitionTotal = calculateRequisitionTotals;
export const generateAgriChallanId = generateAgriVoucherNumber;
