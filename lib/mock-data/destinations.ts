export interface DestinationHighlight {
  id: string
  title: string
  description: string
  image: string
}

export interface TravelTip {
  icon: string
  title: string
  body: string
}

export interface Destination {
  slug: string
  name: string
  country: string
  region: string
  tagline: string
  description: string
  heroImage: string
  galleryImages: string[]
  highlights: DestinationHighlight[]
  activities: string[]
  tips: TravelTip[]
  bestMonths: string[]
  difficulty: 'Easy' | 'Moderate' | 'Challenging'
  tourCount: number
}

export const destinations: Destination[] = [
  {
    slug: 'gobi-desert',
    name: 'Gobi Desert',
    country: 'Mongolia',
    region: 'Southern Mongolia',
    tagline: 'Where silence is louder than words.',
    description: 'The Gobi Desert is one of the great wonders of the natural world — a vast, varied landscape stretching across southern Mongolia and northern China. Far from a sea of sand, the Mongolian Gobi is a tapestry of dramatic contrasts: towering sand dunes and wind-carved canyons, sun-bleached dinosaur fossil beds and ice-filled gorges, and sparse but extraordinary wildlife. Nomadic herder families have called this place home for millennia, their gers dotting the landscape like white islands in an ochre sea. To visit the Gobi is to feel the weight of geological time — and the freedom of infinite space.',
    heroImage: 'https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=1600',
    galleryImages: [
      'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800',
      'https://images.unsplash.com/photo-1483683804023-6ccdb62f86ef?w=800',
    ],
    highlights: [
      { id: 'h1', title: 'Khongoryn Els', description: 'Mongolia\'s largest sand dunes — up to 300m high and 180km long. Climb at sunrise for views that stretch to infinity.', image: 'https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=600' },
      { id: 'h2', title: 'Flaming Cliffs', description: 'The legendary Bayanzag "Flaming Cliffs" glow deep red at sunset. Roy Chapman Andrews first discovered dinosaur eggs here in the 1920s.', image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600' },
      { id: 'h3', title: 'Yolyn Am Canyon', description: 'A narrow ice canyon in the Gurvan Saikhan mountains — remarkable for its year-round ice even in the desert heat.', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600' },
      { id: 'h4', title: 'Nomadic Ger Camps', description: 'Stay with herder families in traditional felt gers. Experience dairy culture, horsemanship, and ancient hospitality.', image: 'https://images.unsplash.com/photo-1483683804023-6ccdb62f86ef?w=600' },
    ],
    activities: [
      'Bactrian camel trekking across the dunes',
      'Sand dune climbing and sandboarding',
      'Dinosaur fossil site exploration',
      'Nomadic family homestay experience',
      'Stargazing (zero light pollution)',
      'Wildlife spotting — Gobi bear, snow leopard, wild Bactrian camels',
      'Photography at the Flaming Cliffs',
      '4WD desert expedition',
    ],
    tips: [
      { icon: '🌡️', title: 'Best Time to Visit', body: 'May–June and September–October offer ideal temperatures (15–25°C). Summer (July–August) can exceed 40°C. Winter drops below -30°C.' },
      { icon: '🧳', title: 'What to Pack', body: 'Layer clothing for dramatic day/night temperature swings. Sun protection is essential. Sturdy hiking boots, lip balm, and a scarf for dust storms.' },
      { icon: '🚗', title: 'Getting There', body: 'Fly 90 min from Ulaanbaatar to Dalanzadgad, or take a long but scenic 2-day overland drive via the steppe. Most tours include transport.' },
      { icon: '📶', title: 'Connectivity', body: 'Mobile signal is sparse outside main towns. Download offline maps. Embrace the digital detox — the Gobi rewards presence.' },
    ],
    bestMonths: ['May', 'June', 'September', 'October'],
    difficulty: 'Moderate',
    tourCount: 3,
  },
  {
    slug: 'lake-khovsgol',
    name: 'Lake Khövsgöl',
    country: 'Mongolia',
    region: 'Northern Mongolia',
    tagline: 'Mongolia\'s Blue Pearl — a wilderness of taiga, water, and sky.',
    description: 'Lake Khövsgöl — the "Blue Pearl of Mongolia" — holds almost 70% of Mongolia\'s fresh water and 2% of the world\'s. Set in the taiga forests of northern Mongolia just 200km from the Russian border, the lake is surrounded by pristine wilderness inhabited by wolves, elk, reindeer, and one of the world\'s last nomadic reindeer-herding peoples: the Tsaatan. The lake\'s extraordinary clarity (visible to 24 metres depth), the mirror-calm dawns, and the ancient taiga trails make this one of Asia\'s finest wilderness destinations.',
    heroImage: 'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?w=1600',
    galleryImages: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      'https://images.unsplash.com/photo-1551632811-561732d1e306?w=800',
      'https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=800',
    ],
    highlights: [
      { id: 'h1', title: 'The Lake', description: '136km long and 262m deep, the lake\'s turquoise water is pristine enough to drink. The shoreline shifts between sandy beaches, flower meadows, and taiga forest.', image: 'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?w=600' },
      { id: 'h2', title: 'Tsaatan Reindeer Herders', description: 'One of the world\'s last surviving reindeer-herding cultures. Visit their taiga camps, interact with reindeer, and witness a vanishing way of life.', image: 'https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=600' },
      { id: 'h3', title: 'Horseback Riding', description: 'The classic way to explore the lake — ride Mongolian horses through wildflower meadows and dense larch forest along the western shore.', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600' },
      { id: 'h4', title: 'Kayaking & Swimming', description: 'Crystal-clear waters with 24m visibility. Summer kayaking reveals hidden coves and small islands rarely accessible on horseback.', image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=600' },
    ],
    activities: [
      'Horseback expedition along the lake shore',
      'Kayaking and stand-up paddleboarding',
      'Visit to Tsaatan reindeer herder camp',
      'Taiga forest hiking and camping',
      'Fly fishing in alpine streams',
      'Wildlife spotting — elk, sable, bear',
      'Swimming in crystal-clear waters',
      'Wildflower photography in summer',
    ],
    tips: [
      { icon: '🌡️', title: 'Best Time to Visit', body: 'June–August is ideal: warm (15–25°C), wildflowers in bloom, lake accessible. September has autumn colours. Winter is magical but very cold (-40°C).' },
      { icon: '🦟', title: 'Insects', body: 'Mosquitoes and horseflies are intense June–July. Bring strong DEET repellent and a head net. By August they reduce significantly.' },
      { icon: '✈️', title: 'Getting There', body: '90-minute domestic flight from Ulaanbaatar to Mörön, then a 2-hour drive to the lake. Some tours include the flight.' },
      { icon: '🌿', title: 'Eco Travel', body: 'The lake is a protected national park. Pack out all waste, use eco-friendly soap, and stay on marked trails to protect the fragile taiga ecosystem.' },
    ],
    bestMonths: ['June', 'July', 'August'],
    difficulty: 'Challenging',
    tourCount: 1,
  },
  {
    slug: 'ulaanbaatar',
    name: 'Ulaanbaatar',
    country: 'Mongolia',
    region: 'Central Mongolia',
    tagline: 'The world\'s coldest capital — and its most surprising.',
    description: 'Ulaanbaatar is a city of extraordinary contrasts. Soviet-era concrete apartment blocks stand beside gleaming glass towers; Buddhist monasteries a short walk from rooftop cocktail bars; nomadic ger districts surrounding a cosmopolitan centre. Home to nearly half of Mongolia\'s entire population, UB (as it\'s affectionately known) is the gateway to all Mongolian adventures and a fascinating destination in its own right. World-class museums trace the rise of the Mongol Empire; the Gandantegchinlen Monastery is one of Central Asia\'s great religious sites; and the street food, arts scene, and nightlife are richer than most visitors expect.',
    heroImage: 'https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?w=1600',
    galleryImages: [
      'https://images.unsplash.com/photo-1527004013197-933b6523d48e?w=800',
      'https://images.unsplash.com/photo-1483683804023-6ccdb62f86ef?w=800',
      'https://images.unsplash.com/photo-1548013146-72479768bada?w=800',
    ],
    highlights: [
      { id: 'h1', title: 'Gandantegchinlen Monastery', description: 'Mongolia\'s most important functioning monastery. Home to a 26m golden statue of the Megjid Janraisig deity and hundreds of monks.', image: 'https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?w=600' },
      { id: 'h2', title: 'National Museum of Mongolia', description: 'The definitive collection of Mongolian history — from the Mongol Empire to nomadic culture. The Genghis Khan gallery is unmissable.', image: 'https://images.unsplash.com/photo-1527004013197-933b6523d48e?w=600' },
      { id: 'h3', title: 'Naadam Festival', description: 'The "Three Games of Men" — wrestling, horse racing, and archery. Held every July, Naadam is Mongolia\'s greatest national celebration.', image: 'https://images.unsplash.com/photo-1483683804023-6ccdb62f86ef?w=600' },
      { id: 'h4', title: 'Narantuul Market', description: 'UB\'s vast open-air market — a sensory overload of traditional crafts, cashmere, antiques, electronics, and every variety of dried meat.', image: 'https://images.unsplash.com/photo-1548013146-72479768bada?w=600' },
    ],
    activities: [
      'Visit Gandantegchinlen Monastery at dawn',
      'National Museum of Mongolia',
      'Naadam Festival (July) — wrestling, archery, horse racing',
      'Mongolian cultural performance & throat singing',
      'Street food tour of UB',
      'Cashmere shopping and local craft markets',
      'Day trip to Terelj National Park (55km)',
      'Mongolian cooking class',
    ],
    tips: [
      { icon: '🌡️', title: 'Best Time to Visit', body: 'May–September for mild weather. July for Naadam Festival. Winter (Nov–Feb) is brutally cold (-30°C) but magical for the snow-covered monastery.' },
      { icon: '🚕', title: 'Getting Around', body: 'Shared taxis (marshrutkas) and regular taxis are cheap and plentiful. Uber-equivalent app "Utax" is reliable. Traffic jams are legendary — allow extra time.' },
      { icon: '💰', title: 'Budget', body: 'UB has options for all budgets. Budget guesthouses from $15/night; mid-range hotels $60–120; luxury from $200. Street food is excellent and very cheap.' },
      { icon: '🍖', title: 'Food Culture', body: 'Try khuushuur (fried meat pockets), tsuivan (stir-fried noodles), and airag (fermented mare\'s milk). Vegetarian options are limited outside international restaurants.' },
    ],
    bestMonths: ['May', 'June', 'July', 'August', 'September'],
    difficulty: 'Easy',
    tourCount: 2,
  },
  {
    slug: 'altai-mountains',
    name: 'Altai Mountains',
    country: 'Mongolia',
    region: 'Western Mongolia',
    tagline: 'Ancient peaks, eagle hunters, and the roof of Mongolia.',
    description: 'The Mongolian Altai stretches along the country\'s western border, forming a spine of glacier-crowned peaks, deep valleys, and vast high-altitude steppes. This is the most remote and culturally rich corner of Mongolia — home to the Kazakh eagle hunters, whose tradition of training golden eagles for hunting stretches back 4,000 years. The Altai is also a naturalist\'s paradise: snow leopards prowl the high ridges, argali (the world\'s largest wild sheep) graze on remote plateaux, and the region holds some of Asia\'s most spectacular Bronze Age petroglyphs.',
    heroImage: 'https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=1600',
    galleryImages: [
      'https://images.unsplash.com/photo-1440342359743-84fcb8c21f21?w=800',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800',
      'https://images.unsplash.com/photo-1527004013197-933b6523d48e?w=800',
    ],
    highlights: [
      { id: 'h1', title: 'Golden Eagle Festival', description: 'The world\'s most spectacular cultural festival — hundreds of Kazakh eagle hunters compete in a breathtaking display of ancient skill.', image: 'https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=600' },
      { id: 'h2', title: 'Tavan Bogd Peak', description: 'Mongolia\'s highest point (4,374m) — a challenging trek through glaciers, with views across Russia, China, and Kazakhstan.', image: 'https://images.unsplash.com/photo-1440342359743-84fcb8c21f21?w=600' },
      { id: 'h3', title: 'Tsagaan Salaa Petroglyphs', description: 'One of the world\'s largest rock art sites — over 10,000 Bronze Age carvings of animals, hunters, and shamanic scenes.', image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600' },
      { id: 'h4', title: 'Kazakh Nomad Culture', description: 'Stay with Kazakh families in embroidered yurts. The culture, crafts, food, and music here are distinct from anywhere else in Mongolia.', image: 'https://images.unsplash.com/photo-1527004013197-933b6523d48e?w=600' },
    ],
    activities: [
      'Golden Eagle Festival attendance (October)',
      'Eagle hunter family homestay',
      'Tavan Bogd glacier trek',
      'Snow leopard habitat wildlife tour',
      'Tsagaan Salaa petroglyphs visit',
      'Kazakh horse riding in high mountain valleys',
      'Photography expedition with eagle hunters',
      'Argali and ibex wildlife spotting',
    ],
    tips: [
      { icon: '✈️', title: 'Getting There', body: '90-min domestic flight from UB to Ölgii (Bayan-Ölgii province). Alternatively, a very long overland journey. Book flights early — seats are limited.' },
      { icon: '🎪', title: 'Eagle Festival Dates', body: 'The Golden Eagle Festival is held the first weekend of October. Book 6+ months in advance — accommodation fills up fast during festival week.' },
      { icon: '🥾', title: 'Physical Fitness', body: 'High-altitude trekking (3,000–4,374m) requires good cardiovascular fitness. Acclimatise in Ölgii for 1–2 days before ascending.' },
      { icon: '🌡️', title: 'Climate', body: 'Summer (July–Aug) is pleasant in valleys (15–20°C) but cold at altitude. October festival time is cold (0 to -10°C) — bring serious warm layers.' },
    ],
    bestMonths: ['July', 'August', 'October'],
    difficulty: 'Challenging',
    tourCount: 1,
  },
]

export function getDestinationBySlug(slug: string): Destination | undefined {
  return destinations.find(d => d.slug === slug)
}
