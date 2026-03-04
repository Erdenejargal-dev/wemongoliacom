import mongoose from 'mongoose';
import Tour from '../lib/models/Tour';
import Business from '../lib/models/Business';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://erjanaam:Wemongolia20@tabi.5xjzfgt.mongodb.net/wemongolia?retryWrites=true&w=majority';

const sampleTours = [
  {
    name: 'Gobi Desert Adventure - 5 Days',
    description: 'Explore the vast Gobi Desert, visit the Flaming Cliffs, ride camels through sand dunes, and experience nomadic lifestyle. This tour includes visits to the stunning Yolyn Am canyon and the iconic Khongoryn Els sand dunes.',
    category: 'adventure',
    duration: { days: 5, nights: 4 },
    destination: ['Gobi Desert', 'Khongoryn Els', 'Yolyn Am', 'Bayanzag'],
    itinerary: [
      {
        day: 1,
        title: 'Journey to Middle Gobi',
        description: 'Drive south to the Middle Gobi province, stop at a local nomadic family',
        activities: ['Scenic drive', 'Nomadic family visit', 'Traditional dinner']
      },
      {
        day: 2,
        title: 'Flaming Cliffs Exploration',
        description: 'Visit the famous Bayanzag Flaming Cliffs where dinosaur fossils were discovered',
        activities: ['Fossil site tour', 'Sunset viewing', 'Desert camping']
      },
      {
        day: 3,
        title: 'Khongoryn Els Sand Dunes',
        description: 'Experience the massive sand dunes and ride Bactrian camels',
        activities: ['Camel riding', 'Sand dune hiking', 'Nomadic family visit']
      },
      {
        day: 4,
        title: 'Yolyn Am Canyon',
        description: 'Explore the stunning ice canyon and spot local wildlife',
        activities: ['Canyon hiking', 'Wildlife watching', 'Museum visit']
      },
      {
        day: 5,
        title: 'Return to Ulaanbaatar',
        description: 'Morning exploration and return journey',
        activities: ['Morning walk', 'Scenic drive back', 'City arrival']
      }
    ],
    included: ['Professional guide', 'All meals', 'Accommodation in ger camps', 'Transportation', 'Camel riding', 'Entrance fees'],
    excluded: ['Personal expenses', 'Travel insurance', 'Alcoholic beverages', 'Tips for guides'],
    pricing: { adult: 899, child: 649 },
    images: [
      'https://images.unsplash.com/photo-1559628376-f3fe5f782a2e?q=80&w=1200',
      'https://images.unsplash.com/photo-1570091836662-88701b6936b6?q=80&w=1200'
    ],
    maxGroupSize: 12,
    minGroupSize: 2,
    difficulty: 'moderate',
    startDates: [
      new Date('2026-05-15'),
      new Date('2026-06-10'),
      new Date('2026-07-05'),
      new Date('2026-08-12')
    ],
    languages: ['English', 'Mongolian', 'German'],
    meetingPoint: 'Hotel pickup in Ulaanbaatar',
    rating: 4.8,
    totalReviews: 127,
    isActive: true,
    featured: true
  },
  {
    name: 'Nomadic Culture Experience - 3 Days',
    description: 'Immerse yourself in authentic Mongolian nomadic culture. Stay with local families, learn traditional crafts, and experience the daily life of herders in the beautiful Mongolian countryside.',
    category: 'cultural',
    duration: { days: 3, nights: 2 },
    destination: ['Terelj National Park', 'Traditional Ger Camp', 'Genghis Khan Statue'],
    itinerary: [
      {
        day: 1,
        title: 'Genghis Khan Monument & Terelj Park',
        description: 'Visit the giant Genghis Khan statue and explore Terelj National Park',
        activities: ['Statue complex tour', 'Turtle Rock visit', 'Horse riding', 'Ger camp check-in']
      },
      {
        day: 2,
        title: 'Nomadic Family Experience',
        description: 'Full day with nomadic family learning traditional lifestyle',
        activities: ['Milking animals', 'Making dairy products', 'Felt making', 'Traditional games']
      },
      {
        day: 3,
        title: 'Buddhist Monastery & Return',
        description: 'Visit ancient monastery and return to the city',
        activities: ['Monastery tour', 'Meditation session', 'Shopping for souvenirs']
      }
    ],
    included: ['English-speaking guide', 'All meals', 'Ger accommodation', 'Transportation', 'Horse riding', 'Cultural activities'],
    excluded: ['Personal expenses', 'Tips', 'Travel insurance'],
    pricing: { adult: 449, child: 299, group: { minSize: 4, pricePerPerson: 399 } },
    images: [
      'https://images.unsplash.com/photo-1569949381669-ecf31ae8e613?q=80&w=1200',
      'https://images.unsplash.com/photo-1546195643-70c5876761b3?q=80&w=1200'
    ],
    maxGroupSize: 10,
    minGroupSize: 1,
    difficulty: 'easy',
    startDates: [
      new Date('2026-05-01'),
      new Date('2026-06-01'),
      new Date('2026-07-01'),
      new Date('2026-08-01'),
      new Date('2026-09-01')
    ],
    languages: ['English', 'Mongolian', 'Japanese', 'Korean'],
    meetingPoint: 'Hotel pickup in Ulaanbaatar',
    rating: 4.9,
    totalReviews: 203,
    isActive: true,
    featured: true
  },
  {
    name: 'Khuvsgul Lake Northern Paradise - 7 Days',
    description: 'Journey to Mongolia\'s pristine "Blue Pearl" - Lake Khuvsgul. Experience crystal clear waters, lush forests, and Tsaatan reindeer herders. Perfect for nature lovers and photographers.',
    category: 'nature',
    duration: { days: 7, nights: 6 },
    destination: ['Khuvsgul Lake', 'Murun', 'Reindeer Herders Camp'],
    itinerary: [
      {
        day: 1,
        title: 'Flight to Murun & Transfer',
        description: 'Fly to northern Mongolia and drive to Lake Khuvsgul',
        activities: ['Domestic flight', 'Scenic drive', 'Lake arrival']
      },
      {
        day: 2,
        title: 'Lake Khuvsgul Exploration',
        description: 'Boat trip and hiking around the lake',
        activities: ['Boat tour', 'Hiking', 'Photography', 'Swimming']
      },
      {
        day: 3,
        title: 'Horse Trekking',
        description: 'Full day horse riding in the taiga',
        activities: ['Horse trekking', 'Forest exploration', 'Bird watching']
      },
      {
        day: 4,
        title: 'Tsaatan Reindeer Herders',
        description: 'Visit the nomadic Tsaatan reindeer herders',
        activities: ['Reindeer herder visit', 'Cultural exchange', 'Traditional crafts']
      },
      {
        day: 5,
        title: 'Relaxation Day',
        description: 'Free day for leisure activities',
        activities: ['Kayaking', 'Fishing', 'Relaxation', 'Optional hiking']
      },
      {
        day: 6,
        title: 'Return Journey',
        description: 'Drive back to Murun',
        activities: ['Morning by the lake', 'Scenic drive', 'Murun arrival']
      },
      {
        day: 7,
        title: 'Flight to Ulaanbaatar',
        description: 'Morning flight back to capital',
        activities: ['Domestic flight', 'Tour completion']
      }
    ],
    included: ['Domestic flights', 'Professional guide', 'All meals', 'Accommodation', 'All transportation', 'Boat trips', 'Horse riding', 'Entrance fees'],
    excluded: ['International flights', 'Travel insurance', 'Personal expenses', 'Alcoholic drinks', 'Tips'],
    pricing: { adult: 1599, child: 1199 },
    images: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1200',
      'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=1200'
    ],
    maxGroupSize: 8,
    minGroupSize: 2,
    difficulty: 'moderate',
    startDates: [
      new Date('2026-06-15'),
      new Date('2026-07-10'),
      new Date('2026-08-05')
    ],
    languages: ['English', 'Mongolian', 'Russian'],
    meetingPoint: 'Ulaanbaatar Hotel or Airport',
    rating: 4.9,
    totalReviews: 85,
    isActive: true,
    featured: true
  },
  {
    name: 'Ancient Capitals Historical Tour - 4 Days',
    description: 'Discover Mongolia\'s rich history by visiting ancient capitals and UNESCO World Heritage sites. Explore Karakorum, Erdene Zuu Monastery, and historical landmarks.',
    category: 'historical',
    duration: { days: 4, nights: 3 },
    destination: ['Karakorum', 'Erdene Zuu', 'Kharkhorin', 'Orkhon Valley'],
    itinerary: [
      {
        day: 1,
        title: 'Journey to Karakorum',
        description: 'Drive to the ancient capital of the Mongol Empire',
        activities: ['Scenic drive', 'Historical briefing', 'Ger camp arrival']
      },
      {
        day: 2,
        title: 'Erdene Zuu Monastery',
        description: 'Explore Mongolia\'s oldest Buddhist monastery',
        activities: ['Monastery tour', 'Museum visit', 'Local market', 'Archaeological sites']
      },
      {
        day: 3,
        title: 'Orkhon Valley UNESCO Site',
        description: 'Visit the beautiful Orkhon Valley and waterfall',
        activities: ['Valley exploration', 'Waterfall hiking', 'Nomadic visits', 'Photography']
      },
      {
        day: 4,
        title: 'Return to Ulaanbaatar',
        description: 'Morning exploration and return journey',
        activities: ['Final site visits', 'Scenic drive', 'City arrival']
      }
    ],
    included: ['Expert historian guide', 'All meals', 'Ger camp accommodation', 'Transportation', 'Museum entrance fees', 'UNESCO site fees'],
    excluded: ['Personal expenses', 'Travel insurance', 'Optional activities', 'Tips'],
    pricing: { adult: 599, child: 449 },
    images: [
      'https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=1200',
      'https://images.unsplash.com/photo-1555881677-dd5de91f2476?q=80&w=1200'
    ],
    maxGroupSize: 15,
    minGroupSize: 2,
    difficulty: 'easy',
    startDates: [
      new Date('2026-05-20'),
      new Date('2026-06-15'),
      new Date('2026-07-20'),
      new Date('2026-08-15'),
      new Date('2026-09-10')
    ],
    languages: ['English', 'Mongolian', 'French', 'Spanish'],
    meetingPoint: 'Hotel pickup in Ulaanbaatar',
    rating: 4.7,
    totalReviews: 156,
    isActive: true,
    featured: true
  },
  {
    name: 'Eagle Hunter Experience - 6 Days',
    description: 'Meet traditional Kazakh eagle hunters in the Altai Mountains of Western Mongolia. Witness ancient hunting techniques and experience the majestic beauty of golden eagles.',
    category: 'cultural',
    duration: { days: 6, nights: 5 },
    destination: ['Bayan-Ulgii', 'Altai Mountains', 'Kazakh Villages'],
    itinerary: [
      {
        day: 1,
        title: 'Flight to Ulgii',
        description: 'Fly to western Mongolia and meet Kazakh families',
        activities: ['Domestic flight', 'Kazakh family meeting', 'Cultural introduction']
      },
      {
        day: 2,
        title: 'Eagle Hunter Visit',
        description: 'Full day with eagle hunters learning their traditions',
        activities: ['Eagle hunting demonstration', 'Traditional crafts', 'Hunting techniques']
      },
      {
        day: 3,
        title: 'Altai Mountains Trek',
        description: 'Trekking in the stunning Altai Mountains',
        activities: ['Mountain trekking', 'Wildlife spotting', 'Photography']
      },
      {
        day: 4,
        title: 'Kazakh Culture Deep Dive',
        description: 'Experience Kazakh traditions and cuisine',
        activities: ['Traditional music', 'Cooking class', 'Handicraft workshop']
      },
      {
        day: 5,
        title: 'Petroglyphs & Sacred Sites',
        description: 'Visit ancient rock art and sacred mountains',
        activities: ['Petroglyph sites', 'Historical exploration', 'Local stories']
      },
      {
        day: 6,
        title: 'Return to Ulaanbaatar',
        description: 'Flight back to capital city',
        activities: ['Morning free time', 'Flight to UB', 'Tour completion']
      }
    ],
    included: ['Domestic flights', 'Eagle hunter visit', 'Professional guide', 'All meals', 'Accommodation', 'Transportation', 'Cultural activities'],
    excluded: ['International flights', 'Travel insurance', 'Personal expenses', 'Tips'],
    pricing: { adult: 1399, child: 999 },
    images: [
      'https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?q=80&w=1200',
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?q=80&w=1200'
    ],
    maxGroupSize: 8,
    minGroupSize: 2,
    difficulty: 'moderate',
    startDates: [
      new Date('2026-09-15'),
      new Date('2026-10-01'),
      new Date('2026-10-15')
    ],
    languages: ['English', 'Mongolian', 'Kazakh'],
    meetingPoint: 'Ulaanbaatar Airport or Hotel',
    rating: 5.0,
    totalReviews: 64,
    isActive: true,
    featured: true
  },
  {
    name: 'Naadam Festival Special - 8 Days',
    description: 'Experience Mongolia\'s greatest festival - Naadam! Watch traditional wrestling, horse racing, and archery. Combine festival excitement with countryside exploration.',
    category: 'cultural',
    duration: { days: 8, nights: 7 },
    destination: ['Ulaanbaatar', 'Terelj', 'Khustai National Park', 'Central Mongolia'],
    itinerary: [
      {
        day: 1,
        title: 'Arrival & City Tour',
        description: 'Arrive in Ulaanbaatar and city orientation',
        activities: ['City tour', 'Museum visits', 'Cultural briefing']
      },
      {
        day: 2,
        title: 'Naadam Festival Opening',
        description: 'Attend the grand opening ceremony',
        activities: ['Opening ceremony', 'Wrestling matches', 'Archery competition']
      },
      {
        day: 3,
        title: 'Horse Racing Day',
        description: 'Watch the thrilling horse races',
        activities: ['Horse racing', 'Cultural performances', 'Local food tasting']
      },
      {
        day: 4,
        title: 'Terelj National Park',
        description: 'Travel to scenic Terelj Park',
        activities: ['Scenic drive', 'Hiking', 'Ger camp experience']
      },
      {
        day: 5,
        title: 'Khustai National Park',
        description: 'Visit wild horse reserve',
        activities: ['Przewalski horse watching', 'Nature walk', 'Wildlife photography']
      },
      {
        day: 6,
        title: 'Countryside Naadam',
        description: 'Experience local countryside Naadam',
        activities: ['Local festival', 'Traditional games', 'Community celebration']
      },
      {
        day: 7,
        title: 'Nomadic Experience',
        description: 'Stay with nomadic family',
        activities: ['Nomadic lifestyle', 'Animal herding', 'Traditional activities']
      },
      {
        day: 8,
        title: 'Return & Departure',
        description: 'Return to Ulaanbaatar',
        activities: ['Morning activities', 'Return drive', 'Departure']
      }
    ],
    included: ['Festival tickets (VIP seats)', 'Professional guide', 'All meals', 'Accommodation', 'Transportation', 'Cultural activities', 'Park entrance fees'],
    excluded: ['International flights', 'Travel insurance', 'Personal expenses', 'Alcoholic beverages', 'Tips'],
    pricing: { adult: 1899, child: 1399 },
    images: [
      'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1200',
      'https://images.unsplash.com/photo-1564859228273-274232fdb516?q=80&w=1200'
    ],
    maxGroupSize: 12,
    minGroupSize: 2,
    difficulty: 'easy',
    startDates: [
      new Date('2026-07-07'),
      new Date('2026-07-08')
    ],
    languages: ['English', 'Mongolian', 'Japanese', 'Korean', 'Chinese'],
    meetingPoint: 'Ulaanbaatar Airport or Hotel',
    rating: 4.9,
    totalReviews: 198,
    isActive: true,
    featured: true
  }
];

