import React, { useState } from 'react';
import {
  EkycProfile,
  NidVerificationStatus,
  PepStatus,
  RiskClassification,
  DEFAULT_EKYC_PROFILES,
  calculateEkycMetrics,
  verifyWithDoNidcr,
  captureBiometricScan,
  screenPepAndSanctions,
  generateDoNidcrCertificate,
  exportEkycProfilesToCSV,
  PEP_LABELS,
  RISK_CONFIG,
  NID_STATUS_CONFIG,
} from '../../utils/ekycNationalIdEngine';
import { useLanguageStore } from '../../store/useLanguageStore';
import {
  Fingerprint,
  X,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Search,
  BookOpen,
  Printer,
  Copy,
  Check,
  ShieldCheck,
  UserCheck,
  RefreshCw,
  ScanFace,
  CreditCard,
  Building,
  User,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface EkycNationalIdVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EkycNationalIdVerificationModal: React.FC<EkycNationalIdVerificationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useLanguageStore();

  const [profiles, setProfiles] = useState<EkycProfile[]>(DEFAULT_EKYC_PROFILES);
  const [selectedProfileId, setSelectedProfileId] = useState<string>(DEFAULT_EKYC_PROFILES[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'queue' | 'studio' | 'certificate' | 'guidelines'>('queue');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [pepFilter, setPepFilter] = useState<string>('ALL');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');

  // Scanning animation states
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [isBioScanning, setIsBioScanning] = useState(false);
  const [officerName, setOfficerName] = useState('सुमन केसी (केवाइसी अधिकृत)');

  // Copy state
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const metrics = calculateEkycMetrics(profiles);
  const selectedProfile = profiles.find((p) => p.id === selectedProfileId) || profiles[0];

  const filteredProfiles = profiles.filter((p) => {
    const matchesSearch =
      p.memberNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.fullNameNepali.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nationalIdNumber.includes(searchQuery) ||
      p.citizenshipNumber.includes(searchQuery);
    const matchesStatus = statusFilter === 'ALL' || p.nidStatus === statusFilter;
    const matchesPep = pepFilter === 'ALL' || p.pepStatus === pepFilter;
    const matchesRisk = riskFilter === 'ALL' || p.riskLevel === riskFilter;
    return matchesSearch && matchesStatus && matchesPep && matchesRisk;
  });

  const handleExportCSV = () => {
    const csv = exportEkycProfilesToCSV(profiles);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Unako_eKYC_DoNIDCR_Registry_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleVerifyDoNidcr = () => {
    if (!selectedProfile) return;
    setIsApiLoading(true);

    setTimeout(() => {
      const updated = verifyWithDoNidcr(selectedProfile, officerName);
      setProfiles((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setIsApiLoading(false);
    }, 600);
  };

  const handleScanBiometrics = () => {
    if (!selectedProfile) return;
    setIsBioScanning(true);

    setTimeout(() => {
      // Simulate real biometric match
      const updated = captureBiometricScan(selectedProfile, 94, 97);
      setProfiles((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      setIsBioScanning(false);
    }, 800);
  };

  const handlePepChange = (pep: PepStatus) => {
    if (!selectedProfile) return;
    const updated = screenPepAndSanctions(selectedProfile, pep);
    setProfiles((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const certText = selectedProfile ? generateDoNidcrCertificate(selectedProfile) : '';

  const handleCopyCert = () => {
    navigator.clipboard.writeText(certText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Ribbon */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-2xl">
              <Fingerprint className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  {t(
                    'राष्ट्रिय परिचयपत्र तथा विद्युतीय ग्राहक पहिचान प्रणाली',
                    'DoNIDCR National ID & Electronic KYC Regulatory Console'
                  )}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                  DoNIDCR API / AML 2079
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {t(
                  'गृह मन्त्रालय १०-अंकको NID प्रमाणीकरण, बायोमेट्रिक औंठाछाप, र FIU-Nepal कालोसूची स्क्रिनिङ',
                  'Live DoNIDCR 10-digit NID verification, biometric liveness validation, and FIU/PEP regulatory screening'
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              <FileSpreadsheet className="size-4 text-emerald-600" />
              <span>{t('CSV निर्यात', 'Export CSV')}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Regulatory Metrics Ribbon */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 p-4 bg-slate-100/50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 text-xs">
          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <span className="text-[10px] text-slate-400 font-semibold block">{t('कुल e-KYC प्रोफाइल', 'Total Profiles')}</span>
            <span className="text-base font-black text-slate-900 dark:text-white">{metrics.totalProfiles}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">{t('सदस्य अभिलेख', 'Member Records')}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <span className="text-[10px] text-emerald-500 font-semibold block">{t('DoNIDCR प्रमाणित दर', 'Verified Rate')}</span>
            <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
              {metrics.verificationRatePercent}%
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">{metrics.verifiedCount} {t('जना प्रमाणित', 'Verified')}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <span className="text-[10px] text-blue-500 font-semibold block">{t('बायोमेट्रिक मिलान सफल', 'Biometric Passed')}</span>
            <span className="text-base font-black text-blue-600 dark:text-blue-400">
              {metrics.biometricPassedCount}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">{t('९०%+ औंठाछाप दर', 'Liveness Confirmed')}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <span className="text-[10px] text-amber-500 font-semibold block">{t('राजनीतिक विशिष्ट (PEP)', 'PEP Identified')}</span>
            <span className="text-base font-black text-amber-600 dark:text-amber-400">
              {metrics.pepIdentifiedCount}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">{t('EDD थप जाँच', 'Enhanced Due Diligence')}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <span className="text-[10px] text-rose-500 font-semibold block">{t('उच्च जोखिम AML', 'High AML Risk')}</span>
            <span className="text-base font-black text-rose-600 dark:text-rose-400">
              {metrics.highRiskCount}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">{t('वार्षिक Re-KYC', 'Annual Re-KYC')}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <span className="text-[10px] text-purple-500 font-semibold block">{t('पुनः केवाइसी बाँकी', 'Re-KYC Pending')}</span>
            <span className="text-base font-black text-purple-600 dark:text-purple-400">
              {metrics.reKycOverdueCount}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">{t('म्याद नाघेको', 'Overdue')}</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <button
            onClick={() => setActiveTab('queue')}
            className={`flex items-center gap-2 py-3 px-3 border-b-2 text-xs font-bold transition-colors ${
              activeTab === 'queue'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <UserCheck className="size-4" />
            <span>{t('सदस्य e-KYC कार्यसूची', 'Verification Queue')} ({profiles.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('studio')}
            className={`flex items-center gap-2 py-3 px-3 border-b-2 text-xs font-bold transition-colors ${
              activeTab === 'studio'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Fingerprint className="size-4" />
            <span>{t('DoNIDCR तथा बायोमेट्रिक स्टुडियो', 'DoNIDCR & Biometric Studio')}</span>
          </button>

          <button
            onClick={() => setActiveTab('certificate')}
            className={`flex items-center gap-2 py-3 px-3 border-b-2 text-xs font-bold transition-colors ${
              activeTab === 'certificate'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Printer className="size-4" />
            <span>{t('e-KYC प्रमाण पत्र', 'e-KYC Certificate')}</span>
          </button>

          <button
            onClick={() => setActiveTab('guidelines')}
            className={`flex items-center gap-2 py-3 px-3 border-b-2 text-xs font-bold transition-colors ${
              activeTab === 'guidelines'
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <BookOpen className="size-4" />
            <span>{t('कानुनी व्यवस्था तथा मापदण्ड', 'Statutory Guidelines')}</span>
          </button>
        </div>

        {/* Tab 1: Queue */}
        {activeTab === 'queue' && (
          <div className="p-6 overflow-y-auto space-y-4">
            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('सदस्य नं, नाम, NID वा नागरिकता खोज्नुहोस्...', 'Search member no, name, NID or citizenship...')}
                  className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="ALL">{t('सबै NID अवस्था', 'All NID Statuses')}</option>
                {Object.entries(NID_STATUS_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>{v.np}</option>
                ))}
              </select>

              <select
                value={pepFilter}
                onChange={(e) => setPepFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="ALL">{t('सबै PEP वर्ग', 'All PEP')}</option>
                {Object.entries(PEP_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v.np}</option>
                ))}
              </select>

              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="ALL">{t('सबै जोखिम वर्ग', 'All Risk')}</option>
                {Object.entries(RISK_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>{v.np}</option>
                ))}
              </select>
            </div>

            {/* Table */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold">
                  <tr>
                    <th className="py-3 px-4">{t('सदस्य नं तथा नाम', 'Member & Name')}</th>
                    <th className="py-3 px-3">{t('राष्ट्रिय परिचयपत्र (NID)', 'DoNIDCR NID')}</th>
                    <th className="py-3 px-3">{t('नागरिकता तथा जिल्ला', 'Citizenship & District')}</th>
                    <th className="py-3 px-3 text-center">{t('NID प्रमाणीकरण', 'NID Status')}</th>
                    <th className="py-3 px-3 text-center">{t('PEP स्थिति', 'PEP Status')}</th>
                    <th className="py-3 px-3 text-center">{t('AML जोखिम', 'Risk Level')}</th>
                    <th className="py-3 px-3 text-center">{t('औंठाछाप %', 'Biometric')}</th>
                    <th className="py-3 px-4 text-right">{t('कार्यवाही', 'Action')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredProfiles.map((p) => (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${
                        selectedProfileId === p.id ? 'bg-blue-50/50 dark:bg-blue-900/20' : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 dark:text-white block">{p.fullNameNepali}</span>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <span className="font-mono">{p.memberNo}</span>
                          <span>•</span>
                          <span>{p.fullName}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3 font-mono font-semibold text-blue-600 dark:text-blue-400">
                        {p.nationalIdNumber}
                      </td>

                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                        <span className="font-mono block">{p.citizenshipNumber}</span>
                        <span className="text-[10px] text-slate-400">{p.issuingDistrict}</span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${NID_STATUS_CONFIG[p.nidStatus].badge}`}>
                          {NID_STATUS_CONFIG[p.nidStatus].np}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${PEP_LABELS[p.pepStatus].badgeColor}`}>
                          {p.pepStatus === 'NON_PEP' ? 'गैर-विशिष्ट' : 'PEP विशिष्ट'}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${RISK_CONFIG[p.riskLevel].colorClass}`}>
                          {RISK_CONFIG[p.riskLevel].np.split(' ')[0]}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center font-bold text-slate-800 dark:text-slate-200">
                        {p.biometric.fingerprintMatchScore > 0 ? (
                          <span className="text-emerald-600">{p.biometric.fingerprintMatchScore}%</span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedProfileId(p.id);
                            setActiveTab('studio');
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 rounded-xl transition-colors"
                        >
                          <span>{t('प्रमाणीकरण कन्सोल', 'Verify Studio')}</span>
                          <ArrowRight className="size-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Studio */}
        {activeTab === 'studio' && selectedProfile && (
          <div className="p-6 overflow-y-auto space-y-6">
            {/* Top Member Card */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-600 text-white font-bold text-xs">
                    {selectedProfile.memberNo}
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      {selectedProfile.fullNameNepali} ({selectedProfile.fullName})
                    </h3>
                    <span className="text-xs text-slate-400">
                      जन्म मिति: {selectedProfile.dobBs} | लिङ्ग: {selectedProfile.gender} | पेशा: {selectedProfile.occupation}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${NID_STATUS_CONFIG[selectedProfile.nidStatus].badge}`}>
                    {NID_STATUS_CONFIG[selectedProfile.nidStatus].np}
                  </span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${RISK_CONFIG[selectedProfile.riskLevel].colorClass}`}>
                    {RISK_CONFIG[selectedProfile.riskLevel].np}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">{t('राष्ट्रिय परिचयपत्र नं (NID)', 'DoNIDCR NID')}</span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-sm mt-0.5 block">
                    {selectedProfile.nationalIdNumber}
                  </span>
                  <span className="text-slate-400 text-[10px]">१०-अङ्क राष्ट्रिय दर्ता</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px]">{t('नागरिकता तथा जिल्ला', 'Citizenship & District')}</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white mt-0.5 block">
                    {selectedProfile.citizenshipNumber}
                  </span>
                  <span className="text-slate-400 text-[10px]">{selectedProfile.issuingDistrict}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px]">{t('स्थायी ठेगाना', 'Permanent Address')}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block">
                    {selectedProfile.permanentAddress.municipality}-{selectedProfile.permanentAddress.ward}, {selectedProfile.permanentAddress.district}
                  </span>
                  <span className="text-slate-400 text-[10px]">{selectedProfile.permanentAddress.province}</span>
                </div>
              </div>
            </div>

            {/* Interactive 3-Panel Verification Workbench */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Panel 1: DoNIDCR Live API Simulation */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
                  <div className="flex items-center gap-2">
                    <CreditCard className="size-4 text-blue-600" />
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {t('१. DoNIDCR केन्द्रीय सर्भर रुजु', '1. DoNIDCR Server Query')}
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">REST API v2</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 space-y-1">
                    <span className="text-[10px] text-slate-400 block">राष्ट्रिय परिचयपत्र स्थिति</span>
                    <span className="font-bold text-slate-900 dark:text-white block">
                      {NID_STATUS_CONFIG[selectedProfile.nidStatus].np}
                    </span>
                    {selectedProfile.verifiedTimestamp && (
                      <span className="text-[10px] text-emerald-600 block">
                        प्रमाणित समय: {new Date(selectedProfile.verifiedTimestamp).toLocaleString()}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">प्रमाणीकरण अधिकृतको नाम</label>
                    <input
                      type="text"
                      value={officerName}
                      onChange={(e) => setOfficerName(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs"
                    />
                  </div>

                  <button
                    onClick={handleVerifyDoNidcr}
                    disabled={isApiLoading}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                    <RefreshCw className={`size-4 ${isApiLoading ? 'animate-spin' : ''}`} />
                    <span>{isApiLoading ? t('प्रणाली रुजु हुँदैछ...', 'Connecting DoNIDCR...') : t('NID प्रत्यक्ष प्रमाणीकरण गर्नुहोस्', 'Trigger DoNIDCR API Check')}</span>
                  </button>
                </div>
              </div>

              {/* Panel 2: Biometric Fingerprint & Liveness */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
                  <div className="flex items-center gap-2">
                    <Fingerprint className="size-4 text-emerald-600" />
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {t('२. बायोमेट्रिक तथा प्रत्यक्ष उपस्थिति स्क्यान', '2. Live Biometric Match')}
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">Morpho/Iris</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                      <span className="text-[10px] text-slate-400 block">औंठाछाप मिलान दर</span>
                      <span className="text-base font-black text-emerald-600">
                        {selectedProfile.biometric.fingerprintMatchScore}%
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                      <span className="text-[10px] text-slate-400 block">अनुहार पहिचान (Face)</span>
                      <span className="text-base font-black text-blue-600">
                        {selectedProfile.biometric.facialMatchScore}%
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-[11px] text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                    <span>{selectedProfile.biometric.livenessPassed ? 'प्रत्यक्ष उपस्थिति परीक्षण सफल (Liveness Confirmed)' : 'बायोमेट्रिक स्क्यान बाँकी छ'}</span>
                  </div>

                  <button
                    onClick={handleScanBiometrics}
                    disabled={isBioScanning}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                    <ScanFace className={`size-4 ${isBioScanning ? 'animate-pulse' : ''}`} />
                    <span>{isBioScanning ? t('बायोमेट्रिक स्क्यान हुँदैछ...', 'Capturing Scan...') : t('प्रत्यक्ष बायोमेट्रिक स्क्यान गर्नुहोस्', 'Capture Biometric Scan')}</span>
                  </button>
                </div>
              </div>

              {/* Panel 3: AML / PEP / Sanctions Screen */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="size-4 text-rose-600" />
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {t('३. AML जोखिम तथा PEP स्थिति', '3. AML Risk & PEP Screen')}
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">FIU Nepal</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">राजनीतिक विशिष्ट व्यक्ति (PEP) वर्ग</label>
                    <select
                      value={selectedProfile.pepStatus}
                      onChange={(e) => handlePepChange(e.target.value as PepStatus)}
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                    >
                      {Object.entries(PEP_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>{v.np}</option>
                      ))}
                    </select>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 space-y-1">
                    <span className="text-[10px] text-slate-400 block">कालोसूची स्थिति</span>
                    <span className="font-semibold text-emerald-600 flex items-center gap-1.5">
                      <CheckCircle2 className="size-3.5" />
                      {selectedProfile.sanctionCheck.notes}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      अर्को Re-KYC म्याद: <strong>{selectedProfile.reKycDeadlineDate}</strong>
                    </span>
                  </div>

                  <button
                    onClick={() => setActiveTab('certificate')}
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                    <Printer className="size-4" />
                    <span>{t('e-KYC प्रमाण पत्र हेर्नुहोस्', 'View e-KYC Certificate')}</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Tab 3: Official Certificate */}
        {activeTab === 'certificate' && (
          <div className="p-6 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  {t('आधिकारिक राष्ट्रिय परिचयपत्र e-KYC प्रमाणीकरण पत्र', 'Official DoNIDCR e-KYC Verification Certificate')}
                </h3>
                <p className="text-xs text-slate-500">
                  {t(
                    'नेपाल सरकार DoNIDCR र सहकारी विभागको मापदण्ड अनुसार प्रमाणित अभिलेख',
                    'Statutory compliance record verifying identity against central government biometric repository'
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCert}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                  <span>{copied ? t('कपी भयो', 'Copied') : t('कपी गर्नुहोस्', 'Copy')}</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm"
                >
                  <Printer className="size-3.5" />
                  <span>{t('प्रिन्ट गर्नुहोस्', 'Print Certificate')}</span>
                </button>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed shadow-inner overflow-x-auto">
              {certText}
            </div>
          </div>
        )}

        {/* Tab 4: Guidelines */}
        {activeTab === 'guidelines' && (
          <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 space-y-2">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-bold">
                  <CreditCard className="size-4" />
                  <span>DoNIDCR १०-अङ्कको NID नियम</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  नेपाल सरकारको राष्ट्रिय परिचयपत्र नम्बर १० अङ्कको हुनेछ। नागरिकता प्रमाणपत्रसँग NID रुजु गरी बायोमेट्रिक विवरण सिङ्क गरिन्छ।
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 space-y-2">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-bold">
                  <ShieldCheck className="size-4" />
                  <span>PEP तथा EDD अनिवार्य मापदण्ड</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  राजनीतिक रूपमा विशिष्ट व्यक्ति (सांसद, मेयर, वडाध्यक्ष) र तिनका नातेदारहरूको खाता खोल्दा थप ग्राहक पहिचान (EDD) र उच्च व्यवस्थापनको पूर्व-स्वीकृति अनिवार्य हुन्छ।
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 space-y-2">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold">
                  <RefreshCw className="size-4" />
                  <span>Re-KYC अद्यावधिक आवधिकता</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  न्यून जोखिम वर्गका सदस्यहरूले प्रत्येक ३ वर्षमा, मध्यम जोखिम वर्गले २ वर्षमा र उच्च जोखिम वर्गका सदस्यहरूले प्रत्येक १ वर्षमा केवाइसी नवीकरण गर्नुपर्दछ।
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
