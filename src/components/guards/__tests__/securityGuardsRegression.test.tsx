/**
 * Regression tests for the RBAC guards (task-6 items 2 & 3).
 *
 * These lock in FAIL-CLOSED behaviour: a partially-resolved ADMIN session
 * (staffRole === null/undefined) must NEVER render permission- or role-gated
 * children, and a GUEST must never reach an ADMIN route.
 *
 * The guards read their session from `useAuthStore()`. Tests render with
 * react-dom/server, which uses zustand's *server* snapshot (always the initial
 * state), so the store hook is mocked here and driven directly - that is exactly
 * the guard's unit boundary.
 */
import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import type { EmployeeAccessRole, UserRole } from '../../../types';

const harness = vi.hoisted(() => ({
  session: { role: 'GUEST', staffRole: null } as {
    role: string;
    staffRole: string | null;
  },
}));

vi.mock('../../../store/useAuthStore', () => ({
  useAuthStore: () => harness.session,
}));

vi.mock('../../../store/useLanguageStore', () => ({
  useLanguageStore: () => ({ t: (_ne: unknown, en: unknown) => en, lang: 'en' }),
}));

import { RequirePermission } from '../RequirePermission';
import { ProtectedRoute } from '../ProtectedRoute';

const GUARDED = 'GUARDED-ADMIN-CONTENT';
const FALLBACK = 'ACCESS-DENIED-FALLBACK';

const setSession = (role: UserRole, staffRole: EmployeeAccessRole | null) => {
  harness.session = { role, staffRole };
};

const render = (node: React.ReactNode) =>
  renderToStaticMarkup(<MemoryRouter initialEntries={['/admin']}>{node}</MemoryRouter>);

const renderPermission = (
  props: Partial<React.ComponentProps<typeof RequirePermission>> = {}
) =>
  render(
    <RequirePermission permission="manage_settings" {...props}>
      <span>{GUARDED}</span>
    </RequirePermission>
  );

const renderRoute = (props: Partial<React.ComponentProps<typeof ProtectedRoute>> = {}) =>
  render(
    <ProtectedRoute allowedRoles={['ADMIN']} {...props}>
      <span>{GUARDED}</span>
    </ProtectedRoute>
  );

beforeEach(() => setSession('GUEST', null));

describe('RequirePermission fails CLOSED', () => {
  it('does NOT render gated children for role=ADMIN with staffRole=null', () => {
    setSession('ADMIN', null);
    const html = renderPermission();
    expect(html).not.toContain(GUARDED);
    expect(html).toContain('Access Restricted');
  });

  it('renders the explicit fallback instead of children when staffRole is null', () => {
    setSession('ADMIN', null);
    const html = renderPermission({ fallback: <span>{FALLBACK}</span> });
    expect(html).not.toContain(GUARDED);
    expect(html).toContain(FALLBACK);
  });

  it('treats an undefined staffRole the same as null', () => {
    harness.session = { role: 'ADMIN', staffRole: undefined as unknown as null };
    expect(renderPermission()).not.toContain(GUARDED);
  });

  it('still lets SUPER_ADMIN bypass fine-grained checks', () => {
    setSession('ADMIN', 'SUPER_ADMIN');
    expect(renderPermission()).toContain(GUARDED);
  });

  it('denies a staff role that lacks the permission', () => {
    setSession('ADMIN', 'TELLER');
    expect(renderPermission()).not.toContain(GUARDED);
  });

  it('grants a staff role that holds the permission', () => {
    setSession('ADMIN', 'TELLER');
    expect(renderPermission({ permission: 'process_transactions' })).toContain(GUARDED);
  });

  it('never renders gated children for a GUEST session', () => {
    setSession('GUEST', null);
    expect(renderPermission()).not.toContain(GUARDED);
  });

  it('never renders gated children for a MEMBER session', () => {
    setSession('MEMBER', null);
    expect(renderPermission()).not.toContain(GUARDED);
  });
});

describe('ProtectedRoute fails CLOSED', () => {
  it('keeps a GUEST out of an ADMIN route', () => {
    expect(renderRoute()).not.toContain(GUARDED);
  });

  it('keeps a GUEST out of a permission-gated ADMIN route', () => {
    expect(renderRoute({ requiredPermission: 'manage_settings' })).not.toContain(GUARDED);
  });

  it('keeps a partially-resolved ADMIN (staffRole=null) out of an ADMIN route', () => {
    setSession('ADMIN', null);
    expect(renderRoute()).not.toContain(GUARDED);
  });

  it('keeps a partially-resolved ADMIN (staffRole=null) out of a permission-gated route', () => {
    setSession('ADMIN', null);
    expect(renderRoute({ requiredPermission: 'manage_settings' })).not.toContain(GUARDED);
  });

  it('allows SUPER_ADMIN supervisory access', () => {
    setSession('ADMIN', 'SUPER_ADMIN');
    expect(renderRoute({ requiredPermission: 'manage_settings' })).toContain(GUARDED);
  });

  it('denies a staff role without the required permission', () => {
    setSession('ADMIN', 'TELLER');
    expect(renderRoute({ requiredPermission: 'manage_settings' })).not.toContain(GUARDED);
  });

  it('grants a staff role that holds the required permission (field collector route)', () => {
    setSession('ADMIN', 'FIELD_OFFICER');
    expect(renderRoute({ requiredPermission: 'record_mother_group_meetings' })).toContain(GUARDED);
  });

  it('enforces allowedStaffRoles', () => {
    setSession('ADMIN', 'TELLER');
    expect(renderRoute({ allowedStaffRoles: ['FIELD_OFFICER'] })).not.toContain(GUARDED);
  });
});
