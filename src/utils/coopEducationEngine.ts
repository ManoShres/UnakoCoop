/**
 * Unako SACCOS - Cooperative Education, Training & Capacity Building Fund Ledger Engine
 * (सहकारी शिक्षा तथा तालिम कोष खर्च तथा क्षमता अभिवृद्धि सञ्चालन प्रणाली)
 * 
 * Statutory Regulatory Authority:
 * - Nepal Cooperative Act 2074 (सहकारी ऐन २०७४) Section 68(3)
 *   (वार्षिक खुद बचतको न्यूनतम ३% सहकारी शिक्षा तथा तालिम कोषमा छुट्याउनुपर्ने)
 * - Department of Cooperatives Directives on Member Financial Literacy & Governance
 * - Minimum 70% In-house training utilization / Maximum 30% Union remittance guidelines
 */

export type TrainingCategory =
  | 'FINANCIAL_LITERACY'
  | 'MICRO_ENTERPRISE'
  | 'COOP_GOVERNANCE'
  | 'WOMEN_EMPOWERMENT'
  | 'YOUTH_DIGITAL_BANKING'
  | 'BOARD_SUPERVISORY_ORIENTATION'
  | 'STAFF_AML_COMPLIANCE';

export type TargetAudience =
  | 'GENERAL_MEMBERS'
  | 'WOMEN_GROUPS'
  | 'BOARD_MEMBERS'
  | 'SUPERVISORY_COMMITTEE'
  | 'STAFF_OFFICERS'
  | 'POTENTIAL_MEMBERS';

export type TrainingStatus = 'PLANNED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

export interface ExpenseItem {
  id: string;
  description: string;
  category: 'TRAINER_HONORARIUM' | 'FOOD_REFRESHMENT' | 'STATIONERY_MATERIAL' | 'VENUE_LOGISTICS' | 'TRAVEL_ALLOWANCE' | 'MISCELLANEOUS';
  amount: number;
  voucherNo: string;
  invoiceDate: string;
}

export interface TrainingProgram {
  id: string;
  programCode: string;
  titleNepali: string;
  titleEnglish: string;
  category: TrainingCategory;
  targetAudience: TargetAudience;
  trainerName: string;
  trainerOrganization: string;
  venue: string;
  startDateNepali: string;
  endDateNepali: string;
  durationDays: number;
  durationHours: number;
  plannedBudget: number;
  expenses: ExpenseItem[];
  totalActualExpense: number;
  participantsMale: number;
  participantsFemale: number;
  participantsMarginalized: number;
  totalParticipants: number;
  status: TrainingStatus;
  boardMinuteNo: string;
  notes?: string;
}

export interface CoopEducationFundSummary {
  fiscalYear: string;
  netSurplus: number;
  statutoryAllocationRate: number; // typically 0.03 (3%) to 0.05 (5%)
  allocatedSurplusAmount: number;
  openingBalance: number;
  externalGrantOrSubsidy: number;
  totalAvailableFund: number;
  inHouseExpenditure: number;
  unionContributionRemitted: number;
  totalDisbursed: number;
  remainingBalance: number;
  statutoryUtilizationRate: number; // % of total fund disbursed
  inHouseSharePercent: number; // % of disbursement spent on in-house programs (target >= 70%)
  unionSharePercent: number; // % remitted to coop union (target <= 30%)
  sec68Compliant: boolean;
  complianceNotes: string[];
}

export interface TrainingMetrics {
  totalPrograms: number;
  completedPrograms: number;
  ongoingPrograms: number;
  totalParticipants: number;
  totalFemaleParticipants: number;
  totalMaleParticipants: number;
  totalMarginalizedParticipants: number;
  femaleRatioPercent: number;
  memberCoveragePercent: number;
  totalExpenditure: number;
  averageCostPerParticipant: number;
  categoryDistribution: Record<TrainingCategory, number>;
}

