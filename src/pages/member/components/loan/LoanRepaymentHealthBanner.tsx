import React from 'react';
import { Leaf, Award, CheckCircle2 } from 'lucide-react';
import { useLanguageStore } from '../../../../store/useLanguageStore';

export const LoanRepaymentHealthBanner: React.FC = () => {
  const { t } = useLanguageStore();

  return (
    <div className="bg-surface-card rounded-2xl p-6 shadow-sm relative overflow-hidden border border-outline-variant/15">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-status-success/10 flex items-center justify-center text-status-success shrink-0 shadow-xs">
            <Leaf className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-headline text-base sm:text-lg text-on-surface font-bold">
                {t('१००% समयमै किस्ता भुक्तानी स्कोर', '100% On-Time Honor Score')}
              </h3>
              <span className="bg-status-success/15 text-status-success font-label-sm text-xs px-2.5 py-0.5 rounded-full font-bold">
                Grade A+
              </span>
            </div>
            <p className="font-body-sm text-xs text-on-surface-variant mt-1 leading-relaxed">
              {t(
                'तपाईं नेपाल कृषि मन्त्रालयको १.५% ब्याज अनुदानका लागि योग्य हुनुहुन्छ। हालसम्म प्राप्त छुट:',
                'You qualify for the Nepal Ministry of Agriculture 1.5% interest subsidy. Cumulative rebate earned to date: '
              )}
              <strong className="text-on-surface font-bold">NPR 4,120</strong>
              {t(', जुन तपाईंको नियमित बचत खातामा जम्मा भइसकेको छ।', ', credited to your Regular Savings.')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-surface-container-low px-4 py-2.5 rounded-xl border border-outline-variant/20 shrink-0">
          <Award className="w-5 h-5 text-status-success" />
          <span className="font-label-md text-xs font-bold text-on-surface">
            {t('अनुदानित ब्याजदर: ७.०%', 'Subsidized Rate: 7.0%')}
          </span>
        </div>
      </div>
    </div>
  );
};
