import React, { useState, useEffect } from 'react';
import { useCoopStore } from '../../store/useCoopStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import {
  PieChart,
  CheckCircle2,
  Sliders,
  X,
  Lock,
  Award,
  PlusCircle,
  Search,
  Users,
  Coins,
  ArrowUpRight,
  TrendingUp,
  Receipt,
  Scale,
} from 'lucide-react';
import { ShareCertificateModal } from '../../components/admin/ShareCertificateModal';
import { OpenFixedDepositModal } from '../../components/admin/OpenFixedDepositModal';
import { BulkDividendDistributionModal } from '../../components/admin/BulkDividendDistributionModal';
import { BonusShareDistributionModal } from '../../components/admin/BonusShareDistributionModal';
import { MemberDividendPayoutModal } from '../../components/admin/MemberDividendPayoutModal';
import { FixedDepositSettlementModal } from '../../components/admin/FixedDepositSettlementModal';
import { ShareConcentrationCeilingModal } from '../../components/admin/ShareConcentrationCeilingModal';
import { PatronageRefundModal } from '../../components/admin/PatronageRefundModal';
import { Member } from '../../types';

export function SharesManagementPage() {
  const { sharePool, updateSharePool, members, savings } = useCoopStore();
  const { t, fmtCurrency, fmtCount, fmtDigits, fmtPhone, fmtPercent } = useLanguageStore();

  // Modals state
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [showFdModal, setShowFdModal] = useState(false);
  const [showFdSettlementModal, setShowFdSettlementModal] = useState(false);
  const [settlementPreselectedAccountNo, setSettlementPreselectedAccountNo] = useState<string | undefined>(undefined);
  const [showBulkDividendModal, setShowBulkDividendModal] = useState(false);
  const [showBonusShareModal, setShowBonusShareModal] = useState(false);
  const [showConcentrationModal, setShowConcentrationModal] = useState(false);
  const [showPatronageModal, setShowPatronageModal] = useState(false);
  const [payoutSelectedMember, setPayoutSelectedMember] = useState<Member | null>(null);
  const [preselectedMemberId, setPreselectedMemberId] = useState<string | undefined>(undefined);
  const [preselectedTenure, setPreselectedTenure] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!showShareModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setShowShareModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showShareModal]);

  // Table filters
  const [activeTab, setActiveTab] = useState<'SHARES' | 'FD'>('SHARES');
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  // Share pool configuration form state
  const [parValue, setParValue] = useState(sharePool.parValue);
  const [totalKitta, setTotalKitta] = useState(sharePool.totalAllottedKitta);
  const [dividendRate, setDividendRate] = useState(sharePool.annualDividendPercent);
  const [patronageBonus, setPatronageBonus] = useState(sharePool.patronageBonusPercent);
  const [isOpen, setIsOpen] = useState(sharePool.sharePurchaseOpen);

  const fdPlans = [
    { tenure: t('१ वर्ष मुद्दती (1 Year)', '1 Year (१ वर्ष मुद्दती)'), rate: 10.0, min: 25000, penalty: t('२% फिर्ता जरिवाना', '2% Pre-break') },
    { tenure: t('२ वर्ष मुद्दती (2 Years)', '2 Years (२ वर्ष मुद्दती)'), rate: 10.75, min: 50000, penalty: t('२% फिर्ता जरिवाना', '2% Pre-break') },
    { tenure: t('३ वर्ष मुद्दती (3 Years)', '3 Years (३ वर्ष मुद्दती)'), rate: 11.25, min: 50000, penalty: t('२% फिर्ता जरिवाना', '2% Pre-break') },
    { tenure: t('५ वर्ष मुद्दती (5 Years)', '5 Years (५ वर्ष मुद्दती)'), rate: 12.0, min: 100000, penalty: t('२% फिर्ता जरिवाना', '2% Pre-break') },
  ];

  const showToastMsg = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleSaveSharePool = (e: React.FormEvent) => {
    e.preventDefault();
    updateSharePool({
      parValue,
      totalAllottedKitta: totalKitta,
      annualDividendPercent: dividendRate,
      patronageBonusPercent: patronageBonus,
      sharePurchaseOpen: isOpen,
    });
    showToastMsg(
      t(
        'सेयर पुँजी कोष तथा साधारण सभा लाभांश मापदण्ड सफलतापूर्वक अद्यावधिक भयो!',
        'Share Capital Pool and AGM Dividend parameters successfully updated!'
      )
    );
    setShowShareModal(false);
  };

  const handleIssueShareForMember = (memberId: string) => {
    setPreselectedMemberId(memberId);
    setShowCertificateModal(true);
  };

  const handleOpenFdForPlan = (tenure: string) => {
    setPreselectedTenure(tenure);
    setShowFdModal(true);
  };

  // Filter members for shares table
  const filteredMembers = members.filter((m) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      m.name.toLowerCase().includes(q) ||
      m.memberNo.toLowerCase().includes(q) ||
      m.phone.includes(q)
    );
  });

  // Filter FD accounts for FD table
  const fdAccounts = savings.filter(
    (s) =>
      s.accountType.includes('Fixed') ||
      s.accountType.includes('मुद्दती') ||
      s.accountNo.includes('FD')
  );

  const filteredFdAccounts = fdAccounts.filter((fd) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const member = members.find((m) => m.id === fd.memberId);
    return (
      fd.accountNo.toLowerCase().includes(q) ||
      fd.accountType.toLowerCase().includes(q) ||
      (member &&
        (member.name.toLowerCase().includes(q) || member.memberNo.toLowerCase().includes(q)))
    );
  });

  const totalMemberSharesSum = members.reduce(
    (sum, m) => sum + (m.shareKitta || Math.round(m.shareCapital / 100)),
    0
  );
  const totalFdDepositSum = fdAccounts.reduce((sum, f) => sum + f.balance, 0);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-blue-500/40 flex items-center gap-3 animate-fade-in max-w-md">
          <CheckCircle2 className="size-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 font-bold mb-1">
            <PieChart className="size-4" />
            <span>{t('सदस्य सेयर पुँजी तथा मुद्दती निक्षेप', 'MEMBER EQUITY & FIXED DEPOSIT SCHEMES')}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('सेयर पुँजी तथा मुद्दती निक्षेप व्यवस्थापन', 'Shares Capital & Fixed Deposit (FD) Suite')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t(
              'सहकारी सेयर कित्ता बाँडफाँड, प्रमाणपत्र जारी, वार्षिक साधारण सभा लाभांश, तथा मुद्दती निक्षेप खाता व्यवस्थापन।',
              'Allot cooperative share certificates, declare AGM dividends, manage patronage bonus, and open high-yield Mudhati FD accounts.'
            )}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowConcentrationModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm shadow-indigo-500/20 cursor-pointer"
            type="button"
          >
            <Scale className="size-4 text-indigo-200" />
            <span>{t('सेयर सीमा तथा केन्द्रीकरण (दफा ३७)', 'Share Ceiling & Concentration')}</span>
          </button>

          <button
            onClick={() => setShowBulkDividendModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm shadow-blue-500/20 cursor-pointer"
            type="button"
          >
            <Coins className="size-4 text-blue-200" />
            <span>{t('+ वार्षिक लाभांश वितरण', '+ Distribute AGM Dividends')}</span>
          </button>

          <button
            onClick={() => setShowBonusShareModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition shadow-sm shadow-purple-500/20 cursor-pointer"
            type="button"
          >
            <Award className="size-4 text-purple-200" />
            <span>{t('+ बोनस सेयर बाँडफाँड', '+ Distribute Bonus Shares')}</span>
          </button>

          <button
            onClick={() => setShowPatronageModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-sm shadow-amber-500/20 cursor-pointer"
            type="button"
          >
            <Coins className="size-4 text-amber-200" />
            <span>{t('संरक्षकता फिर्ता कोष (दफा ४१)', 'Patronage Refund (Sec 41)')}</span>
          </button>

          <button
            onClick={() => {
              setPreselectedMemberId(undefined);
              setShowCertificateModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition cursor-pointer"
            type="button"
          >
            <Award className="size-4 text-slate-500" />
            <span>{t('+ सेयर प्रमाणपत्र', '+ Issue Share Cert')}</span>
          </button>

          <button
            onClick={() => {
              setPreselectedTenure(undefined);
              setShowFdModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm shadow-emerald-500/20 cursor-pointer"
            type="button"
          >
            <Lock className="size-4 text-emerald-200" />
            <span>{t('+ नयाँ मुद्दती खाता', '+ Open FD Account')}</span>
          </button>

          <button
            onClick={() => {
              setSettlementPreselectedAccountNo(undefined);
              setShowFdSettlementModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold transition shadow-sm cursor-pointer"
            type="button"
          >
            <Receipt className="size-4" />
            <span>{t('मुद्दती फर्छ्यौट / नविकरण', 'FD Settle / Renew')}</span>
          </button>

          <button
            onClick={() => setShowShareModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition cursor-pointer"
            type="button"
          >
            <Sliders className="size-4 text-slate-500" />
            <span>{t('मापदण्ड', 'Parameters')}</span>
          </button>
        </div>
      </div>

      {/* Share Pool & FD Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-500 font-bold uppercase flex items-center justify-between">
            <span>{t('कुल सेयर पुँजी', 'Total Equity Capital')}</span>
            <Coins className="size-4 text-blue-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white mt-1">
            {fmtCurrency(sharePool.parValue * sharePool.totalAllottedKitta, true)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {fmtCurrency(sharePool.totalAllottedKitta, true)} {t('कित्ता @ रु.', 'Kitta @ NPR ')}
            {fmtCount(sharePool.parValue)}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-500 font-bold uppercase flex items-center justify-between">
            <span>{t('वार्षिक लाभांश दर', 'Annual Dividend Declared')}</span>
            <TrendingUp className="size-4 text-emerald-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-emerald-600 mt-1">
            {fmtPercent(sharePool.annualDividendPercent)} {t('वार्षिक', 'p.a.')}
          </div>
          <div className="text-[11px] text-emerald-600 mt-0.5">
            {t('साधारण सभा द्वारा स्वीकृत दर', 'AGM Board Approved Rate')}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-500 font-bold uppercase flex items-center justify-between">
            <span>{t('मुद्दती निक्षेप कुल मौज्दात', 'Total FD Portfolio')}</span>
            <Lock className="size-4 text-indigo-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-indigo-600 mt-1">
            {fmtCurrency(totalFdDepositSum, true)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {fmtCount(fdAccounts.length)} {t('सक्रिय मुद्दती खाताहरू', 'Active FD Accounts')}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-xs text-slate-500 font-bold uppercase flex items-center justify-between">
            <span>{t('सेयर खरिद विन्डो', 'Subscription Window')}</span>
            <span
              className={`size-2.5 rounded-full ${
                sharePool.sharePurchaseOpen ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
              }`}
            ></span>
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">
            {sharePool.sharePurchaseOpen
              ? t('सदस्यहरूका लागि खुला', 'Open for Members')
              : t('सञ्चालक समितिद्वारा बन्द', 'Closed by Board')}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {t('पोर्टलमा खरिद खुला/बन्द', 'Member Portal purchase toggle')}
          </div>
        </div>
      </div>

      {/* Fixed Deposit (Mudhati) Schemes Cards */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="size-4 text-emerald-500" />
              <span>{t('मुद्दती निक्षेप योजना तथा ब्याजदरहरू', 'Mudhati Fixed Deposit Schemes & Term Rates')}</span>
            </h3>
            <p className="text-xs text-slate-400">
              {t(
                'सहकारी सदस्यहरूका लागि निश्चित अवधिको आकर्षक निक्षेप उपकरणहरू',
                'Time-locked deposit instruments for cooperative members'
              )}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {fdPlans.map((plan, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="font-bold text-slate-900 dark:text-white text-xs">{plan.tenure}</div>
                <div className="mt-1">
                  <div className="text-2xl font-black font-mono text-emerald-600">{fmtPercent(plan.rate)}</div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">
                    {t('वार्षिक प्रतिफल APY', 'Annual Yield APY')}
                  </div>
                </div>
                <div className="pt-2 mt-2 border-t border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 space-y-0.5">
                  <div>
                    {t('न्यूनतम:', 'Min: ')}
                    {fmtCurrency(plan.min, true)}
                  </div>
                  <div>
                    {t('फिर्ता जरिवाना:', 'Penalty: ')}
                    {plan.penalty}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleOpenFdForPlan(plan.tenure)}
                className="w-full mt-2 py-2 rounded-lg bg-emerald-600/10 hover:bg-emerald-600 text-emerald-700 hover:text-white dark:text-emerald-400 text-xs font-bold transition flex items-center justify-center gap-1"
              >
                <PlusCircle className="size-3.5" />
                <span>{t('यो योजना खोल्नुहोस्', 'Open This Scheme')}</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Member Share & Fixed Deposit Holdings Register */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        {/* Table Header & Controls */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('SHARES')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'SHARES'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <Users className="size-3.5" />
              <span>{t('सदस्य सेयर होल्डिङ अभिलेख', 'Member Share Holdings')}</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                {fmtCount(members.length)}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('FD')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'FD'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <Lock className="size-3.5" />
              <span>{t('मुद्दती निक्षेप खाताहरू', 'Fixed Deposit Accounts')}</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
                {fmtCount(fdAccounts.length)}
              </span>
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="size-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('नाम, सदस्य वा खाता नम्बर खोज्नुहोस्...', 'Search name, member or account...')}
              className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Tab 1: Member Share Holdings */}
        {activeTab === 'SHARES' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase font-bold text-[11px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">{t('सदस्य विवरण', 'Member Details')}</th>
                  <th className="py-3 px-4">{t('सम्पर्क / नागरिकता', 'Contact / Citizenship')}</th>
                  <th className="py-3 px-4 text-right">{t('कित्ता संख्या', 'Total Kitta')}</th>
                  <th className="py-3 px-4 text-right">{t('सेयर पुँजी (रु.)', 'Share Capital')}</th>
                  <th className="py-3 px-4 text-center">{t('पुँजी हिस्सा %', 'Equity Share %')}</th>
                  <th className="py-3 px-4 text-center">{t('अवस्था', 'Status')}</th>
                  <th className="py-3 px-4 text-right">{t('कार्य', 'Action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredMembers.map((member) => {
                  const kitta = member.shareKitta || Math.round(member.shareCapital / 100);
                  const sharePercent =
                    sharePool.totalAllottedKitta > 0
                      ? ((kitta / sharePool.totalAllottedKitta) * 100).toFixed(2)
                      : '0.00';

                  return (
                    <tr
                      key={member.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
                    >
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{t(member.nameNepali || member.name, member.name)}</span>
                        </div>
                        <div className="text-[11px] text-blue-600 font-mono font-semibold">
                          {member.memberNo}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-mono text-xs">{fmtPhone(member.phone)}</div>
                        <div className="text-[11px] text-slate-400">
                          {fmtDigits(member.citizenshipNo) || t('नागरिकता प्रमाणित', 'Verified')}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                          {fmtCount(kitta)}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-1">{t('कित्ता', 'units')}</span>
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-black text-emerald-600 dark:text-emerald-400">
                        {fmtCurrency(member.shareCapital, true)}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                          {fmtPercent(sharePercent)}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                          {member.status || 'ACTIVE'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setPayoutSelectedMember(member)}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-600 hover:text-white text-emerald-600 dark:text-emerald-400 text-xs font-bold transition inline-flex items-center gap-1 cursor-pointer"
                            title={t('लाभांश भुक्तानी गर्नुहोस्', 'Disburse Dividend')}
                          >
                            <Coins className="size-3" />
                            <span>{t('लाभांश भुक्तानी', 'Pay Dividend')}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleIssueShareForMember(member.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-600 hover:text-white text-blue-600 dark:text-blue-400 text-xs font-bold transition inline-flex items-center gap-1 cursor-pointer"
                          >
                            <PlusCircle className="size-3" />
                            <span>{t('थप सेयर', 'Allot More')}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredMembers.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                      {t('कुनै सदस्य फेला परेन।', 'No members found matching your search.')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Fixed Deposit Accounts */}
        {activeTab === 'FD' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase font-bold text-[11px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">{t('खाता नम्बर', 'Account No')}</th>
                  <th className="py-3 px-4">{t('सदस्य विवरण', 'Member Details')}</th>
                  <th className="py-3 px-4">{t('मुद्दती योजना / ब्याजदर', 'Scheme & Rate')}</th>
                  <th className="py-3 px-4 text-right">{t('जम्मा मौज्दात', 'Principal Balance')}</th>
                  <th className="py-3 px-4">{t('खोलेको मिति', 'Opened Date')}</th>
                  <th className="py-3 px-4">{t('परिपक्व मिति', 'Maturity Date')}</th>
                  <th className="py-3 px-4 text-center">{t('अवस्था', 'Status')}</th>
                  <th className="py-3 px-4 text-center">{t('कार्य', 'Action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredFdAccounts.map((fd) => {
                  const owner = members.find((m) => m.id === fd.memberId);

                  return (
                    <tr
                      key={fd.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <Lock className="size-3.5 text-emerald-500" />
                        <span>{fmtDigits(fd.accountNo)}</span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {owner ? t(owner.nameNepali || owner.name, owner.name) : t('सहकारी सदस्य', 'Cooperative Member')}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {owner ? owner.memberNo : 'N/A'}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">
                          {fd.accountType}
                        </div>
                        <div className="text-[11px] text-emerald-600 font-mono font-bold">
                          {fmtPercent(fd.interestRate)} {t('वार्षिक', 'p.a.')}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-black text-emerald-600 dark:text-emerald-400">
                        {fmtCurrency(fd.balance, true)}
                      </td>

                      <td className="py-3 px-4 font-mono text-xs">{fmtDigits(fd.openedDate)}</td>

                      <td className="py-3 px-4 font-mono text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                        {fmtDigits(fd.maturityDate || '2082-11-15')}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                          {fd.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setSettlementPreselectedAccountNo(fd.accountNo);
                            setShowFdSettlementModal(true);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-600 hover:text-white text-emerald-600 dark:text-emerald-400 text-xs font-bold transition inline-flex items-center gap-1 cursor-pointer shadow-xs"
                          title={t('मुद्दती परिपक्वता वा समयपूर्व फर्छ्यौट / नविकरण', 'Settle or Renew Fixed Deposit')}
                        >
                          <Receipt className="size-3" />
                          <span>{t('फर्छ्यौट / नविकरण', 'Settle / Renew')}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {filteredFdAccounts.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                      {t('कुनै मुद्दती खाता फेला परेन।', 'No Fixed Deposit accounts found.')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: ISSUE SHARE CERTIFICATE */}
      <ShareCertificateModal
        isOpen={showCertificateModal}
        onClose={() => setShowCertificateModal(false)}
        onSuccess={showToastMsg}
        preselectedMemberId={preselectedMemberId}
      />

      {/* MODAL 2: OPEN FIXED DEPOSIT ACCOUNT */}
      <OpenFixedDepositModal
        isOpen={showFdModal}
        onClose={() => setShowFdModal(false)}
        onSuccess={showToastMsg}
        preselectedTenure={preselectedTenure}
      />

      {/* MODAL 3: BULK AGM DIVIDEND DISTRIBUTION */}
      <BulkDividendDistributionModal
        isOpen={showBulkDividendModal}
        onClose={() => setShowBulkDividendModal(false)}
        onSuccess={showToastMsg}
      />

      {/* MODAL 4: BONUS SHARE ALLOTMENT */}
      <BonusShareDistributionModal
        isOpen={showBonusShareModal}
        onClose={() => setShowBonusShareModal(false)}
        onSuccess={showToastMsg}
      />

      {/* MODAL 5: SINGLE MEMBER DIVIDEND PAYOUT */}
      <MemberDividendPayoutModal
        isOpen={!!payoutSelectedMember}
        onClose={() => setPayoutSelectedMember(null)}
        onSuccess={showToastMsg}
        member={payoutSelectedMember}
      />

      {/* MODAL 6: FIXED DEPOSIT SETTLEMENT & AUTO-RENEWAL */}
      <FixedDepositSettlementModal
        isOpen={showFdSettlementModal}
        onClose={() => setShowFdSettlementModal(false)}
        onSuccess={showToastMsg}
        accounts={savings}
        members={members}
        preselectedAccountNo={settlementPreselectedAccountNo}
      />

      {/* MODAL 7: SHARE CAPITAL CEILING & REGULATORY DIVESTMENT */}
      <ShareConcentrationCeilingModal
        isOpen={showConcentrationModal}
        onClose={() => setShowConcentrationModal(false)}
      />

      {/* MODAL 8: SECTION 41 PATRONAGE REFUND FUND DESK */}
      <PatronageRefundModal
        isOpen={showPatronageModal}
        onClose={() => setShowPatronageModal(false)}
      />

      {/* MODAL 3: UPDATE SHARE PARAMETERS */}
      {showShareModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="share-params-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
          onClick={() => setShowShareModal(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <h3 id="share-params-modal-title" className="font-bold text-sm">
                {t('सहकारी सेयर मापदण्ड अद्यावधिक', 'Update Cooperative Share Parameters')}
              </h3>
              <button onClick={() => setShowShareModal(false)} className="text-slate-400 hover:text-white">
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSharePool} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('प्रति कित्ता मूल्य (रु.)', 'Par Value / Unit')}
                  </label>
                  <input
                    type="number"
                    value={parValue}
                    onChange={(e) => setParValue(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('कुल बाँडफाँड कित्ता', 'Total Allotted Kitta')}
                  </label>
                  <input
                    type="number"
                    value={totalKitta}
                    onChange={(e) => setTotalKitta(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('वार्षिक लाभांश %', 'Annual Dividend %')}
                  </label>
                  <input
                    type="number"
                    step={0.1}
                    value={dividendRate}
                    onChange={(e) => setDividendRate(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold text-emerald-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('संरक्षित पुँजी फिर्ता कोष %', 'Patronage Bonus %')}
                  </label>
                  <input
                    type="number"
                    step={0.1}
                    value={patronageBonus}
                    onChange={(e) => setPatronageBonus(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {t('सदस्य सेयर खरिद खुला/बन्द', 'Member Share Subscription')}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {t('सदस्य पोर्टलमा थप सेयर खरिद गर्न अनुमति दिनुहोस्', 'Allow members to buy equity shares in portal')}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(!isOpen)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                    isOpen ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-700'
                  }`}
                >
                  {isOpen ? t('खुला', 'OPEN') : t('बन्द', 'CLOSED')}
                </button>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowShareModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition"
                >
                  {t('रद्द गर्नुहोस्', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition"
                >
                  {t('मापदण्ड सुरक्षित गर्नुहोस्', 'Save Parameters')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
