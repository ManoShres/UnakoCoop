import React, { useState, useMemo, useEffect } from 'react';
import { useCoopStore } from '../../store/useCoopStore';
import { useLanguageStore } from '../../store/useLanguageStore';
import { Member } from '../../types';
import {
  SmsTemplateType,
  calculateSmsSegments,
  formatSmsTemplate,
  generateWhatsAppLink,
  dispatchSimulatedSms,
  SmsDispatchRecord,
} from '../../utils/smsGateway';
import {
  X,
  Send,
  MessageSquare,
  Smartphone,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  Users,
  User,
  History,
  ExternalLink,
  Copy,
  Info,
} from 'lucide-react';

interface SmsBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTemplate?: SmsTemplateType;
  prefillRecipient?: { name: string; phone: string; accountNo?: string };
}

export const SmsBroadcastModal: React.FC<SmsBroadcastModalProps> = ({
  isOpen,
  onClose,
  defaultTemplate = 'AGM_ANNOUNCEMENT',
  prefillRecipient,
}) => {
  const { t } = useLanguageStore();
  const { members, loans, coopSettings, agmDetails } = useCoopStore();

  const [channel, setChannel] = useState<'SMS' | 'WHATSAPP'>('SMS');
  const [useNepali, setUseNepali] = useState<boolean>(true);
  const [templateType, setTemplateType] = useState<SmsTemplateType>(defaultTemplate);
  const [targetAudience, setTargetAudience] = useState<'ALL' | 'BORROWERS' | 'SHAREHOLDERS' | 'INDIVIDUAL'>('ALL');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [customPhone, setCustomPhone] = useState<string>('');
  const [customName, setCustomName] = useState<string>('');

  // Template variables
  const [amount, setAmount] = useState<number>(5000);
  const [accountNo, setAccountNo] = useState<string>('SB-100234');
  const [balance, setBalance] = useState<number>(24500);
  const [dueDate, setDueDate] = useState<string>('2081-07-30');
  const [dividendRate, setDividendRate] = useState<number>(15);
  const [customText, setCustomText] = useState<string>('');

  // Dispatch history
  const [dispatchLogs, setDispatchLogs] = useState<SmsDispatchRecord[]>([]);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'COMPOSE' | 'LOGS'>('COMPOSE');

  useEffect(() => {
    if (prefillRecipient) {
      setTargetAudience('INDIVIDUAL');
      setCustomPhone(prefillRecipient.phone);
      setCustomName(prefillRecipient.name);
      if (prefillRecipient.accountNo) {
        setAccountNo(prefillRecipient.accountNo);
      }
    }
  }, [prefillRecipient]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Recipient list based on audience
  const recipientList = useMemo(() => {
    if (targetAudience === 'INDIVIDUAL') {
      if (selectedMemberId) {
        const found = members.find((m) => m.id === selectedMemberId);
        if (found) return [{ name: found.name, phone: found.phone }];
      }
      if (customPhone) {
        return [{ name: customName || 'Member', phone: customPhone }];
      }
      return [];
    }

    if (targetAudience === 'BORROWERS') {
      const borrowerIds = new Set(loans.filter((l) => l.status === 'ACTIVE').map((l) => l.memberId));
      return members
        .filter((m) => borrowerIds.has(m.id) && m.phone)
        .map((m) => ({ name: m.name, phone: m.phone }));
    }

    if (targetAudience === 'SHAREHOLDERS') {
      return members
        .filter((m) => (m.shareCapital || 0) > 0 && m.phone)
        .map((m) => ({ name: m.name, phone: m.phone }));
    }

    // ALL
    return members.filter((m) => m.phone).map((m) => ({ name: m.name, phone: m.phone }));
  }, [targetAudience, selectedMemberId, customPhone, customName, members, loans]);

  // Generated message text
  const previewRecipientName = recipientList.length > 0 ? recipientList[0].name : 'आदरणीय सदस्य';
  const previewMessage = useMemo(() => {
    return formatSmsTemplate(
      templateType,
      {
        memberName: previewRecipientName,
        amount,
        accountNo,
        balance,
        dueDate,
        dividendRate,
        agmDate: agmDetails?.dateNepali || '२०८१ पौष १५',
        agmVenue: agmDetails?.venue || 'गढवा सामुदायिक भवन',
        customText,
      },
      coopSettings,
      useNepali
    );
  }, [
    templateType,
    previewRecipientName,
    amount,
    accountNo,
    balance,
    dueDate,
    dividendRate,
    agmDetails,
    customText,
    coopSettings,
    useNepali,
  ]);

  const smsMetrics = useMemo(() => {
    return calculateSmsSegments(previewMessage);
  }, [previewMessage]);

  const estimatedCost = useMemo(() => {
    // Approx NPR 1.50 per SMS segment in Nepal
    return (recipientList.length * smsMetrics.segmentCount * 1.5).toFixed(2);
  }, [recipientList.length, smsMetrics.segmentCount]);

  const handleDispatch = () => {
    if (recipientList.length === 0) return;

    if (channel === 'WHATSAPP') {
      const primaryRecipient = recipientList[0];
      const link = generateWhatsAppLink(primaryRecipient.phone, previewMessage);
      window.open(link, '_blank', 'noopener,noreferrer');

      const record: SmsDispatchRecord = {
        id: `WA-${Date.now().toString().slice(-6)}`,
        timestamp: new Date().toISOString(),
        recipientPhone: primaryRecipient.phone,
        recipientName: primaryRecipient.name,
        templateType,
        messageText: previewMessage,
        channel: 'WHATSAPP',
        status: 'DELIVERED',
        segmentCount: 1,
        gatewayResponseId: 'WA-WEB-DISPATCH',
      };
      setDispatchLogs((prev) => [record, ...prev]);
      setSuccessToast(t('ह्वाट्सएप विन्डो सफलतापूर्वक खोलियो!', 'WhatsApp window opened successfully!'));
      setTimeout(() => setSuccessToast(null), 3000);
      return;
    }

    // SMS Dispatch Simulation
    setIsSending(true);
    setTimeout(() => {
      const newRecords: SmsDispatchRecord[] = recipientList.slice(0, 50).map((r) => {
        const text = formatSmsTemplate(
          templateType,
          {
            memberName: r.name,
            amount,
            accountNo,
            balance,
            dueDate,
            dividendRate,
            agmDate: agmDetails?.dateNepali || '२०८१ पौष १५',
            agmVenue: agmDetails?.venue || 'गढवा सामुदायिक भवन',
            customText,
          },
          coopSettings,
          useNepali
        );
        return dispatchSimulatedSms({
          recipientPhone: r.phone,
          recipientName: r.name,
          templateType,
          messageText: text,
          channel: 'SMS',
        });
      });

      setDispatchLogs((prev) => [...newRecords, ...prev]);
      setIsSending(false);
      setSuccessToast(
        t(
          `${newRecords.length} सदस्यहरूलाई SMS सफलतापूर्वक प्रसारण भयो!`,
          `Successfully dispatched SMS to ${newRecords.length} members!`
        )
      );
      setTimeout(() => setSuccessToast(null), 3500);
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Smartphone className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  {t('स्वचालित SMS र WhatsApp प्रसारण गेटवे', 'Automated SMS & WhatsApp Broadcast Gateway')}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                  {t('नेपाल टेलिकम / SparrowSMS प्रमाणित', 'SparrowSMS Compliant')}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t(
                  'सहकारी ऐन २०७४ अनुसार बचत, ऋण, लाभांश र साधारण सभा सूचना सदस्यहरूको मोबाइलमा तुरुन्त प्रसारण',
                  'Instant delivery of deposits, EMI reminders, dividend credits, and AGM alerts to members'
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Tab Bar & Success Toast */}
        <div className="px-6 pt-3 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('COMPOSE')}
              className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition ${
                activeTab === 'COMPOSE'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <MessageSquare className="size-4" />
                <span>{t('सन्देश सम्पादन तथा प्रसारण', 'Compose & Dispatch')}</span>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('LOGS')}
              className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition ${
                activeTab === 'LOGS'
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <History className="size-4" />
                <span>
                  {t('प्रसारण अभिलेख', 'Dispatch Logs')} ({dispatchLogs.length})
                </span>
              </div>
            </button>
          </div>

          {successToast && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full animate-fade-in">
              <CheckCircle2 className="size-3.5" />
              <span>{successToast}</span>
            </div>
          )}
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'COMPOSE' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Form Controls */}
              <div className="lg:col-span-7 space-y-4">
                {/* Channel Selector */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    {t('१. प्रसारण माध्यम (Channel)', '1. Broadcast Channel')}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setChannel('SMS')}
                      className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition ${
                        channel === 'SMS'
                          ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 text-blue-900 dark:text-blue-300 ring-2 ring-blue-600/20'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <Smartphone className="size-5 text-blue-600" />
                      <div>
                        <div className="font-bold text-xs">{t('नेपाल टेलिकम / SMS गेटवे', 'Nepal SMS Gateway')}</div>
                        <div className="text-[10px] text-slate-400">SparrowSMS / AakashSMS</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setChannel('WHATSAPP')}
                      className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition ${
                        channel === 'WHATSAPP'
                          ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300 ring-2 ring-emerald-600/20'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <MessageCircle className="size-5 text-emerald-600" />
                      <div>
                        <div className="font-bold text-xs">{t('ह्वाट्सएप (WhatsApp API)', 'WhatsApp Direct')}</div>
                        <div className="text-[10px] text-slate-400">Direct wa.me Click-to-Chat</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Audience Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5">
                    {t('२. लक्षित सदस्य समूह (Audience)', '2. Target Audience')}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { key: 'ALL', labelNp: 'सबै सदस्य', labelEn: 'All Members', icon: Users },
                      { key: 'BORROWERS', labelNp: 'ऋणी सदस्य', labelEn: 'Borrowers', icon: Users },
                      { key: 'SHAREHOLDERS', labelNp: 'सेयरधनी', labelEn: 'Shareholders', icon: Users },
                      { key: 'INDIVIDUAL', labelNp: 'व्यक्तिगत', labelEn: 'Individual', icon: User },
                    ].map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => setTargetAudience(item.key as any)}
                        className={`p-2.5 rounded-xl border text-center text-xs font-bold transition flex flex-col items-center gap-1 ${
                          targetAudience === item.key
                            ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                            : 'border-slate-200 dark:border-slate-800 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <item.icon className="size-4" />
                        <span>{t(item.labelNp, item.labelEn)}</span>
                      </button>
                    ))}
                  </div>

                  {targetAudience === 'INDIVIDUAL' && (
                    <div className="mt-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                      <select
                        value={selectedMemberId}
                        onChange={(e) => setSelectedMemberId(e.target.value)}
                        className="w-full text-xs font-medium p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                      >
                        <option value="">{t('-- सदस्य सूचीबाट छान्नुहोस् --', '-- Select from Member Roster --')}</option>
                        {members.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name} ({m.memberNo}) - {m.phone || 'No phone'}
                          </option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder={t('वा नाम...', 'Or Name...')}
                          value={customName}
                          onChange={(e) => setCustomName(e.target.value)}
                          className="flex-1 text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                        <input
                          type="text"
                          placeholder={t('मोबाइल नं. (98XXXXXXXX)', 'Phone (98XXXXXXXX)')}
                          value={customPhone}
                          onChange={(e) => setCustomPhone(e.target.value)}
                          className="flex-1 text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                        />
                      </div>
                    </div>
                  )}

                  <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
                    <span>
                      {t('लक्षित संख्या:', 'Audience count:')}{' '}
                      <strong className="text-slate-900 dark:text-white">{recipientList.length}</strong>{' '}
                      {t('सदस्यहरू', 'members')}
                    </span>
                    <span>
                      {t('अनुमानित लागत:', 'Estimated cost:')}{' '}
                      <strong className="text-blue-600 font-mono">NPR {estimatedCost}</strong>
                    </span>
                  </div>
                </div>

                {/* Template Selector & Language Toggle */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                      {t('३. सन्देश ढाँचा (Template)', '3. Message Template')}
                    </label>
                    <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[10px] font-bold">
                      <button
                        type="button"
                        onClick={() => setUseNepali(true)}
                        className={`px-2 py-0.5 rounded-md transition ${
                          useNepali ? 'bg-white dark:bg-slate-900 shadow-xs text-blue-600' : 'text-slate-400'
                        }`}
                      >
                        नेपाली (Unicode)
                      </button>
                      <button
                        type="button"
                        onClick={() => setUseNepali(false)}
                        className={`px-2 py-0.5 rounded-md transition ${
                          !useNepali ? 'bg-white dark:bg-slate-900 shadow-xs text-blue-600' : 'text-slate-400'
                        }`}
                      >
                        English (GSM-7)
                      </button>
                    </div>
                  </div>

                  <select
                    value={templateType}
                    onChange={(e) => setTemplateType(e.target.value as SmsTemplateType)}
                    className="w-full text-xs font-bold p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  >
                    <option value="AGM_ANNOUNCEMENT">
                      {t('साधारण सभा सूचना (AGM Announcement)', 'AGM Announcement')}
                    </option>
                    <option value="LOAN_EMI_REMINDER">
                      {t('ऋण किस्ता भुक्तानी ताकेता (Loan EMI Reminder)', 'Loan EMI Reminder')}
                    </option>
                    <option value="DIVIDEND_CREDIT">
                      {t('लाभांश वितरण जानकारी (Dividend Credit Notice)', 'Dividend Credit Notice')}
                    </option>
                    <option value="DEPOSIT_CONFIRMATION">
                      {t('बचत रकम जम्मा सन्देश (Deposit Confirmation)', 'Deposit Confirmation')}
                    </option>
                    <option value="WITHDRAWAL_CONFIRMATION">
                      {t('रकम भुक्तानी सन्देश (Withdrawal Confirmation)', 'Withdrawal Confirmation')}
                    </option>
                    <option value="CUSTOM">{t('स्वनिर्मित सन्देश (Custom Notice)', 'Custom Notice')}</option>
                  </select>
                </div>

                {/* Dynamic Variables Inputs */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-2">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {t('ढाँचा चरहरू (Template Parameters)', 'Template Parameters')}
                  </div>

                  {(templateType === 'DEPOSIT_CONFIRMATION' ||
                    templateType === 'WITHDRAWAL_CONFIRMATION' ||
                    templateType === 'LOAN_EMI_REMINDER' ||
                    templateType === 'DIVIDEND_CREDIT') && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-400">{t('रकम (NPR)', 'Amount (NPR)')}</label>
                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(Number(e.target.value))}
                          className="w-full text-xs p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                        />
                      </div>
                      {templateType === 'LOAN_EMI_REMINDER' ? (
                        <div>
                          <label className="text-[10px] text-slate-400">{t('भाका मिति', 'Due Date')}</label>
                          <input
                            type="text"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full text-xs p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                          />
                        </div>
                      ) : templateType === 'DIVIDEND_CREDIT' ? (
                        <div>
                          <label className="text-[10px] text-slate-400">{t('लाभांश दर (%)', 'Dividend Rate (%)')}</label>
                          <input
                            type="number"
                            value={dividendRate}
                            onChange={(e) => setDividendRate(Number(e.target.value))}
                            className="w-full text-xs p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                          />
                        </div>
                      ) : (
                        <div>
                          <label className="text-[10px] text-slate-400">{t('खाता नं.', 'Account No.')}</label>
                          <input
                            type="text"
                            value={accountNo}
                            onChange={(e) => setAccountNo(e.target.value)}
                            className="w-full text-xs p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {templateType === 'CUSTOM' && (
                    <textarea
                      rows={3}
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      placeholder={t('आफ्नो सूचना वा सन्देश यहाँ टाइप गर्नुहोस्...', 'Type your custom message here...')}
                      className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  )}
                </div>
              </div>

              {/* Right Column: Live Mockup & Segment Counter */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
                {/* Phone Simulator Frame */}
                <div className="p-4 rounded-3xl bg-slate-900 text-white shadow-xl border border-slate-700 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1 font-mono">
                      <Smartphone className="size-3 text-emerald-400" />
                      {channel === 'SMS' ? 'SparrowSMS 34001' : 'WhatsApp Official'}
                    </span>
                    <span>{useNepali ? 'नेपाली' : 'GSM-7'}</span>
                  </div>

                  {/* Message Bubble */}
                  <div className="p-3.5 rounded-2xl bg-slate-800/90 border border-slate-700/60 text-xs leading-relaxed font-sans text-slate-100">
                    {previewMessage}
                  </div>

                  {/* Segment & Telecommunication Metrics */}
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <div>
                      <span>{t('कुल अक्षर:', 'Chars:')} </span>
                      <strong className="text-white">{smsMetrics.charCount}</strong>
                    </div>
                    <div>
                      <span>{t('SMS खण्ड:', 'Segments:')} </span>
                      <strong className="text-amber-400">{smsMetrics.segmentCount}</strong>
                    </div>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        smsMetrics.isUnicode
                          ? 'bg-purple-900/60 text-purple-300'
                          : 'bg-emerald-900/60 text-emerald-300'
                      }`}
                    >
                      {smsMetrics.isUnicode ? 'Unicode (70c)' : 'ASCII (160c)'}
                    </span>
                  </div>
                </div>

                {/* Telecommunications Disclaimer */}
                <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
                  <Info className="size-4 shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-tight">
                    {t(
                      'नेपाल दूरसञ्चार प्राधिकरणको नियम अनुसार १०-अङ्कको दर्ता मोबाइल नम्बरमा मात्र एसएमएस प्रवाह हुन्छ। DND सूचीमा रहेका नम्बरहरूमा प्रेषक आइडीबाट प्रवाह गरिन्छ।',
                      'Per NTA regulations, SMS is broadcast only to registered 10-digit mobile numbers with authorized sender ID.'
                    )}
                  </p>
                </div>

                {/* Dispatch Button */}
                <button
                  type="button"
                  onClick={handleDispatch}
                  disabled={isSending || recipientList.length === 0}
                  className={`w-full py-3 px-4 rounded-2xl font-black text-xs text-white shadow-lg transition flex items-center justify-center gap-2 ${
                    channel === 'WHATSAPP'
                      ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                      : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20 disabled:opacity-50'
                  }`}
                >
                  {isSending ? (
                    <span>{t('गेटवेमा प्रसारण हुँदैछ...', 'Transmitting to Gateway...')}</span>
                  ) : channel === 'WHATSAPP' ? (
                    <>
                      <ExternalLink className="size-4" />
                      <span>{t('ह्वाट्सएपमा सन्देश पठाउनुहोस्', 'Open & Send via WhatsApp')}</span>
                    </>
                  ) : (
                    <>
                      <Send className="size-4" />
                      <span>
                        {t('SMS गेटवेबाट प्रसारण सुरु गर्नुहोस्', 'Start SMS Gateway Broadcast')} ({recipientList.length})
                      </span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Dispatch Logs View */
            <div className="space-y-3">
              {dispatchLogs.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  {t('हालसम्म कुनै प्रसारण अभिलेख छैन।', 'No broadcast logs recorded yet.')}
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {dispatchLogs.map((log) => (
                    <div key={log.id} className="py-2.5 flex items-center justify-between text-xs gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white">{log.recipientName}</span>
                          <span className="font-mono text-slate-400 text-[11px]">{log.recipientPhone}</span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-600">
                            {log.channel}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 line-clamp-1">{log.messageText}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="size-3" />
                          {log.status}
                        </span>
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5">{log.gatewayResponseId}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
