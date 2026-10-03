/**
 * Types & Domain Models for Agri-Input Advance & Fertilizer/Seed Quotas
 * Unako SACCOS - Gadhwa, Dang, Nepal
 */

export type AgriCropType = 'PADDY' | 'MUSTARD' | 'MAIZE' | 'WHEAT' | 'LENTILS';

export type AgriInputItemType =
  | 'UREA'
  | 'DAP'
  | 'POTASH'
  | 'SEED'
  | 'BIO_FERTILIZER'
  | 'MICRONUTRIENT';

export interface LandholdingArea {
  bigha: number; // १ बिघा = २० कठ्ठा
  kattha: number; // १ कठ्ठा = २० धुर
  dhur: number;
}

export interface QuotaEntitlement {
  cropType: AgriCropType;
  totalKattha: number;
  ureaKg: number;
  dapKg: number;
  potashKg: number;
  seedKg: number;
}

export interface MemberAgriQuota {
  id: string;
  memberId: string;
  memberNo: string;
  memberName: string;
  ward: string;
  phone: string;
  landArea: LandholdingArea;
  totalKattha: number;
  cropType: AgriCropType;
  entitlement: {
    ureaKg: number;
    dapKg: number;
    potashKg: number;
    seedKg: number;
  };
  consumed: {
    ureaKg: number;
    dapKg: number;
    potashKg: number;
    seedKg: number;
  };
  remaining: {
    ureaKg: number;
    dapKg: number;
    potashKg: number;
    seedKg: number;
  };
  creditLimit: number; // Max seasonal credit limit (NPR)
  outstandingCredit: number; // Existing seasonal debt (NPR)
}

export interface RequisitionItem {
  itemType: AgriInputItemType;
  itemNameNepali: string;
  itemNameEnglish: string;
  quantityKg: number;
  bagSizeKg: number;
  bagCount: number;
  subsidizedRatePerKg: number;
  marketRatePerKg: number;
  totalAmount: number;
  governmentSubsidyAmount: number;
}

export interface AgriInputRequisition {
  id: string;
  requisitionNo: string; // e.g. "AGR-2081-06-0001"
  memberId: string;
  memberNo: string;
  memberName: string;
  ward: string;
  cropType: AgriCropType;
  items: RequisitionItem[];
  totalMarketValue: number;
  totalSubsidySavings: number;
  netPayableAmount: number;
  paymentType: 'CASH' | 'SEASONAL_CROP_CREDIT';
  creditDueDate?: string; // YYYY-MM-DD (e.g. Harvest season)
  creditInterestRatePercent: number; // 0% to 6%
  status: 'PENDING_PICKUP' | 'COLLECTED' | 'SETTLED' | 'CANCELLED';
  dateBS: string;
  issuedBy: string;
  warehouseLocation: string;
  remarks?: string;
}

export interface FertilizerStockItem {
  itemType: AgriInputItemType;
  nameNepali: string;
  nameEnglish: string;
  totalBagsInStock: number;
  bagWeightKg: number;
  subsidizedPricePerBag: number;
  supplier: 'KRISHI_SAMAGRI_COMPANY' | 'SALT_TRADING_CORP' | 'LOCAL_SEED_PRODUCER';
  quotaAllocatedBags: number;
  availableBags: number;
}
