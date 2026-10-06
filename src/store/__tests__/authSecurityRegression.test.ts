/**
 * Regression tests for the credential-less ADMIN paths (task-6 item 4).
 *
 * `switchToPreset('admin')` must be a development-only affordance: with
 * `import.meta.env.DEV === false` (a production build) it must be a no-op, and
 * the store must never hold `role === 'ADMIN'` with a null `staffRole`.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Keep the suite offline: no real Supabase client is ever created.
vi.mock('../../lib/supabase', () => ({
  supabase: null,
  isSupabaseConfigured: () => false,
}));

import { useAuthStore, isPrivilegedPresetEnabled } from '../useAuthStore';
import { INITIAL_MEMBERS } from '../../data/mockData';
import type { Employee } from '../../types';

const reset = () =>
  useAuthStore.setState({
    role: 'GUEST',
    currentMember: null,
    currentEmployee: null,
    staffRole: null,
    authLoading: false,
  });

const teller: Employee = {
  id: 'emp-teller',
  employeeNo: 'EMP-TELLER-01',
  name: 'Teller Officer',
  designation: 'Counter Teller',
  department: 'Cash Operations',
  branch: 'Main Branch',
  phone: '9800000000',
  email: 'teller@unako.coop',
  joinedDate: '2024-01-01',
  status: 'ACTIVE',
  accessRole: 'TELLER',
  assignedWards: [],
  avatarUrl: '',
};

describe('privileged ADMIN preset is a development-only control', () => {
  beforeEach(reset);
  afterEach(() => vi.unstubAllEnvs());

  it('is enabled in the test/dev environment', () => {
    expect(isPrivilegedPresetEnabled()).toBe(true);
  });

  it('is disabled when import.meta.env.DEV is false (production build)', () => {
    vi.stubEnv('DEV', false);
    expect(isPrivilegedPresetEnabled()).toBe(false);
  });

  it('NEVER mints an ADMIN session when the production gate is closed', () => {
    vi.stubEnv('DEV', false);

    useAuthStore.getState().switchToPreset('admin');

    const state = useAuthStore.getState();
    expect(state.role).toBe('GUEST');
    expect(state.staffRole).toBeNull();
    expect(state.currentEmployee).toBeNull();
    expect(state.currentMember).toBeNull();
  });

  it('keeps the dev preset working for local development', () => {
    useAuthStore.getState().switchToPreset('admin');

    const state = useAuthStore.getState();
    expect(state.role).toBe('ADMIN');
    expect(state.staffRole).not.toBeNull();
  });

  it('still serves the demo member presets (dev ergonomics preserved)', () => {
    useAuthStore.getState().switchToPreset('verified-member');
    expect(useAuthStore.getState().currentMember).toBe(INITIAL_MEMBERS[0]);
  });

  it('NEVER mints a credential-less MEMBER session in a production build', () => {
    vi.stubEnv('DEV', false);

    useAuthStore.getState().switchToPreset('verified-member');
    expect(useAuthStore.getState().role).toBe('GUEST');
    expect(useAuthStore.getState().currentMember).toBeNull();

    useAuthStore.getState().switchToPreset('pending-member');
    expect(useAuthStore.getState().currentMember).toBeNull();
  });

  it('always allows the guest de-escalation (logout) even in production', () => {
    vi.stubEnv('DEV', false);
    useAuthStore.setState({ role: 'ADMIN', staffRole: 'TELLER', currentEmployee: teller });

    useAuthStore.getState().switchToPreset('guest');

    expect(useAuthStore.getState().role).toBe('GUEST');
    expect(useAuthStore.getState().staffRole).toBeNull();
  });
});

describe('staffRole invariant: role ADMIN always carries a resolved staff role', () => {
  beforeEach(reset);

  it('setRole cannot promote to ADMIN without a verified staff role', () => {
    useAuthStore.getState().setRole('ADMIN');
    expect(useAuthStore.getState().role).toBe('GUEST');
    expect(useAuthStore.getState().staffRole).toBeNull();
  });

  it('setRole promotes to ADMIN when a staff role is already resolved', () => {
    useAuthStore.setState({ staffRole: 'TELLER' });
    useAuthStore.getState().setRole('ADMIN');
    expect(useAuthStore.getState().role).toBe('ADMIN');
  });

  it('clearing staffRole demotes an ADMIN session back to GUEST', () => {
    useAuthStore.setState({ role: 'ADMIN', staffRole: 'TELLER' });

    useAuthStore.getState().setStaffRole(null);

    const state = useAuthStore.getState();
    expect(state.role).toBe('GUEST');
    expect(state.staffRole).toBeNull();
    expect(state.currentEmployee).toBeNull();
  });

  it('clearing the employee link demotes an ADMIN session back to GUEST', () => {
    useAuthStore.setState({ role: 'ADMIN', staffRole: 'TELLER' });

    useAuthStore.getState().setCurrentEmployee(null);

    expect(useAuthStore.getState().role).toBe('GUEST');
    expect(useAuthStore.getState().staffRole).toBeNull();
  });

  it('signInStaff refuses an employee record with no access role', () => {
    useAuthStore
      .getState()
      .signInStaff({ ...teller, accessRole: undefined } as unknown as Employee);

    const state = useAuthStore.getState();
    expect(state.role).toBe('GUEST');
    expect(state.staffRole).toBeNull();
    expect(state.currentEmployee).toBeNull();
  });

  it('signInStaff grants ADMIN with the exact access role for a valid employee', () => {
    useAuthStore.getState().signInStaff(teller);

    const state = useAuthStore.getState();
    expect(state.role).toBe('ADMIN');
    expect(state.staffRole).toBe('TELLER');
    expect(state.currentEmployee).toBe(teller);
  });
});
