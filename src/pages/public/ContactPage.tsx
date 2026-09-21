import React, { useState } from 'react';
import { useCoopStore } from '../../store/useCoopStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { addInquiry, coopSettings } = useCoopStore();
  const { t } = useLanguageStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'Membership' as any,
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.message) return;

    addInquiry({
      name: formData.name,
      email: formData.email || 'not-provided@unako.coop',
      phone: formData.phone,
      category: formData.category,
      subject: formData.subject || 'General Inquiry',
      message: formData.message,
    });

    setSubmitted(true);
  };

  return (
    <div className="py-12 space-y-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {t('सम्पर्क तथा शाखा कार्यालयहरू', 'Contact & Branch Support')}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {t(
            'सदस्यता, मुद्दती बचत वा ऋण योग्यता सम्बन्धमा कुनै जिज्ञासा भएमा हाम्रा सहकारी अधिकृतहरूसँग प्रत्यक्ष कुरा गर्नुहोस् वा नजिकको सेवा केन्द्रमा पाल्नुहोस्।',
            'Have questions about membership, term deposits, or loan eligibility? Speak with our cooperative officers or visit any service center.'
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact info & branches */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl space-y-5">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
              <span>{t(coopSettings.nameNepali, coopSettings.name)}</span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                {t('मुख्य शाखा', 'Main Branch')}
              </span>
            </h3>
            <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex items-start gap-3">
                <MapPin className="size-5 text-emerald-600 dark:text-[#13ec37] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{t(coopSettings.nameNepali, coopSettings.name)}</p>
                  <p>{t(coopSettings.addressNepali || coopSettings.address, coopSettings.addressEnglish || coopSettings.address)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="size-5 text-emerald-600 dark:text-[#13ec37] shrink-0" />
                <a href={`tel:${coopSettings.phone.split('/')[0].trim()}`} className="hover:text-emerald-600 dark:hover:text-[#13ec37] transition-colors">{t(coopSettings.phone, coopSettings.phoneEnglish || coopSettings.phone)}</a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="size-5 text-emerald-600 dark:text-[#13ec37] shrink-0" />
                <a href={`mailto:${coopSettings.email}`} className="hover:text-emerald-600 dark:hover:text-[#13ec37] transition-colors">{coopSettings.email}</a>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="size-5 text-emerald-600 dark:text-[#13ec37] shrink-0" />
                <span>{t(coopSettings.openingHoursNepali || coopSettings.openingHours, coopSettings.openingHoursEnglish || coopSettings.openingHours)}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="glass-panel p-5 rounded-2xl space-y-3">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {t('लमही सेवा केन्द्र', 'Lamahi Service Center')}
              </h4>
              <p className="text-xs text-slate-500">{t('लमही बजार, लमही न.पा., दाङ', 'Lamahi Bazar, Lamahi Municipality, Dang')}</p>
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{t('फोन: ०८२-५४०१२२', 'Tel: 082-540122')}</p>
            </div>

            <div className="glass-panel p-5 rounded-2xl space-y-3">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                {t('सिसहनिया सेवा केन्द्र', 'Sisahaniya Service Center')}
              </h4>
              <p className="text-xs text-slate-500">{t('सिसहनिया चोक, राप्ती गा.पा., दाङ', 'Sisahaniya Chowk, Rapti Rural Municipality, Dang')}</p>
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{t('फोन: ०८२-५८०३३१', 'Tel: 082-580331')}</p>
            </div>
          </div>
        </div>

        {/* Inquiry Form */}
        <div className="glass-panel p-8 rounded-2xl">
          {submitted ? (
            <div className="text-center py-12 space-y-4">
              <div className="size-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-[#13ec37] flex items-center justify-center mx-auto">
                <CheckCircle2 className="size-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                {t('तपाईंको जिज्ञासा सफलतापूर्वक दर्ता भयो', 'Inquiry Submitted Successfully')}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                {t(
                  `धन्यवाद! तपाईंको सन्देश सहकारीको सहायता प्रणालीमा सुरक्षित गरिएको छ। हाम्रा अधिकृतले तपाईंलाई ${formData.phone} मा १ कार्यदिनभित्र सम्पर्क गर्नुहुनेछ।`,
                  `Thank you! Your message has been routed to our cooperative desk. Our officer will contact you at ${formData.phone} within 1 business day.`
                )}
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: '', email: '', phone: '', category: 'Membership', subject: '', message: '' });
                }}
                className="mt-4 px-6 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-white hover:bg-slate-200 transition-colors"
              >
                {t('अर्को सन्देश पठाउनुहोस्', 'Send Another Message')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {t('सहकारीमा सोधपुछ वा सुझाव पठाउनुहोस्', 'Send an Official Inquiry')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('तपाईंको सन्देश सिधै सहकारी प्रशासन टिकट प्रणालीमा दर्ता हुनेछ।', 'Submissions are logged directly into our CBS administration ticket queue.')}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {t('तपाईंको पूरा नाम *', 'Your Full Name *')}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={t('जस्तै: रमेश चौधरी', 'e.g. Ramesh Chaudhary')}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-xs text-slate-900 dark:text-white focus:outline-emerald-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {t('मोबाइल नम्बर *', 'Mobile Phone Number *')}
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder={t('+९७७-९८XXXXXXXX', '+977-98XXXXXXXX')}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-xs text-slate-900 dark:text-white focus:outline-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {t('इमेल ठेगाना', 'Email Address (Optional)')}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder={t('naam@example.com', 'name@example.com')}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-xs text-slate-900 dark:text-white focus:outline-emerald-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {t('विषय वर्ग *', 'Inquiry Category *')}
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-emerald-500"
                  >
                    <option value="Membership">{t('नयाँ सदस्यता', 'New Membership')}</option>
                    <option value="Loan Inquiry">{t('कर्जा तथा ऋण सुविधा', 'Loan Application')}</option>
                    <option value="Savings Scheme">{t('बचत तथा मुद्दती खाता', 'Savings & FD Schemes')}</option>
                    <option value="Grievance">{t('गुनासो तथा सुझाव', 'Grievance / Complaint')}</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t('सन्देश वा विवरण *', 'Your Message *')}
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder={t('आफ्नो जिज्ञासा वा आवश्यकता यहाँ लेख्नुहोस्...', 'Describe your query or feedback...')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-xs text-slate-900 dark:text-white focus:outline-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-md transition-all text-xs"
              >
                <Send className="size-4" />
                <span>{t('सन्देश पठाउनुहोस्', 'Submit Inquiry')}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
