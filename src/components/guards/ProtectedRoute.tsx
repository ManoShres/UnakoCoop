import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import type { UserRole } from '../../types';

interface ProtectedRouteProps {
  /** Which roles are allowed to access this route. */
  readonly allowedRoles: readonly UserRole[];
  /** Where to redirect when the user lacks access. Defaults to `/login`. */
  readonly redirectTo?: string;
  /** The child route content to render when access is granted. */
  readonly children: React.ReactNode;
}

/**
 * Route guard that checks the current auth role against a whitelist.
 *
 * Usage:
 * ```tsx
 * <Route
 *   path="/admin"
 *   element={
 *     <ProtectedRoute allowedRoles={['ADMIN']}>
 *       <AdminLayout />
 *     </ProtectedRoute>
 *   }
 * />
 * ```
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  redirectTo = '/login',
  children,
}) => {
  const { role, authLoading } = useAuthStore();
  const location = useLocation();

  // While the persisted session is still resolving, show nothing (the App-level
  // splash screen already covers this, but we guard defensively).
  if (authLoading) {
    return null;
  }

  if (!allowedRoles.includes(role)) {
    // Preserve the attempted URL so the login page can redirect back after auth.
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
