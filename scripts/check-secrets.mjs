#!/usr/bin/env node
/**
 * Unako SACCOS — repository secret scanner (build/CI gate).
 *
 * WHY THIS EXISTS
 * ---------------
 * An OpenRouter API key was compiled into a shipped client bundle
 * (`dist/assets/*.js`) because it was supplied as `VITE_OPENROUTER_API_KEY`
 * (Vite inlines every `VITE_*` variable into the bundle). Nothing in CI looked
 * at the bundle contents, so the leak shipped. This script is that control.
 *
 * WHAT IT SCANS
 * -------------
 *   - `dist/` (and `dist-*` build outputs) when present — the shipped surface.
 *   - the whole source tree: src/, supabase/, scripts/, .github/, index.html,
 *     package.json, docs, etc., except `node_modules/` and `.git/`.
 *
 * WHAT IT DELIBERATELY DOES NOT SCAN
 * ----------------------------------
 *   - Local, uncommitted env files (`.env`, `.env.local`, `.env.*.local`):
 *     they legitimately hold live keys and are gitignored. Reporting them would
 *     make local runs unusable and risks printing a live secret. Pass
 *     `--include-local-env` when you explicitly want them scanned.
 *   - Binary/large files (images, fonts, archives, > 8 MB).
 *
 * NOISY-PATTERN POLICY
 * --------------------
 * The OpenRouter rule requires >= 8 characters of key material after `sk-or-`.
 * A bare `sk-or-` string literal (e.g. `apiKey.startsWith('sk-or-')` in source)
 * is not a secret and is NOT reported; a real key is `sk-or-v1-<40+ chars>` and
 * IS reported.
 *
 * SECRET VALUES ARE NEVER PRINTED IN FULL: only a short prefix, the match
 * length, and the file/line are emitted.
 *
 * USAGE
 *   node scripts/check-secrets.mjs                  # scan tree + dist/ if present
 *   node scripts/check-secrets.mjs --require-dist    # also fail if dist/ is absent
 *   node scripts/check-secrets.mjs --include-local-env
 *   node scripts/check-secrets.mjs --verbose
 *
 * EXIT CODES: 0 = clean, 1 = finding(s) or missing --require-dist output.
 */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const ROOT = process.cwd();
const argv = process.argv.slice(2);
const REQUIRE_DIST = argv.includes('--require-dist');
const INCLUDE_LOCAL_ENV = argv.includes('--include-local-env');
const VERBOSE = argv.includes('--verbose');

const SKIP_DIRS = new Set(['.git', 'node_modules']);
const SKIP_EXT = new Set([
  '.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico', '.bmp', '.avif', '.svg',
  '.woff', '.woff2', '.ttf', '.otf', '.eot',
  '.pdf', '.zip', '.gz', '.tgz', '.7z', '.rar',
  '.mp3', '.mp4', '.mov', '.wav', '.webm',
  '.xls', '.xlsx', '.doc', '.docx', '.ppt', '.pptx',
  '.wasm', '.bin', '.exe', '.dll', '.so', '.dylib', '.class', '.jar',
]);
const MAX_BYTES = 8 * 1024 * 1024;

/** Local env files are gitignored; only scanned with --include-local-env. */
const isLocalEnvFile = (base) => /^\.env(\.|$)/.test(base) && !/\.example$/.test(base);

