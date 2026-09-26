import React from 'react';
import { Member } from '../../../types';
import { useAuthStore } from '../../../store/useAuthStore';
import { useCoopStore } from '../../../store/useCoopStore';
import { MemberDigitalSmartCardModal } from '../../../components/common/MemberDigitalSmartCardModal';

interface DigitalSmartIdModalProps {
  isOpen: boolean;
  onClose: () => void;
  member?: Member | null;
}

export function DigitalSmartIdModal({ isOpen, onClose, member }: DigitalSmartIdModalProps) {
  const { currentMember } = useAuthStore();
  const { members } = useCoopStore();

  const activeMember = member || currentMember || members[0] || null;

  return (
    <MemberDigitalSmartCardModal
      isOpen={isOpen}
      onClose={onClose}
      member={activeMember}
    />
  );
}
