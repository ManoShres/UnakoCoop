/**
 * Regression tests: with no live authentication service configured, every
 * login path fails CLOSED (task-6 item 1).
 *
 * The old UnifiedLoginPage matched staff identifiers against a local employee
 * roster (plus a hardcoded `admin` / `admin@unako.coop` SUPER_ADMIN bypass) and
 * matched members on member-no / phone / citizenship / name substring with no
 * password check. None of that may authenticate anybody any more.
 */
import { describe, it, expect, vi } from 'vitest';

vi.mock('../../lib/supabase', () => ({
  supabase: null,
  isSupabaseConfigured: () => false,
}));

import {
  authenticateStaffWithSupabase,
  fetchActiveEmployeeByAuthUserId,
  signInStaffWithSupabase,
  signOutOfSupabase,
  LIVE_AUTH_REQUIRED,
} from '../employeeService';
import {
  authenticateMemberWithSupabase,
  MEMBER_LIVE_AUTH_REQUIRED,
} from '../memberAuthService';

describe('offline login paths fail closed', () => {
  it('rejects the former hardcoded master-admin credentials', async () => {
    const result = await authenticateStaffWithSupabase('admin@unako.coop', 'cbsAdmin2026');

    expect(result.data).toBeNull();
    expect(result.error).toBe(LIVE_AUTH_REQUIRED);
  });

  it('rejects the bare "admin" identifier that used to grant SUPER_ADMIN', async () => {
    const result = await authenticateStaffWithSupabase('admin', 'cbsAdmin2026');

    expect(result.data).toBeNull();
    expect(result.error).toBe(LIVE_AUTH_REQUIRED);
  });

  it('rejects a seeded employee email used as an offline credential', async () => {
    const result = await authenticateStaffWithSupabase('aarati.yadav@unako.coop.np', 'anything');

    expect(result.data).toBeNull();
    expect(result.error).toBe(LIVE_AUTH_REQUIRED);
  });

  it('rejects the former demo member credentials', async () => {
    const result = await authenticateMemberWithSupabase('UK-88219', 'password123');

    expect(result.data).toBeNull();
    expect(result.error).toBe(MEMBER_LIVE_AUTH_REQUIRED);
  });

  it('rejects a member name-substring match', async () => {
    const result = await authenticateMemberWithSupabase('ram', 'password123');

    expect(result.data).toBeNull();
    expect(result.error).toBe(MEMBER_LIVE_AUTH_REQUIRED);
  });

  it('never resolves an employee without the live service', async () => {
    const result = await fetchActiveEmployeeByAuthUserId('any-auth-user-id');

    expect(result.data).toBeNull();
    expect(result.error).not.toBeNull();
  });

  it('exposes the underlying sign-in helpers as fail-closed too', async () => {
    const staff = await signInStaffWithSupabase('admin@unako.coop', 'cbsAdmin2026');
    expect(staff.data).toBeNull();
    expect(staff.error).not.toBeNull();

    // signOutOfSupabase must be safe (and inert) when nothing is configured.
    await expect(signOutOfSupabase()).resolves.toBeUndefined();
  });
});
