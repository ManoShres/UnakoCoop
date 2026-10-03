import React from 'react';
import { CollateralType } from '../../../types';
import { useLanguageStore } from '../../../store/useLanguageStore';

interface LoanOriginationStep3CollateralProps {
  collateralType: CollateralType;
  onCollateralTypeChange: (type: CollateralType) => void;
  collateralPlotNo: string;
  onCollateralPlotNoChange: (plot: string) => void;
  collateralArea: string;
  onCollateralAreaChange: (area: string) => void;
  collateralMarketValue: number;
  onCollateralMarketValueChange: (val: number) => void;
  ltvRatio: number;
  disbursementMethod: 'SAVINGS_ACCOUNT' | 'CHEQUE' | 'CASH';
  onDisbursementMethodChange: (method: 'SAVINGS_ACCOUNT' | 'CHEQUE' | 'CASH') => void;
}

export const LoanOriginationStep3Collateral: React.FC<LoanOriginationStep3CollateralProps> = ({
  collateralType,
  onCollateralTypeChange,
  collateralPlotNo,
  onCollateralPlotNoChange,
  collateralArea,
  onCollateralAreaChange,
  collateralMarketValue,
  onCollateralMarketValueChange,
  ltvRatio,
  disbursementMethod,
  onDisbursementMethodChange,
}) => {
  const { t, fmtPercent } = useLanguageStore();

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          {t('३. धितो मूल्याङ्कन तथा भुक्तानी माध्यम', '3. Collateral Appraisal & Disbursement Channel')}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t(
            'लालपुर्जा/घर/मुद्दती धितोको मूल्याङ्कन र ऋण रकम भुक्तानी हुने माध्यम',
            'Collateral register specifications, market valuation, and payout method.'
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {t('धितो प्रकार *', 'Collateral Type *')}
          </label>
          <select
            value={collateralType}
            onChange={(e) => onCollateralTypeChange(e.target.value as CollateralType)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
          >
            <option value="LAND_LALPURJA">{t('जग्गा लालपुर्जा', 'Land Lalpurja')}</option>
            <option value="BUILDING">{t('घर तथा जग्गा', 'House & Land')}</option>
            <option value="CASH_FD_PLEDGE">{t('मुद्दती रसिद रोक्का', 'FD Pledge')}</option>
            <option value="SHARE_PLEDGE">{t('सहकारी शेयर रोक्का', 'Share Pledge')}</option>
            <option value="LIVESTOCK">{t('गाई/भैंसी पशुपालन', 'Livestock')}</option>
            <option value="GOLD_JEWELLERY">{t('सुन/चाँदी गहना', 'Gold Jewellery')}</option>
            <option value="VEHICLE">{t('सवारी साधन', 'Vehicle')}</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {t('कित्ता नं. / सिट नं. / धितो पहिचान *', 'Plot No. / Sheet / Identifier *')}
          </label>
          <input
            type="text"
            value={collateralPlotNo}
            onChange={(e) => onCollateralPlotNoChange(e.target.value)}
            placeholder="जस्तै: कित्ता नं. २१५, सिट नं. ४/ख"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {t('क्षेत्रफल / विवरण', 'Area / Dimensions')}
          </label>
          <input
            type="text"
            value={collateralArea}
            onChange={(e) => onCollateralAreaChange(e.target.value)}
            placeholder="जस्तै: २ कट्ठा वा ५ आना"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {t('धितोको बजार मूल्याङ्कन (रु.) *', 'Assessed Market Value (NPR) *')}
          </label>
          <input
            type="number"
            step={50000}
            min={50000}
            value={collateralMarketValue}
            onChange={(e) => onCollateralMarketValueChange(Number(e.target.value))}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            {t('कर्जा-धितो अनुपात', 'Loan-to-Value (LTV)')}
          </label>
          <div className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono font-bold flex items-center justify-between">
            <span>{fmtPercent(ltvRatio)}</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                ltvRatio <= 60
                  ? 'bg-emerald-100 text-emerald-700'
                  : ltvRatio <= 80
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-rose-100 text-rose-700'
              }`}
            >
              {ltvRatio <= 60
                ? t('सुरक्षित', 'Safe')
                : ltvRatio <= 80
                ? t('मध्यम', 'Moderate')
                : t('उच्च जोखिम', 'High Risk')}
            </span>
          </div>
        </div>
      </div>

      {/* Disbursement Channel */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
        <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
          {t('कर्जा रकम भुक्तानी हुने माध्यम *', 'Disbursement Channel *')}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label
            className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2.5 transition ${
              disbursementMethod === 'SAVINGS_ACCOUNT'
                ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-bold'
                : 'border-slate-200 dark:border-slate-700'
            }`}
          >
            <input
              type="radio"
              name="disburseMethod"
              checked={disbursementMethod === 'SAVINGS_ACCOUNT'}
              onChange={() => onDisbursementMethodChange('SAVINGS_ACCOUNT')}
              className="size-4 text-emerald-600"
            />
            <div className="text-xs">
              <div>{t('बचत खातामा जम्मा', 'Member Savings')}</div>
              <div className="text-[10px] opacity-75">{t('पासबुकमा सिधै जम्मा', 'Direct to Passbook')}</div>
            </div>
          </label>

          <label
            className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2.5 transition ${
              disbursementMethod === 'CHEQUE'
                ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-bold'
                : 'border-slate-200 dark:border-slate-700'
            }`}
          >
            <input
              type="radio"
              name="disburseMethod"
              checked={disbursementMethod === 'CHEQUE'}
              onChange={() => onDisbursementMethodChange('CHEQUE')}
              className="size-4 text-emerald-600"
            />
            <div className="text-xs">
              <div>{t('एकाउन्ट पेयी चेक', 'Account Payee Cheque')}</div>
              <div className="text-[10px] opacity-75">{t('सहकारी चेक जारी', 'Crossed Cheque')}</div>
            </div>
          </label>

          <label
            className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2.5 transition ${
              disbursementMethod === 'CASH'
                ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-bold'
                : 'border-slate-200 dark:border-slate-700'
            }`}
          >
            <input
              type="radio"
              name="disburseMethod"
              checked={disbursementMethod === 'CASH'}
              onChange={() => onDisbursementMethodChange('CASH')}
              className="size-4 text-emerald-600"
            />
            <div className="text-xs">
              <div>{t('काउन्टर नगद भुक्तानी', 'Counter Cash')}</div>
              <div className="text-[10px] opacity-75">{t('नगद भर्पाइ मार्फत', 'Cash Voucher')}</div>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};
