/**
 * Stay (accommodation) detail page and related copy.
 */

export type StayDetailMessages = {
  defaultLocation: string
  fromPerNight: string
  perNight: string
  reviewCount: (n: number) => string
  propertyInfo: string
  type: string
  checkIn: string
  checkOut: string
  address: string
  hostedBy: string
  starRating: string
  starProperty: (n: number) => string
  contactProperty: string
  amenities: string
  moreAmenities: (n: number) => string
  availableRooms: string
  upToGuests: (n: number) => string
  units: (n: number) => string
  datesAvailable: (n: number) => string
  contactForAvailability: string
  noRoomsListed: string
  cancellationTitle: string
  aboutHost: string
  hostReviews: (n: number) => string
  contactCardTitle: string
  contactWithProvider: (name: string) => string
  contactGeneric: string
  contactCta: string
  defaultProviderName: string
  /** Stay booking card line */
  checkInFrom: (time: string) => string
  checkOutBy: (time: string) => string
  bookingRoomGuests: (n: number) => string
}

export const stayDetailEn: StayDetailMessages = {
  defaultLocation: 'Mongolia',
  fromPerNight: 'From',
  perNight: 'per night',
  reviewCount: (n) => `(${n} review${n === 1 ? '' : 's'})`,
  propertyInfo: 'Property Information',
  type: 'Type',
  checkIn: 'Check-in',
  checkOut: 'Check-out',
  address: 'Address',
  hostedBy: 'Hosted by',
  starRating: 'Star rating',
  starProperty: (n) => `${n}-star property`,
  contactProperty: 'Contact property',
  amenities: 'Amenities',
  moreAmenities: (k) => `+${k} more`,
  availableRooms: 'Available Rooms',
  upToGuests: (n) => `Up to ${n} guest${n === 1 ? '' : 's'}`,
  units: (n) => `${n} unit${n === 1 ? '' : 's'}`,
  datesAvailable: (n) => `${n} date${n === 1 ? '' : 's'} available`,
  contactForAvailability: 'Contact for availability',
  noRoomsListed: 'No room types yet. Contact the property for details.',
  cancellationTitle: 'Cancellation Policy',
  aboutHost: 'About the Host',
  hostReviews: (n) => `(${n} reviews)`,
  contactCardTitle: 'Have questions?',
  contactWithProvider: (name) =>
    `Contact ${name} — most hosts reply within a few hours.`,
  contactGeneric: 'We usually reply within a few hours.',
  contactCta: 'Contact host',
  defaultProviderName: 'Host',
  checkInFrom: (time) => `Check-in from ${time}`,
  checkOutBy: (time) => `Check-out by ${time}`,
  bookingRoomGuests: (n) => `Up to ${n} guest${n === 1 ? '' : 's'}`,
}

export const stayDetailMn: StayDetailMessages = {
  defaultLocation: 'Монгол',
  fromPerNight: 'Эхлэх үнэ',
  perNight: 'шөнийн үнэ',
  reviewCount: (n) => `(${n} сэтгэгдэл)`,
  propertyInfo: 'Байр, амралтын тухай',
  type: 'Төрөл',
  checkIn: 'Ирэх',
  checkOut: 'Гарах',
  address: 'Хаяг',
  hostedBy: 'Зохион байгуулагч',
  starRating: 'Одны үнэлгээ',
  starProperty: (n) => `${n} одтой`,
  contactProperty: 'Санал нөхцөлийг тодруулах',
  amenities: 'Тохилог байдал',
  moreAmenities: (k) => `+${k} нэмэлт`,
  availableRooms: 'Өрөөний сонголт',
  upToGuests: (n) => `Хамгийн ихдээ ${n} зочин`,
  units: (n) => `${n} нэгж`,
  datesAvailable: (n) => `${n} өдөр боломжтой`,
  contactForAvailability: 'Боломжийг тодруулах',
  noRoomsListed: 'Өрөөний төрөл бүртгэгдээгүй. Зохион байгуулагчаас тодруулна уу.',
  cancellationTitle: 'Цуцлалтын нөхцөл',
  aboutHost: 'Зохион байгуулагчийн тухай',
  hostReviews: (n) => `(${n} сэтгэгдэл)`,
  contactCardTitle: 'Асуулт байна уу?',
  contactWithProvider: (name) =>
    `${name}-той шууд холбогдоно уу — ихэвчлэн 2 цагийн дотор хариулна.`,
  contactGeneric: 'Манай аяллын мэргэжилтнүүд 2 цагийн дотор хариулна.',
  contactCta: 'Холбогдох',
  defaultProviderName: 'Зохион байгуулагч',
  checkInFrom: (time) => `Ирэх: ${time}-аас`,
  checkOutBy: (time) => `Гарах: ${time} хүртэл`,
  bookingRoomGuests: (n) => `Хамгийн ихдээ ${n} зочин`,
}
