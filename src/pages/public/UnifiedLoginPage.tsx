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
import {
  authenticateStaffWithSupabase,
  LIVE_AUTH_REQUIRED,
} from '../../services/employeeService';
import {
  authenticateMemberWithSupabase,
  MEMBER_LIVE_AUTH_REQUIRED,
} from '../../services/memberAuthService';

export const UnifiedLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { signInMember, signInStaff, switchToPreset } = useAuthStore();
  const { coopSettings } = useCoopStore();
  const { t } = useLanguageStore();

  const demoActive = isDemoMode();

  /**
   * Development-only one-click demo affordance. `import.meta.env.DEV` is
   * statically replaced with `false` by Vite for production builds, so this
   * block (and the credential-less member preset it triggers) is compiled out of
   * shipped bundles. There is intentionally NO demo staff/admin entry point.
   */
  const showDevDemoPresets = import.meta.env.DEV === true && demoActive;

  // Mode: 'MEMBER' or 'STAFF'
  const [loginMode, setLoginMode] = useState<'MEMBER' | 'STAFF'>('MEMBER');

  // Credentials are never pre-filled. Hardcoded demo passwords would otherwise
  // be constant-folded straight into the production bundle.
  const [memberIdentifier, setMemberIdentifier] = useState('');
  const [memberPassword, setMemberPassword] = useState('');

  const [staffUsername, setStaffUsername] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffBranch, setStaffBranch] = useState('Main Branch, Gadhwa-5');

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleMemberLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    // Live Supabase Auth only; RLS then scopes the session to the member's own
    // rows (members.auth_user_id = auth.uid()). The service fails closed when
    // live auth is unavailable - there is no offline roster match any more.
    const { data, error } = await authenticateMemberWithSupabase(memberIdentifier, memberPassword);
    setIsLoading(false);

    if (error || !data) {
      setErrorMessage(
        error === MEMBER_LIVE_AUTH_REQUIRED
          ? t(
              'प्रत्यक्ष प्रमाणीकरण सेवा उपलब्ध छैन। सदस्य पोर्टल लगइनका लागि सीबीएस प्रमाणीकरण आवश्यक छ; अफलाइन पहुँच अस्वीकृत।',
              'Live authentication is unavailable. Member portal sign-in requires the CBS authentication service; offline access is refused.'
            )
          : t(
              `सदस्य लगइन असफल: ${error || 'अज्ञात त्रुटि'}`,
              `Member sign-in failed: ${error || 'unknown error'}`
            )
      );
      return;
    }

    signInMember(data);
    navigate('/member');
  };

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    // Staff/admin authority is granted ONLY after live Supabase Auth succeeds AND
    // the authenticated account is linked to an ACTIVE employee row (verified
    // inside the service). Any failure fails closed - never ADMIN.
    const { data: employee, error } = await authenticateStaffWithSupabase(staffUsername, staffPassword);
    setIsLoading(false);

    if (error || !employee) {
      setErrorMessage(
        error === LIVE_AUTH_REQUIRED
          ? t(
              'प्रत्यक्ष प्रमाणीकरण सेवा उपलब्ध छैन। कर्मचारी/एडमिन लगइनका लागि सीबीएस प्रमाणीकरण आवश्यक छ; अफलाइन कर्मचारी पहुँच अस्वीकृत।',
              'Live authentication is unavailable. Staff/admin sign-in requires the CBS authentication service; offline staff access is refused.'
            )
          : t(
              `कर्मचारी प्रमाणीकरण असफल: ${error || 'अज्ञात त्रुटि'}`,
              `Staff authentication failed: ${error || 'unknown error'}`
            )
      );
      return;
    }

    signInStaff(employee);
    navigate('/admin');
  };

  // Dev-only demo preset (never rendered in a production build).
  const handleQuickDemoMember = () => {
    switchToPreset('verified-member');
    navigate('/member');
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
                        placeholder={t('officer@unako.coop.np वा AD-01', 'officer@unako.coop.np or AD-01')}
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
                        'कोर बैंकिङ पहुँच केवल प्रमाणित सक्रिय कर्मचारी खाताहरूका लागि मात्र हो।',
                        'Core banking access is restricted to verified, active staff accounts.'
                      )}
                    </span>
                  </div>
                </form>
              )}

              {/* ─── DEV-ONLY DEMO PRESET (compiled out of production builds) ───
                  Deliberately member-only: there is no one-click staff/admin
                  entry point, so no credential-less path to ADMIN exists. */}
              {showDevDemoPresets && (
                <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-center">
                    {t('द्रुत डेमो पहुँच (केवल विकास बिल्ड)', 'Quick Demo Access (development build only)')}
                  </span>
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      type="button"
                      onClick={handleQuickDemoMember}
                      className="py-2 px-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-slate-700 dark:text-slate-300 hover:text-emerald-600 text-xs font-bold transition-all duration-150 ease-out active:scale-95 cursor-pointer text-center"
                    >
                      {t('डेमो सदस्य: राम श्रेष्ठ', 'Load Member: Ram Shrestha')}
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
              <span>{t('सुरक्षित पहुँच • अनधिकृत प्रयोग निषेध', 'Secured access • Unauthorized use prohibited')}</span>
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
