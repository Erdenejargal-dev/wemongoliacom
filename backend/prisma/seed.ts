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

  // ── Guides ───────────────────────────────────────────────────────────────
  const guidesData = [
    {
      slug:            'bold-gantulga',
      name:            'Bold Gantulga',
      bio:             'Wildlife & trekking specialist with 12 years in the field',
      about:           'Bold grew up near Khustai National Park and has spent over a decade guiding wildlife enthusiasts across Mongolia\'s steppe, taiga, and desert ecosystems. He specialises in Przewalski\'s horse spotting, snow leopard tracking expeditions, and multi-day Khövsgöl treks.',
      photo:           'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
      coverImage:      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=600&fit=crop',
      location:        'Ulaanbaatar',
      region:          'Khentii',
      specialties:     ['Wildlife', 'Trekking'],
      languages:       ['English', 'Mongolian', 'Russian'],
      certified:       true,
      licenseNumber:   'MNG-G-00142',
      yearsExperience: 12,
      totalGuests:     340,
      dailyRate:       120,
      dailyCurrency:   'USD',
      contactEmail:    'bold@wemongolia.com',
      contactPhone:    '+97699110001',
      ratingAverage:   4.9,
      reviewsCount:    3,
      verified:        true,
      status:          'active' as const,
      reviews: [
        { author: 'Sarah T.', country: 'USA', rating: 5, comment: 'Bold is an absolute legend. His knowledge of Mongolian wildlife is unmatched — we spotted 4 Przewalski\'s horses on day one!', tourName: 'Khustai Wildlife Weekend', date: new Date('2025-09-12') },
        { author: 'James P.', country: 'UK', rating: 5, comment: 'Best guide I\'ve ever had. Incredibly patient and deeply knowledgeable about the ecosystem.', tourName: 'Khövsgöl Trek', date: new Date('2025-07-28') },
        { author: 'Yuki M.', country: 'Japan', rating: 5, comment: 'Perfect experience from start to finish. Bold speaks excellent English and is fantastic with cameras.', tourName: 'Wildlife & Photography 5-Day', date: new Date('2025-06-15') },
      ],
    },
    {
      slug:            'narantsetseg-oyun',
      name:            'Narantsetseg Oyun',
      bio:             'Cultural heritage guide — nomadic traditions and living history',
      about:           'Narantsetseg (Nara) was raised in a traditional nomadic family in Arkhangai. She brings Mongolian culture to life through immersive experiences: ger building, dairy processing, horseback riding, and throat-singing workshops. Fluent in four languages, she tailors each trip to the traveler.',
      photo:           'https://images.unsplash.com/photo-1494790108755-2616b612b5e0?w=400&h=400&fit=crop',
      coverImage:      'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=1200&h=600&fit=crop',
      location:        'Ulaanbaatar',
      region:          'Arkhangai',
      specialties:     ['Cultural', 'History'],
      languages:       ['English', 'Mongolian', 'German', 'French'],
      certified:       true,
      licenseNumber:   'MNG-G-00289',
      yearsExperience: 9,
      totalGuests:     510,
      dailyRate:       100,
      dailyCurrency:   'USD',
      contactEmail:    'nara@wemongolia.com',
      contactPhone:    '+97699110002',
      ratingAverage:   4.8,
      reviewsCount:    3,
      verified:        true,
      status:          'active' as const,
      reviews: [
        { author: 'Claudia R.', country: 'Germany', rating: 5, comment: 'Nara made us feel like part of the family. The ger stay she arranged was the highlight of our Mongolia trip.', tourName: 'Nomadic Life Immersion', date: new Date('2025-08-03') },
        { author: 'Thomas B.', country: 'France', rating: 5, comment: 'Extraordinary cultural knowledge. She translated not just words but the entire worldview of Mongolian nomads.', tourName: 'Heritage & Heartland 7-Day', date: new Date('2025-07-01') },
        { author: 'Mei L.', country: 'Singapore', rating: 4, comment: 'Wonderful guide. The cultural program was rich and authentic. Highly recommend the cooking workshop.', tourName: 'Nomadic Life Immersion', date: new Date('2025-05-20') },
      ],
    },
    {
      slug:            'gantulga-erdene',
      name:            'Gantulga Erdene',
      bio:             'Adventure & trekking guide — Altai mountains and Gobi expeditions',
      about:           'With a background in mountaineering and a certificate in wilderness first aid, Gantulga leads challenging multi-day treks through the Mongolian Altai and extreme Gobi crossings. He has guided international mountaineering teams to peaks above 4000m and led camel caravan expeditions across the southern desert.',
      photo:           'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
      coverImage:      'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1200&h=600&fit=crop',
      location:        'Ölgii',
      region:          'Bayan-Ölgii',
      specialties:     ['Adventure', 'Trekking'],
      languages:       ['English', 'Mongolian', 'Kazakh'],
      certified:       true,
      licenseNumber:   'MNG-G-00078',
      yearsExperience: 15,
      totalGuests:     280,
      dailyRate:       140,
      dailyCurrency:   'USD',
      contactEmail:    'gantulga@wemongolia.com',
      contactPhone:    '+97699110003',
      ratingAverage:   4.9,
      reviewsCount:    2,
      verified:        true,
      status:          'active' as const,
      reviews: [
        { author: 'Marco V.', country: 'Italy', rating: 5, comment: 'Gantulga led our team up to the glacier in Bayan-Ölgii with complete professionalism and warmth. Exceptional.', tourName: 'Altai Peak Expedition', date: new Date('2025-08-19') },
        { author: 'Anna K.', country: 'Australia', rating: 5, comment: 'The Gobi crossing was hard work but Gantulga made it the adventure of a lifetime. His local knowledge is incredible.', tourName: 'Gobi Camel Crossing', date: new Date('2025-05-05') },
      ],
    },
    {
      slug:            'enkhjargal-bat',
      name:            'Enkhjargal Bat',
      bio:             'Bird watching & photography guide — rare species across steppe and wetlands',
      about:           'Enkhjargal (Enkhee) is a trained ornithologist and certified photography guide. He has documented over 400 bird species across Mongolia including the globally threatened Siberian crane and Pallas\'s fish eagle. He works closely with conservation NGOs and runs specialist birding itineraries throughout the year.',
      photo:           'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=400&h=400&fit=crop',
      coverImage:      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=600&fit=crop',
      location:        'Ulaanbaatar',
      region:          'Dornod',
      specialties:     ['BirdWatching', 'Photography'],
      languages:       ['English', 'Mongolian'],
      certified:       true,
      licenseNumber:   'MNG-G-00356',
      yearsExperience: 8,
      totalGuests:     195,
      dailyRate:       110,
      dailyCurrency:   'USD',
      contactEmail:    'enkhee@wemongolia.com',
      contactPhone:    '+97699110004',
      ratingAverage:   4.7,
      reviewsCount:    2,
      verified:        true,
      status:          'active' as const,
      reviews: [
        { author: 'David H.', country: 'Canada', rating: 5, comment: 'Enkhee helped us spot 87 species in 5 days including a pair of demoiselle cranes. Absolutely remarkable.', tourName: 'Eastern Steppe Birding', date: new Date('2025-06-08') },
        { author: 'Patricia S.', country: 'Netherlands', rating: 4, comment: 'Very knowledgeable and patient. We got incredible photos of raptors over the steppe. Great trip.', tourName: 'Raptor Photography Weekend', date: new Date('2025-04-22') },
      ],
    },
    {
      slug:            'oyunbaatar-gombosuren',
      name:            'Oyunbaatar Gombosuren',
      bio:             'Winter expedition specialist — ice festivals, frozen rivers, nomadic winter stays',
      about:           'Oyunbaatar is one of very few guides specialising in Mongolian winter travel. He leads Naadam winter festival trips, Tsagaan Sar (Lunar New Year) cultural immersions, and ice-fishing expeditions on Lake Khövsgöl. His family connections across central Mongolia open doors that no tour operator can match.',
      photo:           'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
      coverImage:      'https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?w=1200&h=600&fit=crop',
      location:        'Mörön',
      region:          'Khövsgöl',
      specialties:     ['Winter', 'Fishing', 'Cultural'],
      languages:       ['English', 'Mongolian'],
      certified:       false,
      yearsExperience: 6,
      totalGuests:     130,
      dailyRate:       90,
      dailyCurrency:   'USD',
      contactEmail:    'oyunbaatar@wemongolia.com',
      contactPhone:    '+97699110005',
      ratingAverage:   4.6,
      reviewsCount:    2,
      verified:        true,
      status:          'active' as const,
      reviews: [
        { author: 'Lars E.', country: 'Sweden', rating: 5, comment: 'Spending Tsagaan Sar with Oyunbaatar\'s family was the most profound travel experience of my life. Deeply authentic.', tourName: 'Lunar New Year Nomadic Stay', date: new Date('2026-02-10') },
        { author: 'Jin W.', country: 'South Korea', rating: 4, comment: 'Ice fishing on Khövsgöl was unforgettable. Oyunbaatar knows every crack in that lake.', tourName: 'Khövsgöl Ice Fishing', date: new Date('2026-01-15') },
      ],
    },
    {
      slug:            'sarnai-chimeddorj',
      name:            'Sarnai Chimeddorj',
      bio:             'History & archaeology guide — Chinggis Khan routes and ancient sites',
      about:           'Sarnai holds a degree in Mongolian history and has worked with the National Museum of Mongolia. She guides along the historical routes of Chinggis Khan, visits Bronze Age deer-stone monuments, and leads tours through the ancient capital Karakorum. Her storytelling brings 800 years of Mongol history to vivid life.',
      photo:           'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
      coverImage:      'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1200&h=600&fit=crop',
      location:        'Ulaanbaatar',
      region:          'Övörkhangai',
      specialties:     ['History', 'Cultural'],
      languages:       ['English', 'Mongolian', 'Japanese'],
      certified:       true,
      licenseNumber:   'MNG-G-00421',
      yearsExperience: 11,
      totalGuests:     420,
      dailyRate:       115,
      dailyCurrency:   'USD',
      contactEmail:    'sarnai@wemongolia.com',
      contactPhone:    '+97699110006',
      ratingAverage:   4.8,
      reviewsCount:    2,
      verified:        true,
      status:          'active' as const,
      reviews: [
        { author: 'Kenji T.', country: 'Japan', rating: 5, comment: 'Sarnai\'s historical knowledge is extraordinary. Standing at Karakorum felt like time travel with her narration.', tourName: 'Chinggis Khan Historical Route', date: new Date('2025-09-30') },
        { author: 'Rebecca M.', country: 'USA', rating: 5, comment: 'Incredibly well-read and passionate. Sarnai made the ancient history of Mongolia come alive. Can\'t recommend enough.', tourName: 'Deer Stones & Ancient Mongolia', date: new Date('2025-08-14') },
      ],
    },
  ]

  for (const g of guidesData) {
    const { reviews, ...guideFields } = g
    const guide = await prisma.guide.upsert({
      where:  { slug: guideFields.slug },
      update: {},
      create: {
        ...guideFields,
        reviews: { create: reviews },
      },
    })
    console.log('  Guide:', guide.name)
  }

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
