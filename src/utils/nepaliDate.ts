/**
 * Nepali Bikram Sambat (BS) & Devanagari Number Utilities
 * Specifically tailored for Nepalese SACCOS (Saving and Credit Cooperatives)
 */

const NEPALI_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];

/**
 * Convert any integer or number string to Nepali Devanagari script (०, १, २, ...)
 */
export function toNepaliDigits(input: number | string): string {
  const str = String(input);
  return str.replace(/[0-9]/g, (digit) => NEPALI_DIGITS[parseInt(digit, 10)]);
}

/**
 * Convert Nepali Devanagari digits back to Western Arabic digits (0-9)
 */
export function toWesternDigits(input: string): string {
  let result = input;
  NEPALI_DIGITS.forEach((nepaliChar, index) => {
    result = result.replaceAll(nepaliChar, String(index));
  });
  return result;
}

/**
 * Formats an amount into standard Nepalese Rupee (NPR) currency notation:
 * e.g., 184500 -> "NPR 1,84,500" or "रु १,८४,५००"
 */
export function formatNPR(amount: number, useNepaliDigits = false, prefix = 'NPR'): string {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const fixed = absAmount.toFixed(2);
  const [intPart, decPart] = fixed.split('.');

  // South Asian numbering system: first 3 digits from right, then groups of 2
  let formattedInt = '';
  if (intPart.length <= 3) {
    formattedInt = intPart;
  } else {
    const lastThree = intPart.substring(intPart.length - 3);
    const remaining = intPart.substring(0, intPart.length - 3);
    const groups = remaining.match(/\d{1,2}(?=(\d{2})*$)/g);
    formattedInt = (groups ? groups.join(',') + ',' : '') + lastThree;
  }

  const finalNumber = `${isNegative ? '-' : ''}${formattedInt}${decPart !== '00' ? '.' + decPart : ''}`;

  if (useNepaliDigits) {
    const nepaliPref = prefix === 'NPR' ? 'रु' : prefix;
    return `${nepaliPref} ${toNepaliDigits(finalNumber)}`;
  }

  return `${prefix} ${finalNumber}`;
}

export const NEPALI_MONTHS_BS = [
  { id: 1, np: 'बैशाख', en: 'Baisakh' },
  { id: 2, np: 'जेठ', en: 'Jestha' },
  { id: 3, np: 'असार', en: 'Ashad' },
  { id: 4, np: 'श्रावण', en: 'Shrawan' },
  { id: 5, np: 'भाद्र', en: 'Bhadra' },
  { id: 6, np: 'आश्विन', en: 'Ashwin' },
  { id: 7, np: 'कार्तिक', en: 'Kartik' },
  { id: 8, np: 'मंसिर', en: 'Mangsir' },
  { id: 9, np: 'पौष', en: 'Poush' },
  { id: 10, np: 'माघ', en: 'Magh' },
  { id: 11, np: 'फागुन', en: 'Falgun' },
  { id: 12, np: 'चैत्र', en: 'Chaitra' },
];

/**
 * Format a BS date string like "2081-11-14" into human-readable Nepali or English
 */
export function formatBSDate(bsDateString: string, lang: 'np' | 'en' = 'np'): string {
  if (!bsDateString || !bsDateString.includes('-')) return bsDateString;
  const [year, monthStr, day] = bsDateString.split('-');
  const monthNum = parseInt(monthStr, 10);
  const monthObj = NEPALI_MONTHS_BS.find((m) => m.id === monthNum);

  if (lang === 'np') {
    const nepMonth = monthObj ? monthObj.np : monthStr;
    return `${toNepaliDigits(year)} ${nepMonth} ${toNepaliDigits(day)}`;
  } else {
    const enMonth = monthObj ? monthObj.en : monthStr;
    return `${enMonth} ${day}, ${year} B.S.`;
  }
}

/**
 * Calculate Nepalese Cooperative Fiscal Year (आर्थिक वर्ष)
 * Fiscal year in Nepal runs from Shrawan 1 to Ashad 31 (approx mid-July to mid-July)
 */
export function getFiscalYear(bsYear = 2081, bsMonth = 11): string {
  if (bsMonth >= 4) {
    // Shrawan (4) onwards is in the current/next fiscal year
    return `${bsYear}/${String(bsYear + 1).slice(-2)}`;
  } else {
    // Baisakh (1) - Ashad (3) belongs to previous fiscal year span
    return `${bsYear - 1}/${String(bsYear).slice(-2)}`;
  }
}
