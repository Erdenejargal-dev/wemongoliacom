export interface TourReview {
  id: string
  name: string
  country: string
  rating: number
  comment: string
  date: string
  avatar: string
}

export interface TourItineraryDay {
  day: number
  title: string
  description: string
  activities: string[]
  accommodation?: string
  meals?: string
}

export interface TourDetail {
  id: string
  slug: string
  title: string
  location: string
  region: string
  regionSlug: string
  shortDescription: string
  description: string
  price: number
  duration: string
  durationDays: number
  maxGuests: number
  groupSize: string
  experienceType: string
  difficulty: 'Easy' | 'Moderate' | 'Challenging' | 'Extreme'
  language: string
  pickupIncluded: boolean
  rating: number
  reviewCount: number
  style: string
  images: string[]
  itinerary: TourItineraryDay[]
  included: string[]
  notIncluded: string[]
  highlights: string[]
  reviews: TourReview[]
}

export const tourDetails: TourDetail[] = [
  {
    id: 't1',
    slug: 'gobi-desert-camel-trek',
    title: 'Gobi Desert Camel Trek',
    location: 'Gobi Desert',
    region: 'Gobi Region',
    regionSlug: 'gobi',
    shortDescription: 'Trek across golden dunes with Bactrian camels and sleep under a billion stars.',
    description: 'Experience one of the world\'s most iconic landscapes on this 4-day Gobi Desert adventure. Ride Bactrian camels across the legendary Khongoryn Els sand dunes, watch the sun set over the Flaming Cliffs, and spend your nights in a traditional Mongolian ger camp under an endless starry sky. Connect with nomadic herder families and witness a way of life unchanged for centuries.',
    price: 420,
    duration: '4 days',
    durationDays: 4,
    maxGuests: 10,
    groupSize: 'Max 10 guests',
    experienceType: 'Extreme Adventure',
    difficulty: 'Moderate',
    language: 'English, Mongolian',
    pickupIncluded: true,
    rating: 4.9,
    reviewCount: 128,
    style: 'adventure',
    images: [
      'https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=1200',
      'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800',
      'https://images.unsplash.com/photo-1483683804023-6ccdb62f86ef?w=800',
      'https://images.unsplash.com/photo-1548013146-72479768bada?w=800',
    ],
    itinerary: [
      { day: 1, title: 'Ulaanbaatar → Gobi Desert', description: 'Fly or drive south to the Gobi. Arrive at your ger camp by evening.', activities: ['Morning departure from UB', 'Scenic drive through steppe', 'Check-in at ger camp', 'Welcome dinner with herder family'], accommodation: 'Traditional Ger Camp', meals: 'Dinner' },
      { day: 2, title: 'Khongoryn Els Sand Dunes', description: 'Spend a full day exploring Mongolia\'s largest sand dunes — up to 300m high and 100km long.', activities: ['Early morning camel ride', 'Dune climbing at sunrise', 'Sandboarding afternoon', 'Campfire & stargazing'], accommodation: 'Ger Camp at dune base', meals: 'Breakfast, Lunch, Dinner' },
      { day: 3, title: 'Flaming Cliffs & Nomadic Visit', description: 'Discover the Bayanzag "Flaming Cliffs" — famous for dinosaur fossil discoveries.', activities: ['Flaming Cliffs at sunrise', 'Dinosaur fossil site walk', 'Visit to nomadic herder family', 'Traditional lunch & cooking lesson'], accommodation: 'Ger Camp', meals: 'Breakfast, Lunch, Dinner' },
      { day: 4, title: 'Yolyn Am → Return', description: 'Morning hike in the cool canyon of Yolyn Am before returning to Ulaanbaatar.', activities: ['Yolyn Am ice canyon hike', 'Wildlife spotting (eagles, ibex)', 'Afternoon departure for UB', 'Farewell dinner in UB'], accommodation: 'Hotel in UB (own cost)', meals: 'Breakfast, Lunch' },
    ],
    included: ['Round-trip transport from Ulaanbaatar', 'English-speaking local guide', 'All ger camp accommodation', 'All meals during the tour', 'Camel riding (2 sessions)', 'Dune activities & sandboard', 'National park fees', 'Emergency first aid kit'],
    notIncluded: ['International flights', 'Travel insurance', 'Personal expenses & souvenirs', 'Alcoholic beverages', 'Tips for guide & driver', 'Accommodation in UB before/after'],
    highlights: ['Khongoryn Els — tallest sand dunes in Mongolia', 'Flaming Cliffs at golden hour', 'Bactrian camel trek', 'Authentic ger camp stay', 'Dinosaur fossil site'],
    reviews: [
      { id: 'r1', name: 'Sarah Mitchell', country: 'United Kingdom', rating: 5, comment: 'Absolutely breathtaking experience. The sand dunes at sunset were unlike anything I\'ve seen. Our guide Bataa was incredibly knowledgeable and made sure we were comfortable throughout.', date: '2025-09-14', avatar: 'https://i.pravatar.cc/150?img=47' },
      { id: 'r2', name: 'Marco Rossi', country: 'Italy', rating: 5, comment: 'The Gobi exceeded every expectation. Sleeping in a ger under the stars was magical. The camel ride was a highlight — we felt like true nomads!', date: '2025-08-22', avatar: 'https://i.pravatar.cc/150?img=11' },
      { id: 'r3', name: 'Yuki Tanaka', country: 'Japan', rating: 4, comment: 'Incredible landscape and very well organised. The food was delicious — traditional Mongolian dishes every day. Minor point: the drive on day 1 was longer than expected.', date: '2025-07-30', avatar: 'https://i.pravatar.cc/150?img=32' },
      { id: 'r4', name: 'Emma Larsson', country: 'Sweden', rating: 5, comment: 'Life-changing trip. The family visit on day 3 was the most authentic cultural experience I\'ve ever had. I will definitely return to Mongolia.', date: '2025-06-18', avatar: 'https://i.pravatar.cc/150?img=25' },
    ],
  },
  {
    id: 't2',
    slug: 'lake-khovsgol-horseback-expedition',
    title: 'Lake Khövsgöl Horseback Expedition',
    location: 'Lake Khövsgöl',
    region: 'Northern Mongolia',
    regionSlug: 'khuvsgul',
    shortDescription: 'Ride along Mongolia\'s deepest lake through ancient taiga forests.',
    description: 'Embark on a 7-day horseback journey along the shores of Lake Khövsgöl — Mongolia\'s "Blue Pearl" and one of the 17 ancient lakes of the world. Ride through pristine taiga forests, visit the enigmatic Tsaatan reindeer herders of the taiga, kayak on crystal-clear waters, and sleep under the northern sky.',
    price: 680,
    duration: '7 days',
    durationDays: 7,
    maxGuests: 8,
    groupSize: 'Max 8 guests',
    experienceType: 'Horseback Riding',
    difficulty: 'Challenging',
    language: 'English, Mongolian',
    pickupIncluded: true,
    rating: 4.8,
    reviewCount: 94,
    style: 'trekking',
    images: [
      'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?w=1200',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800',
      'https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=800',
      'https://images.unsplash.com/photo-1483683804023-6ccdb62f86ef?w=800',
    ],
    itinerary: [
      { day: 1, title: 'Fly to Mörön → Lake Arrival', description: 'Domestic flight from UB to Mörön, then drive to the lake shore.', activities: ['Morning flight UB→Mörön', 'Scenic drive to Khövsgöl', 'Horse assignment & orientation', 'Lakeside dinner'], accommodation: 'Ger Camp — Lake Shore', meals: 'Dinner' },
      { day: 2, title: 'North Shore Ride', description: 'Begin our horseback journey northward along the turquoise shoreline.', activities: ['Full day riding (4–5 hrs)', 'Lakeside lunch', 'Wildflower meadow stops', 'Evening campfire'], accommodation: 'Camping — Meadow', meals: 'Breakfast, Lunch, Dinner' },
      { day: 3, title: 'Taiga Forest & Waterfall', description: 'Ride into the ancient Siberian taiga and discover a hidden waterfall.', activities: ['Forest trail riding', 'Waterfall swim', 'Fishing in alpine stream', 'Night sky observation'], accommodation: 'Camping — Forest Edge', meals: 'Breakfast, Lunch, Dinner' },
      { day: 4, title: 'Tsaatan Reindeer Herders', description: 'Trek to meet the Tsaatan people — one of the last remaining reindeer herding cultures.', activities: ['Horse ride to Tsaatan camp', 'Reindeer interaction', 'Cultural exchange & tea', 'Traditional craft workshop'], accommodation: 'Tsaatan guest tepee', meals: 'Breakfast, Lunch, Dinner' },
      { day: 5, title: 'Lake Kayaking Day', description: 'Rest your legs and explore the lake by kayak — crystal visibility to 24m depth.', activities: ['Morning kayak on the lake', 'Snorkelling in clear water', 'Afternoon horse ride', 'Wildlife spotting'], accommodation: 'Ger Camp', meals: 'Breakfast, Lunch, Dinner' },
      { day: 6, title: 'South Shore Return', description: 'Complete the loop back south along the western shoreline.', activities: ['Full day riding south', 'Sunset over the lake', 'Final camp celebration dinner', 'Traditional music evening'], accommodation: 'Ger Camp — South Shore', meals: 'Breakfast, Lunch, Dinner' },
      { day: 7, title: 'Return to Ulaanbaatar', description: 'Morning farewell to the lake and fly back to the capital.', activities: ['Final lakeside breakfast', 'Drive to Mörön airport', 'Flight back to UB', 'Tour ends on arrival'], accommodation: 'Own arrangements in UB', meals: 'Breakfast' },
    ],
    included: ['Domestic flights (UB↔Mörön)', 'All accommodation', 'Horses & riding equipment', 'Expert horseback guide', 'Kayak equipment & safety gear', 'All meals during the tour', 'National park fees', 'Tsaatan visit permit'],
    notIncluded: ['International flights', 'Travel insurance', 'Personal horse gear (helmets available)', 'Alcoholic beverages', 'Tips', 'Personal expenses'],
    highlights: ['Horseback riding along Lake Khövsgöl', 'Meeting the Tsaatan reindeer herders', 'Kayaking on pristine blue water', 'Ancient taiga forest trails', 'Wildflower meadows and wildlife'],
    reviews: [
      { id: 'r1', name: 'James O\'Brien', country: 'Ireland', rating: 5, comment: 'The most extraordinary week of my life. Meeting the Tsaatan on day 4 was humbling and beautiful. The horse I rode (Arkhangai) was perfect for the terrain.', date: '2025-08-05', avatar: 'https://i.pravatar.cc/150?img=15' },
      { id: 'r2', name: 'Céline Dupont', country: 'France', rating: 5, comment: 'Magical, pure, unforgettable. The lake is the most beautiful thing I\'ve ever seen. Be prepared — it\'s physically demanding but absolutely worth every muscle ache.', date: '2025-07-12', avatar: 'https://i.pravatar.cc/150?img=44' },
    ],
  },
  {
    id: 't6',
    slug: 'altai-eagle-hunter-expedition',
    title: 'Altai Eagle Hunter Expedition',
    location: 'Altai Mountains',
    region: 'Western Mongolia',
    regionSlug: 'altai',
    shortDescription: 'Join Kazakh eagle hunters in the remote Altai and capture once-in-a-lifetime photographs.',
    description: 'Venture deep into Western Mongolia\'s Altai Mountains to live alongside Kazakh eagle hunters — one of the rarest and most photogenic traditions on earth. This 10-day private expedition covers the Golden Eagle Festival, multi-day mountain treks, rare wildlife spotting, and intimate access to Kazakh nomadic families.',
    price: 1280,
    duration: '10 days',
    durationDays: 10,
    maxGuests: 6,
    groupSize: 'Max 6 guests (private)',
    experienceType: 'Wildlife & Photography',
    difficulty: 'Challenging',
    language: 'English, Mongolian, Kazakh',
    pickupIncluded: true,
    rating: 5.0,
    reviewCount: 32,
    style: 'photography',
    images: [
      'https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=1200',
      'https://images.unsplash.com/photo-1440342359743-84fcb8c21f21?w=800',
      'https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=800',
      'https://images.unsplash.com/photo-1527004013197-933b6523d48e?w=800',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800',
    ],
    itinerary: [
      { day: 1, title: 'Fly to Ölgii', description: 'Domestic flight from UB to Ölgii in the Bayan-Ölgii province.', activities: ['Morning flight UB→Ölgii', 'City orientation tour', 'Kazakh cultural briefing', 'Traditional dinner'], accommodation: 'Boutique guesthouse, Ölgii', meals: 'Dinner' },
      { day: 2, title: 'Eagle Hunter Family', description: 'Drive into the mountains to meet your host eagle hunter family.', activities: ['Drive to mountain camp', 'Eagle handling introduction', 'Photography session with eagle', 'Learn eagle hunting history'], accommodation: 'Kazakh ger', meals: 'Breakfast, Lunch, Dinner' },
      { day: 3, title: 'Golden Eagle Festival', description: 'Attend the world-famous Golden Eagle Festival with hundreds of hunters.', activities: ['Festival opening ceremony', 'Eagle racing competition', 'Traditional Kazakh games', 'Portrait photography opportunities'], accommodation: 'Festival camp', meals: 'Breakfast, Lunch, Dinner' },
      { day: 4, title: 'Mountain Trek Day 1', description: 'Begin a 3-day mountain trek into the high Altai wilderness.', activities: ['Alpine trek (5–6 hrs)', 'Snow leopard habitat zone', 'Ibex spotting', 'High camp setup'], accommodation: 'Mountain camp', meals: 'Breakfast, Lunch, Dinner' },
      { day: 5, title: 'High Altai Ridge', description: 'Reach the highest point of the trek with panoramic views across three countries.', activities: ['Summit hike', 'China/Russia/Mongolia border view', 'Glacial lake exploration', 'Wildlife photography'], accommodation: 'Mountain camp', meals: 'Breakfast, Lunch, Dinner' },
      { day: 6, title: 'Trek Descent', description: 'Descend through larch forests back to the valley.', activities: ['Forest descent', 'River crossing', 'Wild mushroom & berry foraging', 'Valley camp'], accommodation: 'Valley ger camp', meals: 'Breakfast, Lunch, Dinner' },
      { day: 7, title: 'Eagle Training Day', description: 'Spend a full day with the eagle hunter, learning training techniques.', activities: ['Dawn eagle release', 'Training flight watching', 'Try your hand with the eagle', 'Craft — making traditional eagle hood'], accommodation: 'Kazakh ger', meals: 'Breakfast, Lunch, Dinner' },
      { day: 8, title: 'Nomadic Horse Ride', description: 'Ride into the steppe on Kazakh horses.', activities: ['Half-day horse ride', 'Nomadic livestock herding', 'Kumiss (fermented mare\'s milk) tasting', 'Bonfire & music evening'], accommodation: 'Ger camp', meals: 'Breakfast, Lunch, Dinner' },
      { day: 9, title: 'Petroglyphs & Rock Art', description: 'Visit ancient Bronze Age petroglyphs in the Altai valleys.', activities: ['Tsagaan Salaa petroglyphs', '10,000-year-old rock art', 'Archaeological site tour', 'Final sunset photography'], accommodation: 'Guesthouse, Ölgii', meals: 'Breakfast, Lunch, Dinner' },
      { day: 10, title: 'Return to Ulaanbaatar', description: 'Morning flight back to UB. Tour concludes on arrival.', activities: ['Morning at leisure in Ölgii', 'Kazakh market visit', 'Flight to Ulaanbaatar', 'Tour ends on arrival'], accommodation: 'Own arrangements', meals: 'Breakfast' },
    ],
    included: ['All domestic flights', 'Private guide (English/Kazakh)', 'Eagle hunter family hosting', 'Golden Eagle Festival tickets', 'All accommodation', 'All meals', 'Mountain trekking equipment', 'Horse riding sessions', 'Wildlife & photography guide'],
    notIncluded: ['International flights', 'Travel insurance', 'Professional camera equipment', 'Personal clothing & gear', 'Alcoholic beverages', 'Tips & gratuities'],
    highlights: ['Golden Eagle Festival attendance', 'Living with Kazakh eagle hunter family', 'High Altai mountain trekking', 'Snow leopard habitat zone', 'Ancient petroglyphs & rock art'],
    reviews: [
      { id: 'r1', name: 'David Chen', country: 'USA', rating: 5, comment: 'This is the most extraordinary travel experience I have ever had. The eagle hunters are the most hospitable people on earth. The festival photographs are frame-worthy. Worth every dollar.', date: '2025-10-02', avatar: 'https://i.pravatar.cc/150?img=52' },
      { id: 'r2', name: 'Sophia Müller', country: 'Germany', rating: 5, comment: 'As a wildlife photographer, this was a dream come true. The eagle in flight against snow-capped mountains — I have been chasing that shot for years. Thank you We Mongolia.', date: '2025-09-28', avatar: 'https://i.pravatar.cc/150?img=29' },
      { id: 'r3', name: 'Hiroshi Yamamoto', country: 'Japan', rating: 5, comment: 'Absolutely perfect from start to finish. The private format meant we had genuine access and real connections. No tourist performance here — just authentic Mongolian life.', date: '2025-09-15', avatar: 'https://i.pravatar.cc/150?img=7' },
    ],
  },
]

/** Find a tour by slug */
export function getTourBySlug(slug: string): TourDetail | undefined {
  return tourDetails.find(t => t.slug === slug)
}
