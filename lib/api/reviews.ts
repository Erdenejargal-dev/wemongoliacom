import { apiClient, ApiError } from './client'

export interface BackendMyTourReview {
  id: string
  tourSlug: string
  tourTitle: string
  tourImage: string | null
  rating: number
  comment: string | null
  date: string
}

export async function fetchMyTourReviews(token: string): Promise<BackendMyTourReview[]> {
  const res = await apiClient.get<{ data: BackendMyTourReview[] }>('/reviews/me', token, { cache: 'no-store' })
  return res.data ?? []
}

export async function updateMyTourReview(
  token: string,
  reviewId: string,
  payload: { rating: number; title?: string; comment?: string },
): Promise<BackendMyTourReview> {
  return apiClient.patch<BackendMyTourReview>(`/reviews/${reviewId}`, payload, token)
}

export async function deleteMyTourReview(token: string, reviewId: string): Promise<void> {
  await apiClient.delete<void>(`/reviews/${reviewId}`, token)
}

export { ApiError }

