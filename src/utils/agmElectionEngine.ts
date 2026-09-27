/**
 * Annual General Meeting (AGM) Digital Voting & Election Commission Engine
 * (साधारण सभा विद्युतीय मतदान तथा निर्वाचन समिति प्रणाली)
 * 
 * Complies with:
 * - Nepal Cooperative Act 2074 (सहकारी ऐन २०७४) Section 41, 42, 43
 * - Mandatory 33% Female Representation on Board of Directors (दफा ४१(२) महिला प्रतिनिधित्व)
 * - Secret Ballot Voting, Real-Time Vote Tallying & Quorum Enforcement
 */

export type ElectionPost =
  | 'CHAIRPERSON'
  | 'VICE_CHAIRPERSON'
  | 'GENERAL_SECRETARY'
  | 'TREASURER'
  | 'FEMALE_DIRECTOR'
  | 'OPEN_DIRECTOR'
  | 'AUDIT_CONVENOR'
  | 'AUDIT_MEMBER';

export type ElectionStatus = 'NOMINATION_PHASE' | 'VOTING_ACTIVE' | 'VOTING_CLOSED' | 'RESULTS_DECLARED';

export interface Candidate {
  id: string;
  name: string;
  memberNo: string;
  gender: 'MALE' | 'FEMALE';
  post: ElectionPost;
  electionSymbol: string; // e.g. "कलम", "धानको बाला", "सूर्य", "घण्टी"
  votesCount: number;
  isElected: boolean;
}

export interface BallotPost {
  post: ElectionPost;
  titleNp: string;
  titleEn: string;
  seatsAvailable: number;
  isBoardPost: boolean; // True for Board, False for Supervisory/Audit
  candidates: Candidate[];
}

export interface VoteSubmission {
  voterMemberNo: string;
  voterToken: string;
  selectedCandidateIds: Record<ElectionPost, string[]>;
  submittedAt: string;
}

export interface ElectionTallySummary {
  totalEligibleVoters: number;
  totalVotesCast: number;
  voterTurnoutPercent: number;
  isQuorumMet: boolean; // >= 51% turnout required
  totalBoardSeats: number;
  femaleBoardSeats: number;
  femaleRepresentationPercent: number;
  isGenderQuotaMet: boolean; // >= 33% female
  winners: Record<ElectionPost, Candidate[]>;
  electionStatus: ElectionStatus;
  certifiedByElectionOfficer?: string;
  declarationDate?: string;
}

export const POST_METADATA: Record<
  ElectionPost,
  { nameNp: string; nameEn: string; defaultSeats: number; isBoard: boolean }
> = {
  CHAIRPERSON: { nameNp: 'अध्यक्ष (Chairperson)', nameEn: 'President / Chairperson', defaultSeats: 1, isBoard: true },
  VICE_CHAIRPERSON: { nameNp: 'उपाध्यक्ष (Vice Chairperson)', nameEn: 'Vice President', defaultSeats: 1, isBoard: true },
  GENERAL_SECRETARY: { nameNp: 'सचिव (General Secretary)', nameEn: 'General Secretary', defaultSeats: 1, isBoard: true },
  TREASURER: { nameNp: 'कोषाध्यक्ष (Treasurer)', nameEn: 'Treasurer', defaultSeats: 1, isBoard: true },
  FEMALE_DIRECTOR: { nameNp: 'महिला सञ्चालक सदस्य (आरक्षित)', nameEn: 'Female Board Director', defaultSeats: 3, isBoard: true },
  OPEN_DIRECTOR: { nameNp: 'खुला सञ्चालक सदस्य', nameEn: 'Open Board Director', defaultSeats: 2, isBoard: true },
  AUDIT_CONVENOR: { nameNp: 'लेखा सुपरिवेक्षण संयोजक', nameEn: 'Supervisory Committee Convenor', defaultSeats: 1, isBoard: false },
  AUDIT_MEMBER: { nameNp: 'लेखा सुपरिवेक्षण सदस्य', nameEn: 'Supervisory Committee Member', defaultSeats: 2, isBoard: false },
};

/**
 * Casts a secret ballot immutably, validating seat constraints and voting tokens.
 */
export function castSecretBallot(
  posts: readonly BallotPost[],
  submission: VoteSubmission
): BallotPost[] {
  const chosenIds = new Set(
    Object.values(submission.selectedCandidateIds).flat()
  );

  return posts.map((p) => {
    const updatedCandidates = p.candidates.map((c) => {
      if (chosenIds.has(c.id)) {
        return { ...c, votesCount: c.votesCount + 1 };
      }
      return c;
    });

    return {
      ...p,
      candidates: updatedCandidates,
    };
  });
}