async function seedTours() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully!');

    // First, we need to create a dummy business as tours require a businessId
    console.log('\nChecking for existing business...');
    let business = await Business.findOne();
    
    if (!business) {
      console.log('Creating sample business...');
      // Create a dummy user first (tours need a business which needs a user)
      const dummyUserId = new mongoose.Types.ObjectId();
      
      business = await Business.create({
        userId: dummyUserId,
        businessName: 'Mongolia Adventures & Tours',
        businessType: 'tour_operator',
        description: 'Leading tour operator in Mongolia specializing in cultural and adventure tours',
        contactInfo: {
          email: 'info@mongoliaadventures.com',
          phone: '+976-11-123456',
          address: 'Peace Avenue 17',
          city: 'Ulaanbaatar',
          country: 'Mongolia'
        },
        isVerified: true
      });
      console.log('Sample business created:', business.businessName);
    } else {
      console.log('Using existing business:', business.businessName);
    }

    // Clear existing tours
    console.log('\nClearing existing tours...');
    await Tour.deleteMany({});
    console.log('Existing tours cleared');

    // Add businessId to all sample tours
    const toursWithBusinessId = sampleTours.map(tour => ({
      ...tour,
      businessId: business._id
    }));

    // Insert sample tours
    console.log('\nInserting sample tours...');
    const insertedTours = await Tour.insertMany(toursWithBusinessId);
    
    console.log(`\n✅ Successfully seeded ${insertedTours.length} tours!`);
    console.log('\nSample tours:');
    insertedTours.forEach((tour, index) => {
      console.log(`${index + 1}. ${tour.name} - $${tour.pricing.adult} - ${tour.category} - Rating: ${tour.rating}/5.0`);
    });

    console.log('\n🎉 Database seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nMongoDB connection closed');
  }
}

// Run the seed function
seedTours();
