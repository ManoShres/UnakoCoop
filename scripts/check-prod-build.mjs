#!/usr/bin/env node
/**
 * Unako SACCOS — production build guard for demo mode.
 *
 * WHY THIS EXISTS
 * ---------------
 * `VITE_DEMO_MODE=true` enables demo affordances (pre-filled credentials, local
 * shortcuts, seeded sample data). A production bundle was once built while demo
 * mode was on, so those affordances shipped. This guard makes that impossible:
 * the production build refuses to run while demo mode is enabled.
 *
 * WIRED INTO: `npm run build` (see package.json). CI therefore fails on a demo
 * production build too.
 *
 * RESOLUTION ORDER (matches Vite's own env handling)
 *   process.env  >  .env  >  .env.local  >  .env.<mode>  >  .env.<mode>.local
 *
 * USAGE
 *   node scripts/check-prod-build.mjs                          # production build
 *   node scripts/check-prod-build.mjs --mode=staging           # other modes
 *   node scripts/check-prod-build.mjs --allow-demo             # explicit opt-out
 *   ALLOW_DEMO_BUILD=1 node scripts/check-prod-build.mjs       # same, via env
 *
 * The `--allow-demo` escape hatch exists for intentional local demo builds
 * (`npm run build:demo`); it prints a loud warning and must never be used for a
 * deployment. Non-production modes pass through untouched.
 *
 * EXIT CODES: 0 = safe to build, 1 = demo mode blocked the production build.
 */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const ROOT = process.cwd();
const argv = process.argv.slice(2);

const allowDemo = argv.includes('--allow-demo') || process.env.ALLOW_DEMO_BUILD === '1';
const modeFlagIndex = argv.indexOf('--mode');
const modeFromArg =
  argv.find((a) => a.startsWith('--mode='))?.slice('--mode='.length) ??
  (modeFlagIndex >= 0 ? argv[modeFlagIndex + 1] : undefined);
const mode = modeFromArg || 'production';

/** Minimal KEY=VALUE parser for Vite-style env files. */
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

/** Resolve VITE_DEMO_MODE the way Vite would, and remember where it came from. */
const resolveDemoMode = () => {
  const chain = ['.env', '.env.local', `.env.${mode}`, `.env.${mode}.local`];
  let value;
  let source = 'unset';
  for (const name of chain) {
    const parsed = readEnvFile(path.join(ROOT, name));
    if (Object.prototype.hasOwnProperty.call(parsed, 'VITE_DEMO_MODE')) {
      value = parsed.VITE_DEMO_MODE;
      source = name;
    }
  }
  if (process.env.VITE_DEMO_MODE !== undefined) {
    value = process.env.VITE_DEMO_MODE;
    source = 'process env (VITE_DEMO_MODE)';
  }
  return { value, source };
};

const { value: demoValue, source } = resolveDemoMode();
const isDemo = typeof demoValue === 'string' && demoValue.trim().toLowerCase() === 'true';
const isExplicitFalse = typeof demoValue === 'string' && demoValue.trim().toLowerCase() === 'false';

if (mode !== 'production') {
  console.log(
    `[prod-guard] mode=${mode} (not production): demo-mode guard skipped` +
      (demoValue !== undefined ? ` (VITE_DEMO_MODE=${demoValue} from ${source})` : ''),
  );
  process.exit(0);
}

if (!isDemo) {
  if (demoValue !== undefined && !isExplicitFalse) {
    console.warn(
      `[prod-guard] WARNING: VITE_DEMO_MODE has an unexpected value "${demoValue}" (from ${source}); ` +
        'expected "true" or "false". Treating it as disabled (only the exact string "true" enables demo mode).',
    );
  }
  console.log(
    `[prod-guard] OK: production build allowed` +
      (demoValue === undefined ? ' (VITE_DEMO_MODE is unset, i.e. disabled)' : ` (VITE_DEMO_MODE=${demoValue} from ${source})`),
  );
  process.exit(0);
}

if (allowDemo) {
  console.warn('==============================================================');
  console.warn('[prod-guard] WARNING: building in DEMO MODE (--allow-demo / ALLOW_DEMO_BUILD=1).');
  console.warn(`[prod-guard] VITE_DEMO_MODE=true came from ${source}.`);
  console.warn('[prod-guard] Demo affordances and pre-filled data will be in this bundle.');
  console.warn('[prod-guard] NEVER deploy this output. Regenerate with VITE_DEMO_MODE=false.');
  console.warn('==============================================================');
  process.exit(0);
}

console.error('');
console.error('[prod-guard] BUILD BLOCKED: VITE_DEMO_MODE=true while building for production.');
console.error('');
console.error(`  resolved value : ${demoValue}`);
console.error(`  source         : ${source}`);
console.error('  mode           : production');
console.error('');
console.error('Demo mode enables demo shortcuts and pre-filled credentials, so it must never');
console.error('ship. Set VITE_DEMO_MODE=false (recommended) in the file shown above, then rebuild.');
console.error('');
console.error('For an intentional local demo build only:');
console.error('  npm run build:demo        (equivalent to --allow-demo, do NOT deploy)');
console.error('');
process.exit(1);
