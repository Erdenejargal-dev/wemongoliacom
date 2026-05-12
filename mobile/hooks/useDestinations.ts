import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ApiList, Destination } from '@/types/api';

export function useDestinations(params?: { limit?: number; page?: number }) {
  return useQuery<ApiList<Destination>>({
    queryKey: ['destinations', params],
    queryFn: () =>
      api.get('/destinations', { params }).then((r) => r.data),
  });
}

export function useDestination(slug: string) {
  return useQuery<Destination>({
    queryKey: ['destination', slug],
    queryFn: () => api.get(`/destinations/${slug}`).then((r) => r.data),
    enabled: !!slug,
  });
}
