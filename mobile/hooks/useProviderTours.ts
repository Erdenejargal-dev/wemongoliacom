import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export type ProviderTour = {
  id: string;
  title: string;
  shortDescription?: string;
  description?: string;
  durationDays?: number;
  baseAmount?: number;
  baseCurrency?: string;
  basePrice?: number;
  currency?: string;
  status: 'draft' | 'active' | 'paused';
  destinationId?: string;
  images?: { id: string; imageUrl: string; altText?: string }[];
};

export type CreateTourInput = {
  title: string;
  shortDescription?: string;
  durationDays?: number;
  baseAmount: number;
  baseCurrency: 'MNT' | 'USD';
  destinationId?: string;
  status?: 'draft' | 'active';
};

export function useProviderTours(status?: 'draft' | 'active' | 'paused') {
  return useQuery<{ data: ProviderTour[]; total: number }>({
    queryKey: ['provider', 'tours', status],
    queryFn: () =>
      api.get('/provider/tours', { params: status ? { status } : {} }).then((r) => r.data),
  });
}

export function useProviderTour(tourId: string) {
  return useQuery<ProviderTour>({
    queryKey: ['provider', 'tour', tourId],
    queryFn: () => api.get(`/provider/tours/${tourId}`).then((r) => r.data),
    enabled: !!tourId,
  });
}

export function useCreateTour() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTourInput) => api.post('/provider/tours', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['provider', 'tours'] }),
  });
}

export function useUpdateTour() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProviderTour> }) =>
      api.put(`/provider/tours/${id}`, data).then((r) => r.data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['provider', 'tours'] });
      qc.invalidateQueries({ queryKey: ['provider', 'tour', id] });
    },
  });
}

export function useArchiveTour() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/provider/tours/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['provider', 'tours'] }),
  });
}

// ─── Accommodation ─────────────────────────────────────────────────────────

export type ProviderAccommodation = {
  id: string;
  name: string;
  slug?: string;
  status: 'draft' | 'active' | 'paused';
  accommodationType?: string;
  description?: string;
  address?: string;
  city?: string;
  region?: string;
  latitude?: number | null;
  longitude?: number | null;
  checkInTime?: string | null;
  checkOutTime?: string | null;
  amenities?: string[];
  cancellationPolicy?: string | null;
  starRating?: number | null;
  ratingAverage?: number | null;
  reviewsCount?: number;
  images?: { id: string; imageUrl: string; altText?: string }[];
  destination?: { id: string; name: string; slug: string } | null;
  // detail-only fields
  roomTypes?: import('./useProviderAccommodation').RoomType[];
  _count?: { roomTypes: number; images: number };
};

export function useProviderAccommodations() {
  return useQuery<{ data: ProviderAccommodation[]; total: number }>({
    queryKey: ['provider', 'accommodations'],
    queryFn: () => api.get('/provider/accommodations').then((r) => r.data),
  });
}

export function useProviderAccommodation(accId: string) {
  return useQuery<ProviderAccommodation>({
    queryKey: ['provider', 'accommodation', accId],
    queryFn: () => api.get(`/provider/accommodations/${accId}`).then((r) => r.data),
    enabled: !!accId,
  });
}

export function useUpdateAccommodation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProviderAccommodation> }) =>
      api.put(`/provider/accommodations/${id}`, data).then((r) => r.data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['provider', 'accommodations'] });
      qc.invalidateQueries({ queryKey: ['provider', 'accommodation', id] });
    },
  });
}

export function useArchiveAccommodation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/provider/accommodations/${id}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['provider', 'accommodations'] });
    },
  });
}
