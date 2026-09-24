export type ShgCategory = 'women' | 'dairy' | 'agro' | 'mixed' | 'all';
export type ShgWard = 'all' | 'w1' | 'w2' | 'w3' | 'w4' | 'w5' | 'w6';

export interface ShgMember {
  name: string;
  role: string;
  id: string;
}

export interface ShgGroup {
  id: string;
  code: string;
  name: string;
  category: 'women' | 'dairy' | 'agro' | 'mixed';
  categoryLabel: { ne: string; en: string };
  categoryIcon: string;
  ward: ShgWard;
  grade: string;
  isUserGroup?: boolean;
  location: {
    address: { ne: string; en: string };
    venue: { ne: string; en: string };
  };
  meeting: {
    schedule: { ne: string; en: string };
    time: { ne: string; en: string };
  };
  coordinator: {
    initials: { ne: string; en: string };
    name: { ne: string; en: string };
    phone?: string;
    occupation: { ne: string; en: string };
  };
  demographics: {
    total: number;
    breakdown: { ne: string; en: string };
    highlight?: { ne: string; en: string };
  };
  fund: {
    totalSavings: { ne: string; en: string };
    savingsNote: { ne: string; en: string };
    metricTitle: { ne: string; en: string };
    metricValue: { ne: string; en: string };
    metricSub: { ne: string; en: string };
    mobilizationPercent?: number;
  };
}

