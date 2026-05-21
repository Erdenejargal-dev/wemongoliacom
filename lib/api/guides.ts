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
