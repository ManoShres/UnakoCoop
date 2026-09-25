/**
 * Universal Print Helper for Unako SACCOS CBS
 * Uses an isolated hidden iframe with copied stylesheets to guarantee
 * 100% clean paper/PDF printing with zero blank pages, zero background bleeding,
 * and zero interference from modal wrappers, overflow styles, or dark theme backdrops.
 */

export function printElement(elementId?: string): void {
  if (typeof window === 'undefined') return;

  if (!elementId) {
    window.print();
    return;
  }

  const targetEl = document.getElementById(elementId);
  if (!targetEl) {
    console.warn(`[printElement] Target element #${elementId} not found. Falling back to window.print()`);
    window.print();
    return;
  }

  // Create an isolated printing iframe
  const iframe = document.createElement('iframe');
  iframe.setAttribute('style', 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;opacity:0;pointer-events:none;z-index:-9999;');
  iframe.setAttribute('aria-hidden', 'true');
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    window.print();
    iframe.remove();
    return;
  }

  // Collect all stylesheets and inline style tags from current document
  const styleNodes = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'));
  const collectedStyles = styleNodes
    .map((node) => node.outerHTML)
    .join('\n');

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html lang="ne">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${document.title || 'Unako SACCOS Document'}</title>
        ${collectedStyles}
        <style>
          @page {
            size: A4 portrait;
            margin: 8mm 10mm;
          }
          html, body {
            background-color: #ffffff !important;
            background: #ffffff !important;
            color: #0f172a !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
            overflow: visible !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            box-shadow: none !important;
            text-shadow: none !important;
            backdrop-filter: none !important;
          }
          .print\\:hidden, [class*="print:hidden"], button:not(.print-include) {
            display: none !important;
          }
          [data-printable] {
            display: block !important;
            visibility: visible !important;
            background: #ffffff !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 auto !important;
            padding: 0 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            overflow: visible !important;
          }
          table {
            width: 100% !important;
            border-collapse: collapse !important;
          }
          tr, td, th {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        </style>
      </head>
      <body class="bg-white text-slate-900 p-2">
        ${targetEl.outerHTML}
      </body>
    </html>
  `);
  doc.close();

  // Allow styles and any images to paint before firing print dialog
  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (e) {
      console.error('[printElement] Iframe print failed, falling back to window.print()', e);
      window.print();
    } finally {
      // Clean up the iframe after print dialog closes
      setTimeout(() => {
        try {
          iframe.remove();
        } catch {}
      }, 2500);
    }
  }, 350);
}

