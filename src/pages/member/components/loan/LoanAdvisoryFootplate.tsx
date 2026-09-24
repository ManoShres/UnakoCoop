import React from 'react';
import { Headphones, ShieldCheck, PhoneCall } from 'lucide-react';
import { useLanguageStore } from '../../../../store/useLanguageStore';

export const LoanAdvisoryFootplate: React.FC = () => {
  const { t } = useLanguageStore();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-surface-card rounded-2xl p-5 shadow-sm border border-outline-variant/15 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-xs">
          <Headphones className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-sm sm:text-base font-bold text-on-surface font-headline">
            {t('तोकिएको फिल्ड ऋण अधिकृत', 'Assigned Field Loan Officer')}
          </h4>
          <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
            Bikram Thapa (Chainpur Dairy Liaison Desk)
          </p>
          <p className="font-label-sm text-xs text-primary font-bold mt-1 flex items-center gap-1.5">
            <PhoneCall className="w-3.5 h-3.5" />
            Direct: +977 98578-23412 • Gadhwa Service Center
          </p>
        </div>
      </div>
      <div className="bg-surface-card rounded-2xl p-5 shadow-sm border border-outline-variant/15 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-status-success/10 flex items-center justify-center text-status-success shrink-0 shadow-xs">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-sm sm:text-base font-bold text-on-surface font-headline">
            {t('सहकारी निक्षेप तथा कर्जा सुरक्षण', 'Cooperative Deposit & Credit Guarantee')}
          </h4>
          <p className="font-body-sm text-xs text-on-surface-variant mt-0.5">
            Cattle Tagged: DCGF-GDH-2080-9941 with Livestock Insurance
          </p>
          <span className="font-label-sm text-xs text-status-success font-bold mt-1 inline-block">
            {t('नेपाल कृषि बीमा योजना अन्तर्गत १००% बीमित', '100% Insured under Nepal Agri Insurance Scheme')}
          </span>
        </div>
      </div>
    </div>
  );
};
