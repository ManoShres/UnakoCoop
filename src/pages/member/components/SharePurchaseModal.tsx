import React, { useState } from 'react';
import { useLanguageStore } from '../../../store/useLanguageStore';
import {
  PiggyBank,
  ShieldCheck,
  X,
  TrendingUp,
  Wallet,
  Zap,
  Smartphone,
  Receipt,
  Lock,
  BadgeCheck,
} from 'lucide-react';

interface SharePurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export function SharePurchaseModal({ isOpen, onClose, onSubmit }: SharePurchaseModalProps) {
  const { t } = useLanguageStore();
  const [quantity, setQuantity] = useState<number>(100);
  const [paymentSource, setPaymentSource] = useState<'savings' | 'digital' | 'voucher'>('savings');

  if (!isOpen) return null;

  const pricePerShare = 100;
  const currentShares = 500;
  const maxCeiling = 2000;

  const handleQtyChange = (val: number) => {
    const clamped = Math.max(10, Math.min(maxCeiling, val));
    setQuantity(clamped);
  };

  const capitalOutlay = quantity * pricePerShare;
  const newTotalShares = currentShares + quantity;
  const newTotalCapital = newTotalShares * pricePerShare;
  const projectedDividend = Math.round(newTotalCapital * 0.12);

  return (
    <div onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-dark/70 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto" id="sharePurchaseModal">
          <div className="bg-surface-card w-full max-w-2xl rounded-2xl shadow-2xl border border-emerald-900/20 my-auto overflow-hidden animate-modal-in flex flex-col">
            {/* Header */}
            <div className="px-space-lg py-space-md bg-surface-container-low border-b border-outline-variant/30 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center">
                    <PiggyBank className="w-5 h-5" />
                  </span>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                    {t('थप सेयर खरिद आवेदन', 'Apply for Additional Shares')}
                  </h3>
                  <span className="sm:inline-flex items-center gap-1 text-[11px] bg-brand-accent-light text-primary px-2.5 py-0.5 rounded-full font-semibold border border-emerald-200/60">
                    <ShieldCheck className="w-3.5 h-3.5 text-status-success" />
                    {t('सहकारी ऐन २०७४ बमोजिम', 'Per Cooperatives Act 2074')}
                  </span>
                </div>
                <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">
                  {t('उनको बचत तथा ऋण सहकारी संस्था लि. • सेयर पुँजी अभिवृद्धि योजना (आ.व. २०८१/८२)', 'Unako SACCOS Ltd. • Share Capital Enhancement Scheme (FY 2081/82)')}
                </p>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-full text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors cursor-pointer" title={t('बन्द गर्नुहोस्', 'Close')}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-space-lg space-y-space-md overflow-y-auto max-h-[75vh]">
              {/* Member & Current Share Holdings Summary Bar */}
              <div className="bg-emerald-50/60 rounded-xl p-space-md border border-emerald-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
                <div>
                  <span className="text-[11px] text-on-surface-variant block font-medium">{t('सदस्य विवरण', 'Member Profile')}:</span>
                  <span className="font-bold text-on-surface">{t('श्री हरि प्रसाद चौधरी', 'Mr. Hari Prasad Chaudhary')}</span>
                  <span className="font-tabular-mono text-primary font-semibold block text-[11px]">UKO-2070-08842 ({t('गढवा-५, दाङ', 'Gadhwa-5, Dang')})</span>
                </div>
                <div className="h-px sm:h-8 bg-emerald-200/60 w-full sm:w-[1px]"></div>
                <div>
                  <span className="text-[11px] text-on-surface-variant block font-medium">{t('हालको सेयर', 'Current Shares')}:</span>
                  <span className="font-bold text-emerald-950 font-headline-sm">{t('५०० कित्ता (रु. ५०,०००)', '500 Shares (NPR 50,000)')}</span>
                </div>
                <div className="h-px sm:h-8 bg-emerald-200/60 w-full sm:w-[1px]"></div>
                <div>
                  <span className="text-[11px] text-on-surface-variant block font-medium">{t('खरिद सीमा', 'Eligible Ceiling')}:</span>
                  <span className="font-semibold text-primary">{t('अधिकतम २,००० कित्ता बाँकी', 'Max 2,000 shares remaining')}</span>
                  <span className="text-[10px] text-on-surface-variant block">{t('अधिकतम सीमा: २,५०० कित्ता (१५%)', 'Maximum ceiling: 2,500 shares (15%)')}</span>
                </div>
              </div>

              {/* Interactive Share Purchase Configuration */}
              <div className="space-y-space-sm">
                <div className="flex items-center justify-between">
                  <label className="font-label-md text-label-md font-bold text-on-surface flex items-center gap-1.5" htmlFor="shareQtyInput">
                    <span>{t('थप सेयर कित्ता सङ्ख्या', 'Quantity of Additional Shares')}</span>
                    <span className="text-error">*</span>
                  </label>
                  <span className="text-xs font-tabular-mono text-on-surface-variant">{t('दर: रु. १००/कित्ता', 'Rate: NPR 100/share')}</span>
                </div>
                {/* Quantity Input with Stepper Buttons */}
                <div className="relative flex items-center rounded-xl border border-outline-variant/30 bg-surface-container-low overflow-hidden">
                  <button
                    onClick={() => handleQtyChange(quantity - 10)}
                    className="px-4 py-3 bg-surface-card hover:bg-surface-container-high text-on-surface font-bold text-lg border-r border-outline-variant/30 transition-colors cursor-pointer"
                    type="button"
                  >
                    −
                  </button>
                  <input
                    className="w-full h-12 px-4 bg-transparent text-center font-headline-sm text-headline-sm font-bold text-on-surface focus:outline-none"
                    id="shareQtyInput"
                    max={maxCeiling}
                    min={10}
                    step={10}
                    type="number"
                    value={quantity}
                    onChange={(e) => handleQtyChange(parseInt(e.target.value) || 10)}
                  />
                  <button
                    onClick={() => handleQtyChange(quantity + 10)}
                    className="px-4 py-3 bg-surface-card hover:bg-surface-container-high text-on-surface font-bold text-lg border-l border-outline-variant/30 transition-colors cursor-pointer"
                    type="button"
                  >
                    +
                  </button>
                </div>
                {/* Quick Select Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-xs text-on-surface-variant self-center mr-1">{t('द्रुत छनोट:', 'Quick Select:')}</span>
                  {[10, 50, 100, 250, 500].map((step) => (
                    <button
                      key={step}
                      onClick={() => handleQtyChange(step)}
                      className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-colors cursor-pointer ${
                        quantity === step
                          ? 'bg-primary-container text-on-primary-container'
                          : 'bg-surface-container-high hover:bg-primary/20 text-on-surface'
                      }`}
                      type="button"
                    >
                      +{step} {t('कित्ता', 'Shares')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Financial Breakdown & Projected Benefits Box */}
              <div className="bg-surface-container-low rounded-xl p-space-md border border-outline-variant/30 space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between text-on-surface-variant">
                  <span>{t('प्रति कित्ता दर:', 'Par Value per Share:')}</span>
                  <span className="font-semibold text-on-surface">{t('रु. १००.०० (बिना कुनै प्रिमियम)', 'NPR 100.00 (Zero Premium)')}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>{t('थप सेयर रकम:', 'Capital Outlay:')}</span>
                  <span className="font-bold text-on-surface">NPR {capitalOutlay.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>{t('दर्ता तथा प्रमाणीकरण शुल्क:', 'Stamp & Registration Fee:')}</span>
                  <span className="font-semibold text-status-success">{t('रु. ०.०० (निःशुल्क)', 'NPR 0.00 (Free)')}</span>
                </div>
                <div className="flex justify-between text-on-surface-variant pt-1 border-t border-outline-variant/30">
                  <span>{t('नयाँ कुल सेयर स्वामित्व:', 'New Total Share Ownership:')}</span>
                  <span className="font-bold text-primary">
                    {newTotalShares} {t('कित्ता', 'Shares')} (NPR {newTotalCapital.toLocaleString()})
                  </span>
                </div>
                <div className="flex justify-between items-center bg-brand-accent-light p-2 rounded-lg text-primary font-semibold">
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-status-success" />
                    {t('अनुमानित वार्षिक लाभांश (@ १२.०%):', 'Projected Annual Dividend (@ 12.0%):')}
                  </span>
                  <span className="font-bold text-status-success">NPR {projectedDividend.toLocaleString()} / yr</span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-outline-variant/30">
                  <span className="font-bold text-on-surface text-sm sm:text-base">{t('कुल भुक्तानी रकम:', 'Total Payable:')}</span>
                  <span className="font-headline-md text-headline-md font-extrabold text-primary">NPR {capitalOutlay.toLocaleString()}.00</span>
                </div>
              </div>

              {/* Source of Funds Selection */}
              <div className="space-y-2">
                <label className="font-label-md text-label-md font-bold text-on-surface block">{t('भुक्तानीको स्रोत', 'Source of Payment')}</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <label
                    onClick={() => setPaymentSource('savings')}
                    className={`flex flex-col justify-between p-3 rounded-xl border-2 cursor-pointer relative shadow-xs ${
                      paymentSource === 'savings' ? 'border-primary bg-emerald-50/50' : 'border-outline-variant/30 bg-surface-card'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <Wallet className="w-4.5 h-4.5 text-primary" />
                        <span className="font-bold text-xs text-on-surface">{t('नियमित बचत खाता', 'Regular Savings')}</span>
                      </div>
                      <input checked={paymentSource === 'savings'} onChange={() => setPaymentSource('savings')} className="accent-primary" name="paymentSource" type="radio" value="savings"/>
                    </div>
                    <span className="text-[11px] text-on-surface-variant font-medium">{t('मौज्दात: रु. १,८४,५००', 'Balance: NPR 184,500')}</span>
                    <span className="text-[10px] text-status-success font-semibold mt-1 flex items-center gap-0.5">
                      <Zap className="w-3 h-3" /> {t('तुरुन्तै मिलान', 'Instant Clearance')}
                    </span>
                  </label>

                  <label
                    onClick={() => setPaymentSource('digital')}
                    className={`flex flex-col justify-between p-3 rounded-xl border cursor-pointer relative ${
                      paymentSource === 'digital' ? 'border-primary bg-emerald-50/50' : 'border-outline-variant/30 bg-surface-card'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <Smartphone className="w-4.5 h-4.5 text-primary" />
                        <span className="font-bold text-xs text-on-surface">{t('डिजिटल भुक्तानी', 'Digital Gateway')}</span>
                      </div>
                      <input checked={paymentSource === 'digital'} onChange={() => setPaymentSource('digital')} className="accent-primary" name="paymentSource" type="radio" value="digital"/>
                    </div>
                    <span className="text-[11px] text-on-surface-variant font-medium">eSewa / Khalti / ConnectIPS</span>
                    <span className="text-[10px] text-on-surface-variant mt-1">{t('नेपाल पे गेटवे', 'NepalPay Rails')}</span>
                  </label>

                  <label
                    onClick={() => setPaymentSource('voucher')}
                    className={`flex flex-col justify-between p-3 rounded-xl border cursor-pointer relative ${
                      paymentSource === 'voucher' ? 'border-primary bg-emerald-50/50' : 'border-outline-variant/30 bg-surface-card'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <Receipt className="w-4.5 h-4.5 text-primary" />
                        <span className="font-bold text-xs text-on-surface">{t('बैंक भौचर दाखिला', 'Bank Voucher')}</span>
                      </div>
                      <input checked={paymentSource === 'voucher'} onChange={() => setPaymentSource('voucher')} className="accent-primary" name="paymentSource" type="radio" value="voucher"/>
                    </div>
                    <span className="text-[11px] text-on-surface-variant font-medium">{t('राष्ट्रिय वाणिज्य / कृषि विकास', 'RBB / ADBL Bank')}</span>
                    <span className="text-[10px] text-on-surface-variant mt-1">{t('भौचर स्लिप अपलोड', 'Voucher Slip Upload')}</span>
                  </label>
                </div>
              </div>

              {/* Cooperative Statutory Declaration & Terms */}
              <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/30">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input defaultChecked={true} className="mt-0.5 h-4 w-4 rounded accent-primary text-primary focus:ring-0 cursor-pointer" id="shareTermsAgree" type="checkbox"/>
                  <span className="text-xs text-on-surface leading-relaxed">
                    {t(
                      'म सहकारीको विनियम, साधारण सभाको निर्णय तथा सहकारी ऐन २०७४ को अधिनमा रही थप सेयर खरिद गर्न मन्जुर गर्दछु। खरिद गरिएको सेयर गैर-सदस्यलाई हस्तान्तरण गर्न पाइने छैन तथा आगामी साधारण सभा (AGM) को लाभांश वितरणमा गणना हुनेछ।',
                      'I agree to subscribe to additional shares pursuant to the cooperative bylaws, AGM decisions, and Cooperatives Act 2074. Shares are non-transferable to non-members and will accrue AGM dividends.'
                    )}
                  </span>
                </label>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="px-space-lg py-space-md bg-surface-card border-t border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 text-xs text-on-surface-variant w-full sm:w-auto">
                <Lock className="w-4 h-4 text-status-success" />
                <span>{t('२५६-बिट सुरक्षित सहकारी ट्रान्ज्याक्सन', '256-Bit Encrypted Secure Cooperative Rail')}</span>
              </div>
              <div className="flex items-center gap-space-sm w-full sm:w-auto justify-end">
                <button onClick={onClose} className="px-space-md py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-xs sm:text-sm transition-colors cursor-pointer w-1/3 sm:w-auto text-center" type="button">
                  {t('रद्द गर्नुहोस्', 'Cancel')}
                </button>
                <button
                  onClick={onSubmit}
                  className="px-space-lg py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer w-2/3 sm:w-auto"
                  id="btnSubmitShareOrder"
                  type="button"
                >
                  <BadgeCheck className="w-4.5 h-4.5" />
                  <span>{t('थप सेयर खरिद पुष्टि गर्नुहोस्', 'Confirm Share Purchase')} (NPR {capitalOutlay.toLocaleString()})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
