import { useQuery } from '@tanstack/react-query';

interface AdminStats {
  totalUsers: number;
  totalPosts: number;
  totalCategories: number;
  totalAdmins: number;
}

export function useAdminStats() {
  return useQuery<AdminStats>({
    queryKey: ['/api/admin/stats'],
  });
}
