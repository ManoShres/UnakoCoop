
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  ShieldCheck,
  Upload,
  CheckCircle2,
  Clock,
  FileText,
  Building,
  CreditCard,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  FileCheck,
  Search,
  ExternalLink,
  Check,
} from 'lucide-react';
import { useCoopStore } from '../../store/useCoopStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { LanguageToggle } from '../../components/ui/LanguageToggle';
import { Member } from '../../types';

export const MemberVerificationPage: React.FC = () => {
  const navigate = useNavigate();
  const { members, addMember } = useCoopStore();
  const { t } = useLanguageStore();

  // Mode: 'APPLY' or 'TRACK'
  const [activeTab, setActiveTab] = useState<'APPLY' | 'TRACK'>('APPLY');

  // Form Step (1 to 4)
  const [step, setStep] = useState(1);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [nameNepali, setNameNepali] = useState('');
  const [gender, setGender] = useState('MALE');
  const [dob, setDob] = useState('2052-04-15');
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [mobilePhone, setMobilePhone] = useState('');
  const [email, setEmail] = useState('');
  const [citizenshipNo, setCitizenshipNo] = useState('');
  const [citizenshipDistrict, setCitizenshipDistrict] = useState('Dang');
  const [panNo, setPanNo] = useState('');

  // Address
  const [municipality, setMunicipality] = useState('Gadhwa Rural Municipality');
  const [wardNo, setWardNo] = useState('5');
  const [tole, setTole] = useState('Chainpur');
  const [province, setProvince] = useState('Lumbini Province');

  // Shares & Savings Scheme
  const [shareKitta, setShareKitta] = useState(10); // 10 shares = NPR 1,000
  const [preferredScheme, setPreferredScheme] = useState('General Member Savings (8.0% p.a.)');
  const [nomineeName, setNomineeName] = useState('');
  const [nomineeRelation, setNomineeRelation] = useState('Spouse');
  const [nomineePhone, setNomineePhone] = useState('');

  // Uploaded Document Previews
  const [docCitizenshipFront, setDocCitizenshipFront] = useState<string | null>(null);
  const [docCitizenshipBack, setDocCitizenshipBack] = useState<string | null>(null);
  const [docPhoto, setDocPhoto] = useState<string | null>(null);
  const [docSignature, setDocSignature] = useState<string | null>(null);

  // Declarations
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<{
    member: Member;
    refNo: string;
  } | null>(null);

  // Tracking Search
  const [trackQuery, setTrackQuery] = useState('');
  const [trackedResult, setTrackedResult] = useState<Member | null>(null);
  const [trackError, setTrackError] = useState<string | null>(null);

  // Quick 1-Click Sample Pre-loader
  const handleLoadSampleData = () => {
    setFullName('Bikram Bahadur Thapa');
    setNameNepali('बिक्रम बहादुर थापा');
    setGender('MALE');
    setDob('2054-08-22');
    setFatherName('Lal Bahadur Thapa');
    setMotherName('Kunti Devi Thapa');
    setMobilePhone('+977-9857829411');
    setEmail('bikram.thapa@gmail.com');
    setCitizenshipNo('28-01-76-08492');
    setCitizenshipDistrict('Dang');
    setPanNo('129034821');
    setMunicipality('Gadhwa Rural Municipality');
    setWardNo('5');
    setTole('Chainpur, Deukhuri');
    setShareKitta(20);
    setPreferredScheme('General Member Savings (8.0% p.a.)');
    setNomineeName('Sunita Thapa');
    setNomineeRelation('Spouse');
    setNomineePhone('+977-9847812900');
    setDocCitizenshipFront('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80');
    setDocCitizenshipBack('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&auto=format&fit=crop&q=80');
    setDocPhoto('https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80');
    setDocSignature('https://images.unsplash.com/photo-1544717305-2782549b5136?w=300&auto=format&fit=crop&q=80');
    setAgreeTerms(true);
  };

  const handleFileUpload = (type: 'front' | 'back' | 'photo' | 'sig', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      if (type === 'front') setDocCitizenshipFront(url);
      if (type === 'back') setDocCitizenshipBack(url);
      if (type === 'photo') setDocPhoto(url);
      if (type === 'sig') setDocSignature(url);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      alert('Please agree to the cooperative bylaws and declaration to proceed.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      const appNo = 'APP-2081-' + Math.floor(1000 + Math.random() * 9000);
      const newMember: Omit<Member, 'id'> = {
        memberNo: appNo,
        name: fullName || 'New Cooperative Applicant',
        nameNepali: nameNepali || fullName,
        email: email || 'applicant@unako.coop',
        phone: mobilePhone || '+977-9800000000',
        citizenshipNo: citizenshipNo || '28-01-00-00000',
        panNo: panNo || undefined,
        joinedDate: new Date().toISOString().split('T')[0],
        address: `${municipality}-${wardNo}, ${tole}, ${province}`,
        status: 'PENDING',
        avatarUrl: docPhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        shareCapital: shareKitta * 100,
        totalSavings: 0,
        activeLoanBalance: 0,
        accruedDividend: 0,
        creditScore: 650,
        bankDetails: { bankName: 'Direct Deposit', accountNo: 'PENDING', branch: 'Dang', holderName: fullName || 'New Member' },
        kycDocuments: {
          citizenshipFront: !!docCitizenshipFront,
          citizenshipBack: !!docCitizenshipBack,
          photo: !!docPhoto,
          signature: !!docSignature,
          utilityBill: true,
        },
        notes: `Online Applicant via Portal. Preferred: ${preferredScheme}. Nominee: ${nomineeName} (${nomineeRelation}). Initial Pledge: NPR ${(shareKitta * 100).toLocaleString()}.`,
      };

      const added = addMember(newMember);
      setSubmittedData({ member: added, refNo: appNo });
    }, 900);
  };

  const handleSearchTrack = (e: React.FormEvent) => {
    e.preventDefault();
    setTrackError(null);
    const q = trackQuery.trim().toLowerCase();
    if (!q) {
      setTrackError('Please enter an Application ID, Member No, or Citizenship number.');
      return;
    }

    const found = members.find(
      (m) =>
        m.memberNo.toLowerCase() === q ||
        m.citizenshipNo.toLowerCase().includes(q) ||
        m.phone.replace(/[^0-9]/g, '').includes(q.replace(/[^0-9]/g, '')) ||
        m.name.toLowerCase().includes(q)
    );

    if (found) {
      setTrackedResult(found);
    } else {
      setTrackError('No application found matching this reference. Please check and try again.');
      setTrackedResult(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* Cooperative Application Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 sm:px-8 py-3.5 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center group shrink-0" title="Unako SACCOS">
            <img
              src="/unako-logo.png"
              alt="Unako SACCOS Logo"
              className="h-12 w-auto object-contain transition-transform group-hover:scale-105 shrink-0"
            />
          </Link>

          <div className="flex items-center gap-3">
            <LanguageToggle variant="pill" />
            <Link
              to="/login"
              className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1 transition"
            >
              <ArrowLeft className="size-3.5" />
              <span>{t('लगइनमा फर्कनुहोस्', 'Back to Sign In')}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Top Banner with Mode Selector */}
        <div className="mb-8 text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
            <ShieldCheck className="size-4" />
            <span>{t('सहकारी ऐन २०७४ र राष्ट्र बैंक मापदण्ड अनुसार', 'Pursuant to Cooperative Act 2074 & NRB Standards')}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('सहकारी सदस्यता अनबोर्डिङ', 'Cooperative Membership Onboarding')}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            {t('उनको साकोसको सेयरधनी र मालिक बन्नुहोस्। आफ्नो व्यक्तिगत विवरण, ठेगाना र नागरिकता प्रमाण पेश गर्नुहोस्।', 'Become an equity shareholder and owner of Unako SACCOS. Submit your personal credentials, address, and citizenship proofs for CBS verification.')}
          </p>

          {/* Mode Switcher */}
          <div className="inline-flex p-1.5 rounded-2xl bg-slate-200/80 dark:bg-slate-800 border border-slate-300/80 dark:border-slate-700 max-w-md w-full mt-4">
            <button
              type="button"
              onClick={() => setActiveTab('APPLY')}
              className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'APPLY'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <FileText className="size-4" />
              <span>{t('नयाँ सदस्यता फारम', 'New Membership Form')}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('TRACK')}
              className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'TRACK'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <Search className="size-4" />
              <span>{t('आवेदन स्थिति ट्र्याक', 'Track Application Status')}</span>
            </button>
          </div>
        </div>

        {/* ----------------- TAB 1: APPLICATION SUBMISSION ----------------- */}
        {activeTab === 'APPLY' && (
          <div>
            {submittedData ? (
              /* Success Receipt View */
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-6">
                <div className="size-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto ring-8 ring-emerald-50 dark:ring-emerald-950/30">
                  <CheckCircle2 className="size-9" />
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                    Application Pending CBS Staff Review
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                    Membership Application Submitted!
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                    Your KYC documentation has been received into the Unako Central CBS queue. Cooperative verification officers in Gadhwa will review your citizenship records.
                  </p>
                </div>

                {/* Application Details Receipt Card */}
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-5 text-left border border-slate-200 dark:border-slate-700/60 space-y-3">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-xs text-slate-500">Tracking Reference No:</span>
                    <span className="font-mono text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                      {submittedData.refNo}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block">Applicant Name:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{submittedData.member.name}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Citizenship No:</span>
                      <span className="font-bold font-mono text-slate-900 dark:text-white">{submittedData.member.citizenshipNo}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Registered Mobile:</span>
                      <span className="font-bold text-slate-900 dark:text-white">{submittedData.member.phone}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Share Pledge:</span>
                      <span className="font-bold text-emerald-600">NPR {submittedData.member.shareCapital.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Next Steps Guide */}
                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-left text-xs text-blue-900 dark:text-blue-300 space-y-1.5">
                  <p className="font-bold flex items-center gap-1.5">
                    <Clock className="size-4 text-blue-600 dark:text-blue-400" />
                    Estimated Review Timeline: 24 - 48 Hours
                  </p>
                  <p className="text-[11px] text-blue-800 dark:text-blue-300">
                    Once staff verifies your citizenship, you will receive an SMS alert with your permanent Member Passbook Number and initial account PIN.
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={() => {
                      setSubmittedData(null);
                      setStep(1);
                    }}
                    className="flex-1 py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    Submit Another Application
                  </button>
                  <button
                    onClick={() => navigate('/admin/verifications')}
                    className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition flex items-center justify-center gap-1.5"
                  >
                    <ExternalLink className="size-4" />
                    <span>Open Staff Review Queue (Admin Demo)</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Application Form Card */
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
                {/* Accent top banner with Quick Demo loader */}
                <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-800 p-4 sm:p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold flex items-center gap-2">
                      <Sparkles className="size-5 text-emerald-200" />
                      <span>{t('सदस्यता आवेदन फारम', 'Membership Application Form')}</span>
                    </h2>
                    <p className="text-xs text-emerald-100 mt-0.5">
                      {t('सबै आवश्यक विवरणहरू भर्नुहोस् र नागरिकताको स्पष्ट फोटो अपलोड गर्नुहोस्।', 'Fill out all required fields. Upload clear photos of your citizenship certificate.')}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleLoadSampleData}
                    className="self-start sm:self-auto py-1.5 px-3 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition flex items-center gap-1.5 border border-white/30 shadow-xs cursor-pointer"
                    title={t('दाङका नमूना बासिन्दाको विवरण भर्नुहोस्', 'Pre-populate with sample Dang resident data')}
                  >
                    <Sparkles className="size-3.5" />
                    <span>{t('नमूना विवरण भर्नुहोस्', 'Load Sample Profile')}</span>
                  </button>
                </div>

                {/* Stepper Navigation */}
                <div className="border-b border-slate-200 dark:border-slate-800 px-6 py-4 bg-slate-50/70 dark:bg-slate-900/60 overflow-x-auto">
                  <div className="flex items-center justify-between min-w-[500px]">
                    {[
                      { num: 1, label: t('व्यक्तिगत र परिचय', 'Personal & KYC') },
                      { num: 2, label: t('ठेगाना र वडा', 'Address & Ward') },
                      { num: 3, label: t('सेयर र हकवाला', 'Shares & Nominee') },
                      { num: 4, label: t('कागजात प्रमाण', 'Document Proofs') },
                    ].map((s) => (
                      <button
                        key={s.num}
                        type="button"
                        onClick={() => setStep(s.num)}
                        className={`flex items-center gap-2 text-xs font-bold cursor-pointer ${
                          step === s.num
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : step > s.num
                            ? 'text-slate-800 dark:text-slate-200'
                            : 'text-slate-400'
                        }`}
                      >
                        <span
                          className={`size-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            step === s.num
                              ? 'bg-emerald-600 text-white'
                              : step > s.num
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                          }`}
                        >
                          {step > s.num ? '✓' : s.num}
                        </span>
                        <span>{s.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
                  {/* STEP 1: Personal & Contact */}
                  {step === 1 && (
                    <div className="space-y-4">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
                        <User className="size-4 text-emerald-500" />
                        <span>{t('१. व्यक्तिगत तथा परिचय विवरण', '1. Personal & KYC Profile')}</span>
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            {t('पूरा नाम (अंग्रेजीमा) *', 'Full Legal Name (English) *')}
                          </label>
                          <input
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder={t('जस्तै: बिक्रम बहादुर थापा', 'e.g. Bikram Bahadur Thapa')}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            {t('पूरा नाम (नेपाली देवनागरीमा)', 'Full Legal Name (in Devanagari)')}
                          </label>
                          <input
                            type="text"
                            value={nameNepali}
                            onChange={(e) => setNameNepali(e.target.value)}
                            placeholder={t('जस्तै: बिक्रम बहादुर थापा', 'e.g. बिक्रम बहादुर थापा')}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            {t('लिङ्ग *', 'Gender *')}
                          </label>
                          <select
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          >
                            <option value="MALE">{t('पुरुष', 'Male')}</option>
                            <option value="FEMALE">{t('महिला', 'Female')}</option>
                            <option value="OTHER">{t('अन्य', 'Other')}</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            {t('जन्म मिति (वि.सं.) *', 'Date of Birth (B.S.) *')}
                          </label>
                          <input
                            type="text"
                            required
                            value={dob}
                            onChange={(e) => setDob(e.target.value)}
                            placeholder={t('वर्ष-महिना-गते (जस्तै: २०५२-०४-१५)', 'YYYY-MM-DD (e.g. 2052-04-15)')}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            {t('बुवाको पूरा नाम *', "Father's Full Name *")}
                          </label>
                          <input
                            type="text"
                            required
                            value={fatherName}
                            onChange={(e) => setFatherName(e.target.value)}
                            placeholder={t("बुवाको नाम (जस्तै: लाल बहादुर थापा)", "Father's full name")}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            {t('आमाको पूरा नाम *', "Mother's Full Name *")}
                          </label>
                          <input
                            type="text"
                            required
                            value={motherName}
                            onChange={(e) => setMotherName(e.target.value)}
                            placeholder={t("आमाको नाम (जस्तै: कुन्ती देवी थापा)", "Mother's full name")}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            {t('सम्पर्क मोबाइल नम्बर *', 'Mobile Phone Number *')}
                          </label>
                          <input
                            type="tel"
                            required
                            value={mobilePhone}
                            onChange={(e) => setMobilePhone(e.target.value)}
                            placeholder={t('+९७७-९८५७८२९४११', '+977-9857829411')}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            {t('इमेल ठेगाना (ऐच्छिक)', 'Email Address (Optional)')}
                          </label>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={t('naam@example.com', 'your.email@example.com')}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            {t('नागरिकता प्रमाणपत्र नं. *', 'Citizenship Certificate No *')}
                          </label>
                          <input
                            type="text"
                            required
                            value={citizenshipNo}
                            onChange={(e) => setCitizenshipNo(e.target.value)}
                            placeholder={t('जस्तै: २८-०१-७६-०८४९२', 'e.g. 28-01-76-08492')}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            {t('नागरिकता जारी जिल्ला *', 'Citizenship Issue District *')}
                          </label>
                          <input
                            type="text"
                            required
                            value={citizenshipDistrict}
                            onChange={(e) => setCitizenshipDistrict(e.target.value)}
                            placeholder={t('जस्तै: दाङ', 'e.g. Dang')}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-4">
                        <button
                          type="button"
                          onClick={() => setStep(2)}
                          className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer"
                        >
                          <span>{t('अर्को: ठेगाना विवरण', 'Next: Address Details')}</span>
                          <ArrowRight className="size-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: Address Details */}
                  {step === 2 && (
                    <div className="space-y-4">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
                        <Building className="size-4 text-emerald-500" />
                        <span>{t('२. स्थायी तथा वर्तमान ठेगाना', '2. Address & Ward Details')}</span>
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            {t('प्रदेश *', 'Province *')}
                          </label>
                          <select
                            value={province}
                            onChange={(e) => setProvince(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          >
                            <option value="Lumbini Province">{t('लुम्बिनी प्रदेश', 'Lumbini Province')}</option>
                            <option value="Bagmati Province">{t('बागमती प्रदेश', 'Bagmati Province')}</option>
                            <option value="Gandaki Province">{t('गण्डकी प्रदेश', 'Gandaki Province')}</option>
                            <option value="Karnali Province">{t('कर्णाली प्रदेश', 'Karnali Province')}</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            {t('जिल्ला *', 'District *')}
                          </label>
                          <input
                            type="text"
                            required
                            value={t('दाङ', 'Dang')}
                            readOnly
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/50 text-xs font-bold text-slate-700 dark:text-slate-300"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            {t('गाउँपालिका / नगरपालिका *', 'Municipality / Rural Municipality *')}
                          </label>
                          <select
                            value={municipality}
                            onChange={(e) => setMunicipality(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          >
                            <option value="Gadhwa Rural Municipality">{t('गढवा गाउँपालिका', 'Gadhwa Rural Municipality')}</option>
                            <option value="Lamahi Municipality">{t('लमही नगरपालिका', 'Lamahi Municipality')}</option>
                            <option value="Rajpur Rural Municipality">{t('राजपुर गाउँपालिका', 'Rajpur Rural Municipality')}</option>
                            <option value="Rapti Rural Municipality">{t('राप्ती गाउँपालिका', 'Rapti Rural Municipality')}</option>
                            <option value="Ghorahi Sub-Metropolitan">{t('घोराही उपमहानगर', 'Ghorahi Sub-Metropolitan')}</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            {t('वडा नम्बर *', 'Ward Number *')}
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="19"
                            required
                            value={wardNo}
                            onChange={(e) => setWardNo(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            {t('टोल / बस्तीको नाम *', 'Tole / Settlement / Village *')}
                          </label>
                          <input
                            type="text"
                            required
                            value={tole}
                            onChange={(e) => setTole(e.target.value)}
                            placeholder={t('जस्तै: चैनपुर, देउखुरी', 'e.g. Chainpur, Deukhuri')}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex justify-between pt-4">
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="py-2.5 px-5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <ArrowLeft className="size-4" />
                          <span>{t('पछाडि', 'Previous')}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setStep(3)}
                          className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer"
                        >
                          <span>{t('अर्को: सेयर र हकवाला', 'Next: Shares & Nominee')}</span>
                          <ArrowRight className="size-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: Shares, Scheme & Nominee */}
                  {step === 3 && (
                    <div className="space-y-4">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
                        <CreditCard className="size-4 text-emerald-500" />
                        <span>{t('३. शेयर खरिद तथा इच्छाएको व्यक्ति', '3. Shares, Scheme & Nominee')}</span>
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            {t('सुरुवाती शेयर खरिद (कम्तिमा १० कित्ता = रु. १,०००) *', 'Initial Share Subscription (Min. 10 shares = NPR 1,000) *')}
                          </label>
                          <select
                            value={shareKitta}
                            onChange={(e) => setShareKitta(Number(e.target.value))}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-emerald-600 dark:text-emerald-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          >
                            <option value="10">{t('१० कित्ता — रु. १,००० (साधारण प्रवेश)', '10 Shares — NPR 1,000 (Standard Entry)')}</option>
                            <option value="20">{t('२० कित्ता — रु. २,०००', '20 Shares — NPR 2,000')}</option>
                            <option value="50">{t('५० कित्ता — रु. ५,०००', '50 Shares — NPR 5,000')}</option>
                            <option value="100">{t('१०० कित्ता — रु. १०,०००', '100 Shares — NPR 10,000')}</option>
                          </select>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            {t('प्रवेश शुल्क: रु. १०० एकपटकको कानुनी दस्तुर।', 'Entrance Fee: NPR 100 one-time statutory fee.')}
                          </span>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                            {t('प्राथमिक बचत योजना *', 'Preferred Initial Savings Scheme *')}
                          </label>
                          <select
                            value={preferredScheme}
                            onChange={(e) => setPreferredScheme(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                          >
                            <option>{t('साधारण सदस्य बचत (८.०% प्र.व.)', 'General Member Savings (8.0% p.a.)')}</option>
                            <option>{t('नारी उत्थान महिला बचत (८.५% प्र.व.)', 'Nari Utthan Mahila Bachat (8.5% p.a.)')}</option>
                            <option>{t('बाल भविष्य बचत (९.०% प्र.व.)', 'Child Growth Future Fund (9.0% p.a.)')}</option>
                            <option>{t('ऐच्छिक दैनिक बचत (६.०% प्र.व.)', 'Optional Daily Saving (6.0% p.a.)')}</option>
                          </select>
                        </div>

                        <div className="sm:col-span-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-3">
                            {t('हकवाला / इच्छाएको व्यक्तिको विवरण', 'Nominee Details')}
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-500 mb-1">
                                {t('हकवालाको पूरा नाम *', 'Nominee Full Name *')}
                              </label>
                              <input
                                type="text"
                                required
                                value={nomineeName}
                                onChange={(e) => setNomineeName(e.target.value)}
                                placeholder={t('हकवालाको नाम', "Nominee's name")}
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-500 mb-1">
                                {t('नाता *', 'Relationship *')}
                              </label>
                              <select
                                value={nomineeRelation}
                                onChange={(e) => setNomineeRelation(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                              >
                                <option value="Spouse">{t('पति/पत्नी', 'Spouse')}</option>
                                <option value="Son">{t('छोरा', 'Son')}</option>
                                <option value="Daughter">{t('छोरी', 'Daughter')}</option>
                                <option value="Father">{t('बुवा', 'Father')}</option>
                                <option value="Mother">{t('आमा', 'Mother')}</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-500 mb-1">
                                {t('हकवालाको फोन नं.', 'Nominee Contact Phone')}
                              </label>
                              <input
                                type="tel"
                                value={nomineePhone}
                                onChange={(e) => setNomineePhone(e.target.value)}
                                placeholder="+977-98XXXXXXXX"
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between pt-4">
                        <button
                          type="button"
                          onClick={() => setStep(2)}
                          className="py-2.5 px-5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <ArrowLeft className="size-4" />
                          <span>{t('पछाडि', 'Previous')}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setStep(4)}
                          className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer"
                        >
                          <span>{t('अर्को: कागजात प्रमाणहरू', 'Next: Document Proofs')}</span>
                          <ArrowRight className="size-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 4: Document Uploads & Declaration */}
                  {step === 4 && (
                    <div className="space-y-6">
                      <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
                        <Upload className="size-4 text-emerald-500" />
                        <span>{t('४. प्रमाण कागजातहरू अपलोड', '4. KYC Document Uploads')}</span>
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Citizenship Front */}
                        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              {t('नागरिकता अगाडि *', 'Citizenship Front *')}
                            </span>
                            {docCitizenshipFront && (
                              <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                                <Check className="size-3" /> {t('संलग्न भयो', 'Attached')}
                              </span>
                            )}
                          </div>
                          {docCitizenshipFront ? (
                            <div className="relative h-28 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group">
                              <img src={docCitizenshipFront} alt="Citizenship Front" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => setDocCitizenshipFront(null)}
                                className="absolute top-1.5 right-1.5 p-1 rounded-md bg-slate-900/80 text-white text-[10px] opacity-0 group-hover:opacity-100 transition"
                              >
                                {t('हटाउनुहोस्', 'Remove')}
                              </button>
                            </div>
                          ) : (
                            <label className="h-28 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-emerald-600 hover:border-emerald-500 transition cursor-pointer">
                              <Upload className="size-5" />
                              <span className="text-[11px] font-medium">{t('फोटो अपलोड गर्न थिच्नुहोस्', 'Click to upload image')}</span>
                              <input
                                type="file"
                                accept="image/*,.pdf"
                                onChange={(e) => handleFileUpload('front', e)}
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>

                        {/* Citizenship Back */}
                        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              {t('नागरिकता पछाडि *', 'Citizenship Back *')}
                            </span>
                            {docCitizenshipBack && (
                              <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                                <Check className="size-3" /> {t('संलग्न भयो', 'Attached')}
                              </span>
                            )}
                          </div>
                          {docCitizenshipBack ? (
                            <div className="relative h-28 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group">
                              <img src={docCitizenshipBack} alt="Citizenship Back" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => setDocCitizenshipBack(null)}
                                className="absolute top-1.5 right-1.5 p-1 rounded-md bg-slate-900/80 text-white text-[10px] opacity-0 group-hover:opacity-100 transition"
                              >
                                {t('हटाउनुहोस्', 'Remove')}
                              </button>
                            </div>
                          ) : (
                            <label className="h-28 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-emerald-600 hover:border-emerald-500 transition cursor-pointer">
                              <Upload className="size-5" />
                              <span className="text-[11px] font-medium">{t('फोटो अपलोड गर्न थिच्नुहोस्', 'Click to upload image')}</span>
                              <input
                                type="file"
                                accept="image/*,.pdf"
                                onChange={(e) => handleFileUpload('back', e)}
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>

                        {/* Passport Photo */}
                        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              {t('पासपोर्ट साइज फोटो *', 'Passport Size Photo *')}
                            </span>
                            {docPhoto && (
                              <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                                <Check className="size-3" /> {t('संलग्न भयो', 'Attached')}
                              </span>
                            )}
                          </div>
                          {docPhoto ? (
                            <div className="relative h-28 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group">
                              <img src={docPhoto} alt="Passport Photo" className="w-full h-full object-contain" />
                              <button
                                type="button"
                                onClick={() => setDocPhoto(null)}
                                className="absolute top-1.5 right-1.5 p-1 rounded-md bg-slate-900/80 text-white text-[10px] opacity-0 group-hover:opacity-100 transition"
                              >
                                {t('हटाउनुहोस्', 'Remove')}
                              </button>
                            </div>
                          ) : (
                            <label className="h-28 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-emerald-600 hover:border-emerald-500 transition cursor-pointer">
                              <User className="size-5" />
                              <span className="text-[11px] font-medium">{t('फोटो अपलोड गर्नुहोस्', 'Upload photo')}</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileUpload('photo', e)}
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>

                        {/* Signature Specimen */}
                        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                              {t('दस्तखत नमुना *', 'Signature Specimen *')}
                            </span>
                            {docSignature && (
                              <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                                <Check className="size-3" /> {t('संलग्न भयो', 'Attached')}
                              </span>
                            )}
                          </div>
                          {docSignature ? (
                            <div className="relative h-28 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group">
                              <img src={docSignature} alt="Signature" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => setDocSignature(null)}
                                className="absolute top-1.5 right-1.5 p-1 rounded-md bg-slate-900/80 text-white text-[10px] opacity-0 group-hover:opacity-100 transition"
                              >
                                {t('हटाउनुहोस्', 'Remove')}
                              </button>
                            </div>
                          ) : (
                            <label className="h-28 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-emerald-600 hover:border-emerald-500 transition cursor-pointer">
                              <FileCheck className="size-5" />
                              <span className="text-[11px] font-medium">{t('दस्तखत फोटो अपलोड गर्नुहोस्', 'Upload signature image')}</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileUpload('sig', e)}
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>
                      </div>

                      {/* Bylaws Declaration Checkbox */}
                      <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50">
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={agreeTerms}
                            onChange={(e) => setAgreeTerms(e.target.checked)}
                            className="mt-1 size-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                          <span className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                            {t(
                              'म यस संस्थाको विनियम, सहकारी ऐन २०७४ र सम्बन्धित नियमहरू पूर्ण रूपमा पालना गर्न मञ्जुर छु। मैले पेश गरेका सम्पूर्ण विवरण तथा कागजातहरू सत्य-तथ्य छन्।',
                              'I hereby declare that all information provided is accurate and pledge adherence to Unako SACCOS bylaws and Cooperative Act 2074.'
                            )}
                          </span>
                        </label>
                      </div>

                      {/* Submit Bar */}
                      <div className="flex justify-between items-center pt-4">
                        <button
                          type="button"
                          onClick={() => setStep(3)}
                          className="py-2.5 px-5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <ArrowLeft className="size-4" />
                          <span>{t('पछाडि', 'Previous')}</span>
                        </button>

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="py-3.5 px-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/30 hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer disabled:opacity-50"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="size-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                              <span>{t('सीबीएसमा पेश हुँदैछ...', 'Submitting Application to CBS...')}</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="size-5" />
                              <span>{t('सदस्यता आवेदन पेश गर्नुहोस्', 'Submit Membership Application')}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            )}
          </div>
        )}

        {/* ----------------- TAB 2: TRACK STATUS ----------------- */}
        {activeTab === 'TRACK' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 sm:p-8 space-y-5">
              <div className="text-center space-y-1">
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  {t('सदस्यता आवेदनको स्थिति हेर्नुहोस्', 'Track Your Membership Application')}
                </h2>
                <p className="text-xs text-slate-500">
                  {t('तपाईंको आवेदन नम्बर (जस्तै APP-2081-XXXX), फोन नम्बर वा नागरिकता नम्बर प्रविष्ट गर्नुहोस्', 'Enter your Application ID (e.g. APP-2081-XXXX), Phone Number, or Citizenship Number')}
                </p>
              </div>

              <form onSubmit={handleSearchTrack} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-3 size-4 text-slate-400" />
                  <input
                    type="text"
                    value={trackQuery}
                    onChange={(e) => setTrackQuery(e.target.value)}
                    placeholder={t('जस्तै: UK-92014, APP-2081, वा 28-02-75', 'e.g. UK-92014, APP-2081, or 28-02-75')}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition cursor-pointer"
                >
                  {t('खोजी गर्नुहोस्', 'Search')}
                </button>
              </form>

              {trackError && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{trackError}</span>
                </div>
              )}

              {/* Result Preview */}
              {trackedResult && (
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={trackedResult.avatarUrl}
                        alt=""
                        className="size-11 rounded-full object-cover ring-2 ring-emerald-500/30"
                      />
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{trackedResult.name}</h4>
                        <p className="text-[11px] font-mono text-slate-400">{trackedResult.memberNo}</p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        trackedResult.status === 'VERIFIED'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : trackedResult.status === 'ACTION_REQUIRED'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {trackedResult.status === 'VERIFIED'
                        ? t('स्वीकृत र प्रमाणीकरण सम्पन्न', 'Approved & Verified')
                        : trackedResult.status === 'ACTION_REQUIRED'
                        ? t('कागजात सच्याउन बाँकी', 'Document Action Required')
                        : t('कर्मचारी समीक्षाधीन', 'Under Staff Review')}
                    </span>
                  </div>

                  {/* 4-Step Status Progress Tracker */}
                  <div className="p-4 rounded-2xl bg-slate-50/60 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800 space-y-3">
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      {t('आवेदन प्रक्रिया चरणहरू', 'Onboarding Pipeline Status')}
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-xs">
                        <div className="size-6 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[10px]">
                          ✓
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-slate-900 dark:text-white">{t('आवेदन प्राप्त भयो', 'Application Received')}</p>
                          <p className="text-[11px] text-slate-400">{t('मिति', 'Date')}: {trackedResult.joinedDate}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs">
                        <div
                          className={`size-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                            trackedResult.status === 'VERIFIED'
                              ? 'bg-emerald-500 text-white'
                              : 'bg-amber-500 text-white animate-pulse'
                          }`}
                        >
                          {trackedResult.status === 'VERIFIED' ? '✓' : '2'}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-slate-900 dark:text-white">
                            {t('कर्मचारी सीबीएस कागजात प्रमाणीकरण', 'Staff CBS Document Verification')}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {trackedResult.status === 'VERIFIED'
                              ? t('शाखा अधिकृतबाट नागरिकता प्रमाणित भयो', 'Citizenship verified by supervisory officer')
                              : t('गढवा शाखा अधिकृतको रुजु बाँकी', 'Pending scrutiny by Gadhwa branch officer')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs">
                        <div
                          className={`size-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                            trackedResult.status === 'VERIFIED'
                              ? 'bg-emerald-500 text-white'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                          }`}
                        >
                          {trackedResult.status === 'VERIFIED' ? '✓' : '3'}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-slate-900 dark:text-white">{t('शेयर पुँजी बाँडफाँड', 'Share Capital Allocation')}</p>
                          <p className="text-[11px] text-slate-400">
                            {t('जम्मा पुँजी', 'Pledged')}: रु. {trackedResult.shareCapital.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {trackedResult.status === 'VERIFIED' ? (
                    <div className="pt-2">
                      <Link
                        to="/login"
                        className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition"
                      >
                        <span>{t('सदस्य पोर्टलमा लगइन गर्नुहोस्', 'Sign In to Member Portal Now')}</span>
                        <ArrowRight className="size-4" />
                      </Link>
                    </div>
                  ) : (
                    <div className="pt-2 flex justify-between items-center text-xs text-slate-400">
                      <span>{t('छिटो निकास चाहनुहुन्छ? गढवा शाखा कार्यालयमा सम्पर्क गर्नुहोस्।', 'Need urgent clearance? Visit Gadhwa Branch office.')}</span>
                      <a href="tel:+97782412055" className="text-emerald-600 font-bold hover:underline">
                        {t('सम्पर्क: ०८२-४१२०५५', 'Call +977-82-412055')}
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Minimal Footer */}
      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
        © {new Date().getFullYear()} Unako Saving &amp; Credit Cooperative Ltd. • Gadhwa-5, Dang • Reg. No: 421/068/069
      </footer>
    </div>
  );
};
