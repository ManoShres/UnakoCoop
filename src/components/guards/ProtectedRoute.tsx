import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import type { EmployeeAccessRole, UserRole } from '../../types';
import { Permission, hasPermission, hasAnyPermission } from '../../utils/permissions';

export interface ProtectedRouteProps {
  /** Which high-level user roles are allowed to access this route (e.g. ['ADMIN']). */
  readonly allowedRoles: readonly UserRole[];
  /** Optional specific staff permission required under RBAC policy. */
  readonly requiredPermission?: Permission;
  /** Optional list of permissions (any one suffices). */
  readonly requiredPermissions?: readonly Permission[];
  /** Optional specific staff roles permitted (e.g. ['TELLER', 'FIELD_OFFICER']). */
  readonly allowedStaffRoles?: readonly EmployeeAccessRole[];
  /** Where to redirect when the user lacks access. Defaults to `/login`. */
  readonly redirectTo?: string;
  /** The child route content to render when access is granted. */
  readonly children: React.ReactNode;
}

/**
 * Route guard that checks auth role and fine-grained staff permissions.
 *
 * Usage:
 * ```tsx
 * <Route
 *   path="/field"
 *   element={
 *     <ProtectedRoute allowedRoles={['ADMIN']} requiredPermission="record_mother_group_meetings">
 *       <FieldCollectorPage />
 *     </ProtectedRoute>
 *   }
 * />
 * ```
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  requiredPermission,
  requiredPermissions,
  allowedStaffRoles,
  redirectTo = '/login',
  children,
}) => {
  const { role, staffRole, authLoading } = useAuthStore();
  const location = useLocation();

  // While the persisted session is still resolving, show nothing.
  if (authLoading) {
    return null;
  }

  // 1. High-level role check (MEMBER, ADMIN, GUEST)
  if (!allowedRoles.includes(role)) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // 2. Fine-grained RBAC permission check for staff
  if (role === 'ADMIN') {
    // Super admin retains supervisory access to all administrative routes
    if (staffRole && staffRole !== 'SUPER_ADMIN') {
      if (allowedStaffRoles && !allowedStaffRoles.includes(staffRole)) {
        return <Navigate to="/admin" replace />;
      }

      if (requiredPermission && !hasPermission(staffRole, requiredPermission)) {
        return <Navigate to="/admin" replace />;
      }

      if (
        requiredPermissions &&
        !hasAnyPermission(staffRole, requiredPermissions as Permission[])
      ) {
        return <Navigate to="/admin" replace />;
      }
    }
  }

  return <>{children}</>;
};