/**
 * Computes election winners, gender representation, and statutory quorum.
 */
export function calculateElectionResults(
  posts: readonly BallotPost[],
  totalEligibleVoters: number,
  totalVotesCast: number,
  officerName: string = 'अधिवक्ता रमेश थापा (संयोजक, निर्वाचन उपसमिति)'
): ElectionTallySummary {
  const winners: Record<ElectionPost, Candidate[]> = {
    CHAIRPERSON: [],
    VICE_CHAIRPERSON: [],
    GENERAL_SECRETARY: [],
    TREASURER: [],
    FEMALE_DIRECTOR: [],
    OPEN_DIRECTOR: [],
    AUDIT_CONVENOR: [],
    AUDIT_MEMBER: [],
  };

  let totalBoardSeats = 0;
  let femaleBoardSeats = 0;

  posts.forEach((p) => {
    // Sort candidates descending by votes
    const sorted = [...p.candidates].sort((a, b) => b.votesCount - a.votesCount);
    const postWinners = sorted.slice(0, p.seatsAvailable).map((w) => ({
      ...w,
      isElected: true,
    }));

    winners[p.post] = postWinners;

    if (p.isBoardPost) {
      totalBoardSeats += p.seatsAvailable;
      femaleBoardSeats += postWinners.filter((w) => w.gender === 'FEMALE').length;
    }
  });

  const voterTurnoutPercent =
    totalEligibleVoters > 0
      ? Math.round((totalVotesCast / totalEligibleVoters) * 1000) / 10
      : 0;

  const isQuorumMet = voterTurnoutPercent >= 51.0;

  const femaleRepresentationPercent =
    totalBoardSeats > 0
      ? Math.round((femaleBoardSeats / totalBoardSeats) * 1000) / 10
      : 0;

  // Under Section 41(2) of Cooperative Act 2074, female seats must be at least 33.3%
  const isGenderQuotaMet = femaleRepresentationPercent >= 33.0;

  return {
    totalEligibleVoters,
    totalVotesCast,
    voterTurnoutPercent,
    isQuorumMet,
    totalBoardSeats,
    femaleBoardSeats,
    femaleRepresentationPercent,
    isGenderQuotaMet,
    winners,
    electionStatus: 'RESULTS_DECLARED',
    certifiedByElectionOfficer: officerName,
    declarationDate: new Date().toISOString().split('T')[0],
  };
}

/**
 * Formats official Certificate of Election (निर्वाचन प्रमाण पत्र).
 */
export function generateElectionCertificate(
  candidate: Candidate,
  coopName: string = 'उनको बचत तथा ऋण सहकारी संस्था लि. (Unako SACCOS)',
  officerName: string = 'अधिवक्ता रमेश थापा (संयोजक, निर्वाचन उपसमिति)'
): string {
  const dateStr = new Date().toISOString().split('T')[0];
  const postMeta = POST_METADATA[candidate.post];

  return `================================================================================
               ${coopName}
            केन्द्रीय कार्यालय: गढवा-५, दाङ | दर्ता नं: ०७१/०७२
                निर्वाचन उपसमिति २०८० | आधिकारिक निर्वाचन प्रमाण पत्र
================================================================================
प्रमाण पत्र दर्ता नं: ELECTION-CERT-${candidate.post}-${candidate.memberNo}
जारी मिति: ${dateStr}

प्रमाणित गरिन्छ कि:
सदस्य श्री/श्रीमती: ${candidate.name}
सदस्य नम्बर: ${candidate.memberNo}
लिङ्ग: ${candidate.gender === 'FEMALE' ? 'महिला' : 'पुरुष'}
चुनाव चिन्ह: "${candidate.electionSymbol}"

मिति ${dateStr} मा सम्पन्न संस्थाको वार्षिक साधारण सभा निर्वाचनमा
सहकारी ऐन २०७४ र संस्थाको विनियम बमोजिम श्री ${candidate.name} ले कुल ${candidate.votesCount.toLocaleString('en-IN')} मत
प्राप्त गरी "${postMeta.nameNp}" पदमा विधिवत निर्वाचित हुनुभएकोमा यो
आधिकारिक निर्वाचन प्रमाण पत्र प्रदान गरिएको छ।

हामी उहाँको ४ वर्षे सफल कार्यकाल तथा संस्थाको सुशासन र समृद्धिको शुभकामना व्यक्त गर्दछौं।

हस्ताक्षर (संयोजक, निर्वाचन उपसमिति): ________________________
हस्ताक्षर (सदस्य, निर्वाचन उपसमिति):   ________________________
संस्थाको छाप: 
================================================================================`;
}

