export interface RateSchemeConfig {
  type: string;
  rate: number;
  desc: string;
  compounding: 'Daily' | 'Monthly' | 'Quarterly' | 'Half-Yearly';
  minBalance: number;
  tdsRate: number; // statutory 5% TDS
  prematurePenalty: number;
}
