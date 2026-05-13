import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export type ProviderReview = {
  id: string;
  rating: number;
  title?: string;
  comment?: string;
  providerReply?: string;
  createdAt: string;
  listingType: string;
  listingId: string;
  reviewer: {
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
};

export function useProviderReviews() {
  return useQuery<{ data: ProviderReview[]; total: number }>({
    queryKey: ['provider', 'reviews'],
    queryFn: () => api.get('/provider/reviews').then((r) => r.data),
  });
}

export function useReplyToReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reply }: { id: string; reply: string }) =>
      api.patch(`/provider/reviews/${id}/reply`, { reply }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['provider', 'reviews'] }),
  });
}
