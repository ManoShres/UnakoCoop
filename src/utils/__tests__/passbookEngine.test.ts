import { describe, it, expect } from 'vitest';
import {
  generatePassbookChecksum,
  generateBarcodePayload,
  parseAndVerifyBarcode,
  generateBarcodeSvg,
  generateQrCodeSvg,
  preparePassbookPrintBatch,
  issueNewPassbook,
  reissuePassbook,
  exportPassbookRegistryCsv,
  PassbookRecord,
} from '../passbookEngine';
import { Transaction } from '../../types';

describe('passbookEngine Suite', () => {
  const mockRecords: PassbookRecord[] = [
    {
      id: 'pb-rec-1',
      passbookNo: 'PB-UNAKO-2081-00101',
      memberId: 'mem-1',
      memberNo: 'M-00101',
      memberName: 'रामबहादुर चौधरी',
      accountNo: '004-10294-88-01',
      accountType: 'नियमित बचत (Regular Savings)',
      issueDateBS: '2081-01-15',
      issueDateAD: '2024-04-28',
      issuedBy: 'हेमन्त श्रेष्ठ (Senior Teller)',
      status: 'ACTIVE',
      lastPrintedLine: 6,
      lastPrintedPage: 1,
      lastPrintedDate: '2081-06-10',
      barcodePayload: '',
      securityChecksum: '',
      replacementFee: 0,
      notes: 'Initial issue upon membership',
    },
    {
      id: 'pb-rec-2',
      passbookNo: 'PB-UNAKO-2080-00088',
      memberId: 'mem-2',
      memberNo: 'M-00088',
      memberName: 'सीता देवी यादव',
      accountNo: '004-10294-88-02',
      accountType: 'अनिवार्य बचत (Compulsory)',
      issueDateBS: '2080-04-10',
      issueDateAD: '2023-07-26',
      issuedBy: 'सुनिता मगर (Teller)',
      status: 'LOST_STOLEN',
      lastPrintedLine: 18,
      lastPrintedPage: 1,
      barcodePayload: '',
      securityChecksum: '',
      replacementFee: 100,
      notes: 'Reported lost by member; reissued new passbook',
    },
  ];

  // Populate computed checksums
  const populatedRecords: PassbookRecord[] = mockRecords.map((r) => {
    const chk = generatePassbookChecksum(r.passbookNo, r.memberNo, r.accountNo);
    const payload = generateBarcodePayload(r.passbookNo, r.memberNo, r.accountNo);
    return {
      ...r,
      securityChecksum: chk,
      barcodePayload: payload,
    };
  });

  describe('Security Checksum & Barcode Payload', () => {
    it('generates consistent deterministic checksums', () => {
      const chk1 = generatePassbookChecksum('PB-UNAKO-2081-00101', 'M-00101', '004-10294-88-01');
      const chk2 = generatePassbookChecksum('PB-UNAKO-2081-00101', 'M-00101', '004-10294-88-01');
      expect(chk1).toBe(chk2);
      expect(chk1).toHaveLength(8);
    });

    it('creates structured barcode payload containing identifiers and CRC', () => {
      const payload = generateBarcodePayload('PB-UNAKO-2081-00101', 'M-00101', '004-10294-88-01');
      expect(payload).toContain('PB:PB-UNAKO-2081-00101');
      expect(payload).toContain('MEM:M-00101');
      expect(payload).toContain('ACC:004-10294-88-01');
      expect(payload).toContain('CRC:');
    });

    it('verifies valid active passbook and returns matched record', () => {
      const payload = populatedRecords[0].barcodePayload;
      const res = parseAndVerifyBarcode(payload, populatedRecords);
      expect(res.isValid).toBe(true);
      expect(res.isSecurityMatch).toBe(true);
      expect(res.status).toBe('ACTIVE');
      expect(res.matchedRecord?.memberName).toBe('रामबहादुर चौधरी');
    });

    it('detects lost/stolen passbook status during verification', () => {
      const payload = populatedRecords[1].barcodePayload;
      const res = parseAndVerifyBarcode(payload, populatedRecords);
      expect(res.isValid).toBe(false);
      expect(res.status).toBe('LOST_STOLEN');
      expect(res.message).toContain('हराएको/चोरी भएको');
    });

    it('detects tampered payload with altered checksum or accounts', () => {
      const tamperedPayload = 'PB:PB-UNAKO-2081-00101|MEM:M-00101|ACC:004-10294-88-01|CRC:FAKE1234';
      const res = parseAndVerifyBarcode(tamperedPayload, populatedRecords);
      expect(res.isValid).toBe(false);
      expect(res.isSecurityMatch).toBe(false);
      expect(res.message).toContain('प्रमाणीकरण असफल');
    });
  });

  describe('Barcode & QR Code Vector SVG Generators', () => {
    it('generates valid barcode SVG element with bars and label', () => {
      const svg = generateBarcodeSvg('PB-UNAKO-2081-00101', 50, true);
      expect(svg).toContain('<svg');
      expect(svg).toContain('</svg>');
      expect(svg).toContain('<rect');
      expect(svg).toContain('PB-UNAKO-2081-00101');
    });

    it('generates valid QR Code matrix SVG with 3 finder patterns', () => {
      const qrSvg = generateQrCodeSvg('https://unako.org.np/verify?pb=PB-UNAKO-2081-00101', 120);
      expect(qrSvg).toContain('<svg');
      expect(qrSvg).toContain('viewBox');
      expect(qrSvg).toContain('</svg>');
      // Should have finder boxes
      expect(qrSvg).toContain('rect');
    });
  });

  describe('Passbook Line-Printer Engine (preparePassbookPrintBatch)', () => {
    const mockTxs: Transaction[] = [
      {
        id: 'tx-1',
        memberId: 'mem-1',
        date: '2081-06-01',
        type: 'DEPOSIT',
        description: 'दुग्ध संकलन रकम दाखिला',
        amount: 15000,
        referenceNo: 'REC-101',
        status: 'COMPLETED',
      },
      {
        id: 'tx-2',
        memberId: 'mem-1',
        date: '2081-06-05',
        type: 'WITHDRAWAL',
        description: 'नगद भुक्तानी (काउन्टर)',
        amount: 5000,
        referenceNo: 'CHQ-201',
        status: 'COMPLETED',
      },
      {
        id: 'tx-3',
        memberId: 'mem-1',
        date: '2081-06-10',
        type: 'DEPOSIT',
        description: 'मासिक बचत दाखिला',
        amount: 2000,
        referenceNo: 'REC-102',
        status: 'COMPLETED',
      },
    ];

    it('prints from line 1 when starting fresh page', () => {
      const batch = preparePassbookPrintBatch(mockTxs, 1, 20, 100000);
      expect(batch.startLine).toBe(1);
      expect(batch.linesPerPage).toBe(20);
      expect(batch.lines).toHaveLength(3);
      expect(batch.lines[0].lineNo).toBe(1);
      expect(batch.lines[0].credit).toBe(15000);
      expect(batch.lines[0].balance).toBe(115000);
      expect(batch.lines[1].debit).toBe(5000);
      expect(batch.lines[1].balance).toBe(110000);
      expect(batch.lines[2].balance).toBe(112000);
      expect(batch.closingBalance).toBe(112000);
    });

    it('pads spacers when starting from mid-page line (e.g., line 5)', () => {
      const batch = preparePassbookPrintBatch(mockTxs, 5, 20, 100000);
      expect(batch.startLine).toBe(5);
      // Lines 1, 2, 3, 4 must be spacers
      expect(batch.lines[0].lineNo).toBe(1);
      expect(batch.lines[0].isSpacer).toBe(true);
      expect(batch.lines[3].lineNo).toBe(4);
      expect(batch.lines[3].isSpacer).toBe(true);
      // Line 5 is the first actual transaction
      expect(batch.lines[4].lineNo).toBe(5);
      expect(batch.lines[4].isSpacer).toBe(false);
      expect(batch.lines[4].credit).toBe(15000);
      expect(batch.lines[4].balance).toBe(115000);
    });

    it('respects linesPerPage capacity and caps overflow', () => {
      // 18 lines + 5 txs with startLine 18 should only fit lines 18, 19, 20
      const batch = preparePassbookPrintBatch(mockTxs, 19, 20, 50000);
      expect(batch.lines.length).toBeLessThanOrEqual(20);
      const nonSpacers = batch.lines.filter((l) => !l.isSpacer);
      expect(nonSpacers.length).toBe(2); // line 19 and line 20
    });
  });

  describe('Passbook Lifecycle (Issue & Reissue)', () => {
    it('issues a new passbook immutably', () => {
      const newPb = issueNewPassbook(
        populatedRecords,
        {
          memberId: 'mem-3',
          memberNo: 'M-00300',
          memberName: 'गोविन्द श्रेष्ठ',
          accountNo: '004-10294-88-03',
          accountType: 'नियमित बचत',
          issuedBy: 'हेमन्त श्रेष्ठ',
          notes: 'Fresh passbook issue',
        },
        '2081-06-15',
        '2024-09-30'
      );

      expect(newPb.records.length).toBe(populatedRecords.length + 1);
      expect(newPb.createdRecord.status).toBe('ACTIVE');
      expect(newPb.createdRecord.passbookNo).toContain('PB-UNAKO-2081-');
      expect(newPb.createdRecord.lastPrintedLine).toBe(0);
      expect(newPb.createdRecord.lastPrintedPage).toBe(1);
    });

    it('reissues a lost passbook and marks previous passbook as LOST_STOLEN with NPR 100 fee', () => {
      const activeRecord = populatedRecords[0];
      const reissued = reissuePassbook(
        populatedRecords,
        activeRecord.id,
        'LOST_STOLEN',
        'हेमन्त श्रेष्ठ',
        '2081-06-20',
        '2024-10-05',
        'Member lost passbook in market'
      );

      const oldRecord = reissued.records.find((r) => r.id === activeRecord.id);
      expect(oldRecord?.status).toBe('LOST_STOLEN');

      const freshRecord = reissued.createdRecord;
      expect(freshRecord.status).toBe('ACTIVE');
      expect(freshRecord.replacementFee).toBe(100);
      expect(freshRecord.memberNo).toBe(activeRecord.memberNo);
      expect(freshRecord.passbookNo).not.toBe(activeRecord.passbookNo);
    });
  });

  describe('CSV Export', () => {
    it('exports registry to CSV format with header', () => {
      const csv = exportPassbookRegistryCsv(populatedRecords);
      expect(csv).toContain('Passbook No,Member No,Member Name,Account No,Account Type,Status,Issue Date BS');
      expect(csv).toContain('PB-UNAKO-2081-00101');
      expect(csv).toContain('रामबहादुर चौधरी');
      expect(csv).toContain('ACTIVE');
    });
  });
});