export const SHG_GROUPS: ShgGroup[] = [
  {
    id: 'shg-1',
    code: 'UKO-SHG-05-003',
    name: 'गढवा महिला-पुरुष स्वावलम्बी उपसमूह #०३',
    category: 'mixed',
    categoryLabel: { ne: 'तपाईंको उपसमूह', en: 'Your Group' },
    categoryIcon: 'account_circle',
    ward: 'w5',
    grade: 'Grade-A Outstanding',
    isUserGroup: true,
    location: {
      address: { ne: 'गढवा-५, चैनपुर गाउँ', en: 'Gadhwa-5, Chainpur Village' },
      venue: { ne: 'बैठक: चैनपुर सामुदायिक भवन', en: 'Venue: Chainpur Community Hall' },
    },
    meeting: {
      schedule: { ne: 'प्रत्येक महिनाको १५ गते', en: 'Every 15th of the Month' },
      time: { ne: 'समय: दिउँसो ठीक २:०० बजे', en: 'Time: 2:00 PM Sharp' },
    },
    coordinator: {
      initials: { ne: 'शा', en: 'Sh' },
      name: { ne: 'शान्ता चौधरी', en: 'Shanta Chaudhary' },
      phone: '९८६८६-***** (गोप्य)',
      occupation: { ne: 'संयोजक', en: 'Coordinator' },
    },
    demographics: {
      total: 28,
      breakdown: { ne: 'महिला: १८ | पुरुष: १०', en: 'Female: 18 | Male: 10' },
    },
    fund: {
      totalSavings: { ne: 'रु. ४,८५,०००', en: 'NPR 4,85,000' },
      savingsNote: { ne: 'नियमित मासिक वृद्धि', en: 'Regular Monthly Growth' },
      metricTitle: { ne: 'सक्रिय आन्तरिक ऋण', en: 'Active Internal Loan' },
      metricValue: { ne: 'रु. ३,२०,०००', en: 'NPR 3,20,000' },
      metricSub: { ne: '६६% कोष परिचालित', en: '66% Fund Mobilized' },
      mobilizationPercent: 66,
    },
  },
  {
    id: 'shg-2',
    code: 'UKO-SHG-05-012',
    name: 'चौरि दुग्ध उत्पादक सहकारी उपसमूह',
    category: 'dairy',
    categoryLabel: { ne: 'दुग्ध उत्पादक समूह', en: 'Dairy Producers Group' },
    categoryIcon: 'local_drink',
    ward: 'w5',
    grade: 'Grade-A',
    location: {
      address: { ne: 'गढवा-५, देउखुरी चौरि टोल', en: 'Gadhwa-5, Deukhuri Chauri Tole' },
      venue: { ne: 'संकलन केन्द्र: चौरि डेरी युनिट', en: 'Collection Center: Chauri Dairy Unit' },
    },
    meeting: {
      schedule: { ne: 'प्रत्येक महिनाको १ गते', en: 'Every 1st of the Month' },
      time: { ne: 'बिहान ८:०० बजे', en: '8:00 AM' },
    },
    coordinator: {
      initials: { ne: 'भो', en: 'Bh' },
      name: { ne: 'भोजराज थारु', en: 'Bhojraj Tharu' },
      occupation: { ne: 'पेशा: उन्नत गाई-भैँसी पालन', en: 'Occupation: Modern Dairy Farming' },
    },
    demographics: {
      total: 42,
      breakdown: { ne: 'सदस्य: ४२ कृषक परिवार', en: 'Members: 42 Farming Households' },
      highlight: { ne: '८५० लिटर/दिन संकलन', en: '850 L/Day Collection' },
    },
    fund: {
      totalSavings: { ne: 'रु. १८,५०,०००', en: 'NPR 18,50,000' },
      savingsNote: { ne: 'अनुदान सुलभ ब्याजदर', en: 'Subsidized Concessional Rate' },
      metricTitle: { ne: 'वार्षिक चिलिङ भ्याट क्षमता', en: 'Annual Chilling Vat Capacity' },
      metricValue: { ne: '२,००० लि.', en: '2,000 L' },
      metricSub: { ne: 'सहकारी प्राविधिक सहयोग', en: 'Cooperative Technical Support' },
    },
  },
  {
    id: 'shg-3',
    code: 'UKO-SHG-01-007',
    name: 'गोबर्दिहा प्रगतिशील महिला उपसमूह',
    category: 'women',
    categoryLabel: { ne: 'महिला स्वावलम्बी उपसमूह', en: 'Women Self-Help Group' },
    categoryIcon: 'woman',
    ward: 'w1',
    grade: 'Grade-A',
    location: {
      address: { ne: 'गढवा-१, गोबर्दिहा बजार', en: 'Gadhwa-1, Gobardiha Bazaar' },
      venue: { ne: 'बैठक: महिला विकास भवन', en: 'Venue: Women Development Hall' },
    },
    meeting: {
      schedule: { ne: 'प्रत्येक महिनाको १० गते', en: 'Every 10th of the Month' },
      time: { ne: 'दिउँसो १:०० बजे', en: '1:00 PM' },
    },
    coordinator: {
      initials: { ne: 'वि', en: 'Bi' },
      name: { ne: 'विमला कुमारी यादव', en: 'Bimala Kumari Yadav' },
      occupation: { ne: 'पेशा: सिलाइकटाइ तथा बाख्रापालन', en: 'Occupation: Tailoring & Goat Farming' },
    },
    demographics: {
      total: 35,
      breakdown: { ne: '१००% बचत सहभागिता', en: '100% Savings Participation' },
    },
    fund: {
      totalSavings: { ne: 'रु. ६,१०,०००', en: 'NPR 6,10,000' },
      savingsNote: { ne: 'आपतकालीन राहत कोष सहित', en: 'Includes Emergency Relief Fund' },
      metricTitle: { ne: 'सीप विकास तथा लघु उद्यम', en: 'Skill & Micro-Enterprise' },
      metricValue: { ne: '१४ उद्यमी', en: '14 Entrepreneurs' },
      metricSub: { ne: 'सिलाई तथा अगरबत्ती उत्पादन', en: 'Tailoring & Incense Production' },
    },
  },
  {
    id: 'shg-4',
    code: 'UKO-SHG-03-019',
    name: 'लमही साझा कृषि तथा मौरीपालन समूह',
    category: 'agro',
    categoryLabel: { ne: 'मौरी तथा तोरी कृषक', en: 'Apiary & Mustard Farmers' },
    categoryIcon: 'psychiatry',
    ward: 'w3',
    grade: 'Grade-B+',
    location: {
      address: { ne: 'लमही-३, बनगाउँ फाँट', en: 'Lamahi-3, Bangaun Flat' },
      venue: { ne: 'प्राङ्गारिक मह संकलन केन्द्र', en: 'Organic Honey Collection Center' },
    },
    meeting: {
      schedule: { ne: 'प्रत्येक महिनाको २० गते', en: 'Every 20th of the Month' },
      time: { ne: 'बिहान ७:३० बजे', en: '7:30 AM' },
    },
    coordinator: {
      initials: { ne: 'चे', en: 'Ch' },
      name: { ne: 'चेत नारायण थारु', en: 'Chet Narayan Tharu' },
      occupation: { ne: 'पेशा: मौरीपालन तथा तोरी-खेती', en: 'Occupation: Beekeeping & Mustard Farming' },
    },
    demographics: {
      total: 24,
      breakdown: { ne: 'घार संख्या: २८०+ मौरी घार', en: 'Hives: 280+ Beehives' },
    },
    fund: {
      totalSavings: { ne: 'रु. ३,४०,०००', en: 'NPR 3,40,000' },
      savingsNote: { ne: 'उपकरण खरिद कोष सहित', en: 'Includes Equipment Purchase Fund' },
      metricTitle: { ne: 'वार्षिक प्राङ्गारिक मह उत्पादन', en: 'Annual Organic Honey Production' },
      metricValue: { ne: '१,४५० के.जी.', en: '1,450 kg' },
      metricSub: { ne: 'देउखुरी ब्राण्डिङ अन्तर्गत', en: 'Under Deukhuri Branding' },
    },
  },
];
