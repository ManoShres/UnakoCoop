import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Printer,
  Download,
  Users,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Coins,
  Calendar,
  Building,
} from 'lucide-react';
import { useLanguageStore } from '../../../store/useLanguageStore';
import type { MotherGroup, MotherGroupMember, MotherGroupMeeting, Loan } from '../../../types';
import {
  generateMeetingLedger,
  calculateLedgerSummary,
  downloadMeetingLedgerCsv,
  MeetingLedgerRow,
  MeetingAttendanceStatus,
} from '../../../utils/motherGroupLedger';

interface MotherGroupMeetingLedgerModalProps {
  isOpen: boolean;
  onClose: () => void;
  meeting: MotherGroupMeeting | null;
  group: MotherGroup | null;
  members: MotherGroupMember[];
  loans: Loan[];
}

export const MotherGroupMeetingLedgerModal: React.FC<MotherGroupMeetingLedgerModalProps> = ({
  isOpen,
  onClose,
  meeting,
  group,
  members,
  loans,
}) => {
  const { t, fmtCurrency } = useLanguageStore();

  const [ledgerRows, setLedgerRows] = useState<MeetingLedgerRow[]>([]);

  // Initialize or re-generate ledger rows when meeting or group changes
  useEffect(() => {
    if (group && isOpen) {
      const generated = generateMeetingLedger(group, members, loans);
      setLedgerRows(generated);
    }
  }, [group, members, loans, isOpen]);

  const summary = useMemo(() => calculateLedgerSummary(ledgerRows), [ledgerRows]);

  if (!isOpen || !meeting || !group) return null;

  const handleAttendanceChange = (rowId: string, status: MeetingAttendanceStatus) => {
    setLedgerRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, attendance: status } : r))
    );
  };

  const handlePaidToggle = (rowId: string) => {
    setLedgerRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, isPaid: !r.isPaid } : r))
    );
  };

  const handlePaymentModeChange = (
    rowId: string,
    mode: 'CASH' | 'QR_PAYMENT' | 'SAVINGS_TRANSFER'
  ) => {
    setLedgerRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, paymentMode: mode } : r))
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    downloadMeetingLedgerCsv(group, ledgerRows, summary, meeting.meetingDate);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-500/20">
              <FileSpreadsheet className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                {t('मातृ समूह बैठक लेजर तथा किस्ता संकलन', 'Mother Group Meeting & Repayment Ledger')}
                <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                  {group.groupCode || 'MG'}
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t(group.nameNepali || group.name, group.name)} • {group.location} • {t('मिति', 'Date')}: {meeting.meetingDate}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
            >
              <Printer className="size-4 text-slate-500" />
              {t('प्रिन्ट', 'Print')}
            </button>
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl hover:bg-emerald-100 transition-colors shadow-sm"
            >
              <Download className="size-4" />
              {t('CSV निर्यात', 'Export CSV')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Meeting Metadata & Summary Stats */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 shadow-sm">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
                <Users className="size-4 text-blue-500" />
                <span>{t('उपस्थिति दर', 'Attendance Rate')}</span>
              </div>
              <div className="text-xl font-black text-slate-900 dark:text-white">
                {summary.attendanceRatePercent}%
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {summary.presentCount} / {summary.totalMembers} {t('उपस्थित', 'present')}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 shadow-sm">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
                <Coins className="size-4 text-emerald-500" />
                <span>{t('संकलन संक्षेप', 'Total Collected')}</span>
              </div>
              <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                {fmtCurrency(summary.grandTotalCollected, true)}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {t('लक्ष्य', 'Target')}: {fmtCurrency(summary.grandTotalExpected, true)} ({summary.collectionRatePercent}%)
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 shadow-sm">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
                <Building className="size-4 text-purple-500" />
                <span>{t('अनिवार्य बचत', 'Mandatory Savings')}</span>
              </div>
              <div className="text-xl font-black text-purple-600 dark:text-purple-400 font-mono">
                {fmtCurrency(summary.totalMandatorySavings, true)}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {t('मासिक रु.', 'Monthly Rs.')} {group.mandatoryContributionPerMember || 500}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 shadow-sm">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
                <Calendar className="size-4 text-amber-500" />
                <span>{t('ऋण सावाँ र ब्याज', 'Loan Principal & Int.')}</span>
              </div>
              <div className="text-xl font-black text-amber-600 dark:text-amber-400 font-mono">
                {fmtCurrency(summary.totalLoanPrincipal + summary.totalLoanInterest, true)}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {t('सावाँ', 'Prin')}: {fmtCurrency(summary.totalLoanPrincipal, true)} | {t('ब्याज', 'Int')}: {fmtCurrency(summary.totalLoanInterest, true)}
              </div>
            </div>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="flex-1 overflow-auto p-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 dark:bg-slate-800/80 font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                <tr>
                  <th className="px-3 py-3 w-10 text-center">#</th>
                  <th className="px-3 py-3">{t('सदस्यको नाम / नं.', 'Member Name & No')}</th>
                  <th className="px-3 py-3 text-center">{t('उपस्थिति', 'Attendance')}</th>
                  <th className="px-3 py-3 text-right">{t('अनिवार्य बचत', 'Mandatory')}</th>
                  <th className="px-3 py-3 text-right">{t('ऋण किस्ता (सावाँ+ब्याज)', 'Loan EMI (Prin+Int)')}</th>
                  <th className="px-3 py-3 text-right">{t('कुल बुझाउनुपर्ने', 'Total Due')}</th>
                  <th className="px-3 py-3 text-center">{t('भुक्तानी', 'Payment Status')}</th>
                  <th className="px-3 py-3 text-center">{t('माध्यम', 'Mode')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                {ledgerRows.map((row, idx) => (
                  <tr
                    key={row.id}
                    className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors ${
                      !row.isPaid ? 'opacity-70 bg-amber-50/30 dark:bg-amber-950/10' : ''
                    }`}
                  >
                    <td className="px-3 py-3 text-center font-mono text-slate-400">{idx + 1}</td>
                    <td className="px-3 py-3">
                      <div className="font-bold text-slate-900 dark:text-white">{row.memberName}</div>
                      <div className="text-[11px] font-mono text-slate-500">{row.memberNo}</div>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <select
                        aria-label={t('उपस्थिति चयन गर्नुहोस्', 'Select attendance')}
                        value={row.attendance}
                        onChange={(e) =>
                          handleAttendanceChange(row.id, e.target.value as MeetingAttendanceStatus)
                        }
                        className="text-xs py-1 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium"
                      >
                        <option value="PRESENT">{t('उपस्थित (P)', 'Present (P)')}</option>
                        <option value="ABSENT">{t('अनुपस्थित (A)', 'Absent (A)')}</option>
                        <option value="REPRESENTATIVE">{t('प्रतिनिधि (R)', 'Rep (R)')}</option>
                      </select>
                    </td>
                    <td className="px-3 py-3 text-right font-mono font-medium text-slate-700 dark:text-slate-300">
                      {fmtCurrency(row.mandatorySavings, true)}
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-slate-700 dark:text-slate-300">
                      {row.loanPrincipalDue > 0 || row.loanInterestDue > 0 ? (
                        <span>
                          {fmtCurrency(row.loanPrincipalDue + row.loanInterestDue, true)}
                          <span className="block text-[10px] text-slate-400">
                            (P: {fmtCurrency(row.loanPrincipalDue, true)} + I: {fmtCurrency(row.loanInterestDue, true)})
                          </span>
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                      {fmtCurrency(row.totalPayable, true)}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => handlePaidToggle(row.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors ${
                          row.isPaid
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 hover:bg-emerald-200'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 hover:bg-rose-200'
                        }`}
                      >
                        {row.isPaid ? (
                          <>
                            <CheckCircle2 className="size-3" />
                            {t('चुक्ता (PAID)', 'PAID')}
                          </>
                        ) : (
                          <>
                            <AlertCircle className="size-3" />
                            {t('बाँकी (DUE)', 'DUE')}
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <select
                        aria-label={t('भुक्तानी माध्यम चयन गर्नुहोस्', 'Select payment mode')}
                        value={row.paymentMode}
                        onChange={(e) =>
                          handlePaymentModeChange(
                            row.id,
                            e.target.value as 'CASH' | 'QR_PAYMENT' | 'SAVINGS_TRANSFER'
                          )
                        }
                        disabled={!row.isPaid}
                        className="text-[11px] py-1 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium disabled:opacity-50"
                      >
                        <option value="CASH">{t('नगद', 'Cash')}</option>
                        <option value="QR_PAYMENT">{t('QR भुक्तानी', 'QR Pay')}</option>
                        <option value="SAVINGS_TRANSFER">{t('बचत रकमान्तर', 'Transfer')}</option>
                      </select>
                    </td>
                  </tr>
                ))}
                {ledgerRows.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      {t('यस समूहमा कुनै सदस्य फेला परेन।', 'No members found in this group.')}
                    </td>
                  </tr>
                )}
              </tbody>
              {ledgerRows.length > 0 && (
                <tfoot className="bg-slate-100 dark:bg-slate-800/90 font-bold border-t border-slate-200 dark:border-slate-700">
                  <tr>
                    <td colSpan={3} className="px-3 py-3 text-right">
                      {t('कुल जम्मा:', 'Grand Total:')}
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-purple-600 dark:text-purple-400">
                      {fmtCurrency(summary.totalMandatorySavings, true)}
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-amber-600 dark:text-amber-400">
                      {fmtCurrency(summary.totalLoanPrincipal + summary.totalLoanInterest, true)}
                    </td>
                    <td className="px-3 py-3 text-right font-mono text-emerald-600 dark:text-emerald-400 text-sm">
                      {fmtCurrency(summary.grandTotalCollected, true)}
                    </td>
                    <td colSpan={2} className="px-3 py-3 text-center text-slate-500 font-medium text-[11px]">
                      {t('संकलन दर', 'Collection Rate')}: {summary.collectionRatePercent}%
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="text-xs text-slate-500">
            {t('सहजकर्ता', 'Mobilizer')}: <span className="font-bold text-slate-700 dark:text-slate-300">{meeting.conductedByName || meeting.conductedBy}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-slate-800 dark:bg-slate-700 rounded-xl hover:bg-slate-700 dark:hover:bg-slate-600 transition-colors shadow-sm"
          >
            {t('बन्द गर्नुहोस्', 'Close')}
          </button>
        </div>
      </div>
    </div>
  );
};