export const CATEGORY_LABELS: Record<TrainingCategory, { ne: string; en: string }> = {
  FINANCIAL_LITERACY: {
    ne: 'वित्तीय साक्षरता तथा घरेलु बचत',
    en: 'Financial Literacy & Household Savings',
  },
  MICRO_ENTERPRISE: {
    ne: 'लघु उद्यमशीलता तथा कृषि सीप विकास',
    en: 'Micro-Enterprise & Agri-Skills Development',
  },
  COOP_GOVERNANCE: {
    ne: 'सहकारी मूल्य, मान्यता र सुशासन',
    en: 'Cooperative Values, Principles & Governance',
  },
  WOMEN_EMPOWERMENT: {
    ne: 'महिला नेतृत्व तथा सशक्तीकरण',
    en: 'Women Leadership & Empowerment',
  },
  YOUTH_DIGITAL_BANKING: {
    ne: 'युवा सीप तथा डिजिटल वित्तीय प्रविधि',
    en: 'Youth Skills & Digital FinTech Banking',
  },
  BOARD_SUPERVISORY_ORIENTATION: {
    ne: 'सञ्चालक तथा लेखा सुपरीवेक्षण क्षमता विकास',
    en: 'Board & Supervisory Committee Capacity Building',
  },
  STAFF_AML_COMPLIANCE: {
    ne: 'कर्मचारी दक्षता, सम्पत्ति शुद्धीकरण (AML) तथा COPOMIS',
    en: 'Staff Competency, AML/CFT & COPOMIS',
  },
};

export const AUDIENCE_LABELS: Record<TargetAudience, { ne: string; en: string }> = {
  GENERAL_MEMBERS: { ne: 'साधारण सेयर सदस्य', en: 'General Share Members' },
  WOMEN_GROUPS: { ne: 'मातृ समूह तथा महिला सदस्य', en: 'Mother Groups & Women Members' },
  BOARD_MEMBERS: { ne: 'सञ्चालक समिति', en: 'Board of Directors' },
  SUPERVISORY_COMMITTEE: { ne: 'लेखा सुपरीवेक्षण समिति', en: 'Supervisory Committee' },
  STAFF_OFFICERS: { ne: 'व्यवस्थापक तथा कर्मचारी', en: 'Management & Staff' },
  POTENTIAL_MEMBERS: { ne: 'सम्भावित नयाँ सदस्य तथा समुदाय', en: 'Prospective Members & Community' },
};

