import { describe, it, expect } from 'vitest';
import {
  validateNationalIdFormat,
  assessKycRiskLevel,
  calculateReKycDeadline,
  verifyWithDoNidcr,
  captureBiometricScan,
  screenPepAndSanctions,
  calculateEkycMetrics,
  generateDoNidcrCertificate,
  exportEkycProfilesToCSV,
  DEFAULT_EKYC_PROFILES,
} from '../ekycNationalIdEngine';

describe('Electronic KYC & National ID (DoNIDCR) Engine', () => {
  it('validates 10-digit National ID format with or without hyphens', () => {
    expect(validateNationalIdFormat('8249102948')).toBe(true);
    expect(validateNationalIdFormat('824-910-2948')).toBe(true);
    expect(validateNationalIdFormat('824 910 2948')).toBe(true);

    expect(validateNationalIdFormat('12345')).toBe(false);
    expect(validateNationalIdFormat('abcdefghij')).toBe(false);
    expect(validateNationalIdFormat('')).toBe(false);
  });

  it('accurately assesses statutory AML risk levels', () => {
    // Normal farmer with modest income -> LOW_RISK
    expect(assessKycRiskLevel('NON_PEP', true, 'कृषि', 300000)).toBe('LOW_RISK');

    // Bullion dealer or high turnover -> MEDIUM_RISK
    expect(assessKycRiskLevel('NON_PEP', true, 'सुनचाँदी व्यवसायी', 800000)).toBe('MEDIUM_RISK');
    expect(assessKycRiskLevel('NON_PEP', true, 'खुद्रा पसल', 2000000)).toBe('MEDIUM_RISK');

    // Domestic PEP (politician, ward member) -> HIGH_RISK
    expect(assessKycRiskLevel('DOMESTIC_PEP', true, 'जनप्रतिनिधि', 1200000)).toBe('HIGH_RISK');

    // Sanction list matched -> HIGH_RISK immediately
    expect(assessKycRiskLevel('NON_PEP', false, 'कर्मचारी', 400000)).toBe('HIGH_RISK');
  });

  it('calculates periodic Re-KYC deadlines according to risk level', () => {
    expect(calculateReKycDeadline('2080-11-01', 'HIGH_RISK')).toBe('2081-11-01');
    expect(calculateReKycDeadline('2080-11-01', 'MEDIUM_RISK')).toBe('2082-11-01');
    expect(calculateReKycDeadline('2080-11-01', 'LOW_RISK')).toBe('2083-11-01');
  });

  it('verifies profile with DoNIDCR and handles invalid NID', () => {
    const profile = DEFAULT_EKYC_PROFILES[3]; // Unverified profile
    const verified = verifyWithDoNidcr(profile, 'दिनेश घिमिरे');

    expect(verified).not.toBe(profile);
    expect(verified.nidStatus).toBe('VERIFIED_DONIDCR');
    expect(verified.verifiedByOfficer).toBe('दिनेश घिमिरे');
    expect(verified.verifiedTimestamp).toBeDefined();

    // Invalid NID test
    const invalidProfile = { ...profile, nationalIdNumber: '999' };
    const rejected = verifyWithDoNidcr(invalidProfile, 'अधिकृत');
    expect(rejected.nidStatus).toBe('MISMATCH_REJECTED');
  });

  it('simulates biometric capture and handles failed liveness/match score', () => {
    const profile = DEFAULT_EKYC_PROFILES[0];

    // High match score
    const successBio = captureBiometricScan(profile, 95, 98);
    expect(successBio.biometric.fingerprintMatchScore).toBe(95);
    expect(successBio.biometric.livenessPassed).toBe(true);
    expect(successBio.nidStatus).toBe('VERIFIED_DONIDCR');

    // Poor match score (< 70)
    const failedBio = captureBiometricScan(profile, 55, 60);
    expect(failedBio.biometric.fingerprintMatchScore).toBe(55);
    expect(failedBio.biometric.livenessPassed).toBe(false);
    expect(failedBio.nidStatus).toBe('BIOMETRIC_FAILED');
  });

  it('screens PEP and sanction matches correctly', () => {
    const profile = DEFAULT_EKYC_PROFILES[0];
    const flagged = screenPepAndSanctions(profile, 'DOMESTIC_PEP', 'CIB_BLACKLIST');

    expect(flagged.pepStatus).toBe('DOMESTIC_PEP');
    expect(flagged.sanctionCheck.isClear).toBe(false);
    expect(flagged.sanctionCheck.matchedList).toBe('CIB_BLACKLIST');
    expect(flagged.riskLevel).toBe('HIGH_RISK');
  });

  it('calculates e-KYC institutional metrics', () => {
    const metrics = calculateEkycMetrics(DEFAULT_EKYC_PROFILES, '2081-01-01');

    expect(metrics.totalProfiles).toBe(4);
    expect(metrics.verifiedCount).toBe(3);
    expect(metrics.pendingCount).toBe(1);
    expect(metrics.pepIdentifiedCount).toBe(1);
    expect(metrics.highRiskCount).toBe(1);
    expect(metrics.biometricPassedCount).toBe(3);
    expect(metrics.verificationRatePercent).toBe(75); // 3 of 4 = 75%
  });

  it('generates official bilingual e-KYC Verification Certificate', () => {
    const profile = DEFAULT_EKYC_PROFILES[0];
    const cert = generateDoNidcrCertificate(profile, 'उनको साकोस');

    expect(cert).toContain('उनको साकोस');
    expect(cert).toContain('DONIDCR-VER-M-001');
    expect(cert).toContain('शान्ति चौधरी');
    expect(cert).toContain('8249102948');
    expect(cert).toContain('DoNIDCR Verified');
    expect(cert).toContain('औंठाछाप मिलान दर');
  });

  it('exports e-KYC registry to CSV', () => {
    const csv = exportEkycProfilesToCSV(DEFAULT_EKYC_PROFILES);

    expect(csv).toContain('Member No,Name,Nepali Name,NID Number,Citizenship No,District');
    expect(csv).toContain('M-001');
    expect(csv).toContain('8249102948');
    expect(csv).toContain('LOW_RISK');
  });
});
