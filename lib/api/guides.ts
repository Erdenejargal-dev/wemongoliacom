import { apiClient } from './client'

export type GuideSpecialty =
  | 'Wildlife'
  | 'Trekking'
  | 'Cultural'
  | 'Photography'
  | 'BirdWatching'
  | 'Winter'
  | 'Fishing'
  | 'History'
  | 'Adventure'

export interface GuideReview {
  id:       string
  author:   string
  country:  string
  rating:   number
  comment:  string
  tourName: string | null
  date:     string
}

export interface GuideListItem {
  id:              string
  slug:            string
  name:            string
  bio:             string
  photo:           string
  coverImage:      string
  location:        string
  specialties:     GuideSpecialty[]
  languages:       string[]
  certified:       boolean
  yearsExperience: number
  totalGuests:     number
  dailyRate:       number | null
  dailyCurrency:   string | null
  ratingAverage:   number
  reviewsCount:    number
  verified:        boolean
}

export interface Guide extends GuideListItem {
  about:         string
  region:        string | null
  licenseNumber: string | null
  contactEmail:  string
  contactPhone:  string | null
  website:       string | null
  status:        string
  createdAt:     string
  reviews:       GuideReview[]
}

export interface GuideListParams {
  specialty?: GuideSpecialty
  language?:  string
  certified?: boolean
  location?:  string
  page?:      number
  limit?:     number
  sort?:      'rating' | 'newest' | 'experience'
}

