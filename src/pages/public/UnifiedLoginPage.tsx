import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  ShieldAlert,
  Lock,
  Phone,
  KeyRound,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Building,
  AlertCircle,
} from 'lucide-react';
import { useAuthStore, isDemoMode } from '../../store/useAuthStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { LanguageToggle } from '../../components/ui/LanguageToggle';
import { useCoopStore } from '../../store/useCoopStore';
import { isSupabaseConfigured } from '../../lib/supabase';
import { signInStaffWithSupabase } from '../../services/employeeService';
import { signInMemberWithSupabase } from '../../services/memberAuthService';
import { INITIAL_EMPLOYEES } from '../../store/initialData';

export const UnifiedLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setRole, setCurrentMember, switchToPreset, signInStaff, setCurrentEmployee, setStaffRole } = useAuthStore();
  const { members, coopSettings } = useCoopStore();
  const { t } = useLanguageStore();

  const demoActive = isDemoMode();

  // Mode: 'MEMBER' or 'STAFF'
  const [loginMode, setLoginMode] = useState<'MEMBER' | 'STAFF'>('MEMBER');

  // Member form states (pre-filled only if demo mode is active)
  const [memberIdentifier, setMemberIdentifier] = useState(demoActive ? 'UK-88219' : '');
  const [memberPassword, setMemberPassword] = useState(demoActive ? 'password123' : '');

  // Staff form states (pre-filled only if demo mode is active)
  const [staffUsername, setStaffUsername] = useState(demoActive ? 'admin@unako.coop' : '');
  const [staffPassword, setStaffPassword] = useState(demoActive ? 'cbsAdmin2026' : '');
  const [staffBranch, setStaffBranch] = useState('Main Branch, Gadhwa-5');

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleMemberLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    // Live mode: real Supabase Auth sign-in; RLS then scopes the session to
    // the member's own rows (members.auth_user_id = auth.uid()).
    if (isSupabaseConfigured()) {
      const { data, error } = await signInMemberWithSupabase(memberIdentifier.trim(), memberPassword);
      setIsLoading(false);
      if (error || !data) {
        setErrorMessage(
          t(
            `सदस्य लगइन असफल: ${error || 'अज्ञात त्रुटि'}`,
            `Member sign-in failed: ${error || 'unknown error'}`
          )
        );
        return;
      }
      setRole('MEMBER');
      setCurrentMember(data);
      navigate('/member');
      return;
    }

    // Offline mode: match against the local member roster strictly
    setTimeout(() => {
      setIsLoading(false);
      const cleanId = memberIdentifier.trim().toLowerCase();
      if (!cleanId) {
        setErrorMessage(
          t('कृपया सदस्य नं., फोन वा नागरिकता नं. राख्नुहोस्', 'Please provide Member No, Phone or Citizenship No')
        );
        return;
      }

      const matched = members.find(
        (m) =>
          m.memberNo.toLowerCase() === cleanId ||
          m.phone.replace(/[^0-9]/g, '').includes(cleanId.replace(/[^0-9]/g, '')) ||
          m.citizenshipNo.toLowerCase() === cleanId ||
          m.name.toLowerCase().includes(cleanId)
      );

      if (matched) {
        setRole('MEMBER');
        setCurrentMember(matched);
        navigate('/member');
      } else {
        // Strict: Never silently escalate unknown users to a verified member!
        setErrorMessage(
          t(
            'सदस्य विवरण फेला परेन। कृपया सही सदस्य नं., फोन वा नागरिकता नं. राख्नुहोस्।',
            'Member not found. Please verify your Member No, Phone or Citizenship No.'
          )
        );
      }
    }, 600);
  };

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    // Supabase Auth when configured; otherwise fall back to the offline flow.
    if (isSupabaseConfigured()) {
      const { data, error } = await signInStaffWithSupabase(staffUsername.trim(), staffPassword);
      setIsLoading(false);
      if (error || !data) {
        setErrorMessage(
          t(
            `सुपाबेस प्रमाणीकरण असफल: ${error || 'Unknown error'}`,
            `Supabase authentication failed: ${error || 'Unknown error'}`
          )
        );
        return;
      }
      setRole('ADMIN');
      setCurrentMember(null);
      navigate('/admin');
      return;
    }

    setTimeout(() => {
      setIsLoading(false);
      const cleanUser = staffUsername.trim().toLowerCase();
      if (!cleanUser) {
        setErrorMessage(t('कृपया कर्मचारी युजरनेम वा इमेल राख्नुहोस्', 'Please provide your CBS Officer Credentials'));
        return;
      }

      // Validate staff against the official employee roster
      const matchedEmployee = INITIAL_EMPLOYEES.find(
        (emp) =>
          emp.email.toLowerCase() === cleanUser ||
          emp.employeeNo.toLowerCase() === cleanUser ||
          emp.phone.replace(/[^0-9]/g, '').includes(cleanUser.replace(/[^0-9]/g, ''))
      );

      const isMasterAdmin = cleanUser === 'admin@unako.coop' || cleanUser === 'admin';

      if (!matchedEmployee && !isMasterAdmin) {
        setErrorMessage(
          t(
            'कर्मचारी विवरण फेला परेन। अधिकृत कर्मचारी युजरनेम प्रयोग गर्नुहोस्।',
            'Staff employee credentials not found. Please provide authorized CBS officer credentials.'
          )
        );
        return;
      }

      if (matchedEmployee) {
        signInStaff(matchedEmployee);
      } else {
        setRole('ADMIN');
        setCurrentMember(null);
        setCurrentEmployee(INITIAL_EMPLOYEES[0] ?? null);
        setStaffRole('SUPER_ADMIN');
      }
      navigate('/admin');
    }, 600);
  };

  const handleQuickDemo = (role: 'MEMBER' | 'STAFF') => {
    if (role === 'MEMBER') {
      switchToPreset('verified-member');
      navigate('/member');
      return;
    }
    switchToPreset('admin');
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* Top minimal header */}
      <header className="w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center group shrink-0" title="Unako SACCOS">
            <img
              src="/unako-logo.png"
              alt="Unako SACCOS Logo"
              className="h-12 w-auto object-contain transition-transform group-hover:scale-105 shrink-0"
            />
          </Link>

          <div className="flex items-center gap-4">
            <LanguageToggle variant="pill" />
            <Link
              to="/"
              className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
            >
              {t('← मुख्य वेबसाइटमा फर्कनुहोस्', '← Back to Public Website')}
            </Link>
          </div>
        </div>
      </header>

      {/* Main Login Card Area */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
            {/* Top Cooperative Branding Accent */}
            <div className="h-2 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-700"></div>

            <div className="p-6 sm:p-8">
              {/* Title & Welcome */}
              <div className="text-center space-y-1.5 mb-6">
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {loginMode === 'MEMBER'
                    ? t('सदस्य पोर्टल लगइन', 'Member Portal Sign In')
                    : t('कर्मचारी / प्रशासकीय अधिकार', 'CBS Staff / Admin Authority')}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {loginMode === 'MEMBER'
                    ? t('आफ्नो बचत पासबुक, कर्जा र शेयर कित्ता विवरण हेर्नुहोस्', 'Access your savings passbook, loan portfolio, and share kitta')
                    : t('केन्द्रीय कोर बैंकिङ प्रशासन तथा अडिट कन्सोल', 'Authorized central core banking administration & audit console')}
                </p>
              </div>

              {/* ─── SINGLE PAGE DUAL TOGGLE SWITCH ─── */}
              <div className="p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 grid grid-cols-2 gap-1.5 mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setLoginMode('MEMBER');
                    setErrorMessage(null);
                  }}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    loginMode === 'MEMBER'
                      ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <User className="size-4" />
                  <span>{t('सदस्य लगइन', 'Member Sign In')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setLoginMode('STAFF');
                    setErrorMessage(null);
                  }}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    loginMode === 'STAFF'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <ShieldAlert className="size-4" />
                  <span>{t('कर्मचारी / एडमिन', 'Staff / Admin')}</span>
                </button>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="p-3 mb-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* ─── FORM 1: MEMBER LOGIN ─── */}
              {loginMode === 'MEMBER' ? (
                <form onSubmit={handleMemberLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span>{t('दर्ता भएको इमेल', 'Registered Member Email')}</span>
                      <span className="text-[10px] text-slate-400 font-normal">{t('जस्तै: ram.shrestha@unako.coop.np', 'e.g. ram.shrestha@unako.coop.np')}</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={memberIdentifier}
                        onChange={(e) => setMemberIdentifier(e.target.value)}
                        placeholder={t('ram.shrestha@unako.coop.np', 'ram.shrestha@unako.coop.np')}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {t('पासकोड / पासवर्ड', 'Passcode / Password')}
                      </label>
                      <a
                        href="#forgot"
                        onClick={(e) => {
                          e.preventDefault();
                          alert(
                            t(
                              'कृपया आफ्नो पिन रिसेट गर्न उनको सहकारी शाखामा सम्पर्क गर्नुहोस् वा हेल्पलाइन ०८२-४१२०५५ मा डायल गर्नुहोस्।',
                              'Please contact your Unako Cooperative branch or dial helpline 082-412055 for PIN reset.'
                            )
                          );
                        }}
                        className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                      >
                        {t('पिन बिर्सनुभयो?', 'Forgot PIN?')}
                      </a>
                    </div>
                    <div className="relative">
                      <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={memberPassword}
                        onChange={(e) => setMemberPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 hover:shadow-lg transition flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <span className="inline-block size-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <span>{t('पोर्टलमा लगइन गर्नुहोस्', 'Sign In to Member Portal')}</span>
                        <ArrowRight className="size-4" />
                      </>
                    )}
                  </button>

                  <div className="pt-2 text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {t('सदस्य हुनुहुन्न?', 'Not a member yet?')}{' '}
                      <Link to="/member/verification" className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline">
                        {t('सदस्यताका लागि आवेदन दिनुहोस्', 'Apply for Membership')}
                      </Link>
                    </p>
                  </div>
                </form>
              ) : (
                /* ─── FORM 2: STAFF / ADMIN LOGIN ─── */
                <form onSubmit={handleStaffLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {t('कर्मचारी परिचय वा आधिकारिक इमेल', 'CBS Officer ID or Official Email')}
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={staffUsername}
                        onChange={(e) => setStaffUsername(e.target.value)}
                        placeholder={t('admin@unako.coop वा अधिकृत कोड', 'admin@unako.coop or AD-01')}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {t('शाखा वा काउन्टर टर्मिनल', 'Branch / Counter Terminal')}
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                      <select
                        value={staffBranch}
                        onChange={(e) => setStaffBranch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                      >
                        <option value="Main Branch, Gadhwa-5">{t('केन्द्रीय कार्यालय - गढवा-५, दाङ', 'Central HQ - Gadhwa-5, Dang')}</option>
                        <option value="Lamahi Service Counter">{t('शाखा ०२ - लमही सेवा केन्द्र', 'Branch 02 - Lamahi Service Center')}</option>
                        <option value="Bhalubang Extension Counter">{t('शाखा ०३ - भालुबाङ विस्तारित काउन्टर', 'Branch 03 - Bhalubang Extension')}</option>
                        <option value="Supervisory Committee">{t('लेखा सुपरिवेक्षण समिति कन्सोल', 'Internal Audit & Supervisory Board')}</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {t('सीबीएस मास्टर सेक्युरिटी कुञ्जी', 'CBS Master Security Key')}
                      </label>
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-mono flex items-center gap-1">
                        <Lock className="size-3" />
                        <span>{t('२एफए सुरक्षित', '2FA Protected')}</span>
                      </span>
                    </div>
                    <div className="relative">
                      <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={staffPassword}
                        onChange={(e) => setStaffPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-xs font-mono text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 hover:shadow-lg transition flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <span className="inline-block size-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <>
                        <ShieldAlert className="size-4" />
                        <span>{t('कोर बैंकिङ प्रणाली प्रवेश गर्नुहोस्', 'Authorize CBS Administrative Access')}</span>
                      </>
                    )}
                  </button>

                  <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 text-[11px] text-blue-900 dark:text-blue-300 flex items-start gap-2">
                    <ShieldCheck className="size-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>
                      {t(
                        'सबै प्रशासनिक सत्रहरू सीबीएस अडिट ट्रेलमा सुरक्षित रूपमा अभिलेख गरिन्छ।',
                        'All administrative sessions are logged cryptographically in the CBS immutable audit trail.'
                      )}
                    </span>
                  </div>
                </form>
              )}

              {/* ─── QUICK DEMO LOGINS (VISIBLE ONLY WHEN DEMO MODE IS ENABLED) ─── */}
              {demoActive && (
                <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-center">
                    {t('द्रुत डेमो एक-क्लिक पहुँच (डेमो मोड)', 'Quick Demo One-Click Access (Demo Mode)')}
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleQuickDemo('MEMBER')}
                      className="py-2 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-slate-700 dark:text-slate-300 hover:text-emerald-600 text-xs font-bold transition-all duration-150 ease-out active:scale-95 cursor-pointer text-center"
                    >
                      {t('डेमो सदस्य: राम श्रेष्ठ', 'Load Member: Ram Shrestha')}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickDemo('STAFF')}
                      className="py-2 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/30 text-slate-700 dark:text-slate-300 hover:text-blue-600 text-xs font-bold transition-all duration-150 ease-out active:scale-95 cursor-pointer text-center"
                    >
                      {t('डेमो स्टाफ: केन्द्रीय एडमिन', 'Load Staff: Central Admin')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Security & Regulatory Footer */}
          <div className="mt-6 text-center space-y-1 text-[11px] text-slate-400">
            <p className="flex items-center justify-center gap-1.5">
              <Lock className="size-3.5 text-emerald-500" />
              <span>{t('२५६-बिट एसएसएल इन्क्रिप्टेड • आईएसओ २७००१ सुरक्षा मापदण्ड', '256-Bit SSL Encrypted • ISO 27001 Cooperative Security Standard')}</span>
            </p>
            <p>
              {t('सहकारी दर्ता नं:', 'Department of Cooperatives Reg. No:')}{' '}
              {t(coopSettings.regNo, coopSettings.regNoEnglish || coopSettings.regNo)} •{' '}
              {t(coopSettings.addressNepali || coopSettings.address, coopSettings.addressEnglish || coopSettings.address)}
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
        © {new Date().getFullYear()} {coopSettings.name}. {t('सर्वाधिकार सुरक्षित।', 'All Rights Reserved.')}
      </footer>
    </div>
  );
};
