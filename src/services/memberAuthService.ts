import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Member } from '../types';
import { fetchMemberByAuthUserId, ServiceResult } from './operationalService';
import { LoginSchema } from '../schemas/authSchema';

const NOT_CONFIGURED =
  'Supabase is not configured (set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY).';

/**
 * Member sign-in is only possible against the live CIS authentication service.
 * Without it the flow fails closed - there is no offline roster/password match.
 */
export const MEMBER_LIVE_AUTH_REQUIRED =
  'Live authentication is required: the CBS authentication service is not configured on this deployment.';

/**
 * Signs a member in through Supabase Auth (email + password) and resolves the
 * members row linked via members.auth_user_id. Row-level security guarantees
 * the browser can only ever read the signed-in member's own data.
 */
export const signInMemberWithSupabase = async (
  email: string,
  password: string
): Promise<ServiceResult<Member>> => {
  if (!supabase) return { data: null, error: NOT_CONFIGURED };

  // Validate login input before reaching Supabase Auth.
  const validation = LoginSchema.safeParse({ email, password });
  if (!validation.success) {
    const firstIssue = validation.error.issues[0];
    return { data: null, error: firstIssue?.message ?? 'Invalid login input.' };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: validation.data.email,
      password: validation.data.password,
    });
    if (error) return { data: null, error: error.message };

    const userId = data.user?.id;
    if (!userId) return { data: null, error: 'Sign-in returned no user session.' };

    const linked = await fetchMemberByAuthUserId(userId);
    if (linked.error) return { data: null, error: linked.error };
    if (!linked.data) {
      // Not a member login (or not linked yet) - do not leave a dangling session.
      await supabase.auth.signOut();
      return {
        data: null,
        error:
          'This account is not linked to a member profile yet. Please ask the cooperative office to activate your member login.',
      };
    }
    return { data: linked.data, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Unknown network error.',
    };
  }
};

/**
 * Member login entry point used by the login page.
 *
 * FAIL CLOSED: when the deployment has no live authentication service this
 * returns MEMBER_LIVE_AUTH_REQUIRED and authenticates nobody. There is no
 * offline member-number / phone / citizenship / name-substring match any more.
 */
export const authenticateMemberWithSupabase = async (
  identifier: string,
  password: string
): Promise<ServiceResult<Member>> => {
  if (!isSupabaseConfigured() || !supabase) {
    return { data: null, error: MEMBER_LIVE_AUTH_REQUIRED };
  }
  // signInMemberWithSupabase already verifies the members.auth_user_id link and
  // signs the session out when the account is not a linked member.
  return signInMemberWithSupabase(identifier.trim(), password);
};

/**
 * Restores a persisted member session on page refresh.
 * - Member session  -> returns the linked Member.
 * - Staff session   -> returns `data: null` (no member row).
 * - No session      -> returns `data: null`.
 */
export const restoreMemberSession = async (): Promise<ServiceResult<Member | null>> => {
  if (!supabase) return { data: null, error: NOT_CONFIGURED };

  try {
    const { data } = await supabase.auth.getSession();
    const userId = data.session?.user?.id;
    if (!userId) return { data: null, error: null };

    const linked = await fetchMemberByAuthUserId(userId);
    if (linked.error) return { data: null, error: linked.error };
    return { data: linked.data, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Unknown network error.',
    };
  }
};

/** Ends the Supabase Auth session (safe to call in offline demo mode too). */
export const signOutMember = async (): Promise<void> => {
  if (!supabase) return;
  try {
    await supabase.auth.signOut();
  } catch {
    // ignore - the local demo session still ends
  }
};

export const isMemberAuthAvailable = isSupabaseConfigured;