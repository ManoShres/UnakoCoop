#!/usr/bin/env node
/**
 * Verifies the Supabase connection configured in `.env` without booting the app.
 *
 *   npm run db:check
 *
 * Exits 0 when both the employees and coop_settings tables answer,
 * 1 when Supabase is not configured or a table is missing.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const parseEnv = (file) => {
  try {
    return Object.fromEntries(
      readFileSync(file, 'utf8')
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith('#') && line.includes('='))
        .map((line) => {
          const idx = line.indexOf('=');
          return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()];
        })
    );
  } catch {
    return {};
  }
};

const env = { ...parseEnv(resolve(process.cwd(), '.env')), ...process.env };
const url = env.VITE_SUPABASE_URL || '';
const key = env.VITE_SUPABASE_ANON_KEY || '';

if (!url.startsWith('https://') || key.length < 20) {
  console.error(
    'x Supabase is NOT configured.\n  Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env, then retry.'
  );
  process.exit(1);
}

const headers = { apikey: key, Authorization: `Bearer ${key}` };

const check = async (path, label) => {
  try {
    const res = await fetch(`${url}/rest/v1/${path}`, { headers });
    const body = await res.text();
    if (!res.ok) {
      console.error(`x ${label}: HTTP ${res.status} - ${body.slice(0, 200)}`);
      return false;
    }
    console.log(`ok ${label}: ${body.slice(0, 160)}`);
    return true;
  } catch (err) {
    console.error(`x ${label}: ${err instanceof Error ? err.message : String(err)}`);
    return false;
  }
};

console.log(`Checking Supabase project: ${url}\n`);

const employeesOk = await check(
  'employees?select=employee_no,name,status&limit=3',
  'public.employees'
);
const settingsOk = await check('coop_settings?select=name&limit=1', 'public.coop_settings');

console.log('\nIf a table is missing: run supabase/schema.sql, then supabase/seed.sql in the SQL Editor.');

process.exit(employeesOk && settingsOk ? 0 : 1);
