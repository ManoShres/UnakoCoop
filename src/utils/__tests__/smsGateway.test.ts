import { describe, it, expect } from 'vitest';
import {
  calculateSmsSegments,
  formatSmsTemplate,
  generateWhatsAppLink,
  dispatchSimulatedSms,
  SmsMessagePayload,
} from '../smsGateway';
import { CoopSettings } from '../../types';

describe('Automated SMS & WhatsApp Gateway Engine', () => {
  const mockCoopSettings: CoopSettings = {
    name: 'Unako Saving and Credit Cooperative Ltd.',
    nameNepali: 'उनको बचत तथा ऋण सहकारी संस्था लि.',
    regNo: '234/065/066',
    panNo: '302847591',
    address: 'Gadhwa-5, Dang, Lumbini, Nepal',
    phone: '082-540123',
    email: 'info@unako.org.np',
    openingHours: '10:00 AM - 4:00 PM',
    operatingStatus: 'NORMAL',
  };

  describe('SMS Segment & Encoding Calculator', () => {
    it('handles empty text correctly', () => {
      const result = calculateSmsSegments('');
      expect(result.charCount).toBe(0);
      expect(result.segmentCount).toBe(0);
      expect(result.isUnicode).toBe(false);
    });

    it('identifies standard GSM-7 ASCII text and calculates 160-char segment limit', () => {
      const shortText = 'Your deposit of NPR 5,000 has been credited.';
      const resShort = calculateSmsSegments(shortText);
      expect(resShort.isUnicode).toBe(false);
      expect(resShort.segmentCount).toBe(1);

      // Long text > 160 chars
      const longText = 'A'.repeat(161);
      const resLong = calculateSmsSegments(longText);
      expect(resLong.isUnicode).toBe(false);
      expect(resLong.segmentCount).toBe(2); // 161 / 153 = 2 segments
    });

    it('detects Unicode Nepali Devanagari text and applies 70-char segment limits', () => {
      const nepaliText = 'उनको बचत तथा ऋण सहकारी संस्था लि.';
      const result = calculateSmsSegments(nepaliText);
      expect(result.isUnicode).toBe(true);
      expect(result.segmentCount).toBe(1);

      // Unicode text > 70 characters
      const longNepali = 'उनको बचत '.repeat(10); // ~90 chars
      const resLong = calculateSmsSegments(longNepali);
      expect(resLong.isUnicode).toBe(true);
      expect(resLong.segmentCount).toBe(2);
    });
  });

  describe('SACCOS Template Formatting', () => {
    it('formats Deposit Confirmation in English and Nepali', () => {
      const en = formatSmsTemplate(
        'DEPOSIT_CONFIRMATION',
        { memberName: 'Ram Chaudhary', amount: 15000, accountNo: 'SB-001', balance: 45000 },
        mockCoopSettings,
        false
      );
      expect(en).toContain('Dear Ram Chaudhary');
      expect(en).toContain('15,000');
      expect(en).toContain('SB-001');

      const np = formatSmsTemplate(
        'DEPOSIT_CONFIRMATION',
        { memberName: 'राम चौधरी', amount: 15000, accountNo: 'SB-001', balance: 45000 },
        mockCoopSettings,
        true
      );
      expect(np).toContain('उनको बचत तथा ऋण सहकारी संस्था लि.');
      expect(np).toContain('आदरणीय राम चौधरी');
      expect(np).toContain('जम्मा भएको छ');
    });

    it('formats Withdrawal Confirmation', () => {
      const en = formatSmsTemplate(
        'WITHDRAWAL_CONFIRMATION',
        { memberName: 'Sita Sharma', amount: 5000, accountNo: 'SB-002', balance: 20000 },
        mockCoopSettings,
        false
      );
      expect(en).toContain('debited from A/C SB-002');

      const np = formatSmsTemplate(
        'WITHDRAWAL_CONFIRMATION',
        { memberName: 'सीता शर्मा', amount: 5000, accountNo: 'SB-002', balance: 20000 },
        mockCoopSettings,
        true
      );
      expect(np).toContain('भुक्तानी भएको छ');
    });

    it('formats Loan EMI Reminder with due date', () => {
      const en = formatSmsTemplate(
        'LOAN_EMI_REMINDER',
        { memberName: 'Hari Thapa', amount: 12500, dueDate: '2081-07-15' },
        mockCoopSettings,
        false
      );
      expect(en).toContain('due on 2081-07-15');

      const np = formatSmsTemplate(
        'LOAN_EMI_REMINDER',
        { memberName: 'हरि थापा', amount: 12500, dueDate: '२०८१-०७-१५' },
        mockCoopSettings,
        true
      );
      expect(np).toContain('ऋण किस्ता');
      expect(np).toContain('हर्जानाबाट बच्नुहोस्');
    });

    it('formats Dividend Credit notification', () => {
      const en = formatSmsTemplate(
        'DIVIDEND_CREDIT',
        { memberName: 'Gita Dangi', amount: 3750, dividendRate: 15 },
        mockCoopSettings,
        false
      );
      expect(en).toContain('15% dividend of NPR 3,750');

      const np = formatSmsTemplate(
        'DIVIDEND_CREDIT',
        { memberName: 'गीता डाँगी', amount: 3750, dividendRate: 15 },
        mockCoopSettings,
        true
      );
      expect(np).toContain('१५% सेयर लाभांश');
    });

    it('formats Annual General Meeting (AGM) Announcement', () => {
      const np = formatSmsTemplate(
        'AGM_ANNOUNCEMENT',
        { memberName: 'सदस्य', agmDate: '२०८१ पौष १५', agmVenue: 'गढवा सामुदायिक भवन' },
        mockCoopSettings,
        true
      );
      expect(np).toContain('वार्षिक साधारण सभा');
      expect(np).toContain('गढवा सामुदायिक भवन');
    });

    it('supports custom message broadcast', () => {
      const custom = formatSmsTemplate(
        'CUSTOM',
        { memberName: 'All', customText: 'Emergency office closure notice for tomorrow due to heavy rain.' },
        mockCoopSettings,
        false
      );
      expect(custom).toBe('Emergency office closure notice for tomorrow due to heavy rain.');
    });
  });

  describe('WhatsApp Link Generator', () => {
    it('formats standard 10-digit mobile phone into Nepal country code (977)', () => {
      const link = generateWhatsAppLink('9847123456', 'Hello member');
      expect(link).toBe('https://wa.me/9779847123456?text=Hello%20member');
    });

    it('preserves existing 977 prefix and handles spaces or dashes in phone number', () => {
      const link = generateWhatsAppLink('+977-9847-123456', 'नमस्ते सदस्य');
      expect(link).toContain('https://wa.me/9779847123456');
      expect(link).toContain('text=%E0%A4%A8%E0%A4%AE%E0%A4%B8%E0%A5%8D%E0%A4%A4%E0%A5%87%20%E0%A4%B8%E0%A4%A6%E0%A4%B8%E0%A5%8D%E0%A4%AF');
    });
  });

  describe('Simulated SMS Gateway Dispatch', () => {
    it('creates an audited dispatch record with status DELIVERED and segment count', () => {
      const payload: SmsMessagePayload = {
        recipientPhone: '9847123456',
        recipientName: 'Radha Chaudhary',
        templateType: 'DEPOSIT_CONFIRMATION',
        messageText: 'Your deposit of NPR 10,000 has been credited.',
        channel: 'SMS',
      };

      const record = dispatchSimulatedSms(payload);

      expect(record.id).toMatch(/^SMS-\d{8}-\d{6}$/);
      expect(record.status).toBe('DELIVERED');
      expect(record.recipientPhone).toBe('9847123456');
      expect(record.segmentCount).toBe(1);
      expect(record.gatewayResponseId).toMatch(/^GW-SPARROW-\d{6}$/);
      expect(record.timestamp).toBeDefined();
    });
  });
});
