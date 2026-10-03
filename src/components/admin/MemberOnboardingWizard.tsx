import React, { useState } from 'react';
import { useCoopStore } from '../../store/useCoopStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { Member } from '../../types';
import { toNepaliDigits } from '../../utils/nepaliDate';
import {
  User,
  MapPin,
  HeartHandshake,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  X,
  ShieldCheck,
  FileCheck,
  AlertCircle,
} from 'lucide-react';
import { GenderType, MaritalStatusType } from './onboarding/OnboardingTypes';
import { OnboardingStep1Personal } from './onboarding/OnboardingStep1Personal';
import { OnboardingStep2Address } from './onboarding/OnboardingStep2Address';
import { OnboardingStep3Identity } from './onboarding/OnboardingStep3Identity';
import { OnboardingStep4NomineeShares } from './onboarding/OnboardingStep4NomineeShares';

interface MemberOnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newMember: Member) => void;
}

export const MemberOnboardingWizard: React.FC<MemberOnboardingWizardProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { addMember, motherGroups } = useCoopStore();
  const { t } = useLanguageStore();

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
  const [gender, setGender] = useState<GenderType>('FEMALE');
  const [maritalStatus, setMaritalStatus] = useState<MaritalStatusType>('MARRIED');
  const [dobBs, setDobBs] = useState('२०४८-०४-१५');
  const [dobAd] = useState('1991-07-30');
  const [phone, setPhone] = useState('98578-');
  const [email] = useState('');
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
        setErrorMsg(t('कानुनी हकवाला को नाम प्रविष्ट गर्नुहोस्।', 'Legal nominee name is required.'));
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
          {currentStep === 1 && (
            <OnboardingStep1Personal
              fullNameNe={fullNameNe}
              setFullNameNe={setFullNameNe}
              fullNameEn={fullNameEn}
              setFullNameEn={setFullNameEn}
              gender={gender}
              setGender={setGender}
              maritalStatus={maritalStatus}
              setMaritalStatus={setMaritalStatus}
              occupation={occupation}
              setOccupation={setOccupation}
              dobBs={dobBs}
              setDobBs={setDobBs}
              phone={phone}
              setPhone={setPhone}
              fatherName={fatherName}
              setFatherName={setFatherName}
              grandfatherName={grandfatherName}
              setGrandfatherName={setGrandfatherName}
              motherName={motherName}
              setMotherName={setMotherName}
              spouseName={spouseName}
              setSpouseName={setSpouseName}
            />
          )}

          {currentStep === 2 && (
            <OnboardingStep2Address
              province={province}
              setProvince={setProvince}
              district={district}
              setDistrict={setDistrict}
              palika={palika}
              setPalika={setPalika}
              wardNo={wardNo}
              setWardNo={setWardNo}
              tole={tole}
              setTole={setTole}
              sameAsPermanent={sameAsPermanent}
              setSameAsPermanent={setSameAsPermanent}
              tempAddress={tempAddress}
              setTempAddress={setTempAddress}
              selectedMotherGroup={selectedMotherGroup}
              setSelectedMotherGroup={setSelectedMotherGroup}
              motherGroups={motherGroups}
            />
          )}

          {currentStep === 3 && (
            <OnboardingStep3Identity
              citizenshipNo={citizenshipNo}
              setCitizenshipNo={setCitizenshipNo}
              citizenshipIssueDateBs={citizenshipIssueDateBs}
              setCitizenshipIssueDateBs={setCitizenshipIssueDateBs}
              citizenshipIssueDistrict={citizenshipIssueDistrict}
              setCitizenshipIssueDistrict={setCitizenshipIssueDistrict}
              nationalIdNo={nationalIdNo}
              setNationalIdNo={setNationalIdNo}
              panNo={panNo}
              setPanNo={setPanNo}
              docPhotoUploaded={docPhotoUploaded}
              setDocPhotoUploaded={setDocPhotoUploaded}
              docCitizenshipFrontUploaded={docCitizenshipFrontUploaded}
              setDocCitizenshipFrontUploaded={setDocCitizenshipFrontUploaded}
              docCitizenshipBackUploaded={docCitizenshipBackUploaded}
              setDocCitizenshipBackUploaded={setDocCitizenshipBackUploaded}
              docSignatureUploaded={docSignatureUploaded}
              setDocSignatureUploaded={setDocSignatureUploaded}
            />
          )}

          {currentStep === 4 && (
            <OnboardingStep4NomineeShares
              nomineeName={nomineeName}
              setNomineeName={setNomineeName}
              nomineeRelation={nomineeRelation}
              setNomineeRelation={setNomineeRelation}
              nomineeCitizenship={nomineeCitizenship}
              setNomineeCitizenship={setNomineeCitizenship}
              nomineePhone={nomineePhone}
              setNomineePhone={setNomineePhone}
              nomineeIsMinor={nomineeIsMinor}
              setNomineeIsMinor={setNomineeIsMinor}
              nomineeGuardianName={nomineeGuardianName}
              setNomineeGuardianName={setNomineeGuardianName}
              nomineeGuardianRelation={nomineeGuardianRelation}
              setNomineeGuardianRelation={setNomineeGuardianRelation}
              shareKitta={shareKitta}
              setShareKitta={setShareKitta}
              entranceFee={entranceFee}
              setEntranceFee={setEntranceFee}
              monthlySavingsCommitment={monthlySavingsCommitment}
              setMonthlySavingsCommitment={setMonthlySavingsCommitment}
              bankName={bankName}
              setBankName={setBankName}
              bankAccountNo={bankAccountNo}
              setBankAccountNo={setBankAccountNo}
              bankBranch={bankBranch}
              setBankBranch={setBankBranch}
            />
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div>
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <ChevronLeft className="size-4" />
                <span>{t('अघिल्लो चरण', 'Previous')}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
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
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition cursor-pointer"
              >
                <span>{t('पछिल्लो चरण', 'Next Step')}</span>
                <ChevronRight className="size-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-lg transition cursor-pointer"
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
