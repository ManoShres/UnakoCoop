import { describe, it, expect } from 'vitest';
import { resolveShortcutAction, isInputFocused } from '../useKeyboardShortcuts';

describe('keyboardShortcuts action resolution', () => {
  it('resolves Escape to CLOSE_MODALS in any context', () => {
    const action = resolveShortcutAction({
      key: 'Escape',
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
      metaKey: false,
      isInput: false,
    });
    expect(action).toBe('CLOSE_MODALS');

    // Even if isInput is true, Escape should close modals
    const actionInInput = resolveShortcutAction({
      key: 'Escape',
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
      metaKey: false,
      isInput: true,
    });
    expect(actionInInput).toBe('CLOSE_MODALS');
  });

  it('resolves Ctrl+Shift+L to TOGGLE_LANG in any context', () => {
    const action = resolveShortcutAction({
      key: 'l',
      ctrlKey: true,
      shiftKey: true,
      altKey: false,
      metaKey: false,
      isInput: false,
    });
    expect(action).toBe('TOGGLE_LANG');

    // Also supports Meta+Shift+L on Mac
    const macAction = resolveShortcutAction({
      key: 'L',
      ctrlKey: false,
      shiftKey: true,
      altKey: false,
      metaKey: true,
      isInput: true,
    });
    expect(macAction).toBe('TOGGLE_LANG');
  });

  it('resolves ? to TOGGLE_GUIDE when not typing in input', () => {
    const action = resolveShortcutAction({
      key: '?',
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
      metaKey: false,
      isInput: false,
    });
    expect(action).toBe('TOGGLE_GUIDE');

    // Ignores ? when user is typing in form field
    const typingAction = resolveShortcutAction({
      key: '?',
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
      metaKey: false,
      isInput: true,
    });
    expect(typingAction).toBeNull();
  });

  it('resolves Ctrl+K and / to FOCUS_SEARCH when not in input', () => {
    const ctrlK = resolveShortcutAction({
      key: 'k',
      ctrlKey: true,
      shiftKey: false,
      altKey: false,
      metaKey: false,
      isInput: false,
    });
    expect(ctrlK).toBe('FOCUS_SEARCH');

    const slash = resolveShortcutAction({
      key: '/',
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
      metaKey: false,
      isInput: false,
    });
    expect(slash).toBe('FOCUS_SEARCH');

    // Ignored when typing in input
    const slashInInput = resolveShortcutAction({
      key: '/',
      ctrlKey: false,
      shiftKey: false,
      altKey: false,
      metaKey: false,
      isInput: true,
    });
    expect(slashInInput).toBeNull();
  });

  it('resolves Alt+H to NAV_PUBLIC', () => {
    const action = resolveShortcutAction({
      key: 'h',
      ctrlKey: false,
      shiftKey: false,
      altKey: true,
      metaKey: false,
      isInput: false,
    });
    expect(action).toBe('NAV_PUBLIC');
  });

  it('resolves Admin navigation shortcuts in ADMIN context', () => {
    const testCases: [string, string][] = [
      ['d', 'NAV_ADMIN_DASHBOARD'],
      ['m', 'NAV_ADMIN_MEMBERS'],
      ['s', 'NAV_ADMIN_SAVINGS'],
      ['l', 'NAV_ADMIN_LOANS'],
      ['t', 'NAV_ADMIN_TELLER'],
      ['g', 'NAV_ADMIN_MOTHER_GROUPS'],
    ];

    for (const [key, expectedAction] of testCases) {
      const action = resolveShortcutAction(
        {
          key,
          ctrlKey: false,
          shiftKey: false,
          altKey: true,
          metaKey: false,
          isInput: false,
        },
        'ADMIN'
      );
      expect(action).toBe(expectedAction);
    }
  });

  it('resolves Member navigation shortcuts in MEMBER context', () => {
    const testCases: [string, string][] = [
      ['d', 'NAV_MEMBER_DASHBOARD'],
      ['m', 'NAV_MEMBER_ACCOUNTS'],
      ['l', 'NAV_MEMBER_LOANS'],
      ['s', 'NAV_MEMBER_SHARES'],
      ['t', 'NAV_MEMBER_TRANSFERS'],
    ];

    for (const [key, expectedAction] of testCases) {
      const action = resolveShortcutAction(
        {
          key,
          ctrlKey: false,
          shiftKey: false,
          altKey: true,
          metaKey: false,
          isInput: false,
        },
        'MEMBER'
      );
      expect(action).toBe(expectedAction);
    }
  });

  it('correctly detects input focus via isInputFocused', () => {
    expect(isInputFocused(null)).toBe(false);
    expect(isInputFocused({} as any)).toBe(false);
  });
});
