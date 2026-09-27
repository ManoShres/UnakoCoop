import { describe, it, expect } from 'vitest';
import {
  castSecretBallot,
  calculateElectionResults,
  generateElectionCertificate,
  generateOathOfOffice,
  exportElectionResultsToCSV,
  DEFAULT_BALLOT_POSTS,
  VoteSubmission,
} from '../agmElectionEngine';

describe('AGM Digital Voting & Election Commission Engine', () => {
  it('casts secret ballot immutably and increments candidate vote tally', () => {
    const initialVotes = DEFAULT_BALLOT_POSTS[0].candidates[0].votesCount;

    const submission: VoteSubmission = {
      voterMemberNo: 'M-999',
      voterToken: 'TOKEN-7788',
      selectedCandidateIds: {
        CHAIRPERSON: ['c-1'],
        VICE_CHAIRPERSON: ['c-3'],
        GENERAL_SECRETARY: ['c-5'],
        TREASURER: ['c-7'],
        FEMALE_DIRECTOR: ['c-9'],
        OPEN_DIRECTOR: [],
        AUDIT_CONVENOR: ['c-13'],
        AUDIT_MEMBER: [],
      },
      submittedAt: '2080-10-15T11:30:00Z',
    };

    const updatedPosts = castSecretBallot(DEFAULT_BALLOT_POSTS, submission);

    expect(updatedPosts).not.toBe(DEFAULT_BALLOT_POSTS);
    expect(updatedPosts[0].candidates[0].votesCount).toBe(initialVotes + 1);
    expect(updatedPosts[0].candidates[1].votesCount).toBe(DEFAULT_BALLOT_POSTS[0].candidates[1].votesCount);
  });

  it('determines election winners, verifies 51% quorum and 33% female board quota', () => {
    const totalEligible = 1000;
    const totalVotes = 710; // 71% turnout

    const results = calculateElectionResults(DEFAULT_BALLOT_POSTS, totalEligible, totalVotes);

    expect(results.totalEligibleVoters).toBe(1000);
    expect(results.totalVotesCast).toBe(710);
    expect(results.voterTurnoutPercent).toBe(71);
    expect(results.isQuorumMet).toBe(true);

    // Winner verification
    expect(results.winners.CHAIRPERSON[0].name).toBe('शान्ति चौधरी');
    expect(results.winners.CHAIRPERSON[0].isElected).toBe(true);
    expect(results.winners.FEMALE_DIRECTOR.length).toBe(3);

    // Female representation quota (33.3% required)
    expect(results.femaleBoardSeats).toBeGreaterThanOrEqual(3);
    expect(results.femaleRepresentationPercent).toBeGreaterThanOrEqual(33);
    expect(results.isGenderQuotaMet).toBe(true);
  });

  it('fails quorum if turnout is below 51%', () => {
    const results = calculateElectionResults(DEFAULT_BALLOT_POSTS, 1000, 450); // 45%
    expect(results.voterTurnoutPercent).toBe(45);
    expect(results.isQuorumMet).toBe(false);
  });

  it('generates official election certificate for winner', () => {
    const winner = DEFAULT_BALLOT_POSTS[0].candidates[0]; // Shanti Chaudhary
    const cert = generateElectionCertificate(winner, 'उनको साकोस');

    expect(cert).toContain('उनको साकोस');
    expect(cert).toContain('शान्ति चौधरी');
    expect(cert).toContain('M-001');
    expect(cert).toContain('धानको बाला');
    expect(cert).toContain('अध्यक्ष');
  });

  it('generates statutory oath of office and secrecy', () => {
    const winner = DEFAULT_BALLOT_POSTS[0].candidates[0];
    const oath = generateOathOfOffice(winner, 'उनको साकोस');

    expect(oath).toContain('उनको साकोस');
    expect(oath).toContain('शान्ति चौधरी');
    expect(oath).toContain('पद तथा गोपनीयताको शपथ पत्र');
    expect(oath).toContain('सहकारी ऐन २०७४');
  });

  it('exports election candidates and tally to CSV', () => {
    const csv = exportElectionResultsToCSV(DEFAULT_BALLOT_POSTS);

    expect(csv).toContain('Post,Candidate Name,Member No,Gender,Symbol,Votes,Elected Status');
    expect(csv).toContain('शान्ति चौधरी');
    expect(csv).toContain('धानको बाला');
  });
});
