import React, { useState, useMemo } from 'react';
import { useLanguageStore } from '../../store/useLanguageStore';
import { Member, Loan } from '../../types';
import {
  InsuranceSchemeType,
  MicroInsurancePolicy,
  InsuranceClaim,
  SCHEME_LABELS,
  calculateAnnualPremium,
  calculateClaimSettlement,
  validateClaimSubmission,
  aggregateMutualFundMetrics,
  exportPoliciesCsv,
  exportClaimsCsv,
} from '../../utils/memberMicroInsurance';
import {
  X,
  Printer,
  Download,
  Building,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Search,
  Plus,
  ShieldCheck,
  HeartHandshake,
  Calendar,
  Layers,
  Coins,
  Receipt,
  FileCheck,
  Users,
} from 'lucide-react';

interface MemberMicroInsuranceModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: readonly Member[];
  loans: readonly Loan[];
}

export const MemberMicroInsuranceModal: React.FC<MemberMicroInsuranceModalProps> = ({
  isOpen,
  onClose,
  members,
  loans,
}) => {
  const { t, fmtCurrency, fmtCount, fmtPercent, fmtDigits } = useLanguageStore();

  const [activeTab, setActiveTab] = useState<'POLICIES' | 'CLAIMS' | 'FUND' | 'VOUCHER'>('POLICIES');
  const [selectedSchemeFilter, setSelectedSchemeFilter] = useState<'ALL' | InsuranceSchemeType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Initial Representative Policies for Unako SACCOS
  const [policies, setPolicies] = useState<MicroInsurancePolicy[]>([
    {
      id: 'POL-2081-001',
      policyNo: 'POL-LIFE-2081-01',
      memberId: 'm-101',
      memberNo: 'M-101',
      memberName: 'राम बहादुर चौधरी',
      schemeType: 'MEMBER_LIFE',
      sumAssured: 250000,
      annualPremium: 1250,
      startDateBS: '2081/01/01',
      endDateBS: '2081/12/30',
      linkedLoanId: 'LN-2081-091',
      outstandingLoanBalance: 145000,
      status: 'ACTIVE',
      nominee: {
        name: 'सुनिता चौधरी',
        relation: 'श्रीमती (Wife)',
        citizenshipNo: '52-01-72-00192',
        phone: '9847123456',
      },
      remarks: 'कृषि तथा व्यापार कर्जा सुरक्षण',
    },
    {
      id: 'POL-2081-002',
      policyNo: 'POL-LIVE-2081-02',
      memberId: 'm-102',
      memberNo: 'M-102',
      memberName: 'कमल थापा मगर',
      schemeType: 'LIVESTOCK_AGRICULTURE',
      sumAssured: 120000,
      annualPremium: 3600,
      startDateBS: '2081/02/15',
      endDateBS: '2082/02/14',
      linkedLoanId: 'LN-2081-084',
      outstandingLoanBalance: 90000,
      status: 'ACTIVE',
      livestockTagNo: 'GADH-COW-9921',
      nominee: {
        name: 'विष्णु थापा मगर',
        relation: 'छोरा (Son)',
        citizenshipNo: '52-01-76-04412',
        phone: '9857999888',
      },
      remarks: 'उन्नत जातको दुधालु गाई २ वटा',
    },
    {
      id: 'POL-2081-003',
      policyNo: 'POL-CRIT-2081-03',
      memberId: 'm-103',
      memberNo: 'M-103',
      memberName: 'सीता शर्मा',
      schemeType: 'CRITICAL_ILLNESS',
      sumAssured: 50000,
      annualPremium: 500,
      startDateBS: '2081/03/01',
      endDateBS: '2081/12/30',
      status: 'ACTIVE',
      nominee: {
        name: 'माधव शर्मा',
        relation: 'श्रीमान (Husband)',
        phone: '9847666333',
      },
      remarks: 'महिला स्वास्थ्य तथा आकस्मिक उपचार राहत',
    },
    {
      id: 'POL-2081-004',
      policyNo: 'POL-MAT-2081-04',
      memberId: 'm-104',
      memberNo: 'M-104',
      memberName: 'अनिता चौधरी',
      schemeType: 'MATERNITY_NURTURE',
      sumAssured: 10000,
      annualPremium: 200,
      startDateBS: '2081/04/01',
      endDateBS: '2082/03/30',
      status: 'ACTIVE',
      nominee: {
        name: 'अनिता चौधरी',
        relation: 'स्वयं (Self)',
        phone: '9867001122',
      },
      remarks: 'सुत्केरी पोषण भत्ता',
    },
  ]);

  // Initial Representative Claims
  const [claims, setClaims] = useState<InsuranceClaim[]>([
    {
      id: 'CLM-2081-001',
      claimNo: 'CLM-2081-01',
      policyId: 'POL-2081-001',
      policyNo: 'POL-LIFE-2081-01',
      memberId: 'm-101',
      memberName: 'राम बहादुर चौधरी',
      claimantName: 'सुनिता चौधरी',
      claimantRelation: 'श्रीमती (Wife)',
      schemeType: 'MEMBER_LIFE',
      incidentDateBS: '2081/08/10',
      claimedAmount: 250000,
      approvedAmount: 250000,
      deductedLoanBalance: 145000,
      bereavementGrant: 20000,
      netDisbursedToClaimant: 125000,
      documentsSubmitted: [
        'वडा कार्यालय मृत्युदर्ता प्रमाणपत्र',
        'अस्पतालको मृत्यु प्रमाणित पत्र',
        'नाता प्रमाणित प्रमाणपत्र',
        'हकवालाको नागरिकता प्रतिलिपि',
      ],
      status: 'DISBURSED',
      boardDecisionNo: 'BOD-RES-84/2081',
      disbursementVoucherNo: 'VCH-RELIEF-9901',
      disbursementDateBS: '2081/08/20',
      investigationNotes: 'वडा अध्यक्ष तथा स्थानीय आमा समूहबाट मृत्युको पुष्टि गरिएको। ऋण मिनाहा गरी बाँकी रकम श्रीमतीलाई भुक्तानी।',
    },
    {
      id: 'CLM-2081-002',
      claimNo: 'CLM-2081-02',
      policyId: 'POL-2081-002',
      policyNo: 'POL-LIVE-2081-02',
      memberId: 'm-102',
      memberName: 'कमल थापा मगर',
      claimantName: 'कमल थापा मगर',
      claimantRelation: 'स्वयं (Self)',
      schemeType: 'LIVESTOCK_AGRICULTURE',
      incidentDateBS: '2081/08/22',
      claimedAmount: 60000,
      approvedAmount: 50000,
      deductedLoanBalance: 40000,
      bereavementGrant: 0,
      netDisbursedToClaimant: 10000,
      documentsSubmitted: [
        'गाउँपालिका पशु सेवा शाखा पोष्टमार्टम रिपोर्ट',
        'कानको ट्याग सहितको तस्बिर (Tag No: GADH-COW-9921)',
        'वडा मुचुल्का',
      ],
      status: 'BOARD_APPROVED',
      boardDecisionNo: 'BOD-RES-85/2081',
      investigationNotes: 'गाईको आकस्मिक रोगबाट मृत्यु भएको पशु प्राविधिकबाट प्रमाणित।',
    },
  ]);

  // Form state for enrolling new policy
  const [showAddPolicy, setShowAddPolicy] = useState(false);
  const [newMemberId, setNewMemberId] = useState(members[0]?.id || 'm-101');
  const [newSchemeType, setNewSchemeType] = useState<InsuranceSchemeType>('MEMBER_LIFE');
  const [newSumAssured, setNewSumAssured] = useState<number>(200000);
  const [newNomineeName, setNewNomineeName] = useState('');
  const [newNomineeRelation, setNewNomineeRelation] = useState('श्रीमती');
  const [newNomineePhone, setNewNomineePhone] = useState('');
  const [newLivestockTag, setNewLivestockTag] = useState('');
  const [newLinkedLoanId, setNewLinkedLoanId] = useState('');

  // Form state for filing new claim
  const [showAddClaim, setShowAddClaim] = useState(false);
  const [claimPolicyId, setClaimPolicyId] = useState(policies[0]?.id || '');
  const [claimIncidentDateBS, setClaimIncidentDateBS] = useState('2081/08/25');
  const [claimAmount, setClaimAmount] = useState<number>(50000);
  const [claimantName, setClaimantName] = useState('');
  const [claimantRelation, setClaimantRelation] = useState('हकवाला');
  const [claimDocs, setClaimDocs] = useState<string[]>([
    'वडा कार्यालय सिफारिस / मृत्युदर्ता',
    'हकवालाको नागरिकता प्रतिलिपि',
  ]);

  // Selected claim for disbursement voucher preview
  const [selectedVoucherClaim, setSelectedVoucherClaim] = useState<InsuranceClaim>(claims[0]);

  // Fund metrics
  const fundMetrics = useMemo(() => {
    return aggregateMutualFundMetrics(policies, claims, 850000);
  }, [policies, claims]);

  // Filtered policies
  const filteredPolicies = useMemo(() => {
    return policies.filter((p) => {
      const matchScheme = selectedSchemeFilter === 'ALL' || p.schemeType === selectedSchemeFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.memberName.toLowerCase().includes(q) ||
        p.memberNo.toLowerCase().includes(q) ||
        p.policyNo.toLowerCase().includes(q) ||
        p.nominee.name.toLowerCase().includes(q) ||
        p.nominee.phone.includes(q);
      return matchScheme && matchSearch;
    });
  }, [policies, selectedSchemeFilter, searchQuery]);

  // Handlers
  const handleCreatePolicy = (e: React.FormEvent) => {
    e.preventDefault();
    const targetMember = members.find((m) => m.id === newMemberId) || {
      id: newMemberId,
      name: 'सदस्य',
      memberNo: 'M-NEW',
    };

    const calculatedPremium = calculateAnnualPremium(newSchemeType, newSumAssured, !!newLivestockTag);
    const targetLoan = loans.find((l) => l.id === newLinkedLoanId);

    const newPolicy: MicroInsurancePolicy = {
      id: `POL-2081-${String(policies.length + 1).padStart(3, '0')}`,
      policyNo: `POL-${newSchemeType.slice(0, 4)}-2081-${String(policies.length + 1).padStart(2, '0')}`,
      memberId: targetMember.id,
      memberNo: targetMember.memberNo,
      memberName: targetMember.name,
      schemeType: newSchemeType,
      sumAssured: newSumAssured,
      annualPremium: calculatedPremium,
      startDateBS: '2081/08/01',
      endDateBS: '2082/07/30',
      linkedLoanId: newLinkedLoanId || undefined,
      outstandingLoanBalance: targetLoan ? targetLoan.remainingBalance : undefined,
      status: 'ACTIVE',
      nominee: {
        name: newNomineeName.trim() || 'हकवाला',
        relation: newNomineeRelation.trim() || 'नाता',
        phone: newNomineePhone.trim() || '98XXXXXXXX',
      },
      livestockTagNo: newLivestockTag.trim() || undefined,
    };

    setPolicies((prev) => [newPolicy, ...prev]);
    setShowAddPolicy(false);
    setNewNomineeName('');
    setNewNomineePhone('');
    setNewLivestockTag('');
  };

  const handleCreateClaim = (e: React.FormEvent) => {
    e.preventDefault();
    const policy = policies.find((p) => p.id === claimPolicyId);
    if (!policy) return;

    const validation = validateClaimSubmission({
      memberId: policy.memberId,
      policyNo: policy.policyNo,
      claimantName: claimantName.trim(),
      claimedAmount: claimAmount,
      documentsSubmitted: claimDocs,
    });

    if (!validation.isValid) {
      alert(validation.errors.join('\n'));
      return;
    }

    const bereavementGrant = policy.schemeType === 'MEMBER_LIFE' ? 20000 : 0;
    const settlement = calculateClaimSettlement({
      claimedAmount: claimAmount,
      approvedSumAssured: Math.min(claimAmount, policy.sumAssured),
      outstandingLoanBalance: policy.outstandingLoanBalance || 0,
      bereavementGrant,
    });

    const newClaim: InsuranceClaim = {
      id: `CLM-2081-${String(claims.length + 1).padStart(3, '0')}`,
      claimNo: `CLM-2081-${String(claims.length + 1).padStart(2, '0')}`,
      policyId: policy.id,
      policyNo: policy.policyNo,
      memberId: policy.memberId,
      memberName: policy.memberName,
      claimantName: claimantName.trim(),
      claimantRelation: claimantRelation.trim(),
      schemeType: policy.schemeType,
      incidentDateBS: claimIncidentDateBS,
      claimedAmount: claimAmount,
      approvedAmount: settlement.approvedAmount,
      deductedLoanBalance: settlement.deductedLoanBalance,
      bereavementGrant: settlement.bereavementGrant,
      netDisbursedToClaimant: settlement.netDisbursedToClaimant,
      documentsSubmitted: claimDocs,
      status: 'SUBMITTED',
    };

    setClaims((prev) => [newClaim, ...prev]);
    setShowAddClaim(false);
    setClaimantName('');
    alert(t('राहत दावी दर्ता सम्पन्न भयो। अनुसन्धान तथा स्वीकृतिको लागि पेश गरियो।', 'Claim successfully registered and submitted for board review.'));
  };

  const handleApproveClaim = (claimId: string) => {
    setClaims((prev) =>
      prev.map((c) => {
        if (c.id === claimId) {
          return {
            ...c,
            status: 'BOARD_APPROVED',
            boardDecisionNo: `BOD-RES-${Math.floor(86 + Math.random() * 20)}/2081`,
          };
        }
        return c;
      })
    );
  };

  const handleDisburseClaim = (claimId: string) => {
    setClaims((prev) =>
      prev.map((c) => {
        if (c.id === claimId) {
          const updated: InsuranceClaim = {
            ...c,
            status: 'DISBURSED',
            disbursementVoucherNo: `VCH-RELIEF-${Math.floor(9900 + Math.random() * 99)}`,
            disbursementDateBS: '2081/08/28',
          };
          setSelectedVoucherClaim(updated);
          return updated;
        }
        return c;
      })
    );
    setActiveTab('VOUCHER');
  };

  const handleDownloadPoliciesCsv = () => {
    const csv = exportPoliciesCsv(filteredPolicies);
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Unako_MicroInsurance_Policies_2081.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadClaimsCsv = () => {
    const csv = exportClaimsCsv(claims);
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Unako_Insurance_Claims_Register_2081.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-blue-950/20 via-slate-900/10 to-teal-950/20 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-2xl bg-gradient-to-br from-teal-600 to-blue-700 flex items-center justify-center text-white shadow-lg shadow-teal-600/30">
              <HeartHandshake className="size-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-teal-600 dark:text-teal-400 tracking-wider uppercase">
                  {t('सदस्य सुरक्षा तथा सामाजिक संरक्षण कार्यक्रम', 'MEMBER WELFARE & SOCIAL PROTECTION')}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-300/40">
                  {t('सहकारी ऐन २०७४ दफा ५० र ५१ अनुरूप', 'Nepal Cooperative Act 2074 Sec 50 & 51')}
                </span>
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
                {t('सदस्य राहत तथा लघु-बीमा कोष व्यवस्थापन', 'Member Mutual Relief & Micro-Insurance Gateway')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t(
                  'जीवन सुरक्षा, ऋण मिनाहा, घातक रोग उपचार, सुत्केरी पोषण तथा पशुधन सुरक्षण दावी फछ्र्यौट।',
                  'Life protection, debt waiver, critical illness, maternity nurture, and livestock loss settlement.'
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Global Summary Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-5 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800">
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              {t('सक्रिय बीमा पोलिसीहरू', 'Active Policies')}
            </span>
            <span className="text-lg font-black text-slate-900 dark:text-white mt-0.5 block font-mono">
              {fmtCount(fundMetrics.totalActivePolicies)}
            </span>
            <span className="text-[10px] text-slate-400">{t('सुरक्षित सदस्य संख्या', 'Insured Members')}</span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-blue-200 dark:border-blue-950/60 shadow-sm">
            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
              {t('कुल बीमाङ्क दायित्व (Risk)', 'Total Sum Assured')}
            </span>
            <span className="text-lg font-black text-blue-600 dark:text-blue-400 mt-0.5 block font-mono">
              {fmtCurrency(fundMetrics.totalSumAssuredActive)}
            </span>
            <span className="text-[10px] text-slate-400">{t('ऋण तथा सदस्य जीवन कभरेज', 'Loan & Life Coverage')}</span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-teal-200 dark:border-teal-950/60 shadow-sm">
            <span className="text-[11px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider block">
              {t('राहत कोष मौज्दात (Reserve)', 'Mutual Fund Reserve')}
            </span>
            <span className="text-lg font-black text-teal-600 dark:text-teal-400 mt-0.5 block font-mono">
              {fmtCurrency(fundMetrics.currentFundBalance)}
            </span>
            <span className="text-[10px] text-teal-600 font-bold">
              {fundMetrics.isFundSolvent ? t('सुरक्षित मौज्दात (Solvent)', 'Solvent & Ring-fenced') : t('थप पुँजीकरण आवश्यक', 'Needs Capital')}
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-purple-200 dark:border-purple-950/60 shadow-sm">
            <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block">
              {t('दावी भुक्तानी (Claims Disbursed)', 'Claims Disbursed')}
            </span>
            <span className="text-lg font-black text-purple-600 dark:text-purple-400 mt-0.5 block font-mono">
              {fmtCurrency(fundMetrics.totalClaimsPaid)}
            </span>
            <span className="text-[10px] text-purple-600 font-bold">
              {t('हानि अनुपात:', 'Loss Ratio:')} {fmtPercent(fundMetrics.lossRatioPercent)}
            </span>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-white dark:bg-slate-900">
          <button
            onClick={() => setActiveTab('POLICIES')}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'POLICIES'
                ? 'border-teal-600 text-teal-600 dark:text-teal-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="size-4" />
            <span>{t('सक्रिय पोलिसी अभिलेख (Policy Register)', 'Active Policies Register')}</span>
          </button>

          <button
            onClick={() => setActiveTab('CLAIMS')}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'CLAIMS'
                ? 'border-teal-600 text-teal-600 dark:text-teal-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="size-4" />
            <span>{t('राहत दावी तथा स्वीकृति (Claims & Review)', 'Claims & Approvals')}</span>
          </button>

          <button
            onClick={() => setActiveTab('FUND')}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'FUND'
                ? 'border-teal-600 text-teal-600 dark:text-teal-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Coins className="size-4" />
            <span>{t('राहत कोष तथा वित्तीय स्थिति (Fund Health)', 'Relief Fund & Solvency')}</span>
          </button>

          <button
            onClick={() => setActiveTab('VOUCHER')}
            className={`py-3.5 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'VOUCHER'
                ? 'border-teal-600 text-teal-600 dark:text-teal-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Receipt className="size-4" />
            <span>{t('दावी फछ्र्यौट भौचर (Disbursement Voucher)', 'Settlement Voucher')}</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* TAB 1: Policy Register */}
          {activeTab === 'POLICIES' && (
            <div className="space-y-6">
              
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  <select
                    value={selectedSchemeFilter}
                    onChange={(e) => setSelectedSchemeFilter(e.target.value as 'ALL' | InsuranceSchemeType)}
                    className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                  >
                    <option value="ALL">{t('सबै सुरक्षण योजनाहरू (All Schemes)', 'All Schemes')}</option>
                    <option value="MEMBER_LIFE">सदस्य जीवन तथा ऋण मिनाहा (Life & Loan)</option>
                    <option value="LIVESTOCK_AGRICULTURE">पशुधन तथा कृषि सुरक्षण (Livestock)</option>
                    <option value="CRITICAL_ILLNESS">घातक रोग तथा उपचार राहत (Critical Illness)</option>
                    <option value="MATERNITY_NURTURE">सुत्केरी पोषण राहत (Maternity Nurture)</option>
                  </select>

                  <button
                    onClick={handleDownloadPoliciesCsv}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition cursor-pointer"
                  >
                    <Download className="size-4" />
                    <span>{t('CSV निर्यात', 'Export CSV')}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder={t('सदस्यको नाम, पोलिसी वा फोन...', 'Search member, policy, phone...')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
                    />
                  </div>

                  <button
                    onClick={() => setShowAddPolicy(!showAddPolicy)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm transition shrink-0 cursor-pointer"
                  >
                    <Plus className="size-4" />
                    <span>{t('+ नयाँ पोलिसी दर्ता', '+ Enroll Policy')}</span>
                  </button>
                </div>
              </div>

              {/* Add Policy Form Drawer */}
              {showAddPolicy && (
                <form onSubmit={handleCreatePolicy} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4 animate-in fade-in">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Plus className="size-4 text-teal-600" />
                    <span>{t('नयाँ सदस्य लघु-बीमा पोलिसी दर्ता (Enroll New Member Insurance Policy)', 'Enroll New Member Policy')}</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-500 font-bold mb-1">{t('सदस्य चयन', 'Select Member')}</label>
                      <select
                        value={newMemberId}
                        onChange={(e) => setNewMemberId(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-medium"
                      >
                        {members.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name} ({m.memberNo})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-500 font-bold mb-1">{t('सुरक्षण योजना (Scheme)', 'Insurance Scheme')}</label>
                      <select
                        value={newSchemeType}
                        onChange={(e) => setNewSchemeType(e.target.value as InsuranceSchemeType)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-medium"
                      >
                        <option value="MEMBER_LIFE">सदस्य जीवन तथा ऋण मिनाहा (Life & Loan)</option>
                        <option value="LIVESTOCK_AGRICULTURE">पशुधन तथा कृषि सुरक्षण (Livestock)</option>
                        <option value="CRITICAL_ILLNESS">घातक रोग तथा उपचार राहत (Critical Illness)</option>
                        <option value="MATERNITY_NURTURE">सुत्केरी पोषण राहत (Maternity Nurture)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-500 font-bold mb-1">{t('बीमाङ्क रकम (Sum Assured NPR)', 'Sum Assured NPR')}</label>
                      <input
                        type="number"
                        min="5000"
                        step="5000"
                        value={newSumAssured}
                        onChange={(e) => setNewSumAssured(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-mono font-bold"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-slate-500 font-bold mb-1">{t('हकवालाको नाम (Nominee Name)', 'Nominee Name')}</label>
                      <input
                        type="text"
                        placeholder="e.g. सुनिता चौधरी"
                        value={newNomineeName}
                        onChange={(e) => setNewNomineeName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-medium"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-slate-500 font-bold mb-1">{t('हकवाला नाता (Relation)', 'Relation')}</label>
                      <input
                        type="text"
                        placeholder="e.g. श्रीमती / श्रीमान / छोरा"
                        value={newNomineeRelation}
                        onChange={(e) => setNewNomineeRelation(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-medium"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-slate-500 font-bold mb-1">{t('हकवाला सम्पर्क फोन नं.', 'Nominee Phone')}</label>
                      <input
                        type="text"
                        placeholder="98XXXXXXXX"
                        value={newNomineePhone}
                        onChange={(e) => setNewNomineePhone(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-medium"
                        required
                      />
                    </div>

                    {newSchemeType === 'LIVESTOCK_AGRICULTURE' && (
                      <div>
                        <label className="block text-slate-500 font-bold mb-1">{t('पशु कानको ट्याग नं. (Tag No)', 'Livestock Ear Tag No.')}</label>
                        <input
                          type="text"
                          placeholder="e.g. GADH-COW-9922"
                          value={newLivestockTag}
                          onChange={(e) => setNewLivestockTag(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-mono"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
                    <div className="text-xs text-slate-500">
                      {t('वार्षिक प्रिमियम शुल्क:', 'Annual Premium:')}{' '}
                      <strong className="text-teal-600 font-mono text-sm">
                        {fmtCurrency(calculateAnnualPremium(newSchemeType, newSumAssured, !!newLivestockTag))}
                      </strong>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddPolicy(false)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300"
                      >
                        {t('रद्द गर्नुहोस्', 'Cancel')}
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm"
                      >
                        {t('पोलिसी दर्ता गर्नुहोस्', 'Save & Activate Policy')}
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Policies Table */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                        <th className="py-3 px-3.5">{t('पोलिसी नं.', 'Policy No')}</th>
                        <th className="py-3 px-3.5">{t('सदस्यको विवरण', 'Member Details')}</th>
                        <th className="py-3 px-3.5">{t('योजना प्रकार', 'Scheme')}</th>
                        <th className="py-3 px-3.5 text-right">{t('बीमाङ्क रकम (Sum)', 'Sum Assured')}</th>
                        <th className="py-3 px-3.5 text-right">{t('वार्षिक प्रिमियम', 'Premium')}</th>
                        <th className="py-3 px-3.5">{t('हकवाला (Nominee)', 'Nominee')}</th>
                        <th className="py-3 px-3.5">{t('कर्जा सम्बन्ध', 'Linked Loan')}</th>
                        <th className="py-3 px-3.5 text-center">{t('स्थिति', 'Status')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredPolicies.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                          <td className="py-3 px-3.5 font-mono font-bold text-teal-600 dark:text-teal-400 whitespace-nowrap">
                            {p.policyNo}
                          </td>
                          <td className="py-3 px-3.5">
                            <div className="font-bold text-slate-900 dark:text-white">{p.memberName}</div>
                            <span className="text-[10px] text-slate-400 font-mono">No: {p.memberNo}</span>
                          </td>
                          <td className="py-3 px-3.5 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300">
                              {SCHEME_LABELS[p.schemeType]?.np || p.schemeType}
                            </span>
                            {p.livestockTagNo && (
                              <div className="text-[10px] font-mono text-slate-400 mt-0.5">Tag: {p.livestockTagNo}</div>
                            )}
                          </td>
                          <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                            {fmtCurrency(p.sumAssured)}
                          </td>
                          <td className="py-3 px-3.5 text-right font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">
                            {fmtCurrency(p.annualPremium)}
                          </td>
                          <td className="py-3 px-3.5">
                            <div className="font-medium text-slate-800 dark:text-slate-200">{p.nominee.name}</div>
                            <span className="text-[10px] text-slate-400">{p.nominee.relation} | {p.nominee.phone}</span>
                          </td>
                          <td className="py-3 px-3.5 whitespace-nowrap">
                            {p.linkedLoanId ? (
                              <div>
                                <span className="font-mono text-[11px] font-bold text-blue-600 dark:text-blue-400">
                                  {p.linkedLoanId}
                                </span>
                                <div className="text-[10px] text-slate-400">
                                  बाँकी: {fmtCurrency(p.outstandingLoanBalance || 0)}
                                </div>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400">-</span>
                            )}
                          </td>
                          <td className="py-3 px-3.5 text-center whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Claims Management */}
          {activeTab === 'CLAIMS' && (
            <div className="space-y-6">
              
              {/* Claims Toolbar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="text-xs text-slate-500 font-bold">
                  {t('कुल दर्ता दावीहरू:', 'Total Registered Claims:')}{' '}
                  <strong className="text-slate-900 dark:text-white">{claims.length}</strong>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadClaimsCsv}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition cursor-pointer"
                  >
                    <Download className="size-4" />
                    <span>{t('दावी दर्ता CSV', 'Export Claims CSV')}</span>
                  </button>

                  <button
                    onClick={() => setShowAddClaim(!showAddClaim)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm transition cursor-pointer"
                  >
                    <Plus className="size-4" />
                    <span>{t('+ नयाँ राहत दावी दर्ता', '+ File New Claim')}</span>
                  </button>
                </div>
              </div>

              {/* Add Claim Form */}
              {showAddClaim && (
                <form onSubmit={handleCreateClaim} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4 animate-in fade-in">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <AlertTriangle className="size-4 text-red-600" />
                    <span>{t('राहत तथा सुरक्षण दावी फाराम (File Micro-Insurance Claim)', 'File Relief & Insurance Claim')}</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-500 font-bold mb-1">{t('पोलिसी चयन', 'Select Policy')}</label>
                      <select
                        value={claimPolicyId}
                        onChange={(e) => setClaimPolicyId(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-medium"
                      >
                        {policies.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.policyNo} - {p.memberName} ({SCHEME_LABELS[p.schemeType]?.np})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-500 font-bold mb-1">{t('घटना मिति वि.सं. (Incident Date)', 'Incident Date BS')}</label>
                      <input
                        type="text"
                        value={claimIncidentDateBS}
                        onChange={(e) => setClaimIncidentDateBS(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-mono font-bold"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-slate-500 font-bold mb-1">{t('दावी रकम रु. (Claim Amount)', 'Claim Amount NPR')}</label>
                      <input
                        type="number"
                        min="1000"
                        value={claimAmount}
                        onChange={(e) => setClaimAmount(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-mono font-bold"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-slate-500 font-bold mb-1">{t('दावीकर्ताको नाम (Claimant Name)', 'Claimant Name')}</label>
                      <input
                        type="text"
                        placeholder="e.g. सुनिता चौधरी"
                        value={claimantName}
                        onChange={(e) => setClaimantName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-medium"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-slate-500 font-bold mb-1">{t('दावीकर्ताको नाता (Relation)', 'Claimant Relation')}</label>
                      <input
                        type="text"
                        placeholder="e.g. श्रीमती / छोरा / स्वयं"
                        value={claimantRelation}
                        onChange={(e) => setClaimantRelation(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-medium"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-slate-500 font-bold mb-1">{t('संलग्न प्रमाण कागजातहरू', 'Documents Attached')}</label>
                      <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                        <div>✓ वडा कार्यालय सिफारिस तथा मृत्युदर्ता</div>
                        <div>✓ हकवालाको नागरिकता तथा नाता प्रमाणित प्रतिलिपि</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setShowAddClaim(false)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300"
                    >
                      {t('रद्द गर्नुहोस्', 'Cancel')}
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm"
                    >
                      {t('दावी दर्ता गर्नुहोस्', 'Submit Claim')}
                    </button>
                  </div>
                </form>
              )}

              {/* Claims Table */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                        <th className="py-3 px-3.5">{t('दावी नं.', 'Claim No')}</th>
                        <th className="py-3 px-3.5">{t('सदस्य तथा योजना', 'Member & Scheme')}</th>
                        <th className="py-3 px-3.5">{t('दावीकर्ता', 'Claimant')}</th>
                        <th className="py-3 px-3.5 text-right">{t('दावी रकम', 'Claimed')}</th>
                        <th className="py-3 px-3.5 text-right">{t('स्वीकृत रकम', 'Approved')}</th>
                        <th className="py-3 px-3.5 text-right">{t('ऋण मिनाहा', 'Loan Offset')}</th>
                        <th className="py-3 px-3.5 text-right">{t('किरिया खर्च', 'Funeral Grant')}</th>
                        <th className="py-3 px-3.5 text-right">{t('खुद भुक्तानी', 'Net Paid')}</th>
                        <th className="py-3 px-3.5 text-center">{t('स्थिति', 'Status')}</th>
                        <th className="py-3 px-3.5 text-right">{t('कार्य', 'Actions')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {claims.map((c) => (
                        <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                          <td className="py-3 px-3.5 font-mono font-bold text-red-600 dark:text-red-400 whitespace-nowrap">
                            {c.claimNo}
                            <div className="text-[10px] text-slate-400 font-mono">{c.incidentDateBS}</div>
                          </td>
                          <td className="py-3 px-3.5">
                            <div className="font-bold text-slate-900 dark:text-white">{c.memberName}</div>
                            <span className="text-[10px] text-teal-600 dark:text-teal-400">
                              {SCHEME_LABELS[c.schemeType]?.np || c.schemeType}
                            </span>
                          </td>
                          <td className="py-3 px-3.5">
                            <div className="font-medium text-slate-800 dark:text-slate-200">{c.claimantName}</div>
                            <span className="text-[10px] text-slate-400">{c.claimantRelation}</span>
                          </td>
                          <td className="py-3 px-3.5 text-right font-mono font-medium">
                            {fmtCurrency(c.claimedAmount)}
                          </td>
                          <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-900 dark:text-white">
                            {fmtCurrency(c.approvedAmount)}
                          </td>
                          <td className="py-3 px-3.5 text-right font-mono font-bold text-blue-600 dark:text-blue-400">
                            {fmtCurrency(c.deductedLoanBalance)}
                          </td>
                          <td className="py-3 px-3.5 text-right font-mono text-purple-600">
                            {fmtCurrency(c.bereavementGrant)}
                          </td>
                          <td className="py-3 px-3.5 text-right font-mono font-black text-emerald-600 dark:text-emerald-400">
                            {fmtCurrency(c.netDisbursedToClaimant)}
                          </td>
                          <td className="py-3 px-3.5 text-center whitespace-nowrap">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              c.status === 'DISBURSED'
                                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                                : c.status === 'BOARD_APPROVED'
                                ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                                : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                            }`}>
                              {c.status}
                            </span>
                          </td>
                          <td className="py-3 px-3.5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {c.status === 'SUBMITTED' && (
                                <button
                                  onClick={() => handleApproveClaim(c.id)}
                                  className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold shadow-xs transition cursor-pointer"
                                >
                                  {t('सञ्चालक स्वीकृति', 'Approve')}
                                </button>
                              )}

                              {c.status === 'BOARD_APPROVED' && (
                                <button
                                  onClick={() => handleDisburseClaim(c.id)}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-xs transition cursor-pointer"
                                >
                                  {t('रकम भुक्तानी फछ्र्यौट', 'Disburse')}
                                </button>
                              )}

                              {c.status === 'DISBURSED' && (
                                <button
                                  onClick={() => {
                                    setSelectedVoucherClaim(c);
                                    setActiveTab('VOUCHER');
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-[11px] font-bold transition cursor-pointer"
                                >
                                  {t('भौचर हेर्नुहोस्', 'Voucher')}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Fund Health & Loss Ratio */}
          {activeTab === 'FUND' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-teal-100 dark:bg-teal-950/60 flex items-center justify-center text-teal-600">
                      <Coins className="size-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {t('सदस्य राहत कोष मौज्दात तथा बीमा सुरक्षण विश्लेषण', 'Mutual Relief Fund Reserve & Risk Solvency')}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {t(
                          'सहकारी ऐन २०७४ अनुसार कोषको रकम छुट्टै बैंक खातामा सुरक्षित राखिनुपर्दछ।',
                          'Mutual relief fund reserves must be strictly ring-fenced in designated liquid bank deposit accounts.'
                        )}
                      </p>
                    </div>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    fundMetrics.isFundSolvent
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {fundMetrics.isFundSolvent ? t('✓ कोष पूर्ण सुरक्षित (Solvent)', 'Fund Solvent') : t('चेतावनी', 'Warning')}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                    <span className="text-[11px] font-bold text-slate-400 block uppercase">
                      {t('सुरुवाती राहत कोष मौज्दात (Reserve)', 'Initial Reserve Balance')}
                    </span>
                    <strong className="text-lg font-mono text-slate-900 dark:text-white block mt-1">
                      {fmtCurrency(fundMetrics.initialFundReserve)}
                    </strong>
                    <span className="text-[10px] text-slate-500">साधारण सभाबाट विनियोजित</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                    <span className="text-[11px] font-bold text-teal-600 block uppercase">
                      {t('कुल संकलित प्रिमियम शुल्क (+)', 'Total Premiums Intake (+)')}
                    </span>
                    <strong className="text-lg font-mono text-teal-600 block mt-1">
                      {fmtCurrency(fundMetrics.totalPremiumCollected)}
                    </strong>
                    <span className="text-[10px] text-slate-500">सदस्यहरूबाट संकलित शुल्क</span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                    <span className="text-[11px] font-bold text-red-600 block uppercase">
                      {t('कुल दावी तथा ऋण मिनाहा भुक्तानी (-)', 'Total Claims & Waivers (-)')}
                    </span>
                    <strong className="text-lg font-mono text-red-600 block mt-1">
                      {fmtCurrency(fundMetrics.totalClaimsPaid)}
                    </strong>
                    <span className="text-[10px] text-slate-500">मृत्यु, रोग तथा पशुधन राहत</span>
                  </div>
                </div>

                {/* Net Formula */}
                <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 flex items-center justify-between text-xs">
                  <span className="text-teal-900 dark:text-teal-200 font-bold">
                    {t('वर्तमान खुद राहत कोष जगेडा (Net Segregated Relief Fund Balance):', 'Net Segregated Relief Fund Balance:')}
                  </span>
                  <span className="font-mono text-base font-black text-teal-700 dark:text-teal-300">
                    {fmtCurrency(fundMetrics.currentFundBalance)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Settlement Voucher */}
          {activeTab === 'VOUCHER' && (
            <div className="space-y-6">
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="size-4" />
                  <span>{t('भौचर प्रिन्ट गर्नुहोस् (Print Voucher)', 'Print Voucher')}</span>
                </button>
              </div>

              {/* Printable Voucher Sheet */}
              <div className="bg-white text-slate-950 p-8 rounded-3xl border border-slate-300 shadow-xl max-w-4xl mx-auto space-y-6 print:border-none print:shadow-none">
                {/* Header */}
                <div className="text-center border-b pb-4 space-y-1">
                  <span className="text-xs font-bold text-teal-800 uppercase tracking-widest block">
                    सहकारी ऐन २०७४ अन्तर्गत सञ्चालित सदस्य राहत कोष
                  </span>
                  <h1 className="text-xl font-black text-slate-900">
                    उनको बचत तथा ऋण सहकारी संस्था लि.
                  </h1>
                  <p className="text-xs text-slate-600 font-medium">
                    गढवा गाउँपालिका वडा नं. ५, दाङ, लुम्बिनी प्रदेश | फोन: ०८२-५४०१२३
                  </p>
                  <h2 className="text-sm font-bold text-slate-800 pt-2 underline decoration-teal-600 underline-offset-4">
                    राहत दावी भुक्तानी तथा ऋण मिनाहा फछ्र्यौट भौचर (Mutual Relief & Debt Waiver Settlement Voucher)
                  </h2>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div>
                    <span className="text-slate-500 font-bold block">भौचर नं. (Voucher No):</span>
                    <strong className="font-mono text-sm text-slate-900">{selectedVoucherClaim.disbursementVoucherNo || 'VCH-PENDING'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block">फछ्र्यौट मिति (Settlement Date):</span>
                    <strong className="font-mono text-slate-900">{selectedVoucherClaim.disbursementDateBS || '2081/08/28'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block">बीमित सदस्यको नाम:</span>
                    <strong className="text-sm font-black text-slate-900">{selectedVoucherClaim.memberName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block">सञ्चालक समिति निर्णय नं.:</span>
                    <strong className="font-mono text-slate-900">{selectedVoucherClaim.boardDecisionNo || 'BOD-RES-84/2081'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block">भुक्तानी पाउने हकवाला:</span>
                    <strong className="text-sm text-slate-900">{selectedVoucherClaim.claimantName} ({selectedVoucherClaim.claimantRelation})</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 font-bold block">सुरक्षण योजना:</span>
                    <strong className="text-teal-700">{SCHEME_LABELS[selectedVoucherClaim.schemeType]?.np}</strong>
                  </div>
                </div>

                {/* Financial Settlement Breakdown */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs border border-slate-300">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-300 font-bold">
                        <th className="p-2.5 border-r border-slate-300">विवरण (Description)</th>
                        <th className="p-2.5 text-right">रकम रु. (NPR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-medium">
                      <tr>
                        <td className="p-2.5 border-r border-slate-200">
                          सञ्चालक समितिबाट स्वीकृत कुल सुरक्षण दावी रकम (Approved Sum Assured)
                        </td>
                        <td className="p-2.5 text-right font-mono font-bold">
                          {fmtCurrency(selectedVoucherClaim.approvedAmount)}
                        </td>
                      </tr>
                      {selectedVoucherClaim.deductedLoanBalance > 0 && (
                        <tr className="text-blue-700">
                          <td className="p-2.5 border-r border-slate-200">
                            घटायो: मृतक सदस्यको सहकारीमा बाँकी कर्जा मिनाहा फछ्र्यौट (Deducted Loan Balance Cleared)
                          </td>
                          <td className="p-2.5 text-right font-mono font-bold">
                            - {fmtCurrency(selectedVoucherClaim.deductedLoanBalance)}
                          </td>
                        </tr>
                      )}
                      {selectedVoucherClaim.bereavementGrant > 0 && (
                        <tr className="text-purple-700">
                          <td className="p-2.5 border-r border-slate-200">
                            थप: तत्काल राहत तथा किरिया खर्च अनुदान (Bereavement Funeral Grant)
                          </td>
                          <td className="p-2.5 text-right font-mono font-bold">
                            + {fmtCurrency(selectedVoucherClaim.bereavementGrant)}
                          </td>
                        </tr>
                      )}
                      <tr className="bg-teal-50 text-slate-900 font-bold border-t-2 border-slate-400">
                        <td className="p-3 border-r border-slate-300 text-sm">
                          हकवालालाई नगद / बैंक खातामा खुद भुक्तानी रकम (Net Disbursed to Claimant)
                        </td>
                        <td className="p-3 text-right font-mono text-base font-black text-teal-800">
                          {fmtCurrency(selectedVoucherClaim.netDisbursedToClaimant)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Signatures */}
                <div className="pt-8 border-t border-slate-300 grid grid-cols-4 gap-4 text-center text-xs">
                  <div>
                    <div className="h-12 border-b border-dashed border-slate-400 mb-1"></div>
                    <span className="font-bold block text-slate-800">हकवालाको सहिछाप</span>
                    <span className="text-[10px] text-slate-500">(रकम बुझिलिने)</span>
                  </div>
                  <div>
                    <div className="h-12 border-b border-dashed border-slate-400 mb-1"></div>
                    <span className="font-bold block text-slate-800">ऋण तथा अनुसन्धान अधिकृत</span>
                    <span className="text-[10px] text-slate-500">(जाँच गर्ने)</span>
                  </div>
                  <div>
                    <div className="h-12 border-b border-dashed border-slate-400 mb-1"></div>
                    <span className="font-bold block text-slate-800">प्रमुख कार्यकारी अधिकृत</span>
                    <span className="text-[10px] text-slate-500">(सिफारिस गर्ने)</span>
                  </div>
                  <div>
                    <div className="h-12 border-b border-dashed border-slate-400 mb-1"></div>
                    <span className="font-bold block text-slate-800">अध्यक्ष / सञ्चालक समिति</span>
                    <span className="text-[10px] text-slate-500">(स्वीकृत गर्ने)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            {t('उनको साकोस सदस्य सुरक्षा तथा सामाजिक उत्तरदायित्व कोष', 'Unako SACCOS Member Relief & Social Responsibility')}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold transition cursor-pointer"
          >
            {t('बन्द गर्नुहोस्', 'Close')}
          </button>
        </div>

      </div>
    </div>
  );
};
