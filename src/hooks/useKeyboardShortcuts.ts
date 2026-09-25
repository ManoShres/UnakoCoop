import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguageStore } from '../store/useLanguageStore';

export type ShortcutAction =
  | 'TOGGLE_GUIDE'
  | 'TOGGLE_TERMINAL'
  | 'TOGGLE_LANG'
  | 'FOCUS_SEARCH'
  | 'CLOSE_MODALS'
  | 'NAV_ADMIN_DASHBOARD'
  | 'NAV_ADMIN_MEMBERS'
  | 'NAV_ADMIN_SAVINGS'
  | 'NAV_ADMIN_LOANS'
  | 'NAV_ADMIN_TELLER'
  | 'NAV_ADMIN_MOTHER_GROUPS'
  | 'NAV_MEMBER_DASHBOARD'
  | 'NAV_MEMBER_ACCOUNTS'
  | 'NAV_MEMBER_LOANS'
  | 'NAV_MEMBER_SHARES'
  | 'NAV_MEMBER_TRANSFERS'
  | 'NAV_PUBLIC';

export interface ShortcutEventPayload {
  key: string;
  ctrlKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  metaKey: boolean;
  isInput: boolean;
}

export function isInputFocused(target: EventTarget | null): boolean {
  if (!target) return false;
  if (typeof HTMLElement !== 'undefined' && target instanceof HTMLElement) {
    const tag = target.tagName?.toUpperCase();
    return (
      tag === 'INPUT' ||
      tag === 'TEXTAREA' ||
      tag === 'SELECT' ||
      Boolean(target.isContentEditable)
    );
  }
  if (typeof target === 'object' && 'tagName' in target) {
    const el = target as { tagName?: string; isContentEditable?: boolean };
    const tag = el.tagName?.toUpperCase();
    return (
      tag === 'INPUT' ||
      tag === 'TEXTAREA' ||
      tag === 'SELECT' ||
      Boolean(el.isContentEditable)
    );
  }
  return false;
}

export function resolveShortcutAction(
  e: ShortcutEventPayload,
  context: 'ADMIN' | 'MEMBER' | 'GLOBAL' = 'GLOBAL'
): ShortcutAction | null {
  // Global Escape: close modals / guides
  if (e.key === 'Escape') {
    return 'CLOSE_MODALS';
  }

  // Fast Banking Terminal: F2 (global/admin CBS fast terminal)
  if (e.key === 'F2') {
    return 'TOGGLE_TERMINAL';
  }

  // Language toggle: Ctrl+Shift+L (works globally)
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key.toLowerCase() === 'l' || e.key === 'L')) {
    return 'TOGGLE_LANG';
  }

  // Skip other shortcuts if typing inside an editable form control
  if (e.isInput) {
    return null;
  }

  // Shortcut Guide: ?
  if (e.key === '?' || (e.shiftKey && e.key === '/')) {
    return 'TOGGLE_GUIDE';
  }

  // Search input focus: Ctrl+K or /
  if (((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'k' || e.key === 'K')) || e.key === '/') {
    return 'FOCUS_SEARCH';
  }

  // Public Home: Alt+H
  if (e.altKey && (e.key.toLowerCase() === 'h' || e.key === 'H')) {
    return 'NAV_PUBLIC';
  }

  // Admin Navigation: Alt+[Key]
  if (context === 'ADMIN' && e.altKey) {
    const k = e.key.toLowerCase();
    switch (k) {
      case 'd':
        return 'NAV_ADMIN_DASHBOARD';
      case 'm':
        return 'NAV_ADMIN_MEMBERS';
      case 's':
        return 'NAV_ADMIN_SAVINGS';
      case 'l':
        return 'NAV_ADMIN_LOANS';
      case 't':
        return 'NAV_ADMIN_TELLER';
      case 'g':
        return 'NAV_ADMIN_MOTHER_GROUPS';
    }
  }

  // Member Navigation: Alt+[Key]
  if (context === 'MEMBER' && e.altKey) {
    const k = e.key.toLowerCase();
    switch (k) {
      case 'd':
        return 'NAV_MEMBER_DASHBOARD';
      case 'm':
        return 'NAV_MEMBER_ACCOUNTS';
      case 'l':
        return 'NAV_MEMBER_LOANS';
      case 's':
        return 'NAV_MEMBER_SHARES';
      case 't':
        return 'NAV_MEMBER_TRANSFERS';
    }
  }

  return null;
}

