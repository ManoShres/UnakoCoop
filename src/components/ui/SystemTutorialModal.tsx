import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Search,
  X,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  PiggyBank,
  FileCheck,
  ArrowLeftRight,
  PieChart,
  UserPlus,
  HelpCircle,
  Sparkles,
  FileText,
  Vote,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { useLanguageStore } from '../../store/useLanguageStore';

interface TutorialGuide {
  id: string;
  category: 'VISITOR' | 'MEMBER' | 'ADMIN' | 'ARCHITECTURE';
  titleEn: string;
  titleNp: string;
  route: string;
  icon: React.ComponentType<{ className?: string }>;
  stepsEn: string[];
  stepsNp: string[];
  tipsEn: string;
  tipsNp: string;
}

const TUTORIAL_GUIDES: TutorialGuide[] = [
  // VISITOR
  {
    id: 'vis-apply',
    category: 'VISITOR',
    titleEn: 'How to Apply for New Cooperative Membership & KYC',
    titleNp: 'नयाँ सहकारी सदस्यता र अनलाइन केवाईसी आवेदन कसरी दिने?',
    route: '/apply',
    icon: UserPlus,
    stepsEn: [
      'Click "Apply (सदस्यता आवेदन)" on the top navigation bar or visit /apply.',
      'Step 1 (Personal Info): Fill in your name, contact phone, and residential ward in Dang.',
      'Step 2 (Citizenship): Provide citizenship certificate number, issue district, and date.',
      'Step 3 (Document Upload): Upload citizenship front & back, passport photo, and utility bill.',
      'Step 4 (Nominee & Shares): Nominate a beneficiary and declare initial share capital units.',
      'Click "Submit Application". You will receive an application tracking reference (e.g. APP-2081-KYC-0492).',
    ],
    stepsNp: [
      'शीर्ष नेभिगेसन बारमा रहेको "सदस्यता आवेदन" बटन थिच्नुहोस् वा सिधै /apply मा जानुहोस्।',
      'चरण १ (व्यक्तिगत विवरण): आफ्नो नाम, सम्पर्क फोन र बसोबास रहेको वडा भर्नुहोस्।',
      'चरण २ (नागरिकता): नागरिकता प्रमाणपत्र नम्बर, जारी जिल्ला र मिति प्रविष्ट गर्नुहोस्।',
      'चरण ३ (कागजात अपलोड): नागरिकताको अगाडि/पछाडिको फोटो, फोटो र बिजुली बिल अपलोड गर्नुहोस्।',
      'चरण ४ (हकवाला र शेयर): इच्छाएको व्यक्ति (हकवाला) र प्रारम्भिक शेयर खरिद कित्ता छनोट गर्नुहोस्।',
      '"आवेदन पेश गर्नुहोस्" मा थिच्नुहोस्। तपाईंले आवेदन ट्र्याकिङ कोड प्राप्त गर्नुहुनेछ।',
    ],
    tipsEn: 'Once submitted, the central administration reviews your documents in the KYC Queue within 24-48 hours.',
    tipsNp: 'आवेदन पेश भएपछि केन्द्रीय प्रशासनले २४-४८ घण्टाभित्र कागजात प्रमाणीकरण गर्दछ।',
  },
  {
    id: 'vis-calculator',
    category: 'VISITOR',
    titleEn: 'Using the Interactive Loan & Savings Return Calculator',
    titleNp: 'कर्जा किस्ता (EMI) र बचत प्रतिफल क्यालकुलेटरको प्रयोग',
    route: '/',
    icon: Sparkles,
    stepsEn: [
      'Navigate to the Home page (/).',
      'Scroll down to the "Financial Schemes & Calculator" section.',
      'Adjust the loan principal slider (e.g., NPR 1,00,000 to 10,00,000) and tenure (12 to 60 months).',
      'View the dynamic monthly EMI installment and government interest subsidy breakdown in real time.',
    ],
    stepsNp: [
      'गृहपृष्ठ (/) मा जानुहोस्।',
      '"सहकारी वित्तीय योजनाहरू तथा क्यालकुलेटर" खण्डमा स्क्रोल गर्नुहोस्।',
      'कर्जा रकम (रु १ लाख देखि १० लाख) र अवधि (१२ देखि ६० महिना) को स्लाइडर सार्नुहोस्।',
      'मासिक किस्ता (EMI) र सरकारी अनुदान छुट सहितको वास्तविक रकम तुरुन्त हेर्नुहोस्।',
    ],
    tipsEn: 'Subsidized Agro loans receive up to 3.5% rebate under Ministry of Agriculture guidelines.',
    tipsNp: 'कृषि तथा पशुपालन कर्जामा कृषि मन्त्रालयको निर्देशिका बमोजिम ३.५% सम्म ब्याज अनुदान पाइन्छ।',
  },

  // MEMBER
  {
    id: 'mem-passbook',
    category: 'MEMBER',
    titleEn: 'Tracking Accounts & Printing Digital Passbook',
    titleNp: 'खाता विवरण तथा डिजिटल पासबुक हेर्ने र छाप्ने विधि',
    route: '/member/my-accounts-passbook',
    icon: PiggyBank,
    stepsEn: [
      'Log into the Member Portal and select "My Accounts & Passbook" from the sidebar.',
      'Switch between Regular Savings, Compulsory Monthly, or Child Education ledgers.',
      'Filter transactions by date range or transaction type (Deposit, Withdrawal, EMI, Dividend).',
      'Click "Print Passbook" on the top right to generate a print-ready physical booklet layout.',
    ],
    stepsNp: [
      'सदस्य पोर्टलमा लगइन गरी साइडबारबाट "खाता तथा पासबुक" छनोट गर्नुहोस्।',
      'नियमित बचत, अनिवार्य मासिक बचत, वा बाल बचत खाताहरू बीच स्विच गर्नुहोस्।',
      'मिति वा कारोबारको किसिम (जम्मा, भुक्तानी, किस्ता, लाभांश) अनुसार फिल्टर गर्नुहोस्।',
      'माथि दायाँ रहेको "पासबुक छाप्नुहोस्" बटन थिचेर आधिकारिक पासबुक ढाँचामा प्रिन्ट लिनुहोस्।',
    ],
    tipsEn: 'All transactions display both English and Bikram Sambat (BS) date timestamps with Core CBS reference numbers.',
    tipsNp: 'सबै कारोबारहरूमा बिक्रम संवत् (BS) मिति र केन्द्रीय बैंकिङ प्रणाली (CBS) कोड देखिन्छ।',
  },
  {
    id: 'mem-deposit-transfers',
    category: 'MEMBER',
    titleEn: 'Digital Deposits (eSewa/Khalti) & Member-to-Member Transfers',
    titleNp: 'डिजिटल वालेटबाट रकम जम्मा र सदस्य-सदस्य बीच रकमान्तर',
    route: '/member/transfers-payments',
    icon: ArrowLeftRight,
    stepsEn: [
      'Go to "Transfers & Payments" in the Member Portal.',
      'For Wallet Deposit: Select "Wallet Deposit Inward", choose eSewa/Khalti/ConnectIPS, enter amount, and confirm.',
      'For Member Transfer: Enter the recipient Member ID (e.g. UKO-2072-04419) to verify their name.',
      'Enter the transfer amount and transaction remarks, then click "Confirm Transfer".',
      'A real-time transaction voucher receipt is generated for your records.',
    ],
    stepsNp: [
      'सदस्य पोर्टलको "रकम स्थानान्तरण र भुक्तानी" मेनुमा जानुहोस्।',
      'वालेट जम्मा गर्न: "डिजिटल वालेट" छनोट गर्नुहोस्, eSewa/Khalti/ConnectIPS छान्नुहोस् र रकम पुष्टि गर्नुहोस्।',
      'सदस्यलाई पठाउन: प्रापकको सदस्य कोड (जस्तै UKO-2072-04419) राख्नासाथ उसको नाम स्वतः प्रमाणित हुन्छ।',
      'रकम र प्रयोजन लेखेर "रकम पठाउनुहोस्" मा थिच्नुहोस्।',
      'तपाईंको स्क्रिनमा तुरुन्तै आधिकारिक डिजिटल भौचर रसिद तयार हुन्छ।',
    ],
    tipsEn: 'Internal cooperative transfers are instant and incur zero settlement surcharges.',
    tipsNp: 'सहकारी भित्रका सदस्यहरू बीच हुने रकमान्तर तुरुन्तै हुन्छ र कुनै अतिरिक्त शुल्क लाग्दैन।',
  },
  {
    id: 'mem-loan-apply',
    category: 'MEMBER',
    titleEn: 'Applying for a Loan & Paying Monthly EMIs',
    titleNp: 'सहकारी ऋण आवेदन फारम भर्ने र मासिक किस्ता (EMI) तिर्ने तरिका',
    route: '/member/loan-portfolio-repayments',
    icon: FileCheck,
    stepsEn: [
      'To Apply: Click "Apply for Loan" (/member/apply-loan). Choose Scheme (Agro, Enterprise, Emergency).',
      'Enter requested amount, purpose, collateral description (land plot / cattle), and submit.',
      'To Pay EMI: Navigate to "Loan Portfolio & Repayments" (/member/loan-portfolio-repayments).',
      'Click "Pay EMI" next to your active loan, choose payment method, and complete payment.',
    ],
    stepsNp: [
      'ऋण लिन: "ऋण आवेदन फारम" (/member/apply-loan) मा गई योजना (कृषि, उद्यम, आपतकालीन) छान्नुहोस्।',
      'माग रकम, उद्देश्य र धितो/जमानी विवरण भरेर फारम दर्ता गर्नुहोस्।',
      'किस्ता तिर्न: "ऋण तथा किस्ता भुक्तानी" पृष्ठमा जानुहोस्।',
      'सक्रिय ऋण कार्ड छेउको "किस्ता भुक्तानी गर्नुहोस्" थिची बचत खाता वा वालेटबाट भुक्तानी गर्नुहोस्।',
    ],
    tipsEn: 'Paying before the 15th of each Nepali month earns a 0.5% prompt payment interest rebate.',
    tipsNp: 'प्रत्येक महिनाको १५ गतेभित्र किस्ता भुक्तानी गरेमा ०.५% ब्याज छुट पाइन्छ।',
  },
  {
    id: 'mem-shares-fd',
    category: 'MEMBER',
    titleEn: 'Purchasing Shares & Booking Mudhati Fixed Deposits',
    titleNp: 'थप शेयर खरिद तथा मुद्दती निक्षेप (Fixed Deposit) खाता खोल्ने विधि',
    route: '/member/shares-fixed-deposits',
    icon: PieChart,
    stepsEn: [
      'Go to "Shares & Fixed Deposits" in the sidebar.',
      'To Buy Shares: Click "Purchase Additional Shares", select units (@ NPR 100 par value), and confirm.',
      'To Open Mudhati: Click "Open Mudhati Deposit", select 1, 2, or 3-year tenure (up to 11.0% interest).',
      'Enter deposit principal and submit to issue an electronic Fixed Deposit Certificate.',
    ],
    stepsNp: [
      'साइडबारबाट "शेयर तथा मुद्दती निक्षेप" पृष्ठमा जानुहोस्।',
      'शेयर खरिद गर्न: "थप शेयर खरिद फारम" मा थिची कित्ता संख्या (प्रति कित्ता रु १००) छानेर पुष्टि गर्नुहोस्।',
      'मुद्दती खोल्न: "नयाँ मुद्दती खाता खोल्नुहोस्" थिची १ देखि ३ वर्षे अवधि (११.०% सम्म ब्याज) छान्नुहोस्।',
      'रकम प्रविष्ट गरी मुद्दती प्रमाणपत्र (FD Certificate) तुरुन्त प्राप्त गर्नुहोस्।',
    ],
    tipsEn: 'Shareholders are entitled to annual dividend distribution (historically 14.5%) and patronage refunds.',
    tipsNp: 'शेयर सदस्यहरूले वार्षिक साधारण सभाबाट पारित लाभांश (१४.५%) र संरक्षित पुँजी फिर्ता कोष पाउँछन्।',
  },
  {
    id: 'mem-agm-tax',
    category: 'MEMBER',
    titleEn: 'AGM Digital Entry Pass, e-Ballots & Tax Statements',
    titleNp: 'वार्षिक साधारण सभा (AGM) डिजिटल पास, मतदान र कर चुक्ता प्रमाणपत्र',
    route: '/member/cooperative-governance-support',
    icon: Vote,
    stepsEn: [
      'For AGM Pass: Navigate to "Governance & Support" -> Click "View Digital AGM Pass" for QR pass.',
      'For Voting: In the e-Ballot section, vote on resolutions (Approve Dividend, Audit Report, Board elections).',
      'For Tax Statement: Navigate to "Annual Statement & Tax" (/member/annual-statement).',
      'Click "Print Statement" for an official signed tax audit document for banks or IRD submission.',
    ],
    stepsNp: [
      'AGM पासका लागि: "सहकारी सुशासन र सहयोग" मा गई "डिजिटल AGM प्रवेश पास" हेर्नुहोस्।',
      'मतदानका लागि: विद्युतीय मतपत्र खण्डमा प्रस्तावहरू (लाभांश अनुमोदन, लेखापरीक्षण) मा मत हाल्नुहोस्।',
      'कर विवरणका लागि: "वार्षिक वित्तीय तथा कर विवरण" (/member/annual-statement) मा जानुहोस्।',
      '"विवरण छाप्नुहोस्" थिचेर बैंक वा कर कार्यालयमा बुझाउन मिल्ने आधिकारिक कागजात प्रिन्ट लिनुहोस्।',
    ],
    tipsEn: 'Tax statements automatically compute 5% TDS deductions on interest income per Inland Revenue Act.',
    tipsNp: 'आयकर ऐन अनुसार ब्याज आम्दानीमा लाग्ने ५% अग्रिम कर (TDS) कट्टी स्वतः हिसाब हुन्छ।',
  },

  // ADMIN
  {
    id: 'adm-kyc-queue',
    category: 'ADMIN',
    titleEn: 'Admin: KYC Document Scrutiny & Member Verification Queue',
    titleNp: 'प्रशासक: केवाईसी कागजात जाँच र सदस्य प्रमाणीकरण कार्यप्रणाली',
    route: '/admin/verifications',
    icon: ShieldCheck,
    stepsEn: [
      'Log into CBS Admin (/admin) and go to "KYC Document Queue" (/admin/verifications).',
      'Click on any pending member application to open the verification drawer.',
      'Inspect citizenship certificate front & back, photo, and signature.',
      'Click "Approve & Verify" to activate the member, or "Request Re-upload" if a document is illegible.',
    ],
    stepsNp: [
      'केन्द्रीय प्रशासन (/admin) मा लगइन गरी "केवाईसी कागजात प्रमाणीकरण" (/admin/verifications) मा जानुहोस्।',
      'विचाराधीन (Pending) सदस्य आवेदनमा थिचेर कागजात हेर्नुहोस्।',
      'नागरिकताको अगाडि/पछाडि, फोटो र हस्ताक्षरको शुद्धता जाँच्नुहोस्।',
      'सबै ठीक भएमा "प्रमाणित गर्नुहोस् (Approve)" मा थिच्नुहोस्, अन्यथा पुनः माग गर्नुहोस्।',
    ],
    tipsEn: 'Approving an applicant upgrades them instantly to active status with a full passbook and CBS record.',
    tipsNp: 'प्रमाणित गर्नासाथ सदस्यको खाता सक्रिय भई केन्द्रीय कोर बैंकिङमा पासबुक दर्ता हुन्छ।',
  },
  {
    id: 'adm-loan-committee',
    category: 'ADMIN',
    titleEn: 'Admin: Credit Committee Loan Underwriting & Approval',
    titleNp: 'प्रशासक: ऋण उपसमिति कर्जा मूल्याङ्कन र स्वीकृति प्रक्रिया',
    route: '/admin/loans',
    icon: FileCheck,
    stepsEn: [
      'Navigate to "Loans & Credit Queue" (/admin/loans).',
      'Select a submitted loan application to review debt-to-income ratio and collateral.',
      'Enter committee appraisal notes in the evaluation box.',
      'Click "Approve Application" to disburse funds into the member regular savings account.',
    ],
    stepsNp: [
      '"ऋण तथा कर्जा समिति" (/admin/loans) पृष्ठ खोल्नुहोस्।',
      'पेश भएको आवेदन छानेर आवेदकको आम्दानी, पुरानो ऋण र धितोको मूल्याङ्कन गर्नुहोस्।',
      'समितिको निर्णय टिप्पणी (Appraisal Notes) बक्समा लेख्नुहोस्।',
      '"स्वीकृत गर्नुहोस्" थिच्नासाथ ऋण रकम सदस्यको बचत खातामा सिधै जम्मा हुन्छ।',
    ],
    tipsEn: 'Approved loans immediately generate an automated monthly EMI repayment schedule.',
    tipsNp: 'ऋण स्वीकृत हुनासाथ मासिक किस्ता तालिका स्वतः प्रणालीमा सिर्जना हुन्छ।',
  },
  {
    id: 'adm-copomis',
    category: 'ADMIN',
    titleEn: 'Admin: COPOMIS Regulatory Data Export (Govt. of Nepal)',
    titleNp: 'प्रशासक: सरकारी सहकारी विभाग COPOMIS डाटा निकाल्ने विधि',
    route: '/admin/audit-reports',
    icon: FileText,
    stepsEn: [
      'Go to "Audit & Transparency" (/admin/audit-reports).',
      'Switch to the "Regulatory & Compliance" tab.',
      'Click "Download COPOMIS XML" or "Export CSV" to get the standardized report.',
      'Upload the file to the Ministry of Cooperatives COPOMIS portal for annual compliance.',
    ],
    stepsNp: [
      '"लेखा परीक्षण तथा प्रतिवेदन" (/admin/audit-reports) मा जानुहोस्।',
      '"सरकारी नियमन तथा परिपालना" ट्याबमा क्लिक गर्नुहोस्।',
      '"COPOMIS XML डाउनलोड" वा "CSV निकाल्नुहोस्" बटनमा थिच्नुहोस्।',
      'सहकारी विभागको COPOMIS पोर्टलमा उक्त फाइल अपलोड गरी वार्षिक प्रतिवेदन बुझाउनुहोस्।',
    ],
    tipsEn: 'The generated XML includes cooperative registration details, audited ledger totals, and member counts.',
    tipsNp: 'तयार हुने XML फाइलमा संस्थाको दर्ता नं, कुल शेयर पूँजी, निक्षेप र ऋणको सम्पूर्ण हिसाब समावेश हुन्छ।',
  },

  // ARCHITECTURE
  {
    id: 'arch-codebase',
    category: 'ARCHITECTURE',
    titleEn: 'System Architecture, ECC Standards & Code Structure',
    titleNp: 'प्रणाली संरचना, ECC कोड मापदण्ड र फोल्डर नक्शा',
    route: '/',
    icon: Layers,
    stepsEn: [
      'State Management: Zustand stores located in src/store/ (useCoopStore, useAuthStore, useLanguageStore).',
      'Routing: App.tsx organizes routes into PublicLayout, MemberLayout, and AdminLayout.',
      'Types: Strict TypeScript contracts in src/types/index.ts (zero `any` types).',
      'Immutability: All state mutations return fresh object/array references using spread operators.',
      'Verification: Run `npm run lint` for oxlint and `npm run build` for production bundle compilation.',
    ],
    stepsNp: [
      'स्टेट व्यवस्थापन: src/store/ मा रहेका Zustand स्टोरहरू (useCoopStore, useAuthStore, useLanguageStore)।',
      'राउटर: App.tsx मा PublicLayout, MemberLayout र AdminLayout को विभाजन।',
      'टाइपहरू: src/types/index.ts मा कडा TypeScript मोडलहरू।',
      'इम्युटेबिलिटी: सबै डाटा परिवर्तनहरू सुरक्षित spread operator मार्फत नयाँ अबजेक्ट बनाइन्छ।',
      'जाँच: oxlint का लागि `npm run lint` र कम्पाइलका लागि `npm run build` प्रयोग गर्नुहोस्।',
    ],
    tipsEn: 'Adheres to Everything Claude Code (ECC) modular guidelines with high cohesion and zero hardcoded secrets.',
    tipsNp: 'सुरक्षित, सफा र व्यवस्थित ECC कोडिङ मापदण्डको पूर्ण परिपालना गरिएको छ।',
  },
  {
    id: 'arch-keyboard-shortcuts',
    category: 'ARCHITECTURE',
    titleEn: 'Keyboard Accessibility & Global Power-User Shortcuts',
    titleNp: 'किबोर्ड पहुँचयोग्यता र सार्वभौम पावर-युजर सर्टकटहरू',
    route: '/admin',
    icon: Sparkles,
    stepsEn: [
      'Press "?" anywhere (outside input fields) to toggle the interactive Keyboard Shortcut Guide modal.',
      'Press "Ctrl + Shift + L" to instantly toggle bilingual interface between Nepali and English.',
      'Press "Ctrl + K" or "/" to immediately focus the primary search bar on any directory or ledger page.',
      'Press "Escape" at any time to close modals, drawers, or overlay dialogues.',
      'Administrative Quick Navigation: Use Alt+D (Dashboard), Alt+M (Members), Alt+S (Savings), Alt+L (Loans), Alt+T (Teller), Alt+G (Mother Groups), Alt+H (Homepage).',
    ],
    stepsNp: [
      'इनपुट बाकस बाहिर कतै पनि "?" थिचेर किबोर्ड सर्टकट निर्देशिका खोल्नुहोस् वा बन्द गर्नुहोस्।',
      '"Ctrl + Shift + L" थिचेर नेपाली र अंग्रेजी भाषा तुरुन्तै परिवर्तन गर्नुहोस्।',
      '"Ctrl + K" वा "/" थिचेर कुनै पनि पृष्ठको मुख्य खोज बाकसमा तुरुन्त ध्यान केन्द्रित गर्नुहोस्।',
      '"Escape" थिचेर जुनसुकै मोडल वा विन्डो तत्काल बन्द गर्नुहोस्।',
      'प्रशासकीय द्रुत नेभिगेसन: Alt+D (ड्यासबोर्ड), Alt+M (सदस्यहरू), Alt+S (बचत), Alt+L (ऋण), Alt+T (काउन्टर टेलर), Alt+G (आमा समूह), Alt+H (गृहपृष्ठ)।',
    ],
    tipsEn: 'All modal dialogues feature full focus traps, aria attributes, and close automatically when pressing Escape.',
    tipsNp: 'सबै मोडलहरूमा पहुँचयोग्यता (Accessibility) मापदण्ड र Escape मार्फत बन्द हुने सुविधा उपलब्ध छ।',
  },
];

