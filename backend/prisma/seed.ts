import 'dotenv/config'
import { PrismaClient, ProviderType, ListingStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // ── 0. Admin user ─────────────────────────────────────────────────────────
  const adminPw = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where:  { email: 'info@wemongolia.com' },
    update: {
      role:         'admin',
      passwordHash: adminPw,  // always reset password to admin123 on seed
      isVerified:   true,
    },
    create: {
      firstName:    'WeMongolia',
      lastName:     'Admin',
      email:        'info@wemongolia.com',
      passwordHash: adminPw,
      role:         'admin',
      isVerified:   true,
    },
  })
  console.log('  Admin:', admin.email)

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

  // ── 5. Tours (aligned with frontend tour mock slugs) ─────────────────────
  const destinationKh = await prisma.destination.upsert({
    where:  { slug: 'lake-khovsgol' },
    update: {},
    create: {
      name:           'Lake Khövsgöl',
      slug:           'lake-khovsgol',
      country:        'Mongolia',
      region:         'Northern Mongolia',
      featured:       true,
      shortDescription: "Ride along Mongolia's deepest lake through ancient taiga forests.",
    },
  })

  const destinationAltai = await prisma.destination.upsert({
    where:  { slug: 'altai-mountains' },
    update: {},
    create: {
      name:             'Altai Mountains',
      slug:             'altai-mountains',
      country:          'Mongolia',
      region:           'Western Mongolia',
      featured:         true,
      shortDescription: 'Join Kazakh eagle hunters in the remote Altai and capture once-in-a-lifetime photographs.',
    },
  })

  const now = new Date()
  const addDays = (days: number) => new Date(now.getTime() + days * 86400000)

  const toursSeed = [
    {
      slug:        'gobi-desert-camel-trek',
      title:       'Gobi Desert Camel Trek',
      destination: destination.id,
      durationDays: 4,
      difficulty:  'Moderate' as const,
      maxGuests:   10,
      basePrice:   420,
      featured:    true,
      imageUrl:    'https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=1200',
      depOffsetDays1: 30,
      depOffsetDays2: 60,
    },
    {
      slug:        'lake-khovsgol-horseback-expedition',
      title:       'Lake Khövsgöl Horseback Expedition',
      destination: destinationKh.id,
      durationDays: 7,
      difficulty:  'Challenging' as const,
      maxGuests:   8,
      basePrice:   680,
      featured:    true,
      imageUrl:    'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?w=1200',
      depOffsetDays1: 35,
      depOffsetDays2: 65,
    },
    {
      slug:        'altai-eagle-hunter-expedition',
      title:       'Altai Eagle Hunter Expedition',
      destination: destinationAltai.id,
      durationDays: 10,
      difficulty:  'Challenging' as const,
      maxGuests:   6,
      basePrice:   1280,
      featured:    true,
      imageUrl:    'https://images.unsplash.com/photo-1440342359743-84fcb8c21f21?w=1200',
      depOffsetDays1: 40,
      depOffsetDays2: 70,
    },
  ] as const

  for (const [idx, t] of toursSeed.entries()) {
    const tour = await prisma.tour.upsert({
      where: { slug: t.slug },
      update: {},
      create: {
        providerId:          provider.id,
        destinationId:       t.destination,
        slug:                t.slug,
        title:               t.title,
        shortDescription:   'Adventure tour seeded for local UI bookings.',
        description:        'Adventure tour seeded for local UI bookings.',
        durationDays:       t.durationDays,
        durationNights:     Math.max(0, t.durationDays - 1),
        difficulty:         t.difficulty,
        pickupIncluded:     true,
        languages:          ['English', 'Mongolian'],
        maxGuests:          t.maxGuests,
        minGuests:          1,
        priceType:          'per_person',
        basePrice:          t.basePrice,
        currency:           'USD',
        ratingAverage:      4.9,
        reviewsCount:       10 + idx * 7,
        status:             ListingStatus.active,
        featured:           t.featured,
      },
    })

    // Keep seed re-runs from stacking departures infinitely.
    await prisma.tourDeparture.deleteMany({ where: { tourId: tour.id } })
    await prisma.tourImage.deleteMany({ where: { tourId: tour.id } })

    await prisma.tourImage.createMany({
      data: [{ tourId: tour.id, imageUrl: t.imageUrl, sortOrder: 0 }],
    })

    const start1 = addDays(t.depOffsetDays1)
    const start2 = addDays(t.depOffsetDays2)

    await prisma.tourDeparture.createMany({
      data: [
        {
          tourId:         tour.id,
          startDate:      start1,
          endDate:        new Date(start1.getTime() + (t.durationDays - 1) * 86400000),
          availableSeats: 10 + idx * 2,
          bookedSeats:    0,
          status:         'scheduled',
        },
        {
          tourId:         tour.id,
          startDate:      start2,
          endDate:        new Date(start2.getTime() + (t.durationDays - 1) * 86400000),
          availableSeats: 12 + idx * 2,
          bookedSeats:    0,
          status:         'scheduled',
        },
      ],
    })
  }

  // Ensure only seed-aligned tours are visible to the frontend tours listing.
  // (The Next.js tour detail route is generated from mock-data params.)
  await prisma.tour.updateMany({
    where: { slug: { notIn: toursSeed.map(t => t.slug) } },
    data:  { status: 'paused' },
  })

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
  console.log('  Admin     -> info@wemongolia.com      / admin123')
  console.log('  Traveler  -> traveler@wemongolia.com  / password123')
  console.log('  Provider  -> provider@wemongolia.com  / password123')
}

main()
  .catch(err => {
    console.error('Seed failed:', err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
