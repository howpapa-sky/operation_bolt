import { createContext, useContext, ReactNode } from 'react';
import { useAuth, User } from '../hooks/useAuth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  isViewer: boolean;
  isManager: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  canManageProjects: boolean;
  canManageTasks: boolean;
  canManageUsers: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();

  const isViewer = auth.user?.role === 'viewer';
  const isManager = auth.user?.role === 'manager';
  const isAdmin = auth.user?.role === 'admin';
  const isSuperAdmin = auth.user?.role === 'super_admin';

  const canManageProjects = isManager || isAdmin || isSuperAdmin;
  const canManageTasks = isManager || isAdmin || isSuperAdmin;
  const canManageUsers = isSuperAdmin;

  return (
    <AuthContext.Provider
      value={{
        ...auth,
        isViewer,
        isManager,
        isAdmin,
        isSuperAdmin,
        canManageProjects,
        canManageTasks,
        canManageUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
