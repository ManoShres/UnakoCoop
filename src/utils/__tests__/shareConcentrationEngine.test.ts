import { describe, it, expect } from 'vitest';
import {
  calculateShareConcentration,
  validateAndProcessShareTransfer,
  generateShareTransferDeed,
  generateCeilingComplianceNotice,
  exportShareConcentrationToCSV,
} from '../shareConcentrationEngine';

describe('shareConcentrationEngine - Cooperative Act 2074 Sec 37 & 38', () => {
  const mockMembers = [
    { id: 'm-1', memberNo: 'M-101', name: 'रामबहादुर चौधरी', phone: '9857821001', shareKitta: 600, shareCapital: 60000 },
    { id: 'm-2', memberNo: 'M-102', name: 'सुनिता शर्मा', phone: '9857821002', shareKitta: 450, shareCapital: 45000 },
    { id: 'm-3', memberNo: 'M-103', name: 'गोपाल बुढाथोकी', phone: '9857821003', shareKitta: 300, shareCapital: 30000 },
    { id: 'm-4', memberNo: 'M-104', name: 'कमला विक', phone: '9857821004', shareKitta: 200, shareCapital: 20000 },
    { id: 'm-5', memberNo: 'M-105', name: 'दिनेश यादव', phone: '9857821005', shareKitta: 150, shareCapital: 15000 },
    { id: 'm-6', memberNo: 'M-106', name: 'पुष्पा श्रेष्ठ', phone: '9857821006', shareKitta: 100, shareCapital: 10000 },
    { id: 'm-7', memberNo: 'M-107', name: 'हरिकृष्ण पाण्डे', phone: '9857821007', shareKitta: 80, shareCapital: 8000 },
    { id: 'm-8', memberNo: 'M-108', name: 'माया घर्ती मगर', phone: '9857821008', shareKitta: 50, shareCapital: 5000 },
    { id: 'm-9', memberNo: 'M-109', name: 'भरत महतो', phone: '9857821009', shareKitta: 40, shareCapital: 4000 },
    { id: 'm-10', memberNo: 'M-110', name: 'पार्वती थारु', phone: '9857821010', shareKitta: 30, shareCapital: 3000 },
  ];
  // Total shares = 600 + 450 + 300 + 200 + 150 + 100 + 80 + 50 + 40 + 30 = 2000 shares @ Rs 100 = Rs 200,000

  it('accurately calculates shareholding concentration and HHI score', () => {
    const { shareholders, metrics } = calculateShareConcentration({
      members: mockMembers,
      faceValue: 100,
      internalLimitPercent: 10.0,
    });

    expect(metrics.totalIssuedShares).toBe(2000);
    expect(metrics.totalIssuedCapital).toBe(200000);
    expect(metrics.totalShareholders).toBe(10);
    expect(metrics.maxAllowedKittaPerMember).toBe(400); // 20% of 2000 = 400 kitta

    // Member 1 holds 600 kitta (30%) -> Exceeds statutory 20% limit!
    expect(shareholders[0].memberId).toBe('m-1');
    expect(shareholders[0].percentageOfTotal).toBe(30);
    expect(shareholders[0].exceedsStatutoryLimit).toBe(true);
    expect(shareholders[0].status).toBe('DIVESTMENT_ORDERED');

    // Member 2 holds 450 kitta (22.5%) -> Exceeds statutory 20% limit!
    expect(shareholders[1].memberId).toBe('m-2');
    expect(shareholders[1].percentageOfTotal).toBe(22.5);
    expect(shareholders[1].exceedsStatutoryLimit).toBe(true);

    // Member 3 holds 300 kitta (15%) -> Within 20% statutory, but exceeds 10% internal limit
    expect(shareholders[2].memberId).toBe('m-3');
    expect(shareholders[2].percentageOfTotal).toBe(15);
    expect(shareholders[2].exceedsStatutoryLimit).toBe(false);
    expect(shareholders[2].exceedsInternalLimit).toBe(true);

    expect(metrics.statutoryViolationsCount).toBe(2);
    expect(metrics.concentrationRiskLevel).toBe('HIGH');
    expect(metrics.top1ShareholderPercent).toBe(30);
  });

  it('validates share transfers and blocks transactions violating Section 37', () => {
    const totalShares = 2000;

    // 1. Invalid: Zero kitta
    const zeroRes = validateAndProcessShareTransfer(
      {
        sourceMemberId: 'm-1',
        sourceMemberName: 'रामबहादुर चौधरी',
        sourceMemberNo: 'M-101',
        sourceCurrentKitta: 600,
        targetMemberId: 'm-4',
        targetMemberName: 'कमला विक',
        targetMemberNo: 'M-104',
        targetCurrentKitta: 200,
        transferKitta: 0,
        shareFaceValue: 100,
        transferReason: 'VOLUNTARY_PARTIAL',
        boardMinuteNo: 'निर्णय नं. ५/२०८१',
        approvalDateNepali: '२०८१-०६-१५',
        transferFee: 100,
      },
      totalShares
    );
    expect(zeroRes.isValid).toBe(false);
    expect(zeroRes.error).toContain('० भन्दा बढी');

    // 2. Invalid: Exceeds source member kitta
    const exceedsSource = validateAndProcessShareTransfer(
      {
        sourceMemberId: 'm-1',
        sourceMemberName: 'रामबहादुर चौधरी',
        sourceMemberNo: 'M-101',
        sourceCurrentKitta: 600,
        targetMemberId: 'm-4',
        targetMemberName: 'कमला विक',
        targetMemberNo: 'M-104',
        targetCurrentKitta: 200,
        transferKitta: 700,
        shareFaceValue: 100,
        transferReason: 'VOLUNTARY_PARTIAL',
        boardMinuteNo: 'निर्णय नं. ५/२०८१',
        approvalDateNepali: '२०८१-०६-१५',
        transferFee: 100,
      },
      totalShares
    );
    expect(exceedsSource.isValid).toBe(false);
    expect(exceedsSource.error).toContain('जम्मा 600 कित्ता मात्र');

    // 3. Invalid: Pushes target member above 20% limit (target already has 200, receives 250 -> 450/2000 = 22.5% > 20%)
    const exceedsCeiling = validateAndProcessShareTransfer(
      {
        sourceMemberId: 'm-1',
        sourceMemberName: 'रामबहादुर चौधरी',
        sourceMemberNo: 'M-101',
        sourceCurrentKitta: 600,
        targetMemberId: 'm-4',
        targetMemberName: 'कमला विक',
        targetMemberNo: 'M-104',
        targetCurrentKitta: 200,
        transferKitta: 250,
        shareFaceValue: 100,
        transferReason: 'VOLUNTARY_PARTIAL',
        boardMinuteNo: 'निर्णय नं. ५/२०८१',
        approvalDateNepali: '२०८१-०६-१५',
        transferFee: 100,
      },
      totalShares
    );
    expect(exceedsCeiling.isValid).toBe(false);
    expect(exceedsCeiling.error).toContain('२०% भन्दा बढी लिन मिल्दैन');

    // 4. Valid: Transfer 200 kitta from m-1 to m-4 (target new kitta = 400 = exactly 20%)
    const validRes = validateAndProcessShareTransfer(
      {
        sourceMemberId: 'm-1',
        sourceMemberName: 'रामबहादुर चौधरी',
        sourceMemberNo: 'M-101',
        sourceCurrentKitta: 600,
        targetMemberId: 'm-4',
        targetMemberName: 'कमला विक',
        targetMemberNo: 'M-104',
        targetCurrentKitta: 200,
        transferKitta: 200,
        shareFaceValue: 100,
        transferReason: 'CEILING_COMPLIANCE',
        boardMinuteNo: 'निर्णय नं. ५/२०८१',
        approvalDateNepali: '२०८१-०६-१५',
        transferFee: 100,
      },
      totalShares
    );
    expect(validRes.isValid).toBe(true);
    expect(validRes.sourceNewKitta).toBe(400);
    expect(validRes.targetNewKitta).toBe(400);
    expect(validRes.targetProjectedSharePercent).toBe(20);
    expect(validRes.transferAmount).toBe(20000);
    expect(validRes.transferDeedNo).toContain('UNAKO-TRF-');
  });

  it('generates an official Share Transfer & Divestment Deed', () => {
    const params = {
      sourceMemberId: 'm-1',
      sourceMemberName: 'रामबहादुर चौधरी',
      sourceMemberNo: 'M-101',
      sourceCurrentKitta: 600,
      targetMemberId: 'm-8',
      targetMemberName: 'माया घर्ती मगर',
      targetMemberNo: 'M-108',
      targetCurrentKitta: 50,
      transferKitta: 100,
      shareFaceValue: 100,
      transferReason: 'CEILING_COMPLIANCE' as const,
      boardMinuteNo: 'निर्णय नं. १०/२०८१',
      approvalDateNepali: '२०८१-०६-२०',
      transferFee: 100,
    };

    const result = {
      isValid: true,
      transferAmount: 10000,
      sourceNewKitta: 500,
      targetNewKitta: 150,
      targetProjectedSharePercent: 7.5,
      transferDeedNo: 'UNAKO-TRF-889901',
    };

    const deed = generateShareTransferDeed(params, result);

    expect(deed).toContain('उनको बचत तथा ऋण सहकारी संस्था लिमिटेड');
    expect(deed).toContain('OFFICIAL SHARE TRANSFER & DIVESTMENT DEED');
    expect(deed).toContain('UNAKO-TRF-889901');
    expect(deed).toContain('रामबहादुर चौधरी');
    expect(deed).toContain('माया घर्ती मगर');
    expect(deed).toContain('100 कित्ता');
    expect(deed).toContain('दफा ३७ र ३८');
  });

  it('generates a statutory ceiling compliance notice for an over-concentrated member', () => {
    const { shareholders, metrics } = calculateShareConcentration({
      members: mockMembers,
      faceValue: 100,
    });

    const notice = generateCeilingComplianceNotice(shareholders[0], metrics);

    expect(notice).toContain('STATUTORY SHARE CAPITAL CEILING RECTIFICATION NOTICE');
    expect(notice).toContain('दफा ३७');
    expect(notice).toContain('रामबहादुर चौधरी');
    expect(notice).toContain('३५ (पैंतीस) दिनभित्र');
    expect(notice).toContain('अधिक भएको 200 कित्ता'); // 600 - 400 = 200 excess
  });

  it('exports share concentration and compliance ledger to valid CSV', () => {
    const { shareholders, metrics } = calculateShareConcentration({
      members: mockMembers,
      faceValue: 100,
    });

    const csv = exportShareConcentrationToCSV(shareholders, metrics);

    expect(csv).toContain('Rank (क्र.सं.)');
    expect(csv).toContain('रामबहादुर चौधरी');
    expect(csv).toContain('YES (उल्लङ्घन)');
    expect(csv).toContain('SHARE CAPITAL CONCENTRATION & REGULATORY CEILING SUMMARY');
    expect(csv).toContain('Total Issued Shares (कुल जारी कित्ता),2000');
  });
});
