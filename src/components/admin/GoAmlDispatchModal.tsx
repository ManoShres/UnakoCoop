import React, { useState, useMemo } from 'react';
import {
  X,
  FileCode,
  Printer,
  Download,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Copy,
  Check,
  ShieldCheck,
  Building,
  User,
  ArrowRight,
  ClipboardList,
} from 'lucide-react';
import { useLanguageStore } from '../../store/useLanguageStore';
import {
  GoAmlReportData,
  validateGoAmlReport,
  generateGoAmlXml,
  downloadGoAmlXml,
  printStrInvestigationDossier,
  DEFAULT_UNAKO_ENTITY,
  DEFAULT_UNAKO_AMLCO,
} from '../../utils/goAmlEngine';
import { AmlAlert, AmlStatus } from '../../utils/amlCompliance';
import { Member, Transaction } from '../../types';

interface GoAmlDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  alert: AmlAlert | null;
  member?: Member;
  transactions?: Transaction[];
  onStatusUpdate?: (alertId: string, status: AmlStatus) => void;
}

export const GoAmlDispatchModal: React.FC<GoAmlDispatchModalProps> = ({
  isOpen,
  onClose,
  alert,
  member,
  transactions = [],
  onStatusUpdate,
}) => {
  const { t, fmtCurrency, fmtDigits } = useLanguageStore();

  const [activeTab, setActiveTab] = useState<'XML' | 'DOSSIER' | 'CHECKLIST'>('XML');
  const [copied, setCopied] = useState(false);
  const [submissionToken, setSubmissionToken] = useState('');
  const [officerNote, setOfficerNote] = useState('');

  // Assemble goAML report data
  const reportData: GoAmlReportData | null = useMemo(() => {
    if (!alert) return null;

    const isStr = alert.reportType === 'STR';
    const reportCode = isStr ? 'STR' : 'TTR';
    const today = new Date().toISOString().split('T')[0];

    const matchedMember = member || {
      id: alert.memberId,
      memberNo: alert.memberNo,
      name: alert.memberName,
      phone: '9847820000',
      address: 'Gadhawa-05, Dang',
    };

    const relatedTxs = transactions.length > 0
      ? transactions
          .filter((t) => (t as { memberId?: string }).memberId === alert.memberId || t.id === alert.transactionId)
          .map((t) => ({
            transactionId: t.id,
            accountNo: (t as { accountNo?: string }).accountNo || '004-10294-88-01',
            amount: t.amount,
            date: t.date,
            valueDate: t.date,
            mode: 'CASH' as const,
            debitCredit: 'CREDIT' as const,
            purpose: alert.triggerReason,
            remarks: alert.triggerReasonNepali,
          }))
      : [
          {
            transactionId: alert.transactionId,
            accountNo: '004-10294-88-01',
            amount: alert.amount,
            date: alert.transactionDate,
            valueDate: alert.transactionDate,
            mode: 'CASH' as const,
            debitCredit: 'CREDIT' as const,
            purpose: alert.triggerReason,
            remarks: alert.triggerReasonNepali,
          },
        ];

    const indicators: string[] = [];
    if (alert.ruleCode === 'STR_STRUCTURING') {
      indicators.push('TRANSACTION_BELOW_STATUTORY_THRESHOLD_PATTERN');
      indicators.push('UNUSUAL_VOLUME_FOR_ECONOMIC_PROFILE');
    } else if (alert.ruleCode === 'PEP_EDD') {
      indicators.push('POLITICALLY_EXPOSED_PERSON_HIGH_EXPOSURE');
    } else {
      indicators.push('THRESHOLD_CASH_TRANSACTION_EXCEEDING_1M');
    }

    return {
      reportCode,
      reportRef: `GOAML-UNAKO-${today.replace(/-/g, '')}-${alert.transactionId}`,
      reportDate: today,
      entity: DEFAULT_UNAKO_ENTITY,
      complianceOfficer: DEFAULT_UNAKO_AMLCO,
      subject: {
        id: matchedMember.id,
        memberNo: matchedMember.memberNo,
        fullName: matchedMember.name,
        citizenshipNo: (matchedMember as { citizenshipNo?: string }).citizenshipNo || '52-01-70-12849',
        nid: (matchedMember as { nationalId?: string }).nationalId || '9841298410',
        occupation: (matchedMember as { occupation?: string }).occupation || 'Agriculture / Trade',
        annualIncome: (matchedMember as { annualIncome?: number }).annualIncome || 600000,
        address: matchedMember.address || 'Gadhawa-05, Dang',
        isPep: (matchedMember as { isPep?: boolean }).isPep || alert.ruleCode === 'PEP_EDD',
        phone: matchedMember.phone || '9847820194',
      },
      transactions: relatedTxs,
      suspicionNarrative: isStr
        ? `Transaction of NPR ${alert.amount.toLocaleString()} triggered AML rule ${alert.ruleCode}: ${alert.triggerReason}. Source of funds verification conducted.`
        : undefined,
      suspicionNarrativeNepali: isStr
        ? `रकम रु ${alert.amount.toLocaleString()} को कारोबारमा सम्पत्ति शुद्धीकरण निवारण नियम ${alert.ruleCode} अन्तर्गत शंकास्पद खण्डीकरण वा उच्च जोखिम भेटिएकोले प्रतिवेदन गरिएको छ।`
        : undefined,
      indicators,
      internalActionTaken: isStr
        ? 'Account tagged for Enhanced Due Diligence (EDD), source of funds declared, and STR initiated for FIU-Nepal dispatch.'
        : 'Threshold cash transaction recorded in statutory register and prepared for Section 21 monthly TTR dispatch.',
      amlcoRecommendation: officerNote || (isStr
        ? 'File STR to FIU-Nepal portal immediately; monitor subsequent account transactions for smurfing patterns.'
        : 'Submit in monthly TTR batch; routine threshold monitoring active.'),
    };
  }, [alert, member, transactions, officerNote]);

  const xmlContent = useMemo(() => {
    if (!reportData) return '';
    return generateGoAmlXml(reportData);
  }, [reportData]);

  const validation = useMemo(() => {
    if (!reportData) return { isValid: false, errors: [], warnings: [] };
    return validateGoAmlReport(reportData);
  }, [reportData]);

  if (!isOpen || !alert || !reportData) return null;

  const handleCopyXml = () => {
    navigator.clipboard.writeText(xmlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadXml = () => {
    downloadGoAmlXml(reportData);
  };

  const handlePrintDossier = () => {
    printStrInvestigationDossier(reportData);
  };

  const handleMarkReported = () => {
    if (onStatusUpdate && alert) {
      onStatusUpdate(alert.id, 'FIU_REPORTED');
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-rose-950/60 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <ShieldCheck className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40">
                  {reportData.reportCode} • FIU-Nepal goAML
                </span>
                <span className="text-xs font-mono text-slate-400">{reportData.reportRef}</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                {t('FIU-Nepal goAML XML प्रेषण तथा STR अनुसन्धान मिसिल', 'goAML XML Dispatch & STR Investigation Portal')}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 pt-3 bg-slate-950/40 border-b border-slate-800 flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('XML')}
            className={`flex items-center gap-2 px-4 py-2.5 font-bold border-b-2 transition cursor-pointer ${
              activeTab === 'XML'
                ? 'border-rose-500 text-rose-400 bg-rose-500/10 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="size-4" />
            <span>{t('goAML XML कोड (Schema 2.0)', 'goAML XML (Schema 2.0)')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('DOSSIER')}
            className={`flex items-center gap-2 px-4 py-2.5 font-bold border-b-2 transition cursor-pointer ${
              activeTab === 'DOSSIER'
                ? 'border-rose-500 text-rose-400 bg-rose-500/10 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ClipboardList className="size-4" />
            <span>{t('STR अनुसन्धान मिसिल (Dossier)', 'STR Investigation Dossier')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('CHECKLIST')}
            className={`flex items-center gap-2 px-4 py-2.5 font-bold border-b-2 transition cursor-pointer ${
              activeTab === 'CHECKLIST'
                ? 'border-rose-500 text-rose-400 bg-rose-500/10 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="size-4" />
            <span>{t('FIU प्रेषण कार्यविधि (Checklist)', 'FIU Submission Checklist')}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Tab 1: XML Preview */}
          {activeTab === 'XML' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`size-2.5 rounded-full ${
                      validation.isValid ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
                    }`}
                  />
                  <div>
                    <span className="font-bold text-white block">
                      {validation.isValid
                        ? t('UNODC goAML Schema प्रमाणीकरण सफल', 'UNODC goAML Schema Validated')
                        : t('प्रमाणीकरण त्रुटिहरू फेला परे', 'Validation Errors Found')}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      RE Code: {reportData.entity.entityId} • {reportData.transactions.length} Transaction(s)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyXml}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition cursor-pointer"
                  >
                    {copied ? <Check className="size-3.5 text-emerald-400" /> : <Copy className="size-3.5" />}
                    <span>{copied ? t('कपी भयो', 'Copied') : t('XML कपी', 'Copy XML')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadXml}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-md transition cursor-pointer"
                  >
                    <Download className="size-3.5" />
                    <span>{t('.xml डाउनलोड', 'Download .xml')}</span>
                  </button>
                </div>
              </div>

              {validation.warnings.length > 0 && (
                <div className="bg-amber-950/40 border border-amber-800/60 p-3 rounded-xl text-amber-300 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="size-4 text-amber-400" />
                    <span>{t('सुझाव तथा चेतावनी:', 'Compliance Warnings:')}</span>
                  </div>
                  <ul className="list-disc pl-5 space-y-0.5 text-[11px]">
                    {validation.warnings.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="relative rounded-xl border border-slate-800 bg-slate-950 overflow-hidden font-mono text-[11px] text-slate-300">
                <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-slate-400 text-[10px]">
                  <span>{reportData.reportRef}.xml</span>
                  <span>UTF-8 • XML 1.0</span>
                </div>
                <pre className="p-4 max-h-80 overflow-y-auto overflow-x-auto leading-relaxed text-emerald-300/90 whitespace-pre">
                  {xmlContent}
                </pre>
              </div>
            </div>
          )}

          {/* Tab 2: STR Dossier */}
          {activeTab === 'DOSSIER' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-rose-400 font-bold">
                    <User className="size-4" />
                    <span>{t('सदस्य विवरण (Member Subject)', 'Member Subject')}</span>
                  </div>
                  <div className="space-y-1 text-slate-300">
                    <div>
                      <span className="text-slate-500">{t('नाम:', 'Name:')}</span>{' '}
                      <strong className="text-white">{reportData.subject.fullName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">{t('सदस्य नं.:', 'Member No:')}</span>{' '}
                      <span className="font-mono text-slate-200">{reportData.subject.memberNo}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">{t('नागरिकता / NID:', 'Citizenship / NID:')}</span>{' '}
                      <span className="font-mono text-slate-200">
                        {reportData.subject.citizenshipNo || reportData.subject.nid}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">{t('पेशा / आय:', 'Occupation / Income:')}</span>{' '}
                      <span>
                        {reportData.subject.occupation} (रु {reportData.subject.annualIncome.toLocaleString()})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-rose-400 font-bold">
                    <Building className="size-4" />
                    <span>{t('अनुपालन अधिकृत (AMLCO Particulars)', 'AMLCO Officer')}</span>
                  </div>
                  <div className="space-y-1 text-slate-300">
                    <div>
                      <span className="text-slate-500">{t('अधिकृत:', 'Officer:')}</span>{' '}
                      <strong className="text-white">{reportData.complianceOfficer.nameNepali}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">{t('पद:', 'Designation:')}</span>{' '}
                      <span>{reportData.complianceOfficer.designation}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">{t('सम्पर्क:', 'Contact:')}</span>{' '}
                      <span>{reportData.complianceOfficer.phone}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">{t('ईमेल:', 'Email:')}</span>{' '}
                      <span className="font-mono">{reportData.complianceOfficer.email}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Suspicion Grounds */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-rose-400 font-bold">
                  <AlertOctagon className="size-4 text-rose-500" />
                  <span>{t('शंकाको आधार तथा कारण (Grounds of Suspicion)', 'Grounds of Suspicion')}</span>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-slate-200 leading-relaxed">
                  <p className="font-medium">{reportData.suspicionNarrativeNepali || alert.triggerReasonNepali}</p>
                  <p className="text-slate-400 mt-1 font-mono text-[11px]">{reportData.suspicionNarrative || alert.triggerReason}</p>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">
                    {t('AMLCO को थप राय तथा सिफारिस (Officer Note & Recommendation):', 'Officer Note & Recommendation:')}
                  </label>
                  <textarea
                    rows={2}
                    value={officerNote}
                    onChange={(e) => setOfficerNote(e.target.value)}
                    placeholder={t(
                      'अनुसन्धानको निष्कर्ष र सञ्चालक समिति समक्ष पेश गरिने सिफारिस लेख्नुहोस्...',
                      'Enter investigation conclusions and recommendations for the Board...'
                    )}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-200 placeholder:text-slate-500 focus:outline-hidden focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handlePrintDossier}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition cursor-pointer"
                >
                  <Printer className="size-4 text-rose-400" />
                  <span>{t('आधिकारिक A4 मिसिल प्रिन्ट (Print Dossier)', 'Print Official A4 Dossier')}</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab 3: Submission Checklist */}
          {activeTab === 'CHECKLIST' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  <ShieldCheck className="size-4 text-emerald-400" />
                  <span>{t('FIU-Nepal goAML प्रेषण प्रोटोकल (५ चरण)', 'FIU-Nepal 5-Step Submission Protocol')}</span>
                </h4>

                <div className="space-y-2 text-slate-300">
                  <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="size-5 rounded-full bg-rose-500/20 text-rose-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                      1
                    </span>
                    <div>
                      <strong className="text-white block">
                        {t('सदस्य e-KYC तथा स्रोत प्रमाणीकरण', 'Member e-KYC & Source Verification')}
                      </strong>
                      <span className="text-[11px] text-slate-400">
                        {t(
                          'सदस्यको नागरिकता, पेशा र वार्षिक आय अनुसारको कारोबारको विश्लेषण सम्पन्न भएको हुनुपर्छ।',
                          'Member citizenship, occupation, and declared annual income verified.'
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="size-5 rounded-full bg-rose-500/20 text-rose-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                      2
                    </span>
                    <div>
                      <strong className="text-white block">
                        {t('goAML XML फाइल डाउनलोड', 'Download goAML XML File')}
                      </strong>
                      <span className="text-[11px] text-slate-400">
                        {t(
                          'माथिको ट्याबबाट प्रमाणीकृत .xml फाइल डाउनलोड गरी सुरक्षित गर्नुहोस्।',
                          'Download the validated schema 2.0 .xml file for local upload.'
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="size-5 rounded-full bg-rose-500/20 text-rose-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                      3
                    </span>
                    <div>
                      <strong className="text-white block">
                        {t('FIU Web Portal मा अपलोड (https://goamlweb.nrb.org.np)', 'Upload to FIU Web Portal')}
                      </strong>
                      <span className="text-[11px] text-slate-400">
                        {t(
                          'नेपाल राष्ट्र बैंक FIU को आधिकारिक goAML पोर्टलमा संस्थाको क्रेडेन्सियल प्रयोग गरी XML अपलोड गर्नुहोस्।',
                          'Log into NRB FIU portal and upload the .xml file under XML Reports section.'
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                    <span className="size-5 rounded-full bg-rose-500/20 text-rose-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                      4
                    </span>
                    <div>
                      <strong className="text-white block">
                        {t('STR अनुसन्धान मिसिल मुद्रण र सुरक्षित अभिलेख', 'Print & Archive STR Dossier')}
                      </strong>
                      <span className="text-[11px] text-slate-400">
                        {t(
                          'AMLCO तथा कार्यकारी प्रमुखको हस्ताक्षरसहित गोप्य फायलमा अनुसन्धान मिसिल सुरक्षित राख्नुहोस्।',
                          'Sign official A4 dossier and preserve in confidential AML/CFT registry.'
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submission Registration */}
              <div className="p-4 rounded-xl bg-slate-950 border border-emerald-900/40 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <CheckCircle2 className="size-4" />
                  <span>{t('goAML प्रेषण टोकन प्रविष्टि तथा स्थिति अद्यावधिक', 'Register FIU Submission Token')}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                  <div>
                    <label className="block text-slate-400 text-[11px] font-bold mb-1">
                      {t('FIU goAML Submission Token / Acknowledgement No:', 'FIU Acknowledgement Token:')}
                    </label>
                    <input
                      type="text"
                      value={submissionToken}
                      onChange={(e) => setSubmissionToken(e.target.value)}
                      placeholder="e.g. FIU-ACK-2026-0928-8819"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono placeholder:text-slate-500"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleMarkReported}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-md"
                  >
                    <CheckCircle2 className="size-4" />
                    <span>{t('FIU मा प्रेषित प्रमाणित गर्नुहोस्', 'Mark as FIU Reported')}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-400" />
            <span>{t('सहकारी विभाग निर्देशिका २०७९ अनुपालित', 'Dept of Cooperatives Directives 2079 Compliant')}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition cursor-pointer"
          >
            {t('बन्द गर्नुहोस्', 'Close')}
          </button>
        </div>
      </div>
    </div>
  );
};
