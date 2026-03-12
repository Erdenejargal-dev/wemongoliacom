import 'dotenv/config'
import { PrismaClient, ProviderType, ListingStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // ── 1. Traveler user ──────────────────────────────────────────────────────
  const travelerPw = await bcrypt.hash('password123', 10)
  const traveler = await prisma.user.upsert({
    where:  { email: 'traveler@wemongolia.com' },
    update: {},
    create: {
      firstName:    'Munkh',
      lastName:     'Erdene',
      email:        'traveler@wemongolia.com',
      passwordHash: travelerPw,
      phone:        '+97699001111',
      country:      'Mongolia',
      role:         'traveler',
      isVerified:   true,
    },
  })
  console.log('  Traveler:', traveler.email)

  // ── 2. Provider owner user ────────────────────────────────────────────────
  const providerPw = await bcrypt.hash('password123', 10)
  const providerUser = await prisma.user.upsert({
    where:  { email: 'provider@wemongolia.com' },
    update: {},
    create: {
      firstName:    'Gobi',
      lastName:     'Adventure',
      email:        'provider@wemongolia.com',
      passwordHash: providerPw,
      phone:        '+97699002222',
      country:      'Mongolia',
      role:         'provider_owner',
      isVerified:   true,
    },
  })
  console.log('  Provider user:', providerUser.email)

  // ── 3. Provider ───────────────────────────────────────────────────────────
  const provider = await prisma.provider.upsert({
    where:  { slug: 'gobi-adventure-tours' },
    update: {},
    create: {
      ownerUserId:   providerUser.id,
      name:          'Gobi Adventure Tours',
      slug:          'gobi-adventure-tours',
      description:   "Mongolia's leading eco-adventure tour operator specialising in Gobi Desert expeditions.",
      email:         'info@gobiadventure.mn',
      phone:         '+97699002222',
      website:       'https://gobiadventure.mn',
      city:          'Ulaanbaatar',
      region:        'Ulaanbaatar',
      country:       'Mongolia',
      languages:     ['English', 'Mongolian'],
      providerTypes: [ProviderType.tour_operator, ProviderType.car_rental],
      ratingAverage: 4.9,
      reviewsCount:  87,
      isVerified:    true,
      status:        ListingStatus.active,
    },
  })
  console.log('  Provider:', provider.name)

  // ── 4. Destination ────────────────────────────────────────────────────────
  const destination = await prisma.destination.upsert({
    where:  { slug: 'gobi-desert' },
    update: {},
    create: {
      name:             'Gobi Desert',
      slug:             'gobi-desert',
      country:          'Mongolia',
      region:           'Gobi',
      shortDescription: "The world's northernmost desert — endless dunes, ancient cliffs, and nomadic hospitality.",
      description:      "The Mongolian Gobi is one of the world's great wilderness areas, stretching across 1.3 million km2. Home to the iconic Flaming Cliffs, towering sand dunes, rare Bactrian camels, and snow leopards.",
      heroImageUrl:     'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1600',
      highlights:       ['Khongoryn Els sand dunes', 'Flaming Cliffs (Bayanzag)', 'Yol Valley', 'Bactrian camels'],
      activities:       ['Camel trekking', 'Sand boarding', 'Fossil hunting', 'Eagle watching'],
      tips:             ['Best visited May-Sept', 'Bring sunscreen and lip balm', 'Temperatures vary 30C day/night'],
      bestTimeToVisit:  'May to September',
      featured:         true,
    },
  })
  console.log('  Destination:', destination.name)

  // ── 5. Tour ───────────────────────────────────────────────────────────────
  const tour = await prisma.tour.upsert({
    where:  { slug: 'gobi-explorer-5-days' },
    update: {},
    create: {
      providerId:         provider.id,
      destinationId:      destination.id,
      slug:               'gobi-explorer-5-days',
      title:              'Gobi Explorer - 5-Day Desert Adventure',
      shortDescription:   'An immersive 5-day journey into the heart of the Gobi Desert.',
      description:        'Experience the raw beauty of the Gobi Desert. Visit the famous Flaming Cliffs, ride camels across the Khongoryn Els dunes, and spend nights in traditional ger camps under the Milky Way.',
      category:           'Adventure',
      experienceType:     'Desert Expedition',
      durationDays:       5,
      durationNights:     4,
      difficulty:         'Moderate',
      meetingPoint:       'Ulaanbaatar city centre hotel lobby',
      pickupIncluded:     true,
      cancellationPolicy: 'Free cancellation up to 7 days before departure.',
      languages:          ['English', 'Mongolian'],
      maxGuests:          12,
      minGuests:          2,
      priceType:          'per_person',
      basePrice:          499,
      currency:           'USD',
      ratingAverage:      4.9,
      reviewsCount:       42,
      status:             ListingStatus.active,
      featured:           true,
    },
  })
  console.log('  Tour:', tour.title)

  await prisma.tourImage.createMany({
    skipDuplicates: true,
    data: [
      { tourId: tour.id, imageUrl: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=800', sortOrder: 0 },
      { tourId: tour.id, imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', sortOrder: 1 },
    ],
  })

  await prisma.tourItineraryDay.createMany({
    skipDuplicates: true,
    data: [
      { tourId: tour.id, dayNumber: 1, title: 'Ulaanbaatar to Flaming Cliffs', description: 'Drive south to Bayanzag, the Flaming Cliffs where first dinosaur eggs were discovered.' },
      { tourId: tour.id, dayNumber: 2, title: 'Yol Valley',                    description: 'Explore the narrow ice gorge of Yol Valley and its vultures and bearded eagles.' },
      { tourId: tour.id, dayNumber: 3, title: 'Khongoryn Els Dunes',           description: 'Camel trek through the tallest sand dunes in Mongolia (up to 300m).' },
      { tourId: tour.id, dayNumber: 4, title: 'Nomad Family Visit',            description: 'Stay with a real nomad family, learn to make airag and help herd animals.' },
      { tourId: tour.id, dayNumber: 5, title: 'Return to Ulaanbaatar',         description: 'Scenic drive back with a stop at Ongiin Khiid monastery ruins.' },
    ],
  })

  await prisma.tourIncludedItem.createMany({
    skipDuplicates: true,
    data: [
      { tourId: tour.id, label: 'All transport in 4WD vehicle' },
      { tourId: tour.id, label: '4 nights accommodation (ger camp or family ger)' },
      { tourId: tour.id, label: 'All meals (full board)' },
      { tourId: tour.id, label: 'English-speaking guide' },
      { tourId: tour.id, label: 'Camel trekking (1 hour)' },
    ],
  })

  await prisma.tourExcludedItem.createMany({
    skipDuplicates: true,
    data: [
      { tourId: tour.id, label: 'International flights' },
      { tourId: tour.id, label: 'Travel insurance' },
      { tourId: tour.id, label: 'Personal expenses' },
    ],
  })

  const now = new Date()
  await prisma.tourDeparture.createMany({
    skipDuplicates: true,
    data: [
      {
        tourId:         tour.id,
        startDate:      new Date(now.getFullYear(), now.getMonth() + 1, 15),
        endDate:        new Date(now.getFullYear(), now.getMonth() + 1, 19),
        availableSeats: 10,
        bookedSeats:    3,
        status:         'scheduled',
      },
      {
        tourId:         tour.id,
        startDate:      new Date(now.getFullYear(), now.getMonth() + 2, 5),
        endDate:        new Date(now.getFullYear(), now.getMonth() + 2, 9),
        availableSeats: 12,
        bookedSeats:    0,
        status:         'scheduled',
      },
    ],
  })
  console.log('  Tour departures created')

  // ── 6. Vehicle ────────────────────────────────────────────────────────────
  const vehicle = await prisma.vehicle.upsert({
    where:  { slug: 'toyota-land-cruiser-200-series' },
    update: {},
    create: {
      providerId:      provider.id,
      destinationId:   destination.id,
      slug:            'toyota-land-cruiser-200-series',
      title:           'Toyota Land Cruiser 200 Series',
      description:     'Our fully-equipped Land Cruiser is perfect for off-road Gobi expeditions. Comes with GPS, first aid kit, and spare fuel.',
      vehicleType:     'SUV',
      make:            'Toyota',
      model:           'Land Cruiser',
      year:            2022,
      transmission:    'Automatic',
      seats:           5,
      luggageCapacity: 3,
      withDriver:      true,
      fuelPolicy:      'Full-to-full',
      features:        ['GPS Navigation', 'Air Conditioning', 'Roof Rack', 'Satellite Phone', '4WD'],
      pricePerDay:     120,
      currency:        'USD',
      ratingAverage:   4.8,
      reviewsCount:    18,
      status:          'active',
    },
  })
  console.log('  Vehicle:', vehicle.title)

  // ── 7. Accommodation ──────────────────────────────────────────────────────
  const accommodation = await prisma.accommodation.upsert({
    where:  { slug: 'three-camel-lodge-gobi' },
    update: {},
    create: {
      providerId:         provider.id,
      destinationId:      destination.id,
      slug:               'three-camel-lodge-gobi',
      name:               'Three Camel Lodge - Gobi',
      description:        "A luxury eco-camp nestled amid the Gobi's iconic landscapes. Twenty-five spacious gers with en-suite bathrooms, fine dining, and stargazing decks.",
      accommodationType:  'ger_camp',
      checkInTime:        '14:00',
      checkOutTime:       '11:00',
      amenities:          ['Hot Shower', 'En-suite Bathroom', 'Fine Dining', 'Bar', 'Wi-Fi (limited)', 'Stargazing Deck', 'Horse Riding'],
      starRating:         4,
      ratingAverage:      4.7,
      reviewsCount:       63,
      status:             ListingStatus.active,
    },
  })
  console.log('  Accommodation:', accommodation.name)

  const roomType = await prisma.roomType.upsert({
    where:  { id: 'seed-roomtype-1' },
    update: {},
    create: {
      id:               'seed-roomtype-1',
      accommodationId:  accommodation.id,
      name:             'Standard Ger',
      description:      'Traditional Mongolian ger with two single beds or one double, private en-suite.',
      maxGuests:        2,
      bedType:          'Double or Twin',
      quantity:         20,
      basePricePerNight: 180,
      currency:         'USD',
      amenities:        ['En-suite Bathroom', 'Wood Stove', 'Reading Lamp'],
    },
  })
  console.log('  RoomType:', roomType.name)

  console.log('\nSeed complete!')
  console.log('\nTest credentials:')
  console.log('  Traveler  -> traveler@wemongolia.com  / password123')
  console.log('  Provider  -> provider@wemongolia.com  / password123')
}

main()
  .catch(err => {
    console.error('Seed failed:', err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