export interface GuidesResponse {
  guides:     GuideListItem[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

export function fetchGuides(params?: GuideListParams): Promise<GuidesResponse> {
  const qs = new URLSearchParams()
  if (params?.specialty) qs.set('specialty', params.specialty)
  if (params?.language)  qs.set('language',  params.language)
  if (params?.certified !== undefined) qs.set('certified', String(params.certified))
  if (params?.location)  qs.set('location',  params.location)
  if (params?.page)      qs.set('page',       String(params.page))
  if (params?.limit)     qs.set('limit',      String(params.limit))
  if (params?.sort)      qs.set('sort',       params.sort)
  const query = qs.toString()
  return apiClient.get<GuidesResponse>(`/guides${query ? `?${query}` : ''}`)
}

export function fetchGuide(slug: string): Promise<Guide> {
  return apiClient.get<Guide>(`/guides/${slug}`)
}

// ── Inquiry (public) ──────────────────────────────────────────────────────

export interface InquiryPayload {
  travelerName:    string
  travelerEmail:   string
  travelerCountry?: string
  message:         string
  tripType?:       string
  daysRequested?:  number
  preferredStart?: string
}

export function createInquiry(slug: string, data: InquiryPayload): Promise<{ id: string }> {
  return apiClient.post<{ id: string }>(`/guides/${slug}/inquiries`, data)
}

// ── Guide Application ─────────────────────────────────────────────────────

export type GuideApplicationStatus = 'pending' | 'approved' | 'rejected'

export interface GuideApplication {
  id:              string
  userId:          string
  name:            string
  bio:             string
  about:           string
  location:        string
  specialties:     GuideSpecialty[]
  languages:       string[]
  yearsExperience: number
  dailyRate:       number | null
  dailyCurrency:   string | null
  contactEmail:    string
  contactPhone:    string | null
  idPhotoUrl:      string
  photoUrl:        string | null
  status:          GuideApplicationStatus
  rejectionReason: string | null
  reviewedAt:      string | null
  createdAt:       string
}

export interface GuideApplicationPayload {
  name:            string
  bio:             string
  about:           string
  location:        string
  specialties:     GuideSpecialty[]
  languages:       string[]
  yearsExperience: number
  dailyRate?:      number
  dailyCurrency?:  string
  contactEmail:    string
  contactPhone?:   string
  idPhotoUrl:      string
  photoUrl?:       string
}

export function submitGuideApplication(token: string, data: GuideApplicationPayload): Promise<GuideApplication> {
  return apiClient.post<GuideApplication>('/guide-applications', data, token)
}

export function fetchMyApplication(token: string): Promise<GuideApplication | null> {
  return apiClient.get<GuideApplication | null>('/guide-applications/mine', token)
}

// ── Guide Portal (guide_owner only) ───────────────────────────────────────

export type GuideInquiryStatus = 'new' | 'replied' | 'accepted' | 'declined'

export interface GuideInquiry {
  id:              string
  guideId:         string
  travelerName:    string
  travelerEmail:   string
  travelerCountry: string | null
  message:         string
  tripType:        string | null
  daysRequested:   number | null
  preferredStart:  string | null
  status:          GuideInquiryStatus
  guideReply:      string | null
  repliedAt:       string | null
  createdAt:       string
}

export interface GuideProfileUpdate {
  bio?:           string
  about?:         string
  photo?:         string
  coverImage?:    string
  location?:      string
  region?:        string
  specialties?:   GuideSpecialty[]
  languages?:     string[]
  dailyRate?:     number | null
  dailyCurrency?: string
  contactEmail?:  string
  contactPhone?:  string | null
  website?:       string | null
}

export interface GuideAnalytics {
  inquiriesTotal:    number
  inquiriesNew:      number
  inquiriesReplied:  number
  inquiriesAccepted: number
  responseRate:      number
  avgRating:         number
  reviewsCount:      number
}

interface PaginatedResponse<T> {
  data:       T[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

export function fetchMyGuideProfile(token: string): Promise<Guide> {
  return apiClient.get<Guide>('/guide-portal/profile', token)
}

export function updateMyGuideProfile(token: string, data: GuideProfileUpdate): Promise<Guide> {
  return apiClient.put<Guide>('/guide-portal/profile', data, token)
}

export function setGuideStatus(token: string, status: 'active' | 'paused'): Promise<Guide> {
  return apiClient.patch<Guide>('/guide-portal/profile/status', { status }, token)
}

export function fetchGuideInquiries(
  token: string,
  params?: { status?: GuideInquiryStatus; page?: number; limit?: number },
): Promise<PaginatedResponse<GuideInquiry>> {
  const qs = new URLSearchParams()
  if (params?.status) qs.set('status', params.status)
  if (params?.page)   qs.set('page',   String(params.page))
  if (params?.limit)  qs.set('limit',  String(params.limit))
  const q = qs.toString()
  return apiClient.get<PaginatedResponse<GuideInquiry>>(`/guide-portal/inquiries${q ? `?${q}` : ''}`, token)
}

export function replyToGuideInquiry(
  token: string,
  id: string,
  reply: string,
  status: GuideInquiryStatus = 'replied',
): Promise<GuideInquiry> {
  return apiClient.post<GuideInquiry>(`/guide-portal/inquiries/${id}/reply`, { reply, status }, token)
}

export function fetchMyGuideReviews(
  token: string,
  params?: { page?: number; limit?: number },
): Promise<PaginatedResponse<GuideReview>> {
  const qs = new URLSearchParams()
  if (params?.page)  qs.set('page',  String(params.page))
  if (params?.limit) qs.set('limit', String(params.limit))
  const q = qs.toString()
  return apiClient.get<PaginatedResponse<GuideReview>>(`/guide-portal/reviews${q ? `?${q}` : ''}`, token)
}

export function replyToGuideReview(token: string, id: string, reply: string): Promise<GuideReview> {
  return apiClient.patch<GuideReview>(`/guide-portal/reviews/${id}/reply`, { reply }, token)
}

export function fetchGuidePortalAnalytics(token: string): Promise<GuideAnalytics> {
  return apiClient.get<GuideAnalytics>('/guide-portal/analytics', token)
}

// ── Admin ──────────────────────────────────────────────────────────────────

type AdminGuideApplication = GuideApplication & {
  user: { id: string; firstName: string; lastName: string; email: string }
}

export function fetchAdminGuideApplications(
  token: string,
  params?: { status?: GuideApplicationStatus; page?: number },
): Promise<{ applications: AdminGuideApplication[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> {
  const qs = new URLSearchParams()
  if (params?.status) qs.set('status', params.status)
  if (params?.page)   qs.set('page',   String(params.page))
  const q = qs.toString()
  return apiClient.get(`/admin/guide-applications${q ? `?${q}` : ''}`, token)
}

export function approveGuideApplication(token: string, id: string): Promise<{ success: boolean }> {
  return apiClient.post(`/admin/guide-applications/${id}/approve`, {}, token)
}

export function rejectGuideApplication(token: string, id: string, reason: string): Promise<GuideApplication> {
  return apiClient.post(`/admin/guide-applications/${id}/reject`, { reason }, token)
}
