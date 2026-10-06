import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Production-strict CSP lives in index.html (see the comment there). `vite dev`
 * needs a slightly different policy because @vitejs/plugin-react injects an
 * inline React Refresh preamble module, Vite talks to the browser over an HMR
 * WebSocket, and the dev server serves over http://localhost.
 *
 * This serve-only plugin swaps the policy for dev; `vite build` output keeps the
 * strict index.html policy untouched.
 */
const DEV_CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://openrouter.ai ws://localhost:* ws://127.0.0.1:* http://localhost:* http://127.0.0.1:*",
  "form-action 'self'",
  "frame-src 'self'",
].join('; ');

const devCspPlugin = (): Plugin => ({
  name: 'unako:dev-csp',
  apply: 'serve',
  transformIndexHtml(html) {
    return html.replace(
      /<meta\s+http-equiv="Content-Security-Policy"\s+content="[^"]*"\s*\/?>/i,
      `<meta http-equiv="Content-Security-Policy" content="${DEV_CSP}" />`,
    );
  },
});

export default defineConfig({
  plugins: [react(), tailwindcss(), devCspPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
