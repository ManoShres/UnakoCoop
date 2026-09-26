import React, { useState, useMemo } from 'react';
import {
  X,
  Printer,
  Copy,
  Check,
  ShieldCheck,
  QrCode,
  RotateCw,
  Cpu,
  Wifi,
  Sparkles,
  Barcode,
} from 'lucide-react';
import { Member } from '../../types';
import { useLanguageStore } from '../../store/useLanguageStore';
import { useCoopStore } from '../../store/useCoopStore';
import {
  generateMemberSmartCardPayload,
  generateBarcodeBars,
  getMemberQrImageUrl,
} from '../../utils/memberSmartCard';
import { printRawHtml } from '../../utils/printHelper';

export interface MemberDigitalSmartCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
}

export const MemberDigitalSmartCardModal: React.FC<MemberDigitalSmartCardModalProps> = ({
  isOpen,
  onClose,
  member,
}) => {
  const { t, fmtDigits } = useLanguageStore();
  const { coopSettings } = useCoopStore();
  const [activeSide, setActiveSide] = useState<'FRONT' | 'BACK'>('FRONT');
  const [copied, setCopied] = useState(false);

  const payload = useMemo(() => {
    if (!member) return '';
    return generateMemberSmartCardPayload(member, coopSettings);
  }, [member, coopSettings]);

  const barcodeBars = useMemo(() => {
    if (!member) return [];
    return generateBarcodeBars(member.memberNo, 220);
  }, [member]);

  const qrImageUrl = useMemo(() => {
    if (!payload) return '';
    return getMemberQrImageUrl(payload, 240);
  }, [payload]);

  if (!isOpen || !member) return null;

  const handleCopyToken = () => {
    navigator.clipboard.writeText(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrintCard = () => {
    const printContent = `
      <div style="font-family: system-ui, sans-serif; display: flex; flex-direction: column; gap: 20px; align-items: center; padding: 20px;">
        <h3 style="margin: 0; font-size: 14px; text-transform: uppercase;">${coopSettings.nameNepali} — सदस्य डिजिटल स्मार्ट कार्ड</h3>
        
        <!-- FRONT SIDE -->
        <div style="width: 85.6mm; height: 53.98mm; border: 1px solid #10b981; border-radius: 4mm; padding: 3mm; box-sizing: border-box; background: linear-gradient(135deg, #064e3b, #047857); color: white; position: relative; overflow: hidden;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 0.5px solid rgba(255,255,255,0.3); padding-bottom: 2mm;">
            <div>
              <div style="font-size: 8px; font-weight: bold; letter-spacing: 0.5px;">${coopSettings.nameNepali}</div>
              <div style="font-size: 6px; opacity: 0.85;">${coopSettings.name}</div>
            </div>
            <div style="font-size: 6px; text-align: right; opacity: 0.85;">
              <div>दर्ता: ${coopSettings.regNo}</div>
              <div>PAN: ${coopSettings.panNo}</div>
            </div>
          </div>
          
          <div style="display: flex; gap: 3mm; margin-top: 3mm; align-items: center;">
            <div style="width: 18mm; height: 22mm; border: 1px solid #f59e0b; border-radius: 2mm; overflow: hidden; background: #ffffff; display: flex; align-items: center; justify-content: center;">
              ${
                member.avatarUrl
                  ? `<img src="${member.avatarUrl}" style="width:100%; height:100%; object-fit: cover;" />`
                  : `<div style="font-size: 10px; font-weight: bold; color: #047857;">UKO</div>`
              }
            </div>
            <div style="flex: 1;">
              <div style="font-size: 10px; font-weight: bold; line-height: 1.1;">${member.nameNepali || member.name}</div>
              <div style="font-size: 8px; font-weight: 600; opacity: 0.9;">${member.name}</div>
              <div style="font-size: 8px; font-family: monospace; font-weight: bold; color: #fde68a; margin-top: 1mm;">ID: ${member.memberNo}</div>
              <div style="font-size: 6px; opacity: 0.85; margin-top: 1mm;">नागरिकता: ${member.citizenshipNo}</div>
              <div style="font-size: 6px; opacity: 0.85;">स्थान: गढवा वडा नं ${member.wardNo || '५'}, दाङ</div>
            </div>
          </div>

          <div style="position: absolute; bottom: 2mm; left: 3mm; right: 3mm; display: flex; justify-content: space-between; font-size: 6px; opacity: 0.75; border-top: 0.5px solid rgba(255,255,255,0.2); pt: 1mm;">
            <span>प्रवेश मिति: ${member.joinedDate}</span>
            <span style="font-weight: bold; color: #6ee7b7;">✓ VERIFIED SHAREHOLDER</span>
          </div>
        </div>

        <!-- BACK SIDE -->
        <div style="width: 85.6mm; height: 53.98mm; border: 1px solid #cbd5e1; border-radius: 4mm; padding: 3mm; box-sizing: border-box; background: #ffffff; color: #0f172a; position: relative;">
          <div style="height: 6mm; background: #0f172a; margin: -3mm -3mm 2mm -3mm;"></div>
          <div style="display: flex; gap: 3mm; align-items: center;">
            <img src="${qrImageUrl}" style="width: 20mm; height: 20mm; border: 1px solid #e2e8f0; border-radius: 2mm;" />
            <div style="flex: 1; font-size: 6px; line-height: 1.3; color: #334155;">
              <div style="font-weight: bold; color: #047857; font-size: 7px;">उनको बचत तथा ऋण सहकारी संस्था लिमिटेड</div>
              <div>केन्द्रीय कार्यालय: गढवा-५, दाङ, लुम्बिनी प्रदेश</div>
              <div>सम्पर्क: ${coopSettings.phone} | ${coopSettings.email}</div>
              <div style="margin-top: 1.5mm; font-style: italic; color: #64748b;">* यो परिचयपत्र संस्थाको सम्पत्ति हो। भेटिएमा नजिकको शाखा वा कार्यालयमा बुझाइदिनुहोला।</div>
            </div>
          </div>
          <div style="margin-top: 2.5mm; display: flex; justify-content: space-between; align-items: flex-end; border-top: 0.5px solid #cbd5e1; padding-top: 1.5mm;">
            <div style="font-size: 6px; color: #64748b; text-align: center;">
              <div style="width: 25mm; border-bottom: 0.5px dashed #94a3b8; height: 3mm;"></div>
              सदस्यको दस्तखत
            </div>
            <div style="font-size: 6px; color: #64748b; text-align: center;">
              <div style="width: 25mm; border-bottom: 0.5px dashed #94a3b8; height: 3mm;"></div>
              प्रबन्धक / आधिकारिक
            </div>
          </div>
        </div>
      </div>
    `;

    printRawHtml(printContent, {
      title: `SmartCard-${member.memberNo}`,
      format: 'a4',
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-emerald-200 border border-white/20">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono tracking-wider uppercase text-emerald-200 font-bold">
                {t('डिजिटल सदस्य परिचयपत्र (CR-80 Smart Card)', 'Digital Member Smart ID Card')}
              </div>
              <h3 className="font-black text-sm text-white">
                {member.name} [{member.memberNo}]
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={t('बन्द गर्नुहोस्', 'Close')}
            className="text-white/70 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Card View Canvas */}
        <div className="p-6 flex flex-col items-center space-y-6 bg-slate-100 dark:bg-slate-950/60">
          {/* Card Side Switcher Tabs */}
          <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveSide('FRONT')}
              className={`px-4 py-1.5 rounded-xl transition cursor-pointer ${
                activeSide === 'FRONT'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {t('अगाडि (Front Side)', 'Front Side')}
            </button>
            <button
              type="button"
              onClick={() => setActiveSide('BACK')}
              className={`px-4 py-1.5 rounded-xl transition cursor-pointer ${
                activeSide === 'BACK'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {t('पछाडि (Back Side)', 'Back Side')}
            </button>
          </div>

          {/* CR80 Smart Card Visual Canvas */}
          <div className="relative w-full max-w-sm aspect-[1.586/1] rounded-2xl overflow-hidden shadow-2xl border-2 border-emerald-600/40 select-none transition-transform hover:scale-[1.02] duration-300">
            {activeSide === 'FRONT' ? (
              /* FRONT SIDE */
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-emerald-800 to-teal-950 text-white p-5 flex flex-col justify-between">
                {/* Top Bar */}
                <div className="flex items-start justify-between border-b border-emerald-400/30 pb-2.5">
                  <div>
                    <h4 className="text-xs font-black tracking-tight text-white uppercase">
                      {coopSettings.nameNepali}
                    </h4>
                    <p className="text-[9px] text-emerald-200 font-medium">
                      {coopSettings.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] font-mono text-emerald-300 block">
                      दर्ता: {fmtDigits(coopSettings.regNo)}
                    </span>
                    <span className="text-[8px] font-mono text-emerald-300 block">
                      PAN: {fmtDigits(coopSettings.panNo)}
                    </span>
                  </div>
                </div>

                {/* Middle Identity Section */}
                <div className="flex items-center gap-4 my-auto">
                  {/* Photo Frame */}
                  <div className="relative size-20 rounded-xl border-2 border-amber-400/80 bg-emerald-950 overflow-hidden shadow-md shrink-0 flex items-center justify-center">
                    {member.avatarUrl ? (
                      <img
                        src={member.avatarUrl}
                        alt={member.name}
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="size-full bg-gradient-to-br from-emerald-700 to-teal-800 flex items-center justify-center font-black text-amber-300 text-lg">
                        {member.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <span className="absolute bottom-0 inset-x-0 bg-amber-500/90 text-slate-950 font-black text-[7px] text-center uppercase tracking-tighter py-0.5">
                      VERIFIED
                    </span>
                  </div>

                  {/* Details */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Cpu className="size-4 text-amber-300" />
                      <Wifi className="size-3.5 text-emerald-300 rotate-90" />
                    </div>

                    <h3 className="text-sm font-black tracking-tight text-white leading-tight">
                      {member.nameNepali || member.name}
                    </h3>
                    <p className="text-[11px] font-bold text-emerald-200">
                      {member.name}
                    </p>

                    <div className="flex items-center gap-2 pt-0.5">
                      <span className="px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 font-mono text-[11px] font-bold border border-amber-400/40">
                        {member.memberNo}
                      </span>
                      <span className="text-[10px] text-emerald-300">
                        वडा नं {fmtDigits(member.wardNo || '५')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Strip */}
                <div className="pt-2 border-t border-emerald-400/20 flex items-center justify-between text-[9px] text-emerald-300">
                  <span className="flex items-center gap-1">
                    <Sparkles className="size-3 text-amber-300" />
                    <span>{t('सदस्यता:', 'Member Since:')} {fmtDigits(member.joinedDate)}</span>
                  </span>
                  <span className="font-mono text-emerald-400 font-bold uppercase tracking-wider">
                    GADHWA-5, DANG
                  </span>
                </div>
              </div>
            ) : (
              /* BACK SIDE */
              <div className="absolute inset-0 bg-white text-slate-900 p-4 flex flex-col justify-between">
                {/* Magnetic Stripe simulation */}
                <div className="-mx-4 -mt-4 h-8 bg-slate-900 mb-2 flex items-center px-4 justify-between">
                  <span className="text-[9px] font-mono text-emerald-400 font-bold">
                    UNAKO SECURE SMART CHIP
                  </span>
                  <span className="text-[8px] font-mono text-slate-400">
                    NPS NEPALQR COMPLIANT
                  </span>
                </div>

                {/* QR and Barcode Section */}
                <div className="flex items-center gap-4 my-auto">
                  {/* QR Code */}
                  <div className="p-1.5 rounded-xl border border-slate-300 bg-white shadow-xs shrink-0">
                    <img
                      src={qrImageUrl}
                      alt="Member QR"
                      className="size-20 object-contain"
                    />
                  </div>

                  {/* SVG Barcode & Information */}
                  <div className="flex-1 space-y-1">
                    <div className="text-[10px] font-bold text-emerald-800">
                      {coopSettings.nameNepali}
                    </div>
                    <div className="text-[9px] text-slate-500">
                      {t('टेलिफोन:', 'Helpline:')} {fmtDigits(coopSettings.phone)}
                    </div>
                    <div className="text-[8px] text-slate-400 leading-tight">
                      नागरिकता नं: {fmtDigits(member.citizenshipNo)}
                    </div>

                    {/* Deterministic SVG Barcode */}
                    <div className="pt-1">
                      <svg width="180" height="24" className="overflow-visible">
                        {barcodeBars.map((bar, idx) => (
                          <rect
                            key={idx}
                            x={bar.x}
                            y="0"
                            width={bar.width}
                            height="20"
                            fill="#0f172a"
                          />
                        ))}
                      </svg>
                      <div className="text-[9px] font-mono tracking-widest text-slate-600 font-bold">
                        {member.memberNo}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Signature strip */}
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[8px] text-slate-500">
                  <div className="text-center">
                    <div className="w-24 border-b border-dashed border-slate-400 h-3 mb-0.5"></div>
                    <span>{t('सदस्यको दस्तखत', "Member's Sign")}</span>
                  </div>
                  <div className="text-center">
                    <div className="w-24 border-b border-dashed border-slate-400 h-3 mb-0.5"></div>
                    <span>{t('प्रबन्धक / आधिकारिक', 'Authorized Officer')}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setActiveSide((prev) => (prev === 'FRONT' ? 'BACK' : 'FRONT'))}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer"
          >
            <RotateCw className="size-4" />
            <span>
              {activeSide === 'FRONT' ? t('पछाडि हेर्नुहोस्', 'Flip to Back') : t('अगाडि हेर्नुहोस्', 'Flip to Front')}
            </span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyToken}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer"
            >
              {copied ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
              <span>{copied ? t('कपी भयो', 'Copied!') : t('टोकन कपी', 'Copy Token')}</span>
            </button>

            <button
              type="button"
              onClick={handlePrintCard}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition cursor-pointer"
            >
              <Printer className="size-4" />
              <span>{t('स्मार्ट कार्ड छाप्नुहोस्', 'Print Smart Card')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
