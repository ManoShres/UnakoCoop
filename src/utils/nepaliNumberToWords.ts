/**
 * Nepali & English Number to Words Converter (अक्षरेपी रूपान्तरण)
 * Specially tailored for Nepali SACCOS core banking, deposit vouchers,
 * cheques, share certificates, and audit reports.
 *
 * Supports:
 * - South Asian numbering system: Kharab, Arab, Crore, Lakh, Hajar (Thousand), Saya (Hundred)
 * - Decimal/Paisa support (e.g. 1250.50 -> एक हजार दुई सय पचास रुपैयाँ पचास पैसा मात्र)
 * - Bilingual output: Nepali (नेपाली) and English
 * - Pure, deterministic, zero-dependency implementation
 */

export const NEPALI_DIGITS_0_TO_99: readonly string[] = [
  'शून्य', 'एक', 'दुई', 'तीन', 'चार', 'पाँच', 'छ', 'सात', 'आठ', 'नौ', 'दश',
  'एघार', 'बाह्र', 'तेह्र', 'चौध', 'पन्ध्र', 'सोह्र', 'सत्र', 'अठार', 'उन्नाइस', 'बीस',
  'एक्काइस', 'बाइस', 'तेइस', 'चौबीस', 'पच्चीस', 'छब्बीस', 'सत्ताइस', 'अट्ठाइस', 'उनन्तिस', 'तीस',
  'एकत्तिस', 'बत्तिस', 'तेत्तिस', 'चौँतिस', 'पैँतिस', 'छत्तीस', 'सैँतिस', 'अड्तीस', 'उनन्चालीस', 'चालीस',
  'एकचालीस', 'बयालीस', 'त्रिचालीस', 'चौवालीस', 'पैँतालीस', 'छयालीस', 'सतचालीस', 'अड्चालीस', 'उनन्पचास', 'पचास',
  'एकाउन्न', 'बाउन्न', 'त्रिपन्न', 'चौवन्न', 'पचपन्न', 'छपन्न', 'सन्ताउन्न', 'अन्ठाउन्न', 'उनन्साठ्ठी', 'साठ्ठी',
  'एकसट्ठी', 'बासट्ठी', 'त्रिसट्ठी', 'चौँसट्ठी', 'पैँसट्ठी', 'छैसट्ठी', 'सतसट्ठी', 'अठसट्ठी', 'उनन्सत्तरी', 'सत्तरी',
  'एकहत्तर', 'बहत्तर', 'त्रिहत्तर', 'चौहत्तर', 'पचहत्तर', 'छयहत्तर', 'सतहत्तर', 'अठहत्तर', 'उननासी', 'असी',
  'एकासी', 'बयासी', 'त्रियासी', 'चौरासी', 'पचासी', 'छयासी', 'सत्तासी', 'अठासी', 'उनन्नब्बे', 'नब्बे',
  'एकानब्बे', 'बयानब्बे', 'त्रियानब्बे', 'चौरानब्बे', 'पन्चानब्बे', 'छ्यानब्बे', 'सन्तानब्बे', 'अन्ठानब्बे', 'नउन्नब्बे'
];

export const ENGLISH_ONES: readonly string[] = [
  'Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
  'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
];

export const ENGLISH_TENS: readonly string[] = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
];

function twoDigitsToEnglish(num: number): string {
  if (num < 20) return ENGLISH_ONES[num];
  const ten = Math.floor(num / 10);
  const one = num % 10;
  return one === 0 ? ENGLISH_TENS[ten] : `${ENGLISH_TENS[ten]} ${ENGLISH_ONES[one]}`;
}

function threeDigitsToEnglish(num: number): string {
  const hundred = Math.floor(num / 100);
  const rem = num % 100;
  if (hundred > 0 && rem > 0) {
    return `${ENGLISH_ONES[hundred]} Hundred ${twoDigitsToEnglish(rem)}`;
  }
  if (hundred > 0) {
    return `${ENGLISH_ONES[hundred]} Hundred`;
  }
  return twoDigitsToEnglish(rem);
}

/**
 * Convert an integer number into Nepali words using South Asian groupings
 */
