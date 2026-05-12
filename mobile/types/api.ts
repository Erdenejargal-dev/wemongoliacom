// Core API response types — matches backend controllers

export type Destination = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  location?: string;
  country?: string;
  rating?: number;
  reviewCount?: number;
  tourCount?: number;
};

export type Tour = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  price: number;
  currency: string;
  durationDays: number;
  maxGroupSize?: number;
  destination?: Destination;
  rating?: number;
  reviewCount?: number;
};

export type Vehicle = {
  id: string;
  name: string;
  slug: string;
  image?: string;
  pricePerDay: number;
  currency: string;
  seats: number;
  transmission?: string;
  fuelType?: string;
};

export type Stay = {
  id: string;
  name: string;
  slug: string;
  image?: string;
  pricePerNight: number;
  currency: string;
  location?: string;
  rating?: number;
  reviewCount?: number;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
};

export type Booking = {
  id: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  listingType: 'tour' | 'stay' | 'vehicle';
  listingId: string;
  listingName: string;
  listingImage?: string;
  startDate: string;
  endDate?: string;
  totalPrice: number;
  currency: string;
  travelers?: number;
};

export type SearchResult = {
  id: string;
  type: 'tour' | 'stay' | 'vehicle' | 'destination';
  name: string;
  slug: string;
  image?: string;
  location?: string;
  price?: number;
  currency?: string;
  rating?: number;
};

export type ApiList<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
};
