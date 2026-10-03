import React, { useState } from 'react';
import {
  Sprout,
  ShieldCheck,
  TrendingDown,
  Printer,
  Calendar,
  Layers,
  Info,
  CheckCircle2,
  Sparkles,
  MapPin,
  CreditCard,
  PackageCheck,
  Wheat,
} from 'lucide-react';
import { useLanguageStore } from '../../../../store/useLanguageStore';
import { useCoopStore } from '../../../../store/useCoopStore';
import { useAuthStore } from '../../../../store/useAuthStore';
import { printElement } from '../../../../utils/printHelper';
import {
  MOCK_AGRI_QUOTAS,
  INPUT_PRICING_CATALOG,
  toBighaKatthaDhurString,
  calculateRequisitionTotal,
} from '../../../../utils/agriInputEngine';
import { MemberAgriQuota } from '../../../../types';

export const MemberAgriQuotaSection: React.FC = () => {
  const { t, fmtCurrency, fmtDigits } = useLanguageStore();
  const currentMember = useAuthStore((s) => s.currentMember);
  const coopSettings = useCoopStore((s) => s.coopSettings);

  const effectiveMemberId = currentMember?.id || 'mem-1';

  // Find member's active quota or default to mock quota for Ram Bahadur Chaudhary
  const memberQuota: MemberAgriQuota =
    MOCK_AGRI_QUOTAS.find(
      (q) => q.memberId === effectiveMemberId || q.memberId === 'mem-1'
    ) || MOCK_AGRI_QUOTAS[0];

  const [activeSeason, setActiveSeason] = useState<'KHARIF' | 'RABI'>('KHARIF');

  // Compute market value savings for member
  const sampleRequisitionItems = [
    {
      itemType: 'UREA' as const,
      quantityKg: memberQuota.consumed.ureaKg,
      ratePerKg: INPUT_PRICING_CATALOG.UREA.subsidizedRatePerKg,
      totalNpr: memberQuota.consumed.ureaKg * INPUT_PRICING_CATALOG.UREA.subsidizedRatePerKg,
    },
    {
      itemType: 'DAP' as const,
      quantityKg: memberQuota.consumed.dapKg,
      ratePerKg: INPUT_PRICING_CATALOG.DAP.subsidizedRatePerKg,
      totalNpr: memberQuota.consumed.dapKg * INPUT_PRICING_CATALOG.DAP.subsidizedRatePerKg,
    },
    {
      itemType: 'SEED' as const,
      quantityKg: memberQuota.consumed.seedKg,
      ratePerKg: INPUT_PRICING_CATALOG.SEED.subsidizedRatePerKg,
      totalNpr: memberQuota.consumed.seedKg * INPUT_PRICING_CATALOG.SEED.subsidizedRatePerKg,
    },
  ];

  const pricingSummary = calculateRequisitionTotal(sampleRequisitionItems);

  const availableCredit = Math.max(
    0,
    memberQuota.creditLimit - memberQuota.outstandingCredit
  );

  const handlePrintQuotaPass = () => {
    printElement(`agri-quota-member-pass-${memberQuota.id}`, {
      format: 'a4',
      title: `Agri-Quota-Pass-${memberQuota.memberNo}`,
    });
  };

  const nutrientCards = [
    {
      type: 'UREA',
      titleNepali: 'युरिया मल (Urea)',
      subText: '46% N नाइट्रोजन',
      entitledKg: memberQuota.entitlement.ureaKg,
      consumedKg: memberQuota.consumed.ureaKg,
      remainingKg: memberQuota.remaining.ureaKg,
      rate: INPUT_PRICING_CATALOG.UREA.subsidizedRatePerKg,
      marketRate: INPUT_PRICING_CATALOG.UREA.marketRatePerKg,
      color: 'emerald',
      bgBar: 'bg-emerald-500',
    },
    {
      type: 'DAP',
      titleNepali: 'डीएपी मल (DAP)',
      subText: '18:46:0 फस्फोरस',
      entitledKg: memberQuota.entitlement.dapKg,
      consumedKg: memberQuota.consumed.dapKg,
      remainingKg: memberQuota.remaining.dapKg,
      rate: INPUT_PRICING_CATALOG.DAP.subsidizedRatePerKg,
      marketRate: INPUT_PRICING_CATALOG.DAP.marketRatePerKg,
      color: 'blue',
      bgBar: 'bg-blue-500',
    },
    {
      type: 'POTASH',
      titleNepali: 'पोटास मल (MOP)',
      subText: '60% K2O पोटासियम',
      entitledKg: memberQuota.entitlement.potashKg,
      consumedKg: memberQuota.consumed.potashKg,
      remainingKg: memberQuota.remaining.potashKg,
      rate: INPUT_PRICING_CATALOG.POTASH.subsidizedRatePerKg,
      marketRate: INPUT_PRICING_CATALOG.POTASH.marketRatePerKg,
      color: 'amber',
      bgBar: 'bg-amber-500',
    },
    {
      type: 'SEED',
      titleNepali: 'उन्नत बीउ (Certified Seed)',
      subText: 'साँवा मन्सुली / राधा-४',
      entitledKg: memberQuota.entitlement.seedKg,
      consumedKg: memberQuota.consumed.seedKg,
      remainingKg: memberQuota.remaining.seedKg,
      rate: INPUT_PRICING_CATALOG.SEED.subsidizedRatePerKg,
      marketRate: INPUT_PRICING_CATALOG.SEED.marketRatePerKg,
      color: 'indigo',
      bgBar: 'bg-indigo-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="p-6 rounded-3xl bg-linear-to-r from-emerald-600/15 via-emerald-500/5 to-transparent border border-emerald-500/25 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white">
                {t('सहुलियतपूर्ण रासायनिक मल तथा बीउबिजन कोटा', 'Subsidized Agri-Input Quota')}
              </span>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                {t('नेपाल सरकार तथा गढवा गाउँपालिका कोटा प्रणाली', 'Ministry of Agriculture Statutory Quota')}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {t('अन्नदाता सदस्य मल-बीउ कोटा तथा मौसमी साख', 'Farmer Member Fertilizer Quota & Crop Credit')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              {t(
                'जग्गाधनी दर्ता तथा बाली अनुसार युरिया, डीएपी, पोटास र उन्नत बीउ सरकारी अनुदानित मूल्यमा सुनिश्चित! बाली पाकेपछि मात्र भुक्तानी गर्न सकिने ०% ब्याज मौसमी कृषि कर्जा सुविधा।',
                'Guaranteed statutory fertilizer & seed allocation based on landholding. Avail 0% interest seasonal crop credit payable upon post-harvest marketing.'
              )}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handlePrintQuotaPass}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-emerald-600 text-white text-xs font-bold shadow-md hover:bg-slate-800 transition"
            >
              <Printer className="size-4" />
              {t('डिजिटल कोटा पास छाप्नुहोस्', 'Print Digital Quota Pass')}
            </button>
          </div>
        </div>
      </div>

      {/* Member Land & Credit Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Land Area */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-1">
            <span>{t('दर्ता जग्गा क्षेत्रफल', 'REGISTERED LAND')}</span>
            <MapPin className="size-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white font-mono">
            {toBighaKatthaDhurString(memberQuota.landArea)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {fmtDigits(memberQuota.totalKattha)} {t('कठ्ठा खेतीयोग्य जमिन', 'Kattha Cultivable Area')} • {memberQuota.ward}
          </div>
        </div>

        {/* Selected Crop */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-1">
            <span>{t('हालको मौसमी बाली', 'CURRENT CROP')}</span>
            <Wheat className="size-4 text-amber-500" />
          </div>
          <div className="text-xl font-black text-amber-600 dark:text-amber-400">
            {t('बर्खे धान (Paddy)', 'Monsoon Paddy')}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {t('२०८१/८२ सिजन • साउन-कात्तिक', 'FY 2081/82 Season')}
          </div>
        </div>

        {/* Seasonal Credit Limit */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-1">
            <span>{t('मौसमी कृषि साख सीमा', 'SEASONAL CROP CREDIT')}</span>
            <CreditCard className="size-4 text-blue-600" />
          </div>
          <div className="text-xl font-black text-blue-600 dark:text-blue-400 font-mono">
            {fmtCurrency(memberQuota.creditLimit)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {t('बाँकी सीमा:', 'Available:')} <strong className="text-emerald-600 font-mono">{fmtCurrency(availableCredit)}</strong>
          </div>
        </div>

        {/* Subsidy Savings */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-1">
            <span>{t('सहकारी अनुदान बचत', 'SUBSIDY SAVINGS')}</span>
            <Sparkles className="size-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {fmtCurrency(pricingSummary.subsidyAmount)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {t('खुला बजारभन्दा बचत रकम', 'Saved vs Open Market')}
          </div>
        </div>
      </div>

      {/* Nutrient Quota Status Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sprout className="size-5 text-emerald-600" />
            {t('मल तथा बीउ कोटा उपभोग विवरण', 'Fertilizer & Seed Quota Breakdown')}
          </h4>
          <span className="text-xs text-slate-500 font-mono">
            {t('सरकारी दर अनुसार कोटा आरक्षित', 'Government Subsidized Allocation')}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {nutrientCards.map((item) => {
            const pct = Math.min(100, Math.round((item.consumedKg / item.entitledKg) * 100)) || 0;
            return (
              <div
                key={item.type}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="font-bold text-sm text-slate-900 dark:text-white">
                        {item.titleNepali}
                      </h5>
                      <span className="text-[11px] text-slate-400">{item.subText}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                      रु. {item.rate}/kg
                    </span>
                  </div>

                  <div className="mt-4 flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        {t('बाँकी कोटा', 'Remaining')}
                      </span>
                      <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                        {fmtDigits(item.remainingKg)}{' '}
                        <span className="text-xs font-normal text-slate-500">kg</span>
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        {t('कुल कोटा', 'Quota')}
                      </span>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300 font-mono">
                        {fmtDigits(item.entitledKg)} kg
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`${item.bgBar} h-full rounded-full transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
                      <span>{t('प्राप्त:', 'Drawn:')} {fmtDigits(item.consumedKg)} kg</span>
                      <span>{fmtDigits(pct)}% {t('उपभोग', 'Used')}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{t('बजार मूल्य:', 'Market Rate:')}</span>
                  <span className="line-through text-slate-400 font-mono">रु. {item.marketRate}/kg</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Printable Digital Quota Pass Sheet (Hidden on Screen, Visible on Print) */}
      <div
        id={`agri-quota-member-pass-${memberQuota.id}`}
        className="hidden print:block p-8 bg-white text-slate-900 border border-slate-300 rounded-lg max-w-3xl mx-auto font-sans"
      >
        <div className="text-center border-b pb-4 mb-4">
          <h2 className="text-xl font-black">{coopSettings.nameNepali || coopSettings.name}</h2>
          <p className="text-xs text-slate-600">{coopSettings.address} • फोन: {coopSettings.phone}</p>
          <div className="mt-2 inline-block px-4 py-1 bg-slate-100 border border-slate-300 text-xs font-bold rounded">
            रासायनिक मल तथा बीउबिजन डिजिटल कोटा प्रमाण-पत्र (Farmer Quota Pass)
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs mb-4">
          <div>
            <p><strong>सदस्यको नाम:</strong> {memberQuota.memberName}</p>
            <p><strong>सदस्य नं.:</strong> {memberQuota.memberNo}</p>
            <p><strong>ठेगाना:</strong> {memberQuota.ward}, दाङ</p>
            <p><strong>सम्पर्क नं.:</strong> {memberQuota.phone}</p>
          </div>
          <div className="text-right">
            <p><strong>दर्ता जग्गा:</strong> {toBighaKatthaDhurString(memberQuota.landArea)} ({fmtDigits(memberQuota.totalKattha)} कठ्ठा)</p>
            <p><strong>मौसमी बाली:</strong> धान (Paddy)</p>
            <p><strong>मौसमी साख सीमा:</strong> रु. {memberQuota.creditLimit.toLocaleString('ne-NP')}</p>
            <p><strong>जारी मिति:</strong> {new Date().toLocaleDateString('ne-NP')}</p>
          </div>
        </div>

        <table className="w-full text-xs border border-collapse border-slate-300 mb-6">
          <thead>
            <tr className="bg-slate-100">
              <th className="border p-2 text-left">सामग्रीको विवरण</th>
              <th className="border p-2 text-right">कुल स्वीकृत कोटा</th>
              <th className="border p-2 text-right">हालसम्म प्राप्त</th>
              <th className="border p-2 text-right">बाँकी कोटा मौज्दात</th>
              <th className="border p-2 text-right">अनुदानित दर</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2 font-bold">युरिया मल (Urea)</td>
              <td className="border p-2 text-right">{memberQuota.entitlement.ureaKg} kg</td>
              <td className="border p-2 text-right">{memberQuota.consumed.ureaKg} kg</td>
              <td className="border p-2 text-right font-bold text-emerald-700">{memberQuota.remaining.ureaKg} kg</td>
              <td className="border p-2 text-right">रु. {INPUT_PRICING_CATALOG.UREA.subsidizedRatePerKg}/kg</td>
            </tr>
            <tr>
              <td className="border p-2 font-bold">डीएपी मल (DAP)</td>
              <td className="border p-2 text-right">{memberQuota.entitlement.dapKg} kg</td>
              <td className="border p-2 text-right">{memberQuota.consumed.dapKg} kg</td>
              <td className="border p-2 text-right font-bold text-emerald-700">{memberQuota.remaining.dapKg} kg</td>
              <td className="border p-2 text-right">रु. {INPUT_PRICING_CATALOG.DAP.subsidizedRatePerKg}/kg</td>
            </tr>
            <tr>
              <td className="border p-2 font-bold">पोटास मल (Potash MOP)</td>
              <td className="border p-2 text-right">{memberQuota.entitlement.potashKg} kg</td>
              <td className="border p-2 text-right">{memberQuota.consumed.potashKg} kg</td>
              <td className="border p-2 text-right font-bold text-emerald-700">{memberQuota.remaining.potashKg} kg</td>
              <td className="border p-2 text-right">रु. {INPUT_PRICING_CATALOG.POTASH.subsidizedRatePerKg}/kg</td>
            </tr>
            <tr>
              <td className="border p-2 font-bold">उन्नत बीउबिजन (Seed)</td>
              <td className="border p-2 text-right">{memberQuota.entitlement.seedKg} kg</td>
              <td className="border p-2 text-right">{memberQuota.consumed.seedKg} kg</td>
              <td className="border p-2 text-right font-bold text-emerald-700">{memberQuota.remaining.seedKg} kg</td>
              <td className="border p-2 text-right">रु. {INPUT_PRICING_CATALOG.SEED.subsidizedRatePerKg}/kg</td>
            </tr>
          </tbody>
        </table>

        <div className="flex justify-between items-end pt-12 text-xs">
          <div className="text-center">
            <div className="w-32 border-b border-slate-400 mb-1"></div>
            <span>सदस्यको दस्तखत</span>
          </div>
          <div className="text-center">
            <div className="w-32 border-b border-slate-400 mb-1"></div>
            <span>गोदाम इन्चार्ज / कृषि अधिकृत</span>
          </div>
        </div>
      </div>
    </div>
  );
};
