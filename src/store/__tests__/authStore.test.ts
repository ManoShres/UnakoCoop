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
});