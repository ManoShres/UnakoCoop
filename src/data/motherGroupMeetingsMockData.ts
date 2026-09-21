// ---------------------------------------------------------------------------
// Mother Group Meetings mock data
// ---------------------------------------------------------------------------

import { MotherGroupMeeting } from '../types';

export const INITIAL_MOTHER_GROUP_MEETINGS: MotherGroupMeeting[] = [
  {
    id: 'mgmt-001',
    motherGroupId: 'mg-001',
    meetingDate: '2026-09-13',
    scheduledTime: '10:00 AM',
    conductedBy: 'EMP-2080-0032',
    conductedByName: 'Kamala Devi Sharma',
    totalCollected: 47500,
    memberCount: 23,
    status: 'COMPLETED',
    notes: 'Good attendance. Two members absent due to illness.',
    createdAt: '2026-09-13',
  },
  {
    id: 'mgmt-002',
    motherGroupId: 'mg-001',
    meetingDate: '2026-08-10',
    scheduledTime: '10:00 AM',
    conductedBy: 'EMP-2080-0032',
    conductedByName: 'Kamala Devi Sharma',
    totalCollected: 45000,
    memberCount: 21,
    status: 'COMPLETED',
    createdAt: '2026-08-10',
  },
  {
    id: 'mgmt-003',
    motherGroupId: 'mg-003',
    meetingDate: '2026-09-17',
    scheduledTime: '11:00 AM',
    conductedBy: 'EMP-2080-0038',
    conductedByName: 'Dipak Bahadur Thapa',
    totalCollected: 68000,
    memberCount: 28,
    status: 'COMPLETED',
    createdAt: '2026-09-17',
  },
];