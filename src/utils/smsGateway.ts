/**
 * Automated SMS & WhatsApp Broadcast Alert Engine for Nepali SACCOS
 * Complies with Nepal Telecom & SparrowSMS / AakashSMS / Infobip standards
 */

import { Member, CoopSettings } from '../types';

export type SmsTemplateType =
  | 'DEPOSIT_CONFIRMATION'
  | 'WITHDRAWAL_CONFIRMATION'
  | 'LOAN_EMI_REMINDER'
  | 'DIVIDEND_CREDIT'
  | 'AGM_ANNOUNCEMENT'
  | 'CUSTOM';

export interface SmsMessagePayload {
  recipientPhone: string;
  recipientName: string;
  templateType: SmsTemplateType;
  messageText: string;
  channel: 'SMS' | 'WHATSAPP';
}

export interface SmsDispatchRecord {
  id: string; // e.g. SMS-208106-XXXX
  timestamp: string;
  recipientPhone: string;
  recipientName: string;
  templateType: SmsTemplateType;
  messageText: string;
  channel: 'SMS' | 'WHATSAPP';
  status: 'DELIVERED' | 'DISPATCHED' | 'FAILED';
  segmentCount: number;
  gatewayResponseId: string;
}

export interface SmsTemplateVariables {
  memberName: string;
  memberNo?: string;
  amount?: number;
  accountNo?: string;
  balance?: number;
  dueDate?: string;
  loanNo?: string;
  dividendRate?: number;
  agmDate?: string;
  agmVenue?: string;
  customText?: string;
}

/**
 * Calculates SMS segment count
 * Standard: 160 chars per segment for GSM-7, 70 chars per segment for Unicode (Devanagari)
 */
export function calculateSmsSegments(text: string): {
  charCount: number;
  segmentCount: number;
  isUnicode: boolean;
} {
  const isUnicode = /[^\u0000-\u007F]/.test(text);
  const charCount = text.length;

  if (charCount === 0) {
    return { charCount: 0, segmentCount: 0, isUnicode };
  }

  if (isUnicode) {
    // Unicode Devanagari SMS: 70 chars for 1 segment, 67 chars per concatenated segment
    const segmentCount = charCount <= 70 ? 1 : Math.ceil(charCount / 67);
    return { charCount, segmentCount, isUnicode: true };
  } else {
    // Standard ASCII GSM-7: 160 chars for 1 segment, 153 chars per concatenated segment
    const segmentCount = charCount <= 160 ? 1 : Math.ceil(charCount / 153);
    return { charCount, segmentCount, isUnicode: false };
  }
}

/**
 * Formats standard bilingual SACCOS broadcast messages
 */
export function formatSmsTemplate(
  templateType: SmsTemplateType,
  variables: SmsTemplateVariables,
  coopSettings: CoopSettings,
  useNepali: boolean = false
): string {
  const orgName = useNepali ? coopSettings.nameNepali : 'Unako SACCOS';
  const phone = coopSettings.phone || '082-540123';

  switch (templateType) {
    case 'DEPOSIT_CONFIRMATION':
      if (useNepali) {
        return `${orgName}: आदरणीय ${variables.memberName}, रु. ${(variables.amount || 0).toLocaleString(
          'ne-NP'
        )} खाता ${variables.accountNo || ''} मा जम्मा भएको छ। मौज्दात: रु. ${(
          variables.balance || 0
        ).toLocaleString('ne-NP')}। धन्यवाद।`;
      }
      return `${orgName}: Dear ${variables.memberName}, NPR ${(variables.amount || 0).toLocaleString()} credited to A/C ${
        variables.accountNo || ''
      }. Bal: NPR ${(variables.balance || 0).toLocaleString()}. Helpline: ${phone}.`;

    case 'WITHDRAWAL_CONFIRMATION':
      if (useNepali) {
        return `${orgName}: आदरणीय ${variables.memberName}, रु. ${(variables.amount || 0).toLocaleString(
          'ne-NP'
        )} खाता ${variables.accountNo || ''} बाट भुक्तानी भएको छ। मौज्दात: रु. ${(
          variables.balance || 0
        ).toLocaleString('ne-NP')}।`;
      }
      return `${orgName}: Dear ${variables.memberName}, NPR ${(variables.amount || 0).toLocaleString()} debited from A/C ${
        variables.accountNo || ''
      }. Remaining Bal: NPR ${(variables.balance || 0).toLocaleString()}.`;

    case 'LOAN_EMI_REMINDER':
      if (useNepali) {
        return `${orgName}: नमस्ते ${variables.memberName}, ऋण किस्ता रु. ${(variables.amount || 0).toLocaleString(
          'ne-NP'
        )} मिति ${variables.dueDate || ''} भित्र भुक्तानी गरी हर्जानाबाट बच्नुहोस्।`;
      }
      return `${orgName}: Namaste ${variables.memberName}, your loan installment of NPR ${(
        variables.amount || 0
      ).toLocaleString()} is due on ${variables.dueDate || ''}. Please settle on time. Helpline: ${phone}.`;

    case 'DIVIDEND_CREDIT':
      if (useNepali) {
        return `${orgName}: आदरणीय सेयरधनी ${variables.memberName}, ${(variables.dividendRate || 15).toLocaleString(
          'ne-NP'
        )}% सेयर लाभांश रु. ${(variables.amount || 0).toLocaleString('ne-NP')} बचत खातामा जम्मा गरिएको छ।`;
      }
      return `${orgName}: Dear Shareholder ${variables.memberName}, ${variables.dividendRate || 15}% dividend of NPR ${(
        variables.amount || 0
      ).toLocaleString()} credited to your savings account.`;

    case 'AGM_ANNOUNCEMENT':
      if (useNepali) {
        return `${orgName}: वार्षिक साधारण सभा मिति ${variables.agmDate || '२०८१ पौष १५'} मा ${
          variables.agmVenue || 'गढवा सामुदायिक भवन'
        }मा हुने भएकाले उपस्थितिको लागि हार्दिक अनुरोध गर्दछौं।`;
      }
      return `${orgName}: Annual General Meeting (AGM) will be held on ${variables.agmDate || 'Poush 15'} at ${
        variables.agmVenue || 'Gadhwa Community Hall'
      }. All members cordially invited.`;

    case 'CUSTOM':
    default:
      return variables.customText || `${orgName}: Greetings from Unako Cooperative.`;
  }
}

/**
 * Constructs direct WhatsApp API deep-link for mobile/desktop dispatch
 */
export function generateWhatsAppLink(phone: string, message: string): string {
  const cleaned = phone.replace(/[\s\-+]/g, '');
  const internationalNumber = cleaned.startsWith('977') ? cleaned : `977${cleaned}`;
  return `https://wa.me/${internationalNumber}?text=${encodeURIComponent(message)}`;
}

/**
 * Dispatches simulated SMS alert through Nepali SMS gateway gateway (SparrowSMS/AakashSMS)
 */
export function dispatchSimulatedSms(payload: SmsMessagePayload): SmsDispatchRecord {
  const { charCount, segmentCount } = calculateSmsSegments(payload.messageText);
  const randomSeq = Math.floor(100000 + Math.random() * 900000);

  const record: SmsDispatchRecord = {
    id: `SMS-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${randomSeq}`,
    timestamp: new Date().toISOString(),
    recipientPhone: payload.recipientPhone,
    recipientName: payload.recipientName,
    templateType: payload.templateType,
    messageText: payload.messageText,
    channel: payload.channel,
    status: 'DELIVERED',
    segmentCount,
    gatewayResponseId: `GW-SPARROW-${randomSeq}`,
  };

  return record;
}
