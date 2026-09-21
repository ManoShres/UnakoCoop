import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Search,
  ChevronRight,
  ChevronDown,
  Home,
  HelpCircle,
  Phone,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useLanguageStore } from '../../store/useLanguageStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useCoopStore } from '../../store/useCoopStore';
import { useDesignStore } from '../../store/useDesignStore';
import { chatWithOpenRouter, ChatMessage } from '../../utils/openRouter';

interface Message {
  id: string;
  sender: 'bot' | 'user' | 'agent';
  agentName?: string;
  agentAvatar?: string;
  text: string;
  time: string;
}

/**
 * Offline fallback replies used when the OpenRouter AI service is unreachable.
 */
const getFallbackReply = (query: string, lang: 'ne' | 'en'): string => {
  const lower = query.toLowerCase();
  let replyNe = 'धन्यवाद! तपाईंको जिज्ञासा दर्ता भएको छ। हाम्रो गढवा शाखा अधिकृत सीता चौधरीले समीक्षा गर्नुहुनेछ। तपाईं ०८२-४१२०५५ मा पनि सिधै फोन गर्न सक्नुहुन्छ।';
  let replyEn = 'Thank you! Your query has been received by Sita Chaudhary at our member desk. A branch officer is reviewing it. You can also dial 082-412055.';

  if (lower.includes('loan') || lower.includes('ऋण') || lower.includes('कर्जा') || lower.includes('borrow')) {
    replyNe = 'हाम्रो कृषि तथा पशुपालन कर्जा ९.५% र साना व्यवसाय कर्जा ११.५% मा उपलब्ध छ। तपाईं पोर्टलको "ऋण लिनुहोस् (Apply Loan)" बाट सिधै आवेदन दिन सक्नुहुन्छ।';
    replyEn = 'Our Agricultural Loans are available at 9.5% p.a. and Small Business Loans at 11.5% p.a. You can apply directly from the member portal.';
  } else if (lower.includes('rate') || lower.includes('ब्याज') || lower.includes('saving') || lower.includes('बचत') || lower.includes('fd')) {
    replyNe = 'नियमित बचतमा ८.०% र मुद्दती निक्षेपमा १०.०% देखि ११.५% सम्म आकर्षक ब्याज पाइन्छ। ब्याज त्रैमासिक रूपमा खातामा जम्मा हुन्छ।';
    replyEn = 'Regular Savings earn 8.0% p.a. and Fixed Term Deposits earn 10.0% to 11.5% with daily compound interest.';
  } else if (lower.includes('kyc') || lower.includes('केवाईसी') || lower.includes('member') || lower.includes('सदस्य')) {
    replyNe = 'नयाँ सदस्यताका लागि लगइन पृष्ठबाट "Apply for Membership" मा गई नागरिकता र फोटो अपलोड गर्नुहोस्। प्रमाणित भएपछि १० कित्ता शेयर प्राप्त हुनेछ।';
    replyEn = 'To become a member, click "Apply for Membership" on the login screen, fill your address in Dang, and upload citizenship proofs.';
  } else if (lower.includes('branch') || lower.includes('शाखा') || lower.includes('time') || lower.includes('समय') || lower.includes('phone') || lower.includes('फोन')) {
    replyNe = 'मुख्य कार्यालय: गढवा-५, दाङ (०८२-४१२०५५)। कार्यालय समय: आइतबारदेखि शुक्रबार बिहान १०:०० देखि दिउँसो ४:०० सम्म।';
    replyEn = 'Head Office: Gadhwa-5, Dang (082-412055). Hours: Sunday - Friday, 10:00 AM - 4:00 PM (Cash Counter till 3:00 PM).';
  }

  return lang === 'ne' ? replyNe : replyEn;
};

