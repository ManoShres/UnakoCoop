import { describe, it, expect, vi } from 'vitest';
import { MemberRow, rowToMember, memberToRow, memberPatchToRow } from '../operationalService';
import { Member } from '../../types';

// Keep the suite offline: no real Supabase client is ever created.
vi.mock('../../lib/supabase', () => ({
  supabase: null,
  isSupabaseConfigured: () => false,
}));

const sampleRow: MemberRow = {
  id: '3f2c6a10-7b1e-4c5d-9a20-1b2c3d4e5f60',
  member_no: 'UK-88219',
  name: 'Ram Bahadur Shrestha',
  name_nepali: 'राम बहादुर श्रेष्ठ',
  email: 'ram.shrestha@unako.coop.np',
  phone: '9851023456',
  citizenship_no: '27-01-72-04912',
  pan_no: null,
  joined_date: '2021-04-12',
  address: 'Kalanki, Kathmandu',
  status: 'VERIFIED',
  avatar_url: '/assets/kyc/avatar_hari.png',
  share_capital: 150000,
  total_savings: 485600,
  active_loan_balance: 320000,
  accrued_dividend: 27800,
  credit_score: 785,
  bank_details: {
    bankName: 'Nabil Bank',
    accountNo: '023-441299',
    branch: 'Kalanki',
    holderName: 'Ram Bahadur Shrestha',
  },
  kyc_documents: {
    citizenshipFront: true,
    citizenshipBack: true,
    photo: true,
    signature: true,
    utilityBill: true,
  },
  auth_user_id: 'd1c2b3a4-1111-2222-3333-444455556666',
  notes: 'Founding shareholder of the Gadhwa collective.',
};

describe('Supabase member row <-> Member domain model mapping', () => {
  it('maps the jsonb bank/kyc columns and the auth_user_id link', () => {
    const member = rowToMember(sampleRow);

    expect(member.authUserId).toBe('d1c2b3a4-1111-2222-3333-444455556666');
    expect(member.bankDetails.bankName).toBe('Nabil Bank');
    expect(member.kycDocuments.utilityBill).toBe(true);
    expect(member.nameNepali).toBe('राम बहादुर श्रेष्ठ');
  });

  it('falls back to empty bank details / KYC when the jsonb columns are null', () => {
    const member = rowToMember({ ...sampleRow, bank_details: null, kyc_documents: null });

    expect(member.bankDetails).toEqual({ bankName: '', accountNo: '', branch: '', holderName: '' });
    expect(member.kycDocuments.photo).toBe(false);
    expect(member.authUserId).toBe('d1c2b3a4-1111-2222-3333-444455556666');
  });

  it('round-trips the auth link back into the snake_case row shape', () => {
    const member = rowToMember(sampleRow);
    const row = memberToRow({ ...member, id: undefined } as unknown as Omit<Member, 'id'>);

    expect(row.auth_user_id).toBe('d1c2b3a4-1111-2222-3333-444455556666');
    expect(row.bank_details).toEqual(sampleRow.bank_details);
    expect(row.kyc_documents).toEqual(sampleRow.kyc_documents);
  });

  it('patches the auth link column when linking/unlinking a login', () => {
    const link = memberPatchToRow({ authUserId: 'abc-123' });
    const unlink = memberPatchToRow({ authUserId: null });

    expect(link).toEqual({ auth_user_id: 'abc-123' });
    expect(unlink).toEqual({ auth_user_id: null });
  });

  it('leaves unrelated columns out of an auth-link-only patch', () => {
    const patch = memberPatchToRow({ authUserId: 'abc-123' });

    expect('name' in patch).toBe(false);
    expect('member_no' in patch).toBe(false);
  });
});