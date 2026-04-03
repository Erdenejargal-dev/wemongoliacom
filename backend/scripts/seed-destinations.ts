/**
 * backend/scripts/seed-destinations.ts
 *
 * Seeds the database with 10 real Mongolia destinations.
 * Run with:   npx ts-node scripts/seed-destinations.ts
 *
 * Safe to run multiple times — uses upsert on slug so existing records are
 * updated rather than duplicated.
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const destinations = [
  {
    slug:             'gobi-desert',
    name:             'Gobi Desert',
    country:          'Mongolia',
    region:           'Gobi Desert',
    shortDescription: 'Where silence is louder than words — a vast world of dunes, canyons, and ancient fossils.',
    description:      'The Gobi Desert is one of the great wonders of the natural world — a vast, varied landscape stretching across southern Mongolia. Far from a sea of sand, the Mongolian Gobi is a tapestry of dramatic contrasts: towering sand dunes and wind-carved canyons, sun-bleached dinosaur fossil beds and ice-filled gorges, and sparse but extraordinary wildlife. Nomadic herder families have called this place home for millennia, their gers dotting the landscape like white islands in an ochre sea.',
    heroImageUrl:     'https://images.unsplash.com/photo-1516912481808-3406841bd33c?q=80&w=1600',
    highlights:       [
      'Khongoryn Els — Mongolia\'s largest sand dunes, up to 300m high',
      'Bayanzag Flaming Cliffs — legendary dinosaur fossil site glowing red at sunset',
      'Yolyn Am — a narrow ice canyon in the heart of the Gurvan Saikhan mountains',
      'Nomadic ger camp stays with local herder families',
    ],
    activities:       [
      'Bactrian camel trekking across the dunes',
      'Sand dune climbing and sandboarding',
      'Dinosaur fossil site exploration at Bayanzag',
      'Nomadic family homestay experience',
      'Stargazing in one of the world\'s darkest skies',
      '4WD desert expedition',
    ],
    tips: [
      'Best months: May–June and September–October (15–25°C). July–August exceeds 40°C.',
      'Pack layers — temperature swings of 30°C between day and night are common.',
      'Mobile signal is sparse outside main towns. Download offline maps before leaving Ulaanbaatar.',
    ],
    bestTimeToVisit:  'May–June, September–October',
    weatherInfo:      'Extreme continental: −30°C (winter) to +45°C (summer)',
    featured:         true,
  },
  {
    slug:             'lake-khovsgol',
    name:             'Lake Khövsgöl',
    country:          'Mongolia',
    region:           'Lake Khövsgöl',
    shortDescription: "Mongolia's Blue Pearl — a pristine alpine lake holding 2% of the world's fresh water.",
    description:      'Lake Khövsgöl holds almost 70% of Mongolia\'s fresh water and 2% of the world\'s. Set in the taiga forests of northern Mongolia just 200km from the Russian border, the lake is surrounded by pristine wilderness inhabited by wolves, elk, reindeer, and one of the world\'s last nomadic reindeer-herding peoples: the Tsaatan. The lake\'s extraordinary clarity (visible to 24 metres depth), the mirror-calm dawns, and the ancient taiga trails make this one of Asia\'s finest wilderness destinations.',
    heroImageUrl:     'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?q=80&w=1600',
    highlights:       [
      '136km long and 262m deep — pristine enough to drink from',
      'Tsaatan reindeer herders — one of the world\'s last surviving reindeer-herding cultures',
      'Horseback riding through wildflower meadows and dense larch forest',
      'Kayaking with 24m underwater visibility',
    ],
    activities:       [
      'Horseback expedition along the lake shore',
      'Visit to Tsaatan reindeer herder camp',
      'Kayaking and paddleboarding',
      'Taiga forest hiking and camping',
      'Fly fishing in crystal-clear alpine streams',
      'Wildlife spotting — elk, sable, brown bear',
    ],
    tips: [
      'Mosquitoes and horseflies are intense in June–July. Bring strong repellent and a head net.',
      'Fly 90 minutes from Ulaanbaatar to Mörön, then 2-hour drive to the lake.',
      'The lake is a protected national park — pack out all waste.',
    ],
    bestTimeToVisit:  'June–August (summer), September (autumn colours)',
    weatherInfo:      'Short warm summer 15–25°C; long harsh winter down to −40°C',
    featured:         true,
  },
  {
    slug:             'ulaanbaatar',
    name:             'Ulaanbaatar',
    country:          'Mongolia',
    region:           'Ulaanbaatar',
    shortDescription: "The world's coldest capital — and its most surprising. Gateway to all Mongolia adventures.",
    description:      'Ulaanbaatar is a city of extraordinary contrasts. Soviet-era concrete blocks stand beside gleaming glass towers; Buddhist monasteries a short walk from rooftop cocktail bars; nomadic ger districts surrounding a cosmopolitan centre. Home to nearly half of Mongolia\'s population, UB is both the gateway to all Mongolian adventures and a fascinating destination in its own right. World-class museums trace the rise of the Mongol Empire; the Gandantegchinlen Monastery is one of Central Asia\'s great religious sites.',
    heroImageUrl:     'https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?q=80&w=1600',
    highlights:       [
      'Gandantegchinlen Monastery — Mongolia\'s most important functioning monastery',
      'National Museum of Mongolia — definitive collection from the Mongol Empire to nomadic culture',
      'Naadam Festival (July) — the Three Games of Men: wrestling, horse racing, archery',
      'Narantuul Market — vast open-air market with traditional crafts and cashmere',
    ],
    activities:       [
      'Visit Gandantegchinlen Monastery at dawn',
      'National Museum of Mongolia and Genghis Khan gallery',
      'Naadam Festival — July 11–13',
      'Mongolian throat singing and cultural performance',
      'Day trip to Terelj National Park (55km)',
      'Cashmere shopping and local craft markets',
    ],
    tips: [
      'Best for Naadam: July 11–13. Book accommodation 3–6 months ahead.',
      'Traffic is legendary — allow 2× extra journey time across the city.',
      'Street food is excellent and very cheap. Try khuushuur (fried meat pastry).',
    ],
    bestTimeToVisit:  'May–September; July for Naadam Festival',
    weatherInfo:      'Cold desert climate: −30°C (Jan) to +35°C (Jul)',
    featured:         true,
  },
  {
    slug:             'altai-mountains',
    name:             'Altai Mountains',
    country:          'Mongolia',
    region:           'Altai Mountains',
    shortDescription: 'Ancient peaks, eagle hunters, and the roof of Mongolia — home to the Kazakh people.',
    description:      'The Mongolian Altai stretches along the country\'s western border, forming a spine of glacier-crowned peaks, deep valleys, and vast high-altitude steppes. This is the most remote and culturally rich corner of Mongolia — home to the Kazakh eagle hunters, whose tradition of training golden eagles stretches back 4,000 years. The Altai is also a naturalist\'s paradise: snow leopards, argali (the world\'s largest wild sheep), and Bronze Age petroglyphs that predate the written word.',
    heroImageUrl:     'https://images.unsplash.com/photo-1470770903676-69b98201ea1c?q=80&w=1600',
    highlights:       [
      'Golden Eagle Festival (October) — the world\'s most spectacular cultural competition',
      'Tavan Bogd — Mongolia\'s highest peak at 4,374m, a challenging glacier trek',
      'Tsagaan Salaa petroglyphs — one of the world\'s largest Bronze Age rock art sites',
      'Kazakh nomad family homestays in embroidered yurts',
    ],
    activities:       [
      'Golden Eagle Festival — first weekend of October',
      'Eagle hunter family homestay and falconry experience',
      'Tavan Bogd glacier trek',
      'Snow leopard habitat wildlife tour',
      'Tsagaan Salaa Bronze Age petroglyphs',
      'Horseback riding in high mountain valleys',
    ],
    tips: [
      'Golden Eagle Festival: book 6+ months ahead — accommodation fills up fast.',
      'Fly 90 minutes from Ulaanbaatar to Ölgii. Seats are limited — book early.',
      'High altitude (3,000–4,374m) requires cardiovascular fitness. Acclimatise in Ölgii first.',
    ],
    bestTimeToVisit:  'July–August (summer), October (Eagle Festival)',
    weatherInfo:      'Mountain climate: cool summers at altitude, harsh winters −40°C',
    featured:         true,
  },
  {
    slug:             'terelj-national-park',
    name:             'Terelj National Park',
    country:          'Mongolia',
    region:           'Central Steppe',
    shortDescription: 'Dramatic granite outcrops and sweeping river valleys just 55km from Ulaanbaatar.',
    description:      "Terelj National Park is Mongolia's most accessible wilderness — just 55km northeast of Ulaanbaatar, yet worlds away in atmosphere. Dramatic granite outcrops including the famous Turtle Rock, the broad Terelj River valley, and endless rolling hills make it the ideal introduction to Mongolian landscape. Ger camps line the valley floor, offering overnight stays that give city visitors an authentic taste of nomadic life without multi-day travel.",
    heroImageUrl:     'https://images.unsplash.com/photo-1609137144813-7d9921338f24?q=80&w=1600',
    highlights:       [
      'Turtle Rock (Melkhii Khad) — iconic natural granite formation',
      'Ariyabal Meditation Temple — hilltop Buddhist monastery with valley views',
      'White water rafting on the Terelj River',
      'Overnight ger camp experience under vast starry skies',
    ],
    activities:       [
      'Horseback riding through the valley',
      'Hiking to Turtle Rock and surrounding outcrops',
      'Visit Ariyabal Meditation Temple',
      'Overnight ger camp stay',
      'White water rafting (summer)',
      'Rock climbing on granite formations',
    ],
    tips: [
      'Easy day trip or overnight from Ulaanbaatar — just 90 minutes by road.',
      'Busiest in summer (June–August) and winter (December–February for snow activities).',
      'Many ger camps offer horse riding, archery, and traditional meals included.',
    ],
    bestTimeToVisit:  'Year-round; summer for hiking, winter for snow activities',
    weatherInfo:      'Similar to Ulaanbaatar: −30°C (winter) to +30°C (summer)',
    featured:         false,
  },
  {
    slug:             'orkhon-valley',
    name:             'Orkhon Valley',
    country:          'Mongolia',
    region:           'Khangai Mountains',
    shortDescription: 'UNESCO World Heritage site — the ancient heart of the Mongol Empire and nomadic civilization.',
    description:      'The Orkhon Valley is one of Mongolia\'s most historically significant and naturally beautiful regions, designated a UNESCO World Heritage Cultural Landscape. The Orkhon River flows through a wide steppe valley flanked by volcanic mountains, past the ruins of Karakorum (the ancient Mongol capital), the Erdene Zuu Monastery, and the dramatic Orkhon Waterfall. This is where the great nomadic empires — Turkic, Uighur, and Mongol — made their heartland for centuries.',
    heroImageUrl:     'https://images.unsplash.com/photo-1517400508447-f8dd518b86db?q=80&w=1600',
    highlights:       [
      'Erdene Zuu Monastery — the first Buddhist monastery in Mongolia, built from Karakorum ruins',
      'Orkhon Waterfall (Ulaan Tsutgalan) — dramatic 20m cascade on black volcanic rock',
      'Ancient Turkic stone figures (deer stones) scattered across the valley',
      'Unspoiled nomadic steppe landscape unchanged for centuries',
    ],
    activities:       [
      'Visit Erdene Zuu Monastery and museum',
      'Karakorum archaeological site exploration',
      'Orkhon Waterfall hike',
      'Multi-day horseback trek through the valley',
      'Ger camp stays with nomadic herder families',
      'Photography of deer stones and ancient monuments',
    ],
    tips: [
      '400km from Ulaanbaatar — typically a 5–7 day tour destination.',
      'Combine with Karakorum (Kharkhorin) for the full historical circuit.',
      'Flash floods can make river crossings dangerous in July–August.',
    ],
    bestTimeToVisit:  'June–September',
    weatherInfo:      'Temperate steppe; warm summers, cold winters',
    featured:         false,
  },
  {
    slug:             'khangai-mountains',
    name:             'Khangai Mountains',
    country:          'Mongolia',
    region:           'Khangai Mountains',
    shortDescription: "Mongolia's green heart — a vast highland of forest, rivers, and volcanic landscapes.",
    description:      'The Khangai Mountains form the lush green heart of Mongolia — a dramatic contrast to the arid south. Stretching 700km across central Mongolia, the range reaches 4,021m at Otgontenger peak and encompasses some of the country\'s most beautiful landscapes: the source of the Orkhon River, steaming volcanic craters, ancient forests, and high-altitude lakes. The region is home to the Khalkh nomadic culture in its most traditional form.',
    heroImageUrl:     'https://images.unsplash.com/photo-1564399579883-451a5d44ec08?q=80&w=1600',
    highlights:       [
      'Terkhin Tsagaan Nuur (White Lake) — crystal-clear volcanic caldera lake',
      'Horgo Volcano — dormant crater with panoramic views over the White Lake',
      'Dense taiga forests and high alpine meadows',
      'Traditional Khalkh nomadic culture at its most authentic',
    ],
    activities:       [
      'Trekking and horseback riding in the highland valleys',
      'White Lake kayaking and fishing',
      'Horgo Volcano hike and crater exploration',
      'Multi-day wilderness camping',
      'Wild mushroom and berry foraging (summer)',
    ],
    tips: [
      'The White Lake route is a classic 7–10 day circuit from Ulaanbaatar.',
      'Weather can change rapidly at altitude — pack rain gear year-round.',
      'Summer brings beautiful wildflowers; autumn turns the forest gold.',
    ],
    bestTimeToVisit:  'June–September',
    weatherInfo:      'Subarctic highland; cool summers, deep snow winters',
    featured:         false,
  },
  {
    slug:             'hustai-national-park',
    name:             'Hustai National Park',
    country:          'Mongolia',
    region:           'Central Steppe',
    shortDescription: 'Where Przewalski\'s horse — the last wild horse species on Earth — roams free.',
    description:      "Hustai National Park is 100km west of Ulaanbaatar and home to the world's only true wild horse: the Takhi (Przewalski's horse), successfully reintroduced after extinction in the wild. The park's rolling steppe and rugged Khurkhree River valley also harbour red deer, wolves, lynx, and over 200 bird species. It's an outstanding example of successful conservation and one of the easiest wildlife destinations to reach from the capital.",
    heroImageUrl:     'https://images.unsplash.com/photo-1584646098378-0874589d76b1?q=80&w=1600',
    highlights:       [
      "Takhi (Przewalski's horse) — the world's last truly wild horse, extinct and successfully reintroduced",
      'Red deer, wolves, and lynx in a protected steppe ecosystem',
      'Over 200 bird species including saker falcon',
      'Beautiful rolling steppe landscape just 100km from Ulaanbaatar',
    ],
    activities:       [
      'Takhi horse spotting safari (dawn and dusk best)',
      'Guided nature walks in the park',
      'Bird watching — saker falcon, steppe eagle, crane',
      'Photography of wildlife and steppe landscapes',
      'Overnight at the park\'s eco-ger camp',
    ],
    tips: [
      'Just 2 hours from Ulaanbaatar — easy day trip or overnight.',
      'Best horse viewing: early morning and evening. Midday herds rest in the valleys.',
      'The visitor centre provides excellent conservation context and maps.',
    ],
    bestTimeToVisit:  'May–October',
    weatherInfo:      'Continental steppe: mild summers, cold winters',
    featured:         false,
  },
  {
    slug:             'karakorum',
    name:             'Karakorum (Kharkhorin)',
    country:          'Mongolia',
    region:           'Khangai Mountains',
    shortDescription: 'Once capital of the largest contiguous empire in history — now a quiet steppe town with giant stone turtles.',
    description:      "In the 13th century, Karakorum was one of the world's great cities — the capital of the Mongol Empire at its peak, visited by merchants, diplomats and missionaries from across Eurasia. Today the town of Kharkhorin is quiet, but the Erdene Zuu Monastery (built from the ruins of Karakorum's palaces) and the surrounding archaeological landscape make this one of the most historically resonant sites in Central Asia. Four great stone turtle sculptures once marked the city's boundaries.",
    heroImageUrl:     'https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?q=80&w=1600',
    highlights:       [
      'Erdene Zuu Monastery — the oldest and most important Buddhist monastery in Mongolia',
      'The Great Stone Turtles — ancient markers of the original Karakorum city boundaries',
      'Karakorum Museum — artefacts from the Mongol Empire period',
      'Active monastic community with daily ceremonies',
    ],
    activities:       [
      'Erdene Zuu Monastery tour and morning ceremonies',
      'Karakorum Museum and Mongol Empire history',
      'Archaeological site walks with local guides',
      'Traditional archery demonstration',
      'Combine with Orkhon Valley and White Lake circuit',
    ],
    tips: [
      'Combine with the Orkhon Valley and Khangai Mountains for a classic central Mongolia circuit.',
      '360km from Ulaanbaatar — typically visited as part of a multi-day tour.',
      'The monastery is still active — respectful dress (covered shoulders and knees) is required.',
    ],
    bestTimeToVisit:  'May–September',
    weatherInfo:      'Continental steppe: warm summers, cold dry winters',
    featured:         false,
  },
  {
    slug:             'khovd-region',
    name:             'Khovd Region',
    country:          'Mongolia',
    region:           'Altai Mountains',
    shortDescription: 'Remote western Mongolia — diverse ethnic cultures, Altai foothills, and crystalline rivers.',
    description:      'Khovd Province in western Mongolia is one of the country\'s most ethnically diverse regions, home to Kazakh, Khovd, Myangad, Zakhchin, Uriankhai and other peoples. The provincial capital sits below the dramatic Mongol Altai range, with rivers running clear from glacial meltwater and vast desert steppes stretching south. Khovd is the gateway to the Altai Mountains, the eagle hunter communities of Bayan-Ölgii, and some of Mongolia\'s most remote and spectacular landscapes.',
    heroImageUrl:     'https://images.unsplash.com/photo-1440342359743-84fcb8c21f21?q=80&w=1600',
    highlights:       [
      'Bulgan River — crystal-clear glacial river teeming with taimen and lenok trout',
      'Mankhan petroglyphs — ancient rock art in the foothills of the Mongol Altai',
      'Tsenkher hot springs — natural hot pools in a beautiful river canyon',
      'Multi-ethnic nomadic cultures: Kazakh, Zakhchin, and Uriankhai peoples',
    ],
    activities:       [
      'Fly fishing for taimen — world-record-size migratory trout',
      'Mankhan petroglyphs and archaeological sites',
      'Tsenkher hot springs relaxation',
      'Horseback trekking through the Mongol Altai foothills',
      'Cross into Bayan-Ölgii for eagle hunter experiences',
    ],
    tips: [
      'Fly to Khovd from Ulaanbaatar (90 minutes). Flights fill quickly in summer.',
      'This is a gateway region — best combined with eagle hunter visits or Altai trekking.',
      'Taimen fishing requires strict catch-and-release ethics. Only reputable operators.',
    ],
    bestTimeToVisit:  'June–September',
    weatherInfo:      'Semi-arid mountain climate; hot dry summers, extreme winters',
    featured:         false,
  },
]

async function main() {
  console.log('🌍 Seeding Mongolia destinations…\n')

  let created = 0
  let updated = 0

  for (const dest of destinations) {
    const existing = await prisma.destination.findUnique({ where: { slug: dest.slug } })

    if (existing) {
      await prisma.destination.update({
        where: { slug: dest.slug },
        data:  dest,
      })
      console.log(`  ✏️  Updated:  ${dest.name}`)
      updated++
    } else {
      await prisma.destination.create({ data: dest })
      console.log(`  ✅ Created:  ${dest.name}`)
      created++
    }
  }

  console.log(`\n✅ Done — ${created} created, ${updated} updated.`)
  console.log(`   Total in DB: ${await prisma.destination.count()} destinations.\n`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
