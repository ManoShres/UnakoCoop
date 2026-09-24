import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, ClipboardList, UserCheck } from 'lucide-react';
import { useLanguageStore } from '../../../store/useLanguageStore';

interface AgmAttendanceSectionProps {
  onAttendanceConfirmed?: () => void;
  onProxySubmitted?: () => void;
}

export function AgmAttendanceSection({ onAttendanceConfirmed, onProxySubmitted }: AgmAttendanceSectionProps) {
  const { t } = useLanguageStore();
  const [activeTab, setActiveTab] = useState<'self' | 'proxy'>('self');

  return (
    <div className="bg-surface-card rounded-2xl shadow-sm overflow-hidden" id="attendance-section">
      <div className="p-space-lg bg-surface-container-low flex flex-col md:flex-row md:items-center justify-between gap-space-md">
        <div>
          <span className="font-label-sm text-label-sm text-primary font-bold uppercase tracking-wider">
            {t('डिजिटल सहभागिता सुविधा', 'Digital Participation')}
          </span>
          <h3 className="font-headline-md text-headline-md font-bold text-on-surface mt-0.5">
            {t('साधारण सभा डिजिटल उपस्थिति वा प्रतिनिधि दर्ता', 'AGM Digital Attendance or Proxy Registration')}
          </h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            {t(
              'यदि तपाई भौतिक रूपमा उपस्थित हुन असमर्थ हुनुहुन्छ भने आफ्नो तर्फबाट आधिकारिक प्रतिनिधिको नाम दर्ता गर्नुहोस् वा अनलाइन उपस्थिति जनाउनुहोस्।',
              'If you are unable to attend in person, register your authorized proxy or record your digital attendance online.'
            )}
          </p>
        </div>
        {/* Segmented Plan Switcher */}
        <div className="bg-surface-dark-card p-1 rounded-xl flex items-center self-start md:self-auto">
          <button
            onClick={() => setActiveTab('self')}
            className={`px-space-md py-space-xs rounded-lg font-label-sm text-label-sm font-bold transition-all ${
              activeTab === 'self' ? 'bg-primary text-on-primary' : 'text-slate-300 hover:text-surface-canvas'
            }`}
            id="tab-self-attendance"
            type="button"
          >
            {t('स्वयं अनलाइन उपस्थिति', 'Self Online Attendance')}
          </button>
          <button
            onClick={() => setActiveTab('proxy')}
            className={`px-space-md py-space-xs rounded-lg font-label-sm text-label-sm font-bold transition-all ${
              activeTab === 'proxy' ? 'bg-primary text-on-primary' : 'text-slate-300 hover:text-surface-canvas'
            }`}
            id="tab-proxy-register"
            type="button"
          >
            {t('प्रतिनिधि चयन', 'Select Proxy')}
          </button>
        </div>
      </div>

      {/* Self Attendance View */}
      {activeTab === 'self' && (
        <div className="p-space-lg md:p-space-xl" id="view-self">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
            <div className="space-y-space-xs">
              <label className="font-label-sm text-label-sm font-semibold text-on-surface">
                {t('सदस्यको नाम', 'Member Name')}
              </label>
              <input
                className="w-full h-12 px-space-md bg-surface-canvas rounded-xl font-label-md text-label-md text-on-surface font-semibold"
                disabled={true}
                type="text"
                value="Hari Prasad Chaudhary"
              />
              <p className="text-xs text-on-surface-variant">
                {t('लगइन गरिएको खाताबाट स्वतः भरिएको', 'Auto-filled from logged-in account')}
              </p>
            </div>
            <div className="space-y-space-xs">
              <label className="font-label-sm text-label-sm font-semibold text-on-surface">
                {t('सदस्यता नम्बर', 'Member ID')}
              </label>
              <input
                className="w-full h-12 px-space-md bg-surface-canvas rounded-xl font-tabular-mono text-tabular-mono text-on-surface font-semibold"
                disabled={true}
                type="text"
                value="UKO-2070-08842"
              />
              <p className="text-xs text-on-surface-variant">
                {t('शाखा: चैनपुर, गढवा-५, दाङ', 'Branch: Chainpur, Gadhwa-5, Dang')}
              </p>
            </div>
            <div className="space-y-space-xs">
              <label className="font-label-sm text-label-sm font-semibold text-on-surface">
                {t('सम्पर्क मोबाइल', 'Verified Mobile')}
              </label>
              <input
                className="w-full h-12 px-space-md bg-surface-canvas rounded-xl font-tabular-mono text-tabular-mono text-on-surface font-semibold"
                disabled={true}
                type="text"
                value="98478***** (Verified)"
              />
              <p className="text-xs text-status-success font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />{' '}
                {t('OTP प्रमाणीकरण तयार', 'OTP Verification Ready')}
              </p>
            </div>
          </div>
          <div className="mt-space-lg pt-space-md flex flex-col sm:flex-row items-center justify-between gap-space-md">
            <div className="flex items-center gap-space-sm text-sm text-on-surface-variant">
              <input
                defaultChecked={true}
                className="w-5 h-5 rounded text-primary focus:ring-primary"
                id="consent-self"
                type="checkbox"
              />
              <label className="font-body-sm text-body-sm" htmlFor="consent-self">
                {t(
                  'म चैत्र २५ गते आयोजना हुने ३१औं वार्षिक साधारण सभामा भर्चुअल माध्यमबाट उपस्थित हुने पुष्टि गर्दछु।',
                  'I confirm my virtual participation in the 31st AGM scheduled for Chaitra 25.'
                )}
              </label>
            </div>
            <button
              onClick={onAttendanceConfirmed}
              className="w-full sm:w-auto bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-bold px-space-xl py-space-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-space-xs"
              type="button"
            >
              <UserCheck className="w-5 h-5" />
              <span>{t('डिजिटल उपस्थिति दर्ता सुरक्षित गर्नुहोस्', 'Confirm Digital Attendance')}</span>
            </button>
          </div>
        </div>
      )}

      {/* Proxy Registration View */}
      {activeTab === 'proxy' && (
        <div className="p-space-lg md:p-space-xl" id="view-proxy">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-lg">
            <div className="space-y-space-xs">
              <label className="font-label-sm text-label-sm font-semibold text-on-surface">
                {t('प्रतिनिधिको सदस्यता नं.', 'Proxy Member No.')}
              </label>
              <input
                className="w-full h-12 px-space-md bg-surface-canvas rounded-xl font-label-md text-label-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder={t('जस्तै: UKO-२०७२-०१९२३', 'e.g. UKO-2072-01923')}
                type="text"
              />
              <p className="text-xs text-on-surface-variant">
                {t('प्रतिनिधि अनिवार्य रूपमा संस्थाको सेयर सदस्य हुनुपर्दछ।', 'Proxy must be a registered share member of the cooperative.')}
              </p>
            </div>
            <div className="space-y-space-xs">
              <label className="font-label-sm text-label-sm font-semibold text-on-surface">
                {t('प्रतिनिधिको पूरा नाम', 'Proxy Full Name')}
              </label>
              <input
                className="w-full h-12 px-space-md bg-surface-canvas rounded-xl font-label-md text-label-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder={t('नागरिकता अनुसारको नाम', 'Name as per Citizenship')}
                type="text"
              />
              <p className="text-xs text-on-surface-variant">
                {t('नागरिकता वा सदस्यता कार्डसँग मेल खानुपर्ने', 'Must match Citizenship or Member ID card')}
              </p>
            </div>
            <div className="space-y-space-xs">
              <label className="font-label-sm text-label-sm font-semibold text-on-surface">
                {t('सम्बन्ध / समूह', 'Relationship / Group')}
              </label>
              <select className="w-full h-12 px-space-md bg-surface-canvas rounded-xl font-label-md text-label-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary">
                <option>{t('पारिवारिक एकाघर सदस्य', 'Immediate Family Member')}</option>
                <option>{t('स्थानीय बचत समूह सदस्य', 'Local SHG Group Member')}</option>
                <option>{t('अन्य सेयर सदस्य', 'Other Shareholder Member')}</option>
              </select>
              <p className="text-xs text-on-surface-variant">
                {t('सहकारी ऐनको सीमा भित्र रहने गरी', 'Within Cooperative Act statutory limits')}
              </p>
            </div>
          </div>
          <div className="mt-space-lg pt-space-md flex flex-col sm:flex-row items-center justify-between gap-space-md">
            <p className="font-body-sm text-body-sm text-status-warning font-semibold flex items-center gap-1">
              <AlertTriangle className="w-4.5 h-4.5" />
              {t('एक सदस्यले बढीमा ३ जनाको मात्र प्रोक्सी प्रतिनिधित्व गर्न पाउने कानुनी व्यवस्था छ।', 'Statutory rule: A single member may represent a maximum of 3 proxies.')}
            </p>
            <button
              onClick={onProxySubmitted}
              className="w-full sm:w-auto bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md font-bold px-space-xl py-space-sm rounded-xl transition-all shadow-sm flex items-center justify-center gap-space-xs"
              type="button"
            >
              <ClipboardList className="w-5 h-5" />
              <span>{t('प्रोक्सी अधिकारपत्र पेस गर्नुहोस्', 'Submit Proxy Authorization')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
