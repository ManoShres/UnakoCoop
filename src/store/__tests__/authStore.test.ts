import { describe, it, expect, beforeEach, vi } from 'vitest';

// Keep the suite offline: no real Supabase client is ever created.
vi.mock('../../lib/supabase', () => ({
  supabase: null,
  isSupabaseConfigured: () => false,
}));

import { useAuthStore } from '../useAuthStore';
import { INITIAL_MEMBERS } from '../../data/mockData';

const resetStore = () => {
  useAuthStore.setState({
    role: 'MEMBER',
    currentMember: INITIAL_MEMBERS[0],
    authLoading: false,
  });
};

describe('useAuthStore member session handling', () => {
  beforeEach(resetStore);

  it('boots out of auth loading in offline demo mode via initAuth', async () => {
    useAuthStore.setState({ authLoading: true });
    await useAuthStore.getState().initAuth();

    expect(useAuthStore.getState().authLoading).toBe(false);
  });

  it('signInMember switches the portal into the member perspective', () => {
    const member = INITIAL_MEMBERS[1];

    useAuthStore.getState().signInMember(member);

    expect(useAuthStore.getState().role).toBe('MEMBER');
    expect(useAuthStore.getState().currentMember).toBe(member);
    expect(useAuthStore.getState().authLoading).toBe(false);
  });

  it('the guest preset clears the member session completely', () => {
    useAuthStore.getState().switchToPreset('guest');

    expect(useAuthStore.getState().role).toBe('GUEST');
    expect(useAuthStore.getState().currentMember).toBeNull();
  });

  it('demo presets still map to the seeded demo members', () => {
    useAuthStore.getState().switchToPreset('verified-member');

    expect(useAuthStore.getState().currentMember).toBe(INITIAL_MEMBERS[0]);
  });

  it('signInStaff assigns ADMIN role and links employee and staffRole', () => {
    const mockEmp = {
      id: 'emp-101',
      employeeNo: 'EMP-2081-9999',
      name: 'Test Teller',
      designation: 'Counter Teller',
      department: 'Cash Operations',
      branch: 'Main Branch',
      phone: '9800000000',
      email: 'teller@unako.coop',
      joinedDate: '2024-01-01',
      status: 'ACTIVE' as const,
      accessRole: 'TELLER' as const,
      assignedWards: ['Ward 1'],
      avatarUrl: '/avatar.png',
    };

    useAuthStore.getState().signInStaff(mockEmp);

    expect(useAuthStore.getState().role).toBe('ADMIN');
    expect(useAuthStore.getState().currentEmployee).toBe(mockEmp);
    expect(useAuthStore.getState().staffRole).toBe('TELLER');
    expect(useAuthStore.getState().currentMember).toBeNull();
  });

  it('signOut resets auth state back to GUEST', async () => {
    useAuthStore.getState().switchToPreset('admin');
    expect(useAuthStore.getState().role).toBe('ADMIN');

    await useAuthStore.getState().signOut();

    expect(useAuthStore.getState().role).toBe('GUEST');
    expect(useAuthStore.getState().currentMember).toBeNull();
    expect(useAuthStore.getState().currentEmployee).toBeNull();
    expect(useAuthStore.getState().staffRole).toBeNull();
  });
});