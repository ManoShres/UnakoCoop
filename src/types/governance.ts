/**
 * Governance, Communication, Settings, and Reporting Domain Types
 */

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  category: 'Membership' | 'Loan Request' | 'Savings & Rates' | 'Technical Issue' | 'General';
  status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED';
  date: string;
  reply?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  type: 'SYSTEM' | 'FINANCE' | 'ALERT' | 'PROMO';
  isRead: boolean;
  actionUrl?: string;
}

export interface Notice {
  id: string;
  title: string;
  titleNepali: string;
  category: 'AGM' | 'FESTIVAL' | 'DIVIDEND' | 'POLICY' | 'GENERAL';
  content: string;
  publishedDate: string;
  isUrgent: boolean;
  isActive: boolean;
}

export interface AgmDetails {
  edition: string;
  editionNepali?: string;
  editionEnglish?: string;
  dateNepali: string;
  dateEnglish: string;
  time: string;
  timeNepali?: string;
  timeEnglish?: string;
  venue: string;
  venueNepali?: string;
  venueEnglish?: string;
  totalDelegates: number;
  digitalPassEnabled: boolean;
}

export interface CoopSettings {
  name: string;
  nameNepali: string;
  regNo: string;
  regNoEnglish?: string;
  panNo: string;
  address: string;
  addressNepali?: string;
  addressEnglish?: string;
  phone: string;
  phoneEnglish?: string;
  email: string;
  openingHours: string;
  openingHoursNepali?: string;
  openingHoursEnglish?: string;
  operatingStatus: 'NORMAL' | 'MAINTENANCE';
}

export interface ThemeColors {
  primary: string;
  primaryContainer: string;
  secondary: string;
  accent: string;
  accentLight: string;
  canvas: string;
  card: string;
}

export interface ChatColors {
  /** Floating launcher button gradient start & popup header gradient start */
  launcherFrom: string;
  /** Floating launcher button gradient end & popup header gradient end */
  launcherTo: string;
  /** Floating launcher button hover gradient start */
  launcherHoverFrom: string;
  /** Floating launcher button hover gradient end */
  launcherHoverTo: string;
  /** Notification badge background */
  badge: string;
  /** Popup minimize button background */
  minimizeButton: string;
  /** Popup minimize button hover */
  minimizeButtonHover: string;
}

export interface ThemePreset {
  id: string;
  name: string;
  nameNepali: string;
  description: string;
  descriptionNepali: string;
  colors: ThemeColors;
}

export interface FeatureFlags {
  enableEBallot: boolean;
  enableDividendClaim: boolean;
  enableAgmPass: boolean;
  enableGrievance: boolean;
  enableLoanApplication: boolean;
  enableSharePurchase: boolean;
  enableSavingsTransfer: boolean;
  enableSupportChat: boolean;
  enableSystemTour: boolean;
}

export interface DesignSettings {
  selectedPresetId: string;
  colors: ThemeColors;
  chatColors: ChatColors;
  customLogoUrl: string | null;
  features: FeatureFlags;
}

// ---------------------------------------------------------------------------
// Report types (dynamic generated reports)
// ---------------------------------------------------------------------------

export interface GeneratedReport {
  id: string;
  title: string;
  titleNepali: string;
  category: 'FINANCIAL' | 'REGULATORY' | 'GOVERNANCE' | 'SUPERVISORY' | 'OPERATIONAL';
  fiscalYear: string;
  period: string;
  generatedAt: string;
  generatedBy: string;
  generatedByName?: string;
  data: Record<string, unknown>;
  downloadUrl?: string;
  status: 'READY' | 'GENERATING' | 'ERROR';
}

// ---------------------------------------------------------------------------
// PEARLS analysis types
// ---------------------------------------------------------------------------

export interface PearlsBreakdownItem {
  category: string;
  categoryNepali: string;
  amount: number;
  percentage: number;
  color: string;
  changePercent?: number;
}

export interface PearlsRiskMetrics {
  portfolioAtRisk: number;
  portfolioAtRiskPercent: number;
  repaymentRate: number;
  averageLoanSize: number;
  savingsToLoanRatio: number;
  totalActiveLoans: number;
  totalDelinquentLoans: number;
}

export interface PearlsTrendPoint {
  label: string;
  labelNepali?: string;
  savings: number;
  loans: number;
  shares: number;
  deposits: number;
  total: number;
}

export interface PearlsAnalysis {
  period: string;
  periodNepali?: string;
  totalAssets: number;
  totalAssetsNepali?: string;
  breakdown: PearlsBreakdownItem[];
  riskMetrics: PearlsRiskMetrics;
  trends: PearlsTrendPoint[];
  generatedAt: string;
}
