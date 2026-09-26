/**
 * Nepal QR (NepalPay / Fonepay / EMVCo Merchant-Presented Mode) Generator & Parser
 *
 * Implements the National Payment Switch (NPS) NepalQR Specification
 * compliant with ISO/IEC 18004 and EMVCo Merchant-Presented QR Code specifications.
 */

export interface NepalQrParams {
  merchantName: string;
  merchantCity?: string;
  pan?: string;
  amount: number;
  accountNo: string;
  referenceNo: string;
  remarks?: string;
}

export interface ParsedNepalQr {
  currency: string;
  amount: number;
  country: string;
  merchantName: string;
  merchantCity: string;
  referenceNo: string;
  remarks: string;
  isValidCrc: boolean;
}

/**
 * Standard EMVCo CRC-16 / CCITT-FALSE calculation
 * Polynomial: 0x1021, Initial: 0xFFFF
 */
export function calculateEmvCrc16(data: string): string {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Formats a Tag-Length-Value (TLV) entry
 */
export function formatTlv(tag: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${tag}${len}${value}`;
}

/**
 * Generates an official EMVCo-compliant NepalQR payload string
 */
export function generateNepalQrPayload(params: NepalQrParams): string {
  const version = formatTlv('00', '01');
  const initiation = formatTlv('01', '12'); // 12 = Dynamic QR (specific transaction amount)

  // Tag 26: Merchant Account Information (NepalPay / Fonepay NPS rail)
  const guid = formatTlv('00', 'np.gov.nchl.nepalpay');
  const panField = formatTlv('01', params.pan || '300124890');
  const accField = formatTlv('02', params.accountNo);
  const merchantAccountInfo = formatTlv('26', `${guid}${panField}${accField}`);

  // Tag 52: Merchant Category Code (6012: Savings & Credit Cooperatives / Financial Institutions)
  const mcc = formatTlv('52', '6012');

  // Tag 53: Currency (524 = Nepalese Rupee NPR ISO-4217)
  const currency = formatTlv('53', '524');

  // Tag 54: Transaction Amount
  const amountStr = params.amount.toFixed(2);
  const amountField = formatTlv('54', amountStr);

  // Tag 58: Country Code (NP = Nepal)
  const country = formatTlv('58', 'NP');

  // Tag 59: Merchant Name
  const merchantName = formatTlv('59', params.merchantName.slice(0, 25));

  // Tag 60: Merchant City
  const merchantCity = formatTlv('60', (params.merchantCity || 'GADHWA').slice(0, 15));

  // Tag 62: Additional Data Field Template
  const billNo = formatTlv('01', params.referenceNo.slice(0, 25));
  const purpose = formatTlv('08', (params.remarks || 'Deposit').slice(0, 25));
  const additionalData = formatTlv('62', `${billNo}${purpose}`);

  // Combine everything up to Tag 63 header
  const payloadWithoutCrc = `${version}${initiation}${merchantAccountInfo}${mcc}${currency}${amountField}${country}${merchantName}${merchantCity}${additionalData}6304`;

  // Compute CRC16 and append
  const crc = calculateEmvCrc16(payloadWithoutCrc);
  return `${payloadWithoutCrc}${crc}`;
}

/**
 * Parses and verifies an EMVCo NepalQR payload string
 */
export function parseNepalQrPayload(payload: string): ParsedNepalQr {
  let currency = '';
  let amount = 0;
  let country = '';
  let merchantName = '';
  let merchantCity = '';
  let referenceNo = '';
  let remarks = '';

  let idx = 0;
  while (idx < payload.length - 4) {
    const tag = payload.slice(idx, idx + 2);
    const len = parseInt(payload.slice(idx + 2, idx + 4), 10);
    if (isNaN(len)) break;

    const val = payload.slice(idx + 4, idx + 4 + len);
    idx += 4 + len;

    if (tag === '53') currency = val;
    else if (tag === '54') amount = parseFloat(val) || 0;
    else if (tag === '58') country = val;
    else if (tag === '59') merchantName = val;
    else if (tag === '60') merchantCity = val;
    else if (tag === '62') {
      // Subtag parsing inside Tag 62
      let subIdx = 0;
      while (subIdx < val.length) {
        const subTag = val.slice(subIdx, subIdx + 2);
        const subLen = parseInt(val.slice(subIdx + 2, subIdx + 4), 10);
        if (isNaN(subLen)) break;
        const subVal = val.slice(subIdx + 4, subIdx + 4 + subLen);
        subIdx += 4 + subLen;

        if (subTag === '01') referenceNo = subVal;
        else if (subTag === '08') remarks = subVal;
      }
    }
  }

  // Verify CRC (last 4 characters)
  const dataPart = payload.slice(0, -4);
  const providedCrc = payload.slice(-4);
  const expectedCrc = calculateEmvCrc16(dataPart);
  const isValidCrc = providedCrc.toUpperCase() === expectedCrc.toUpperCase();

  return {
    currency,
    amount,
    country,
    merchantName,
    merchantCity,
    referenceNo,
    remarks,
    isValidCrc,
  };
}
