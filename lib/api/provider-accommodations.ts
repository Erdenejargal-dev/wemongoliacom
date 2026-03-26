/**
 * Frontend helpers for provider accommodation endpoints.
 * All shapes verified against backend/src/services/provider-accommodation.service.ts
 */

import { apiClient } from './client'

// ── Types ──────────────────────────────────────────────────────────────────

export interface AccommodationListItem {
  id:                string
  slug:              string
  name:              string
  description:       string | null
  accommodationType: string
  starRating:        number | null
  ratingAverage:     number
  reviewsCount:      number
  status:            string
  createdAt:         string
  updatedAt:         string
  images:            { imageUrl: string }[]
  destination:       { id: string; name: string; slug: string } | null
  _count:            { roomTypes: number; images: number }
}

export interface AccommodationImage {
  id:        string
  imageUrl:  string
  publicId:  string | null
  altText:   string | null
  sortOrder: number
}

export interface RoomTypeItem {
  id:                string
  accommodationId:   string
  name:              string
  description:       string | null
  maxGuests:         number
  bedType:           string | null
  quantity:          number
  basePricePerNight: number
  currency:          string
  amenities:         string[]
  createdAt:         string
  updatedAt:         string
  activeBookings?:   number
}

export interface AccommodationReadiness {
  ready:   boolean
  missing: string[]
}

export interface AccommodationDetail extends AccommodationListItem {
  providerId:         string
  address:            string | null
  city:               string | null
  region:             string | null
  latitude:           number | null
  longitude:          number | null
  checkInTime:        string | null
  checkOutTime:       string | null
  amenities:          string[]
  cancellationPolicy: string | null
  images:             AccommodationImage[]
  roomTypes:          RoomTypeItem[]
  readiness:          AccommodationReadiness
}

export interface CreateAccommodationInput {
  name:               string
  accommodationType:  string
  destinationId?:     string
  description?:       string
  address?:           string
  city?:              string
  region?:            string
  latitude?:          number
  longitude?:         number
  checkInTime?:       string
  checkOutTime?:      string
  amenities?:         string[]
  cancellationPolicy?: string
  starRating?:        number
  status?:            'draft' | 'active' | 'paused'
}

export interface UpdateAccommodationInput {
  name?:               string
  accommodationType?:  string
  destinationId?:      string | null
  description?:        string
  address?:            string
  city?:               string
  region?:             string
  latitude?:           number | null
  longitude?:          number | null
  checkInTime?:        string
  checkOutTime?:       string
  amenities?:          string[]
  cancellationPolicy?: string
  starRating?:         number | null
  status?:             'draft' | 'active' | 'paused'
}

export interface CreateRoomTypeInput {
  name:              string
  description?:      string
  maxGuests?:        number
  bedType?:          string
  quantity?:         number
  basePricePerNight: number
  currency?:         string
  amenities?:        string[]
}

export interface UpdateRoomTypeInput {
  name?:              string
  description?:       string
  maxGuests?:         number
  bedType?:           string
  quantity?:          number
  basePricePerNight?: number
  currency?:          string
  amenities?:         string[]
}

// ── Property CRUD ──────────────────────────────────────────────────────────

export async function fetchProviderAccommodations(token: string): Promise<{ data: AccommodationListItem[] }> {
  return apiClient.get<{ data: AccommodationListItem[] }>('/provider/accommodations', token)
}

export async function createProviderAccommodation(token: string, input: CreateAccommodationInput): Promise<AccommodationListItem> {
  return apiClient.post<AccommodationListItem>('/provider/accommodations', input, token)
}

export async function fetchProviderAccommodation(token: string, accId: string): Promise<AccommodationDetail> {
  return apiClient.get<AccommodationDetail>(`/provider/accommodations/${accId}`, token)
}

export async function updateProviderAccommodation(token: string, accId: string, input: UpdateAccommodationInput): Promise<AccommodationDetail> {
  return apiClient.put<AccommodationDetail>(`/provider/accommodations/${accId}`, input, token)
}

export async function archiveProviderAccommodation(token: string, accId: string): Promise<AccommodationListItem> {
  return apiClient.delete<AccommodationListItem>(`/provider/accommodations/${accId}`, token)
}

// ── Images ─────────────────────────────────────────────────────────────────

export async function addAccommodationImages(
  token: string,
  accId: string,
  images: { imageUrl: string; publicId?: string; altText?: string; width?: number; height?: number; format?: string; bytes?: number }[],
): Promise<AccommodationImage[]> {
  return apiClient.post<AccommodationImage[]>(`/provider/accommodations/${accId}/images`, { images }, token)
}

export async function removeAccommodationImage(
  token: string,
  accId: string,
  imageId: string,
): Promise<{ deleted: boolean; publicId: string | null }> {
  return apiClient.delete<{ deleted: boolean; publicId: string | null }>(`/provider/accommodations/${accId}/images/${imageId}`, token)
}

// ── Room types ─────────────────────────────────────────────────────────────

export async function fetchRoomTypes(token: string, accId: string): Promise<RoomTypeItem[]> {
  return apiClient.get<RoomTypeItem[]>(`/provider/accommodations/${accId}/rooms`, token)
}

export async function createRoomType(token: string, accId: string, input: CreateRoomTypeInput): Promise<RoomTypeItem> {
  return apiClient.post<RoomTypeItem>(`/provider/accommodations/${accId}/rooms`, input, token)
}

export async function updateRoomType(token: string, accId: string, roomId: string, input: UpdateRoomTypeInput): Promise<RoomTypeItem> {
  return apiClient.put<RoomTypeItem>(`/provider/accommodations/${accId}/rooms/${roomId}`, input, token)
}

export async function deleteRoomType(token: string, accId: string, roomId: string): Promise<{ deleted: boolean }> {
  return apiClient.delete<{ deleted: boolean }>(`/provider/accommodations/${accId}/rooms/${roomId}`, token)
}
