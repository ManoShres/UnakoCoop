import React from 'react';
import { Member } from '../../../types';
import { useLanguageStore } from '../../../store/useLanguageStore';

interface LoanOriginationStep2GuarantorsProps {
  members: Member[];
  guarantor1Id: string;
  onGuarantor1IdChange: (id: string) => void;
  guarantor1?: Member;
  guarantor2Id: string;
  onGuarantor2IdChange: (id: string) => void;
  guarantor2?: Member;
}

export const LoanOriginationStep2Guarantors: React.FC<LoanOriginationStep2GuarantorsProps> = ({
  members,
  guarantor1Id,
  onGuarantor1IdChange,
  guarantor1,
  guarantor2Id,
  onGuarantor2IdChange,
  guarantor2,
}) => {
  const { t, fmtCurrency, fmtDigits, fmtPhone } = useLanguageStore();

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          {t('२. जमानी बस्ने २ जना सक्रिय सहकारी सदस्यहरू', '2. Dual Member Co-Guarantors')}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t(
            'सहकारी मापदण्ड अनुसार कर्जा सुरक्षणका लागि कम्तीमा २ जना राम्रो वित्तीय छवि भएका सदस्य जमानी अनिवार्य हुन्छ।',
            'Cooperative standards mandate 2 active members with sound credit history as co-guarantors.'
          )}
        </p>
      </div>

      {/* Guarantor 1 */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
        <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
          <span>{t('पहिलो जमानीकर्ता सदस्य *', 'First Co-Guarantor *')}</span>
          {guarantor1 && (
            <span className="text-[11px] font-mono text-emerald-600 font-bold">
              {fmtDigits(guarantor1.memberNo)}
            </span>
          )}
        </div>
        <select
          value={guarantor1Id}
          onChange={(e) => onGuarantor1IdChange(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
        >
          <option value="">{t('-- सदस्य छान्नुहोस् --', '-- Select Member --')}</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {t(m.nameNepali || m.name, m.name)} ({fmtDigits(m.memberNo)}) • {t('फोन:', 'Phone: ')}{fmtPhone(m.phone)} • {t('बचत:', 'Savings: ')}{fmtCurrency(m.totalSavings, true)}
            </option>
          ))}
        </select>
        {guarantor1 && (
          <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <div className="text-[10px] text-slate-400">{t('ठेगाना', 'Address')}</div>
              <div className="font-medium text-slate-700 dark:text-slate-300 truncate">
                {fmtDigits(t(guarantor1.addressNepali || guarantor1.address, guarantor1.address))}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400">{t('बचत रकम', 'Savings')}</div>
              <div className="font-bold text-emerald-600 font-mono">{fmtCurrency(guarantor1.totalSavings, true)}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400">{t('क्रेडिट स्कोर', 'Score')}</div>
              <div className="font-bold text-blue-600 font-mono">{fmtDigits(guarantor1.creditScore)}</div>
            </div>
          </div>
        )}
      </div>

      {/* Guarantor 2 */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
        <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
          <span>{t('दोस्रो जमानीकर्ता सदस्य *', 'Second Co-Guarantor *')}</span>
          {guarantor2 && (
            <span className="text-[11px] font-mono text-emerald-600 font-bold">
              {fmtDigits(guarantor2.memberNo)}
            </span>
          )}
        </div>
        <select
          value={guarantor2Id}
          onChange={(e) => onGuarantor2IdChange(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
        >
          <option value="">{t('-- सदस्य छान्नुहोस् --', '-- Select Member --')}</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {t(m.nameNepali || m.name, m.name)} ({fmtDigits(m.memberNo)}) • {t('फोन:', 'Phone: ')}{fmtPhone(m.phone)} • {t('बचत:', 'Savings: ')}{fmtCurrency(m.totalSavings, true)}
            </option>
          ))}
        </select>
        {guarantor2 && (
          <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <div className="text-[10px] text-slate-400">{t('ठेगाना', 'Address')}</div>
              <div className="font-medium text-slate-700 dark:text-slate-300 truncate">
                {fmtDigits(t(guarantor2.addressNepali || guarantor2.address, guarantor2.address))}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400">{t('बचत रकम', 'Savings')}</div>
              <div className="font-bold text-emerald-600 font-mono">{fmtCurrency(guarantor2.totalSavings, true)}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400">{t('क्रेडिट स्कोर', 'Score')}</div>
              <div className="font-bold text-blue-600 font-mono">{fmtDigits(guarantor2.creditScore)}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
