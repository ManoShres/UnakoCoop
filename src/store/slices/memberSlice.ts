import { StateCreator } from 'zustand';
import { Member } from '../../types';
import { INITIAL_MEMBERS } from '../../data/mockData';
import { CoopState, MemberSlice } from '../storeTypes';

export const createMemberSlice: StateCreator<CoopState, [], [], MemberSlice> = (set, get) => ({
  members: INITIAL_MEMBERS,

  updateMemberDetails: (memberId, updates) => {
    set((state) => ({
      members: state.members.map((m) =>
        m.id === memberId ? { ...m, ...updates } : m
      ),
    }));
  },

  addMember: (memberData) => {
    const newMember: Member = {
      ...memberData,
      id: 'mem-' + Date.now(),
    };
    set((state) => ({
      members: [newMember, ...state.members],
    }));
    return newMember;
  },

  updateMemberStatus: (memberId, status, notes) => {
    set((state) => ({
      members: state.members.map((m) =>
        m.id === memberId ? { ...m, status, notes: notes ?? m.notes } : m
      ),
    }));
  },

  searchMember: (query) => {
    const q = query.toLowerCase().trim();
    if (!q) return undefined;
    return get().members.find(
      (m) =>
        m.memberNo.toLowerCase().includes(q) ||
        m.name.toLowerCase().includes(q) ||
        m.citizenshipNo.toLowerCase().includes(q) ||
        m.phone.includes(q)
    );
  },
});
