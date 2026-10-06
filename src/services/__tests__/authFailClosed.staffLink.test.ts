/**
 * Regression tests: a successful Supabase Auth sign-in only becomes staff
 * authority when the authenticated account is linked to an ACTIVE employee row
 * (task-6 item 5). An authenticated-but-unlinked account is signed out and
 * never yields an Employee (so no caller can end up with role ADMIN).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => ({
  signOut: vi.fn(async () => ({ error: null })),
  signInWithPassword: vi.fn(),
  employeeRow: null as Record<string, unknown> | null,
  maybeSingleError: null as { message: string } | null,
}));

vi.mock('../../lib/supabase', () => ({
  isSupabaseConfigured: () => true,
  supabase: {
    auth: {
      signOut: mocks.signOut,
      signInWithPassword: mocks.signInWithPassword,
      getSession: async () => ({ data: { session: null } }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            maybeSingle: async () => ({
              data: mocks.employeeRow,
              error: mocks.maybeSingleError,
            }),
          }),
        }),
      }),
    }),
  },
}));

import { authenticateStaffWithSupabase, STAFF_NOT_LINKED } from '../employeeService';

const activeRow: Record<string, unknown> = {
  id: 'emp-1',
  employee_no: 'EMP-1',
  name: 'Teller One',
  name_nepali: null,
  designation: 'Teller',
  designation_nepali: null,
  department: 'Cash Operations',
  branch: 'Main Branch',
  phone: '9800000000',
  email: 'teller@unako.coop',
  joined_date: '2024-01-01',
  status: 'ACTIVE',
  access_role: 'TELLER',
  assigned_wards: [],
  avatar_url: '',
  notes: null,
};

beforeEach(() => {
  mocks.signOut.mockClear();
  mocks.employeeRow = activeRow;
  mocks.maybeSingleError = null;
  mocks.signInWithPassword.mockReset();
  mocks.signInWithPassword.mockResolvedValue({
    data: { user: { id: 'auth-user-1', email: 'teller@unako.coop' } },
    error: null,
  });
});

describe('staff authority requires an ACTIVE employee link', () => {
  it('resolves the Employee + access role for a linked ACTIVE employee', async () => {
    const result = await authenticateStaffWithSupabase('teller@unako.coop', 'password123');

    expect(result.error).toBeNull();
    expect(result.data?.employeeNo).toBe('EMP-1');
    expect(result.data?.accessRole).toBe('TELLER');
    expect(mocks.signOut).not.toHaveBeenCalled();
  });

  it('signs out and denies an authenticated account with no employee row', async () => {
    mocks.employeeRow = null;

    const result = await authenticateStaffWithSupabase('teller@unako.coop', 'password123');

    expect(result.data).toBeNull();
    expect(result.error).toBe(STAFF_NOT_LINKED);
    expect(mocks.signOut).toHaveBeenCalledTimes(1);
  });

  it('signs out and denies a linked row that has no access role', async () => {
    mocks.employeeRow = { ...activeRow, access_role: null };

    const result = await authenticateStaffWithSupabase('teller@unako.coop', 'password123');

    expect(result.data).toBeNull();
    expect(result.error).toBe(STAFF_NOT_LINKED);
    expect(mocks.signOut).toHaveBeenCalledTimes(1);
  });

  it('propagates a Supabase Auth failure without resolving an employee', async () => {
    mocks.signInWithPassword.mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid login credentials' },
    });

    const result = await authenticateStaffWithSupabase('teller@unako.coop', 'wrong-password');

    expect(result.data).toBeNull();
    expect(result.error).toContain('Invalid login credentials');
  });

  it('fails closed when auth succeeds but returns no user id', async () => {
    mocks.signInWithPassword.mockResolvedValue({ data: { user: null }, error: null });

    const result = await authenticateStaffWithSupabase('teller@unako.coop', 'password123');

    expect(result.data).toBeNull();
    expect(result.error).not.toBeNull();
  });

  it('rejects malformed login input before reaching Supabase Auth', async () => {
    const result = await authenticateStaffWithSupabase('not-an-email', '123');

    expect(result.data).toBeNull();
    expect(result.error).not.toBeNull();
    expect(mocks.signInWithPassword).not.toHaveBeenCalled();
  });
});