export const SupportChatPopup: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'messages' | 'help'>('home');
  const [unreadCount, setUnreadCount] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOpenCustomChat = () => {
      setIsOpen(true);
      setUnreadCount(0);
    };
    window.addEventListener('open-support-chat', handleOpenCustomChat);
    return () => window.removeEventListener('open-support-chat', handleOpenCustomChat);
  }, []);

  const { t, lang } = useLanguageStore();
  const { currentMember } = useAuthStore();
  const { addInquiry, coopSettings, employees } = useCoopStore();
  const { settings } = useDesignStore();
  const { chatColors } = settings;

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'bot',
      agentName: 'Sita Chaudhary (Member Desk)',
      agentAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100',
      text: lang === 'ne'
        ? 'नमस्ते! उनको बचत तथा ऋण सहकारीको डिजिटल सेवा कक्षमा स्वागत छ। म वा हाम्रा कर्मचारीहरू अनलाइन छौं। के सहयोग गर्न सक्छौं?'
        : 'Namaste! Welcome to Unako SACCOS support desk. Our staff are online now to help. How can we assist you today?',
      time: '10:00 AM',
    },
  ]);

  // Show only active (online) staff from the cooperative's employee registry
  const onlineStaff = employees
    .filter((emp) => emp.status === 'ACTIVE')
    .slice(0, 5)
    .map((emp) => ({
      name: emp.name,
      nameNe: emp.nameNepali || emp.name,
      role: emp.designation,
      roleNe: emp.designationNepali || emp.designation,
      avatar: emp.avatarUrl,
      status: 'Online' as const,
    }));

  // Use real staff from the store - no fallback to hardcoded members
  const teamMembers = onlineStaff;

  const faqs = [
    {
      qNe: 'नयाँ सदस्यता र डिजिटल केवाईसी कसरी प्रमाणित गर्ने?',
      qEn: 'How to apply and verify digital KYC for membership?',
      aNe: 'तपाईं लगइन पृष्ठबाट "सदस्यता आवेदन" फारम भरेर नागरिकता र फोटो अपलोड गर्न सक्नुहुन्छ। २४ घण्टाभित्र प्रमाणीकरण हुनेछ।',
      aEn: 'You can fill out the 4-step Membership Application via the portal with citizenship and photo. Staff verifies within 24-48 hours.',
    },
    {
      qNe: 'कृषि तथा पशुपालन कर्जाको ब्याजदर र सीमा कति छ?',
      qEn: 'What are the Agro Loan limits and interest rates?',
      aNe: 'कृषि तथा पशुपालन कर्जा ९.५% वार्षिक ब्याजदरमा रु. ५ लाखदेखि १५ लाखसम्म सहुलियत दरमा उपलब्ध छ।',
      aEn: 'Agro & Livestock credit is offered at a subsidized 9.5% p.a. from NPR 50,000 up to NPR 15 Lakhs.',
    },
    {
      qNe: 'मुद्दती निक्षेप (FD) को ब्याजदर कति पाइन्छ?',
      qEn: 'What is the Fixed Term Deposit (FD) return rate?',
      aNe: '१ वर्षे मुद्दती निक्षेपमा १०.०% र ३ वर्षे मुद्दतीमा ११.५% सम्म त्रैमासिक ब्याज भुक्तानी सुविधा छ।',
      aEn: '1-Year Fixed Deposits yield 10.0% p.a., while 3-year term deposits yield up to 11.5% with quarterly compounding.',
    },
    {
      qNe: 'दाङ जिल्लाका सेवा केन्द्रहरू र फोन नम्बर के के हुन्?',
      qEn: 'Where are Dang branches located and what are their phone numbers?',
      aNe: 'केन्द्रीय कार्यालय गढवा (०८२-४१२०५५), लमही सेवा केन्द्र (०८२-५४०१२२), र सिसहनिया सेवा केन्द्र (०८२-५८०३३१)।',
      aEn: 'Central Office in Gadhwa (082-412055), Lamahi Service Center (082-540122), and Sisahaniya (082-580331).',
    },
  ];

  const filteredFaqs = faqs.filter((f) => {
    const q = searchQuery.toLowerCase();
    return (
      f.qNe.toLowerCase().includes(q) ||
      f.qEn.toLowerCase().includes(q) ||
      f.aNe.toLowerCase().includes(q) ||
      f.aEn.toLowerCase().includes(q)
    );
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeTab === 'messages') {
      scrollToBottom();
    }
  }, [messages, activeTab]);

  const handleOpen = () => {
    setIsOpen(true);
    setUnreadCount(0);
  };

  const handleSendMessage = useCallback((textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query) return;

    const userMsg: Message = {
      id: 'm-' + Date.now(),
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setActiveTab('messages');
    setIsTyping(true);

    // Save as inquiry ticket in cooperative CBS store
    try {
      addInquiry({
        name: currentMember?.name || 'Portal Visitor',
        email: currentMember?.email || 'visitor@unako.coop',
        phone: currentMember?.phone || '98XXXXXXXX',
        category: 'General',
        subject: query.slice(0, 40) + '...',
        message: query,
      });
    } catch {
      // ignore
    }

    // Build a compact conversation history (last 10 turns) for the AI model
    const fullHistory: ChatMessage[] = [
      ...messages.map<ChatMessage>((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      })),
      { role: 'user', content: query },
    ];
    const history = fullHistory.slice(-10);

    // Query the OpenRouter AI assistant (falls back to canned replies on failure)
    chatWithOpenRouter(history, coopSettings, lang === 'en' ? 'en' : 'ne').then((result) => {
      setIsTyping(false);

      if (!result.success) {
        // Keep a helpful trace in the console for developers/admins
        console.warn('[SupportChat] OpenRouter fallback:', result.error);
      }

      const botMsg: Message = {
        id: 'bot-' + Date.now(),
        sender: 'agent',
        agentName: result.success ? 'Unako AI Assistant' : 'Sita Chaudhary (Member Desk)',
        agentAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100',
        text: result.success ? result.content : getFallbackReply(query, lang),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    });
  }, [inputMessage, currentMember, addInquiry, lang, messages, coopSettings]);

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans print:hidden">
      {/* 1. Launcher Floating Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={handleOpen}
          className="relative group size-16 rounded-full text-white flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
          style={{
            background: `linear-gradient(135deg, ${chatColors.launcherFrom} 0%, ${chatColors.launcherTo} 100%)`,
          }}
          onMouseEnter={(e) => {
            const btn = e.currentTarget;
            btn.style.background = `linear-gradient(135deg, ${chatColors.launcherHoverFrom} 0%, ${chatColors.launcherHoverTo} 100%)`;
          }}
          onMouseLeave={(e) => {
            const btn = e.currentTarget;
            btn.style.background = `linear-gradient(135deg, ${chatColors.launcherFrom} 0%, ${chatColors.launcherTo} 100%)`;
          }}
          aria-label="Open Live Support Chat"
        >
          {/* Smiling Speech Bubble SVG */}
          <svg className="size-8 fill-current" viewBox="0 0 24 24">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-6 10.5c0 .28-.22.5-.5.5h-3c-.28 0-.5-.22-.5-.5s.22-.5.5-.5h3c.28 0 .5.22.5.5zm3-2c0 .28-.22.5-.5.5h-9c-.28 0-.5-.22-.5-.5s.22-.5.5-.5h9c.28 0 .5.22.5.5z" />
          </svg>

          {/* Unread notification badge '1' */}
          {unreadCount > 0 && (
            <span
              className="absolute -top-1 -right-1 size-6 rounded-full border-2 border-white text-white text-xs font-black flex items-center justify-center shadow-md animate-bounce"
              style={{ backgroundColor: chatColors.badge }}
            >
              {unreadCount}
            </span>
          )}
        </button>
      )}

      {/* 2. Intercom-style Support Popup Window */}
      {isOpen && (
        <div
          className="fixed bottom-4 right-4 z-50 flex flex-col w-[calc(100vw-2rem)] sm:w-[380px] lg:w-[420px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200 print:hidden">

          {/* Header with vibrant gradient & team avatars with ONLINE status indicators */}
          <div
            className="relative p-6 text-white shrink-0"
            style={{
              background: `linear-gradient(135deg, ${chatColors.launcherFrom} 0%, ${chatColors.launcherTo} 50%, ${chatColors.launcherTo} 100%)`,
            }}
          >
            {/* Top row: Brand star + Avatars Stack with Online Indicators + Close */}
            <div className="flex items-center justify-between mb-3.5">
              <div className="size-8 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center font-bold text-lg text-white">
                ✱
              </div>

              <div className="flex items-center gap-2">
                {/* 3 Overlapping Avatars with green pulsing online dots */}
                <div className="flex -space-x-2.5 overflow-visible">
                  {teamMembers.map((m, i) => (
                    <div key={i} className="relative group/avatar">
                      <img
                        src={m.avatar}
                        alt={m.name}
                        title={`${m.name} (${lang === 'ne' ? m.roleNe : m.role}) - Online Now`}
                        className="inline-block size-8 rounded-full ring-2 ring-white object-cover shadow-sm group-hover/avatar:scale-110 transition-transform"
                      />
                      {/* Active green online status indicator on each avatar */}
                      <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-400 ring-2 ring-white shadow-xs"></span>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="size-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors cursor-pointer ml-1"
                  aria-label="Close Chat"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {/* Big Friendly Greeting */}
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight leading-tight flex items-center gap-2">
                <span>{t('नमस्ते', 'Hi there')}</span>
                <span className="animate-pulse">👋</span>
              </h2>
              <p className="text-sm font-medium text-white/90 mt-0.5">
                {t('हामी तपाईंलाई कसरी सहयोग गर्न सक्छौं?', 'How can we help?')}
              </p>
            </div>

            {/* ONLINE STATUS & FAQ FALLBACK BANNER */}
            <div className="mt-3.5 flex items-center gap-2 bg-black/25 backdrop-blur-md px-3 py-1.5 rounded-xl text-[11px] font-medium text-white/95 border border-white/15 shadow-inner">
              <span className="relative flex size-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full size-2 bg-emerald-400"></span>
              </span>
              <p className="leading-tight">
                <strong className="font-bold text-emerald-300">
                  {t('३ जना कर्मचारी अनलाइन हुनुहुन्छ', '3 staff online to help')}
                </strong>{' '}
                • {t('यदि उपलब्ध नभएमा FAQ बाट तत्काल उत्तर पाउनुहोस्', 'If away, 24/7 FAQ will help')}
              </p>
            </div>
          </div>

          {/* Content Area Based on Active Tab */}
          <div className="flex-1 overflow-y-auto bg-slate-50/70 dark:bg-slate-900/50">

            {/* TAB 1: HOME */}
            {activeTab === 'home' && (
              <div className="p-4 space-y-4">
                {/* "Send us a message" Card (Talk to Online Staff) */}
                <button
                  type="button"
                  onClick={() => setActiveTab('messages')}
                  className="w-full text-left bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm hover:shadow-md border border-slate-100 dark:border-slate-700/60 flex items-center justify-between group transition-all cursor-pointer"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#e11d48] transition-colors">
                        {t('अनलाइन कर्मचारीसँग कुरा गर्नुहोस्', 'Chat with Online Staff')}
                      </h3>
                      <span className="size-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {t('सीता वा भोजराजले मिनेटभित्र उत्तर दिनुहुन्छ', 'Sita or Bhojraj typically replies in minutes')}
                    </p>
                  </div>
                  <div className="size-8 rounded-full bg-rose-50 dark:bg-rose-950/50 text-[#e11d48] flex items-center justify-center group-hover:translate-x-1 transition-transform shrink-0">
                    <Send className="size-4 fill-current" />
                  </div>
                </button>

                {/* FAQ SECTION: "IF NOT THEN FAQ WILL HELP" */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700/60 space-y-3">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-700/60">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-white">
                      <Sparkles className="size-3.5 text-[#e11d48]" />
                      <span>{t('बारम्बार सोधिने प्रश्नहरू', 'Instant FAQ & Knowledge Base')}</span>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                      {t('२४/७ उपलब्ध', '24/7 Available')}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {t(
                      'कर्मचारी व्यस्त वा अफलाइन भएमा यहाँबाट तुरुन्त समाधान पाउनुहोस्:',
                      'If staff are busy or away, find instant automated answers here:'
                    )}
                  </p>

                  <div className="relative">
                    <Search className="size-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t('प्रश्न वा विषय खोज्नुहोस्...', 'Search FAQs and help topics...')}
                      className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-[#e11d48]"
                    />
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-700/50 pt-1">
                    {filteredFaqs.map((f, i) => (
                      <div
                        key={i}
                        onClick={() => {
                          handleSendMessage(lang === 'ne' ? f.qNe : f.qEn);
                        }}
                        className="py-2.5 flex items-center justify-between text-xs text-slate-700 dark:text-slate-200 hover:text-[#e11d48] dark:hover:text-[#f43f5e] cursor-pointer group"
                      >
                        <span className="font-medium pr-2 line-clamp-1">
                          {lang === 'ne' ? f.qNe : f.qEn}
                        </span>
                        <ChevronRight className="size-4 text-slate-400 group-hover:text-[#e11d48] shrink-0 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Dial Card */}
                <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/60 rounded-2xl p-3.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                      <Phone className="size-4" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{t('प्रत्यक्ष फोन हेल्पलाइन', 'Direct Phone Helpline')}</p>
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-mono">{coopSettings.phone}</p>
                    </div>
                  </div>
                  <a
                    href={`tel:${coopSettings.phone.split('/')[0].trim()}`}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-[11px] hover:bg-emerald-700 transition-colors shrink-0"
                  >
                    {t('कल गर्नुहोस्', 'Call')}
                  </a>
                </div>
              </div>
            )}

            {/* TAB 2: MESSAGES (Live Interactive Chat Thread) */}
            {activeTab === 'messages' && (
              <div className="flex flex-col h-full">
                <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
                  {messages.map((m) => (
                    <div key={m.id} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
                      {m.sender !== 'user' && (
                        <div className="flex items-center gap-1.5 mb-1 px-1">
                          <img
                            src={m.agentAvatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100'}
                            alt=""
                            className="size-4 rounded-full object-cover ring-1 ring-emerald-500"
                          />
                          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                            {m.agentName || 'Unako Desk'}
                          </span>
                          <span className="size-1.5 rounded-full bg-emerald-500"></span>
                        </div>
                      )}

                      <div
                        className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed shadow-xs ${m.sender === 'user'
                          ? 'bg-[#e11d48] text-white font-medium rounded-br-none'
                          : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-700 rounded-bl-none'
                          }`}
                      >
                        <p>{m.text}</p>
                        <span className={`text-[9px] block text-right mt-1 opacity-70 ${m.sender === 'user' ? 'text-white' : 'text-slate-400'}`}>
                          {m.time}
                        </span>
                      </div>
                    </div>
                  ))}

                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex items-center gap-1.5 p-2 bg-white dark:bg-slate-800 rounded-2xl w-fit border border-slate-100 dark:border-slate-700 text-slate-400 text-xs">
                      <div className="size-2 rounded-full bg-[#e11d48] animate-bounce"></div>
                      <div className="size-2 rounded-full bg-[#e11d48] animate-bounce [animation-delay:0.2s]"></div>
                      <div className="size-2 rounded-full bg-[#e11d48] animate-bounce [animation-delay:0.4s]"></div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Suggestion Chips */}
                <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 overflow-x-auto flex gap-1.5 no-scrollbar shrink-0">
                  {[
                    t('कृषि कर्जा दर?', 'Agro Loan Rate?'),
                    t('मुद्दती ब्याज?', 'FD Interest?'),
                    t('केवाईसी कसरी?', 'How to KYC?'),
                    t('शाखा ठेगाना?', 'Branch Location?'),
                  ].map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSendMessage(chip)}
                      className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-[11px] font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap transition-colors"
                      style={{ color: 'inherit' }}
                    >
                      {chip}
                    </button>
                  ))}
                </div>

                {/* Input Bar */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="p-3 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center gap-2 shrink-0"
                >
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={t('आफ्नो प्रश्न यहाँ लेख्नुहोस्...', 'Type your message...')}
                    className="flex-1 px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400"
                    style={{ outlineColor: chatColors.launcherFrom }}
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim()}
                    className="p-2.5 rounded-xl text-white font-bold transition-all shadow-xs cursor-pointer disabled:opacity-40"
                    style={{
                      backgroundColor: inputMessage.trim() ? chatColors.launcherFrom : undefined,
                    }}
                    onMouseEnter={(e) => {
                      if (inputMessage.trim()) e.currentTarget.style.backgroundColor = chatColors.launcherHoverFrom;
                    }}
                    onMouseLeave={(e) => {
                      if (inputMessage.trim()) e.currentTarget.style.backgroundColor = chatColors.launcherFrom;
                    }}
                  >
                    <Send className="size-4" />
                  </button>
                </form>
              </div>
            )}

            {/* TAB 3: HELP (Knowledge & Branches) */}
            {activeTab === 'help' && (
              <div className="p-4 space-y-4">
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {t('सेवा केन्द्र तथा सम्पर्क', 'Branch Centers & Helpline')}
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-1">
                      <p className="font-bold text-slate-900 dark:text-white">{t('गढवा मुख्य कार्यालय', 'Gadhwa Central Office')}</p>
                      <p className="text-slate-500">गढवा बजार, वडा नं. ५, दाङ</p>
                      <p className="text-[#e11d48] font-bold font-mono">०८२-४१२०५५ / ९८५७८२१०००</p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-1">
                      <p className="font-bold text-slate-900 dark:text-white">{t('लमही सेवा केन्द्र', 'Lamahi Service Center')}</p>
                      <p className="text-slate-500">लमही बजार, लमही न.पा., दाङ</p>
                      <p className="text-[#e11d48] font-bold font-mono">०८२-५४०१२२</p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-1">
                      <p className="font-bold text-slate-900 dark:text-white">{t('सिसहनिया सेवा केन्द्र', 'Sisahaniya Service Center')}</p>
                      <p className="text-slate-500">सिसहनिया चोक, राप्ती गा.पा., दाङ</p>
                      <p className="text-[#e11d48] font-bold font-mono">०८२-५८०३३१</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold">
                    <Clock className="size-4" style={{ color: chatColors.launcherFrom }} />
                    <span>{t('कार्यालय समय', 'Office Hours')}</span>
                  </div>
                  <p className="text-slate-500 leading-relaxed">
                    {t('आइतबार - शुक्रबार: बिहान १०:०० देखि दिउँसो ४:०० बजेसम्म (नगद काउन्टर ३:०० सम्म)।', 'Sunday - Friday: 10:00 AM - 4:00 PM (Cash Counter closes at 3:00 PM).')}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 3. Bottom Navigation Bar (Home, Messages, Help) */}
          <div className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 px-6 py-2.5 flex items-center justify-around shrink-0">
            {/* Home Tab */}
            <button
              type="button"
              onClick={() => setActiveTab('home')}
              className="flex flex-col items-center gap-0.5 text-[11px] font-bold transition-colors cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              style={activeTab === 'home' ? { color: chatColors.launcherFrom } : {}}
            >
              <Home className="size-5" />
              <span>{t('गृहपृष्ठ', 'Home')}</span>
            </button>

            {/* Messages Tab with unread badge */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('messages');
                setUnreadCount(0);
              }}
              className="relative flex flex-col items-center gap-0.5 text-[11px] font-bold transition-colors cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              style={activeTab === 'messages' ? { color: chatColors.launcherFrom } : {}}
            >
              <div className="relative">
                <MessageSquare className="size-5" />
                {unreadCount > 0 && (
                  <span
                    className="absolute -top-1 -right-2 size-4 rounded-full text-white text-[9px] font-black flex items-center justify-center"
                    style={{ backgroundColor: chatColors.badge }}
                  >
                    {unreadCount}
                  </span>
                )}
              </div>
              <span>{t('सन्देशहरू', 'Messages')}</span>
            </button>

            {/* Help Tab */}
            <button
              type="button"
              onClick={() => setActiveTab('help')}
              className="flex flex-col items-center gap-0.5 text-[11px] font-bold transition-colors cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              style={activeTab === 'help' ? { color: chatColors.launcherFrom } : {}}
            >
              <HelpCircle className="size-5" />
              <span>{t('सहायता', 'Help')}</span>
            </button>
          </div>

          {/* Minimize Chevron button */}
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="absolute bottom-4 right-4 size-10 rounded-full text-white flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer z-10"
            style={{
              backgroundColor: chatColors.minimizeButton,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = chatColors.minimizeButtonHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = chatColors.minimizeButton;
            }}
            title="Minimize Chat"
          >
            <ChevronDown className="size-6" />
          </button>
        </div>
      )}
    </div>
  );
};