/** Values that look like documentation placeholders, not real secrets. */
const isPlaceholder = (value) => {
  if (!value) return true;
  if (value.length < 16) return true;
  return /^(your|my|test|demo|example|sample|placeholder|replace|changeme|dummy|xxx|todo|secret|none|null|undefined|\.\.\.|[<>{[])/i.test(value)
    || /(your[-_ ]|placeholder|changeme|redacted|<[a-z_-]+>|example\.(com|org)|xxxx|\.\.\.)/i.test(value);
};

const REGEX_RULES = [
  {
    id: 'openrouter-api-key',
    note: 'OpenRouter API key (sk-or-v1-…)',
    // >= 8 chars of key material after the prefix so that
    // `.startsWith('sk-or-')` style guards are not false positives.
    regex: /sk-or-[A-Za-z0-9_-]{8,}/g,
  },
  { id: 'openai-style-api-key', note: 'OpenAI-style API key (sk-…)', regex: /\bsk-(?!or-)[A-Za-z0-9_-]{20,}/g },
  { id: 'anthropic-api-key', note: 'Anthropic API key (sk-ant-…)', regex: /sk-ant-[A-Za-z0-9_-]{8,}/g },
  { id: 'aws-access-key-id', note: 'AWS access key id', regex: /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/g },
  { id: 'google-api-key', note: 'Google API key (AIza…)', regex: /\bAIza[0-9A-Za-z_-]{35}\b/g },
  { id: 'github-token', note: 'GitHub token', regex: /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{36}\b/g },
  { id: 'github-pat', note: 'GitHub fine-grained PAT', regex: /\bgithub_pat_[A-Za-z0-9_]{22,}\b/g },
  { id: 'slack-token', note: 'Slack token', regex: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/g },
  {
    id: 'private-key-block',
    note: 'Private key material',
    regex: /-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY-----/g,
  },
  {
    id: 'client-side-secret-assignment',
    note: 'Secret-looking value assigned to a key variable (VITE_* values are inlined into the bundle)',
    regex:
      /\b(?:VITE_[A-Z0-9_]*(?:KEY|TOKEN|SECRET|PASSWORD)|SUPABASE_SERVICE_ROLE_KEY|OPENROUTER_API_KEY|ANTHROPIC_API_KEY|OPENAI_API_KEY)\s*[:=]\s*["']?([A-Za-z0-9_\-./+]{24,})/g,
    captureGroup: 1,
  },
];

const JWT_RE = /eyJ[A-Za-z0-9_-]{8,}\.eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/g;

/** A Supabase JWT carrying role=service_role bypasses RLS: always a critical leak. */
const jwtServiceRoleFindings = (line) => {
  const found = [];
  for (const m of line.matchAll(JWT_RE)) {
    try {
      const payload = JSON.parse(Buffer.from(m[0].split('.')[1], 'base64url').toString('utf8'));
      if (payload && payload.role === 'service_role') {
        found.push({ rule: 'supabase-service-role-jwt', note: 'Supabase service_role JWT (bypasses RLS)', value: m[0] });
      }
    } catch {
      /* not a decodable JWT — ignore */
    }
  }
  return found;
};

const mask = (value) => {
  const head = value.slice(0, 7);
  return `${head}… [redacted, ${value.length} chars]`;
};

const findings = [];
let scanned = 0;
let skippedEnv = [];
let skippedBinary = 0;
let distPresent = false;

const scanFile = (file) => {
  let raw;
  try {
    raw = fs.readFileSync(file, 'utf8');
  } catch {
    return;
  }
  scanned += 1;
  const rel = path.relative(ROOT, file).split(path.sep).join('/');
  const lines = raw.split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line) continue;
    for (const rule of REGEX_RULES) {
      rule.regex.lastIndex = 0;
      for (const m of line.matchAll(rule.regex)) {
        const value = rule.captureGroup ? m[rule.captureGroup] : m[0];
        if (isPlaceholder(value)) continue;
        findings.push({ file: rel, line: i + 1, rule: rule.id, note: rule.note, value });
      }
    }
    for (const hit of jwtServiceRoleFindings(line)) {
      findings.push({ file: rel, line: i + 1, ...hit });
    }
  }
};

const walk = (dir) => {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      walk(full);
      continue;
    }
    if (!entry.isFile()) continue;
    if (isLocalEnvFile(entry.name) && !INCLUDE_LOCAL_ENV) {
      skippedEnv.push(path.relative(ROOT, full).split(path.sep).join('/'));
      continue;
    }
    if (SKIP_EXT.has(path.extname(entry.name).toLowerCase())) {
      skippedBinary += 1;
      continue;
    }
    let size = 0;
    try {
      size = fs.statSync(full).size;
    } catch {
      continue;
    }
    if (size > MAX_BYTES) {
      skippedBinary += 1;
      continue;
    }
    scanFile(full);
  }
};

// ---- run -------------------------------------------------------------------
try {
  distPresent = fs.existsSync(path.join(ROOT, 'dist'));
} catch {
  distPresent = false;
}

if (REQUIRE_DIST && !distPresent) {
  console.error('[secret-scan] FAIL: `--require-dist` was passed but dist/ does not exist.');
  console.error('[secret-scan] Run the production build first (`npm run build`).');
  process.exit(1);
}

walk(ROOT);

console.log(`[secret-scan] scanned ${scanned} text file(s) under ${ROOT}`);
console.log(`[secret-scan] dist/: ${distPresent ? 'present — included in scan' : 'absent (not built yet)'}`);
console.log(`[secret-scan] skipped ${skippedBinary} binary/oversized file(s)`);
if (skippedEnv.length > 0) {
  console.log(
    `[secret-scan] skipped ${skippedEnv.length} local env file(s) by design (${skippedEnv.join(', ')}); ` +
      'pass --include-local-env to scan them',
  );
}
if (VERBOSE) {
  console.log('[secret-scan] policy: sk-or- requires >=8 key chars (bare prefix guards are not flagged)');
}

if (findings.length === 0) {
  console.log('[secret-scan] PASS: no secret patterns detected');
  process.exit(0);
}

const seen = new Set();
console.error('');
console.error(`[secret-scan] FAIL: ${findings.length} potential secret(s) found`);
for (const f of findings) {
  const key = `${f.file}:${f.line}:${f.rule}`;
  if (seen.has(key)) continue;
  seen.add(key);
  console.error(`  - ${f.file}:${f.line}  rule=${f.rule}  match=${mask(f.value)}`);
  console.error(`      ${f.note}`);
}
console.error('');
console.error('[secret-scan] Remove the secret from the tree/bundle and ROTATE the exposed key.');
console.error('[secret-scan] Never expose server keys through VITE_* variables: Vite inlines them into the bundle.');
process.exit(1);
