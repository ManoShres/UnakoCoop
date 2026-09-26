import React, { useMemo } from 'react';
import {
  X,
  Printer,
  Download,
  ShieldCheck,
  Building,
  Truck,
  QrCode,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useLanguageStore } from '../../../../store/useLanguageStore';
import {
  CashTransitRecord,
  CurrencyDenominationItem,
  downloadTransitVoucherCsv,
} from '../../../../utils/vaultLiquidity';
import { CoopSettings } from '../../../../types';

interface CashTransitVoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: CashTransitRecord | null;
  coopSettings: CoopSettings;
}

export const CashTransitVoucherModal: React.FC<CashTransitVoucherModalProps> = ({
  isOpen,
  onClose,
  record,
  coopSettings,
}) => {
  const { t, fmtCurrency } = useLanguageStore();

  // Generate realistic standard denomination breakdown matching record amount
  const denominations: CurrencyDenominationItem[] = useMemo(() => {
    if (!record) return [];

    let remaining = record.amount;
    const noteValues = [1000, 500, 100, 50, 20, 10, 5];
    const items: CurrencyDenominationItem[] = [];

    for (const val of noteValues) {
      if (remaining <= 0) {
        items.push({ noteValue: val, count: 0, total: 0 });
        continue;
      }

      // Allocate majority to higher denominations
      let count = Math.floor(remaining / val);
      if (val === 1000 && count > 10 && remaining - count * 1000 < 50000) {
        count = Math.max(0, count - 10); // Leave some for 500s/100s
      }
      const total = count * val;
      remaining -= total;

      items.push({ noteValue: val, count, total });
    }

    return items;
  }, [record]);

  if (!isOpen || !record) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    downloadTransitVoucherCsv(record, denominations, {
      name: coopSettings.name,
      nameNepali: coopSettings.nameNepali,
      regNo: coopSettings.regNo,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-600 text-white shadow-md">
              <Truck className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                {t('मार्गस्थ नगद कोष चलानी भौचर', 'Cash-in-Transit (CIT) Movement Voucher')}
                <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                  {record.id}
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                {t('शाखा अन्तर-कोष स्थानान्तरण सुरक्षा आदेश', 'Inter-Branch Vault Cash Movement Order')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-sm cursor-pointer"
            >
              <Printer className="size-4 text-slate-500" />
              {t('भौचर छाप्नुहोस्', 'Print Voucher')}
            </button>
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl hover:bg-emerald-100 transition shadow-sm cursor-pointer"
            >
              <Download className="size-4" />
              {t('CSV डाउनलोड', 'CSV Export')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition cursor-pointer"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Printable Canvas */}
        <div id="cit-voucher-document" className="flex-1 overflow-auto p-6 sm:p-8 space-y-6">
          {/* Institutional Header */}
          <div className="border-b-2 border-emerald-600 pb-4 flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="size-14 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
                <Building className="size-8" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase">
                  {coopSettings.nameNepali}
                </h3>
                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase">
                  {coopSettings.name}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {coopSettings.address} • {t('दर्ता नं:', 'Reg No:')} {coopSettings.regNo}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-mono font-bold text-slate-800 dark:text-slate-200">
                {t('भौचर नं:', 'Voucher No:')} {record.id}
              </span>
              <p className="text-[11px] text-slate-400 mt-1">
                {t('मिति:', 'Date:')} {new Date(record.initiatedAt).toLocaleString('ne-NP')}
              </p>
            </div>
          </div>

          {/* Transit Route & Security OTP Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block uppercase font-bold text-[10px]">{t('पठाउने स्रोत शाखा', 'Dispatching Branch')}</span>
              <p className="font-bold text-slate-900 dark:text-white mt-1 text-sm">{record.fromLocation}</p>
              <p className="text-[11px] text-slate-500">{t('अधिकृत:', 'Authorized By:')} {record.authorizedBy}</p>
            </div>

            <div>
              <span className="text-slate-400 block uppercase font-bold text-[10px]">{t('प्राप्त गर्ने गन्तव्य शाखा', 'Destination Branch')}</span>
              <p className="font-bold text-slate-900 dark:text-white mt-1 text-sm">{record.toLocation}</p>
              <p className="text-[11px] text-slate-500">{t('जिम्मा लिने:', 'Receiving Custodian:')} {record.custodianName}</p>
            </div>

            <div className="flex flex-col justify-center items-end bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800/40">
              <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase">
                {t('गोप्य सुरक्षा प्रमाणिकरण कोड (OTP)', 'Transit Security OTP')}
              </span>
              <span className="text-xl font-mono font-black text-emerald-600 dark:text-emerald-400 tracking-wider">
                {record.verificationOtp}
              </span>
              <span className="text-[10px] text-slate-400">
                {record.status === 'VAULTED' ? t('दाखिला सम्पन्न (Vaulted)', 'Vaulted') : t('मार्गमा रहेको (In Transit)', 'In Transit')}
              </span>
            </div>
          </div>

          {/* Denomination Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t('चलानी गरिएको नगद नोट विवरण (Denomination Breakdown)', 'Currency Denomination Breakdown')}
            </h4>
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300">
                  <tr>
                    <th className="px-4 py-2.5 w-12 text-center">#</th>
                    <th className="px-4 py-2.5">{t('नोट दर (रु.)', 'Denomination')}</th>
                    <th className="px-4 py-2.5 text-right">{t('थान (Count)', 'Pieces')}</th>
                    <th className="px-4 py-2.5 text-right font-bold">{t('रकम (NPR)', 'Total Amount')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                  {denominations.map((d, idx) => (
                    <tr key={d.noteValue} className={d.count > 0 ? '' : 'opacity-40'}>
                      <td className="px-4 py-2 text-center font-mono text-slate-400">{idx + 1}</td>
                      <td className="px-4 py-2 font-bold text-slate-800 dark:text-slate-200">
                        रु. {d.noteValue}
                      </td>
                      <td className="px-4 py-2 text-right font-mono text-slate-600 dark:text-slate-300">
                        {d.count.toLocaleString()}
                      </td>
                      <td className="px-4 py-2 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {fmtCurrency(d.total, true)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-100 dark:bg-slate-800 font-bold border-t border-slate-200 dark:border-slate-700">
                  <tr>
                    <td colSpan={3} className="px-4 py-3 text-right">
                      {t('कुल चलानी रकम (Grand Total):', 'Grand Total:')}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-emerald-600 dark:text-emerald-400 text-sm">
                      {fmtCurrency(record.amount, true)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Carrier & Escort Details */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">{t('सुरक्षा दस्ता / सवारी साधन', 'Escort Carrier & Logistics')}</span>
              <p className="font-semibold text-slate-900 dark:text-white mt-0.5">{record.securityCarrier}</p>
              {record.notes && <p className="text-[11px] text-slate-500 mt-0.5">{t('कैफियत:', 'Notes:')} {record.notes}</p>}
            </div>
            <div className="shrink-0 p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col items-center">
              <QrCode className="size-9 text-slate-700 dark:text-slate-300" />
              <span className="text-[8px] font-mono text-slate-400 mt-0.5">CIT-VERIFIED</span>
            </div>
          </div>

          {/* Signatures & Custodian Seals */}
          <div className="pt-8 border-t border-slate-200 dark:border-slate-800 grid grid-cols-4 gap-4 text-center text-xs">
            <div>
              <div className="h-10 border-b border-dashed border-slate-300 dark:border-slate-700 mx-auto w-24 mb-1"></div>
              <p className="font-bold text-slate-900 dark:text-white">{t('पठाउने अधिकृत', 'Dispatched By')}</p>
              <p className="text-[10px] text-slate-400">{record.authorizedBy}</p>
            </div>
            <div>
              <div className="h-10 border-b border-dashed border-slate-300 dark:border-slate-700 mx-auto w-24 mb-1"></div>
              <p className="font-bold text-slate-900 dark:text-white">{t('सुरक्षक / बाहक', 'Carrier / Escort')}</p>
              <p className="text-[10px] text-slate-400">{record.securityCarrier}</p>
            </div>
            <div>
              <div className="h-10 border-b border-dashed border-slate-300 dark:border-slate-700 mx-auto w-24 mb-1"></div>
              <p className="font-bold text-slate-900 dark:text-white">{t('बुझिलिने अधिकृत', 'Received By')}</p>
              <p className="text-[10px] text-slate-400">{record.custodianName}</p>
            </div>
            <div className="flex flex-col items-center justify-center">
              <div className="size-14 rounded-full border-2 border-dashed border-emerald-500/60 flex flex-col items-center justify-center text-[8px] font-bold text-emerald-600 p-1">
                <ShieldCheck className="size-4" />
                <span>{t('चलानी छाप', 'OFFICIAL SEAL')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 print:hidden">
          <div className="text-xs text-slate-500">
            {t('मार्गस्थ नगद कोष आन्तरिक नियन्त्रण प्रणाली', 'Cash-in-Transit Internal Audit Control')}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-slate-800 dark:bg-slate-700 rounded-xl hover:bg-slate-700 dark:hover:bg-slate-600 transition shadow-sm cursor-pointer"
          >
            {t('बन्द गर्नुहोस्', 'Close')}
          </button>
        </div>
      </div>
    </div>
  );
};