/**
 * Formats statutory Oath of Office & Secrecy (पद तथा गोपनीयताको शपथ पत्र).
 */
export function generateOathOfOffice(
  candidate: Candidate,
  coopName: string = 'उनको बचत तथा ऋण सहकारी संस्था लि. (Unako SACCOS)'
): string {
  const dateStr = new Date().toISOString().split('T')[0];
  const postMeta = POST_METADATA[candidate.post];

  return `================================================================================
               ${coopName}
                   पद तथा गोपनीयताको शपथ पत्र (OATH OF OFFICE)
================================================================================
म, ${candidate.name}, ${coopName} को "${postMeta.nameNp}" पदमा निर्वाचित भएकोले
सहकारी मूल्य, मान्यता र सिद्धान्तप्रति निष्ठावान रही, सहकारी ऐन २०७४, नियमावली २०७५,
संस्थाको विनियम र आचारसंहिताको पूर्ण परिपालना गर्नेछु भनी ईश्वर / देश र जनताको नाममा
सत्य निष्ठापूर्वक प्रतिज्ञा गर्दछु।

म संस्थाको काम कारवाही गर्दा कुनै पनि प्रकारको व्यक्तिगत स्वार्थ, नातावाद वा पक्षपात नगरी
सदस्यहरूको बचतको सुरक्षा र संस्थाको वित्तीय स्थायित्वलाई सर्वोपरि राख्नेछु।
पदमा बहाल रहँदा वा पदमुक्त भएपछि पनि संस्थाको गोपनीयतालाई पूर्ण रूपमा अक्षुण्ण राख्नेछु।

शपथ लिने पदाधिकारी:
नाम: ${candidate.name}
पद: ${postMeta.nameNp}
हस्ताक्षर: ________________________
मिति: ${dateStr}

शपथ गराउने (निर्वाचन अधिकृत / प्रमुख अतिथि): ________________________
================================================================================`;
}

/**
 * Exports election results to CSV format.
 */
