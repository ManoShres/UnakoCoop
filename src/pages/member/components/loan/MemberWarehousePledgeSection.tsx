import React, { useState } from 'react';
import {
  Warehouse,
  Wheat,
  Coins,
  ShieldCheck,
  TrendingUp,
  Printer,
  Calendar,
  Layers,
  ChevronRight,
  Info,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useLanguageStore } from '../../../../store/useLanguageStore';
import { useCoopStore } from '../../../../store/useCoopStore';
import { useAuthStore } from '../../../../store/useAuthStore';
import { printElement } from '../../../../utils/printHelper';
import { COMMODITY_CATALOG } from '../../../../utils/warehouseReceiptEngine';

export const MemberWarehousePledgeSection: React.FC = () => {
  const { t, fmtCurrency, fmtDigits } = useLanguageStore();
  const currentMember = useAuthStore((s) => s.currentMember);
  const { warehouseReceipts, warehousePledgeLoans } = useCoopStore();

  const [selectedReceiptId, setSelectedReceiptId] = useState<string | null>(null);

  // If member has specific receipts, filter by memberId, or show demo receipts for member 1
  const effectiveMemberId = currentMember?.id || 'mem-1';
  const myReceipts = warehouseReceipts.filter(
    (r) => r.memberId === effectiveMemberId || r.memberId === 'mem-1'
  );

  const totalMyQuintals = myReceipts.reduce((sum, r) => sum + r.netWeightQuintals, 0);
  const totalMyValuation = myReceipts.reduce((sum, r) => sum + r.totalMarketValuation, 0);

  const activeMyLoans = warehousePledgeLoans.filter(
    (l) => l.memberId === effectiveMemberId || l.memberId === 'mem-1'
  );
  const totalLoanDisbursed = activeMyLoans.reduce((sum, l) => sum + l.principalDisbursed, 0);

  const handlePrintReceipt = (receiptNo: string) => {
    printElement(`whr-member-print-${receiptNo}`, {
      format: 'a4',
      title: `Warehouse-Receipt-${receiptNo}`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Value Proposition Hero */}
      <div className="p-6 rounded-3xl bg-linear-to-r from-amber-500/15 via-amber-500/5 to-transparent border border-amber-500/20 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white">
                {t('अन्न गोदाम रसिद कर्जा', 'Warehouse Receipt Loan')}
              </span>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                {t('वार्षिक ८.५% सहुलियतपूर्ण कृषि दर', '8.5% p.a. Concessional Agri Rate')}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {t('अन्न भण्डारण गर्नुहोस्, तुरुन्तै ७०% सम्म कर्जा पाउनुहोस्', 'Store Your Harvest, Borrow Up to 70% Instant Cash')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              {t(
                'कटनीलगत्तै सस्तो मूल्यमा अन्न बेच्नुपर्ने बाध्यता अन्त्य! सहकारीको गढवा मुख्य गोदाममा अन्न सुरक्षित राख्नुहोस्, तत्काल धितो कर्जा लिनुहोस् र सिजनको उच्च मूल्यमा बेचेर नाफा कमाउनुहोस्।',
                'Avoid post-harvest distress selling! Store paddy, mustard, and maize in the cooperative silo, unlock instant liquidity up to 70% LTV, and capture peak off-season market profits.'
              )}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-amber-500/30 text-center shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">{t('भण्डारित उपज', 'Stored Grain')}</span>
              <span className="text-xl font-black text-amber-600 dark:text-amber-400">
                {fmtDigits(totalMyQuintals)} <span className="text-xs font-normal">Qtl</span>
              </span>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-500/30 text-center shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">{t('बजार मूल्याङ्कन', 'Valuation')}</span>
              <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                {fmtCurrency(totalMyValuation)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Receipts List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Wheat className="size-5 text-amber-500" />
            {t('तपाईंको भण्डारित अन्न गोदाम रसिदहरू', 'Your Stored Warehouse Receipts')}
          </h4>
          <span className="text-xs font-mono text-slate-500">
            {t('कुल रसिद संख्या:', 'Total Receipts:')} {fmtDigits(myReceipts.length)}
          </span>
        </div>

        {myReceipts.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-dashed border-outline/20 space-y-2">
            <Warehouse className="size-8 mx-auto text-slate-400" />
            <p className="text-xs text-slate-500">
              {t('तपाईंको नाममा हाल कुनै अन्न भण्डारण गरिएको छैन।', 'No warehouse receipts found for your account.')}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myReceipts.map((receipt) => {
              const loan = warehousePledgeLoans.find((l) => l.receiptId === receipt.id && l.status === 'ACTIVE');
              const spec = COMMODITY_CATALOG[receipt.commodity];

              return (
                <div
                  key={receipt.id}
                  className="p-5 rounded-3xl bg-surface-canvas border border-outline/20 hover:border-amber-500/40 transition-all shadow-sm space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                          {receipt.receiptNo}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            receipt.status === 'PLEDGED'
                              ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                              : receipt.status === 'STORED'
                              ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                              : 'bg-emerald-500/10 text-emerald-600'
                          }`}
                        >
                          {receipt.status === 'PLEDGED'
                            ? t('धितोमा (कर्जा चालू)', 'Pledge Loan Active')
                            : receipt.status === 'STORED'
                            ? t('भण्डारित (कर्जा लिन सकिने)', 'Stored (Loan Ready)')
                            : t('बिक्री मिलान सम्पन्न', 'Sold & Liquidated')}
                        </span>
                      </div>
                      <h4 className="text-base font-black text-slate-900 dark:text-white mt-1">
                        {receipt.varietyName}
                      </h4>
                      <p className="text-xs text-slate-500">{receipt.storageLocation}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-black font-mono text-slate-900 dark:text-white">
                        {fmtDigits(receipt.netWeightQuintals)} <span className="text-xs font-normal">Qtl</span>
                      </span>
                      <p className="text-[10px] text-slate-400">({fmtDigits(receipt.bagCount)} बोरा)</p>
                    </div>
                  </div>

                  {/* Quality & Valuation Details */}
                  <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-surface-elevated/40 border border-outline/10 text-xs font-mono">
                    <div>
                      <span className="text-slate-400 text-[10px] block">{t('गुणस्तर स्तर', 'Grade')}</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {receipt.qualityInspection.grade} ({receipt.qualityInspection.moisturePercent}% नमी)
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">{t('बजार मूल्याङ्कन', 'Valuation')}</span>
                      <span className="font-bold">{fmtCurrency(receipt.totalMarketValuation)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] block">{t('७०% कर्जा योग्यता', 'Max Loan')}</span>
                      <span className="font-bold text-amber-500">{fmtCurrency(receipt.maxEligiblePledgeLoanAmount)}</span>
                    </div>
                  </div>

                  {/* Active Loan Details Banner */}
                  {loan && (
                    <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-blue-600 dark:text-blue-400">
                          {t('सक्रिय कृषि धितो कर्जा:', 'Active Pledge Loan:')} {loan.loanNo}
                        </span>
                        <span className="font-mono font-black text-slate-900 dark:text-white">
                          {fmtCurrency(loan.principalDisbursed)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>{t('ब्याज दर: ८.५% वार्षिक', 'Interest: 8.5% p.a.')}</span>
                        <span>{t('भुक्तानी म्याद:', 'Due:')} {loan.dueDate}</span>
                      </div>
                    </div>
                  )}

                  {/* Off-season Profit Potential Tip */}
                  <div className="p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/15 flex items-start gap-2.5 text-[11px] text-slate-600 dark:text-slate-300">
                    <Sparkles className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                    <p>
                      {t(
                        `अफ-सिजनमा मूल्य प्रति क्विन्टल रु. ४,१०० सम्म पुग्दा तपाईंलाई करिब रु. ${Math.round(receipt.netWeightQuintals * (4100 - receipt.effectiveRatePerQuintal)).toLocaleString()} थप नाफा हुने अनुमान छ।`,
                        `Holding until off-season peak (est. NPR 4,100/Qtl) projects an estimated net surplus gain of +NPR ${Math.round(receipt.netWeightQuintals * (4100 - receipt.effectiveRatePerQuintal)).toLocaleString()}!`
                      )}
                    </p>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between pt-1 border-t border-outline/10 text-xs">
                    <span className="text-[11px] text-slate-400">
                      {t('म्याद:', 'Valid Until:')} {receipt.expiryDate}
                    </span>
                    <button
                      onClick={() => handlePrintReceipt(receipt.receiptNo)}
                      className="px-3 py-1.5 rounded-xl border border-outline/20 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Printer className="size-3.5" />
                      {t('रसिद प्रिन्ट', 'Print WHR')}
                    </button>
                  </div>

                  {/* Hidden Printable Document */}
                  <div id={`whr-member-print-${receipt.receiptNo}`} className="hidden print:block p-8 bg-white text-black">
                    <div className="text-center border-b pb-4 mb-4">
                      <h2 className="text-xl font-bold uppercase">उनको बचत तथा ऋण सहकारी संस्था लि.</h2>
                      <p className="text-xs">गढवा-५, दाङ • दर्ता नं: १२९०/०६७/०६८ • PAN: ३००१२४८९०</p>
                      <h3 className="text-sm font-bold mt-2 underline">ई-अन्न गोदाम रसिद प्रमाणपत्र</h3>
                    </div>
                    <div className="text-xs space-y-2 font-mono">
                      <p><strong>रसिद नं:</strong> {receipt.receiptNo}</p>
                      <p><strong>किसान सदस्य:</strong> {receipt.memberName} ({receipt.memberNo})</p>
                      <p><strong>बाली तथा जात:</strong> {receipt.varietyName} ({receipt.storageLocation})</p>
                      <p><strong>परिमाण:</strong> {receipt.netWeightQuintals} क्विन्टल ({receipt.bagCount} बोरा)</p>
                      <p><strong>गुणस्तर:</strong> स्तर {receipt.qualityInspection.grade} (नमी: {receipt.qualityInspection.moisturePercent}%)</p>
                      <p><strong>बजार मूल्याङ्कन:</strong> रु. {receipt.totalMarketValuation.toLocaleString()}</p>
                      <p><strong>७०% धितो कर्जा सीमा:</strong> रु. {receipt.maxEligiblePledgeLoanAmount.toLocaleString()}</p>
                      <p><strong>भण्डारण मिति:</strong> {receipt.depositDate} • म्याद: {receipt.expiryDate}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
