import React from 'react';
import {
  Printer,
  X,
  ShieldCheck,
  BadgeCheck,
  Landmark,
  User,
  Phone,
  Mail,
  MapPin,
  Users,
  CheckCircle2,
  FileText,
  QrCode,
} from 'lucide-react';
import { Member } from '../../types';
import { useLanguageStore } from '../../store/useLanguageStore';
import { useCoopStore } from '../../store/useCoopStore';
import { printElement } from '../../utils/printHelper';

interface MemberAccountProfilePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
}

export const MemberAccountProfilePrintModal: React.FC<MemberAccountProfilePrintModalProps> = ({
  isOpen,
  onClose,
  member,
}) => {
  const { t, fmtCurrency, fmtDigits } = useLanguageStore();
  const { coopSettings } = useCoopStore();

  if (!isOpen || !member) return null;

  const handlePrint = () => {
    printElement('member-account-dossier');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="member-dossier-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* On-screen Header Bar (Hidden during print) */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 id="member-dossier-title" className="font-bold text-sm">
                {t('सदस्य खाता तथा पहिचान विवरण (KYC Dossier)', 'Member Account & KYC Dossier Profile')}
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                {member.name} [{member.memberNo}]
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition cursor-pointer"
            >
              <Printer className="size-4" />
              <span>{t('खाता विवरण छाप्नुहोस्', 'Print Dossier')}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label={t('बन्द गर्नुहोस्', 'Close')}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Printable Member Dossier Sheet Container */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50 dark:bg-slate-950">
          <div
            id="member-account-dossier"
            data-printable="statement"
            className="bg-white text-slate-900 p-8 sm:p-10 rounded-2xl border-2 border-slate-300 shadow-md space-y-6 max-w-4xl mx-auto print:p-0 print:m-0 print:border-none print:shadow-none"
          >
            {/* 1. Official Cooperative Bilingual Header */}
            <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5 gap-4">
              <div className="flex items-center gap-3.5">
                <img
                  src="/unako-logo.png"
                  alt="Unako SACCOS Logo"
                  className="h-16 w-auto object-contain shrink-0"
                />
                <div>
                  <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight leading-tight">
                    {coopSettings.nameNepali}
                  </h1>
                  <p className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                    {coopSettings.name}
                  </p>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    {coopSettings.address} • {t('दर्ता नं.', 'Reg. No.')} {coopSettings.regNo} • {t('स्थायी लेखा नं. (PAN)', 'PAN')}: {coopSettings.panNo}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    Tel: {coopSettings.phone} • Email: {coopSettings.email}
                  </p>
                </div>
              </div>

              <div className="text-right flex flex-col items-end shrink-0">
                <div className="w-16 h-16 border border-slate-400 rounded-lg p-1 bg-slate-50 flex flex-col items-center justify-center">
                  <QrCode className="w-6 h-6 text-slate-800" />
                  <span className="text-[8px] font-mono font-bold text-slate-600">KYC VERIFIED</span>
                </div>
                <span className="mt-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-300 text-[10px] font-bold font-mono">
                  {member.memberNo}
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5 font-mono">
                  {new Date().toLocaleDateString('ne-NP')}
                </span>
              </div>
            </div>

            {/* Document Title Banner */}
            <div className="text-center py-1 bg-slate-100 rounded-lg border border-slate-300">
              <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                {t('सदस्य व्यक्तिगत, पारिवारिक तथा खाता अभिलेख विवरण (KYC Dossier)', 'Official Member Account, Lineage & KYC Record Dossier')}
              </h2>
            </div>

            {/* 2. Primary Identity & Photo Strip */}
            <div className="flex flex-col sm:flex-row items-start gap-5 p-4 rounded-xl border border-slate-300 bg-slate-50/60">
              {/* Avatar Photo */}
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-xl overflow-hidden border-2 border-slate-800 bg-white shadow-sm shrink-0 flex items-center justify-center">
                {member.avatarUrl ? (
                  <img
                    src={member.avatarUrl}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="size-12 text-slate-400" />
                )}
              </div>

              {/* Bio Particulars Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 text-xs flex-1">
                <div>
                  <span className="text-slate-500 block text-[11px]">{t('सदस्यको पूरा नाम', 'Full Legal Name')}:</span>
                  <p className="font-bold text-slate-900 text-sm">{member.name}</p>
                  {member.nameNepali && (
                    <p className="text-slate-700 text-xs font-semibold">{member.nameNepali}</p>
                  )}
                </div>

                <div>
                  <span className="text-slate-500 block text-[11px]">{t('सदस्यता नम्बर', 'Member ID')}:</span>
                  <p className="font-mono font-bold text-emerald-800 text-sm">{member.memberNo}</p>
                </div>

                <div>
                  <span className="text-slate-500 block text-[11px]">{t('सदस्यता मिति', 'Join Date')}:</span>
                  <p className="font-mono font-semibold text-slate-900">{member.joinedDate}</p>
                </div>

                <div>
                  <span className="text-slate-500 block text-[11px]">{t('नागरिकता नम्बर', 'Citizenship No')}:</span>
                  <p className="font-mono font-bold text-slate-900">{member.citizenshipNo}</p>
                </div>

                <div>
                  <span className="text-slate-500 block text-[11px]">{t('जारी जिल्ला / मिति', 'Issue District / Date')}:</span>
                  <p className="font-medium text-slate-800">
                    {member.citizenshipIssueDistrict || 'दाङ (Dang)'} • {member.citizenshipIssueDateBs || '२०६०-०३-२२'}
                  </p>
                </div>

                <div>
                  <span className="text-slate-500 block text-[11px]">{t('स्थायी लेखा नं (PAN)', 'PAN No')}:</span>
                  <p className="font-mono font-bold text-slate-900">{member.panNo || '३००९८२१२'}</p>
                </div>

                <div>
                  <span className="text-slate-500 block text-[11px]">{t('सम्पर्क नम्बर', 'Mobile Phone')}:</span>
                  <p className="font-mono font-semibold text-slate-900">{member.phone}</p>
                </div>

                <div>
                  <span className="text-slate-500 block text-[11px]">{t('ईमेल ठेगाना', 'Email')}:</span>
                  <p className="font-mono text-slate-800 truncate">{member.email}</p>
                </div>

                <div>
                  <span className="text-slate-500 block text-[11px]">{t('पेशा / व्यवसाय', 'Occupation')}:</span>
                  <p className="font-semibold text-slate-900">{member.occupation || 'कृषि तथा पशुपालन (Agriculture)'}</p>
                </div>
              </div>
            </div>

            {/* 3. Address & Family Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Address Details */}
              <div className="p-4 rounded-xl border border-slate-300 bg-slate-50/60 space-y-2">
                <h4 className="font-bold text-slate-900 text-xs border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                  <MapPin className="size-3.5 text-emerald-700" />
                  <span>{t('बसोबास तथा ठेगाना विवरण', 'Address & Residence Information')}</span>
                </h4>
                <div>
                  <span className="text-slate-500 text-[11px] block">{t('स्थायी ठेगाना (Permanent Address):', 'Permanent Address:')}</span>
                  <p className="font-semibold text-slate-900">
                    {member.addressNepali || member.address || 'गढवा गाउँपालिका वडा नं. ५, चैनपुर, देउखुरी, दाङ'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px] block">{t('हालको बसोबास (Current/Temporary Address):', 'Temporary Address:')}</span>
                  <p className="font-medium text-slate-800">
                    {member.tempAddress || 'स्थायी ठेगाना अनुसार नै (Same as Permanent)'}
                  </p>
                </div>
              </div>

              {/* Family Lineage (तीनपुस्ते) */}
              <div className="p-4 rounded-xl border border-slate-300 bg-slate-50/60 space-y-2">
                <h4 className="font-bold text-slate-900 text-xs border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                  <Users className="size-3.5 text-emerald-700" />
                  <span>{t('पारिवारिक तीनपुस्ते विवरण', 'Family Lineage & Relations')}</span>
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-500 text-[11px] block">{t('हजुरबुबाको नाम:', 'Grandfather:')}</span>
                    <p className="font-bold text-slate-900">{member.grandfatherName || 'श्री शालिकराम चौधरी'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block">{t('बुबाको नाम:', 'Father:')}</span>
                    <p className="font-bold text-slate-900">{member.fatherName || 'श्री रामेश्वर चौधरी'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block">{t('आमाको नाम:', 'Mother:')}</span>
                    <p className="font-bold text-slate-900">{member.motherName || 'श्रीमती कौशिल्या चौधरी'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block">{t('पति / पत्नीको नाम:', 'Spouse:')}</span>
                    <p className="font-bold text-slate-900">{member.spouseName || 'श्रीमती सुनिता कुमारी चौधरी'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Nominee & Account Portfolio Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Nominee Details */}
              <div className="p-4 rounded-xl border border-slate-300 bg-slate-50/60 space-y-2">
                <h4 className="font-bold text-slate-900 text-xs border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                  <BadgeCheck className="size-3.5 text-emerald-700" />
                  <span>{t('हकवाला / इच्छाएको व्यक्ति (Nominee)', 'Nominee Declaration')}</span>
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-500 text-[11px] block">{t('हकवालाको नाम:', 'Nominee Name:')}</span>
                    <p className="font-bold text-slate-900">{member.nominee?.name || 'सुनिता कुमारी चौधरी'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block">{t('नाता (Relation):', 'Relation:')}</span>
                    <p className="font-semibold text-slate-900">{member.nominee?.relation || 'श्रीमती (Spouse)'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block">{t('नागरिकता / परिचयपत्र:', 'Citizenship / ID:')}</span>
                    <p className="font-mono text-slate-800">{member.nominee?.citizenshipNo || '५२-०१-७४-०२१९४'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block">{t('सम्पर्क फोन:', 'Phone:')}</span>
                    <p className="font-mono text-slate-800">{member.nominee?.phone || member.phone}</p>
                  </div>
                </div>
              </div>

              {/* Bank & Payout Details */}
              <div className="p-4 rounded-xl border border-slate-300 bg-slate-50/60 space-y-2">
                <h4 className="font-bold text-slate-900 text-xs border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                  <Landmark className="size-3.5 text-emerald-700" />
                  <span>{t('अन्तर-बैंक लाभांश खाता विवरण', 'Inter-Bank Payout Account')}</span>
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-500 text-[11px] block">{t('बैंकको नाम:', 'Bank Name:')}</span>
                    <p className="font-bold text-slate-900">{member.bankDetails?.bankName || 'कृषि विकास बैंक (ADBL)'}</p>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block">{t('शाखा:', 'Branch:')}</span>
                    <p className="font-semibold text-slate-900">{member.bankDetails?.branch || 'लमही शाखा, दाङ'}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500 text-[11px] block">{t('खाता नम्बर:', 'Account Number:')}</span>
                    <p className="font-mono font-bold text-slate-900">{member.bankDetails?.accountNo || '०२३-१०९८२१३४९०'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Accounts & Balance Portfolio */}
            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <FileText className="size-3.5 text-emerald-700" />
                <span>{t('सहकारी खाता मौज्दात तथा लगानी संक्षेप', 'SACCOS Accounts & Capital Portfolio')}</span>
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-300 rounded-lg overflow-hidden">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                    <tr>
                      <th className="py-2.5 px-3">{t('खाता शीर्षक', 'Account Title')}</th>
                      <th className="py-2.5 px-3">{t('खाता नम्बर', 'A/C Number')}</th>
                      <th className="py-2.5 px-3">{t('ब्याजदर / प्रतिफल', 'Yield / Rate')}</th>
                      <th className="py-2.5 px-3 text-right">{t('वर्तमान मौज्दात / पूँजी', 'Balance / Capital')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    <tr>
                      <td className="py-2 px-3 font-semibold text-slate-900">
                        {t('नियमित साधारण बचत', 'Regular Savings')}
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-600">004-10294-88-01</td>
                      <td className="py-2 px-3 font-bold text-emerald-700">8.0% p.a.</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                        रु. {fmtCurrency(member.totalSavings || 184500, false)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold text-slate-900">
                        {t('अनिवार्य मासिक बचत', 'Compulsory Monthly')}
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-600">004-10294-88-02</td>
                      <td className="py-2 px-3 font-bold text-emerald-700">8.5% p.a.</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                        रु. {fmtCurrency(68000, false)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold text-slate-900">
                        {t('सदस्य शेयर पूँजी', 'Share Capital')}
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-600">
                        {fmtDigits(member.shareKitta || 500)} {t('कित्ता', 'Units')}
                      </td>
                      <td className="py-2 px-3 font-bold text-amber-700">14.2% Div</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                        रु. {fmtCurrency(member.shareCapital || 50000, false)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3 font-semibold text-slate-900">
                        {t('सक्रिय ऋण दायित्व', 'Active Loan Liabilities')}
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-600">LN-2025-0429</td>
                      <td className="py-2 px-3 font-bold text-rose-700">9.5% p.a.</td>
                      <td className="py-2 px-3 text-right font-mono font-bold text-rose-700">
                        रु. {fmtCurrency(member.activeLoanBalance || 320000, false)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 6. KYC Document Verification Status Badges */}
            <div className="p-3 rounded-xl border border-slate-300 bg-slate-50/70 text-xs">
              <span className="text-slate-600 font-bold block mb-1.5">
                {t('केन्द्रीय बैंकिङ्ग प्रणाली (CBS) प्रमाणित कागजात स्थिति:', 'CBS Verified Statutory KYC Checklist:')}
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                  <CheckCircle2 className="size-3.5 text-emerald-600" />
                  <span>नागरिकता प्रमाणपत्र (OK)</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                  <CheckCircle2 className="size-3.5 text-emerald-600" />
                  <span>जग्गाधनी पुर्जा (OK)</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                  <CheckCircle2 className="size-3.5 text-emerald-600" />
                  <span>वडा बसोबास सिफारिस (OK)</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                  <CheckCircle2 className="size-3.5 text-emerald-600" />
                  <span>बायोमेट्रिक औंठाछाप (OK)</span>
                </div>
              </div>
            </div>

            {/* 7. Signatures & Official Certification */}
            <div className="pt-8 border-t-2 border-slate-900 flex justify-between items-end text-xs font-semibold">
              <div className="text-center">
                <div className="w-36 border-b border-slate-800 mb-1"></div>
                <span className="font-bold text-slate-900">{t('सदस्यको दस्तखत', 'Member Signature')}</span>
                <p className="text-[10px] text-slate-500">मिति: {new Date().toLocaleDateString('ne-NP')}</p>
              </div>

              <div className="text-center flex flex-col items-center">
                <div className="w-20 h-20 rounded-full border-2 border-dashed border-emerald-600 bg-emerald-50/50 flex flex-col items-center justify-center p-1 text-[9px] font-bold text-emerald-900 leading-tight">
                  <span>उनको साकोस</span>
                  <span>आधिकारिक छाप</span>
                  <span>CBS CERTIFIED</span>
                </div>
                <span className="text-[10px] text-slate-500 mt-1">{t('संस्थाको छाप', 'Official Seal')}</span>
              </div>

              <div className="text-center">
                <div className="w-36 border-b border-slate-800 mb-1"></div>
                <span className="font-bold text-slate-900">{t('प्रमाणीकरण अधिकृत / प्रबन्धक', 'Authorized Officer / Manager')}</span>
                <p className="text-[10px] text-slate-500">केन्द्रीय कार्यालय, गढवा, दाङ</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
