import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  FileText,
  ArrowLeft,
  Sparkles,
  Search,
} from 'lucide-react';
import { useCoopStore } from '../../store/useCoopStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { LanguageToggle } from '../../components/ui/LanguageToggle';
import { Member } from '../../types';
import { MemberVerificationStep1 } from './components/MemberVerificationStep1';
import { MemberVerificationStep2 } from './components/MemberVerificationStep2';
import { MemberVerificationStep3 } from './components/MemberVerificationStep3';
import { MemberVerificationStep4 } from './components/MemberVerificationStep4';
import { MemberVerificationSuccess } from './components/MemberVerificationSuccess';
import { MemberVerificationTrackTab } from './components/MemberVerificationTrackTab';

export const MemberVerificationPage: React.FC = () => {
  const navigate = useNavigate();
  const { members, addMember } = useCoopStore();
  const { t, fmtCurrency } = useLanguageStore();

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
        notes: `Online Applicant via Portal. Preferred: ${preferredScheme}. Nominee: ${nomineeName} (${nomineeRelation}). Initial Pledge: NPR ${fmtCurrency(shareKitta * 100, true)}.`,
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
            {t(
              'उनको साकोसको सेयरधनी र मालिक बन्नुहोस्। आफ्नो व्यक्तिगत विवरण, ठेगाना र नागरिकता प्रमाण पेश गर्नुहोस्।',
              'Become an equity shareholder and owner of Unako SACCOS. Submit your personal credentials, address, and citizenship proofs for CBS verification.'
            )}
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

        {/* TAB 1: APPLICATION SUBMISSION */}
        {activeTab === 'APPLY' && (
          <div>
            {submittedData ? (
              <MemberVerificationSuccess
                submittedData={submittedData}
                onReset={() => {
                  setSubmittedData(null);
                  setStep(1);
                }}
                onOpenAdminQueue={() => navigate('/admin/verifications')}
              />
            ) : (
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
                  {step === 1 && (
                    <MemberVerificationStep1
                      fullName={fullName}
                      setFullName={setFullName}
                      nameNepali={nameNepali}
                      setNameNepali={setNameNepali}
                      gender={gender}
                      setGender={setGender}
                      dob={dob}
                      setDob={setDob}
                      fatherName={fatherName}
                      setFatherName={setFatherName}
                      motherName={motherName}
                      setMotherName={setMotherName}
                      mobilePhone={mobilePhone}
                      setMobilePhone={setMobilePhone}
                      email={email}
                      setEmail={setEmail}
                      citizenshipNo={citizenshipNo}
                      setCitizenshipNo={setCitizenshipNo}
                      citizenshipDistrict={citizenshipDistrict}
                      setCitizenshipDistrict={setCitizenshipDistrict}
                      onNext={() => setStep(2)}
                    />
                  )}

                  {step === 2 && (
                    <MemberVerificationStep2
                      province={province}
                      setProvince={setProvince}
                      municipality={municipality}
                      setMunicipality={setMunicipality}
                      wardNo={wardNo}
                      setWardNo={setWardNo}
                      tole={tole}
                      setTole={setTole}
                      onPrevious={() => setStep(1)}
                      onNext={() => setStep(3)}
                    />
                  )}

                  {step === 3 && (
                    <MemberVerificationStep3
                      shareKitta={shareKitta}
                      setShareKitta={setShareKitta}
                      preferredScheme={preferredScheme}
                      setPreferredScheme={setPreferredScheme}
                      nomineeName={nomineeName}
                      setNomineeName={setNomineeName}
                      nomineeRelation={nomineeRelation}
                      setNomineeRelation={setNomineeRelation}
                      nomineePhone={nomineePhone}
                      setNomineePhone={setNomineePhone}
                      onPrevious={() => setStep(2)}
                      onNext={() => setStep(4)}
                    />
                  )}

                  {step === 4 && (
                    <MemberVerificationStep4
                      docCitizenshipFront={docCitizenshipFront}
                      setDocCitizenshipFront={setDocCitizenshipFront}
                      docCitizenshipBack={docCitizenshipBack}
                      setDocCitizenshipBack={setDocCitizenshipBack}
                      docPhoto={docPhoto}
                      setDocPhoto={setDocPhoto}
                      docSignature={docSignature}
                      setDocSignature={setDocSignature}
                      onFileUpload={handleFileUpload}
                      agreeTerms={agreeTerms}
                      setAgreeTerms={setAgreeTerms}
                      isSubmitting={isSubmitting}
                      onPrevious={() => setStep(3)}
                    />
                  )}
                </form>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TRACK STATUS */}
        {activeTab === 'TRACK' && (
          <MemberVerificationTrackTab
            trackQuery={trackQuery}
            setTrackQuery={setTrackQuery}
            onSearchTrack={handleSearchTrack}
            trackError={trackError}
            trackedResult={trackedResult}
          />
        )}
      </main>

      {/* Minimal Footer */}
      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
        © {new Date().getFullYear()} Unako Saving &amp; Credit Cooperative Ltd. • Gadhwa-5, Dang • Reg. No: 421/068/069
      </footer>
    </div>
  );
};
