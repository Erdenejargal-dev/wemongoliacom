export interface HostReview {
  id: string
  author: string
  country: string
  avatar?: string
  rating: number
  comment: string
  tourName: string
  date: string
}

export interface Host {
  slug: string
  name: string
  logo: string
  coverImage: string
  location: string
  type: 'company' | 'guide' | 'driver' | 'experience'
  description: string
  about: string
  rating: number
  reviewsCount: number
  yearsExperience: number
  totalTours: number
  totalGuests: number
  languages: string[]
  email: string
  phone: string
  website?: string
  verified: boolean
  reviews: HostReview[]
}

export const hosts: Host[] = [
  {
    slug: 'gobi-adventure-tours',
    name: 'Gobi Adventure Tours',
    logo: 'https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=200&h=200&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=1200',
    location: 'Dalanzadgad, Gobi Desert',
    type: 'company',
    description: 'Mongolia\'s leading Gobi Desert specialist — 12 years of award-winning expeditions.',
    about: 'Founded in 2012 by former Mongolian Geographic Society expedition leader Batmunkh Gantulga, Gobi Adventure Tours is the most experienced Gobi Desert operator in Mongolia. Our team of 14 certified guides speaks 6 languages and has led over 2,400 desert expeditions. We specialize in authentic, low-impact adventures that connect travelers with nomadic families and the raw beauty of the Gobi — from budget group tours to bespoke luxury private safaris. Every itinerary is designed in partnership with local herder communities, ensuring your money directly supports the people whose landscapes you explore.',
    rating: 4.9,
    reviewsCount: 182,
    yearsExperience: 12,
    totalTours: 3,
    totalGuests: 2400,
    languages: ['English', 'Mongolian', 'Japanese', 'German'],
    email: 'info@gobiadventure.mn',
    phone: '+976 9911 2233',
    website: 'https://gobiadventure.mn',
    verified: true,
    reviews: [
      { id: 'r1', author: 'James Whitfield', country: 'United Kingdom', rating: 5, comment: 'Absolutely spectacular — our guide Batmunkh knew every dune by name. The camel trek at sunrise was the most beautiful moment of my life. Seamless logistics, warm hosts. Cannot recommend highly enough.', tourName: 'Gobi Desert Camel Trek', date: '2025-09-14' },
      { id: 'r2', author: 'Yuki Tanaka', country: 'Japan', rating: 5, comment: '完璧なツアーでした！ガイドは英語と日本語が話せて、砂丘は想像以上に美しかった。(The perfect tour! Guide spoke English and Japanese, and the dunes were more beautiful than I imagined.)', tourName: 'Budget Gobi Discovery', date: '2025-10-02' },
      { id: 'r3', author: 'Anna Müller', country: 'Germany', rating: 5, comment: 'We did the luxury grand tour and every detail was immaculate. Three Camel Lodge exceeded all expectations. Batmunkh and his team are true professionals who clearly love what they do.', tourName: 'Luxury Mongolia Grand Tour', date: '2025-08-20' },
      { id: 'r4', author: 'Marcus Delgado', country: 'United States', rating: 4, comment: 'An incredible experience overall. The flaming cliffs at sunset were mind-blowing. Docked one star only because one vehicle had some trouble, but the team handled it perfectly.', tourName: 'Gobi Desert Camel Trek', date: '2025-07-08' },
    ],
  },
  {
    slug: 'northern-trails',
    name: 'Northern Trails Mongolia',
    logo: 'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?w=200&h=200&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?w=1200',
    location: 'Mörön, Khövsgöl Province',
    type: 'company',
    description: 'Khövsgöl lake experts offering horseback expeditions and Tsaatan cultural tours.',
    about: 'Northern Trails was established in 2016 by two sisters from a Tsaatan reindeer-herding family — Enkhjargal and Narantsetseg Dorjsuren. Growing up at Lake Khövsgöl gave them an unparalleled understanding of the taiga ecosystem and the Tsaatan culture their family has practiced for generations. Their mission is to share this extraordinary world with responsible travelers while generating income that directly supports their community. All guides are local residents; all accommodation is in locally-owned camps; a portion of every booking fee is donated to a reindeer conservation fund.',
    rating: 4.8,
    reviewsCount: 94,
    yearsExperience: 9,
    totalTours: 1,
    totalGuests: 580,
    languages: ['English', 'Mongolian', 'Russian'],
    email: 'hello@northerntrails.mn',
    phone: '+976 9922 4455',
    verified: true,
    reviews: [
      { id: 'r1', author: 'Sophie Laurent', country: 'France', rating: 5, comment: 'Enkhjargal was the most incredible guide. She introduced us to her Tsaatan relatives and watching the reindeer at dawn in the taiga was something I will carry forever. Truly transformative.', tourName: 'Lake Khövsgöl Horseback Expedition', date: '2025-07-22' },
      { id: 'r2', author: 'Tom Eriksson', country: 'Sweden', rating: 5, comment: 'The horseback riding along the lakeshore was challenging but totally worth it. Crystal-clear water, wildflowers everywhere, and Narantsetseg made sure everyone felt safe. World class.', tourName: 'Lake Khövsgöl Horseback Expedition', date: '2025-08-05' },
      { id: 'r3', author: 'Clara Fontaine', country: 'Canada', rating: 4, comment: 'Stunning scenery and genuine cultural immersion with the Tsaatan. Pack a proper mosquito net for June — the insects are relentless. Everything else was perfect.', tourName: 'Lake Khövsgöl Horseback Expedition', date: '2025-06-30' },
    ],
  },
  {
    slug: 'altai-expeditions',
    name: 'Altai Expeditions',
    logo: 'https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=200&h=200&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=1200',
    location: 'Ölgii, Bayan-Ölgii Province',
    type: 'guide',
    description: 'Kazakh eagle hunter guide and photography expedition specialist in Western Mongolia.',
    about: 'Altai Expeditions is the personal guiding operation of Davaadorj Batsaikhan, a third-generation Kazakh eagle hunter whose family has practiced berkutchi (eagle hunting) for over 80 years. Davaadorj has been guiding international photographers, journalists, and adventurers to the Altai since 2008 and has been featured in National Geographic, BBC, and Lonely Planet. He offers an intimate, private experience — maximum 6 guests per departure — ensuring genuine access to eagle hunter families and the remote mountain valleys that group tours never reach.',
    rating: 5.0,
    reviewsCount: 32,
    yearsExperience: 17,
    totalTours: 1,
    totalGuests: 190,
    languages: ['English', 'Mongolian', 'Kazakh'],
    email: 'davaadorj@altaiexpeditions.mn',
    phone: '+976 9944 6677',
    verified: true,
    reviews: [
      { id: 'r1', author: 'David Chen', country: 'United States', rating: 5, comment: 'This was the best travel experience of my life — no exaggeration. Davaadorj is an eagle hunter himself, not just a guide, so the access you get is extraordinary. My photos from the Golden Eagle Festival won awards.', tourName: 'Altai Eagle Hunter Expedition', date: '2025-10-08' },
      { id: 'r2', author: 'Lena Hofmann', country: 'Germany', rating: 5, comment: 'Five stars is not enough. The family homestay, the high mountain trek, the festival — every single day was a highlight. Davaadorj\'s knowledge of the Altai ecosystem is encyclopedic.', tourName: 'Altai Eagle Hunter Expedition', date: '2025-10-10' },
      { id: 'r3', author: 'Pierre Leconte', country: 'France', rating: 5, comment: 'Went as a travel photographer. Came back with 3,000 images and a completely changed perspective on life. Book this immediately.', tourName: 'Altai Eagle Hunter Expedition', date: '2024-10-05' },
    ],
  },
  {
    slug: 'ub-culture-tours',
    name: 'UB Culture Tours',
    logo: 'https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?w=200&h=200&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?w=1200',
    location: 'Ulaanbaatar, Mongolia',
    type: 'company',
    description: 'The premier city and cultural tour operator in Ulaanbaatar since 2010.',
    about: 'UB Culture Tours has been connecting travelers with the heart of Mongolian culture since 2010. Based in the centre of Ulaanbaatar, we offer everything from half-day monastery visits to multi-day Naadam festival packages — all led by fluent English, Japanese, and Chinese-speaking guides who are passionate Mongolian historians and cultural enthusiasts. We pride ourselves on small groups, skip-the-queue access, and making sure every visitor leaves understanding why Mongolia is so much more than just Genghis Khan.',
    rating: 4.7,
    reviewsCount: 308,
    yearsExperience: 15,
    totalTours: 2,
    totalGuests: 5200,
    languages: ['English', 'Mongolian', 'Chinese', 'Japanese', 'Korean'],
    email: 'tours@ubculture.mn',
    phone: '+976 9933 5566',
    website: 'https://ubculture.mn',
    verified: true,
    reviews: [
      { id: 'r1', author: 'Kenji Watanabe', country: 'Japan', rating: 5, comment: 'The Naadam VIP experience was incredible — seats right at the front for the wrestling, and our guide explained every ceremony in detail. The traditional lunch was delicious too.', tourName: 'Naadam Festival Special', date: '2025-07-15' },
      { id: 'r2', author: 'Michelle Park', country: 'South Korea', rating: 5, comment: 'Our guide Min was outstanding — so knowledgeable about Mongolian history. The monastery visit at 7am before the crowds arrived was magical.', tourName: 'Ulaanbaatar City & Culture Day', date: '2025-06-10' },
      { id: 'r3', author: 'Roberto Silva', country: 'Brazil', rating: 4, comment: 'Excellent day tour of the city. The National Museum was fascinating. Would have liked slightly more time at the market.', tourName: 'Ulaanbaatar City & Culture Day', date: '2025-08-28' },
    ],
  },
  {
    slug: 'steppe-riders',
    name: 'Steppe Riders',
    logo: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=200&h=200&fit=crop',
    coverImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200',
    location: 'Kharkhorin, Orkhon Valley',
    type: 'company',
    description: 'Nomadic life and horseback expedition specialists across Central and Eastern Mongolia.',
    about: 'Steppe Riders is a Mongolian family business run by the Enkhtaivan family in the historic Orkhon Valley. We specialize in tours that offer genuine nomadic immersion — guests stay with real herder families, participate in daily life, and explore Mongolia\'s vast steppe on horseback. From the weekend Terelj escape to the epic Khentii wolf safari, every tour is designed to leave the tourist trail behind and find the Mongolia that most visitors never see.',
    rating: 4.6,
    reviewsCount: 300,
    yearsExperience: 8,
    totalTours: 3,
    totalGuests: 1800,
    languages: ['English', 'Mongolian', 'Russian'],
    email: 'info@stepperiders.mn',
    phone: '+976 9955 7788',
    verified: true,
    reviews: [
      { id: 'r1', author: 'Emma Wilson', country: 'Australia', rating: 5, comment: 'The Orkhon Valley homestay was the highlight of our entire Mongolia trip. Cooking with the family, milking yaks at dawn, and watching the kids do homework by candlelight — proper Mongolia.', tourName: 'Orkhon Valley Nomadic Life', date: '2025-09-05' },
      { id: 'r2', author: 'Lars Johannsen', country: 'Norway', rating: 4, comment: 'Terelj weekend escape was a great intro to Mongolia. Turtle Rock at sunset, bonfire ger camp, archery lesson — packed two great days. Would happily book the longer Orkhon tour next time.', tourName: 'Terelj Weekend Escape', date: '2025-06-20' },
      { id: 'r3', author: 'Sarah Mitchell', country: 'New Zealand', rating: 5, comment: 'The wolf tracking in Khentii was extraordinary. We didn\'t see wolves (they\'re elusive!) but the steppe wildlife, the history of Genghis Khan\'s homeland, and the river camping were unforgettable.', tourName: 'Khentii Wolf & Wildlife Safari', date: '2025-08-15' },
    ],
  },
]

export function getHostBySlug(slug: string): Host | undefined {
  return hosts.find(h => h.slug === slug)
}
