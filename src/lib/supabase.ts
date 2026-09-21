import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase connection for the Unako SACCOS portal.
 *
 * Configure in `.env`:
 *   VITE_SUPABASE_URL=https://<project-ref>.supabase.co
 *   VITE_SUPABASE_ANON_KEY=<anon / publishable key>
 *
 * When these are missing the app keeps working in fully offline "demo" mode
 * (Zustand + localStorage + mock seeds), so the UI never breaks.
 */
const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string | undefined) || '';
const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) || '';

export const isSupabaseConfigured = (): boolean =>
  SUPABASE_URL.startsWith('https://') && SUPABASE_ANON_KEY.length > 20;

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    })
  : null;

/** e.g. "abcdefghijklmnop" extracted from the project URL (safe to show in UI). */
export const supabaseProjectRef = (): string => {
  const match = SUPABASE_URL.match(/^https:\/\/([^.]+)\.supabase\.co/);
  return match ? match[1] : '';
};
