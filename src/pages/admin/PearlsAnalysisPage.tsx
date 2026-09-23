import React, { useMemo, useState } from 'react';
import { useCoopStore } from '../../store/useCoopStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { calculatePearlsAnalysis } from '../../utils/pearlsAnalysis';
import { toNepaliDigits } from '../../utils/nepaliDate';
import {
  Landmark,
  Percent,
  ShieldAlert,
  TrendingUp,
  Layers,
  Activity,
  Gauge,
} from 'lucide-react';

const PERIOD_PRESETS = [
  { id: 'CURRENT', ne: 'हालको अवस्था', en: 'Current Position' },
  { id: '6M', ne: 'पछिल्लो ६ महिना', en: 'Last 6 Months' },
  { id: '12M', ne: 'पछिल्लो १२ महिना', en: 'Last 12 Months' },
] as const;

type PeriodPreset = (typeof PERIOD_PRESETS)[number]['id'];

export const PearlsAnalysisPage: React.FC = () => {
  const { t } = useLanguageStore();
  const {
    members,
    savings,
    loans,
    tradingTransactions,
    motherGroupDeposits,
  } = useCoopStore();
  const [preset, setPreset] = useState<PeriodPreset>('CURRENT');

  // Date window applied to the trend series only (balances stay point-in-time).
  const trendMonths = preset === '12M' ? 12 : 6;

  const analysis = useMemo(
    () =>
      calculatePearlsAnalysis({
        members,
        savings,
        loans,
        tradingTransactions,
        motherGroupDeposits,
        period: preset === 'CURRENT' ? 'Current Position' : `Last ${trendMonths} Months`,
        periodNepali: preset === 'CURRENT' ? 'हालको अवस्था' : `पछिल्लो ${trendMonths} महिना`,
      }),
    [members, savings, loans, tradingTransactions, motherGroupDeposits, preset, trendMonths]
  );

  const { breakdown, riskMetrics, totalAssets, trends } = analysis;
  const maxTrend = Math.max(...trends.map((point) => point.total), 1);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 font-bold mb-1">
            <Landmark className="size-4" />
            <span>{t('पर्ल्स सुपरिवेक्षण विश्लेषण', 'PEARLS SUPERVISION ANALYSIS')}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('PEARLS सम्पत्ति संरचना तथा जोखिम विश्लेषण', 'PEARLS Asset Composition & Risk Analytics')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t(
              'संस्थाको पैसा कहाँ कति प्रतिशतमा छ भन्ने सम्पत्ति वितरण विश्लेषण, साख जोखिम मापदण्ड र वृद्धि प्रवृत्ति।',
              'Percentage distribution of where cooperative funds are held, plus portfolio-at-risk supervision metrics and growth trends.'
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
          {PERIOD_PRESETS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setPreset(option.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                preset === option.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
              }`}
            >
              {t(option.ne, option.en)}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-5 text-white shadow-md">
          <div className="flex items-center gap-2 text-blue-100 text-xs font-bold mb-2">
            <Layers className="size-4" />
            <span>{t('कुल व्यवस्थित सम्पत्ति', 'TOTAL MANAGED ASSETS')}</span>
          </div>
          <div className="text-2xl font-black tracking-tight">{fmtCurrency(totalAssets, true)}</div>
          <div className="text-xs text-blue-100 mt-1">
            {t('नेपालीमा', 'In Devanagari')}: {fmtCurrency(totalAssets, true)}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-bold mb-2">
            <ShieldAlert className="size-4 text-rose-500" />
            <span>{t('जोखिममा रहेको साख (PAR)', 'PORTFOLIO AT RISK')}</span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {riskMetrics.portfolioAtRiskPercent.toFixed(2)}%
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {fmtCurrency(riskMetrics.portfolioAtRisk, true)} · {riskMetrics.totalDelinquentLoans}{' '}
            {t('ऋण', 'loans')}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-bold mb-2">
            <Percent className="size-4 text-emerald-500" />
            <span>{t('साख असुली दर', 'LOAN REPAYMENT RATE')}</span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {riskMetrics.repaymentRate.toFixed(2)}%
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {riskMetrics.totalActiveLoans} {t('सक्रिय ऋण खाता', 'active loan accounts')}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-bold mb-2">
            <Gauge className="size-4 text-violet-500" />
            <span>{t('बचत/ऋण अनुपात', 'SAVINGS TO LOAN RATIO')}</span>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {riskMetrics.savingsToLoanRatio.toFixed(2)}%
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {t('औसत ऋण आकार', 'Average loan size')}: {fmtCurrency(riskMetrics.averageLoanSize, true)}
          </div>
        </div>
      </div>

      {/* Asset composition: donut + legend */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-4">
            {t('सम्पत्ति वितरण चक्र', 'ASSET DISTRIBUTION')}
          </div>
          <PearlsDonut breakdown={breakdown} total={totalAssets} />
          <div className="text-center mt-4">
            <div className="text-[11px] text-slate-400">{t('कुल सम्पत्ति', 'Total assets')}</div>
            <div className="text-sm font-black text-slate-900 dark:text-white">
              {fmtCurrency(totalAssets, true)}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 mb-4">
            <Activity className="size-4 text-blue-500" />
            <span>{t('पैसा कहाँ छ? प्रतिशत विवरण', 'WHERE THE MONEY IS HELD — PERCENTAGE BREAKDOWN')}</span>
          </div>

          <div className="space-y-3">
            {breakdown.map((item) => (
              <div key={item.category}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="size-3 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-bold text-slate-700 dark:text-slate-200">
                      {t(item.categoryNepali, item.category)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 font-mono">
                    <span className="text-slate-500 dark:text-slate-400">
                      {fmtCurrency(item.amount, true)}
                    </span>
                    <span className="font-black text-slate-900 dark:text-white w-16 text-right">
                      {item.percentage.toFixed(2)}%
                    </span>
                  </div>
                </div>
                <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(item.percentage, 100)}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>


      {/* Rolling asset growth trend */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
            <TrendingUp className="size-4 text-emerald-500" />
            <span>{t('सम्पत्ति वृद्धि प्रवृत्ति', 'ASSET GROWTH TREND')}</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm bg-emerald-600" />
              {t('बचत', 'Savings')}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm bg-blue-600" />
              {t('ऋण', 'Loans')}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm bg-amber-600" />
              {t('सेयर', 'Shares')}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm bg-pink-600" />
              {t('समूह संकलन', 'Group collections')}
            </span>
          </div>
        </div>

        <div className="flex items-end justify-between gap-3 h-56">
          {trends.map((point) => (
            <div key={point.label} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex flex-col-reverse h-44 rounded-lg overflow-hidden bg-slate-50 dark:bg-slate-800/60">
                <div
                  className="w-full bg-pink-600"
                  style={{ height: `${(point.deposits / maxTrend) * 100}%` }}
                  title={`${t('समूह संकलन', 'Group collections')}: ${fmtCurrency(point.deposits, true)}`}
                />
                <div
                  className="w-full bg-amber-600"
                  style={{ height: `${(point.shares / maxTrend) * 100}%` }}
                  title={`${t('सेयर', 'Shares')}: ${fmtCurrency(point.shares, true)}`}
                />
                <div
                  className="w-full bg-blue-600"
                  style={{ height: `${(point.loans / maxTrend) * 100}%` }}
                  title={`${t('ऋण', 'Loans')}: ${fmtCurrency(point.loans, true)}`}
                />
                <div
                  className="w-full bg-emerald-600"
                  style={{ height: `${(point.savings / maxTrend) * 100}%` }}
                  title={`${t('बचत', 'Savings')}: ${fmtCurrency(point.savings, true)}`}
                />
              </div>
              <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 text-center leading-tight">
                {point.label}
              </div>
              <div className="text-[10px] font-mono text-slate-400">
                {toNepaliDigits(Math.round(point.total / 1000))}k
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface PearlsDonutProps {
  breakdown: { category: string; amount: number; percentage: number; color: string }[];
  total: number;
}

/**
 * Dependency-free SVG donut chart. Each slice is drawn as a stroked arc using
 * stroke-dasharray, so no charting library is required.
 */
const PearlsDonut: React.FC<PearlsDonutProps> = ({ breakdown, total }) => {
  const size = 190;
  const strokeWidth = 30;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;
  const slices = breakdown
    .filter((item) => item.amount > 0)
    .map((item) => {
      const length = (item.percentage / 100) * circumference;
      const slice = { ...item, length, offset };
      offset += length;
      return slice;
    });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img">
      <title>{`Total assets: ${total}`}</title>
      <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-slate-100 dark:stroke-slate-800"
        />
        {slices.map((slice) => (
          <circle
            key={slice.category}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={slice.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${slice.length} ${circumference - slice.length}`}
            strokeDashoffset={-slice.offset}
          />
        ))}
      </g>
      <text
        x="50%"
        y="47%"
        textAnchor="middle"
        className="fill-slate-400 text-[10px] font-bold"
      >
        PEARLS
      </text>
      <text
        x="50%"
        y="58%"
        textAnchor="middle"
        className="fill-slate-900 dark:fill-white text-[11px] font-black"
      >
        {slices.length} {slices.length === 1 ? 'POOL' : 'POOLS'}
      </text>
    </svg>
  );
};

