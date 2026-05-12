import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ApiList, Stay } from '@/types/api';

export function useStays(params?: { limit?: number; page?: number }) {
  return useQuery<ApiList<Stay>>({
    queryKey: ['stays', params],
    queryFn: () => api.get('/stays', { params }).then((r) => r.data),
  });
}

export function useStay(slug: string) {
  return useQuery<Stay>({
    queryKey: ['stay', slug],
    queryFn: () => api.get(`/stays/${slug}`).then((r) => r.data),
    enabled: !!slug,
  });
}
