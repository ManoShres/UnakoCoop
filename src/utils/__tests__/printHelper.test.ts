import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getPrintStyles,
  printElement,
  printRawHtml,
  escapeHtml,
  sanitizePrintableHtml,
  PrintOptions,
} from '../printHelper';

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

describe('printHelper XSS hardening (C16)', () => {
  it('escapeHtml neutralises markup and attribute-breaking characters', () => {
    expect(escapeHtml('<script>alert(1)</script>')).toBe(
      '&lt;script&gt;alert(1)&lt;/script&gt;'
    );
    expect(escapeHtml('" onload="evil()')).toContain('&quot;');
    expect(escapeHtml("' onerror='x")).toContain('&#39;');
    expect(escapeHtml('a & b')).toBe('a &amp; b');
  });

  it('sanitizePrintableHtml strips script tags, inline handlers and script URLs', () => {
    const dirty = [
      '<div onclick="steal()">Hello</div>',
      '<script>fetch("//evil")</script>',
      '<iframe src="https://evil.test"></iframe>',
      '<img src="x" onerror="alert(1)" />',
      '<a href="javascript:alert(1)">click</a>',
    ].join('');

    const clean = sanitizePrintableHtml(dirty);

    expect(clean).not.toMatch(/<script/i);
    expect(clean).not.toMatch(/<iframe/i);
    expect(clean).not.toMatch(/onclick/i);
    expect(clean).not.toMatch(/onerror/i);
    expect(clean).not.toMatch(/javascript:/i);
    // Legitimate markup survives.
    expect(clean).toContain('<div>Hello</div>');
  });

  it('preserves ordinary print markup (tables, classes)', () => {
    const html = '<table class="receipt"><tr><td>NPR 1,250</td></tr></table>';
    expect(sanitizePrintableHtml(html)).toBe(html);
  });

  describe('document.write integration', () => {
    const written: string[] = [];
    let targetOuterHtml = '<div>ok</div>';

    beforeEach(() => {
      written.length = 0;
      targetOuterHtml = '<div>ok</div>';
      const fakeDoc = {
        open() {},
        write(html: string) {
          written.push(html);
        },
        close() {},
      };
      const fakeIframe = {
        setAttribute() {},
        remove() {},
        contentWindow: {
          document: fakeDoc,
          focus() {},
          print() {},
        },
      };
      vi.stubGlobal('window', { print() {} });
      vi.stubGlobal('document', {
        title: 'Unako',
        createElement: () => fakeIframe,
        body: { appendChild() {} },
        querySelectorAll: () => [],
        getElementById: () => ({ outerHTML: targetOuterHtml }),
      });
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('printRawHtml escapes an attacker-controlled title and sanitises the payload', () => {
      printRawHtml('<img src=x onerror="alert(1)"><script>alert(2)</script>', {
        title: '</title><script>alert(3)</script>',
      });

      expect(written).toHaveLength(1);
      const out = written[0];
      expect(out).not.toMatch(/<script>/i);
      expect(out).not.toMatch(/onerror/i);
      expect(out).toContain('&lt;/title&gt;&lt;script&gt;alert(3)&lt;/script&gt;');
    });

    it('printElement escapes its title and sanitises the captured element HTML', () => {
      targetOuterHtml = '<div onclick="steal()"><script>bad()</script><b>ok</b></div>';

      printElement('receipt-target', { title: '" onload="evil()' } as PrintOptions);

      expect(written).toHaveLength(1);
      const out = written[0];
      expect(out).not.toMatch(/onclick/i);
      expect(out).not.toMatch(/<script>bad/i);
      expect(out).toContain('<b>ok</b>');
      expect(out).toContain('&quot; onload=&quot;evil()');
    });
  });
});