function integerToNepaliWords(num: number): string {
  if (num === 0) return NEPALI_DIGITS_0_TO_99[0];
  if (num < 0) return `ऋण ${integerToNepaliWords(Math.abs(num))}`;

  const parts: string[] = [];

  // Kharab (10^11)
  const kharab = Math.floor(num / 100000000000);
  let rem = num % 100000000000;
  if (kharab > 0) {
    parts.push(`${NEPALI_DIGITS_0_TO_99[kharab] || kharab} खर्ब`);
  }

  // Arab (10^9)
  const arab = Math.floor(rem / 1000000000);
  rem = rem % 1000000000;
  if (arab > 0) {
    parts.push(`${NEPALI_DIGITS_0_TO_99[arab] || arab} अर्ब`);
  }

  // Crore (10^7)
  const crore = Math.floor(rem / 10000000);
  rem = rem % 10000000;
  if (crore > 0) {
    parts.push(`${NEPALI_DIGITS_0_TO_99[crore] || crore} करोड`);
  }

  // Lakh (10^5)
  const lakh = Math.floor(rem / 100000);
  rem = rem % 100000;
  if (lakh > 0) {
    parts.push(`${NEPALI_DIGITS_0_TO_99[lakh] || lakh} लाख`);
  }

  // Hajar / Thousand (10^3)
  const hajar = Math.floor(rem / 1000);
  rem = rem % 1000;
  if (hajar > 0) {
    parts.push(`${NEPALI_DIGITS_0_TO_99[hajar] || hajar} हजार`);
  }

  // Saya / Hundred (10^2)
  const saya = Math.floor(rem / 100);
  rem = rem % 100;
  if (saya > 0) {
    parts.push(`${NEPALI_DIGITS_0_TO_99[saya] || saya} सय`);
  }

  // Remaining 1-99
  if (rem > 0) {
    parts.push(NEPALI_DIGITS_0_TO_99[rem]);
  }

  return parts.join(' ');
}

/**
 * Convert an integer number into English words using South Asian groupings (Crore, Lakh)
 */
function integerToEnglishWords(num: number): string {
  if (num === 0) return 'Zero';
  if (num < 0) return `Negative ${integerToEnglishWords(Math.abs(num))}`;

  const parts: string[] = [];

  // Kharab
  const kharab = Math.floor(num / 100000000000);
  let rem = num % 100000000000;
  if (kharab > 0) {
    parts.push(`${twoDigitsToEnglish(kharab)} Kharab`);
  }

  // Arab
  const arab = Math.floor(rem / 1000000000);
  rem = rem % 1000000000;
  if (arab > 0) {
    parts.push(`${twoDigitsToEnglish(arab)} Arab`);
  }

  // Crore
  const crore = Math.floor(rem / 10000000);
  rem = rem % 10000000;
  if (crore > 0) {
    parts.push(`${twoDigitsToEnglish(crore)} Crore`);
  }

  // Lakh
  const lakh = Math.floor(rem / 100000);
  rem = rem % 100000;
  if (lakh > 0) {
    parts.push(`${twoDigitsToEnglish(lakh)} Lakh`);
  }

  // Thousand
  const thousand = Math.floor(rem / 1000);
  rem = rem % 1000;
  if (thousand > 0) {
    parts.push(`${twoDigitsToEnglish(thousand)} Thousand`);
  }

  // Hundred and remaining
  if (rem > 0) {
    parts.push(threeDigitsToEnglish(rem));
  }

  return parts.join(' ');
}

/**
 * Convert currency amount into Nepali In-Words format (अक्षरेपी)
 * Example: 125000.50 -> अक्षरेपी एक लाख पच्चीस हजार रुपैयाँ पचास पैसा मात्र
 */
export function numberToWordsNepali(amount: number): string {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return 'शून्य रुपैयाँ मात्र';
  }

  const rounded = Math.round(amount * 100) / 100;
  const isNegative = rounded < 0;
  const absAmount = Math.abs(rounded);

  const rupees = Math.floor(absAmount);
  const paisa = Math.round((absAmount - rupees) * 100);

  const rupeesWords = rupees === 0 ? 'शून्य' : integerToNepaliWords(rupees);
  let result = `अक्षरेपी ${isNegative ? 'ऋण ' : ''}${rupeesWords} रुपैयाँ`;

  if (paisa > 0) {
    const paisaWords = NEPALI_DIGITS_0_TO_99[paisa] || paisa.toString();
    result += ` ${paisaWords} पैसा मात्र`;
  } else {
    result += ' मात्र';
  }

  return result;
}

/**
 * Convert currency amount into English In-Words format
 * Example: 125000.50 -> One Lakh Twenty Five Thousand Rupees and Fifty Paisa Only
 */
export function numberToWordsEnglish(amount: number): string {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return 'Zero Rupees Only';
  }

  const rounded = Math.round(amount * 100) / 100;
  const isNegative = rounded < 0;
  const absAmount = Math.abs(rounded);

  const rupees = Math.floor(absAmount);
  const paisa = Math.round((absAmount - rupees) * 100);

  const rupeesWords = rupees === 0 ? 'Zero' : integerToEnglishWords(rupees);
  let result = `${isNegative ? 'Negative ' : ''}${rupeesWords} Rupees`;

  if (paisa > 0) {
    result += ` and ${twoDigitsToEnglish(paisa)} Paisa Only`;
  } else {
    result += ' Only';
  }

  return result;
}

/**
 * Universal bilingual amount to words helper
 */
export function amountToWords(amount: number, language: 'np' | 'en' = 'np'): string {
  return language === 'np' ? numberToWordsNepali(amount) : numberToWordsEnglish(amount);
}

