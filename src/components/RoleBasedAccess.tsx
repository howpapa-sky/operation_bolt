import { ReactNode } from 'react';
import { useAuthContext } from '../contexts/AuthContext';

interface RoleBasedAccessProps {
  children: ReactNode;
  allowedRoles?: ('viewer' | 'manager' | 'admin' | 'super_admin')[];
  requireAdmin?: boolean;
  requireSuperAdmin?: boolean;
  fallback?: ReactNode;
}

export function RoleBasedAccess({
  children,
  allowedRoles,
  requireAdmin = false,
  requireSuperAdmin = false,
  fallback = null,
}: RoleBasedAccessProps) {
  const { user, isAdmin, isSuperAdmin } = useAuthContext();

  if (!user) {
    return <>{fallback}</>;
  }

  if (requireSuperAdmin && !isSuperAdmin) {
    return <>{fallback}</>;
  }

  if (requireAdmin && !isAdmin && !isSuperAdmin) {
    return <>{fallback}</>;
  }

  if (allowedRoles && !allowedRoles.includes(user.role as any)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
