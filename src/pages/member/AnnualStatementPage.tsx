import React from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { useCoopStore } from '../../store/useCoopStore';
import { Landmark, Printer, Award, ShieldCheck } from 'lucide-react';

export const AnnualStatementPage: React.FC = () => {
  const { currentMember } = useAuthStore();
  const { t } = useLanguageStore();
  const { coopSettings } = useCoopStore();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4">
      {/* Action Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-emerald-950 pb-4 print:hidden">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('वार्षिक वित्तीय तथा कर विवरण', 'Official Annual Financial Statement')}
          </h1>
          <p className="text-xs text-slate-500">
            {t('कर-अनुकूल सदस्य लाभांश र बचत खाताको आधिकारिक अडिट प्रतिवेदन', 'Tax-compliant member dividend and savings ledger audit report')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors shadow-sm"
          >
            <Printer className="size-4" />
            <span>{t('विवरण छाप्नुहोस्', 'Print Statement')}</span>
          </button>
        </div>
      </div>

      {/* Official Certificate / Statement Canvas */}
      <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-8 bg-white dark:bg-[#0c1a0e] shadow-lg print:shadow-none print:border-none">
        {/* Cooperative Header */}
        <div className="flex items-start justify-between border-b-2 border-emerald-500 pb-6 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-2xl bg-[#13ec37] flex items-center justify-center text-slate-950 shadow-md">
              <Landmark className="size-7" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight uppercase">
                {coopSettings.name}
              </h2>
              <p className="text-xs font-semibold text-emerald-600 dark:text-[#13ec37]">
                {coopSettings.nameNepali}
              </p>
              <p className="text-[10px] text-slate-400">
                {t(`दर्ता नं: ${coopSettings.regNo} • ${coopSettings.address} • फोन: ${coopSettings.phone}`, `Reg No: ${coopSettings.regNo} • ${coopSettings.address} • Tel: ${coopSettings.phone}`)}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">{t('आर्थिक वर्ष', 'Fiscal Year')}</span>
            <span className="text-sm font-black text-slate-900 dark:text-white font-mono">२०८०/२०८१ (2024/2025)</span>
            <span className="text-[10px] text-emerald-600 block font-semibold mt-1">
              {t('आधिकारिक लेखा परीक्षण प्रतिलिपि', 'Official Certified Audit Copy')}
            </span>
          </div>
        </div>

        {/* Member Particulars */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 text-xs border border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-slate-400 block">{t('सदस्यको नाम', 'Member Name')}:</span>
            <p className="font-bold text-slate-900 dark:text-white mt-0.5">{currentMember?.name || 'Hari Prasad Chaudhary'}</p>
          </div>
          <div>
            <span className="text-slate-400 block">{t('सदस्यता नं.', 'Member No')}:</span>
            <p className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">{currentMember?.memberNo || 'UKO-2070-08842'}</p>
          </div>
          <div>
            <span className="text-slate-400 block">{t('नागरिकता नं.', 'Citizenship No')}:</span>
            <p className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">{currentMember?.citizenshipNo || '28-01-72-04912'}</p>
          </div>
          <div>
            <span className="text-slate-400 block">{t('शेयर पूँजी लगानी', 'Share Capital')}:</span>
            <p className="font-bold text-emerald-600 dark:text-[#13ec37] mt-0.5">
              NPR {(currentMember?.shareCapital || 50000).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Financial Summary Ledger */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {t('एकीकृत बचत तथा वित्तीय मौज्दात विवरण', 'Consolidated Member Ledger Summary')}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400">
                  <th className="py-2.5">{t('खाता शीर्षक', 'Account Title')}</th>
                  <th className="py-2.5">{t('खाता नं.', 'A/C Number')}</th>
                  <th className="py-2.5 text-right">{t('डेबिट (झिकेको रकम)', 'Debit (Withdrawals/EMI)')}</th>
                  <th className="py-2.5 text-right">{t('क्रेडिट (जम्मा/ब्याज)', 'Credit (Deposits/Interest)')}</th>
                  <th className="py-2.5 text-right font-bold">{t('अन्तिम मौज्दात', 'Closing Balance')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                <tr>
                  <td className="py-3 font-semibold text-slate-900 dark:text-white">
                    {t('नियमित बचत खाता (८.०% प्रति वर्ष)', 'Regular Savings Account (8.0% p.a.)')}
                  </td>
                  <td className="py-3 font-mono text-slate-400">004-10294-88-01</td>
                  <td className="py-3 text-right text-slate-500">NPR 45,200</td>
                  <td className="py-3 text-right text-emerald-600 dark:text-[#13ec37]">NPR 2,29,700</td>
                  <td className="py-3 text-right font-bold text-slate-900 dark:text-white">NPR 1,84,500</td>
                </tr>
                <tr>
                  <td className="py-3 font-semibold text-slate-900 dark:text-white">
                    {t('अनिवार्य मासिक बचत खाता', 'Compulsory Monthly Savings')}
                  </td>
                  <td className="py-3 font-mono text-slate-400">004-10294-88-02</td>
                  <td className="py-3 text-right text-slate-500">-</td>
                  <td className="py-3 text-right text-emerald-600 dark:text-[#13ec37]">NPR 24,000</td>
                  <td className="py-3 text-right font-bold text-slate-900 dark:text-white">NPR 68,000</td>
                </tr>
                <tr>
                  <td className="py-3 font-semibold text-slate-900 dark:text-white">
                    {t('मुद्दती निक्षेप (१०.०% प्रति वर्ष)', 'Fixed Term Deposit (10.0% p.a.)')}
                  </td>
                  <td className="py-3 font-mono text-slate-400">FD-001-9482</td>
                  <td className="py-3 text-right text-slate-500">-</td>
                  <td className="py-3 text-right text-emerald-600 dark:text-[#13ec37]">NPR 4,035 (Accrued)</td>
                  <td className="py-3 text-right font-bold text-slate-900 dark:text-white">NPR 40,350</td>
                </tr>
                <tr>
                  <td className="py-3 font-semibold text-slate-900 dark:text-white">
                    {t('कृषि तथा पशुपालन कर्जा', 'Agro & Livestock Loan')}
                  </td>
                  <td className="py-3 font-mono text-slate-400">LN-AGRO-0941</td>
                  <td className="py-3 text-right text-slate-500">NPR 1,03,680 (Repaid)</td>
                  <td className="py-3 text-right text-slate-500">-</td>
                  <td className="py-3 text-right font-bold text-rose-600 dark:text-rose-400">NPR 1,46,320 (Remaining)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Dividend & Tax Breakdown */}
        <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/60 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="size-4 text-emerald-600 dark:text-[#13ec37]" />
              <span>{t('लाभांश वितरण तथा आयकर कट्टी', 'Dividend & Statutory Tax Distribution')}</span>
            </h4>
            <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400">
              {t('१४.२% स्वीकृत लाभांश', '14.2% AGM Approved Rate')}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-lg">
              <span className="text-slate-400 block">{t('कुल आर्जित लाभांश', 'Gross Dividend Earned')}:</span>
              <span className="font-bold text-slate-900 dark:text-white">NPR 7,100</span>
            </div>
            <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-lg">
              <span className="text-slate-400 block">{t('स्रोतमा कर कट्टी (५%)', 'Statutory TDS (5%)')}:</span>
              <span className="font-bold text-rose-600">- NPR 355</span>
            </div>
            <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-lg">
              <span className="text-slate-400 block">{t('खातामा जम्मा हुने खुद लाभांश', 'Net Dividend Credit')}:</span>
              <span className="font-bold text-emerald-600 dark:text-[#13ec37]">+ NPR 6,745</span>
            </div>
          </div>
        </div>

        {/* Signatures & Certification */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-6 text-center text-xs">
          <div>
            <div className="h-10 border-b border-dashed border-slate-300 dark:border-slate-700 mx-auto w-32 mb-1"></div>
            <p className="font-bold text-slate-900 dark:text-white">{t('तयार गर्ने अधिकृत', 'Prepared By')}</p>
            <p className="text-[10px] text-slate-400">{t('लेखा अधिकृत', 'Account Officer (CBS)')}</p>
          </div>
          <div>
            <div className="h-10 border-b border-dashed border-slate-300 dark:border-slate-700 mx-auto w-32 mb-1"></div>
            <p className="font-bold text-slate-900 dark:text-white">{t('प्रमाणित गर्ने प्रबन्धक', 'Verified By')}</p>
            <p className="text-[10px] text-slate-400">{t('व्यवस्थापक / सीइओ', 'Manager / CEO')}</p>
          </div>
          <div className="col-span-2 sm:col-span-1 flex flex-col items-center justify-center">
            <div className="size-16 rounded-full border-2 border-dashed border-emerald-500/50 flex flex-col items-center justify-center text-[9px] font-bold text-emerald-600 p-1">
              <ShieldCheck className="size-5" />
              <span>{t('संस्थाको छाप', 'OFFICIAL SEAL')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
