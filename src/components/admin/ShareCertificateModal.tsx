import React, { useState } from 'react';
import { useCoopStore } from '../../store/useCoopStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import {
  Award,
  X,
  User,
  Search,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  Calendar,
  Layers,
} from 'lucide-react';
import type { Member } from '../../types';

interface ShareCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  preselectedMemberId?: string;
}

export function ShareCertificateModal({
  isOpen,
  onClose,
  onSuccess,
  preselectedMemberId,
}: ShareCertificateModalProps) {
  const { members, sharePool, issueShareCertificate } = useCoopStore();
  const { t, fmtCurrency, fmtCount, fmtDigits, fmtPhone } = useLanguageStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(() => {
    if (preselectedMemberId) {
      return members.find((m) => m.id === preselectedMemberId) || null;
    }
    return members.length > 0 ? members[0] : null;
  });

  const [kittaCount, setKittaCount] = useState<number>(10);
  const [certificateNo, setCertificateNo] = useState<string>(
    () => `UKO-SHR-2081-${Math.floor(1000 + Math.random() * 9000)}`
  );
  const [paymentMode, setPaymentMode] = useState<'CASH' | 'SAVINGS_ACCOUNT' | 'BANK_VOUCHER'>('CASH');
  const [paymentRef, setPaymentRef] = useState<string>('');
  const [issueDate, setIssueDate] = useState<string>('2081-11-15');

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

  if (!isOpen) return null;

  const parValue = sharePool.parValue || 100;
  const totalAmount = kittaCount * parValue;

  const filteredMembers = members.filter((m) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      m.name.toLowerCase().includes(q) ||
      m.memberNo.toLowerCase().includes(q) ||
      m.phone.includes(q) ||
      (m.nameNepali && m.nameNepali.includes(q))
    );
  });

  const handleSelectMember = (member: Member) => {
    setSelectedMember(member);
    setSearchQuery('');
  };

  const handleKittaPreset = (val: number) => {
    setKittaCount(val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) {
      alert(t('कृपया सदस्य चयन गर्नुहोस्।', 'Please select a member.'));
      return;
    }
    if (kittaCount < 1) {
      alert(t('कम्तीमा १ कित्ता सेयर हुनुपर्दछ।', 'Must allot at least 1 kitta.'));
      return;
    }

    issueShareCertificate(selectedMember.id, kittaCount, certificateNo);
    onSuccess(
      t(
        `सदस्य ${selectedMember.name} (${fmtDigits(selectedMember.memberNo)}) लाई ${fmtCount(kittaCount)} कित्ता (${fmtCurrency(totalAmount, true)}) सेयर प्रमाणपत्र #${certificateNo} सफलतापूर्वक जारी गरियो!`,
        `Successfully issued ${kittaCount} share units (${fmtCurrency(totalAmount, true)}) Certificate #${certificateNo} to member ${selectedMember.name}!`
      )
    );
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-cert-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/10 backdrop-blur-xs">
              <Award className="size-5 text-amber-300" />
            </div>
            <div>
              <h3 id="share-cert-modal-title" className="font-black text-sm tracking-tight">
                {t('सेयर प्रमाणपत्र जारी फारम', 'Share Certificate Allotment Form')}
              </h3>
              <p className="text-[11px] text-blue-100">
                {t('उनको बचत तथा ऋण सहकारी संस्था लि. - सदस्य पुँजी विस्तार', 'Unako SACCOS - Member Equity Expansion')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label={t('बन्द गर्नुहोस्', 'Close')}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Member Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <User className="size-3.5 text-blue-600" />
              <span>{t('सदस्य चयन गर्नुहोस् *', 'Select Member *')}</span>
            </label>

            {/* Selected Member Card or Search Box */}
            {selectedMember ? (
              <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-sm shadow-xs">
                    {selectedMember.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{t(selectedMember.nameNepali || selectedMember.name, selectedMember.name)}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold">
                        {fmtDigits(selectedMember.memberNo)}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {t('हालको सेयर:', 'Current Shares:')}{' '}
                      <span className="font-bold font-mono text-emerald-600">
                        {fmtCount(selectedMember.shareKitta || Math.round(selectedMember.shareCapital / 100))} {t('कित्ता', 'Kitta')} ({fmtCurrency(selectedMember.shareCapital, true)})
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedMember(null)}
                  className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-bold underline px-2 py-1"
                >
                  {t('परिवर्तन', 'Change')}
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="size-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('नाम, सदस्य नम्बर वा फोन नम्बर टाइप गर्नुहोस्...', 'Search by name, member no, or phone...')}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    autoFocus
                  />
                </div>

                <div className="max-h-40 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredMembers.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => handleSelectMember(m)}
                      className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between text-xs transition"
                    >
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white mr-2">
                          {t(m.nameNepali || m.name, m.name)}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">({fmtDigits(m.memberNo)})</span>
                      </div>
                      <span className="text-[11px] text-emerald-600 font-mono font-bold">
                        {fmtCount(m.shareKitta || Math.round(m.shareCapital / 100))} {t('कित्ता', 'Kitta')}
                      </span>
                    </div>
                  ))}
                  {filteredMembers.length === 0 && (
                    <div className="p-3 text-center text-xs text-slate-400">
                      {t('कुनै सदस्य फेला परेन।', 'No members found.')}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Share Kitta Input & Presets */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Layers className="size-3.5 text-blue-600" />
                <span>{t('थप खरिद गर्ने कित्ता संख्या *', 'Additional Share Units (Kitta) *')}</span>
              </label>
              <span className="text-[11px] text-slate-400">
                {t('अंकित मूल्य:', 'Par Value: ')}<span className="font-mono font-bold text-slate-700 dark:text-slate-300">{fmtCurrency(parValue, true)}</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={10000}
                value={kittaCount}
                onChange={(e) => setKittaCount(Math.max(1, Number(e.target.value) || 1))}
                className="w-32 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono font-black text-blue-600 dark:text-blue-400 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                required
              />
              <div className="flex flex-wrap items-center gap-1.5">
                {[10, 25, 50, 100, 200, 500].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleKittaPreset(preset)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                      kittaCount === preset
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    +{fmtDigits(preset)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Live Valuation Box */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border border-emerald-200 dark:border-emerald-900/40">
            <div className="flex items-center justify-between text-xs">
              <span className="text-emerald-800 dark:text-emerald-300 font-bold">
                {t('कुल जम्मा भुक्तानी रकम:', 'Total Amount Payable:')}
              </span>
              <span className="text-xl font-black font-mono text-emerald-700 dark:text-emerald-400">
                {fmtCurrency(totalAmount, true)}
              </span>
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-500 mt-1 flex items-center justify-between">
              <span>{fmtCount(kittaCount)} {t('कित्ता', 'units')} × {fmtCurrency(parValue, true)}</span>
              <span>{t('नयाँ कुल सेयर:', 'New Total Equity:')} {fmtCurrency((selectedMember?.shareCapital || 0) + totalAmount, true)}</span>
            </div>
          </div>

          {/* Serial Number & Issue Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Award className="size-3.5 text-blue-600" />
                <span>{t('प्रमाणपत्र नम्बर *', 'Certificate Serial No. *')}</span>
              </label>
              <input
                type="text"
                value={certificateNo}
                onChange={(e) => setCertificateNo(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold text-slate-800 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Calendar className="size-3.5 text-blue-600" />
                <span>{t('जारी मिति (वि.सं.) *', 'Issue Date (B.S.) *')}</span>
              </label>
              <input
                type="text"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                placeholder="2081-11-15"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-medium"
                required
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <CreditCard className="size-3.5 text-blue-600" />
              <span>{t('भुक्तानी माध्यम *', 'Payment Method *')}</span>
            </label>

            <div className="grid grid-cols-3 gap-2">
              <label
                className={`flex items-center justify-center p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition ${
                  paymentMode === 'CASH'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMode"
                  value="CASH"
                  checked={paymentMode === 'CASH'}
                  onChange={() => setPaymentMode('CASH')}
                  className="sr-only"
                />
                <span>{t('काउन्टर नगद', 'Cash Counter')}</span>
              </label>

              <label
                className={`flex items-center justify-center p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition ${
                  paymentMode === 'SAVINGS_ACCOUNT'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMode"
                  value="SAVINGS_ACCOUNT"
                  checked={paymentMode === 'SAVINGS_ACCOUNT'}
                  onChange={() => setPaymentMode('SAVINGS_ACCOUNT')}
                  className="sr-only"
                />
                <span>{t('बचत खाता कट्टा', 'Savings Debit')}</span>
              </label>

              <label
                className={`flex items-center justify-center p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition ${
                  paymentMode === 'BANK_VOUCHER'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMode"
                  value="BANK_VOUCHER"
                  checked={paymentMode === 'BANK_VOUCHER'}
                  onChange={() => setPaymentMode('BANK_VOUCHER')}
                  className="sr-only"
                />
                <span>{t('बैंक भौचर / QR', 'Bank Slip / QR')}</span>
              </label>
            </div>

            {paymentMode === 'BANK_VOUCHER' && (
              <input
                type="text"
                value={paymentRef}
                onChange={(e) => setPaymentRef(e.target.value)}
                placeholder={t('बैंक भौचर / ट्रान्जेक्शन रेफरेन्स नम्बर...', 'Bank voucher / transaction reference no...')}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
              />
            )}
          </div>

          {/* Statutory Compliance Notice */}
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 flex items-start gap-2.5 text-[11px] text-amber-800 dark:text-amber-300">
            <AlertTriangle className="size-4 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <div className="font-bold">{t('सहकारी ऐन २०७४ दफा २४ पालना सूचना:', 'Cooperative Act 2074 Sec 24 Compliance:')}</div>
              <p className="mt-0.5">
                {t(
                  'सहकारी ऐन अनुसार कुनै एक सदस्यले सहकारीको कुल सेयर पुँजीको २० प्रतिशत भन्दा बढी सेयर धारण गर्न पाइने छैन। जारी पश्चात स्वतः साधारण सभा मताधिकार अभिलेखमा प्रविष्टि हुन्छ।',
                  'Under the Cooperative Act, no single member may hold more than 20% of total share capital. Allotment automatically updates AGM voting roll eligibility.'
                )}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition"
            >
              {t('रद्द गर्नुहोस्', 'Cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5 transition"
            >
              <CheckCircle2 className="size-4" />
              <span>{t('सेयर प्रमाणपत्र जारी गर्नुहोस्', 'Issue Certificate')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
