/**
 * Strict separation of property-level and room-level amenities.
 * Property amenities describe the facility.
 * Room amenities describe what's inside the room/ger.
 *
 * Both stored as String[] on their respective Prisma models:
 *   Accommodation.amenities → property-level
 *   RoomType.amenities      → room-level
 */

export interface AmenityOption {
  value: string
  label: string
}

export const PROPERTY_AMENITIES: AmenityOption[] = [
  { value: 'wifi',            label: 'Wi-Fi' },
  { value: 'parking',         label: 'Parking' },
  { value: 'restaurant',      label: 'Restaurant' },
  { value: 'bar',             label: 'Bar' },
  { value: 'laundry',         label: 'Laundry' },
  { value: 'airport_shuttle', label: 'Airport Shuttle' },
  { value: '24h_reception',   label: '24h Reception' },
  { value: 'luggage_storage', label: 'Luggage Storage' },
  { value: 'garden',          label: 'Garden' },
  { value: 'terrace',         label: 'Terrace' },
  { value: 'campfire_area',   label: 'Campfire Area' },
  { value: 'horse_stable',    label: 'Horse Stable' },
  { value: 'spa',             label: 'Spa' },
  { value: 'gym',             label: 'Gym / Fitness' },
  { value: 'tour_desk',       label: 'Tour Desk' },
  { value: 'gift_shop',       label: 'Gift Shop' },
]

export const ROOM_AMENITIES: AmenityOption[] = [
  { value: 'heating',           label: 'Heating' },
  { value: 'air_conditioning',  label: 'Air Conditioning' },
  { value: 'private_bathroom',  label: 'Private Bathroom' },
  { value: 'shared_bathroom',   label: 'Shared Bathroom' },
  { value: 'hot_water',         label: 'Hot Water' },
  { value: 'tv',                label: 'TV' },
  { value: 'minibar',           label: 'Minibar' },
  { value: 'safe',              label: 'Safe' },
  { value: 'hair_dryer',        label: 'Hair Dryer' },
  { value: 'extra_bedding',     label: 'Extra Bedding' },
  { value: 'balcony',           label: 'Balcony' },
  { value: 'mountain_view',     label: 'Mountain View' },
  { value: 'river_view',        label: 'River View' },
  { value: 'desk',              label: 'Desk' },
  { value: 'wardrobe',          label: 'Wardrobe' },
  { value: 'electric_outlets',  label: 'Electric Outlets' },
]

export const ACCOMMODATION_TYPES = [
  { value: 'ger_camp',   label: 'Ger Camp' },
  { value: 'hotel',      label: 'Hotel' },
  { value: 'lodge',      label: 'Lodge' },
  { value: 'guesthouse', label: 'Guesthouse' },
  { value: 'resort',     label: 'Resort' },
  { value: 'hostel',     label: 'Hostel' },
  { value: 'homestay',   label: 'Homestay' },
] as const

export const BED_TYPES = [
  { value: 'single', label: 'Single' },
  { value: 'double', label: 'Double' },
  { value: 'twin',   label: 'Twin' },
  { value: 'family', label: 'Family' },
  { value: 'bunk',   label: 'Bunk' },
] as const
