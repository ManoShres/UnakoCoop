import React from 'react';
import { Award, PlusCircle, CheckCircle2, ShieldCheck, BadgeCheck } from 'lucide-react';
import { useLanguageStore } from '../../../store/useLanguageStore';
import { useDesignStore } from '../../../store/useDesignStore';

interface ShareCapitalSectionProps {
  onOpenCertModal: () => void;
  onOpenPurchaseModal: () => void;
  shareCapital?: number;
}

export function ShareCapitalSection({
  onOpenCertModal,
  onOpenPurchaseModal,
  shareCapital = 50000,
}: ShareCapitalSectionProps) {
  const { t, fmtCurrency } = useLanguageStore();
  const features = useDesignStore((s) => s.settings.features);

  const shareCount = Math.round(shareCapital / 100);

  return (
    <section className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="font-label-sm text-xs text-primary uppercase font-bold tracking-wider">
            {t('खण्ड ०१ • सदस्य सेयर पुँजी', 'Part 01 • Member Share Capital')}
          </span>
          <h2 className="font-headline text-xl sm:text-2xl font-bold text-on-surface tracking-tight">
            {t('सेयर पुँजी तथा लाभांश विवरण', 'Share Capital & Dividend Ledgers')}
          </h2>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-card hover:bg-surface-container text-on-surface shadow-xs transition-all font-label-md text-xs font-bold border border-outline-variant/20 cursor-pointer"
            id="btnViewCert"
            onClick={onOpenCertModal}
          >
            <BadgeCheck className="w-4 h-4 text-primary" />
            <span>{t('डिजिटल प्रमाणपत्र हेर्नुहोस्', 'View Digital Certificate')}</span>
          </button>
          {features.enableSharePurchase && (
            <button
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-bold shadow-xs transition-all font-label-md text-xs cursor-pointer"
              id="btnOpenShareModal"
              onClick={onOpenPurchaseModal}
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('थप सेयर खरिद', 'Purchase Additional Shares')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Share Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Certificate Card */}
        <div className="lg:col-span-5 bg-surface-card rounded-2xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden border border-outline-variant/15">
          <div className="absolute -right-8 -top-8 w-36 h-36 bg-surface-container-low rounded-full pointer-events-none"></div>
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                <span className="font-label-md text-xs sm:text-sm font-bold text-on-surface">
                  {t('उनको सेयर स्वामित्व', 'Unako Share Ownership')}
                </span>
              </div>
              <span className="px-2.5 py-1 bg-primary/10 text-primary font-label-sm text-xs rounded-full font-bold">
                {t('प्रमाणित अभिलेख', 'Verified Ledger')}
              </span>
            </div>
            <div className="space-y-2.5 my-4">
              <div className="flex justify-between items-baseline py-2 bg-surface-container-low/50 px-3 rounded-xl border border-outline-variant/10">
                <span className="font-body-sm text-xs text-on-surface-variant">
                  {t('बाँडफाँट सेयर कित्ता:', 'Allocated Share Count:')}
                </span>
                <span className="font-headline text-base font-bold text-on-surface">
                  {shareCount} {t('कित्ता', 'Shares')}
                </span>
              </div>
              <div className="flex justify-between items-baseline py-1.5 px-3">
                <span className="font-body-sm text-xs text-on-surface-variant">
                  {t('प्रति कित्ता दर:', 'Par Value per Share:')}
                </span>
                <span className="font-body-md text-xs sm:text-sm font-semibold text-on-surface">
                  {t('रु. १००.००', 'NPR 100.00')}
                </span>
              </div>
              <div className="flex justify-between items-baseline py-2 px-3 bg-surface-container-low/50 rounded-xl border border-outline-variant/10">
                <span className="font-body-sm text-xs text-on-surface-variant">
                  {t('कुल सेयर पुँजी:', 'Total Share Capital:')}
                </span>
                <span className="font-headline text-lg font-extrabold text-primary tabular-nums">
                  {fmtCurrency(shareCapital, true)}
                </span>
              </div>
              <div className="flex justify-between items-baseline py-1.5 px-3">
                <span className="font-body-sm text-xs text-on-surface-variant">
                  {t('प्रमाणपत्र दर्ता नं.:', 'Certificate Registry No.:')}
                </span>
                <span className="font-tabular-mono text-xs text-on-surface-variant font-bold">
                  SC-2070-0419
                </span>
              </div>
              <div className="flex justify-between items-baseline py-2 px-3 bg-surface-container-low/50 rounded-xl border border-outline-variant/10">
                <span className="font-body-sm text-xs text-on-surface-variant">
                  {t('सहकारी सदस्य मिति:', 'Cooperative Member Since:')}
                </span>
                <span className="font-body-sm text-xs text-on-surface font-semibold">
                  {t('२०७० वैशाख १२ (गढवा)', '2070 Baisakh 12 (Gadhwa)')}
                </span>
              </div>
            </div>
          </div>
          <div className="pt-4 flex items-center justify-between border-t border-outline-variant/10">
            <div className="flex items-center gap-1.5 text-on-surface-variant text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-status-success" />
              <span>{t('गैर-सदस्यलाई हस्तान्तरण गर्न नमिल्ने', 'Non-transferable to non-members')}</span>
            </div>
            <button
              className="font-label-sm text-xs text-primary font-bold hover:underline cursor-pointer"
              onClick={onOpenCertModal}
            >
              {t('छाप तथा प्रमाणपत्र हेर्नुहोस् →', 'Preview Seal →')}
            </button>
          </div>
        </div>

        {/* AGM Dividend History & Chart */}
        <div className="lg:col-span-7 bg-surface-card rounded-2xl p-6 shadow-sm flex flex-col justify-between border border-outline-variant/15">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="font-headline text-base sm:text-lg font-bold text-on-surface">
                {t('वार्षिक साधारण सभा लाभांश अभिलेख', 'Annual AGM Dividend Records')}
              </h3>
              <p className="font-body-sm text-xs text-on-surface-variant">
                {t('सदस्यको बचत खातामा जम्मा भएको ऐतिहासिक नगद लाभांश', 'Historical cash dividend distribution to member savings')}
              </p>
            </div>
            <span className="font-label-sm text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-bold">
              {t('औसत प्रतिफल: ११.३%', 'Avg. Yield: 11.3%')}
            </span>
          </div>

          {/* Dividend Data Table / List */}
          <div className="space-y-2.5 mb-4">
            {/* Item 1: Proposed 31st AGM */}
            <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl border border-outline-variant/15">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold shadow-2xs">
                  ३१
                </div>
                <div>
                  <p className="font-label-md text-xs sm:text-sm font-bold text-on-surface">
                    {t('३१औं साधारण सभा प्रस्तावित लाभांश', '31st AGM Proposed Dividend')}
                  </p>
                  <p className="font-label-sm text-[11px] text-on-surface-variant">
                    {t('आर्थिक वर्ष २०८०/८१ • आगामी अनुमोदन', 'Fiscal Year 2080/81 • Upcoming Approval')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="font-headline text-base font-extrabold text-primary">12.0%</div>
                <p className="font-label-sm text-[11px] text-on-surface-variant">
                  {t('अनुमानित रु. ६,०००.००', 'Est. NPR 6,000.00')}
                </p>
              </div>
            </div>

            {/* Item 2: FY 2079/80 */}
            <div className="flex items-center justify-between p-3 bg-surface-container-low/60 rounded-xl border border-outline-variant/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-surface-container text-on-surface flex items-center justify-center font-bold">
                  ३०
                </div>
                <div>
                  <p className="font-label-md text-xs sm:text-sm font-bold text-on-surface">
                    {t('३०औं वार्षिक साधारण सभा', '30th Annual General Assembly')}
                  </p>
                  <p className="font-label-sm text-[11px] text-on-surface-variant">
                    {t('आ.व. २०७९/८० • जम्मा मिति २०८० कार्तिक ०८', 'FY 2079/80 • Credited 2080 Kartik 08')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="font-headline text-base font-bold text-on-surface">11.2%</div>
                <p className="font-label-sm text-[11px] text-status-success font-semibold">
                  {t('+रु. ५,६००.०० जम्मा भयो', '+NPR 5,600.00 Credited')}
                </p>
              </div>
            </div>

            {/* Item 3: FY 2078/79 */}
            <div className="flex items-center justify-between p-3 bg-surface-container-low/60 rounded-xl border border-outline-variant/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-surface-container text-on-surface flex items-center justify-center font-bold">
                  २९
                </div>
                <div>
                  <p className="font-label-md text-xs sm:text-sm font-bold text-on-surface">
                    {t('२९औं वार्षिक साधारण सभा', '29th Annual General Assembly')}
                  </p>
                  <p className="font-label-sm text-[11px] text-on-surface-variant">
                    {t('आ.व. २०७८/७९ • जम्मा मिति २०७९ मंसिर ०२', 'FY 2078/79 • Credited 2079 Mangshir 02')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="font-headline text-base font-bold text-on-surface">10.8%</div>
                <p className="font-label-sm text-[11px] text-status-success font-semibold">
                  {t('+रु. ५,४००.०० जम्मा भयो', '+NPR 5,400.00 Credited')}
                </p>
              </div>
            </div>
          </div>

          {/* Dividend Trend Sparkline Visualization */}
          <div className="bg-surface-container-low p-3 rounded-xl flex items-center justify-between border border-outline-variant/15">
            <div className="text-on-surface-variant font-body-sm text-xs">
              <span className="font-bold text-on-surface">{t('३-वर्षे वृद्धि सूचक:', '3-Year Growth Vector:')}</span>{' '}
              {t('सदस्य कर्जा बचतबाट निरन्तर प्रतिफल भुक्तानी।', 'Consistent payout from member-led loan surpluses.')}
            </div>
            <svg className="w-32 h-7 text-primary overflow-visible" fill="none" viewBox="0 0 120 30">
              <path d="M 5 22 Q 40 20 60 14 T 115 6" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.5"></path>
              <circle className="fill-primary" cx="5" cy="22" r="3"></circle>
              <circle className="fill-primary" cx="60" cy="14" r="3"></circle>
              <circle className="fill-brand-accent-lime stroke-primary" cx="115" cy="6" r="3.5" strokeWidth="2"></circle>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
