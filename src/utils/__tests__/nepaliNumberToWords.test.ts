import { describe, it, expect } from 'vitest';
import {
  numberToWordsNepali,
  numberToWordsEnglish,
  amountToWords,
} from '../nepaliNumberToWords';

describe('nepaliNumberToWords', () => {
  it('handles zero correctly', () => {
    expect(numberToWordsNepali(0)).toBe('अक्षरेपी शून्य रुपैयाँ मात्र');
    expect(numberToWordsEnglish(0)).toBe('Zero Rupees Only');
    expect(amountToWords(0, 'np')).toBe('अक्षरेपी शून्य रुपैयाँ मात्र');
    expect(amountToWords(0, 'en')).toBe('Zero Rupees Only');
  });

  it('converts single digit and tens values in Nepali', () => {
    expect(numberToWordsNepali(5)).toBe('अक्षरेपी पाँच रुपैयाँ मात्र');
    expect(numberToWordsNepali(25)).toBe('अक्षरेपी पच्चीस रुपैयाँ मात्र');
    expect(numberToWordsNepali(99)).toBe('अक्षरेपी नउन्नब्बे रुपैयाँ मात्र');
  });

  it('converts hundreds and thousands correctly', () => {
    expect(numberToWordsNepali(100)).toBe('अक्षरेपी एक सय रुपैयाँ मात्र');
    expect(numberToWordsNepali(550)).toBe('अक्षरेपी पाँच सय पचास रुपैयाँ मात्र');
    expect(numberToWordsNepali(1000)).toBe('अक्षरेपी एक हजार रुपैयाँ मात्र');
    expect(numberToWordsNepali(2575)).toBe('अक्षरेपी दुई हजार पाँच सय पचहत्तर रुपैयाँ मात्र');
  });

  it('converts Lakhs and Crores accurately', () => {
    expect(numberToWordsNepali(100000)).toBe('अक्षरेपी एक लाख रुपैयाँ मात्र');
    expect(numberToWordsNepali(125000)).toBe('अक्षरेपी एक लाख पच्चीस हजार रुपैयाँ मात्र');
    expect(numberToWordsNepali(15000000)).toBe('अक्षरेपी एक करोड पचास लाख रुपैयाँ मात्र');
  });

  it('converts decimal paisa amounts accurately', () => {
    expect(numberToWordsNepali(1250.50)).toBe('अक्षरेपी एक हजार दुई सय पचास रुपैयाँ पचास पैसा मात्र');
    expect(numberToWordsNepali(500.25)).toBe('अक्षरेपी पाँच सय रुपैयाँ पच्चीस पैसा मात्र');
  });

  it('converts English amounts using South Asian notation', () => {
    expect(numberToWordsEnglish(500)).toBe('Five Hundred Rupees Only');
    expect(numberToWordsEnglish(125000)).toBe('One Lakh Twenty Five Thousand Rupees Only');
    expect(numberToWordsEnglish(15000000)).toBe('One Crore Fifty Lakh Rupees Only');
    expect(numberToWordsEnglish(100.50)).toBe('One Hundred Rupees and Fifty Paisa Only');
  });

  it('handles negative and NaN edge cases safely', () => {
    expect(numberToWordsNepali(-500)).toBe('अक्षरेपी ऋण पाँच सय रुपैयाँ मात्र');
    expect(numberToWordsEnglish(-500)).toBe('Negative Five Hundred Rupees Only');
    expect(numberToWordsNepali(NaN)).toBe('शून्य रुपैयाँ मात्र');
    expect(numberToWordsEnglish(NaN)).toBe('Zero Rupees Only');
  });
});

