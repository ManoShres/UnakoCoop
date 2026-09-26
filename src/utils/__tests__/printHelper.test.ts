import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPrintStyles, printElement, PrintOptions } from '../printHelper';

describe('printHelper utilities', () => {
  it('generates standard A4 styles by default', () => {
    const css = getPrintStyles('a4');
    expect(css).toContain('size: A4 portrait');
    expect(css).toContain('margin: 8mm 10mm');
  });

  it('generates 80mm thermal receipt styles correctly', () => {
    const css = getPrintStyles('thermal-80mm');
    expect(css).toContain('size: 80mm auto');
    expect(css).toContain('max-width: 76mm');
    expect(css).toContain('font-family: monospace');
  });

  it('generates 58mm compact thermal receipt styles correctly', () => {
    const css = getPrintStyles('thermal-58mm');
    expect(css).toContain('size: 58mm auto');
    expect(css).toContain('max-width: 52mm');
  });

  it('generates passbook slip print styles correctly', () => {
    const css = getPrintStyles('passbook');
    expect(css).toContain('size: 140mm 90mm landscape');
    expect(css).toContain('margin: 3mm 4mm');
  });
});
