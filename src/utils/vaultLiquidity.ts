/**
 * Multi-Branch Service Center Cash Vault & Liquidity Management Engine
 * Complies with Nepal Cooperative Act 2074 & PEARLS Liquidity Standard (E9 / L1)
 */

export type VaultStatus = 'NORMAL' | 'SURPLUS_WARNING' | 'DEFICIT_CRITICAL';

export type TransitStatus = 'REQUESTED' | 'IN_TRANSIT' | 'VAULTED';

export interface ServiceCenter {
  id: string;
  code: string;
  name: string;
  nameNepali: string;
  address: string;
  custodianName: string;
  custodianPhone: string;
  currentVaultCash: number;
  minReserveLimit: number;
  maxHoldingCeiling: number;
  bankAccountNo?: string;
  commercialBank?: string;
  status: VaultStatus;
}

export interface CashTransitRecord {
  id: string;
  fromLocation: string;
  toLocation: string;
  amount: number;
  initiatedAt: string;
  custodianName: string;
  authorizedBy: string;
  securityCarrier: string;
  status: TransitStatus;
  verificationOtp: string;
  notes?: string;
}

export interface NetworkLiquidityAnalysis {
  totalPhysicalVaultCash: number;
  totalCommercialBankBalance: number;
  totalLiquidAssets: number;
  totalMemberSavingsDeposit: number;
  liquidityRatioPercent: number; // PEARLS E9 (Target: 10% - 15%)
  isPearlsCompliant: boolean;
  benchmarkStatus: 'OPTIMAL' | 'BELOW_MINIMUM' | 'EXCESS_IDLE_CASH';
  surplusBranchesCount: number;
  deficitBranchesCount: number;
}

/**
 * Standard seed service centers in Dang District for Unako SACCOS
 */
export const INITIAL_SERVICE_CENTERS: readonly ServiceCenter[] = [
  {
    id: 'sc-gdh-01',
    code: 'HQ-GDH',
    name: 'Gadhwa Central Head Office & Vault',
    nameNepali: 'गढवा केन्द्रीय मुख्य कार्यालय तथा तिजोरी',
    address: 'Gadhwa-5, Dang',
    custodianName: 'Bishnu Prasad Sharma (Chief Cashier)',
    custodianPhone: '9857821001',
    currentVaultCash: 1450000,
    minReserveLimit: 500000,
    maxHoldingCeiling: 3000000,
    commercialBank: 'Rastriya Banijya Bank, Lamahi Branch',
    bankAccountNo: '1280100002341001',
    status: 'NORMAL',
  },
  {
    id: 'sc-lmh-02',
    code: 'SC-LMH',
    name: 'Lamahi Market Service Center',
    nameNepali: 'लमही बजार सेवा केन्द्र',
    address: 'Lamahi-3, Dang',
    custodianName: 'Sunita Chaudhary (Branch In-Charge)',
    custodianPhone: '9847812002',
    currentVaultCash: 850000,
    minReserveLimit: 300000,
    maxHoldingCeiling: 1200000,
    commercialBank: 'NIC Asia Bank, Lamahi',
    bankAccountNo: '0450123891001',
    status: 'NORMAL',
  },
  {
    id: 'sc-blb-03',
    code: 'SC-BLB',
    name: 'Bhalubang Rapti Counter',
    nameNepali: 'भालुवाङ राप्ती काउन्टर',
    address: 'Rapti Rural Municipality, Bhalubang',
    custodianName: 'Dipak Dangi (Cashier)',
    custodianPhone: '9868923003',
    currentVaultCash: 1150000,
    minReserveLimit: 200000,
    maxHoldingCeiling: 1000000,
    commercialBank: 'Nepal Bank Ltd, Bhalubang',
    bankAccountNo: '02810000941',
    status: 'SURPLUS_WARNING', // Exceeds 1,000,000 ceiling!
  },
  {
    id: 'sc-gbd-04',
    code: 'SC-GBD',
    name: 'Gobardiha Rural Extension Desk',
    nameNepali: 'गोबरडिहा ग्रामीण सेवा केन्द्र',
    address: 'Gadhwa-3, Gobardiha',
    custodianName: 'Anita Yadav (Field Incharge)',
    custodianPhone: '9819834004',
    currentVaultCash: 85000,
    minReserveLimit: 150000,
    maxHoldingCeiling: 600000,
    commercialBank: 'Rastriya Banijya Bank, Lamahi',
    bankAccountNo: '1280100002341001',
    status: 'DEFICIT_CRITICAL', // Below 150,000 min reserve!
  },
  {
    id: 'sc-klb-05',
    code: 'SC-KLB',
    name: 'Koilabas Border Collection Booth',
    nameNepali: 'कोइलाबास सिमाना संकलन काउन्टर',
    address: 'Gadhwa-8, Koilabas',
    custodianName: 'Manoj Kumar Gupta (Field Officer)',
    custodianPhone: '9847945005',
    currentVaultCash: 210000,
    minReserveLimit: 100000,
    maxHoldingCeiling: 400000,
    commercialBank: 'Rastriya Banijya Bank, Lamahi',
    bankAccountNo: '1280100002341001',
    status: 'NORMAL',
  },
] as const;

