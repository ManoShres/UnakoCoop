/**
 * Transaction Description & Category Localization Utilities
 * Ensures standard CBS transaction narration renders fluently in both Nepali and English
 */

export function localizeTxDescription(description: string | undefined | null, lang: 'ne' | 'en'): string {
  if (!description) return '';
  if (lang === 'en') return description;

  const descLower = description.toLowerCase();

  if (descLower.includes('monthly recurring') || (descLower.includes('recurring') && descLower.includes('savings'))) {
    return 'महिनावारी आवधिक बचत जम्मा';
  }
  if (descLower.includes('emi payment') || descLower.includes('loan emi') || descLower.includes('principal + interest')) {
    return 'ऋण किस्ता भुक्तानी (साँवा तथा ब्याज)';
  }
  if (descLower.includes('fixed deposit') && descLower.includes('interest')) {
    return 'मुद्दती बचत मासिक ब्याज दाखिला';
  }
  if (descLower.includes('dividend') || descLower.includes('share dividend')) {
    return 'वार्षिक साधारण सभा शेयर लाभांश वितरण';
  }
  if (descLower.includes('counter cash withdrawal') || descLower.includes('emergency agrochemical')) {
    return 'काउण्टर नगद निकासी (कृषि सामाग्री खरिद)';
  }
  if (descLower.includes('cash withdrawal')) {
    return 'काउण्टर नगद भुक्तानी / निकासी';
  }
  if (descLower.includes('dairy') || descLower.includes('milk')) {
    return 'दुग्ध संकलन आम्दानी भुक्तानी';
  }
  if (descLower.includes('qr') || descLower.includes('fonepay')) {
    return 'फोनपे डायनामिक क्युआर भुक्तानी';
  }
  if (descLower.includes('transfer') || descLower.includes('p2p')) {
    return 'अन्तर-सदस्य खाता स्थानान्तरण';
  }
  if (descLower.includes('interest capitalized') || descLower.includes('quarterly interest')) {
    return 'त्रैमासिक बचत ब्याज पूँजीकरण';
  }

  return description;
}
