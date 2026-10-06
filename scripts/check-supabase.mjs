#!/usr/bin/env node
/**
 * Unako SACCOS — Supabase connectivity check (`npm run db:check`).
 *
 * WHY THIS EXISTS
 * ---------------
 * `package.json` referenced this script but the file did not exist, so
 * `npm run db:check` always failed. This implementation actually checks the
 * configured project and reports connectivity.
 *
 * SAFETY: the anon key is NEVER printed. Only a truncated SHA-256 fingerprint is
 * shown, which is enough to tell *which* key is configured without disclosing it.
 *
 * CONFIGURATION RESOLUTION (matches Vite for a production build)
 *   process.env  >  .env  >  .env.local  >  .env.production  >  .env.production.local
 *
 * USAGE
 *   npm run db:check                 # diagnostics; exit 0 when unconfigured
 *   node scripts/check-supabase.mjs --strict   # exit 1 when unconfigured
 *
 * EXIT CODES
 *   0 = project reachable, or not configured (without --strict)
 *   1 = configured but unreachable/unauthorized, or unconfigured with --strict
 *
 * NOTE: this script sets `process.exitCode` instead of calling `process.exit()`
 * so the process exits naturally; calling exit() while an undici socket is still
 * closing trips a libuv assertion on Windows.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const ROOT = process.cwd();
const STRICT = process.argv.includes('--strict');
const MODE = 'production';
const TIMEOUT_MS = 10000;

const readEnvFile = (file) => {
  const values = {};
  let raw;
  try {
    raw = fs.readFileSync(file, 'utf8');
  } catch {
    return values;
  }
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const name = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    values[name] = value;
  }
  return values;
};

const lookup = (name) => {
  if (process.env[name] !== undefined && process.env[name] !== '') {
    return { value: process.env[name], source: 'process env' };
  }
  const chain = ['.env', '.env.local', `.env.${MODE}`, `.env.${MODE}.local`];
  let hit;
  for (const file of chain) {
    const parsed = readEnvFile(path.join(ROOT, file));
    if (parsed[name]) hit = { value: parsed[name], source: file };
  }
  return hit;
};

const fingerprint = (secret) => crypto.createHash('sha256').update(secret).digest('hex').slice(0, 8);

const main = async () => {
  const urlHit = lookup('VITE_SUPABASE_URL');
  const keyHit = lookup('VITE_SUPABASE_ANON_KEY');

  const placeholderRe = /(your-project-ref|your-anon-public-key|example\.com|placeholder|CHANGEME)/i;
  const configuredUrl = urlHit?.value && !placeholderRe.test(urlHit.value) ? urlHit.value.replace(/\/+$/, '') : undefined;
  const configuredKey = keyHit?.value && !placeholderRe.test(keyHit.value) ? keyHit.value : undefined;

  console.log('[db:check] Unako SACCOS — Supabase connectivity check');
  console.log(
    `[db:check] VITE_SUPABASE_URL       : ${configuredUrl ?? 'not configured'}${urlHit ? ` (from ${urlHit.source})` : ''}`,
  );
  console.log(
    `[db:check] VITE_SUPABASE_ANON_KEY  : ${
      configuredKey ? `configured, sha256:${fingerprint(configuredKey)} (never printed in full)` : 'not configured'
    }${keyHit ? ` (from ${keyHit.source})` : ''}`,
  );

  if (!configuredUrl || !configuredKey) {
    console.log('[db:check] SKIPPED: Supabase is not configured (copy .env.example to .env and fill it in).');
    if (STRICT) {
      console.error('[db:check] FAIL: --strict was passed but the project is not configured.');
      return 1;
    }
    return 0;
  }

  const endpoint = `${configuredUrl}/rest/v1/`;

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: { apikey: configuredKey, Authorization: `Bearer ${configuredKey}`, Accept: 'application/json' },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const body = await response.text().catch(() => '');

    if (response.ok) {
      let detail = '';
      try {
        const parsed = JSON.parse(body);
        detail = parsed && typeof parsed === 'object' && parsed.openapi ? ' (OpenAPI/REST root served)' : '';
      } catch {
        detail = '';
      }
      console.log(`[db:check] PASS: ${endpoint} reachable, HTTP ${response.status}${detail}`);
      console.log('[db:check] Schema/RLS are NOT validated here; review supabase/schema.sql separately.');
      return 0;
    }

    console.error(`[db:check] FAIL: ${endpoint} returned HTTP ${response.status} ${response.statusText}`);
    if (response.status === 401 || response.status === 403) {
      console.error('[db:check] The anon key was rejected: check VITE_SUPABASE_ANON_KEY, or the key was rotated/paused.');
    } else if (response.status === 404) {
      console.error('[db:check] 404 usually means a wrong project URL (or the project is paused).');
    }
    return 1;
  } catch (error) {
    console.error(`[db:check] FAIL: could not reach ${endpoint}`);
    console.error(`[db:check] reason: ${error?.name === 'TimeoutError' ? `timed out after ${TIMEOUT_MS} ms` : error?.message}`);
    console.error('[db:check] If this is a sandboxed/offline environment, the network block is environmental, not a repo bug.');
    return 1;
  }
};

process.exitCode = await main();
