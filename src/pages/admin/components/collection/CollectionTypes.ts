export interface MemberCollectionBreakdown {
  attendance: 'PRESENT' | 'ABSENT' | 'LATE' | 'REPRESENTATIVE';
  mandatorySavings: number;
  optionalSavings: number;
  loanPrincipal: number;
  loanInterest: number;
  fine: number;
}
