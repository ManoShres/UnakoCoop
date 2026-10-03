import React from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { Permission, hasPermission, hasAnyPermission, roleLabel } from '../../utils/permissions';
import { useLanguageStore } from '../../store/useLanguageStore';
import { ShieldAlert } from 'lucide-react';

export interface RequirePermissionProps {
  permission?: Permission;
  permissions?: Permission[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * RBAC Element & View Guard.
 * Conditionally renders children only if the authenticated staff member
 * possesses the requisite permission under Unako SACCOS role-based access policy.
 */
export const RequirePermission: React.FC<RequirePermissionProps> = ({
  permission,
  permissions,
  fallback,
  children,
}) => {
  const { staffRole, role } = useAuthStore();
  const { t, lang } = useLanguageStore();

  if (role !== 'ADMIN') {
    return <>{fallback || null}</>;
  }

  // Super Admin always bypasses fine-grained restrictions
  if (!staffRole || staffRole === 'SUPER_ADMIN') {
    return <>{children}</>;
  }

  const granted = permission
    ? hasPermission(staffRole, permission)
    : permissions
    ? hasAnyPermission(staffRole, permissions)
    : true;

  if (granted) {
    return <>{children}</>;
  }

  if (fallback !== undefined) {
    return <>{fallback}</>;
  }

  const langKey = lang === 'en' ? 'en' : 'ne';

  return (
    <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 flex items-center gap-3 text-xs">
      <ShieldAlert className="size-5 shrink-0 text-amber-600" />
      <div>
        <p className="font-bold">
          {t('पहुँच अनुमति छैन', 'Access Restricted')}
        </p>
        <p className="text-[11px] opacity-80">
          {t(
            `तपाईंको भूमिका (${roleLabel(staffRole, langKey)}) सँग यो कार्य सम्पादन गर्ने अनुमति छैन।`,
            `Your assigned CBS role (${roleLabel(staffRole, langKey)}) does not have permission to execute this operation.`
          )}
        </p>
      </div>
    </div>
  );
};
