// ---------------------------------------------------------------------------
// Mother Group mock data
// ---------------------------------------------------------------------------

import { MotherGroup } from '../types';

export const INITIAL_MOTHER_GROUPS: MotherGroup[] = [
  {
    id: 'mg-001',
    name: 'Laliguras Mother Group',
    nameNepali: 'ललितगुरास् आमाबिबाग',
    location: 'Chainpur-5, Gadhwa',
    locationNepali: 'चैनपुर-५, गढवा',
    contactPerson: 'Mina Devi Chaudhary',
    contactPhone: '98478-12345',
    meetingDay: 'Saturday',
    meetingDayNepali: 'शनिबार',
    monthlyTargetAmount: 50000,
    totalMembers: 25,
    createdAt: '2024-01-15',
    isActive: true,
    notes: 'Active women empowerment group. Regular monthly collections.',
  },
  {
    id: 'mg-002',
    name: 'Laliguras Mother Group',
    nameNepali: 'ललितगुरास् आमाबिबाग',
    location: 'Lamahi-3, Dhabi',
    locationNepali: 'लमही३, धबि',
    contactPerson: 'Sita Kumari Sharma',
    contactPhone: '98478-67890',
    meetingDay: 'Sunday',
    meetingDayNepali: 'आइतबार',
    monthlyTargetAmount: 35000,
    totalMembers: 18,
    createdAt: '2024-02-20',
    isActive: true,
    notes: 'Same group name at different location - separate branch.',
  },
  {
    id: 'mg-003',
    name: 'Suryamukhi Women Group',
    nameNepali: 'सूर्यमुखी महिला समूह',
    location: 'Gadhwa-8, Bhalubang',
    locationNepali: 'गढवा८, भालुबंग',
    contactPerson: 'Kamala Devi Thapa',
    contactPhone: '98578-11223',
    meetingDay: 'Wednesday',
    meetingDayNepali: 'बिहिबार',
    monthlyTargetAmount: 75000,
    totalMembers: 32,
    createdAt: '2023-06-10',
    isActive: true,
  },
];