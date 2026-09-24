import React, { useState } from 'react';
import { BadgeCheck, CheckCircle2, Download, Maximize, Minus, Plus, Printer, RotateCcw, RotateCw, ShieldCheck, X } from 'lucide-react';
import { useLanguageStore } from '../../../store/useLanguageStore';

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
        {/* 1. COMPACT MODAL HEADER WITH TOOLBAR */}
        <div className="px-4 py-2.5 bg-slate-800/95 border-b border-slate-700/80 flex items-center justify-between gap-2 shrink-0 flex-wrap">
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
                className="w-7 h-7 rounded flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
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
                className="px-2 py-0.5 text-xs font-mono font-bold text-emerald-400 hover:text-emerald-300 hover:bg-slate-800 rounded transition"
                title="Reset Fit"
              >
                {Math.round(docZoom * 100)}%
              </button>

              <button
                type="button"
                onClick={() => setDocZoom((z) => Math.min(3.0, Math.round((z + 0.25) * 100) / 100))}
                disabled={docZoom >= 3.0}
                className="w-7 h-7 rounded flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition"
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
                className="w-7 h-7 rounded flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition"
                title="Rotate Left"
              >
                <RotateCcw className="w-5 h-5 text-base" />
              </button>
              <button
                type="button"
                onClick={() => setDocRotation((r) => (r + 90) % 360)}
                className="w-7 h-7 rounded flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition"
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
                className="w-7 h-7 rounded flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition"
                title="Reset Screen Fit"
              >
                <Maximize className="w-5 h-5 text-base" />
              </button>
            </div>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={() => setDocFullscreen((f) => !f)}
              className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition"
              title={docFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              <span className="material-symbols-outlined text-base">
                {docFullscreen ? 'fullscreen_exit' : 'fullscreen'}
              </span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-500/40 flex items-center justify-center transition"
              title="Close"
            >
              <X className="w-5 h-5 text-base" />
            </button>
          </div>
        </div>

        {/* 2. COMPACT DOCUMENT SWITCHER TABS */}
        <div className="px-4 py-1.5 bg-slate-800/60 border-b border-slate-700/80 flex items-center gap-1.5 overflow-x-auto shrink-0">
          {[
            { key: 'citizenship' as const, label: 'नागरिकता (Citizenship)', icon: 'badge' },
            { key: 'lalpurja' as const, label: 'जग्गाधनी पुर्जा (Lalpurja)', icon: 'landscape' },
            { key: 'ward' as const, label: 'वडा सिफारिस तथा विद्युत् (Ward Slip)', icon: 'home_pin' },
            { key: 'biometric' as const, label: 'बायोमेट्रिक तथा हस्ताक्षर (Biometric)', icon: 'fingerprint' },
          ].map((docTab) => (
            <button
              key={docTab.key}
              type="button"
              onClick={() => {
                onSelectDocKey(docTab.key);
                setDocZoom(1.0);
                setDocRotation(0);
              }}
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeDocKey === docTab.key
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60'
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">{docTab.icon}</span>
              <span>{docTab.label}</span>
            </button>
          ))}
        </div>

        {/* 3. DOCUMENT CANVAS */}
        <div className="flex-1 min-h-0 bg-slate-950 relative overflow-auto p-2 sm:p-3 flex items-center justify-center">
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
        <div className="px-4 py-2 bg-slate-800/95 border-t border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
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
              onClick={() => {
                const printWin = window.open(currentDoc.image, '_blank');
                if (printWin) {
                  printWin.focus();
                  printWin.print();
                }
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold transition flex items-center gap-1"
            >
              <Printer className="w-5 h-5" />
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
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1"
            >
              <Download className="w-5 h-5" />
              {t('डाउनलोड', 'Download')}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 transition"
            >
              {t('बन्द गर्नुहोस्', 'Close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
