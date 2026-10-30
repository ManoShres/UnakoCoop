import React, { useMemo } from 'react';
import { Banknote, CheckCircle2, AlertTriangle, RotateCcw, ArrowDownCircle } from 'lucide-react';
import {
  NRB_DENOMINATIONS,
  NrbDenomination,
  DenominationCountMap,
  calculateDenominations,
  validateDenominationMatch,
} from '../../utils/cashDenominationEngine';

interface CashDenominationTallyProps {
  counts: DenominationCountMap;
  onChangeCounts: (newCounts: DenominationCountMap) => void;
  targetAmount?: number;
  onApplyAmount?: (calculatedTotal: number) => void;
}

export const CashDenominationTally: React.FC<CashDenominationTallyProps> = ({
  counts,
  onChangeCounts,
  targetAmount,
  onApplyAmount,
}) => {
  const { lines, grandTotal, totalNotes, activeDenominationsCount } = useMemo(
    () => calculateDenominations(counts),
    [counts]
  );

  const matchStatus = useMemo(() => {
    if (typeof targetAmount !== 'number' || targetAmount <= 0) return null;
    return validateDenominationMatch(counts, targetAmount);
  }, [counts, targetAmount]);

  const handleCountChange = (denom: NrbDenomination, rawVal: string) => {
    const parsed = parseInt(rawVal, 10);
    const newCount = isNaN(parsed) || parsed <= 0 ? undefined : parsed;

    // Strict immutability
    const nextCounts: DenominationCountMap = { ...counts };
    if (newCount === undefined) {
      delete nextCounts[denom];
    } else {
      nextCounts[denom] = newCount;
    }
    onChangeCounts(nextCounts);
  };

  const handleReset = () => {
    onChangeCounts({});
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-white text-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Banknote className="size-4 text-emerald-400" />
          <h4 className="font-bold text-white text-xs">नगद गद्दी गणना (Cash Denomination Tally)</h4>
        </div>
        <div className="flex items-center gap-2">
          {activeDenominationsCount > 0 && (
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-300 transition cursor-pointer"
            >
              <RotateCcw className="size-3" />
              <span>रिसेट</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid of NRB notes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 py-3">
        {lines.map((line) => (
          <div
            key={line.denomination}
            className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
              line.count > 0
                ? 'bg-emerald-950/30 border-emerald-700/60'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-1.5 min-w-[70px]">
              <span className="font-mono font-bold text-slate-300 text-[11px]">
                रु. {line.denomination}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-slate-500">×</span>
              <input
                type="number"
                min="0"
                value={counts[line.denomination] ?? ''}
                onChange={(e) => handleCountChange(line.denomination, e.target.value)}
                placeholder="०"
                className="w-14 px-1.5 py-1 text-center font-mono font-bold bg-slate-950 border border-slate-700 rounded text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="text-right min-w-[65px]">
              <span className="font-mono text-[11px] font-bold text-emerald-400">
                रु. {line.subtotal.toLocaleString('ne-NP')}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Footer */}
      <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-[10px] text-slate-400 block">कुल नोट संख्या:</span>
            <span className="font-mono font-bold text-slate-200 text-xs">
              {totalNotes} थान
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block">गद्दी कुल रकम (Grand Total):</span>
            <span className="font-mono font-black text-sm text-emerald-400">
              रु. {grandTotal.toLocaleString('ne-NP', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Validation / Action button */}
        <div className="flex items-center gap-2">
          {matchStatus && (
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border ${
                matchStatus.matches
                  ? 'bg-emerald-950/60 border-emerald-600 text-emerald-300'
                  : 'bg-amber-950/60 border-amber-600 text-amber-300'
              }`}
            >
              {matchStatus.matches ? (
                <>
                  <CheckCircle2 className="size-3.5" />
                  <span>रकम दुरुस्त मिल्यो</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="size-3.5" />
                  <span>
                    {matchStatus.isShort
                      ? `रु. ${Math.abs(matchStatus.diff).toLocaleString('ne-NP')} कम`
                      : `रु. ${Math.abs(matchStatus.diff).toLocaleString('ne-NP')} बढी`}
                  </span>
                </>
              )}
            </div>
          )}

          {onApplyAmount && grandTotal > 0 && (
            <button
              type="button"
              onClick={() => onApplyAmount(grandTotal)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition shadow cursor-pointer"
            >
              <ArrowDownCircle className="size-3.5" />
              <span>रकममा भर्नुहोस्</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