export const SystemTutorialModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'VISITOR' | 'MEMBER' | 'ADMIN' | 'ARCHITECTURE'>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>('vis-apply');
  const { lang, t } = useLanguageStore();
  const navigate = useNavigate();

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-system-tutorial', handleOpen);
    return () => window.removeEventListener('open-system-tutorial', handleOpen);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredGuides = TUTORIAL_GUIDES.filter((g) => {
    const matchesCategory = activeCategory === 'ALL' || g.category === activeCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      g.titleEn.toLowerCase().includes(q) ||
      g.titleNp.toLowerCase().includes(q) ||
      g.stepsEn.some((s) => s.toLowerCase().includes(q)) ||
      g.stepsNp.some((s) => s.toLowerCase().includes(q)) ||
      g.route.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const handleNavigate = (route: string) => {
    setIsOpen(false);
    navigate(route);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="system-tutorial-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-fade-in"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-slate-900 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md">
              <BookOpen className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="system-tutorial-title" className="text-lg sm:text-xl font-black tracking-tight">
                  {t('उनको प्रणाली प्रयोग निर्देशिका तथा सहयोग केन्द्र', 'Unako System Tutorial & Feature Guide')}
                </h2>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                  ECC Guide
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t('कुन सुविधा कहाँ छ र कसरी प्रयोग गर्ने? विस्तृत कार्यविधि र सर्टकटहरू', 'Where everything is located and step-by-step how to use each feature')}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close tutorial"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row gap-3 shrink-0">
          <div className="relative flex-1">
            <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('सुविधा, पृष्ठ वा कार्यविधि खोज्नुहोस्...', 'Search features, routes or guides (e.g. EMI, Passbook, KYC, COPOMIS)...')}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {(
              [
                { key: 'ALL', label: t('सबै', 'All') },
                { key: 'VISITOR', label: t('सर्वसाधारण', 'Public') },
                { key: 'MEMBER', label: t('सदस्य सेवा', 'Member') },
                { key: 'ADMIN', label: t('प्रशासक', 'Admin CBS') },
                { key: 'ARCHITECTURE', label: t('प्रणाली संरचना', 'Code Map') },
              ] as const
            ).map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeCategory === cat.key
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Guides List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 custom-scrollbar">
          {filteredGuides.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <HelpCircle className="size-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold">{t('कुनै नतिजा फेला परेन', 'No matching guides found')}</p>
              <p className="text-xs text-slate-500 mt-1">{t('कृपया अर्को शब्द खोज्नुहोस्', 'Try searching for another keyword')}</p>
            </div>
          ) : (
            filteredGuides.map((guide) => {
              const isExpanded = expandedId === guide.id;
              const IconComp = guide.icon;

              return (
                <div
                  key={guide.id}
                  className={`rounded-2xl border transition-all ${
                    isExpanded
                      ? 'border-emerald-500/50 bg-emerald-50/20 dark:bg-emerald-950/20 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/60'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : guide.id)}
                    className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="size-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <IconComp className="size-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {guide.category}
                          </span>
                          <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                            {guide.route}
                          </span>
                        </div>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                          {t(guide.titleNp, guide.titleEn)}
                        </h3>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hidden sm:inline">
                        {isExpanded ? t('बन्द गर्नुहोस्', 'Hide') : t('विवरण हेर्नुहोस्', 'View Steps')}
                      </span>
                      <ArrowRight
                        className={`size-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-90 text-emerald-500' : ''}`}
                      />
                    </div>
                  </button>

                  {/* Expanded Step-by-Step Details */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-1 border-t border-slate-100 dark:border-slate-800/80 space-y-4">
                      <div className="space-y-2 mt-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          {t('चरणबद्ध कार्यविधि:', 'Step-by-Step Instructions:')}
                        </h4>
                        <ol className="space-y-1.5">
                          {(lang === 'ne' ? guide.stepsNp : guide.stepsEn).map((step, idx) => (
                            <li key={idx} className="text-xs text-slate-700 dark:text-slate-200 flex items-start gap-2">
                              <span className="size-4 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                                {idx + 1}
                              </span>
                              <span className="flex-1 leading-relaxed">{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>

                      {/* Helpful Tip */}
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
                        <CheckCircle2 className="size-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <span className="font-bold">{t('महत्त्वपूर्ण जानकारी: ', 'Helpful Tip: ')}</span>
                          {t(guide.tipsNp, guide.tipsEn)}
                        </div>
                      </div>

                      {/* Jump to Page Button */}
                      {guide.route && (
                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => handleNavigate(guide.route)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                          >
                            <span>{t(`सिधै ${guide.route} पृष्ठमा जानुहोस्`, `Go to ${guide.route}`)}</span>
                            <ExternalLink className="size-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{t('उनको बचत तथा ऋण सहकारी संस्था लि. • केन्द्रीय बैंकिङ प्रणाली', 'Unako Saving & Credit Cooperative Ltd. • CBS v2.5')}</span>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="px-4 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold transition-colors cursor-pointer"
          >
            {t('निर्देशिका बन्द गर्नुहोस्', 'Close Guide')}
          </button>
        </div>
      </div>
    </div>
  );
};
