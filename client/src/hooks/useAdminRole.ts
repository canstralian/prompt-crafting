import { useAuth } from '@/hooks/useAuth';

export function useAdminRole() {
  const { user, loading } = useAuth();
  const isAdmin = user?.role === 'admin';

  return { isAdmin, loading };
}
