import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export type RoomType = {
  id: string;
  accommodationId: string;
  name: string;
  description?: string | null;
  maxGuests?: number | null;
  bedType?: string | null;
  quantity?: number | null;
  basePricePerNight?: number | null;
  currency?: string | null;
  baseAmount?: number | null;
  baseCurrency?: string | null;
  amenities?: string[];
  images?: { id: string; imageUrl: string }[];
};

export type RoomAvailabilityRecord = {
  id: string | null;
  roomTypeId: string;
  date: string;                                          // YYYY-MM-DD
  availableUnits: number;
  bookedUnits: number;
  priceOverride: number | null;
  baseOverrideAmount: number | null;
  baseOverrideCurrency: string | null;
  status: 'available' | 'sold_out' | 'blocked';
};

export type CreateRoomInput = {
  name: string;
  description?: string;
  maxGuests?: number;
  bedType?: string;
  quantity?: number;
  baseAmount: number;
  baseCurrency: 'USD' | 'MNT';
  amenities?: string[];
};

export type UpdateRoomInput = Partial<Omit<CreateRoomInput, 'baseAmount' | 'baseCurrency'>> & {
  baseAmount?: number;
  baseCurrency?: 'USD' | 'MNT';
};

// ─── Room type hooks ──────────────────────────────────────────────────────────

export function useCreateRoom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ accId, data }: { accId: string; data: CreateRoomInput }) =>
      api.post(`/provider/accommodations/${accId}/rooms`, data).then((r) => r.data),
    onSuccess: (_, { accId }) => {
      qc.invalidateQueries({ queryKey: ['provider', 'accommodation', accId] });
    },
  });
}

export function useUpdateRoom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ accId, roomId, data }: { accId: string; roomId: string; data: UpdateRoomInput }) =>
      api.put(`/provider/accommodations/${accId}/rooms/${roomId}`, data).then((r) => r.data),
    onSuccess: (_, { accId }) => {
      qc.invalidateQueries({ queryKey: ['provider', 'accommodation', accId] });
    },
  });
}

export function useDeleteRoom() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ accId, roomId }: { accId: string; roomId: string }) =>
      api.delete(`/provider/accommodations/${accId}/rooms/${roomId}`).then((r) => r.data),
    onSuccess: (_, { accId }) => {
      qc.invalidateQueries({ queryKey: ['provider', 'accommodation', accId] });
    },
  });
}

// ─── Availability hooks ───────────────────────────────────────────────────────

export function useRoomAvailability(
  accId: string,
  roomId: string,
  startDate: string,
  endDate: string,
) {
  return useQuery<RoomAvailabilityRecord[]>({
    queryKey: ['provider', 'accommodation', accId, 'room', roomId, 'avail', startDate],
    queryFn: () =>
      api
        .get(`/provider/accommodations/${accId}/rooms/${roomId}/availability`, {
          params: { startDate, endDate },
        })
        .then((r) => r.data),
    enabled: !!accId && !!roomId && !!startDate && !!endDate,
    staleTime: 30_000,
  });
}

export function useUpdateAvailabilityDay() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      accId,
      roomId,
      date,
      status,
      baseOverrideAmount,
      baseOverrideCurrency,
    }: {
      accId: string;
      roomId: string;
      date: string;
      status: 'available' | 'blocked';
      baseOverrideAmount?: number | null;
      baseOverrideCurrency?: string | null;
    }) =>
      api
        .patch(`/provider/accommodations/${accId}/rooms/${roomId}/availability/${date}`, {
          status,
          baseOverrideAmount,
          baseOverrideCurrency,
        })
        .then((r) => r.data),
    onSuccess: (_, { accId, roomId }) => {
      qc.invalidateQueries({
        queryKey: ['provider', 'accommodation', accId, 'room', roomId, 'avail'],
      });
    },
  });
}

export function useUpdateAvailabilityRange() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      accId,
      roomId,
      startDate,
      endDate,
      status,
    }: {
      accId: string;
      roomId: string;
      startDate: string;
      endDate: string;
      status: 'available' | 'blocked';
    }) =>
      api
        .patch(`/provider/accommodations/${accId}/rooms/${roomId}/availability/range`, {
          startDate,
          endDate,
          status,
        })
        .then((r) => r.data),
    onSuccess: (_, { accId, roomId }) => {
      qc.invalidateQueries({
        queryKey: ['provider', 'accommodation', accId, 'room', roomId, 'avail'],
      });
    },
  });
}