export const DEFAULT_TRAINING_PROGRAMS: TrainingProgram[] = [
  {
    id: 'trn-001',
    programCode: 'UNAKO-TRN-2081-01',
    titleNepali: 'महिला सदस्य वित्तीय साक्षरता तथा घरेलु बचत अभिवृद्धि तालिम',
    titleEnglish: 'Women Member Financial Literacy & Household Budgeting Workshop',
    category: 'FINANCIAL_LITERACY',
    targetAudience: 'WOMEN_GROUPS',
    trainerName: 'शारदा शर्मा (वरिष्ठ प्रशिक्षक, नेफ्स्कून)',
    trainerOrganization: 'NEFSCUN Field Office, Dang',
    venue: 'उनको साकोस सभाहल, गढवा-५, दाङ',
    startDateNepali: '२०८१-०२-१२',
    endDateNepali: '२०८१-०२-१४',
    durationDays: 3,
    durationHours: 18,
    plannedBudget: 45000,
    expenses: [
      { id: 'exp-101', description: 'प्रशिक्षक पारिश्रमिक तथा यातायात', category: 'TRAINER_HONORARIUM', amount: 18000, voucherNo: 'JV-81-042', invoiceDate: '२०८१-०२-१४' },
      { id: 'exp-102', description: 'सहभागी दिवा खाजा तथा चियापान', category: 'FOOD_REFRESHMENT', amount: 16500, voucherNo: 'JV-81-043', invoiceDate: '२०८१-०२-१४' },
      { id: 'exp-103', description: 'कार्यपुस्तिका, कापी र कलम', category: 'STATIONERY_MATERIAL', amount: 8500, voucherNo: 'JV-81-044', invoiceDate: '२०८१-०२-१२' },
    ],
    totalActualExpense: 43000,
    participantsMale: 0,
    participantsFemale: 48,
    participantsMarginalized: 22,
    totalParticipants: 48,
    status: 'COMPLETED',
    boardMinuteNo: 'निर्णय नं. ४/२०८१',
    notes: '४८ जना महिला सदस्यहरूले घरायसी बजेट निर्माण तथा डिजिटल क्युआर भुक्तानी सम्बन्धी व्यवहारिक ज्ञान हासिल गरे।',
  },
  {
    id: 'trn-002',
    programCode: 'UNAKO-TRN-2081-02',
    titleNepali: 'च्याउ खेती तथा मौरीपालन लघु-उद्यमशीलता सीप विकास कार्यशाला',
    titleEnglish: 'Mushroom Cultivation & Apiculture Micro-Enterprise Training',
    category: 'MICRO_ENTERPRISE',
    targetAudience: 'GENERAL_MEMBERS',
    trainerName: 'डा. भरत अधिकारी (कृषि विज्ञ)',
    trainerOrganization: 'कृषि ज्ञान केन्द्र, दाङ',
    venue: 'गढवा गाउँपालिका कृषि विकास केन्द्र',
    startDateNepali: '२०८१-०३-०५',
    endDateNepali: '२०८१-०३-०८',
    durationDays: 4,
    durationHours: 24,
    plannedBudget: 60000,
    expenses: [
      { id: 'exp-201', description: 'प्राविधिक प्रशिक्षक भत्ता', category: 'TRAINER_HONORARIUM', amount: 22000, voucherNo: 'JV-81-088', invoiceDate: '२०८१-०३-०८' },
      { id: 'exp-202', description: 'प्रायोगिक बीउ तथा किट वितरण', category: 'STATIONERY_MATERIAL', amount: 19500, voucherNo: 'JV-81-089', invoiceDate: '२०८१-०३-०५' },
      { id: 'exp-203', description: 'खाजा तथा हल व्यवस्थापन', category: 'FOOD_REFRESHMENT', amount: 15500, voucherNo: 'JV-81-090', invoiceDate: '२०८१-०३-०८' },
    ],
    totalActualExpense: 57000,
    participantsMale: 14,
    participantsFemale: 26,
    participantsMarginalized: 18,
    totalParticipants: 40,
    status: 'COMPLETED',
    boardMinuteNo: 'निर्णय नं. ६/२०८१',
    notes: 'तालिम पश्चात् १५ जना सदस्यहरूले सहुलियतपूर्ण लघु उद्यम कर्जाका लागि प्रारम्भिक आवेदन दर्ता गराए।',
  },
  {
    id: 'trn-003',
    programCode: 'UNAKO-TRN-2081-03',
    titleNepali: 'सञ्चालक तथा लेखा सुपरीवेक्षण समिति सहकारी सुशासन तथा PEARLS तालिम',
    titleEnglish: 'Board & Supervisory Committee Cooperative Governance & PEARLS Training',
    category: 'BOARD_SUPERVISORY_ORIENTATION',
    targetAudience: 'BOARD_MEMBERS',
    trainerName: 'केशवराज पन्त (चार्टर्ड एकाउन्टेन्ट / सहकारी विज्ञ)',
    trainerOrganization: 'राष्ट्रिय सहकारी महासंघ, काठमाडौं',
    venue: 'होटेल पौवा, भालुवाङ, दाङ',
    startDateNepali: '२०८१-०४-१८',
    endDateNepali: '२०८१-०४-१९',
    durationDays: 2,
    durationHours: 14,
    plannedBudget: 35000,
    expenses: [
      { id: 'exp-301', description: 'प्रशिक्षक शुल्क तथा परामर्श', category: 'TRAINER_HONORARIUM', amount: 16000, voucherNo: 'JV-81-125', invoiceDate: '२०८१-०४-१९' },
      { id: 'exp-302', description: 'गोष्ठी हल भाडा तथा साउण्ड सिस्टम', category: 'VENUE_LOGISTICS', amount: 9000, voucherNo: 'JV-81-126', invoiceDate: '२०८१-०४-१९' },
      { id: 'exp-303', description: 'खाना, चियापान तथा कार्यपत्र पुस्तिका', category: 'FOOD_REFRESHMENT', amount: 8000, voucherNo: 'JV-81-127', invoiceDate: '२०८१-०४-१९' },
    ],
    totalActualExpense: 33000,
    participantsMale: 8,
    participantsFemale: 6,
    participantsMarginalized: 3,
    totalParticipants: 14,
    status: 'COMPLETED',
    boardMinuteNo: 'निर्णय नं. ९/२०८१',
    notes: 'सहकारी ऐन २०७४ का दफा ३७ देखि ४३ र PEARLS सूचकाङ्क अनुगमन कार्यविधि सम्बन्धमा सञ्चालक तथा लेखा समितिको संयुक्त समीक्षा।',
  },
  {
    id: 'trn-004',
    programCode: 'UNAKO-TRN-2081-04',
    titleNepali: 'कर्मचारी पेशागत सक्षमता, सम्पत्ति शुद्धीकरण (AML/CFT) तथा COPOMIS कार्यशाला',
    titleEnglish: 'Staff AML/CFT Compliance, Financial Crimes & COPOMIS MIS Workshop',
    category: 'STAFF_AML_COMPLIANCE',
    targetAudience: 'STAFF_OFFICERS',
    trainerName: 'रमेश खड्का (सम्पत्ति शुद्धीकरण अनुसन्धान विभाग पूर्व-अधिकृत)',
    trainerOrganization: 'FinTech Compliance Nepal',
    venue: 'उनको साकोस मुख्य शाखा हल, गढवा-५',
    startDateNepali: '२०८१-०५-०४',
    endDateNepali: '२०८१-०५-०५',
    durationDays: 2,
    durationHours: 12,
    plannedBudget: 25000,
    expenses: [
      { id: 'exp-401', description: 'प्रशिक्षक पारिश्रमिक', category: 'TRAINER_HONORARIUM', amount: 12000, voucherNo: 'JV-81-160', invoiceDate: '२०८१-०५-०५' },
      { id: 'exp-402', description: 'कर्मचारी प्रशिक्षण सामग्री तथा चियापान', category: 'FOOD_REFRESHMENT', amount: 6500, voucherNo: 'JV-81-161', invoiceDate: '२०८१-०५-०५' },
    ],
    totalActualExpense: 18500,
    participantsMale: 6,
    participantsFemale: 4,
    participantsMarginalized: 2,
    totalParticipants: 10,
    status: 'COMPLETED',
    boardMinuteNo: 'निर्णय नं. ११/२०८१',
    notes: 'उच्च जोखिमयुक्त कारोबार पहिचान, goAML प्रतिवेदन प्रणाली र राष्ट्रिय परिचयपत्र ई-केवाइसी प्रमाणीकरण प्रोटोकल सञ्चालन।',
  },
  {
    id: 'trn-005',
    programCode: 'UNAKO-TRN-2081-05',
    titleNepali: 'युवा स्वरोजगार, मोबाइल बैंकिङ सुरक्षा तथा क्युआर प्रविधि साक्षरता अभियान',
    titleEnglish: 'Youth Self-Employment, Mobile Banking Security & QR Literacy Campaign',
    category: 'YOUTH_DIGITAL_BANKING',
    targetAudience: 'GENERAL_MEMBERS',
    trainerName: 'अविनाश चौधरी (आईटी तथा फिनटेक प्रशिक्षक)',
    trainerOrganization: 'उनको सूचना प्रविधि विभाग',
    venue: 'जनता मावि सभाहल, गढवा',
    startDateNepali: '२०८१-०६-१०',
    endDateNepali: '२०८१-०६-११',
    durationDays: 2,
    durationHours: 10,
    plannedBudget: 30000,
    expenses: [],
    totalActualExpense: 0,
    participantsMale: 20,
    participantsFemale: 25,
    participantsMarginalized: 15,
    totalParticipants: 45,
    status: 'PLANNED',
    boardMinuteNo: 'निर्णय नं. १३/२०८१',
    notes: 'स्थानीय युवाहरूलाई सहकारीको मोबाइल बैंकिङ, क्युआर भुक्तानी र डिजिटल सुरक्षा सम्बन्धी निःशुल्क प्रशिक्षण सञ्चालन गरिने।',
  },
];

