import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { ApiList, Vehicle } from '@/types/api';

export function useVehicles(params?: { limit?: number; page?: number }) {
  return useQuery<ApiList<Vehicle>>({
    queryKey: ['vehicles', params],
    queryFn: () => api.get('/vehicles', { params }).then((r) => r.data),
  });
}

export function useVehicle(slug: string) {
  return useQuery<Vehicle>({
    queryKey: ['vehicle', slug],
    queryFn: () => api.get(`/vehicles/${slug}`).then((r) => r.data),
    enabled: !!slug,
  });
}