export interface UseKeyboardShortcutsOptions {
  context?: 'ADMIN' | 'MEMBER' | 'GLOBAL';
  onCloseModals?: () => void;
}

export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions = {}) {
  const { context = 'GLOBAL', onCloseModals } = options;
  const navigate = useNavigate();
  const toggleLang = useLanguageStore((s) => s.toggleLang);
  const [showShortcutGuide, setShowShortcutGuide] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);

  const toggleShortcutGuide = useCallback(() => {
    setShowShortcutGuide((prev) => !prev);
  }, []);

  const closeShortcutGuide = useCallback(() => {
    setShowShortcutGuide(false);
  }, []);

  const toggleTerminal = useCallback(() => {
    setShowTerminal((prev) => !prev);
  }, []);

  const closeTerminal = useCallback(() => {
    setShowTerminal(false);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput = isInputFocused(e.target);
      const action = resolveShortcutAction(
        {
          key: e.key,
          ctrlKey: e.ctrlKey,
          shiftKey: e.shiftKey,
          altKey: e.altKey,
          metaKey: e.metaKey,
          isInput,
        },
        context
      );

      if (!action) return;

      switch (action) {
        case 'TOGGLE_GUIDE':
          e.preventDefault();
          setShowShortcutGuide((prev) => !prev);
          break;

        case 'TOGGLE_TERMINAL':
          e.preventDefault();
          setShowTerminal((prev) => !prev);
          break;

        case 'TOGGLE_LANG':
          e.preventDefault();
          toggleLang();
          break;

        case 'FOCUS_SEARCH': {
          e.preventDefault();
          const searchInput = document.querySelector<HTMLInputElement>(
            'input[type="search"], input[placeholder*="खोज"], input[placeholder*="Search"], input[placeholder*="search"]'
          );
          if (searchInput) {
            searchInput.focus();
            searchInput.select();
          }
          break;
        }

        case 'CLOSE_MODALS':
          if (showShortcutGuide) {
            e.preventDefault();
            setShowShortcutGuide(false);
          } else if (showTerminal) {
            e.preventDefault();
            setShowTerminal(false);
          } else if (onCloseModals) {
            onCloseModals();
          }
          break;

        case 'NAV_PUBLIC':
          e.preventDefault();
          navigate('/');
          break;

        // Admin Navigation
        case 'NAV_ADMIN_DASHBOARD':
          e.preventDefault();
          navigate('/admin');
          break;
        case 'NAV_ADMIN_MEMBERS':
          e.preventDefault();
          navigate('/admin/members');
          break;
        case 'NAV_ADMIN_SAVINGS':
          e.preventDefault();
          navigate('/admin/savings');
          break;
        case 'NAV_ADMIN_LOANS':
          e.preventDefault();
          navigate('/admin/loans');
          break;
        case 'NAV_ADMIN_TELLER':
          e.preventDefault();
          navigate('/admin/teller-counter');
          break;
        case 'NAV_ADMIN_MOTHER_GROUPS':
          e.preventDefault();
          navigate('/admin/mother-groups');
          break;

        // Member Navigation
        case 'NAV_MEMBER_DASHBOARD':
          e.preventDefault();
          navigate('/member');
          break;
        case 'NAV_MEMBER_ACCOUNTS':
          e.preventDefault();
          navigate('/member/my-accounts-passbook');
          break;
        case 'NAV_MEMBER_LOANS':
          e.preventDefault();
          navigate('/member/loan-portfolio-repayments');
          break;
        case 'NAV_MEMBER_SHARES':
          e.preventDefault();
          navigate('/member/shares-fixed-deposits');
          break;
        case 'NAV_MEMBER_TRANSFERS':
          e.preventDefault();
          navigate('/member/transfers-payments');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [context, navigate, onCloseModals, showShortcutGuide, showTerminal, toggleLang]);

  return {
    showShortcutGuide,
    setShowShortcutGuide,
    toggleShortcutGuide,
    closeShortcutGuide,
    showTerminal,
    setShowTerminal,
    toggleTerminal,
    closeTerminal,
  };
}
