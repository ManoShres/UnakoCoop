import React, { useState } from 'react';
import { CheckCircle2, Check, Zap, Calculator } from 'lucide-react';
import { useLanguageStore } from '../../../../store/useLanguageStore';
import { formatNPR } from '../../../../utils/nepaliDate';

interface LoanTopUpCalculatorProps {
  onApplyInstant: () => void;
}

export const LoanTopUpCalculator: React.FC<LoanTopUpCalculatorProps> = ({ onApplyInstant }) => {
  const { t } = useLanguageStore();
  const [topUpAmount, setTopUpAmount] = useState(100000);
  const [tenorMonths, setTenorMonths] = useState(18);

  const interestRate = 0.085;
  const monthlyRate = interestRate / 12;
  const estimatedEmi = Math.round(
    (topUpAmount * monthlyRate * Math.pow(1 + monthlyRate, tenorMonths)) /
    (Math.pow(1 + monthlyRate, tenorMonths) - 1)
  );
  const rebateRelief = Math.round(topUpAmount * 0.015 * (tenorMonths / 12));

  return (
    <div className="bg-surface-card rounded-2xl p-6 shadow-sm border border-outline-variant/15" id="calculator-section">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Banner Details */}
        <div className="lg:col-span-5 flex flex-col justify-between h-full">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full font-label-sm text-xs font-bold mb-3">
              <Zap className="w-3.5 h-3.5" />
              {t('१-क्लिक तत्काल पूर्व-स्वीकृति', '1-Click Instant Pre-Approval')}
            </div>
            <h3 className="font-headline text-xl sm:text-2xl text-on-surface font-bold tracking-tight">
              {t('थप कृषि पुँजी आवश्यक छ?', 'Need additional farm capital?')}
            </h3>
            <p className="font-body-md text-xs sm:text-sm text-on-surface-variant mt-2 leading-relaxed">
              {t(
                'उनको सहकारीसँगको १००% समयमै किस्ता तिरेको उत्कृष्ट ट्र्याक रेकर्डका आधारमा, तपाईं विना अतिरिक्त धितो ',
                'Based on your pristine 100% on-time track record with Unako SACCOS, you are pre-qualified for an instant Top-Up Agro loan of up to '
              )}
              <strong className="text-on-surface font-bold">NPR 1,50,000</strong>
              {t(' सम्मको तत्काल टप-अप कर्जाका लागि योग्य हुनुहुन्छ।', ' with no additional mortgage paperwork.')}
            </p>
            <div className="space-y-2 mt-4">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-on-surface">
                <Check className="w-4 h-4 text-status-success shrink-0" />
                <span>{t('८.५% सहुलियतपूर्ण घट्दो ब्याजदर', 'Diminishing subsidized rate at 8.5% p.a.')}</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-on-surface">
                <Check className="w-4 h-4 text-status-success shrink-0" />
                <span>{t('नियमित बचतमा तत्काल रकम जम्मा', 'Immediate disbursement into Regular Savings')}</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-on-surface">
                <Check className="w-4 h-4 text-status-success shrink-0" />
                <span>{t('दाना, उपकरण वा पशुपालन विस्तारका लागि', 'Covers feed purchase, milking units, or livestock')}</span>
              </div>
            </div>
          </div>
          <div className="pt-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0 shadow-2xs">
                ADS
              </div>
              <p className="font-label-sm text-xs text-on-surface-variant">
                {t('नेपाल कृषि विकास रणनीति २०८१ अन्तर्गत स्वीकृत', 'Approved under Nepal Agriculture Development Strategy 2081')}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Interactive Slider & EMI Estimator Module */}
        <div className="lg:col-span-7 bg-surface-container-low rounded-xl p-6 border border-outline-variant/20">
          <div className="flex flex-col gap-4">
            {/* Loan Amount Slider */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-label-md text-xs sm:text-sm text-on-surface font-bold">
                  {t('इच्छित टप-अप रकम', 'Desired Top-Up Amount')}
                </span>
                <span className="text-base sm:text-lg font-bold font-tabular-mono text-primary" id="topup-amount-display">
                  NPR {formatNPR(topUpAmount, true)}
                </span>
              </div>
              <input
                className="w-full accent-primary h-2 bg-surface-container-high rounded-lg cursor-pointer"
                id="topup-range"
                max={150000}
                min={30000}
                step={5000}
                type="range"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(Number(e.target.value))}
              />
              <div className="flex justify-between font-label-sm text-xs text-on-surface-variant mt-1.5 font-semibold">
                <span>NPR 30,000 (Min)</span>
                <span>NPR 1,50,000 (Max Limit)</span>
              </div>
            </div>

            {/* Tenor Selector Buttons */}
            <div>
              <span className="font-label-md text-xs sm:text-sm text-on-surface font-bold block mb-1.5">
                {t('भुक्तानी अवधि (महिना)', 'Repayment Tenor (Months)')}
              </span>
              <div className="grid grid-cols-3 gap-3" id="tenor-selector">
                {[12, 18, 24].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setTenorMonths(m)}
                    className={`py-2 px-3 rounded-xl font-label-md text-xs font-bold text-center transition-all cursor-pointer ${
                      tenorMonths === m
                        ? 'bg-primary text-on-primary shadow-xs'
                        : 'bg-surface-card hover:bg-surface-container text-on-surface border border-outline-variant/20'
                    }`}
                  >
                    {m} {t('महिना', 'Months')}
                  </button>
                ))}
              </div>
            </div>

            {/* Calculated Metrics Output Mosaic */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-surface-card p-4 rounded-xl border border-outline-variant/15">
              <div>
                <span className="font-label-sm text-[11px] text-on-surface-variant block font-semibold">
                  {t('अनुमानित मासिक किस्ता', 'Estimated Monthly EMI')}
                </span>
                <p className="text-base sm:text-lg font-bold font-tabular-mono text-primary mt-0.5" id="calc-emi">
                  NPR {formatNPR(estimatedEmi, true)}
                </p>
                <span className="font-label-sm text-[10px] text-on-surface-variant">Principal + Int.</span>
              </div>
              <div>
                <span className="font-label-sm text-[11px] text-on-surface-variant block font-semibold">
                  {t('प्रभावी ब्याजदर', 'Effective Rate')}
                </span>
                <p className="text-base sm:text-lg font-bold font-tabular-mono text-on-surface mt-0.5">8.50%</p>
                <span className="font-label-sm text-[10px] text-status-success font-bold">Subsidized</span>
              </div>
              <div>
                <span className="font-label-sm text-[11px] text-on-surface-variant block font-semibold">
                  {t('सरकारी अनुदान राहत', 'Govt. Rebate Relief')}
                </span>
                <p className="text-base sm:text-lg font-bold font-tabular-mono text-status-success mt-0.5" id="calc-rebate">
                  NPR {formatNPR(rebateRelief, true)}
                </p>
                <span className="font-label-sm text-[10px] text-on-surface-variant">Total subsidy</span>
              </div>
            </div>

            {/* Trigger Instant Apply Modal/Action */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
              <button
                onClick={onApplyInstant}
                className="w-full sm:w-auto flex-1 bg-primary hover:bg-primary/90 text-on-primary py-3 px-5 rounded-xl font-label-md text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                <span>{t('१-क्लिक स्वीकृतिसहित आवेदन दिनुहोस्', 'Apply with 1-Click Approval')}</span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full sm:w-auto bg-surface-card hover:bg-surface-container px-4 py-3 rounded-xl font-label-md text-xs sm:text-sm text-on-surface font-semibold transition-all flex items-center justify-center gap-1.5 border border-outline-variant/30 cursor-pointer"
              >
                <Calculator className="w-4 h-4 text-primary" />
                <span>{t('प्रक्षेपण डाउनलोड गर्नुहोस्', 'Download Projection')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