/**
 * Calculates Cooperative Education Fund Summary based on Statutory Section 68
 */
export function calculateEducationFundSummary(params: {
  fiscalYear: string;
  netSurplus: number;
  statutoryAllocationRate?: number; // defaults to 0.05 (5% as adopted by Unako SACCOS, min 3% per Sec 68)
  openingBalance: number;
  externalGrantOrSubsidy?: number;
  programs: TrainingProgram[];
  unionContributionRemitted: number;
}): CoopEducationFundSummary {
  const {
    fiscalYear,
    netSurplus,
    statutoryAllocationRate = 0.05,
    openingBalance,
    externalGrantOrSubsidy = 0,
    programs,
    unionContributionRemitted,
  } = params;

  const safeNetSurplus = Math.max(0, netSurplus);
  const allocatedSurplusAmount = Math.round(safeNetSurplus * statutoryAllocationRate);
  const totalAvailableFund = openingBalance + allocatedSurplusAmount + externalGrantOrSubsidy;

  // In-house training expenditure is sum of actual expenses from active/completed programs
  const inHouseExpenditure = programs
    .filter((p) => p.status !== 'CANCELLED')
    .reduce((sum, p) => sum + (p.totalActualExpense || 0), 0);

  const totalDisbursed = inHouseExpenditure + unionContributionRemitted;
  const remainingBalance = totalAvailableFund - totalDisbursed;

  const statutoryUtilizationRate = totalAvailableFund > 0
    ? Math.round((totalDisbursed / totalAvailableFund) * 1000) / 10
    : 0;

  const inHouseSharePercent = totalDisbursed > 0
    ? Math.round((inHouseExpenditure / totalDisbursed) * 1000) / 10
    : 0;

  const unionSharePercent = totalDisbursed > 0
    ? Math.round((unionContributionRemitted / totalDisbursed) * 1000) / 10
    : 0;

  const complianceNotes: string[] = [];
  let sec68Compliant = true;

  if (statutoryAllocationRate < 0.03) {
    sec68Compliant = false;
    complianceNotes.push('सहकारी ऐन २०७४, दफा ६८ अनुसार खुद बचतको न्यूनतम ३% शिक्षा तथा तालिम कोषमा छुट्याउनु पर्नेछ।');
  } else {
    complianceNotes.push(`दफा ६८ अनुसार विनियोजन दर ${(statutoryAllocationRate * 100).toFixed(1)}% वैधानिक मापदण्ड (न्यूनतम ३%) भन्दा माथि छ।`);
  }

  if (totalDisbursed > 0 && inHouseSharePercent < 70) {
    complianceNotes.push(`आन्तरिक सदस्य शिक्षा खर्च (${inHouseSharePercent}%) विभागको ७०% मार्गनिर्देशन भन्दा न्यून छ।`);
  } else if (totalDisbursed > 0) {
    complianceNotes.push(`आन्तरिक सदस्य शिक्षा खर्च (${inHouseSharePercent}%) सहकारी विभागको मापदण्ड अनुकूल छ।`);
  }

  if (remainingBalance < 0) {
    sec68Compliant = false;
    complianceNotes.push('कोषको मौज्दात भन्दा बढी खर्च भएको छ। सञ्चालक समितिबाट विशेष निकासा वा रकमान्तर निर्णय आवश्यक छ।');
  }

  return {
    fiscalYear,
    netSurplus: safeNetSurplus,
    statutoryAllocationRate,
    allocatedSurplusAmount,
    openingBalance,
    externalGrantOrSubsidy,
    totalAvailableFund,
    inHouseExpenditure,
    unionContributionRemitted,
    totalDisbursed,
    remainingBalance,
    statutoryUtilizationRate,
    inHouseSharePercent,
    unionSharePercent,
    sec68Compliant,
    complianceNotes,
  };
}

