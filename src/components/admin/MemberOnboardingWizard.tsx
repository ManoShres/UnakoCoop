import React, { useState } from 'react';
import { useCoopStore } from '../../store/useCoopStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { Member } from '../../types';
import { toNepaliDigits } from '../../utils/nepaliDate';
import {
  User,
  MapPin,
  FileText,
  HeartHandshake,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Upload,
  X,
  ShieldCheck,
  Building,
  CreditCard,
  Camera,
  FileCheck,
  AlertCircle,
} from 'lucide-react';

interface MemberOnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newMember: Member) => void;
}

const NEPAL_PROVINCES = [
  'कोशी प्रदेश (Koshi)',
  'मधेश प्रदेश (Madhesh)',
  'बागमती प्रदेश (Bagmati)',
  'गण्डकी प्रदेश (Gandaki)',
  'लुम्बिनी प्रदेश (Lumbini)',
  'कर्णाली प्रदेश (Karnali)',
  'सुदूरपश्चिम प्रदेश (Sudurpashchim)',
];

const OCCUPATION_OPTIONS = [
  { value: 'Agriculture', labelNe: 'कृषि तथा पशुपालन', labelEn: 'Agriculture & Livestock' },
  { value: 'Business', labelNe: 'साना तथा मझौला व्यापार', labelEn: 'Small/Medium Business' },
  { value: 'Service', labelNe: 'सरकारी/निजी जागिर', labelEn: 'Public/Private Service' },
  { value: 'ForeignEmployment', labelNe: 'वैदेशिक रोजगार', labelEn: 'Foreign Employment' },
  { value: 'HomeMaker', labelNe: 'घरायसी कार्य', labelEn: 'Home Maker' },
  { value: 'Other', labelNe: 'अन्य पेशा/व्यवसाय', labelEn: 'Other Enterprise' },
];

