import { describe, it, expect } from 'vitest';
import {
  calculateStrokeHash,
  getStrokesBoundingBox,
  strokesToSvg,
  createBiometricSpecimen,
  StrokePath,
} from '../signatureCanvas';

describe('Biometric Signature & Thumbprint Canvas Engine', () => {
  const sampleStrokes: StrokePath[] = [
    {
      color: '#1e3a8a',
      width: 2.5,
      points: [
        { x: 50, y: 80 },
        { x: 60, y: 75 },
        { x: 80, y: 90 },
        { x: 110, y: 65 },
      ],
    },
    {
      color: '#1e3a8a',
      width: 2.5,
      points: [
        { x: 70, y: 100 },
        { x: 120, y: 100 },
      ],
    },
  ];

  describe('Stroke Hash Calculation', () => {
    it('generates a deterministic 8-character hex hash for strokes', () => {
      const hash1 = calculateStrokeHash(sampleStrokes);
      const hash2 = calculateStrokeHash(sampleStrokes);

      expect(hash1).toBe(hash2);
      expect(hash1).toMatch(/^[0-9A-F]{8}$/);
    });

    it('produces a different hash when strokes differ', () => {
      const alteredStrokes: StrokePath[] = [
        {
          color: '#1e3a8a',
          width: 2.5,
          points: [
            { x: 50, y: 80 },
            { x: 99, y: 99 },
          ],
        },
      ];

      const hash1 = calculateStrokeHash(sampleStrokes);
      const hash2 = calculateStrokeHash(alteredStrokes);
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('Bounding Box', () => {
    it('handles empty strokes gracefully', () => {
      const bbox = getStrokesBoundingBox([]);
      expect(bbox.width).toBe(0);
      expect(bbox.height).toBe(0);
    });

    it('calculates accurate bounds for drawn paths', () => {
      const bbox = getStrokesBoundingBox(sampleStrokes);
      expect(bbox.minX).toBe(50);
      expect(bbox.maxX).toBe(120);
      expect(bbox.minY).toBe(65);
      expect(bbox.maxY).toBe(100);
      expect(bbox.width).toBe(70);
      expect(bbox.height).toBe(35);
    });
  });

  describe('SVG Export', () => {
    it('renders vector path SVG elements', () => {
      const svg = strokesToSvg(sampleStrokes, 400, 200, false);
      expect(svg).toContain('<svg');
      expect(svg).toContain('viewBox="0 0 400 200"');
      expect(svg).toContain('d="M 50 80 L 60 75 L 80 90 L 110 65"');
      expect(svg).toContain('stroke="#1e3a8a"');
    });

    it('includes verification watermark when stamp is requested', () => {
      const svg = strokesToSvg(sampleStrokes, 400, 200, true, 'UNAKO SACCOS VERIFIED');
      expect(svg).toContain('UNAKO SACCOS VERIFIED');
      expect(svg).toContain('fill="#059669"');
    });
  });

  describe('Biometric Specimen Packaging', () => {
    it('creates an official specimen record with metadata and dataUrl', () => {
      const specimen = createBiometricSpecimen(
        'm-101',
        'UKO-8821',
        'SIGNATURE',
        sampleStrokes,
        400,
        200
      );

      expect(specimen.id).toMatch(/^BIO-\d{8}-\d{4}$/);
      expect(specimen.memberId).toBe('m-101');
      expect(specimen.memberNo).toBe('UKO-8821');
      expect(specimen.captureMode).toBe('SIGNATURE');
      expect(specimen.strokeCount).toBe(2);
      expect(specimen.specimenHash).toBeDefined();
      expect(specimen.isVerified).toBe(true);
      expect(specimen.dataUrl).toContain('data:image/svg+xml');
    });
  });
});