/**
 * Validates adding a new expense item against program budget and remaining fund
 */
export function validateTrainingExpenseAgainstBudget(
  program: TrainingProgram,
  newExpenseAmount: number,
  fundRemainingBalance: number
): { isValid: boolean; warning?: string; error?: string } {
  if (newExpenseAmount <= 0) {
    return { isValid: false, error: 'खर्च रकम ० भन्दा बढी हुनुपर्दछ।' };
  }

  const projectedProgramExpense = program.totalActualExpense + newExpenseAmount;
  if (newExpenseAmount > fundRemainingBalance) {
    return {
      isValid: false,
      error: `शिक्षा कोष मौज्दात (रु. ${fundRemainingBalance.toLocaleString('en-IN')}) भन्दा बढी खर्च भुक्तानी गर्न मिल्दैन।`,
    };
  }

  if (projectedProgramExpense > program.plannedBudget) {
    const overrun = projectedProgramExpense - program.plannedBudget;
    return {
      isValid: true,
      warning: `प्रस्तावित खर्चले योजनाबद्ध बजेट रु. ${program.plannedBudget.toLocaleString('en-IN')} लाई रु. ${overrun.toLocaleString('en-IN')} ले नाघेको छ। सञ्चालक समिति निर्णय आवश्यक छ।`,
    };
  }

  return { isValid: true };
}

/**
 * Adds an expense item immutably to a training program
 */
