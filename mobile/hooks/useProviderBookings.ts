import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export type ProviderBooking = {
  id: string;
  bookingCode: string;
  bookingStatus: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  listingType: 'tour' | 'vehicle' | 'accommodation';
  listingId: string;
  startDate: string;
  endDate?: string | null;
  guests: number;
  totalAmount: number;
  currency: string;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
    avatarUrl?: string | null;
  };
};

export type BookingStatusFilter = 'pending' | 'confirmed' | 'completed' | 'cancelled' | undefined;

type BookingsResponse = {
  data: ProviderBooking[];
  pagination: { page: number; limit: number; total: number; pages: number };
};

export function useProviderBookings(status?: BookingStatusFilter) {
  return useQuery<BookingsResponse>({
    queryKey: ['provider', 'bookings', status],
    queryFn: () =>
      api.get('/provider/bookings', { params: status ? { bookingStatus: status } : {} }).then((r) => r.data),
  });
}

export function useProviderBooking(code: string) {
  return useQuery<ProviderBooking>({
    queryKey: ['provider', 'booking', code],
    queryFn: () =>
      api.get('/provider/bookings', { params: { limit: 100 } }).then((r) => {
        const list: ProviderBooking[] = r.data?.data ?? [];
        const found = list.find((b) => b.bookingCode === code);
        if (!found) throw new Error('Booking not found');
        return found;
      }),
    enabled: !!code,
  });
}

export function useCompleteBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => api.patch(`/provider/bookings/${code}/complete`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['provider', 'bookings'] }),
  });
}

export function useCancelBookingByProvider() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ code, reason }: { code: string; reason?: string }) =>
      api.patch(`/provider/bookings/${code}/cancel`, { reason }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['provider', 'bookings'] }),
  });
}
