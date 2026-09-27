import React, { useState } from 'react';
import { useCoopStore } from '../../store/useCoopStore';
import { Member, VerificationStatus } from '../../types';
import {
  Users,
  Search,
  UserPlus,
  Edit,
  ShieldCheck,
  Phone,
  MapPin,
  CheckCircle2,
  Clock,
  AlertTriangle,
  X,
  Printer,
  UserMinus,
  HeartHandshake,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguageStore } from '../../store/useLanguageStore';
import { MemberOnboardingWizard } from '../../components/admin/MemberOnboardingWizard';
import { MemberAccountProfilePrintModal } from '../../components/common/MemberAccountProfilePrintModal';
import { MembershipExitModal } from '../../components/admin/MembershipExitModal';
import { MemberMicroInsuranceModal } from '../../components/admin/MemberMicroInsuranceModal';

export function MemberManagementPage() {
  const { members, loans, savings, updateMemberDetails } = useCoopStore();
  const { t, fmtCurrency, fmtCount, fmtDigits, fmtPhone } = useLanguageStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | VerificationStatus>('ALL');
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [printMember, setPrintMember] = useState<Member | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showInsuranceModal, setShowInsuranceModal] = useState(false);
  const [exitSelectedMemberId, setExitSelectedMemberId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  React.useEffect(() => {
    if (!editingMember) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setEditingMember(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editingMember]);

  const showToastMsg = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.memberNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.phone.includes(searchTerm) ||
      m.citizenshipNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    updateMemberDetails(editingMember.id, {
      name: editingMember.name,
      phone: editingMember.phone,
      address: editingMember.address,
      status: editingMember.status,
      creditScore: editingMember.creditScore,
      notes: editingMember.notes,
    });
    showToastMsg(t(`सदस्य ${editingMember.name} को विवरण अद्यावधिक भयो!`, `Member ${editingMember.name} successfully updated!`));
    setEditingMember(null);
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-blue-500/40 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="size-5 text-emerald-400" />
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 font-bold mb-1">
            <Users className="size-4" />
            <span>{t('केन्द्रीय सदस्य लगत तथा डिजिटल केवाईसी', 'CENTRAL MEMBER DATABASE & KYC')}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {t('सदस्य व्यवस्थापन तथा अभिलेख कन्सोल', 'Member Management Suite')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t(
              'सदस्य विवरण सम्पादन, शेयर कित्ता व्यवस्थापन, केवाईसी कागजात प्रमाणीकरण र नयाँ सदस्यता दर्ता।',
              'Configure profiles, update membership tiers, manage KYC document approvals, and onboard new cooperative shareholders.'
            )}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/admin/verifications"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition"
          >
            <ShieldCheck className="size-4 text-emerald-500" />
            <span>{t('केवाईसी कतार', 'KYC Queue')}</span>
          </Link>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition"
            type="button"
          >
            <UserPlus className="size-4" />
            <span>{t('+ नयाँ सदस्य दर्ता', '+ Add New Member')}</span>
          </button>

          <button
            onClick={() => {
              setExitSelectedMemberId(null);
              setShowExitModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 text-xs font-bold transition border border-rose-200 dark:border-rose-900/40 cursor-pointer"
            type="button"
          >
            <UserMinus className="size-4 text-rose-500" />
            <span>{t('सदस्यता त्याग तथा फरफारक', 'Exit & Clearance')}</span>
          </button>

          <button
            onClick={() => setShowInsuranceModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 dark:hover:bg-teal-900/50 text-teal-700 dark:text-teal-300 text-xs font-bold transition border border-teal-200 dark:border-teal-900/40 cursor-pointer"
            type="button"
            title={t('सदस्य राहत तथा लघु-बीमा कोष व्यवस्थापन', 'Member Mutual Relief & Micro-Insurance Gateway')}
          >
            <HeartHandshake className="size-4 text-teal-600" />
            <span>{t('राहत तथा लघु-बीमा', 'Mutual Relief & Insurance')}</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <input
            type="text"
            placeholder={t('नाम, सदस्य नं. वा फोनबाट खोज्नुहोस्...', 'Search by name, ID, phone...')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {(['ALL', 'VERIFIED', 'PENDING', 'ACTION_REQUIRED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
              }`}
            >
              {st === 'ALL'
                ? t('सबै सदस्यहरू', 'All Members')
                : st === 'VERIFIED'
                ? t('प्रमाणित', 'Verified')
                : st === 'PENDING'
                ? t('प्रतीक्षारत', 'Pending')
                : t('कारबाही आवश्यक', 'Action Required')}
            </button>
          ))}
        </div>
      </div>

      {/* Member Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">{t('सदस्य विवरण', 'Member Info')}</th>
                <th className="py-3 px-4">{t('सम्पर्क तथा ठेगाना', 'Contact & Location')}</th>
                <th className="py-3 px-4">{t('वित्तीय स्थिति', 'Financial Standing')}</th>
                <th className="py-3 px-4">{t('केवाईसी स्थिति', 'KYC Status')}</th>
                <th className="py-3 px-4 text-right">{t('कार्य', 'Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredMembers.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  {/* Member Info */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shrink-0 bg-slate-100">
                        <img src={m.avatarUrl} alt={m.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white text-sm">{t(m.nameNepali || m.name, m.name)}</div>
                        <div className="text-[11px] font-mono text-blue-600 dark:text-blue-400 font-semibold">
                          {fmtDigits(m.memberNo)}
                        </div>
                        <div className="text-[10px] text-slate-400">{t('ना.प्र.नं:', 'Citiz:')} {fmtDigits(m.citizenshipNo)}</div>
                      </div>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <Phone className="size-3.5 text-slate-400" />
                      <span>{fmtPhone(m.phone)}</span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <MapPin className="size-3.5 text-slate-400" />
                      <span>{fmtDigits(t(m.addressNepali || m.address, m.address))}</span>
                    </div>
                  </td>

                  {/* Financials */}
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 dark:text-white">
                      {t('बचत: ', 'Savings: ')}{fmtCurrency(m.totalSavings, true)}
                    </div>
                    <div className="text-[11px] text-emerald-600 font-semibold">
                      {t('सेयर: ', 'Shares: ')}{fmtCurrency(m.shareCapital, true)}
                    </div>
                    {m.activeLoanBalance > 0 && (
                      <div className="text-[10px] text-amber-600 font-medium">
                        {t('कर्जा: ', 'Loan: ')}{fmtCurrency(m.activeLoanBalance, true)}
                      </div>
                    )}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        m.status === 'VERIFIED'
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                          : m.status === 'PENDING'
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                          : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400'
                      }`}
                    >
                      {m.status === 'VERIFIED' ? (
                        <CheckCircle2 className="size-3" />
                      ) : m.status === 'PENDING' ? (
                        <Clock className="size-3" />
                      ) : (
                        <AlertTriangle className="size-3" />
                      )}
                      {m.status === 'VERIFIED'
                        ? t('प्रमाणित', 'VERIFIED')
                        : m.status === 'PENDING'
                        ? t('प्रतीक्षारत', 'PENDING')
                        : m.status === 'ACTION_REQUIRED'
                        ? t('कारबाही आवश्यक', 'ACTION_REQUIRED')
                        : t('अस्वीकृत', 'REJECTED')}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-1 font-mono">{t('स्कोर: ', 'Score: ')}{fmtDigits(m.creditScore)}/{fmtDigits(850)}</div>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setPrintMember(m)}
                        title={t('खाता विवरण छाप्नुहोस्', 'Print Account Dossier')}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 font-bold transition text-xs"
                      >
                        <Printer className="size-3.5" />
                        <span className="hidden sm:inline">{t('प्रिन्ट', 'Print')}</span>
                      </button>
                      <button
                        onClick={() => setEditingMember(m)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 font-bold transition text-xs"
                      >
                        <Edit className="size-3.5" />
                        <span>{t('सम्पादन', 'Edit')}</span>
                      </button>
                      <button
                        onClick={() => {
                          setExitSelectedMemberId(m.id);
                          setShowExitModal(true);
                        }}
                        title={t('सदस्यता त्याग तथा अन्तिम हिसाब फरफारक', 'Membership Exit & Final Settlement')}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 font-bold transition text-xs cursor-pointer"
                      >
                        <UserMinus className="size-3.5" />
                        <span className="hidden sm:inline">{t('फरफारक', 'Exit')}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT MEMBER MODAL */}
      {editingMember && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-member-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={() => setEditingMember(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Edit className="size-4 text-blue-400" />
                <h3 id="edit-member-title" className="font-bold text-sm">
                  {t('सदस्य विवरण अद्यावधिक', 'Update Member Profile')}: {t(editingMember.nameNepali || editingMember.name, editingMember.name)}
                </h3>
              </div>
              <button
                onClick={() => setEditingMember(null)}
                aria-label={t('बन्द गर्नुहोस्', 'Close')}
                className="text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('पूरा नाम', 'Full Legal Name')}
                </label>
                <input
                  type="text"
                  value={editingMember.name}
                  onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('सम्पर्क नम्बर', 'Phone Number')}
                  </label>
                  <input
                    type="text"
                    value={editingMember.phone}
                    onChange={(e) => setEditingMember({ ...editingMember, phone: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t('केवाईसी स्थिति', 'KYC Status')}
                  </label>
                  <select
                    value={editingMember.status}
                    onChange={(e) => setEditingMember({ ...editingMember, status: e.target.value as VerificationStatus })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                  >
                    <option value="VERIFIED">{t('प्रमाणित', 'VERIFIED')}</option>
                    <option value="PENDING">{t('प्रतीक्षारत', 'PENDING')}</option>
                    <option value="ACTION_REQUIRED">{t('कारबाही आवश्यक', 'ACTION_REQUIRED')}</option>
                    <option value="REJECTED">{t('अस्वीकृत', 'REJECTED')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('ठेगाना / वडा', 'Address / Ward')}
                </label>
                <input
                  type="text"
                  value={editingMember.address}
                  onChange={(e) => setEditingMember({ ...editingMember, address: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('क्रेडिट स्कोर (०–८५०)', 'Credit Score (0–850)')}
                </label>
                <input
                  type="number"
                  value={editingMember.creditScore}
                  onChange={(e) => setEditingMember({ ...editingMember, creditScore: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
                  min={300}
                  max={850}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t('प्रशासनिक टिप्पणी', 'Administrative Notes')}
                </label>
                <textarea
                  value={editingMember.notes || ''}
                  onChange={(e) => setEditingMember({ ...editingMember, notes: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs h-20"
                  placeholder={t(
                    'केवाईसी लेखापरीक्षण टिप्पणी, धितो जाँच वा समिति निर्णय...',
                    'Record KYC audit remarks, collateral checks, or committee notes...'
                  )}
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setPrintMember(editingMember)}
                  className="px-3.5 py-2.5 rounded-xl border border-emerald-300 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition flex items-center justify-center gap-1.5"
                  title={t('सदस्य खाता तथा विवरण छाप्नुहोस्', 'Print Member Account Profile & Dossier')}
                >
                  <Printer className="size-3.5" />
                  <span className="hidden sm:inline">{t('खाता विवरण प्रिन्ट', 'Print Dossier')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditingMember(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition"
                >
                  {t('रद्द गर्नुहोस्', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition"
                >
                  {t('परिवर्तन सुरक्षित गर्नुहोस्', 'Save Changes')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STATUTORY 4-STEP MEMBER ONBOARDING WIZARD */}
      <MemberOnboardingWizard
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={(newMember) => {
          setShowAddModal(false);
          showToastMsg(
            t(
              `नयाँ सदस्य ${newMember.nameNepali || newMember.name} (${newMember.memberNo}) सफलतापूर्वक दर्ता भयो!`,
              `New member ${newMember.name} (${newMember.memberNo}) successfully registered!`
            )
          );
        }}
      />

      {/* MEMBER ACCOUNT & DOSSIER PRINT MODAL */}
      <MemberAccountProfilePrintModal
        isOpen={!!printMember}
        onClose={() => setPrintMember(null)}
        member={printMember}
      />

      {/* STATUTORY MEMBERSHIP EXIT & CLEARANCE MODAL */}
      <MembershipExitModal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        onSuccess={showToastMsg}
        members={members}
        loans={loans}
        savings={savings}
        preselectedMemberId={exitSelectedMemberId || undefined}
        onConfirmExit={(memberId, netPaid) => {
          updateMemberDetails(memberId, {
            status: 'REJECTED',
            notes: `सदस्यता त्याग तथा फरफारक सम्पन्न (कुल भुक्तानी: रु. ${netPaid.toLocaleString()})`,
          });
        }}
      />

      {/* MEMBER MICRO-INSURANCE & MUTUAL RELIEF MODAL */}
      <MemberMicroInsuranceModal
        isOpen={showInsuranceModal}
        onClose={() => setShowInsuranceModal(false)}
        members={members}
        loans={loans}
      />
    </div>
  );
}
