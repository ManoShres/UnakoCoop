import React, { useState } from 'react';
import {
  BallotPost,
  ElectionPost,
  Candidate,
  DEFAULT_BALLOT_POSTS,
  POST_METADATA,
  castSecretBallot,
  calculateElectionResults,
  generateElectionCertificate,
  generateOathOfOffice,
  exportElectionResultsToCSV,
} from '../../utils/agmElectionEngine';
import { useLanguageStore } from '../../store/useLanguageStore';
import {
  Vote,
  X,
  FileSpreadsheet,
  CheckCircle2,
  Users,
  Award,
  Printer,
  Copy,
  Check,
  ShieldCheck,
  BarChart3,
  Scroll,
  BookOpen,
  Sparkles,
  Send,
  Lock,
} from 'lucide-react';

interface AgmElectionPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AgmElectionPortalModal: React.FC<AgmElectionPortalModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useLanguageStore();

  const [posts, setPosts] = useState<BallotPost[]>(DEFAULT_BALLOT_POSTS);
  const [activeTab, setActiveTab] = useState<'ballot' | 'tally' | 'certificates' | 'oath' | 'code'>('tally');

  // Voting Booth state
  const [voterMemberNo, setVoterMemberNo] = useState('M-512');
  const [voterToken, setVoterToken] = useState('VOTE-SEC-8821');
  const [selectedChoices, setSelectedChoices] = useState<Record<ElectionPost, string[]>>({
    CHAIRPERSON: ['c-1'],
    VICE_CHAIRPERSON: ['c-3'],
    GENERAL_SECRETARY: ['c-5'],
    TREASURER: ['c-7'],
    FEMALE_DIRECTOR: ['c-9', 'c-10', 'c-11'],
    OPEN_DIRECTOR: [],
    AUDIT_CONVENOR: ['c-13'],
    AUDIT_MEMBER: [],
  });
  const [voteSubmittedSuccess, setVoteSubmittedSuccess] = useState(false);

  // Certificate / Oath selected winner
  const [selectedWinnerId, setSelectedWinnerId] = useState<string>('c-1');

  // Copy state
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const totalEligible = 1000;
  const totalVotesCast = 710;
  const results = calculateElectionResults(posts, totalEligible, totalVotesCast);

  const allWinners = Object.values(results.winners).flat();
  const selectedWinner = allWinners.find((w) => w.id === selectedWinnerId) || allWinners[0];

  const handleExportCSV = () => {
    const csv = exportElectionResultsToCSV(posts);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Unako_AGM_Election_Results_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSelectChoice = (post: ElectionPost, candidateId: string, maxSeats: number) => {
    setSelectedChoices((prev) => {
      const current = prev[post] || [];
      if (maxSeats === 1) {
        return { ...prev, [post]: [candidateId] };
      }
      if (current.includes(candidateId)) {
        return { ...prev, [post]: current.filter((id) => id !== candidateId) };
      }
      if (current.length < maxSeats) {
        return { ...prev, [post]: [...current, candidateId] };
      }
      return prev;
    });
  };

  const handleCastBallot = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = castSecretBallot(posts, {
      voterMemberNo,
      voterToken,
      selectedCandidateIds: selectedChoices,
      submittedAt: new Date().toISOString(),
    });

    setPosts(updated);
    setVoteSubmittedSuccess(true);
    setTimeout(() => {
      setVoteSubmittedSuccess(false);
      setActiveTab('tally');
    }, 1200);
  };

  const certText = selectedWinner ? generateElectionCertificate(selectedWinner) : '';
  const oathText = selectedWinner ? generateOathOfOffice(selectedWinner) : '';

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Ribbon */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-2xl">
              <Vote className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  {t(
                    'वार्षिक साधारण सभा (AGM) विद्युतीय मतदान तथा निर्वाचन पोर्टल',
                    'AGM Digital Voting & Election Commission Portal'
                  )}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300">
                  सहकारी ऐन २०७४ दफा ४१
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300">
                  ३३% महिला आरक्षण अनिवार्य
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {t(
                  'सञ्चालक समिति तथा लेखा सुपरिवेक्षण समिति प्रत्यक्ष मतदान, ५१% गणपूरक संख्या प्रमाणीकरण र विजयी घोषणा',
                  'Board of Directors & Supervisory Committee direct secret ballot, real-time vote tallying, and oath certification'
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              <FileSpreadsheet className="size-4 text-emerald-600" />
              <span>{t('CSV नतिजा', 'Export CSV')}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Election Governance Metrics Ribbon */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 p-4 bg-slate-100/50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 text-xs">
          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <span className="text-[10px] text-slate-400 font-semibold block">{t('कुल मतदाता संख्या', 'Eligible Voters')}</span>
            <span className="text-base font-black text-slate-900 dark:text-white">{results.totalEligibleVoters}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">{t('सेयरधनी सदस्य', 'Shareholders')}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <span className="text-[10px] text-blue-500 font-semibold block">{t('खसेको कुल मत', 'Votes Cast')}</span>
            <span className="text-base font-black text-blue-600 dark:text-blue-400">{results.totalVotesCast}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">{results.voterTurnoutPercent}% {t('उपस्थिति दर', 'Turnout')}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <span className="text-[10px] text-emerald-500 font-semibold block">{t('गणपूरक संख्या', 'Statutory Quorum')}</span>
            <span className={`text-base font-black ${results.isQuorumMet ? 'text-emerald-600' : 'text-rose-600'}`}>
              {results.isQuorumMet ? '५१% पुगेको (MET)' : 'अपुग'}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">{t('दफा ३९ अनुपालन', 'Sec 39 Compliant')}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <span className="text-[10px] text-purple-500 font-semibold block">{t('सञ्चालक समिति सिट', 'Board Director Seats')}</span>
            <span className="text-base font-black text-purple-600 dark:text-purple-400">
              {results.totalBoardSeats} {t('पद', 'Seats')}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">{t('४ वर्षे कार्यकाल', '4-Yr Tenure')}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <span className="text-[10px] text-rose-500 font-semibold block">{t('महिला प्रतिनिधित्व', 'Female Representation')}</span>
            <span className="text-base font-black text-rose-600 dark:text-rose-400">
              {results.femaleRepresentationPercent}% ({results.femaleBoardSeats} सिट)
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">{results.isGenderQuotaMet ? '३३% कोटा पूर्ण' : 'अपुग'}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <span className="text-[10px] text-amber-500 font-semibold block">{t('निर्वाचन अवस्था', 'Election Status')}</span>
            <span className="text-xs font-black inline-block mt-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
              नतिजा प्रमाणित
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">{results.declarationDate}</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <button
            onClick={() => setActiveTab('tally')}
            className={`flex items-center gap-2 py-3 px-3 border-b-2 text-xs font-bold transition-colors ${
              activeTab === 'tally'
                ? 'border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <BarChart3 className="size-4" />
            <span>{t('प्रत्यक्ष मत परिणाम तथा विजेता', 'Live Vote Tally & Winners')}</span>
          </button>

          <button
            onClick={() => setActiveTab('ballot')}
            className={`flex items-center gap-2 py-3 px-3 border-b-2 text-xs font-bold transition-colors ${
              activeTab === 'ballot'
                ? 'border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Vote className="size-4" />
            <span>{t('विद्युतीय मतपत्र बुथ', 'Electronic Ballot Booth')}</span>
          </button>

          <button
            onClick={() => setActiveTab('certificates')}
            className={`flex items-center gap-2 py-3 px-3 border-b-2 text-xs font-bold transition-colors ${
              activeTab === 'certificates'
                ? 'border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Award className="size-4" />
            <span>{t('निर्वाचन प्रमाण पत्र', 'Election Certificate')}</span>
          </button>

          <button
            onClick={() => setActiveTab('oath')}
            className={`flex items-center gap-2 py-3 px-3 border-b-2 text-xs font-bold transition-colors ${
              activeTab === 'oath'
                ? 'border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Scroll className="size-4" />
            <span>{t('पद तथा गोपनीयताको शपथ', 'Oath of Office')}</span>
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-2 py-3 px-3 border-b-2 text-xs font-bold transition-colors ${
              activeTab === 'code'
                ? 'border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <BookOpen className="size-4" />
            <span>{t('कानुनी व्यवस्था तथा आचारसंहिता', 'Election Code & Directives')}</span>
          </button>
        </div>

        {/* Tab 1: Live Tally & Lead Margins */}
        {activeTab === 'tally' && (
          <div className="p-6 overflow-y-auto space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {posts.map((post) => {
                const maxVotes = Math.max(...post.candidates.map((c) => c.votesCount), 1);
                const sorted = [...post.candidates].sort((a, b) => b.votesCount - a.votesCount);

                return (
                  <div
                    key={post.post}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
                      <div>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white">
                          {post.titleNp}
                        </h3>
                        <span className="text-[10px] text-slate-400">{post.titleEn} (सिट संख्या: {post.seatsAvailable})</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        {post.isBoardPost ? 'सञ्चालक समिति' : 'लेखा सुपरिवेक्षण'}
                      </span>
                    </div>

                    <div className="space-y-3 text-xs">
                      {sorted.map((cand, idx) => {
                        const isLeading = idx < post.seatsAvailable;
                        const percent = Math.round((cand.votesCount / totalVotesCast) * 100);

                        return (
                          <div key={cand.id} className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[10px] font-bold text-slate-400">#{idx + 1}</span>
                                <span className="font-bold text-slate-900 dark:text-white">
                                  {cand.name}
                                </span>
                                <span className="text-[10px] text-slate-500">
                                  [चिन्ह: "{cand.electionSymbol}"] ({cand.memberNo})
                                </span>
                                {isLeading && (
                                  <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                                    विजयी (ELECTED)
                                  </span>
                                )}
                              </div>
                              <span className="font-mono font-bold text-slate-900 dark:text-white">
                                {cand.votesCount.toLocaleString('en-IN')} मत ({percent}%)
                              </span>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  isLeading ? 'bg-emerald-500' : 'bg-slate-400'
                                }`}
                                style={{ width: `${(cand.votesCount / maxVotes) * 100}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Electronic Ballot Booth */}
        {activeTab === 'ballot' && (
          <div className="p-6 overflow-y-auto space-y-6">
            <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <Lock className="size-5 text-purple-600" />
                <div>
                  <h4 className="font-bold text-purple-900 dark:text-purple-200">
                    गोप्य विद्युतीय मतदान बुथ (Secret Digital Ballot)
                  </h4>
                  <p className="text-[11px] text-purple-700/80 dark:text-purple-300/80">
                    सहकारी ऐन २०७४ अनुसार तपाईंको मत पूर्णतः गोप्य र अपरिवर्तनीय रहनेछ।
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">मतदाता सदस्य नं:</span>
                  <input
                    type="text"
                    value={voterMemberNo}
                    onChange={(e) => setVoterMemberNo(e.target.value)}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">गोप्य मतदान टोकन:</span>
                  <input
                    type="text"
                    value={voterToken}
                    onChange={(e) => setVoterToken(e.target.value)}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-mono text-xs"
                  />
                </div>
              </div>
            </div>

            <form onSubmit={handleCastBallot} className="space-y-6">
              {posts.map((post) => {
                const currentSelected = selectedChoices[post.post] || [];

                return (
                  <div
                    key={post.post}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3 shadow-sm"
                  >
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2.5">
                      <h4 className="font-black text-xs text-slate-900 dark:text-white">
                        {post.titleNp}
                      </h4>
                      <span className="text-[11px] font-bold text-purple-600">
                        (अधिकतम {post.seatsAvailable} जना छान्न सकिने - छनौट: {currentSelected.length})
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {post.candidates.map((cand) => {
                        const isChecked = currentSelected.includes(cand.id);

                        return (
                          <div
                            key={cand.id}
                            onClick={() => handleSelectChoice(post.post, cand.id, post.seatsAvailable)}
                            className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                              isChecked
                                ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-950/30 ring-2 ring-purple-600/20'
                                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="size-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-xs">
                                {cand.name[0]}
                              </div>
                              <div>
                                <span className="font-bold text-xs text-slate-900 dark:text-white block">
                                  {cand.name}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {cand.memberNo} • लिङ्ग: {cand.gender === 'FEMALE' ? 'महिला' : 'पुरुष'}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border border-amber-200">
                                🗳️ {cand.electionSymbol}
                              </span>
                              <div
                                className={`size-5 rounded-full border-2 flex items-center justify-center ${
                                  isChecked ? 'border-purple-600 bg-purple-600 text-white' : 'border-slate-300'
                                }`}
                              >
                                {isChecked && <Check className="size-3" />}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              <div className="flex items-center justify-end gap-3 pt-2">
                {voteSubmittedSuccess && (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 animate-bounce">
                    <CheckCircle2 className="size-4" />
                    <span>मतदान सफलतापूर्वक सुरक्षित भयो!</span>
                  </span>
                )}

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
                >
                  <Send className="size-4" />
                  <span>{t('गोप्य मत पेश गर्नुहोस्', 'Submit Secret Ballot')}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 3: Official Certificate */}
        {activeTab === 'certificates' && (
          <div className="p-6 overflow-y-auto space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  {t('आधिकारिक निर्वाचन प्रमाण पत्र', 'Official Election Certificates')}
                </h3>
                <p className="text-xs text-slate-500">
                  {t('निर्वाचित पदाधिकारीहरूलाई प्रदान गरिने वैधानिक प्रमाणपत्र', 'Statutory Certificate of Election issued by Election Commission')}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={selectedWinnerId}
                  onChange={(e) => setSelectedWinnerId(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
                >
                  {allWinners.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({POST_METADATA[w.post].nameNp.split(' ')[0]})
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => handleCopyText(certText)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-xl"
                >
                  {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                  <span>{copied ? t('कपी भयो', 'Copied') : t('कपी', 'Copy')}</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-sm"
                >
                  <Printer className="size-3.5" />
                  <span>{t('प्रिन्ट गर्नुहोस्', 'Print Certificate')}</span>
                </button>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed shadow-inner overflow-x-auto">
              {certText}
            </div>
          </div>
        )}

        {/* Tab 4: Oath of Office */}
        {activeTab === 'oath' && (
          <div className="p-6 overflow-y-auto space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  {t('पद तथा गोपनीयताको शपथ पत्र', 'Statutory Oath of Office & Secrecy')}
                </h3>
                <p className="text-xs text-slate-500">
                  {t('सहकारी ऐन २०७४ अनुसार सञ्चालक तथा लेखा समितिले लिने शपथ', 'Statutory Oath text pursuant to Section 42 of Nepal Cooperative Act 2074')}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={selectedWinnerId}
                  onChange={(e) => setSelectedWinnerId(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
                >
                  {allWinners.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({POST_METADATA[w.post].nameNp.split(' ')[0]})
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => handleCopyText(oathText)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-xl"
                >
                  {copied ? <Check className="size-3.5 text-emerald-600" /> : <Copy className="size-3.5" />}
                  <span>{copied ? t('कपी भयो', 'Copied') : t('कपी', 'Copy')}</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm"
                >
                  <Printer className="size-3.5" />
                  <span>{t('प्रिन्ट गर्नुहोस्', 'Print Oath')}</span>
                </button>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed shadow-inner overflow-x-auto">
              {oathText}
            </div>
          </div>
        )}

        {/* Tab 5: Guidelines */}
        {activeTab === 'code' && (
          <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900 space-y-2">
                <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-bold">
                  <ShieldCheck className="size-4" />
                  <span>५१% गणपूरक संख्या (Quorum)</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  सहकारी ऐन २०७४ को दफा ३९ बमोजिम पहिलो पटक बोलाइएको साधारण सभामा कुल सदस्यको कम्तीमा ५१% उपस्थिति हुनु अनिवार्य हुन्छ।
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 space-y-2">
                <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-bold">
                  <Users className="size-4" />
                  <span>३३% महिला आरक्षण अनिवार्य</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  दफा ४१(२) बमोजिम सञ्चालक समितिमा कम्तीमा ३३% महिला सदस्यको प्रतिनिधित्व हुनुपर्दछ। ७ सदस्यीय समितिमा कम्तीमा ३ महिला निर्वाचित हुनुपर्दछ।
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 space-y-2">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-bold">
                  <Award className="size-4" />
                  <span>उम्मेदवार अयोग्यता मापदण्ड</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  कर्जा भाखा नाघेको, सहकारी कालोसूचीमा परेको, वा अन्य कुनै संस्थामा सञ्चालक पदमा बहाल रहेको सदस्य उम्मेदवार बन्न अयोग्य मानिनेछ।
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
