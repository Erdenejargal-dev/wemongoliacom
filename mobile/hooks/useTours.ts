import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ApiList, Tour } from '@/types/api';

type TourFilters = {
  destination?: string;
  minPrice?: number;
  maxPrice?: number;
  duration?: number;
  page?: number;
  limit?: number;
};

export function useTours(filters?: TourFilters) {
  return useQuery<ApiList<Tour>>({
    queryKey: ['tours', filters],
    queryFn: () => api.get('/tours', { params: filters }).then((r) => r.data),
  });
}

export function useTour(slug: string) {
  return useQuery<Tour>({
    queryKey: ['tour', slug],
    queryFn: () => api.get(`/tours/${slug}`).then((r) => r.data),
    enabled: !!slug,
  });
}
