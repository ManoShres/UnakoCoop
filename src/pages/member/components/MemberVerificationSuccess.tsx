import React from 'react';
import { CheckCircle2, Clock, ExternalLink } from 'lucide-react';
import { Member } from '../../../types';
import { useLanguageStore } from '../../../store/useLanguageStore';

interface MemberVerificationSuccessProps {
  submittedData: {
    member: Member;
    refNo: string;
  };
  onReset: () => void;
  onOpenAdminQueue: () => void;
}

export function MemberVerificationSuccess({
  submittedData,
  onReset,
  onOpenAdminQueue,
}: MemberVerificationSuccessProps) {
  const { fmtCurrency } = useLanguageStore();

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-6">
      <div className="size-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto ring-8 ring-emerald-50 dark:ring-emerald-950/30">
        <CheckCircle2 className="size-9" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 uppercase tracking-wider">
          Application Pending CBS Staff Review
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          Membership Application Submitted!
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Your KYC documentation has been received into the Unako Central CBS queue. Cooperative verification officers in Gadhwa will review your citizenship records.
        </p>
      </div>

      {/* Application Details Receipt Card */}
      <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-5 text-left border border-slate-200 dark:border-slate-700/60 space-y-3">
        <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-700">
          <span className="text-xs text-slate-500">Tracking Reference No:</span>
          <span className="font-mono text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
            {submittedData.refNo}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-slate-400 block">Applicant Name:</span>
            <span className="font-bold text-slate-900 dark:text-white">{submittedData.member.name}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Citizenship No:</span>
            <span className="font-bold font-mono text-slate-900 dark:text-white">{submittedData.member.citizenshipNo}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Registered Mobile:</span>
            <span className="font-bold text-slate-900 dark:text-white">{submittedData.member.phone}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Share Pledge:</span>
            <span className="font-bold text-emerald-600">NPR {fmtCurrency(submittedData.member.shareCapital, true)}</span>
          </div>
        </div>
      </div>

      {/* Next Steps Guide */}
      <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-left text-xs text-blue-900 dark:text-blue-300 space-y-1.5">
        <p className="font-bold flex items-center gap-1.5">
          <Clock className="size-4 text-blue-600 dark:text-blue-400" />
          Estimated Review Timeline: 24 - 48 Hours
        </p>
        <p className="text-[11px] text-blue-800 dark:text-blue-300">
          Once staff verifies your citizenship, you will receive an SMS alert with your permanent Member Passbook Number and initial account PIN.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          type="button"
          onClick={onReset}
          className="flex-1 py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          Submit Another Application
        </button>
        <button
          type="button"
          onClick={onOpenAdminQueue}
          className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <ExternalLink className="size-4" />
          <span>Open Staff Review Queue (Admin Demo)</span>
        </button>
      </div>
    </div>
  );
}
