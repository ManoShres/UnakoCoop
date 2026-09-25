import React, { useState } from 'react';
import { Download, CheckCircle2, Eye, Printer, X, ShieldCheck, Landmark } from 'lucide-react';
import { useLanguageStore } from '../../store/useLanguageStore';
import { useCoopStore } from '../../store/useCoopStore';
import { printElement } from '../../utils/printHelper';

interface ReportItem {
  title: string;
  titleNepali: string;
  period: string;
  size: string;
  auditor: string;
  auditorNepali?: string;
  status: string;
  statusNepali?: string;
  summary: string;
  summaryNepali?: string;
}

export const ReportsPage: React.FC = () => {
  const { t } = useLanguageStore();
  const { coopSettings } = useCoopStore();
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);

  const reports: ReportItem[] = [
    {
      title: 'Annual Audited Financial Statement FY 2080/81',
      titleNepali: 'वार्षिक लेखापरीक्षण वित्तीय विवरण आ.व. २०८०/८१',
      period: 'Fiscal Year 2080/81 (2023-2024)',
      size: '2.4 MB PDF',
      auditor: 'Regmi & Associates, Chartered Accountants',
      auditorNepali: 'रेग्मी एण्ड एसोसिएट्स, चार्टर्ड एकाउन्टेन्ट्स',
      status: 'Clean Audit Opinion',
      statusNepali: 'कैफियत रहित लेखापरीक्षण राय',
      summary: 'Total Assets: NPR 84.5 Crore | Net Surplus: NPR 1.12 Crore | 14.2% Cash Dividend Disbursed to all general members.',
      summaryNepali: 'कुल सम्पत्ति: रु. ८४.५ करोड | खुद बचत: रु. १.१२ करोड | १४.२% नगद लाभांश वितरण।',
    },
    {
      title: 'Quarterly Risk Assessment & Capital Adequacy Report Q4',
      titleNepali: 'चौथो त्रैमासिक जोखिम मूल्याङ्कन तथा पूँजी पर्याप्तता प्रतिवेदन',
      period: 'Ashad End 2081',
      size: '1.8 MB PDF',
      auditor: 'Internal Supervisory Committee',
      auditorNepali: 'आन्तरिक लेखा सुपरिवेक्षण समिति',
      status: 'Adequate Liquidity 24.1%',
      statusNepali: 'पर्याप्त तरलता २४.१%',
      summary: 'Cooperative maintains 24.1% liquid reserves against statutory 15% mandate, fully invested in AAA instruments.',
      summaryNepali: 'सहकारीले तोकिएको १५% भन्दा बढी २४.१% तरलता कोष सुरक्षित राखेको छ।',
    },
    {
      title: '11th Annual General Meeting (AGM) Decisions & Minutes',
      titleNepali: '११औं वार्षिक साधारण सभा निर्णय तथा कार्य विवरण',
      period: 'Mangsir 2080',
      size: '3.1 MB PDF',
      auditor: 'Department of Cooperatives Record',
      auditorNepali: 'सहकारी विभाग अभिलेख',
      status: '14.2% Dividend Approved',
      statusNepali: '१४.२% लाभांश पारित',
      summary: 'Unanimous member resolution approving 14.2% dividend, new agro-livestock loan window, and branch expansion.',
      summaryNepali: '१४.२% लाभांश वितरण तथा नयाँ कृषि-पशुपालन कर्जा स्वीकृत।',
    },
    {
      title: 'AML/CFT Compliance & Member KYC Verification Summary',
      titleNepali: 'सम्पत्ति शुद्धीकरण तथा डिजिटल ग्राहक पहिचान प्रमाणीकरण',
      period: 'Fiscal 2080/81',
      size: '1.2 MB PDF',
      auditor: 'Central Compliance & Risk Audit Cell',
      auditorNepali: 'केन्द्रीय अनुपालन तथा जोखिम परीक्षण शाखा',
      status: '100% Digital KYC Implemented',
      statusNepali: '१००% डिजिटल ग्राहक पहिचान सम्पन्न',
      summary: 'Full biometric and citizenship document digitization completed for 100% active borrowing members.',
      summaryNepali: 'सबै ऋणी सदस्यहरूको जैविक तथा नागरिकता प्रमाणीकरण सम्पन्न।',
    },
    {
      title: 'Social Audit & Community Outreach Report 2080',
      titleNepali: 'सामाजिक लेखापरीक्षण तथा सामुदायिक विकास प्रतिवेदन २०८०',
      period: 'Kartik 2080',
      size: '1.9 MB PDF',
      auditor: 'Community Stakeholder Social Audit Forum',
      auditorNepali: 'सामुदायिक सरोकारवाला सामाजिक लेखापरीक्षण मञ्च',
      status: 'Grade A+ Cooperative Ranking',
      statusNepali: 'क वर्ग (A+) सहकारी दर्जा',
      summary: 'Impact coverage across 12 rural wards in Dang; subsidized education and micro-insurance programs evaluated.',
      summaryNepali: 'दाङका १२ वडामा सामाजिक प्रभाव, छात्रवृत्ति तथा लघुबीमा कार्यक्रम मूल्याङ्कन।',
    },
    {
      title: 'Standard Operating Procedures & Bylaws 2081 (Amended)',
      titleNepali: 'संस्थाको आन्तरिक कार्यविधि तथा विनियम २०८१ (संशोधित)',
      period: 'Baisakh 2081',
      size: '3.8 MB PDF',
      auditor: 'Registrar of Cooperatives, Lumbini Province',
      auditorNepali: 'सहकारी रजिस्ट्रार कार्यालय, लुम्बिनी प्रदेश',
      status: 'Statutory Endorsement Complete',
      statusNepali: 'कानुनी प्रमाणीकरण सम्पन्न',
      summary: 'Governance framework, digital transaction limits, cybersecurity policies, and credit risk guidelines.',
      summaryNepali: 'संस्थागत सुशासन, डिजिटल कारोबार सीमा, साइबर सुरक्षा तथा जोखिम व्यवस्थापन नीति।',
    },
  ];

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${selectedReport ? 'py-12 print:p-0 print:m-0 print:w-full print:max-w-none' : 'py-12 space-y-12'}`}>
      {/* Catalog View - completely hidden when printing an open report modal */}
      <div className={`space-y-12 ${selectedReport ? 'print:hidden' : ''}`}>
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('पारदर्शिता तथा वित्तीय प्रतिवेदनहरू', 'Transparency & Financial Reports')}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {t(
              'सहकारीको विश्वसनीयता यसको पारदर्शी आर्थिक अनुशासनमा निहित छ। हाम्रा प्रमाणित लेखापरीक्षण, नीतिगत विवरण र साधारण सभाका प्रतिवेदनहरू यहाँ अवलोकन गर्नुहोस्।',
              'Open disclosure is the cornerstone of cooperative trust. Download our verified audits, statutory filings, and committee reports.'
            )}
          </p>
        </div>

        {/* Financial Health Snapshot */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-emerald-500 border border-slate-200 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-400 uppercase">{t('निष्क्रिय कर्जा अनुपात', 'Non-Performing Loan (NPL) Ratio')}</span>
            <div className="text-3xl font-black text-emerald-600 dark:text-[#13ec37] mt-1">0.82%</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {t('सहकारी मापदण्डको ५% भन्दा उल्लेखनीय रूपमा सुरक्षित', 'Significantly below national cooperative ceiling of 5.0%')}
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-blue-500 border border-slate-200 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-400 uppercase">{t('जगेडा तथा अन्य कोष', 'Statutory Reserve Fund')}</span>
            <div className="text-3xl font-black text-blue-600 dark:text-blue-400 mt-1">NPR 1.82 Crore</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {t('सरकारी ऋणपत्र र मुद्दती सुरक्षित कोषमा जम्मा', 'Held in government securities and central bank liquid instruments')}
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-purple-500 border border-slate-200 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-400 uppercase">{t('सदस्य शेयर पूँजी आधार', 'Share Capital Base')}</span>
            <div className="text-3xl font-black text-purple-600 dark:text-purple-400 mt-1">NPR 3.25 Crore</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {t('१,४२० शेयरधनी सदस्यहरूको लोकतान्त्रिक स्वामित्व', 'Owned by 1,420 voting community shareholders')}
            </p>
          </div>
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {t('आधिकारिक नियामक तथा लेखापरीक्षण प्रतिवेदनहरू', 'Official Regulatory Publications')}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reports.map((rep, idx) => (
              <div
                key={idx}
                className="glass-panel p-6 rounded-2xl flex flex-col justify-between space-y-4 hover:border-emerald-500/50 transition-colors border border-slate-200 dark:border-slate-800"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono font-bold text-emerald-600 dark:text-[#13ec37] bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                      {rep.period}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">{rep.size}</span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    {t(rep.titleNepali, rep.title)}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t('लेखापरीक्षक', 'Auditor')}: {t(rep.auditorNepali || rep.auditor, rep.auditor)}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-[#13ec37] font-semibold">
                    <CheckCircle2 className="size-3.5" />
                    <span>{t(rep.statusNepali || rep.status, rep.status)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedReport(rep)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 rounded-xl transition-colors shadow-xs cursor-pointer"
                  >
                    <Eye className="size-3.5" />
                    <span>{t('प्रतिवेदन हेर्नुहोस्', 'View Report')}</span>
                  </button>
                  <a
                    href={`/reports/${rep.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf`}
                    download
                    onClick={(e) => {
                      // Generate and download a simple, real text-based file if physical PDF isn't on disk
                      e.preventDefault();
                      const blob = new Blob([
                        `${coopSettings.name}\n${t(rep.titleNepali, rep.title)}\nPeriod: ${rep.period}\nAuditor: ${rep.auditor}\nStatus: ${rep.status}\n\nSummary:\n${rep.summary}\n\nOfficially verified by Unako SACCOS Internal Supervisory Board.`
                      ], { type: 'text/plain;charset=utf-8' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${rep.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title={t('प्रतिवेदन डाउनलोड गर्नुहोस्', 'Download Report')}
                  >
                    <Download className="size-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Official Certified Report Modal & Single-Page Printable Document */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div id="certified-report-document" data-printable="statement" className="bg-white dark:bg-[#0c1a0e] rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-y-auto max-h-[90vh] print:max-w-none print:w-full print:p-0 print:m-0 print:border-none print:shadow-none print:rounded-none print:bg-white print:text-slate-900 print:max-h-none print:overflow-visible print:space-y-4">
            
            {/* Printable Official Header (Matches user photo) */}
            <div className="hidden print:flex items-center justify-between border-b-2 border-slate-900 pb-4 mb-3">
              <div className="flex items-center gap-3.5">
                <img
                  src="/unako-logo.png"
                  alt="Unako SACCOS Logo"
                  className="size-14 object-contain shrink-0"
                />
                <div>
                  <h1 className="text-base font-black text-slate-900 tracking-tight leading-tight">
                    {coopSettings.nameNepali}
                  </h1>
                  <p className="text-xs font-bold text-emerald-800 uppercase">
                    {coopSettings.name}
                  </p>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    {t('केन्द्रीय कार्यालय', 'Head Office')}: {t(coopSettings.addressNepali, coopSettings.address)} | {t('दर्ता नं.', 'Reg. No.')} {coopSettings.regNo}
                  </p>
                  <p className="text-[11px] text-slate-600">
                    {t('सम्पर्क', 'Phone')}: {coopSettings.phone} | {t('ईमेल', 'Email')}: {coopSettings.email}
                  </p>
                </div>
              </div>
              <div className="text-right text-[11px] text-slate-600 space-y-0.5 shrink-0">
                <div className="inline-block px-2.5 py-1 bg-slate-100 text-slate-800 font-bold rounded border border-slate-300 text-[10px]">
                  {t('आधिकारिक अभिलेख', 'Official Record')}
                </div>
                <p className="font-bold text-slate-800 mt-1">{t('प्रमाणित प्रतिलिपि', 'Official Certified Copy')}</p>
                <p>{t('मिति', 'Date')}: {new Date().toLocaleDateString('en-US')}</p>
              </div>
            </div>

            {/* Screen Header (Hidden during print) */}
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-4 print:hidden">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
                  <Landmark className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {t(selectedReport.titleNepali, selectedReport.title)}
                  </h3>
                  <p className="text-xs text-emerald-600 font-medium">{t(coopSettings.nameNepali, coopSettings.name)} • {t('दर्ता नं.', 'Reg.')} {coopSettings.regNo}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Document Body */}
            <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
              {/* Metadata Box (Exact match with user photo) */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">{t('प्रतिवेदन अवधि:', 'Audit Period:')}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedReport.period}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">{t('लेखापरीक्षक निकाय:', 'Certifying Auditor:')}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{t(selectedReport.auditorNepali || selectedReport.auditor, selectedReport.auditor)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">{t('सत्यापन स्थिति:', 'Verification Status:')}</span>
                  <span className="font-bold text-slate-900 dark:text-white">{t(selectedReport.statusNepali || selectedReport.status, selectedReport.status)}</span>
                </div>
              </div>

              {/* Executive Highlights */}
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-1.5 text-xs">{t('प्रमुख वित्तीय सारसंक्षेप', 'Executive Financial Highlights')}</h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{t(selectedReport.summaryNepali || selectedReport.summary, selectedReport.summary)}</p>
              </div>

              {/* Verification Seal Banner */}
              <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 flex items-center gap-2 text-xs">
                <ShieldCheck className="size-4 shrink-0 text-slate-700 dark:text-slate-300" />
                <span>{t('नेपाल सहकारी विभाग तथा लुम्बिनी प्रदेश सहकारी रजिस्ट्रार कार्यालयमा अभिलेख दर्ता गरिएको।', 'Formally recorded with Dept. of Cooperatives and Provincial Registrar Office.')}</span>
              </div>
            </div>

            {/* 3-Column Signature Block (Exact match with user photo) */}
            <div className="hidden print:grid grid-cols-3 gap-6 pt-8 mt-6 border-t border-slate-300 text-center text-xs print-avoid-break">
              <div className="space-y-6">
                <div className="h-8"></div>
                <div>
                  <p className="border-t border-dashed border-slate-400 pt-1.5 font-bold text-slate-900">
                    {t('लेखा सुपरिवेक्षण समिति संयोजक', 'Audit Supervisory Convener')}
                  </p>
                  <p className="text-[10px] text-slate-600">{t('लेखा सुपरिवेक्षण समिति', 'Supervisory Committee')}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="h-8"></div>
                <div>
                  <p className="border-t border-dashed border-slate-400 pt-1.5 font-bold text-slate-900">
                    {t('व्यवस्थापक', 'General Manager')}
                  </p>
                  <p className="text-[10px] text-slate-600">{t('प्रशासन प्रमुख', 'Administrative Head')}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="h-8"></div>
                <div>
                  <p className="border-t border-dashed border-slate-400 pt-1.5 font-bold text-slate-900">
                    {t('संस्था अध्यक्ष', 'Chairperson')}
                  </p>
                  <p className="text-[10px] text-slate-600">{t('सञ्चालक समिति', 'Board of Directors')}</p>
                </div>
              </div>
            </div>

            {/* Modal Screen Actions (Hidden during print) */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800 print:hidden">
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {t('बन्द गर्नुहोस्', 'Close')}
              </button>
              <button
                type="button"
                onClick={() => printElement('certified-report-document')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs cursor-pointer"
              >
                <Printer className="size-4" />
                <span>{t('प्रिन्ट गर्नुहोस्', 'Print Official Copy')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