export function recordTrainingExpense(
  program: TrainingProgram,
  expense: Omit<ExpenseItem, 'id'>
): TrainingProgram {
  const newExpense: ExpenseItem = {
    ...expense,
    id: `exp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
  };

  const updatedExpenses = [...program.expenses, newExpense];
  const totalActualExpense = updatedExpenses.reduce((sum, item) => sum + item.amount, 0);

  return {
    ...program,
    expenses: updatedExpenses,
    totalActualExpense,
  };
}

/**
 * Computes comprehensive high-level training impact metrics
 */
export function calculateTrainingMetrics(
  programs: TrainingProgram[],
  totalMembers: number = 2450
): TrainingMetrics {
  const activePrograms = programs.filter((p) => p.status !== 'CANCELLED');
  const completed = activePrograms.filter((p) => p.status === 'COMPLETED').length;
  const ongoing = activePrograms.filter((p) => p.status === 'ONGOING' || p.status === 'PLANNED').length;

  let totalParticipants = 0;
  let totalFemale = 0;
  let totalMale = 0;
  let totalMarginalized = 0;
  let totalExpenditure = 0;

  const categoryDistribution: Record<TrainingCategory, number> = {
    FINANCIAL_LITERACY: 0,
    MICRO_ENTERPRISE: 0,
    COOP_GOVERNANCE: 0,
    WOMEN_EMPOWERMENT: 0,
    YOUTH_DIGITAL_BANKING: 0,
    BOARD_SUPERVISORY_ORIENTATION: 0,
    STAFF_AML_COMPLIANCE: 0,
  };

  for (const prog of activePrograms) {
    totalParticipants += prog.totalParticipants;
    totalFemale += prog.participantsFemale;
    totalMale += prog.participantsMale;
    totalMarginalized += prog.participantsMarginalized;
    totalExpenditure += prog.totalActualExpense;

    if (categoryDistribution[prog.category] !== undefined) {
      categoryDistribution[prog.category] += 1;
    }
  }

  const femaleRatioPercent = totalParticipants > 0
    ? Math.round((totalFemale / totalParticipants) * 1000) / 10
    : 0;

  const memberCoveragePercent = totalMembers > 0
    ? Math.round((totalParticipants / totalMembers) * 1000) / 10
    : 0;

  const averageCostPerParticipant = totalParticipants > 0
    ? Math.round(totalExpenditure / totalParticipants)
    : 0;

  return {
    totalPrograms: activePrograms.length,
    completedPrograms: completed,
    ongoingPrograms: ongoing,
    totalParticipants,
    totalFemaleParticipants: totalFemale,
    totalMaleParticipants: totalMale,
    totalMarginalizedParticipants: totalMarginalized,
    femaleRatioPercent,
    memberCoveragePercent,
    totalExpenditure,
    averageCostPerParticipant,
    categoryDistribution,
  };
}

/**
 * Generates an official bilingual Certificate of Training Completion
 */
export function generateTrainingCertificate(
  program: TrainingProgram,
  participantName: string,
  memberNo: string
): string {
  const catLabel = CATEGORY_LABELS[program.category] || { ne: 'सहकारी तालिम', en: 'Cooperative Training' };

  return `================================================================================
                    उनको बचत तथा ऋण सहकारी संस्था लिमिटेड
                UNAKO SAVING & CREDIT COOPERATIVE SOCIETY LTD.
                     गढवा-५, दाङ, लुम्बिनी प्रदेश, नेपाल
             दर्ता नं: २८३/०६५/०६६ | सहकारी ऐन २०७४, दफा ६८ (३)
================================================================================
                           सहभागिता तथा दक्षता प्रमाणपत्र
                         CERTIFICATE OF PARTICIPATION
--------------------------------------------------------------------------------
यस उनको बचत तथा ऋण सहकारी संस्था लि. को "सहकारी शिक्षा तथा तालिम कोष" को 
आयोजनामा सञ्चालित निम्न प्रशिक्षण कार्यक्रममा सक्रिय सहभागिता जनाई सफलतापूर्वक 
सम्पन्न गर्नुभएकोले यो प्रमाणपत्र प्रदान गरिएको छ।

This is to certify that:
श्री / श्रीमती (Mr./Ms.): ${participantName}
सदस्य नं (Member No.): ${memberNo}

has successfully participated in the following cooperative training program:

तालिमको नाम (Program Title):
  नेपाली: ${program.titleNepali}
  English: ${program.titleEnglish}

कार्यक्रम कोड (Program Code): ${program.programCode}
विषय क्षेत्र (Category): ${catLabel.ne} (${catLabel.en})
अवधि (Duration): ${program.durationDays} दिन (${program.durationHours} घण्टा)
मिति (Dates): ${program.startDateNepali} देखि ${program.endDateNepali} सम्म
स्थान (Venue): ${program.venue}
प्रशिक्षक (Lead Trainer): ${program.trainerName} (${program.trainerOrganization})

हामी उहाँको उज्ज्वल भविष्य, वित्तीय आत्मनिर्भरता र सहकारी निष्ठाको कामना गर्दछौं।
--------------------------------------------------------------------------------
जारी मिति: ${program.endDateNepali}
सञ्चालक समिति निर्णय नं: ${program.boardMinuteNo}

............................                   ............................
      (तालिम संयोजक)                                 (अध्यक्ष / व्यवस्थापक)
   Training Coordinator                             Chairman / Manager
================================================================================`;
}

/**
 * Exports training programs and fund utilization ledger to CSV (Bilingual)
 */
export function exportTrainingLedgerToCSV(
  programs: TrainingProgram[],
  fundSummary: CoopEducationFundSummary
): string {
  const header = [
    'Program Code (कार्यक्रम कोड)',
    'Program Title (तालिमको नाम)',
    'Category (विषय क्षेत्र)',
    'Target Audience (लक्षित वर्ग)',
    'Trainer (प्रशिक्षक)',
    'Dates (मिति)',
    'Planned Budget (बजेट रु)',
    'Actual Expense (वास्तविक खर्च रु)',
    'Total Attendees (सहभागी)',
    'Female Attendees (महिला)',
    'Male Attendees (पुरुष)',
    'Marginalized Attendees (विपन्न/दलित)',
    'Status (स्थिति)',
    'Board Minute (निर्णय नं)',
  ].join(',');

  const rows = programs.map((p) => {
    const cat = CATEGORY_LABELS[p.category]?.ne || p.category;
    const aud = AUDIENCE_LABELS[p.targetAudience]?.ne || p.targetAudience;
    return [
      `"${p.programCode}"`,
      `"${p.titleNepali.replace(/"/g, '""')}"`,
      `"${cat}"`,
      `"${aud}"`,
      `"${p.trainerName.replace(/"/g, '""')}"`,
      `"${p.startDateNepali} to ${p.endDateNepali}"`,
      p.plannedBudget,
      p.totalActualExpense,
      p.totalParticipants,
      p.participantsFemale,
      p.participantsMale,
      p.participantsMarginalized,
      `"${p.status}"`,
      `"${p.boardMinuteNo}"`,
    ].join(',');
  });

  const summarySection = [
    '',
    '--- STATUTORY COOP EDUCATION FUND SUMMARY (दफा ६८ वैधानिक कोष विवरण) ---',
    `Fiscal Year (आर्थिक वर्ष),${fundSummary.fiscalYear}`,
    `Net Surplus (खुद बचत नाफा),${fundSummary.netSurplus}`,
    `Statutory Allocation Rate (विनियोजन दर),${(fundSummary.statutoryAllocationRate * 100).toFixed(1)}%`,
    `Allocated to Education Fund (कोष विनियोजन रकम),${fundSummary.allocatedSurplusAmount}`,
    `Opening Balance (अघिल्लो मौज्दात),${fundSummary.openingBalance}`,
    `Total Available Fund (जम्मा मौज्दात),${fundSummary.totalAvailableFund}`,
    `In-House Training Expenses (संस्थागत तालिम खर्च),${fundSummary.inHouseExpenditure}`,
    `Union Remittance (सहकारी संघमा दाखिला),${fundSummary.unionContributionRemitted}`,
    `Total Disbursed (जम्मा खर्च),${fundSummary.totalDisbursed}`,
    `Remaining Fund Balance (बाँकी मौज्दात),${fundSummary.remainingBalance}`,
    `Utilization Rate (उपयोग दर),${fundSummary.statutoryUtilizationRate}%`,
    `Section 68 Compliant (वैधानिक अनुकूल),${fundSummary.sec68Compliant ? 'YES' : 'NO'}`,
  ].join('\n');

  return [header, ...rows, summarySection].join('\n');
}
