import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export type ProviderAnalytics = {
  bookings: {
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
  };
  revenue: {
    total:          { byCurrency: Record<string, number>; normalizedMnt: number | null };
    thisMonth:      { byCurrency: Record<string, number>; normalizedMnt: number | null; count: number };
    lastMonth:      { byCurrency: Record<string, number>; normalizedMnt: number | null; count: number };
    thisMonthCount: number;
    lastMonthCount: number;
  };
  reviews: {
    total: number;
    avgRating: number;
  };
};

export type ProviderProfile = {
  id: string;
  name: string;
  tagline?: string;
  description?: string;
  logoUrl?: string;
  coverUrl?: string;
  phone?: string;
  email?: string;
  websiteUrl?: string;
  address?: string;
  city?: string;
  country?: string;
  verificationStatus: string;
};

export type ProviderLimits = {
  plan: string;
  toursUsed: number;
  toursLimit: number;
  accommodationsUsed: number;
  accommodationsLimit: number;
};

export function useProviderAnalytics() {
  return useQuery<ProviderAnalytics>({
    queryKey: ['provider', 'analytics'],
    queryFn: () => api.get('/provider/analytics').then((r) => r.data),
    staleTime: 60_000,
  });
}

export function useProviderProfile() {
  return useQuery<ProviderProfile>({
    queryKey: ['provider', 'profile'],
    queryFn: () => api.get('/provider/profile').then((r) => r.data),
  });
}

export function useProviderLimits() {
  return useQuery<ProviderLimits>({
    queryKey: ['provider', 'limits'],
    queryFn: () => api.get('/provider/limits').then((r) => r.data),
  });
}

export function useUpdateProviderProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<ProviderProfile>) => api.put('/provider/profile', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['provider', 'profile'] }),
  });
}
