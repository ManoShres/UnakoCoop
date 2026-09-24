import React from 'react';
import { Check, Clock, Download, GitBranch, Headset, MessageCircle, MessageSquare, Paperclip, Send, X } from 'lucide-react';
import { useLanguageStore } from '../../../store/useLanguageStore';

interface GrievanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GrievanceModal({ isOpen, onClose }: GrievanceModalProps) {
  const { t } = useLanguageStore();

  if (!isOpen) return null;

  return (
    <div onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-space-sm sm:p-space-md bg-surface-dark/80 backdrop-blur-sm overflow-y-auto" id="grievance-tracker-modal">
          <div className="relative w-full max-w-2xl bg-surface-card rounded-2xl shadow-xl overflow-hidden my-auto border border-surface-container">
            <div className="bg-surface-dark text-surface-canvas p-space-md sm:p-space-lg flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-space-xs">
                  <Headset className="w-5 h-5 text-brand-accent-lime" />
                  <span className="font-label-sm text-label-sm text-brand-accent-lime font-bold uppercase tracking-wide">{t('सदस्य गुनासो तथा सुनुवाइ ट्र्याकर', 'Member Grievance & Helpdesk Status Tracker')}</span>
                </div>
                <h3 className="font-headline-sm text-headline-sm font-bold text-surface-canvas">{t('सदस्य गुनासो तथा हेल्पडेस्क स्थिति ट्र्याकर', 'Member Grievance & Helpdesk Status Tracker')}</h3>
                <p className="font-body-sm text-body-sm text-slate-300">{t('पारदर्शी छानबिन प्रक्रिया, प्रत्यक्ष अधिकारी टिप्पणी र स्थिति अनुगमन', 'Transparent audit process, direct officer notes, and SLA tracking')}</p>
              </div>
              <button onClick={onClose} className="p-space-xs rounded-full hover:bg-surface-dark-card text-slate-300 hover:text-surface-canvas transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-space-md sm:p-space-lg space-y-space-md overflow-y-auto max-h-[75vh]">
              <div className="bg-surface-container-low p-space-md rounded-xl space-y-space-xs">
                <div className="flex flex-wrap items-center justify-between gap-space-xs">
                  <div className="flex items-center gap-space-xs">
                    <span className="font-tabular-mono text-tabular-mono font-bold text-primary text-sm">#GRV-2081-0428</span>
                    <span className="bg-brand-accent-light text-primary font-label-sm text-label-sm px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-status-success animate-pulse"></span>
                      {t('कारबाही प्रक्रियामा / समाधान उन्मुख', 'In Progress / Resolution Pending')}
                    </span>
                  </div>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">{t('दर्ता: २०८१ फागुन १८', 'Registered: Mar 02, 2025')}</span>
                </div>
                <h4 className="font-headline-sm text-headline-sm text-on-surface font-semibold text-base pt-1">{t('विषय: लाभांश तथा बचत ब्याज हिसाब पुनरावलोकन', 'Subject: Dividend & Savings Interest Recalculation')}</h4>
                <p className="text-xs text-on-surface-variant">{t('शाखा: चैनपुर मुख्य कार्यालय | सम्बन्धित डेस्क: लेखा तथा बचत व्यवस्थापन', 'Branch: Chainpur Main Office | Desk: Accounts & Savings Management')}</p>
              </div>
              <div className="space-y-space-sm">
                <h5 className="font-label-md text-label-md font-bold text-on-surface flex items-center gap-1">
                  <GitBranch className="w-4.5 h-4.5 text-primary" />
                  {t('छानबिन चरण तथा कार्य प्रगति विवरण', 'Audit Steps & SLA Progress Details')}
                </h5>
                <div className="space-y-space-xs relative pl-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-surface-container-high">
                  <div className="relative flex items-start gap-space-sm">
                    <span className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-status-success text-on-primary flex items-center justify-center">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                    <div>
                      <p className="font-label-sm text-label-sm font-bold text-on-surface">{t('२०८१ फागुन १८, १०:३० AM - गुनासो अनलाइन दर्ता भयो', 'Mar 02, 2025, 10:30 AM - Grievance Registered Online')}</p>
                      <p className="text-xs text-on-surface-variant">{t('प्रणालीमार्फत स्वतः टिकट सृजना भई केन्द्रीय हेल्पडेस्कमा प्रेषित।', 'Ticket automatically generated via core system and routed to helpdesk.')}</p>
                    </div>
                  </div>
                  <div className="relative flex items-start gap-space-sm pt-space-xs">
                    <span className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-status-success text-on-primary flex items-center justify-center">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                    <div>
                      <p className="font-label-sm text-label-sm font-bold text-on-surface">{t('२०८१ फागुन १९, ०२:१५ PM - प्रारम्भिक छानबिन सम्पन्न', 'Mar 03, 2025, 02:15 PM - Preliminary Review Completed')}</p>
                      <p className="text-xs text-on-surface-variant">{t('गढवा शाखा अधिकृत सीता चौधरीद्वारा पासबुक र ब्याज दर भौचर रुजु गरियो।', 'Passbook and interest rate vouchers verified by field officer Sita Chaudhary.')}</p>
                    </div>
                  </div>
                  <div className="relative flex items-start gap-space-sm pt-space-xs">
                    <span className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center animate-pulse">
                      <Clock className="w-3.5 h-3.5" />
                    </span>
                    <div className="bg-surface-canvas p-space-sm rounded-lg w-full border border-primary/20">
                      <p className="font-label-sm text-label-sm font-bold text-primary flex items-center justify-between">
                        <span>{t('२०८१ फागुन २३, ११:०० AM - अन्तिम स्वीकृतिको क्रममा', 'Mar 07, 2025, 11:00 AM - Pending Final Approval')}</span>
                        <span className="bg-primary text-on-primary text-[10px] px-1.5 py-0.5 rounded">{t('हालको अवस्था', 'Current Status')}</span>
                      </p>
                      <p className="text-xs text-on-surface leading-relaxed mt-1">{t('लेखा प्रणालीबाट ब्याज हिसाब मिलान गरी शाखा प्रबन्धक भोजराज थारुसमक्ष स्वीकृतिका लागि पेस गरिएको छ।', 'Interest adjustment prepared in CBS and submitted to Branch Manager Bhojraj Tharu for approval.')}</p>
                    </div>
                  </div>
                  <div className="relative flex items-start gap-space-sm pt-space-xs">
                    <span className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-surface-container-high text-on-surface-variant flex items-center justify-center text-xs font-bold">४</span>
                    <div>
                      <p className="font-label-sm text-label-sm font-semibold text-on-surface-variant">{t('फागुन २६ सम्म - अन्तिम समाधान तथा सदस्य खातामा समायोजन', 'By Mar 10 - Final Resolution & Account Adjustment')}</p>
                      <p className="text-xs text-on-surface-variant">{t('संशोधित रकम बचत खातामा क्रेडिट भई एसएमएस अलर्ट पठाइनेछ।', 'Adjusted amount will be credited to UKO-SAV account with SMS alert.')}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-surface-canvas p-space-md rounded-xl space-y-space-xs">
                <div className="flex items-center gap-space-sm">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  <span className="font-label-sm text-label-sm font-bold text-on-surface">{t('शाखा प्रबन्धकको आधिकारिक टिप्पणी:', 'Branch Manager Official Note:')}</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface bg-surface-card p-space-sm rounded-lg italic leading-relaxed">
                  {t('"सदस्य श्री हरि प्रसाद चौधरीको मुद्दती निक्षेपको पछिल्लो त्रैमासिक ब्याज गणनामा ५ दिनको ग्रेस अवधि मिलान गर्नुपर्ने देखिएकोले रु. ४५० समायोजन भौचर तयार गरिएको छ।"', '"Adjustment voucher of NPR 450 prepared to reconcile 5 grace days in quarterly FD interest for member Hari Prasad Chaudhary."')}
                </p>
                <div className="flex items-center justify-between pt-space-xs">
                  <span className="text-xs text-on-surface-variant">{t('हस्ताक्षरकर्ता: भोजराज थारु (शाखा प्रबन्धक)', 'Signatory: Bhojraj Tharu (Branch Manager)')}</span>
                  <a className="inline-flex items-center gap-1 text-primary hover:text-on-secondary-container text-xs font-bold bg-surface-card px-space-sm py-1 rounded-md shadow-sm" href="javascript:void(0)" onClick={() => alert(t("Adjustment_Voucher_Draft.pdf डाउनलोड भइरहेको छ...", "Downloading Adjustment_Voucher_Draft.pdf..."))}>
                    <Paperclip className="w-4 h-4" />
                    <span>Adjustment_Voucher_Draft.pdf (1.2 MB)</span>
                    <Download className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
              <div className="space-y-space-xs">
                <label className="font-label-sm text-label-sm font-semibold text-on-surface flex items-center gap-1">
                  <MessageCircle className="w-4 h-4 text-primary" />
                  {t('थप स्पष्टीकरण वा प्रतिक्रिया पठाउनुहोस्', 'Send Further Clarification / Feedback')}
                </label>
                <div className="flex gap-space-xs">
                  <input className="flex-1 h-10 px-space-md bg-surface-canvas rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary border border-surface-container" placeholder={t('थप कागजात वा सन्देश यहाँ टाइप गर्नुहोस्...', 'Type additional documents or message here...')} type="text"/>
                  <button className="bg-primary hover:bg-primary-container text-on-primary font-label-sm text-label-sm font-bold px-space-md h-10 rounded-xl transition-all flex items-center gap-1 shadow-sm" type="button">
                    <Send className="w-4 h-4" />
                    <span>{t('पठाउनुहोस्', 'Send')}</span>
                  </button>
                </div>
              </div>
              <div className="pt-space-xs border-t border-surface-container flex flex-col sm:flex-row items-center justify-between gap-space-sm">
                <div className="flex items-center gap-space-xs text-xs text-on-surface-variant">
                  <span className="font-semibold">{t('अघिल्ला उजुरीहरू:', 'Previous Tickets:')}</span>
                  <button className="hover:text-primary underline font-tabular-mono" type="button">#GRV-2080-891 ({t('समाधान भयो', 'Resolved')})</button>
                  <span className="text-outline-variant">•</span>
                  <button className="hover:text-primary underline font-tabular-mono" type="button">#GRV-2080-312 ({t('समाधान भयो', 'Resolved')})</button>
                </div>
                <button onClick={onClose} className="w-full sm:w-auto px-space-lg py-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm font-bold rounded-xl transition-all" type="button">
                  {t('बन्द गर्नुहोस्', 'Close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