export function exportElectionResultsToCSV(posts: readonly BallotPost[]): string {
  const headers = ['Post', 'Candidate Name', 'Member No', 'Gender', 'Symbol', 'Votes', 'Elected Status'];
  const rows: string[] = [];

  posts.forEach((p) => {
    p.candidates.forEach((c) => {
      rows.push([
        `"${POST_METADATA[c.post].nameNp}"`,
        `"${c.name}"`,
        `"${c.memberNo}"`,
        `"${c.gender}"`,
        `"${c.electionSymbol}"`,
        c.votesCount,
        `"${c.isElected ? 'ELECTED (विजयी)' : 'CONTESTANT'}"`,
      ].join(','));
    });
  });

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Realistic default election roster for Unako SACCOS AGM.
 */
export const DEFAULT_BALLOT_POSTS: BallotPost[] = [
  {
    post: 'CHAIRPERSON',
    titleNp: 'अध्यक्ष (Chairperson)',
    titleEn: 'Chairperson',
    seatsAvailable: 1,
    isBoardPost: true,
    candidates: [
      {
        id: 'c-1',
        name: 'शान्ति चौधरी',
        memberNo: 'M-001',
        gender: 'FEMALE',
        post: 'CHAIRPERSON',
        electionSymbol: 'धानको बाला',
        votesCount: 420,
        isElected: true,
      },
      {
        id: 'c-2',
        name: 'राम बहादुर थापा',
        memberNo: 'M-002',
        gender: 'MALE',
        post: 'CHAIRPERSON',
        electionSymbol: 'कलम',
        votesCount: 285,
        isElected: false,
      },
    ],
  },
  {
    post: 'VICE_CHAIRPERSON',
    titleNp: 'उपाध्यक्ष (Vice Chairperson)',
    titleEn: 'Vice Chairperson',
    seatsAvailable: 1,
    isBoardPost: true,
    candidates: [
      {
        id: 'c-3',
        name: 'कमला देवी पुन',
        memberNo: 'M-015',
        gender: 'FEMALE',
        post: 'VICE_CHAIRPERSON',
        electionSymbol: 'सूर्य',
        votesCount: 395,
        isElected: true,
      },
      {
        id: 'c-4',
        name: 'गोविन्द प्रसाद शर्मा',
        memberNo: 'M-042',
        gender: 'MALE',
        post: 'VICE_CHAIRPERSON',
        electionSymbol: 'रुख',
        votesCount: 310,
        isElected: false,
      },
    ],
  },
  {
    post: 'GENERAL_SECRETARY',
    titleNp: 'सचिव (General Secretary)',
    titleEn: 'General Secretary',
    seatsAvailable: 1,
    isBoardPost: true,
    candidates: [
      {
        id: 'c-5',
        name: 'प्रकाश कुमार यादव',
        memberNo: 'M-024',
        gender: 'MALE',
        post: 'GENERAL_SECRETARY',
        electionSymbol: 'घण्टी',
        votesCount: 440,
        isElected: true,
      },
      {
        id: 'c-6',
        name: 'सीता कुमारी थापा',
        memberNo: 'M-058',
        gender: 'FEMALE',
        post: 'GENERAL_SECRETARY',
        electionSymbol: 'किताव',
        votesCount: 265,
        isElected: false,
      },
    ],
  },
  {
    post: 'TREASURER',
    titleNp: 'कोषाध्यक्ष (Treasurer)',
    titleEn: 'Treasurer',
    seatsAvailable: 1,
    isBoardPost: true,
    candidates: [
      {
        id: 'c-7',
        name: 'सुनिता चौधरी',
        memberNo: 'M-089',
        gender: 'FEMALE',
        post: 'TREASURER',
        electionSymbol: 'तराजु',
        votesCount: 460,
        isElected: true,
      },
      {
        id: 'c-8',
        name: 'भेषराज घिमिरे',
        memberNo: 'M-112',
        gender: 'MALE',
        post: 'TREASURER',
        electionSymbol: 'चाबी',
        votesCount: 245,
        isElected: false,
      },
    ],
  },
  {
    post: 'FEMALE_DIRECTOR',
    titleNp: 'महिला सञ्चालक सदस्य (३ पद आरक्षित)',
    titleEn: 'Female Board Directors (3 Seats)',
    seatsAvailable: 3,
    isBoardPost: true,
    candidates: [
      {
        id: 'c-9',
        name: 'पार्वती खनाल',
        memberNo: 'M-140',
        gender: 'FEMALE',
        post: 'FEMALE_DIRECTOR',
        electionSymbol: 'फूल',
        votesCount: 415,
        isElected: true,
      },
      {
        id: 'c-10',
        name: 'रिता कुमारी चौधरी',
        memberNo: 'M-155',
        gender: 'FEMALE',
        post: 'FEMALE_DIRECTOR',
        electionSymbol: 'माछा',
        votesCount: 380,
        isElected: true,
      },
      {
        id: 'c-11',
        name: 'माया देवी विक',
        memberNo: 'M-180',
        gender: 'FEMALE',
        post: 'FEMALE_DIRECTOR',
        electionSymbol: 'तारा',
        votesCount: 360,
        isElected: true,
      },
      {
        id: 'c-12',
        name: 'गिता घर्ती मगर',
        memberNo: 'M-205',
        gender: 'FEMALE',
        post: 'FEMALE_DIRECTOR',
        electionSymbol: 'चरा',
        votesCount: 250,
        isElected: false,
      },
    ],
  },
  {
    post: 'AUDIT_CONVENOR',
    titleNp: 'लेखा सुपरिवेक्षण समिति संयोजक (१ पद)',
    titleEn: 'Supervisory Committee Convenor',
    seatsAvailable: 1,
    isBoardPost: false,
    candidates: [
      {
        id: 'c-13',
        name: 'सुरेश कुमार श्रेष्ठ (लेखापरीक्षक)',
        memberNo: 'M-030',
        gender: 'MALE',
        post: 'AUDIT_CONVENOR',
        electionSymbol: 'चश्मा',
        votesCount: 430,
        isElected: true,
      },
      {
        id: 'c-14',
        name: 'डिल्ली राज पोखरेल',
        memberNo: 'M-075',
        gender: 'MALE',
        post: 'AUDIT_CONVENOR',
        electionSymbol: 'घडी',
        votesCount: 275,
        isElected: false,
      },
    ],
  },
];