export const MemberOnboardingWizard: React.FC<MemberOnboardingWizardProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { addMember, motherGroups } = useCoopStore();
  const { t, fmtCurrency } = useLanguageStore();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Step 1: Personal & Lineage
  const [fullNameEn, setFullNameEn] = useState('');
  const [fullNameNe, setFullNameNe] = useState('');
  const [gender, setGender] = useState<'FEMALE' | 'MALE' | 'OTHER'>('FEMALE');
  const [maritalStatus, setMaritalStatus] = useState<'UNMARRIED' | 'MARRIED' | 'WIDOWED' | 'DIVORCED' | 'OTHER'>('MARRIED');
  const [dobBs, setDobBs] = useState('२०४८-०४-१५');
  const [dobAd, setDobAd] = useState('1991-07-30');
  const [phone, setPhone] = useState('98578-');
  const [email, setEmail] = useState('');
  const [occupation, setOccupation] = useState('Agriculture');
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [grandfatherName, setGrandfatherName] = useState('');
  const [spouseName, setSpouseName] = useState('');

  // Step 2: Address & Group
  const [province, setProvince] = useState('लुम्बिनी प्रदेश (Lumbini)');
  const [district, setDistrict] = useState('दाङ (Dang)');
  const [palika, setPalika] = useState('गढवा गाउँपालिका (Gadhwa)');
  const [wardNo, setWardNo] = useState('५');
  const [tole, setTole] = useState('चेपे (Chepe)');
  const [sameAsPermanent, setSameAsPermanent] = useState(true);
  const [tempAddress, setTempAddress] = useState('');
  const [selectedMotherGroup, setSelectedMotherGroup] = useState<string>('');

  // Step 3: Identity & Documents
  const [citizenshipNo, setCitizenshipNo] = useState('');
  const [citizenshipIssueDateBs, setCitizenshipIssueDateBs] = useState('२०६६-०२-११');
  const [citizenshipIssueDistrict, setCitizenshipIssueDistrict] = useState('दाङ (Dang)');
  const [nationalIdNo, setNationalIdNo] = useState('');
  const [panNo, setPanNo] = useState('');
  const [docPhotoUploaded, setDocPhotoUploaded] = useState(true);
  const [docCitizenshipFrontUploaded, setDocCitizenshipFrontUploaded] = useState(true);
  const [docCitizenshipBackUploaded, setDocCitizenshipBackUploaded] = useState(true);
  const [docSignatureUploaded, setDocSignatureUploaded] = useState(true);

  // Step 4: Nominee & Shares / Accounts
  const [nomineeName, setNomineeName] = useState('');
  const [nomineeRelation, setNomineeRelation] = useState('छोरा (Son)');
  const [nomineeCitizenship, setNomineeCitizenship] = useState('');
  const [nomineePhone, setNomineePhone] = useState('');
  const [nomineeIsMinor, setNomineeIsMinor] = useState(false);
  const [nomineeGuardianName, setNomineeGuardianName] = useState('');
  const [nomineeGuardianRelation, setNomineeGuardianRelation] = useState('');
  const [shareKitta, setShareKitta] = useState<number>(50); // 50 kitta = NPR 5,000
  const [entranceFee, setEntranceFee] = useState<number>(500);
  const [monthlySavingsCommitment, setMonthlySavingsCommitment] = useState<number>(1000);
  const [bankName, setBankName] = useState('Agricultural Development Bank Ltd');
  const [bankAccountNo, setBankAccountNo] = useState('');
  const [bankBranch, setBankBranch] = useState('Gadhwa');

  if (!isOpen) return null;

  const handleStepValidation = (step: number): boolean => {
    setErrorMsg(null);
    if (step === 1) {
      if (!fullNameEn.trim() && !fullNameNe.trim()) {
        setErrorMsg(t('कृपया सदस्यको पूरा नाम प्रविष्ट गर्नुहोस्।', 'Please provide member full legal name.'));
        return false;
      }
      if (!fatherName.trim()) {
        setErrorMsg(t('तीन पुस्ते विवरणका लागि बाबुको नाम अनिवार्य छ।', 'Father name is required for 3-generation lineage.'));
        return false;
      }
      if (!grandfatherName.trim()) {
        setErrorMsg(t('तीन पुस्ते विवरणका लागि बाजेको नाम अनिवार्य छ।', 'Grandfather name is required for 3-generation lineage.'));
        return false;
      }
      return true;
    }
    if (step === 2) {
      if (!district.trim() || !palika.trim() || !wardNo.trim()) {
        setErrorMsg(t('कृपया जिल्ला, पालिका र वडा नं. प्रविष्ट गर्नुहोस्।', 'District, Municipality/Palika, and Ward No. are required.'));
        return false;
      }
      return true;
    }
    if (step === 3) {
      if (!citizenshipNo.trim()) {
        setErrorMsg(t('नागरिकता प्रमाणपत्र नं. अनिवार्य छ।', 'Citizenship Certificate Number is required.'));
        return false;
      }
      return true;
    }
    if (step === 4) {
      if (!nomineeName.trim()) {
        setErrorMsg(t('कानुनी हकवाला (Nominee) को नाम प्रविष्ट गर्नुहोस्।', 'Legal nominee name is required.'));
        return false;
      }
      if (shareKitta < 10) {
        setErrorMsg(t('न्यूनतम शेयर कित्ता १० (रु. १,०००) हुनुपर्छ।', 'Minimum share allotment is 10 Kitta (NPR 1,000).'));
        return false;
      }
      return true;
    }
    return true;
  };

  const handleNext = () => {
    if (handleStepValidation(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4) as 1 | 2 | 3 | 4);
    }
  };

  const handleBack = () => {
    setErrorMsg(null);
    setCurrentStep((prev) => Math.max(prev - 1, 1) as 1 | 2 | 3 | 4);
  };

  // Extract Nepali or English part from bilingual strings like 'दाङ (Dang)'
  const extractLangPart = (val: string, wantNepali: boolean): string => {
    if (!val) return '';
    const match = val.match(/^(.*?)\s*\((.*?)\)$/);
    if (match) return wantNepali ? match[1].trim() : match[2].trim();
    return val.trim();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!handleStepValidation(4)) return;

    // Build English address
    const palikaEn = extractLangPart(palika, false);
    const districtEn = extractLangPart(district, false);
    const toleEn = extractLangPart(tole, false);
    const addressEn = `${palikaEn}-${wardNo}, ${toleEn}, ${districtEn}`;

    // Build Nepali address with Devanagari ward digits
    const palikaNe = extractLangPart(palika, true);
    const districtNe = extractLangPart(district, true);
    const toleNe = extractLangPart(tole, true);
    const addressNe = `${palikaNe}-${toNepaliDigits(wardNo)}, ${toleNe}, ${districtNe}`;

    const generatedMemberNo = 'UKO-2081-' + Math.floor(10000 + Math.random() * 90000);
    const effectiveEmail = email.trim() || `${fullNameEn.toLowerCase().replace(/[^a-z0-9]/g, '.') || 'member.' + Date.now()}@unako.org`;
    const shareCapital = shareKitta * 100;

    const newMember = addMember({
      memberNo: generatedMemberNo,
      name: fullNameEn.trim() || fullNameNe.trim(),
      nameNepali: fullNameNe.trim() || fullNameEn.trim(),
      email: effectiveEmail,
      phone: phone.trim() || '98578-00000',
      citizenshipNo: citizenshipNo.trim(),
      panNo: panNo.trim() || undefined,
      joinedDate: new Date().toISOString().split('T')[0],
      address: addressEn,
      addressNepali: addressNe,
      status: 'VERIFIED',
      avatarUrl: gender === 'FEMALE' ? '/assets/kyc/avatar_sunita.png' : '/assets/kyc/avatar_hari.png',
      shareCapital,
      totalSavings: monthlySavingsCommitment,
      activeLoanBalance: 0,
      accruedDividend: 0,
      creditScore: 750,
      bankDetails: {
        bankName,
        accountNo: bankAccountNo.trim() || '023-' + Math.floor(100000 + Math.random() * 900000),
        branch: bankBranch,
        holderName: fullNameEn.trim() || fullNameNe.trim(),
      },
      kycDocuments: {
        citizenshipFront: docCitizenshipFrontUploaded,
        citizenshipBack: docCitizenshipBackUploaded,
        photo: docPhotoUploaded,
        signature: docSignatureUploaded,
        utilityBill: true,
      },
      notes: `Statutory KYM verified member. Mother Group: ${selectedMotherGroup || 'Direct Member'}. Nominee: ${nomineeName} (${nomineeRelation}).`,

      // Extended Statutory Fields
      gender,
      maritalStatus,
      dobBs,
      dobAd,
      occupation,
      fatherName,
      motherName,
      grandfatherName,
      spouseName: maritalStatus === 'MARRIED' ? spouseName : undefined,
      province,
      district,
      palika,
      wardNo,
      tole,
      tempAddress: sameAsPermanent ? addressEn : tempAddress,
      motherGroupId: selectedMotherGroup || undefined,
      citizenshipIssueDateBs,
      citizenshipIssueDistrict,
      nationalIdNo: nationalIdNo.trim() || undefined,
      nominee: {
        name: nomineeName,
        relation: nomineeRelation,
        citizenshipNo: nomineeCitizenship.trim() || undefined,
        phone: nomineePhone.trim() || undefined,
        isMinor: nomineeIsMinor,
        guardianName: nomineeIsMinor ? nomineeGuardianName : undefined,
        guardianRelation: nomineeIsMinor ? nomineeGuardianRelation : undefined,
      },
      shareKitta,
      entranceFee,
      monthlySavingsCommitment,
    });

    onSuccess(newMember);
  };

  const steps = [
    { num: 1, labelNe: 'व्यक्तिगत तथा ३ पुस्ते', labelEn: 'Personal & Lineage', icon: User },
    { num: 2, labelNe: 'ठेगाना तथा समूह', labelEn: 'Address & Center', icon: MapPin },
    { num: 3, labelNe: 'नागरिकता तथा प्रमाण', labelEn: 'Identity & KYC Docs', icon: FileCheck },
    { num: 4, labelNe: 'हकवाला तथा सेयर खाता', labelEn: 'Nominee & Account', icon: HeartHandshake },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="member-wizard-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-md p-4 overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20">
              <ShieldCheck className="size-6 text-emerald-300" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-blue-200">
                {t('सहकारी ऐन २०७४ तथा सम्पत्ति शुद्धीकरण (AML/CFT) निर्देशिका बमोजिम', 'Statutory KYM Compliance • Nepal Cooperative Act 2074')}
              </div>
              <h2 id="member-wizard-title" className="text-lg font-black tracking-tight">
                {t('नयाँ सदस्य डिजिटल दर्ता तथा पहिचान फारम (KYM)', 'New Member Statutory KYM Onboarding Wizard')}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label={t('बन्द गर्नुहोस्', 'Close')}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Stepper Navigation Indicator */}
        <div className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 px-6 py-3 shrink-0">
          <div className="grid grid-cols-4 gap-2">
            {steps.map((s) => {
              const Icon = s.icon;
              const isPassed = currentStep > s.num;
              const isCurrent = currentStep === s.num;
              return (
                <div
                  key={s.num}
                  className={`flex items-center gap-2.5 p-2 rounded-xl border transition ${
                    isCurrent
                      ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-500/50 text-blue-700 dark:text-blue-300 shadow-xs'
                      : isPassed
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                      : 'border-transparent text-slate-400 opacity-60'
                  }`}
                >
                  <div
                    className={`size-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                      isCurrent
                        ? 'bg-blue-600 text-white shadow-xs'
                        : isPassed
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {isPassed ? <CheckCircle2 className="size-4" /> : s.num}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold truncate leading-tight">{t(s.labelNe, s.labelEn)}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      {t(`चरण ${s.num}`, `Step ${s.num}`)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/50 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Modal Form Body (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* STEP 1: Personal & Lineage */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {t('१. व्यक्तिगत पहिचान तथा ३ पुस्ते पारिवारिक विवरण', '1. Personal Demographics & 3-Generation Lineage')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('सदस्यको कानुनी नाम, जन्म मिति, पेशा र पारिवारिक तीन पुस्ते नाम', 'Enter full legal names, birth particulars, and statutory 3-generation lineage.')}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('पूरा नाम (नेपालीमा) *', 'Full Legal Name (Nepali) *')}
                  </label>
                  <input
                    type="text"
                    placeholder="जस्तै: सुनिता थारु"
                    value={fullNameNe}
                    onChange={(e) => setFullNameNe(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('पूरा नाम (English मा) *', 'Full Name (in English) *')}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sunita Tharu"
                    value={fullNameEn}
                    onChange={(e) => setFullNameEn(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('लिङ्ग (Gender) *', 'Gender *')}
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                  >
                    <option value="FEMALE">{t('महिला (Female)', 'Female')}</option>
                    <option value="MALE">{t('पुरुष (Male)', 'Male')}</option>
                    <option value="OTHER">{t('अन्य (Other)', 'Other')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('वैवाहिक स्थिति *', 'Marital Status *')}
                  </label>
                  <select
                    value={maritalStatus}
                    onChange={(e) => setMaritalStatus(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                  >
                    <option value="MARRIED">{t('विवाहित (Married)', 'Married')}</option>
                    <option value="UNMARRIED">{t('अविवाहित (Unmarried)', 'Unmarried')}</option>
                    <option value="WIDOWED">{t('एकल/विधवा/विदुर (Widowed)', 'Widowed')}</option>
                    <option value="DIVORCED">{t('पारपाचुके (Divorced)', 'Divorced')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('मुख्य पेशा *', 'Primary Occupation *')}
                  </label>
                  <select
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                  >
                    {OCCUPATION_OPTIONS.map((occ) => (
                      <option key={occ.value} value={occ.value}>
                        {t(occ.labelNe, occ.labelEn)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('जन्म मिति (वि.सं. B.S.) *', 'Date of Birth (B.S.) *')}
                  </label>
                  <input
                    type="text"
                    value={dobBs}
                    onChange={(e) => setDobBs(e.target.value)}
                    placeholder="YYYY-MM-DD (जस्तै: २०४८-०४-१५)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('मोबाइल नम्बर *', 'Mobile Number *')}
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="98XXXXXXXX"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
                  />
                </div>
              </div>

              {/* 3-Generation Lineage Card */}
              <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 space-y-3">
                <div className="text-xs font-black text-blue-900 dark:text-blue-300 flex items-center gap-2">
                  <ShieldCheck className="size-4 text-blue-600" />
                  <span>{t('कानुनी तीन पुस्ते विवरण (3-Generation Lineage)', 'Statutory 3-Generation Lineage')}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t('बाबुको पूरा नाम *', "Father's Full Name *")}
                    </label>
                    <input
                      type="text"
                      placeholder="जस्तै: रामप्रसाद थारु"
                      value={fatherName}
                      onChange={(e) => setFatherName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t('बाजेको पूरा नाम *', "Grandfather's Full Name *")}
                    </label>
                    <input
                      type="text"
                      placeholder="जस्तै: मानबहादुर थारु"
                      value={grandfatherName}
                      onChange={(e) => setGrandfatherName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t('आमाको पूरा नाम', "Mother's Full Name")}
                    </label>
                    <input
                      type="text"
                      placeholder="जस्तै: कौशिल्या थारु"
                      value={motherName}
                      onChange={(e) => setMotherName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t('पति / पत्नीको पूरा नाम (विवाहित भएमा)', 'Spouse Name (If Married)')}
                    </label>
                    <input
                      type="text"
                      placeholder="जस्तै: जीवन चौधरी"
                      value={spouseName}
                      onChange={(e) => setSpouseName(e.target.value)}
                      disabled={maritalStatus === 'UNMARRIED'}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Address & Group */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {t('२. नेपालको ५-तह स्थायी ठेगाना तथा आमा समूह आवद्धता', '2. 5-Tier Nepalese Address & Self-Help Group Affiliation')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('प्रदेश, जिल्ला, स्थानीय तह, वडा र टोल विवरण तथा कार्यक्षेत्र समूह चयन', 'Permanent residence tiering and mother group assignment.')}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('प्रदेश *', 'Province *')}
                  </label>
                  <select
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                  >
                    {NEPAL_PROVINCES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('जिल्ला *', 'District *')}
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="दाङ (Dang)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('नगरपालिका / गाउँपालिका *', 'Municipality / Rural Municipality *')}
                  </label>
                  <input
                    type="text"
                    value={palika}
                    onChange={(e) => setPalika(e.target.value)}
                    placeholder="गढवा गाउँपालिका (Gadhwa)"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('वडा नं. *', 'Ward Number *')}
                  </label>
                  <input
                    type="text"
                    value={wardNo}
                    onChange={(e) => setWardNo(e.target.value)}
                    placeholder="५"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('टोल / बस्ती *', 'Tole / Village *')}
                  </label>
                  <input
                    type="text"
                    value={tole}
                    onChange={(e) => setTole(e.target.value)}
                    placeholder="चेपे (Chepe)"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                  />
                </div>
              </div>

              {/* Temporary Address Toggle */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sameAsPermanent}
                    onChange={(e) => setSameAsPermanent(e.target.checked)}
                    className="size-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {t('हालको बसोबास स्थायी ठेगानामै हो (Current address same as permanent)', 'Current residence is same as permanent address')}
                  </span>
                </label>
                {!sameAsPermanent && (
                  <div className="pt-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t('हालको अस्थायी ठेगाना', 'Temporary / Residential Address')}
                    </label>
                    <input
                      type="text"
                      placeholder="जस्तै: काठमाडौं-३२, कोटेश्वर"
                      value={tempAddress}
                      onChange={(e) => setTempAddress(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    />
                  </div>
                )}
              </div>

              {/* Mother Group Assignment */}
              <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/40 space-y-2">
                <div className="text-xs font-black text-indigo-900 dark:text-indigo-300 flex items-center gap-2">
                  <Building className="size-4 text-indigo-600" />
                  <span>{t('आमा समूह / केन्द्र आवद्धता (Mother Group Center)', 'Mother Group / Center Affiliation')}</span>
                </div>
                <select
                  value={selectedMotherGroup}
                  onChange={(e) => setSelectedMotherGroup(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-800 text-xs font-bold"
                >
                  <option value="">{t('-- सिधा सहकारी सदस्य (कुनै समूहमा नभएको) --', '-- Direct Member (Not affiliated with group) --')}</option>
                  {motherGroups.map((mg) => (
                    <option key={mg.id} value={mg.id}>
                      {mg.name} ({mg.location}) • {mg.meetingDay}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-indigo-600 dark:text-indigo-400">
                  {t('महिला समूहमा आवद्ध हुँदा नियमित मासिक बैठक तथा समूह जमानी कर्जा सुविधा प्राप्त हुन्छ।', 'Affiliating with a Mother Group enables regular monthly center deposits and peer group lending.')}
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: Identity & Documents */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {t('३. नागरिकता, राष्ट्रिय परिचयपत्र तथा डिजिटल कागजात', '3. Citizenship, National ID & Document Uploads')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('नागरिकता जारी विवरण र स्पष्ट डिजिटल प्रतिलिपि अपलोड', 'Statutory citizenship registry particulars and document attachments.')}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('नागरिकता प्रमाणपत्र नं. *', 'Citizenship Certificate No. *')}
                  </label>
                  <input
                    type="text"
                    value={citizenshipNo}
                    onChange={(e) => setCitizenshipNo(e.target.value)}
                    placeholder="५२-०१-७५-०३२१४"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('जारी मिति (वि.सं.) *', 'Issue Date (B.S.) *')}
                  </label>
                  <input
                    type="text"
                    value={citizenshipIssueDateBs}
                    onChange={(e) => setCitizenshipIssueDateBs(e.target.value)}
                    placeholder="२०६६-०२-११"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('जारी जिल्ला *', 'Issuing District *')}
                  </label>
                  <input
                    type="text"
                    value={citizenshipIssueDistrict}
                    onChange={(e) => setCitizenshipIssueDistrict(e.target.value)}
                    placeholder="दाङ (Dang)"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('राष्ट्रिय परिचयपत्र नं. (ऐच्छिक)', 'National ID Number (Optional)')}
                  </label>
                  <input
                    type="text"
                    value={nationalIdNo}
                    onChange={(e) => setNationalIdNo(e.target.value)}
                    placeholder="९८०-XXXX-XXXX"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('स्थायी लेखा नम्बर (PAN नं. - ऐच्छिक)', 'Permanent Account Number (PAN)')}
                  </label>
                  <input
                    type="text"
                    value={panNo}
                    onChange={(e) => setPanNo(e.target.value)}
                    placeholder="६००XXXXXX"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Upload Dropzones */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {/* Photo */}
                <div className="p-3 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-center hover:border-blue-500 transition cursor-pointer">
                  <Camera className="size-6 text-blue-500 mx-auto mb-1" />
                  <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                    {t('पासपोर्ट फोटो', 'Member Photo')}
                  </div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                    {docPhotoUploaded ? '✓ ' + t('संलग्न भयो', 'Attached') : t('अपलोड', 'Upload')}
                  </div>
                </div>

                {/* Citizenship Front */}
                <div className="p-3 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-center hover:border-blue-500 transition cursor-pointer">
                  <FileText className="size-6 text-indigo-500 mx-auto mb-1" />
                  <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                    {t('नागरिकता अगाडि', 'Citizenship Front')}
                  </div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                    {docCitizenshipFrontUploaded ? '✓ ' + t('संलग्न भयो', 'Attached') : t('अपलोड', 'Upload')}
                  </div>
                </div>

                {/* Citizenship Back */}
                <div className="p-3 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-center hover:border-blue-500 transition cursor-pointer">
                  <FileText className="size-6 text-indigo-500 mx-auto mb-1" />
                  <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                    {t('नागरिकता पछाडि', 'Citizenship Back')}
                  </div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                    {docCitizenshipBackUploaded ? '✓ ' + t('संलग्न भयो', 'Attached') : t('अपलोड', 'Upload')}
                  </div>
                </div>

                {/* Signature */}
                <div className="p-3 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-center hover:border-blue-500 transition cursor-pointer">
                  <Upload className="size-6 text-emerald-500 mx-auto mb-1" />
                  <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                    {t('हस्ताक्षर नमुना', 'Signature Sample')}
                  </div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                    {docSignatureUploaded ? '✓ ' + t('संलग्न भयो', 'Attached') : t('अपलोड', 'Upload')}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Nominee & Shares / Accounts */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-fade-in">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {t('४. कानुनी हकवाला (इच्छाइएको व्यक्ति) तथा प्रारम्भिक सेयर खाता', '4. Statutory Nominee (Haqwala) & Initial Share Account')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('सहकारी विधान अनुसार हकवालाको विवरण र प्रारम्भिक शेयर पुँजी जम्मा', 'Nominee designation, share capital subscription, and banking payout route.')}
                </p>
              </div>

              {/* Nominee Details Card */}
              <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-3">
                <div className="text-xs font-black text-amber-900 dark:text-amber-300 flex items-center gap-2">
                  <HeartHandshake className="size-4 text-amber-600" />
                  <span>{t('इच्छाइएको कानुनी हकवाला (Nominee Information)', 'Designated Legal Nominee')}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t('हकवालाको पूरा नाम *', 'Nominee Full Name *')}
                    </label>
                    <input
                      type="text"
                      placeholder="जस्तै: सुरेश चौधरी"
                      value={nomineeName}
                      onChange={(e) => setNomineeName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t('नाता (Relationship) *', 'Relationship *')}
                    </label>
                    <select
                      value={nomineeRelation}
                      onChange={(e) => setNomineeRelation(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
                    >
                      <option value="छोरा (Son)">छोरा (Son)</option>
                      <option value="छोरी (Daughter)">छोरी (Daughter)</option>
                      <option value="पति/पत्नी (Spouse)">पति/पत्नी (Spouse)</option>
                      <option value="आमा (Mother)">आमा (Mother)</option>
                      <option value="बाबु (Father)">बाबु (Father)</option>
                      <option value="भाइ/बहिनी (Sibling)">भाइ/बहिनी (Sibling)</option>
                      <option value="अन्य (Other)">अन्य (Other)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t('हकवालाको नागरिकता नं.', 'Nominee Citizenship No.')}
                    </label>
                    <input
                      type="text"
                      placeholder="५२-०१-८०-XXXXX"
                      value={nomineeCitizenship}
                      onChange={(e) => setNomineeCitizenship(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {t('हकवालाको सम्पर्क फोन', 'Nominee Contact Phone')}
                    </label>
                    <input
                      type="text"
                      placeholder="९८XXXXXXXX"
                      value={nomineePhone}
                      onChange={(e) => setNomineePhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={nomineeIsMinor}
                      onChange={(e) => setNomineeIsMinor(e.target.checked)}
                      className="size-3.5 rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      {t('हकवाला १८ वर्ष मुनिको नाबालक छ (Nominee is a minor under 18 years)', 'Nominee is a minor under 18')}
                    </span>
                  </label>
                  {nomineeIsMinor && (
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <input
                        type="text"
                        placeholder={t('संरक्षकको नाम (Guardian Name)', 'Guardian Name')}
                        value={nomineeGuardianName}
                        onChange={(e) => setNomineeGuardianName(e.target.value)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                      />
                      <input
                        type="text"
                        placeholder={t('संरक्षकको नाता (Guardian Relation)', 'Guardian Relation')}
                        value={nomineeGuardianRelation}
                        onChange={(e) => setNomineeGuardianRelation(e.target.value)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Share Allotment & Financial Setup */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('प्रारम्भिक शेयर कित्ता (दर रु. १००) *', 'Initial Share Kitta (@ NPR 100) *')}
                  </label>
                  <input
                    type="number"
                    min={10}
                    step={10}
                    value={shareKitta}
                    onChange={(e) => setShareKitta(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
                  />
                  <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                    = रु. {fmtCurrency(shareKitta * 100, true)}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('प्रवेश शुल्क (Entrance Fee)', 'Entrance Fee (NPR)')}
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={100}
                    value={entranceFee}
                    onChange={(e) => setEntranceFee(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
                  />
                  <div className="text-[10px] text-slate-400 mt-1">
                    {t('सहकारी सदस्यता प्रवेश शुल्क', 'One-time admission charge')}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('मासिक अनिवार्य बचत (प्रति महिना)', 'Mandatory Monthly Savings')}
                  </label>
                  <input
                    type="number"
                    min={200}
                    step={100}
                    value={monthlySavingsCommitment}
                    onChange={(e) => setMonthlySavingsCommitment(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
                  />
                  <div className="text-[10px] text-slate-400 mt-1">
                    {t('नियमित मासिक बचत खाता', 'Regular monthly recurring fund')}
                  </div>
                </div>
              </div>

              {/* Bank Payout Account */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <CreditCard className="size-4 text-blue-500" />
                  <span>{t('लाभांश भुक्तानी बैंक खाता (Dividend Payout Bank Account)', 'Dividend Payout Bank Account')}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder={t('बैंकको नाम', 'Bank Name')}
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                  <input
                    type="text"
                    placeholder={t('खाता नम्बर', 'Account Number')}
                    value={bankAccountNo}
                    onChange={(e) => setBankAccountNo(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
                  />
                  <input
                    type="text"
                    placeholder={t('शाखा कार्यालय', 'Branch Name')}
                    value={bankBranch}
                    onChange={(e) => setBankBranch(e.target.value)}
                    className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div>
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <ChevronLeft className="size-4" />
                <span>{t('अघिल्लो चरण', 'Previous')}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                {t('रद्द गर्नुहोस्', 'Cancel')}
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-medium">
              {t(`चरण ${currentStep} / ४`, `Step ${currentStep} of 4`)}
            </span>

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition"
              >
                <span>{t('पछिल्लो चरण', 'Next Step')}</span>
                <ChevronRight className="size-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-lg transition"
              >
                <CheckCircle2 className="size-4" />
                <span>{t('सदस्यता प्रमाणित तथा दर्ता गर्नुहोस्', 'Complete & Register Member')}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
