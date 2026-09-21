import React from 'react';
import { useLanguageStore } from '../../store/useLanguageStore';

interface BadgeProps {
  status: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Badge: React.FC<BadgeProps> = ({ status, className = '', size = 'md' }) => {
  const { t } = useLanguageStore();

  const getStyle = () => {
    switch (status.toUpperCase()) {
      case 'VERIFIED':
      case 'APPROVED':
      case 'COMPLETED':
      case 'ACTIVE':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800';
      case 'PENDING':
      case 'SUBMITTED':
      case 'UNDER_REVIEW':
      case 'UNDER_COMMITTEE_REVIEW':
      case 'IN_PROGRESS':
        return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800';
      case 'ACTION_REQUIRED':
      case 'DOCUMENT_REQUIRED':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800';
      case 'REJECTED':
      case 'OVERDUE':
      case 'FAILED':
        return 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-semibold',
    lg: 'text-sm px-3.5 py-1.5 font-bold',
  };

  const formatText = (text: string) => {
    switch (text.toUpperCase()) {
      case 'VERIFIED':
        return t('प्रमाणित', 'VERIFIED');
      case 'APPROVED':
        return t('स्वीकृत', 'APPROVED');
      case 'COMPLETED':
        return t('सम्पन्न', 'COMPLETED');
      case 'ACTIVE':
        return t('सक्रिय', 'ACTIVE');
      case 'PENDING':
        return t('प्रक्रियाधीन', 'PENDING');
      case 'SUBMITTED':
        return t('पेश गरिएको', 'SUBMITTED');
      case 'UNDER_REVIEW':
        return t('समीक्षाधीन', 'UNDER REVIEW');
      case 'UNDER_COMMITTEE_REVIEW':
        return t('समिति समीक्षामा', 'COMMITTEE REVIEW');
      case 'IN_PROGRESS':
        return t('प्रगतिमा', 'IN PROGRESS');
      case 'ACTION_REQUIRED':
        return t('कारबाही आवश्यक', 'ACTION REQUIRED');
      case 'DOCUMENT_REQUIRED':
        return t('कागजात आवश्यक', 'DOCUMENT REQUIRED');
      case 'REJECTED':
        return t('अस्वीकृत', 'REJECTED');
      case 'OVERDUE':
        return t('म्याद नाघेको', 'OVERDUE');
      case 'FAILED':
        return t('असफल', 'FAILED');
      case 'NEW':
        return t('नयाँ', 'NEW');
      case 'RESOLVED':
        return t('समाधान भएको', 'RESOLVED');
      default:
        return text.replace(/_/g, ' ');
    }
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border tracking-wide uppercase ${getStyle()} ${sizeClasses[size]} ${className}`}
    >
      <span className="size-1.5 rounded-full bg-current mr-1.5 opacity-70"></span>
      {formatText(status)}
    </span>
  );
};
