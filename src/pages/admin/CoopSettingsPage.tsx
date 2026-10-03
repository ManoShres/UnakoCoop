import React, { useState } from 'react';
import { useCoopStore } from '../../store/useCoopStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { AppearanceSettingsTab } from '../../components/admin/appearance/AppearanceSettingsTab';
import {
  Settings,
  Building2,
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Sliders,
  AlertTriangle,
  Palette,
} from 'lucide-react';

export function CoopSettingsPage() {
  const { coopSettings, updateCoopSettings } = useCoopStore();
  const { t } = useLanguageStore();
  const [activeTab, setActiveTab] = useState<'organization' | 'appearance'>('appearance');
  const [toast, setToast] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState(coopSettings.name);
  const [nameNepali, setNameNepali] = useState(coopSettings.nameNepali);
  const [regNo, setRegNo] = useState(coopSettings.regNo);
  const [panNo, setPanNo] = useState(coopSettings.panNo);
  const [address, setAddress] = useState(coopSettings.address);
  const [phone, setPhone] = useState(coopSettings.phone);
  const [email, setEmail] = useState(coopSettings.email);
  const [hours, setHours] = useState(coopSettings.openingHours);
  const [status, setStatus] = useState(coopSettings.operatingStatus);

  const showToastMsg = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateCoopSettings({
      name,
      nameNepali,
      regNo,
      panNo,
      address,
      phone,
      email,
      openingHours: hours,
      operatingStatus: status,
    });
    showToastMsg(
      t(
        'सहकारी संस्थागत विवरण तथा प्रणाली मापदण्ड सफलतापूर्वक सुरक्षित भयो!',
        'Cooperative Organization details & system parameters saved!'
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-primary/40 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="size-5 text-emerald-400" />
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-primary font-bold mb-1">
            <Settings className="size-4" />
            <span>{t('केन्द्रीय प्रणाली कन्फिगरेसन तथा सीएमएस', 'GLOBAL SYSTEM CONFIGURATION & CMS')}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('सहकारी संस्थागत विवरण तथा प्रणाली सेटिङ्स', 'Cooperative Settings & App CMS')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t(
              'संस्थागत दर्ता विवरण, सम्पर्क सूचना, रूपरेखा, रङ, र प्रणाली सुविधा नियन्त्रण व्यवस्थापन।',
              'Configure institutional registration, brand colors, themes, logo, and member feature switches.'
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-bold flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-800">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse"></span>
            {t('सीबीएस प्रणाली सक्रिय', 'CBS Core Online')}
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-px">
        <button
          type="button"
          onClick={() => setActiveTab('appearance')}
          className={`flex items-center gap-2 px-5 py-2.5 font-bold text-xs sm:text-sm rounded-t-xl border-b-2 transition-all cursor-pointer ${
            activeTab === 'appearance'
              ? 'border-primary text-primary bg-primary/5 dark:bg-primary/10'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Palette className="size-4" />
          <span>{t('रूपरेखा तथा सुविधाहरू', 'Appearance & Features')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('organization')}
          className={`flex items-center gap-2 px-5 py-2.5 font-bold text-xs sm:text-sm rounded-t-xl border-b-2 transition-all cursor-pointer ${
            activeTab === 'organization'
              ? 'border-primary text-primary bg-primary/5 dark:bg-primary/10'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Building2 className="size-4" />
          <span>{t('संस्थागत दर्ता विवरण', 'Organization Details')}</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'appearance' ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <AppearanceSettingsTab />
        </div>
      ) : (
        /* Main Settings Form */
        <form onSubmit={handleSaveSettings} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Building2 className="size-4 text-primary" />
              <span>{t('संस्थागत पहिचान तथा दर्ता विवरण', 'Institutional Identity & Registration')}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('सहकारीको आधिकारिक नाम (अंग्रेजीमा)', 'Cooperative Legal Name (English)')}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('संस्थाको नाम (नेपालीमा)', 'Cooperative Legal Name (Nepali)')}
                </label>
                <input
                  type="text"
                  value={nameNepali}
                  onChange={(e) => setNameNepali(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('सहकारी दर्ता प्रमाणपत्र नम्बर', 'Cooperative Registration Number')}
                </label>
                <input
                  type="text"
                  value={regNo}
                  onChange={(e) => setRegNo(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('स्थायी लेखा नम्बर', 'PAN / Tax Registration Number')}
                </label>
                <input
                  type="text"
                  value={panNo}
                  onChange={(e) => setPanNo(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('केन्द्रीय कार्यालयको ठेगाना', 'Central Office Registered Address')}
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Phone className="size-4 text-primary" />
              <span>{t('सम्पर्क विवरण तथा कार्यालय समय', 'Contact Information & Hours')}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('आधिकारिक फोन नम्बर', 'Official Telephone / Mobile')}
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('आधिकारिक इमेल ठेगाना', 'Official Email Address')}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('नियमित कार्यालय समय', 'Standard Business Hours')}
                </label>
                <input
                  type="text"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <Sliders className="size-4 text-primary" />
              <span>{t('प्रणाली सञ्चालन नियन्त्रण स्विच', 'Operational Control Switch')}</span>
            </h3>

            <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900 dark:text-white text-xs">
                  {t('प्रणाली मोड:', 'System Mode: ')}
                  {status === 'NORMAL'
                    ? t('नियमित २४/७ सञ्चालन', 'Standard 24/7 Operations')
                    : t('तालिकाबद्ध मर्मत विन्डो', 'Scheduled Maintenance Window')}
                </div>
                <div className="text-[11px] text-slate-400">
                  {t(
                    'मर्मत मोडमा सबै सदस्य कारोबारहरू सुरक्षित रूपमा लगत मिलानका लागि लामबद्ध हुन्छन्',
                    'In maintenance mode, all client transactions are safely queued for reconciliation'
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStatus(status === 'NORMAL' ? 'MAINTENANCE' : 'NORMAL')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
                  status === 'NORMAL'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-amber-600 text-white shadow-xs'
                }`}
              >
                {status === 'NORMAL' ? t('सामान्य', 'NORMAL') : t('मर्मतमा', 'MAINTENANCE')}
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="size-4" />
              <span>{t('सहकारी सेटिङ्स सुरक्षित गर्नुहोस्', 'Save Cooperative Settings')}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
