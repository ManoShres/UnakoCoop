import React, { useState } from 'react';
import { BadgeCheck, CheckCircle2, Download, Fingerprint, Landmark, MapPin, Maximize, Maximize2, Minimize2, Minus, Plus, Printer, RotateCcw, RotateCw, ScrollText, ShieldCheck, X } from 'lucide-react';
import { useLanguageStore } from '../../../store/useLanguageStore';
import { printElement } from '../../../utils/printHelper';

export interface KycDocInfo {
  key: 'citizenship' | 'lalpurja' | 'ward' | 'biometric';
  title: string;
  id: string;
  image: string;
  type: string;
  authority: string;
  date: string;
  status: string;
  desc: string;
}

interface KycDocInspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeDocKey: 'citizenship' | 'lalpurja' | 'ward' | 'biometric';
  onSelectDocKey: (key: 'citizenship' | 'lalpurja' | 'ward' | 'biometric') => void;
  documents: Record<string, KycDocInfo>;
  onShowToast: (msg: string) => void;
}

export function KycDocInspectionModal({
  isOpen,
  onClose,
  activeDocKey,
  onSelectDocKey,
  documents,
  onShowToast,
}: KycDocInspectionModalProps) {
  const { t } = useLanguageStore();
  const [docZoom, setDocZoom] = useState(1.0);
  const [docRotation, setDocRotation] = useState(0);
  const [docFullscreen, setDocFullscreen] = useState(false);

  if (!isOpen) return null;

  const currentDoc = documents[activeDocKey] || documents.citizenship;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-2 sm:p-3 overflow-hidden animate-fade-in"
      onClick={onClose}
    >
      <div
        className={`bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700/80 flex flex-col overflow-hidden transition-all duration-200 my-auto ${
          docFullscreen
            ? 'w-[98vw] max-w-[98vw] h-[96vh] max-h-[96vh]'
            : 'w-full max-w-5xl lg:max-w-6xl h-[92vh] max-h-[94vh]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Printable Official Certified Copy of Document */}
        <div
          id="kyc-doc-printable"
          data-printable="certificate"
          className="hidden print:block p-8 bg-white text-slate-900"
        >
          {/* Official Cooperative Header */}
          <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <img src="/unako-logo.png" alt="Unako Logo" className="h-14 w-auto object-contain" />
              <div>
                <h2 className="text-base font-extrabold text-slate-900 leading-tight">उनको बचत तथा ऋण सहकारी संस्था लि.</h2>
                <p className="text-xs text-slate-700 font-semibold">Unako Savings & Credit Cooperative Society Ltd.</p>
                <p className="text-[11px] text-slate-600">गढवा-५, देउखुरी, दाङ • दर्ता नं: २०७०-०१ | PAN: ३००९१२८३७</p>
              </div>
            </div>
            <div className="text-right text-xs">
              <span className="inline-block px-2.5 py-1 rounded bg-slate-100 font-bold border border-slate-300">
                प्रमाणित सदस्य पहिचान तथा कागजात (Certified KYC Document)
              </span>
              <p className="font-mono text-slate-700 font-bold mt-1">UKO-DOC: {currentDoc.id}</p>
              <p className="text-[10px] text-slate-500 font-mono">मुद्रण मिति: {new Date().toLocaleDateString('ne-NP')}</p>
            </div>
          </div>

          {/* Document Metadata Table */}
          <div className="grid grid-cols-2 gap-3 mb-6 p-4 rounded-xl border border-slate-300 bg-slate-50 text-xs">
            <div>
              <span className="text-slate-500 block">कागजातको नाम (Title):</span>
              <span className="font-bold text-slate-900 text-sm">{currentDoc.title}</span>
            </div>
            <div>
              <span className="text-slate-500 block">कागजात प्रकार (Type):</span>
              <span className="font-bold text-slate-900">{currentDoc.type}</span>
            </div>
            <div>
              <span className="text-slate-500 block">जारी गर्ने निकाय (Issuing Authority):</span>
              <span className="font-bold text-slate-900">{currentDoc.authority}</span>
            </div>
            <div>
              <span className="text-slate-500 block">जारी / दर्ता मिति (Date):</span>
              <span className="font-bold text-slate-900 font-mono">{currentDoc.date}</span>
            </div>
            <div className="col-span-2">
              <span className="text-slate-500 block">कागजात विवरण (Particulars & Spec):</span>
              <span className="font-semibold text-slate-800">{currentDoc.desc}</span>
            </div>
          </div>

          {/* Document Preview Image */}
          <div className="border-2 border-slate-300 rounded-xl p-4 flex items-center justify-center bg-white mb-6">
            <img src={currentDoc.image} alt={currentDoc.title} className="max-h-[140mm] object-contain mx-auto" />
          </div>

          {/* Signatures */}
          <div className="flex justify-between items-end pt-8 text-xs font-semibold">
            <div className="text-center">
              <div className="w-36 border-b border-slate-800 mb-1"></div>
              <span>सदस्यको दस्तखत (Member Sign)</span>
            </div>
            <div className="text-center">
              <div className="w-24 h-24 rounded-full border-2 border-dashed border-emerald-600 flex flex-col items-center justify-center p-1 text-[9px] text-emerald-800 font-bold mx-auto mb-2">
                <span>उनको साकोस</span>
                <span>केवाईसी छाप</span>
                <span>VERIFIED</span>
              </div>
              <span>संस्थाको आधिकारिक छाप</span>
            </div>
            <div className="text-center">
              <div className="w-36 border-b border-slate-800 mb-1"></div>
              <span>केवाईसी प्रमाणीकरण अधिकृत</span>
            </div>
          </div>
        </div>

        {/* 1. COMPACT MODAL HEADER WITH TOOLBAR */}
        <div className="px-4 py-2.5 bg-slate-800/95 border-b border-slate-700/80 flex items-center justify-between gap-2 shrink-0 flex-wrap print:hidden">
          {/* Left: Document Info */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5 text-lg" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-xs sm:text-sm text-white truncate font-headline">
                  {currentDoc.title}
                </h3>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 shrink-0">
                  {currentDoc.status}
                </span>
              </div>
              <p className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5 truncate">
                <span>{currentDoc.id}</span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-300">{currentDoc.authority}</span>
              </p>
            </div>
          </div>

          {/* Right: Inspection Toolbar (Zoom, Rotate, Fullscreen, Close) */}
          <div className="flex items-center gap-1.5">
            {/* Zoom Controls */}
            <div className="flex items-center bg-slate-950 border border-slate-700 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setDocZoom((z) => Math.max(0.6, Math.round((z - 0.2) * 100) / 100))}
                disabled={docZoom <= 0.6}
                className="w-7 h-7 rounded flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                title="Zoom Out"
              >
                <Minus className="w-5 h-5 text-base" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setDocZoom(1.0);
                  setDocRotation(0);
                }}
                className="px-2 py-0.5 text-xs font-mono font-bold text-emerald-400 hover:text-emerald-300 hover:bg-slate-800 rounded transition cursor-pointer"
                title="Reset Fit"
              >
                {Math.round(docZoom * 100)}%
              </button>

              <button
                type="button"
                onClick={() => setDocZoom((z) => Math.min(3.0, Math.round((z + 0.25) * 100) / 100))}
                disabled={docZoom >= 3.0}
                className="w-7 h-7 rounded flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                title="Zoom In"
              >
                <Plus className="w-5 h-5 text-base" />
              </button>
            </div>

            {/* Rotate Controls */}
            <div className="hidden sm:flex items-center bg-slate-950 border border-slate-700 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setDocRotation((r) => (r - 90 + 360) % 360)}
                className="w-7 h-7 rounded flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                title="Rotate Left"
              >
                <RotateCcw className="w-5 h-5 text-base" />
              </button>
              <button
                type="button"
                onClick={() => setDocRotation((r) => (r + 90) % 360)}
                className="w-7 h-7 rounded flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                title="Rotate Right"
              >
                <RotateCw className="w-5 h-5 text-base" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setDocZoom(1.0);
                  setDocRotation(0);
                }}
                className="w-7 h-7 rounded flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                title="Reset Screen Fit"
              >
                <Maximize className="w-5 h-5 text-base" />
              </button>
            </div>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={() => setDocFullscreen((f) => !f)}
              className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title={docFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {docFullscreen ? (
                <Minimize2 className="w-4 h-4 text-slate-300" />
              ) : (
                <Maximize2 className="w-4 h-4 text-slate-300" />
              )}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-500/40 flex items-center justify-center transition cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5 text-base" />
            </button>
          </div>
        </div>

        {/* 2. COMPACT DOCUMENT SWITCHER TABS */}
        <div className="px-4 py-1.5 bg-slate-800/60 border-b border-slate-700/80 flex items-center gap-1.5 overflow-x-auto shrink-0 print:hidden">
          {[
            { key: 'citizenship' as const, label: 'नागरिकता (Citizenship)', icon: ShieldCheck },
            { key: 'lalpurja' as const, label: 'जग्गाधनी पुर्जा (Lalpurja)', icon: Landmark },
            { key: 'ward' as const, label: 'वडा सिफारिस तथा विद्युत् (Ward Slip)', icon: MapPin },
            { key: 'biometric' as const, label: 'बायोमेट्रिक तथा हस्ताक्षर (Biometric)', icon: Fingerprint },
          ].map((docTab) => {
            const Icon = docTab.icon;
            return (
              <button
                key={docTab.key}
                type="button"
                onClick={() => {
                  onSelectDocKey(docTab.key);
                  setDocZoom(1.0);
                  setDocRotation(0);
                }}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeDocKey === docTab.key
                    ? 'bg-emerald-600 text-white shadow-xs font-bold'
                    : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{docTab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 3. DOCUMENT CANVAS */}
        <div className="flex-1 min-h-0 bg-slate-950 relative overflow-auto p-2 sm:p-3 flex items-center justify-center print:hidden">
          <div
            className="w-full h-full flex items-center justify-center transition-transform duration-200"
            style={{
              transform: docZoom !== 1.0 || docRotation !== 0 ? `scale(${docZoom}) rotate(${docRotation}deg)` : undefined,
              transformOrigin: 'center center',
            }}
          >
            <img
              src={currentDoc.image}
              alt={currentDoc.title}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl border border-slate-700/80 select-none block m-auto"
            />
          </div>

          <div className="absolute bottom-2 left-3 bg-slate-900/80 backdrop-blur-sm border border-slate-700/60 px-2.5 py-0.5 rounded-full text-[10px] text-slate-400 pointer-events-none flex items-center gap-1 shadow-md">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>१००% दृश्य: पूरा कागजात देखिने गरी मिलाइएको • जुम गर्न टुलबार प्रयोग गर्नुहोस्</span>
          </div>
        </div>

        {/* 4. COMPACT FOOTER WITH DOCUMENT DETAILS & ACTIONS */}
        <div className="px-4 py-2 bg-slate-800/95 border-t border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0 print:hidden">
          <div className="min-w-0">
            <div className="text-[11px] text-white font-medium truncate max-w-xl">
              {currentDoc.desc}
            </div>
            <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
              <BadgeCheck className="w-5 h-5" />
              <span>UNAKO-CBS-STAMP: 2080-VAL-OK • Verified Active</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => printElement('kyc-doc-printable')}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition flex items-center gap-1 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              {t('प्रिन्ट', 'Print')}
            </button>

            <button
              type="button"
              onClick={() => {
                const link = document.createElement('a');
                link.href = currentDoc.image;
                link.download = `${currentDoc.key}_${currentDoc.id}.svg`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                onShowToast(t(`${currentDoc.title} डाउनलोड भयो!`, `${currentDoc.title} downloaded!`));
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              {t('डाउनलोड', 'Download')}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 transition cursor-pointer"
            >
              {t('बन्द गर्नुहोस्', 'Close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
