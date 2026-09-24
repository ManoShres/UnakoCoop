import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useLanguageStore } from '../../store/useLanguageStore';
import { DigitalSmartIdModal } from './components/DigitalSmartIdModal';
import { KycDocInspectionModal, type KycDocInfo } from './components/KycDocInspectionModal';
import { KycUpdateModal } from './components/KycUpdateModal';
import { ProfileIdentityBanner } from './components/ProfileIdentityBanner';
import { ProfileMetricStats } from './components/ProfileMetricStats';
import { ProfileVaultSection } from './components/ProfileVaultSection';
import { ProfileNomineeSection } from './components/ProfileNomineeSection';

export function ProfileSettingsPage() {
  const { t } = useLanguageStore();
  const [showIdModal, setShowIdModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [activeDocKey, setActiveDocKey] = useState<'citizenship' | 'lalpurja' | 'ward' | 'biometric'>('citizenship');
  const [toast, setToast] = useState<string | null>(null);

  const KYC_DOCUMENTS: Record<'citizenship' | 'lalpurja' | 'ward' | 'biometric', KycDocInfo> = {
    citizenship: {
      key: 'citizenship',
      title: t('नागरिकता प्रमाणपत्र', 'Citizenship Certificate'),
      id: 'UKO-DOC-CIT-04291',
      image: '/assets/kyc/doc_citizenship.svg',
      type: t('नागरिकता कार्ड', 'Citizenship Card'),
      authority: t('जिल्ला प्रशासन कार्यालय, दाङ', 'District Administration Office, Dang'),
      date: t('२०६०/०३/२२', '2003-07-06'),
      status: t('प्रमाणित', 'CBS Verified'),
      desc: t(
        'ना.प्र.नं: ५२-०१-७२-०४२९१ (वंशज) • गढवा गाउँपालिका वडा नं. ५, दाङ • जारी अधिकृत: प्र.अ. दाङ',
        'Citizenship No: 52-01-72-04291 (Descent) • Gadhwa Rural Municipality-5, Dang • Issuing Authority: DAO Dang'
      ),
    },
    lalpurja: {
      key: 'lalpurja',
      title: t('जग्गाधनी प्रमाणपुर्जा', 'Land Ownership Certificate'),
      id: 'UKO-DOC-LND-41218',
      image: '/assets/kyc/doc_lalpurja.svg',
      type: t('लालपुर्जा प्रमाणपुर्जा', 'Land Ownership Certificate'),
      authority: t('भूमि सुधार तथा मालपोत कार्यालय, लमही, दाङ', 'Land Revenue Office, Lamahi, Dang'),
      date: t('२०७५/०८/१२', '2018-11-28'),
      status: t('धितो दृष्टिबन्धक', 'Mortgage Hypothecated'),
      desc: t(
        'दर्ता सि.नं: ०२-४१२१८ • कित्ता नं: ४१२ • क्षेत्रफल: ०-४-०-० (४ कठ्ठा) • मालपोत मूल्याङ्कन: रु. २८,५०,०००/-',
        'Registration No: 02-41218 • Plot No: 412 • Area: 0-4-0-0 (4 Kattha) • Valuation: NPR 2,850,000'
      ),
    },
    ward: {
      key: 'ward',
      title: t('वडा सिफारिस तथा विद्युत् महसुल', 'Ward Recommendation & Utility Slip'),
      id: 'UKO-DOC-WRD-0599',
      image: '/assets/kyc/doc_ward_utility.svg',
      type: t('वडा बसोबास सिफारिस', 'Ward Residence Certificate'),
      authority: t('गढवा गाउँपालिका ५ नं. वडा कार्यालय / नेपाल विद्युत प्राधिकरण', 'Gadhwa-5 Ward Office / NEA'),
      date: t('२०८१/०१/१५', '2024-04-27'),
      status: t('सत्यापित', 'Residence Authenticated'),
      desc: t(
        'चलानी नं: ५९९ (स्थायी बसोबास सिफारिस) • NEA लमही ग्राहक नं: ०२३-११-४०८ (विद्युत् महसुल चुक्ता)',
        'Dispatch No: 599 (Residence Verification) • NEA Lamahi Customer No: 023-11-408'
      ),
    },
    biometric: {
      key: 'biometric',
      title: t('बायोमेट्रिक तथा हस्ताक्षर', 'Biometrics & Specimen Signature'),
      id: 'UKO-DOC-BIO-9081',
      image: '/assets/kyc/doc_biometric.svg',
      type: t('बायोमेट्रिक कार्ड', 'Biometric Card'),
      authority: t('उनको बचत तथा ऋण सहकारी संस्था लि. केन्द्रीय कार्यालय', 'Unako SACCOS Head Office'),
      date: t('२०८०/०९/२२', '2024-01-07'),
      status: t('सक्रिय प्रमाणीकरण', 'Active Minutiae Match'),
      desc: t(
        'दुवै औंठाछाप र कानूनी हस्ताक्षर नमूना • सुरक्षित डिजिटल सिल',
        'Dual Thumbprints (64 Minutiae Points) & Legal Signature Specimen • SHA-256 Cryptographic Seal'
      ),
    },
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleDownloadDossier = () => {
    showToast(t('केवाईसी डसियर डाउनलोड सुरु भयो!', 'KYC Dossier download started!'));
  };

  const handleHomeVisitRequest = () => {
    showToast(t('सहकारी सहजकर्ता घरमै आउने अनुरोध दर्ता भयो!', 'Home visit request registered!'));
  };

  const handleViewDoc = (key: 'citizenship' | 'lalpurja' | 'ward' | 'biometric') => {
    setActiveDocKey(key);
    setShowDocModal(true);
  };

  return (
    <div className="w-full max-w-[1280px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-center gap-3 animate-modal-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}

      {/* 1. TOP IDENTITY & VERIFICATION BANNER */}
      <ProfileIdentityBanner
        onOpenSmartId={() => setShowIdModal(true)}
        onDownloadDossier={handleDownloadDossier}
        onOpenUpdateModal={() => setShowUpdateModal(true)}
      />

      {/* 2. KEY METRIC STATS STRIP */}
      <ProfileMetricStats />

      {/* 3. MAIN BENTO GRID (8 COLS LEFT, 4 COLS RIGHT) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: KYC Document Vault & Audit History */}
        <div className="lg:col-span-8">
          <ProfileVaultSection onViewDoc={handleViewDoc} />
        </div>

        {/* Right Column: Nominee, Officer Desk & Charter */}
        <div className="lg:col-span-4">
          <ProfileNomineeSection
            onOpenUpdateModal={() => setShowUpdateModal(true)}
            onRequestHomeVisit={handleHomeVisitRequest}
          />
        </div>
      </div>

      {/* 4. MODALS */}
      <DigitalSmartIdModal
        isOpen={showIdModal}
        onClose={() => setShowIdModal(false)}
      />

      <KycDocInspectionModal
        isOpen={showDocModal}
        onClose={() => setShowDocModal(false)}
        activeDocKey={activeDocKey}
        onSelectDocKey={setActiveDocKey}
        documents={KYC_DOCUMENTS}
        onShowToast={showToast}
      />

      <KycUpdateModal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        onSubmit={() => {
          setShowUpdateModal(false);
          showToast(t('केवाईसी अद्यावधिक अनुरोध शाखा प्रमाणीकरणका लागि पेश भयो!', 'KYC update request submitted for verification!'));
        }}
      />
    </div>
  );
}
