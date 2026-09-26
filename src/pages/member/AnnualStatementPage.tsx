import React, { useState, useMemo } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { useCoopStore } from '../../store/useCoopStore';
import {
  Landmark,
  Printer,
  Award,
  ShieldCheck,
  FileSpreadsheet,
  FileText,
  Download,
  QrCode,
  Calendar,
  Building,
} from 'lucide-react';
import { printElement } from '../../utils/printHelper';
import {
  calculateInterestCertificate,
  downloadInterestCertificateCsv,
  InterestAccountInput,
} from '../../utils/interestCertificate';

type ViewMode = 'STATEMENT' | 'TDS_CERTIFICATE';

export const AnnualStatementPage: React.FC = () => {
  const { currentMember } = useAuthStore();
  const { t, fmtCurrency } = useLanguageStore();
  const { coopSettings, members, savings, loans } = useCoopStore();

  const [viewMode, setViewMode] = useState<ViewMode>('STATEMENT');
  const [selectedFiscalYear, setSelectedFiscalYear] = useState('२०८०/२०८१');

  // Resolve current active member or fallback gracefully to first demo member
  const activeMember = useMemo(
    () =>
      currentMember ||
      members[0] || {
        id: 'mem-1',
        memberNo: 'UKO-2070-08842',
        name: 'Hari Prasad Chaudhary',
        nameNepali: 'हरि प्रसाद चौधरी',
        phone: '9857840123',
        email: 'hari.chaudhary@unako.coop.np',
        citizenshipNo: '38-01-72-04912',
        panNo: '109283746',
        joinedDate: '2070-04-12',
        status: 'ACTIVE' as const,
        shareCapital: 50000,
        shareKitta: 500,
        totalSavings: 184500,
        activeLoans: 1,
        role: 'REGULAR' as const,
        address: 'Gadhwa-5, Dang, Nepal',
      },
    [currentMember, members]
  );

  // Compute live account balances from store for current member
  const memberSavings = useMemo(() => {
    const list = savings.filter(
      (s) => s.memberId === activeMember.id || s.accountNo.includes('004-10294')
    );
    if (list.length > 0) return list;
    return savings.slice(0, 3);
  }, [savings, activeMember.id]);

  // Transform member accounts into interest calculation inputs
  const interestAccounts: InterestAccountInput[] = useMemo(() => {
    return memberSavings.map((s) => {
      // Calculate annual interest based on rate
      const grossInterest = Math.round(s.balance * (s.interestRate / 100));
      return {
        accountNo: s.accountNo,
        accountType: s.accountType,
        productName: s.accountType,
        balance: s.balance,
        interestRate: s.interestRate,
        grossInterestEarned: grossInterest,
      };
    });
  }, [memberSavings]);

  const certificateData = useMemo(() => {
    return calculateInterestCertificate(
      {
        id: activeMember.id,
        name: activeMember.name,
        memberNo: activeMember.memberNo,
        panNo: (activeMember as { panNo?: string }).panNo || '109283746',
        citizenshipNo: activeMember.citizenshipNo,
        phone: activeMember.phone,
        address: activeMember.address || 'Gadhwa-5, Dang',
      },
      interestAccounts,
      selectedFiscalYear,
      '२०८१-०४-०५',
      '2024-07-20'
    );
  }, [activeMember, interestAccounts, selectedFiscalYear]);

  const handlePrint = () => {
    const elementId = viewMode === 'STATEMENT' ? 'annual-statement-document' : 'tds-certificate-document';
    printElement(elementId);
  };

  const handleDownloadCsv = () => {
    downloadInterestCertificateCsv(certificateData, {
      name: coopSettings.name,
      nameNepali: coopSettings.nameNepali,
      panNo: '302918274',
      regNo: coopSettings.regNo,
      address: coopSettings.address,
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-emerald-950 pb-4 print:hidden">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {viewMode === 'STATEMENT'
              ? t('वार्षिक वित्तीय तथा कर विवरण', 'Official Annual Financial Statement')
              : t('ब्याज तथा ५% कर कट्टी (TDS) प्रमाणपत्र', 'Interest & 5% TDS Withholding Certificate')}
          </h1>
          <p className="text-xs text-slate-500">
            {viewMode === 'STATEMENT'
              ? t('कर-अनुकूल सदस्य लाभांश र बचत खाताको आधिकारिक अडिट प्रतिवेदन', 'Tax-compliant member dividend and savings ledger audit report')
              : t('आयकर ऐन २०५८ को दफा ८८ बमोजिम जारी आधिकारिक कर कट्टी प्रमाणपत्र', 'Official withholding tax certificate issued under Income Tax Act 2058 Section 88')}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode('STATEMENT')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'STATEMENT'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <FileText className="size-3.5" />
              <span>{t('वित्तीय विवरण', 'Statement')}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('TDS_CERTIFICATE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'TDS_CERTIFICATE'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Award className="size-3.5" />
              <span>{t('TDS प्रमाणपत्र', 'TDS Certificate')}</span>
            </button>
          </div>

          {viewMode === 'TDS_CERTIFICATE' && (
            <button
              type="button"
              onClick={handleDownloadCsv}
              className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 font-bold px-3.5 py-2 rounded-xl text-xs hover:bg-emerald-100 transition-colors shadow-sm cursor-pointer"
            >
              <Download className="size-4" />
              <span>{t('CSV डाउनलोड', 'CSV Export')}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors shadow-sm cursor-pointer"
          >
            <Printer className="size-4" />
            <span>{t('छाप्नुहोस् (Print)', 'Print')}</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: ANNUAL STATEMENT */}
      {viewMode === 'STATEMENT' && (
        <div
          id="annual-statement-document"
          data-printable="statement"
          className="glass-panel p-8 sm:p-12 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-8 bg-white dark:bg-[#0c1a0e] shadow-lg print:shadow-none print:border-none"
        >
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
                  {t(
                    `दर्ता नं: ${coopSettings.regNo} • ${coopSettings.address} • फोन: ${coopSettings.phone}`,
                    `Reg No: ${coopSettings.regNo} • ${coopSettings.address} • Tel: ${coopSettings.phone}`
                  )}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                {t('आर्थिक वर्ष', 'Fiscal Year')}
              </span>
              <span className="text-sm font-black text-slate-900 dark:text-white font-mono">
                २०८०/२०८१ (2023/2024)
              </span>
              <span className="text-[10px] text-emerald-600 block font-semibold mt-1">
                {t('आधिकारिक लेखा परीक्षण प्रतिलिपि', 'Official Certified Audit Copy')}
              </span>
            </div>
          </div>

          {/* Member Particulars */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 text-xs border border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-slate-400 block">{t('सदस्यको नाम', 'Member Name')}:</span>
              <p className="font-bold text-slate-900 dark:text-white mt-0.5">{activeMember.name}</p>
            </div>
            <div>
              <span className="text-slate-400 block">{t('सदस्यता नं.', 'Member No')}:</span>
              <p className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">{activeMember.memberNo}</p>
            </div>
            <div>
              <span className="text-slate-400 block">{t('नागरिकता नं.', 'Citizenship No')}:</span>
              <p className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">{activeMember.citizenshipNo || '28-01-72-04912'}</p>
            </div>
            <div>
              <span className="text-slate-400 block">{t('शेयर पूँजी लगानी', 'Share Capital')}:</span>
              <p className="font-bold text-emerald-600 dark:text-[#13ec37] mt-0.5">
                NPR {fmtCurrency(activeMember.shareCapital || 50000, true)}
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
                    <th className="py-2.5 text-right">{t('ब्याज दर (%)', 'Interest Rate')}</th>
                    <th className="py-2.5 text-right font-bold">{t('मौज्दात रकम', 'Current Balance')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {memberSavings.map((s) => (
                    <tr key={s.id}>
                      <td className="py-3 font-semibold text-slate-900 dark:text-white">
                        {s.accountType}
                      </td>
                      <td className="py-3 font-mono text-slate-400">{s.accountNo}</td>
                      <td className="py-3 text-right font-mono text-emerald-600 dark:text-emerald-400">
                        {s.interestRate}%
                      </td>
                      <td className="py-3 text-right font-bold text-slate-900 dark:text-white font-mono">
                        NPR {fmtCurrency(s.balance, true)}
                      </td>
                    </tr>
                  ))}
                  {/* Share Capital Row */}
                  <tr>
                    <td className="py-3 font-semibold text-slate-900 dark:text-white">
                      {t('सदस्य शेयर पूँजी खाता', 'Member Share Capital Account')}
                    </td>
                    <td className="py-3 font-mono text-slate-400">SC-004-10294</td>
                    <td className="py-3 text-right font-mono text-amber-500">14.2% (Div)</td>
                    <td className="py-3 text-right font-bold text-slate-900 dark:text-white font-mono">
                      NPR {fmtCurrency(activeMember.shareCapital || 50000, true)}
                    </td>
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
                <span className="font-bold text-slate-900 dark:text-white">NPR {fmtCurrency(7100, true)}</span>
              </div>
              <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-lg">
                <span className="text-slate-400 block">{t('स्रोतमा कर कट्टी (५%)', 'Statutory TDS (5%)')}:</span>
                <span className="font-bold text-rose-600">- NPR {fmtCurrency(355, true)}</span>
              </div>
              <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-lg">
                <span className="text-slate-400 block">{t('खातामा जम्मा हुने खुद लाभांश', 'Net Dividend Credit')}:</span>
                <span className="font-bold text-emerald-600 dark:text-[#13ec37]">+ NPR {fmtCurrency(6745, true)}</span>
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
      )}

      {/* VIEW 2: TDS CERTIFICATE */}
      {viewMode === 'TDS_CERTIFICATE' && (
        <div
          id="tds-certificate-document"
          data-printable="tds-certificate"
          className="glass-panel p-8 sm:p-12 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 bg-white dark:bg-[#0c1a0e] shadow-lg print:shadow-none print:border-none"
        >
          {/* Institutional Header with Coat of Arms style */}
          <div className="border-b-2 border-emerald-600 pb-5 flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="size-14 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
                <Building className="size-8" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                  {coopSettings.nameNepali}
                </h2>
                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                  {coopSettings.name}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {coopSettings.address} • {t('दर्ता नं:', 'Reg No:')} {coopSettings.regNo} • {t('स्थायी लेखा नं (PAN):', 'PAN:')} 302918274
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="inline-block px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-center">
                <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300 block">
                  {t('प्रमाणपत्र नं.', 'Certificate No.')}
                </span>
                <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                  {certificateData.certificateNo}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1 font-mono">
                {t('जारी मिति', 'Issue Date')}: {certificateData.issueDateBs} ({certificateData.issueDateAd})
              </p>
            </div>
          </div>

          {/* Certificate Title */}
          <div className="text-center py-2">
            <span className="inline-block px-4 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-xs font-black uppercase tracking-wider mb-2">
              {t('नेपाल सरकार आयकर ऐन २०५८ को दफा ८८ बमोजिम', 'Under Nepal Income Tax Act 2058 Section 88')}
            </span>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              {t('ब्याज आम्दानी तथा ५% अग्रिम कर कट्टी (TDS) प्रमाणपत्र', 'Interest Earning & 5% Statutory TDS Withholding Certificate')}
            </h3>
            <p className="text-xs text-slate-500 max-w-2xl mx-auto mt-1">
              {t(
                `आर्थिक वर्ष ${selectedFiscalYear} मा यस संस्थामा सदस्यको नाममा रहेको बचत तथा मुद्दती निक्षेप खाताहरूमा आर्जित ब्याज रकम र त्यसमा कानून बमोजिम कट्टी गरिएको ५% स्रोतमा कर (TDS) सम्बन्धी आधिकारिक विवरण।`,
                `Official certificate of interest earned and 5% tax deducted at source on member savings and term deposit accounts for Fiscal Year ${selectedFiscalYear}.`
              )}
            </p>
          </div>

          {/* Member Details Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block">{t('करदाता / सदस्यको नाम', 'Member Name')}:</span>
              <p className="font-bold text-slate-900 dark:text-white mt-0.5">{certificateData.memberName}</p>
            </div>
            <div>
              <span className="text-slate-400 block">{t('सदस्यता नं.', 'Member No')}:</span>
              <p className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">{certificateData.memberNo}</p>
            </div>
            <div>
              <span className="text-slate-400 block">{t('स्थायी लेखा नं (PAN)', 'PAN No')}:</span>
              <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {certificateData.panNo || 'N/A'}
              </p>
            </div>
            <div>
              <span className="text-slate-400 block">{t('नागरिकता नं.', 'Citizenship No')}:</span>
              <p className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                {certificateData.citizenshipNo || '28-01-72-04912'}
              </p>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 dark:bg-slate-800/80 font-bold text-slate-700 dark:text-slate-300">
                <tr>
                  <th className="px-3 py-3 w-8 text-center">#</th>
                  <th className="px-3 py-3">{t('खाता शीर्षक', 'Account Title')}</th>
                  <th className="px-3 py-3">{t('खाता नं.', 'Account No.')}</th>
                  <th className="px-3 py-3 text-right">{t('ब्याज दर (%)', 'Rate')}</th>
                  <th className="px-3 py-3 text-right">{t('कुल ब्याज (Gross)', 'Gross Interest')}</th>
                  <th className="px-3 py-3 text-right text-rose-600">{t('५% TDS कट्टी', '5% TDS')}</th>
                  <th className="px-3 py-3 text-right text-emerald-600 font-bold">{t('खुद ब्याज (Net)', 'Net Interest')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                {certificateData.earnings.map((e, idx) => (
                  <tr key={e.accountNo}>
                    <td className="px-3 py-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                    <td className="px-3 py-3 font-semibold text-slate-900 dark:text-white">{e.productName}</td>
                    <td className="px-3 py-3 font-mono text-slate-500">{e.accountNo}</td>
                    <td className="px-3 py-3 text-right font-mono text-slate-700 dark:text-slate-300">{e.interestRatePercent}%</td>
                    <td className="px-3 py-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                      NPR {fmtCurrency(e.grossInterestEarned, true)}
                    </td>
                    <td className="px-3 py-3 text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                      - NPR {fmtCurrency(e.tdsDeducted, true)}
                    </td>
                    <td className="px-3 py-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      NPR {fmtCurrency(e.netInterestPaid, true)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-100 dark:bg-slate-800/90 font-bold border-t border-slate-200 dark:border-slate-700">
                <tr>
                  <td colSpan={4} className="px-3 py-3 text-right text-slate-700 dark:text-slate-300">
                    {t('कुल जम्मा (Grand Total):', 'Grand Total:')}
                  </td>
                  <td className="px-3 py-3 text-right font-mono text-slate-900 dark:text-white">
                    NPR {fmtCurrency(certificateData.totalGrossInterest, true)}
                  </td>
                  <td className="px-3 py-3 text-right font-mono text-rose-600 dark:text-rose-400">
                    - NPR {fmtCurrency(certificateData.totalTdsDeducted, true)}
                  </td>
                  <td className="px-3 py-3 text-right font-mono text-emerald-600 dark:text-emerald-400 text-sm">
                    NPR {fmtCurrency(certificateData.totalNetInterest, true)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Statutory Certification & Verification Hash */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300 flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">
                {t(
                  'प्रमाणीकरण: यस प्रमाणपत्रमा उल्लिखित ब्याज रकम सम्बन्धित खातामा जम्मा भई नेपाल सरकारको नियमानुसार ५% स्रोतमा कर कट्टी (TDS) गरी आन्तरिक राजस्व कार्यालयमा दाखिला गरिएको व्यहोरा प्रमाणित गरिन्छ।',
                  'Certification: It is certified that the interest mentioned above has been credited to the respective accounts and 5% TDS withheld and deposited to the Inland Revenue Department as per law.'
                )}
              </p>
              <p className="text-[10px] text-slate-400 font-mono mt-1">
                {t('डिजिटल प्रमाणिकरण कोड', 'Verification Hash')}: <span className="font-bold text-emerald-600">{certificateData.verificationHash}</span>
              </p>
            </div>
            <div className="shrink-0 p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col items-center">
              <QrCode className="size-10 text-slate-800 dark:text-slate-200" />
              <span className="text-[8px] font-mono text-slate-400 mt-0.5">VERIFIED</span>
            </div>
          </div>

          {/* Signatures & Seal */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-6 text-center text-xs">
            <div>
              <div className="h-10 border-b border-dashed border-slate-300 dark:border-slate-700 mx-auto w-32 mb-1"></div>
              <p className="font-bold text-slate-900 dark:text-white">{t('तयार गर्ने (लेखा शाखा)', 'Prepared By (Accounts)')}</p>
              <p className="text-[10px] text-slate-400">{t('कम्प्युटर प्रणाली द्वारा प्रमाणित', 'Generated via CBS')}</p>
            </div>
            <div>
              <div className="h-10 border-b border-dashed border-slate-300 dark:border-slate-700 mx-auto w-32 mb-1"></div>
              <p className="font-bold text-slate-900 dark:text-white">{t('प्रमुख कार्यकारी अधिकृत / प्रबन्धक', 'Chief Executive Officer / Mgr')}</p>
              <p className="text-[10px] text-slate-400">{coopSettings.name}</p>
            </div>
            <div className="flex flex-col items-center justify-center">
              <div className="size-16 rounded-full border-2 border-dashed border-emerald-500/50 flex flex-col items-center justify-center text-[9px] font-bold text-emerald-600 p-1">
                <ShieldCheck className="size-5" />
                <span>{t('आधिकारिक छाप', 'OFFICIAL SEAL')}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
