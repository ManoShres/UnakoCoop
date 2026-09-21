import React, { useState } from 'react';
import { useCoopStore } from '../../store/useCoopStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { Badge } from '../../components/ui/Badge';
import { MessageSquareQuote, Send } from 'lucide-react';

export const InquiryManagementPage: React.FC = () => {
  const { inquiries, replyToInquiry } = useCoopStore();
  const { t } = useLanguageStore();
  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const selectedInq = inquiries.find((i) => i.id === selectedInquiryId);

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInquiryId || !replyText.trim()) return;

    replyToInquiry(selectedInquiryId, replyText);
    setReplyText('');
    setSelectedInquiryId(null);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">
          {t('सदस्य सोधपुछ तथा सहायता डेस्क', 'Member Inquiries & Support Desk')}
        </h1>
        <p className="text-xs text-slate-500">
          {t(
            'सार्वजनिक सम्पर्क सोधपुछ, कर्जा दर परामर्श र सदस्य गुनासो व्यवस्थापन।',
            'Manage public contact inquiries, loan rate requests, and member support tickets.'
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* List */}
        <div className="space-y-3">
          {inquiries.map((inq) => (
            <div
              key={inq.id}
              onClick={() => setSelectedInquiryId(inq.id)}
              className={`glass-panel p-4 rounded-2xl cursor-pointer transition-all ${
                selectedInquiryId === inq.id
                  ? 'border-blue-500 ring-2 ring-blue-500/20'
                  : 'hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-900 dark:text-white">{inq.name}</span>
                <Badge status={inq.status} size="sm" />
              </div>
              <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">{inq.subject}</h4>
              <p className="text-[11px] text-slate-500 line-clamp-2">{inq.message}</p>
              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span>{t('श्रेणी:', 'Category:')} {inq.category}</span>
                <span>{inq.date}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Reply Box */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          {selectedInq ? (
            <div className="space-y-4">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{selectedInq.subject}</h3>
                  <Badge status={selectedInq.status} size="sm" />
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
                  <span>{selectedInq.name}</span>
                  <span>{selectedInq.phone}</span>
                  <span>{selectedInq.email}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {selectedInq.message}
              </div>

              {selectedInq.reply && (
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-900 dark:text-emerald-200">
                  <span className="font-bold block mb-1">{t('अघिल्लो जवाफ / कैफियत:', 'Previous Officer Reply:')}</span>
                  {selectedInq.reply}
                </div>
              )}

              <form onSubmit={handleReply} className="space-y-3">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {t('सदस्यलाई आधिकारिक प्रत्युत्तर पठाउनुहोस्', 'Send Response to Member (SMS & Email Dispatch)')}
                </label>
                <textarea
                  rows={4}
                  required
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={t('यहाँ आधिकारिक जवाफ टाइप गर्नुहोस्...', 'Type official response here...')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-xs text-slate-900 dark:text-white"
                ></textarea>

                <button
                  type="submit"
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider"
                >
                  <Send className="size-3.5" />
                  <span>{t('पठाउनुहोस् र समाधान भएको चिन्ह लगाउनुहोस्', 'Send & Mark Resolved')}</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="text-center py-16 text-slate-400 space-y-2">
              <MessageSquareQuote className="size-10 mx-auto opacity-40" />
              <p className="text-xs">
                {t(
                  'विस्तृत विवरण हेर्न र जवाफ पठाउन बायाँ सूचीबाट सोधपुछ छान्नुहोस्।',
                  'Select an inquiry from the left to read details and dispatch a response.'
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