/**
 * Evaluates vault cash health based on statutory operating boundaries
 */
export function evaluateBranchVaultStatus(
  currentCash: number,
  minReserve: number,
  maxCeiling: number
): VaultStatus {
  if (currentCash < minReserve) {
    return 'DEFICIT_CRITICAL';
  }
  if (currentCash > maxCeiling) {
    return 'SURPLUS_WARNING';
  }
  return 'NORMAL';
}

/**
 * Calculates consolidated network liquidity and PEARLS E9 ratio
 * Target: 10% - 15% liquid funds against total member savings deposits
 */
export function calculateNetworkLiquidity(
  serviceCenters: readonly ServiceCenter[],
  commercialBankBalances: number,
  totalMemberSavings: number
): NetworkLiquidityAnalysis {
  const totalPhysicalVaultCash = serviceCenters.reduce(
    (sum, sc) => sum + sc.currentVaultCash,
    0
  );
  const totalLiquidAssets = totalPhysicalVaultCash + commercialBankBalances;

  const liquidityRatioPercent =
    totalMemberSavings > 0
      ? Math.round((totalLiquidAssets / totalMemberSavings) * 100 * 10) / 10
      : 0;

  const isPearlsCompliant = liquidityRatioPercent >= 10 && liquidityRatioPercent <= 18;

  let benchmarkStatus: NetworkLiquidityAnalysis['benchmarkStatus'] = 'OPTIMAL';
  if (liquidityRatioPercent < 10) {
    benchmarkStatus = 'BELOW_MINIMUM';
  } else if (liquidityRatioPercent > 18) {
    benchmarkStatus = 'EXCESS_IDLE_CASH';
  }

  const surplusBranchesCount = serviceCenters.filter(
    (sc) => sc.currentVaultCash > sc.maxHoldingCeiling
  ).length;

  const deficitBranchesCount = serviceCenters.filter(
    (sc) => sc.currentVaultCash < sc.minReserveLimit
  ).length;

  return {
    totalPhysicalVaultCash,
    totalCommercialBankBalance: commercialBankBalances,
    totalLiquidAssets,
    totalMemberSavingsDeposit: totalMemberSavings,
    liquidityRatioPercent,
    isPearlsCompliant,
    benchmarkStatus,
    surplusBranchesCount,
    deficitBranchesCount,
  };
}

/**
 * Dispatches an audited cash-in-transit (CIT) security transfer request
 */
export function createCashTransitRequest(
  fromLocation: string,
  toLocation: string,
  amount: number,
  custodianName: string,
  authorizedBy: string,
  securityCarrier: string,
  notes?: string
): CashTransitRecord {
  const randomSeq = Math.floor(1000 + Math.random() * 9000);
  const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');

  return {
    id: `CIT-${dateStr}-${randomSeq}`,
    fromLocation,
    toLocation,
    amount,
    initiatedAt: new Date().toISOString(),
    custodianName,
    authorizedBy,
    securityCarrier,
    status: 'IN_TRANSIT',
    verificationOtp: randomOtp,
    notes,
  };
}
