import React, { useState } from 'react';
import { useCoopStore } from '../../store/useCoopStore';
import { Member } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { useLanguageStore } from '../../store/useLanguageStore';
import {
  UserCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  Search,
  Check,
  X,
  Eye,
  ShieldCheck,
  Landmark,
  User,
  Building,
  Fingerprint,
} from 'lucide-react';
import { EkycNationalIdVerificationModal } from '../../components/admin/EkycNationalIdVerificationModal';

export const MemberVerificationQueuePage: React.FC = () => {
  const { members, updateMemberStatus } = useCoopStore();
  const { t, fmtCurrency, fmtCount, fmtDigits, fmtPhone } = useLanguageStore();
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'VERIFIED' | 'ACTION_REQUIRED'>('ALL');
  const [reviewNotes, setReviewNotes] = useState('');
  const [previewDoc, setPreviewDoc] = useState<{ title: string; image: string; meta: string } | null>(null);
  const [isEkycModalOpen, setIsEkycModalOpen] = useState(false);

  React.useEffect(() => {
    if (!selectedMember && !previewDoc) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        if (previewDoc) {
          setPreviewDoc(null);
        } else if (selectedMember) {
          setSelectedMember(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedMember, previewDoc]);

  const filtered = members.filter((m) => {
    if (filter === 'ALL') return true;
    return m.status === filter;
  });

  const handleAction = (status: Member['status']) => {
    if (!selectedMember) return;
    updateMemberStatus(selectedMember.id, status, reviewNotes);
    setSelectedMember(null);
    setReviewNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            {t('सदस्य केवाइसी प्रमाणीकरण प्यानल', 'Member KYC Verification Panel')}
          </h1>
          <p className="text-xs text-slate-500">
            {t('नागरिकता तथा पहिचान प्रमाणहरूको मूल्याङ्कन गरी सदस्यता सेयर स्वीकृत गर्नुहोस्।', 'Evaluate identity citizenship proofs and authorize membership shares.')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsEkycModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold transition shadow-sm cursor-pointer"
          >
            <Fingerprint className="size-4" />
            <span>{t('राष्ट्रिय परिचयपत्र e-KYC कन्सोल', 'DoNIDCR e-KYC Console')}</span>
          </button>

          <div className="flex gap-2">
            {([
              { key: 'ALL', label: t('सबै', 'ALL') },
              { key: 'PENDING', label: t('प्रतीक्षारत', 'PENDING') },
              { key: 'ACTION_REQUIRED', label: t('पुनः पेश आवश्यक', 'ACTION REQUIRED') },
              { key: 'VERIFIED', label: t('प्रमाणित', 'VERIFIED') },
            ] as const).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  filter === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-400">
              <tr>
                <th className="p-4 font-semibold">{t('सदस्य', 'Member')}</th>
                <th className="p-4 font-semibold">{t('नागरिकता नं', 'Citizenship No')}</th>
                <th className="p-4 font-semibold">{t('फोन र ठेगाना', 'Phone & Address')}</th>
                <th className="p-4 font-semibold">{t('सेयर पुँजी', 'Share Capital')}</th>
                <th className="p-4 font-semibold">{t('स्थिति', 'Status')}</th>
                <th className="p-4 font-semibold text-right">{t('समीक्षा कार्य', 'Review Action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                  <td className="p-4 flex items-center gap-3">
                    <img src={m.avatarUrl} alt={m.name} className="size-9 rounded-full object-cover" />
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">{t(m.nameNepali || m.name, m.name)}</h4>
                      <span className="font-mono text-slate-400 text-[10px]">{fmtDigits(m.memberNo)}</span>
                    </div>
                  </td>
                  <td className="p-4 font-mono font-semibold text-slate-800 dark:text-slate-200">{fmtDigits(m.citizenshipNo)}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-300">
                    <div>{fmtPhone(m.phone)}</div>
                    <span className="text-[10px] text-slate-400">{fmtDigits(t(m.addressNepali || m.address, m.address))}</span>
                  </td>
                  <td className="p-4 font-bold text-slate-900 dark:text-white">
                    {fmtCurrency(m.shareCapital, true)}
                  </td>
                  <td className="p-4">
                    <Badge status={m.status} size="sm" />
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedMember(m);
                        setReviewNotes(m.notes || '');
                      }}
                      className="flex items-center gap-1.5 ml-auto bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs"
                    >
                      <Eye className="size-3.5" />
                      <span>{t('केवाइसी समीक्षा', 'Review KYC')}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Member Review Modal */}
      {selectedMember && (
        <div 
          role="dialog"
          aria-modal="true"
          aria-label={t('केवाइसी समीक्षा', 'KYC Review')}
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setSelectedMember(null)}
        >
          <div 
            className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/90 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <img 
                  src={selectedMember.avatarUrl} 
                  alt="" 
                  className="size-12 rounded-full object-cover ring-2 ring-emerald-500/40 shrink-0 shadow-sm" 
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{t(selectedMember.nameNepali || selectedMember.name, selectedMember.name)}</h3>
                    <Badge status={selectedMember.status} size="sm" />
                  </div>
                  <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                    {fmtDigits(selectedMember.memberNo)} • {t('नागरिकता', 'Citizenship')}: {fmtDigits(selectedMember.citizenshipNo)}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedMember(null)}
                aria-label={t('बन्द गर्नुहोस्', 'Close')}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                type="button"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Member Quick Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">{t('फोन', 'Phone')}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{fmtPhone(selectedMember.phone)}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">{t('ठेगाना', 'Address')}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">
                    {fmtDigits(t(selectedMember.addressNepali || selectedMember.address, selectedMember.address))}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">{t('सेयर पुँजी', 'Share Capital')}</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {fmtCurrency(selectedMember.shareCapital, true)}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">{t('क्रेडिट स्कोर', 'Credit Score')}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{fmtDigits(selectedMember.creditScore)} / {fmtDigits(850)}</span>
                </div>
              </div>

              {/* ─── KYC DOCUMENTS INSPECTION WITH PREVIEW BUTTONS ─── */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
                    <span>{t('केवाइसी कागजात प्रमाणीकरण तथा निरीक्षण', 'KYC Document Verification & Inspection')}</span>
                  </h4>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {t('मूल प्रमाण हेर्न क्लिक गर्नुहोस्', 'Click to inspect original proof')}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  {/* 1. Citizenship Certificate */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <User className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                          {t('नेपाली नागरिकता प्रमाणपत्र', 'Citizenship Certificate')}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono">{t('नं:', 'No:')} {fmtDigits(selectedMember.citizenshipNo)}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                        <Check className="size-3" /> {t('प्रमाणित', 'Verified')}
                      </span>
                      <button
                        type="button"
                        onClick={() => setPreviewDoc({
                          title: t('नेपाली नागरिकता प्रमाणपत्र', 'Citizenship Certificate'),
                          image: '/assets/kyc/doc_citizenship.svg',
                          meta: `District Administration Office • Reg: ${selectedMember.citizenshipNo} • ${selectedMember.name}`
                        })}
                        className="py-1 px-2.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 text-[11px] font-bold border border-slate-200 dark:border-slate-700 flex items-center gap-1 transition shadow-2xs"
                      >
                        <Eye className="size-3.5" />
                        <span>{t('निरीक्षण', 'Inspect')}</span>
                      </button>
                    </div>
                  </div>

                  {/* 2. Land Ownership (Lalpurja) Deed */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Landmark className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                          {t('जग्गाधनी प्रमाणपुर्जा (लालपुर्जा)', 'Land Ownership Deed')}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono">{t('कित्ता ४१२ • लालपुर्जा', 'Plot 412 • Lalpurja')}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                        <Check className="size-3" /> {t('संलग्न', 'Attached')}
                      </span>
                      <button
                        type="button"
                        onClick={() => setPreviewDoc({
                          title: t('जग्गाधनी प्रमाणपुर्जा (लालपुर्जा)', 'Land Ownership Certificate - Lalpurja'),
                          image: '/assets/kyc/doc_lalpurja.svg',
                          meta: 'Land Revenue Office (Malpot) • Plot No: 412 • Hypothecated Asset'
                        })}
                        className="py-1 px-2.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 text-[11px] font-bold border border-slate-200 dark:border-slate-700 flex items-center gap-1 transition shadow-2xs"
                      >
                        <Eye className="size-3.5" />
                        <span>{t('निरीक्षण', 'Inspect')}</span>
                      </button>
                    </div>
                  </div>

                  {/* 3. Signature & Biometric Specimen */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Fingerprint className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                          {t('हस्ताक्षर तथा बायोमेट्रिक औंठाछाप', 'Signature & Biometrics')}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono">{t('दुबै औंठाछाप र दस्तखत', 'Both Thumbprints & Sign')}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {selectedMember.kycDocuments.signature ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                          <Check className="size-3" /> {t('प्रमाणित', 'Verified')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50">
                          <AlertCircle className="size-3" /> {t('प्रतीक्षारत', 'Pending')}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => setPreviewDoc({
                          title: t('हस्ताक्षर तथा बायोमेट्रिक औंठाछाप', 'Signature & Biometric Specimen'),
                          image: '/assets/kyc/doc_biometric.svg',
                          meta: `CBS Specimen Card • Digital Fingerprint Verified • ${selectedMember.name}`
                        })}
                        className="py-1 px-2.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 text-[11px] font-bold border border-slate-200 dark:border-slate-700 flex items-center gap-1 transition shadow-2xs"
                      >
                        <Eye className="size-3.5" />
                        <span>{t('निरीक्षण', 'Inspect')}</span>
                      </button>
                    </div>
                  </div>

                  {/* 4. Ward Recommendation & Utility Slip */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Building className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                          {t('वडा सिफारिस तथा महसुल रसिद', 'Ward Utility & Sifaris')}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono">{t('विद्युत् प्राधिकरण महसुल रसिद', 'NEA Electricity Receipt')}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                        <Check className="size-3" /> {t('प्रमाणित', 'Verified')}
                      </span>
                      <button
                        type="button"
                        onClick={() => setPreviewDoc({
                          title: t('वडा कार्यालय सिफारिस तथा विद्युत् महसुल', 'Ward Recommendation & Electricity Slip'),
                          image: '/assets/kyc/doc_ward_utility.svg',
                          meta: 'Local Governance Ward-5 • NEA Consumer Slip & Address Proof'
                        })}
                        className="py-1 px-2.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 text-[11px] font-bold border border-slate-200 dark:border-slate-700 flex items-center gap-1 transition shadow-2xs"
                      >
                        <Eye className="size-3.5" />
                        <span>{t('निरीक्षण', 'Inspect')}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Committee Review Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  {t('प्रमाणीकरण समिति निर्णय तथा टिप्पणी', 'Verification Committee Decision & Notes')}
                </label>
                <textarea
                  rows={3}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder={t(
                    'आधिकारिक समितिको निष्कर्ष, थप कागजात निर्देशन वा स्वीकृतिको आधार यहाँ प्रविष्ट गर्नुहोस्...',
                    'Enter official committee findings, missing document instructions, or approval rationale...'
                  )}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/70 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Modal Footer / Action Buttons */}
            <div className="px-6 py-4 bg-slate-50/70 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedMember(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
              >
                {t('रद्द गर्नुहोस्', 'Cancel')}
              </button>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleAction('ACTION_REQUIRED')}
                  className="px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-300 dark:border-amber-800 text-xs font-bold transition"
                >
                  {t('पुनः पेश गर्न अनुरोध', 'Request Resubmission')}
                </button>
                <button
                  type="button"
                  onClick={() => handleAction('REJECTED')}
                  className="px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-300 dark:border-rose-800 text-xs font-bold transition"
                >
                  {t('केवाइसी अस्वीकृत', 'Reject KYC')}
                </button>
                <button
                  type="button"
                  onClick={() => handleAction('VERIFIED')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm hover:shadow transition flex items-center gap-1.5"
                >
                  <Check className="size-4" />
                  <span>{t('स्वीकृत गरी प्रमाणित गर्नुहोस्', 'Approve & Verify Member')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── FULL DOCUMENT INSPECTION SUB-MODAL ─── */}
      {previewDoc && (
        <div 
          className="fixed inset-0 z-60 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setPreviewDoc(null)}
        >
          <div 
            className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{previewDoc.title}</h4>
                <p className="text-[11px] text-slate-500 font-mono mt-0.5">{previewDoc.meta}</p>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Document Image Container */}
            <div className="p-6 bg-slate-100 dark:bg-slate-950 flex items-center justify-center min-h-[360px] max-h-[65vh] overflow-auto">
              <img 
                src={previewDoc.image} 
                alt={previewDoc.title} 
                className="max-h-[500px] w-auto object-contain rounded-lg shadow-md border border-slate-200/80 dark:border-slate-800 bg-white" 
              />
            </div>

            <div className="px-6 py-3 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500 flex items-center gap-1">
                <ShieldCheck className="size-4 text-emerald-600" />
                <span>
                  {t(
                    'सहकारी विभाग तथा जिल्ला प्रशासन कार्यालयको अभिलेख अनुसार प्रमाणित',
                    'Verified against official Cooperative Department and District Registry'
                  )}
                </span>
              </span>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
              >
                {t('सकियो / बन्द गर्नुहोस्', 'Done Inspecting')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DoNIDCR Electronic KYC & Biometric Verification Modal */}
      <EkycNationalIdVerificationModal
        isOpen={isEkycModalOpen}
        onClose={() => setIsEkycModalOpen(false)}
      />
    </div>
  );
};
