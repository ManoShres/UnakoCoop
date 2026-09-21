// ---------------------------------------------------------------------------
// Mother Group Members mock data
// ---------------------------------------------------------------------------

import { MotherGroupMember } from '../types';

export const INITIAL_MOTHER_GROUP_MEMBERS: MotherGroupMember[] = [
  // Laliguras Group (Chainpur-5) members
  {
    id: 'mgm-001',
    motherGroupId: 'mg-001',
    memberId: 'm1',
    memberName: 'Ram Bahadur Shrestha',
    memberNo: 'UK-88219',
    joinedDate: '2024-01-15',
    monthlyContribution: 2000,
    isActive: true,
    createdAt: '2024-01-15',
  },
  {
    id: 'mgm-002',
    motherGroupId: 'mg-001',
    memberId: 'm3',
    memberName: 'Gopal Krishna Thapa',
    memberNo: 'UK-76102',
    joinedDate: '2024-01-15',
    monthlyContribution: 2500,
    isActive: true,
    createdAt: '2024-01-15',
  },
  {
    id: 'mgm-003',
    motherGroupId: 'mg-001',
    memberName: 'Anita Devi Magar',
    memberNo: 'UK-99102',
    joinedDate: '2024-02-01',
    monthlyContribution: 1500,
    isActive: true,
    createdAt: '2024-02-01',
  },
  {
    id: 'mgm-004',
    motherGroupId: 'mg-001',
    memberName: 'Bikash Rimal',
    memberNo: 'UK-99103',
    joinedDate: '2024-02-15',
    monthlyContribution: 2000,
    isActive: false,
    createdAt: '2024-02-15',
  },
  // Suryamukhi Group members
  {
    id: 'mgm-005',
    motherGroupId: 'mg-003',
    memberId: 'm4',
    memberName: 'Bina Kumari Gurung',
    memberNo: 'UK-95521',
    joinedDate: '2023-06-10',
    monthlyContribution: 3000,
    isActive: true,
    createdAt: '2023-06-10',
  },
  {
    id: 'mgm-006',
    motherGroupId: 'mg-003',
    memberName: 'Sadhana Joshi',
    memberNo: 'UK-95522',
    joinedDate: '2023-06-10',
    monthlyContribution: 2500,
    isActive: true,
    createdAt: '2023-06-10',
  },
  {
    id: 'mgm-007',
    motherGroupId: 'mg-003',
    memberName: 'Kiran Thapa',
    memberNo: 'UK-95523',
    joinedDate: '2023-07-01',
    monthlyContribution: 2000,
    isActive: true,
    createdAt: '2023-07-01',
  },
];