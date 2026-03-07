import { MapPin, Compass, Clock, Users, Camera, Utensils, Wind, Tent, Mountain, Star, Map, CalendarDays, Lightbulb, Wand2 } from 'lucide-react'

export const navItems = [
  {
    label: 'Destinations',
    key: 'destinations',
    menu: {
      sections: [
        {
          title: 'Popular Destinations',
          icon: MapPin,
          items: [
            { label: 'Ulaanbaatar', href: '#', description: 'Mongolia\'s vibrant capital' },
            { label: 'Gobi Desert', href: '#', description: 'Vast dunes & canyon landscapes' },
            { label: 'Lake Khövsgöl', href: '#', description: 'Mongolia\'s Blue Pearl' },
            { label: 'Terelj National Park', href: '#', description: 'Just 55km from the city' },
          ],
        },
        {
          title: 'Travel Regions',
          icon: Map,
          items: [
            { label: 'Central Mongolia', href: '#', description: 'Orkhon Valley & steppes' },
            { label: 'Gobi Region', href: '#', description: 'Desert, fossils & camels' },
            { label: 'Northern Mongolia', href: '#', description: 'Forests, lakes & reindeer' },
            { label: 'Western Mongolia', href: '#', description: 'Eagle hunters & Altai' },
          ],
        },
        {
          title: 'Featured Trips',
          icon: Star,
          items: [
            { label: 'Desert Adventures', href: '#', description: 'Camel treks & stargazing' },
            { label: 'Nomadic Culture Tours', href: '#', description: 'Ger stays with local families' },
            { label: 'Horse Trekking', href: '#', description: 'Ride across open steppes' },
            { label: 'Winter Experiences', href: '#', description: 'Ice festivals & snow travel' },
          ],
        },
      ],
    },
  },
  {
    label: 'Experiences',
    key: 'experiences',
    menu: {
      sections: [
        {
          title: 'What to Do',
          icon: Compass,
          items: [
            { label: 'Cultural Experiences', href: '#', icon: Tent, description: 'Ger stays, ceremonies & traditions' },
            { label: 'Nature Adventures', href: '#', icon: Mountain, description: 'Hiking, trekking & camping' },
            { label: 'Horse Riding', href: '#', icon: Wind, description: 'Steppe rides & multi-day treks' },
            { label: 'Nomadic Life', href: '#', icon: Tent, description: 'Live with herder families' },
            { label: 'Photography Tours', href: '#', icon: Camera, description: 'Landscapes & golden light' },
            { label: 'Food Experiences', href: '#', icon: Utensils, description: 'Local cuisine & cooking' },
          ],
        },
      ],
    },
  },
  {
    label: 'Tours',
    key: 'tours',
    menu: {
      sections: [
        {
          title: 'Browse by Duration',
          icon: Clock,
          items: [
            { label: '1-Day Tours', href: '#', description: 'Perfect for short visits' },
            { label: '3-Day Trips', href: '#', description: 'Weekend escapes' },
            { label: '1-Week Adventures', href: '#', description: 'Deep cultural immersion' },
            { label: '2-Week Expeditions', href: '#', description: 'The ultimate Mongolia' },
          ],
        },
        {
          title: 'Browse by Style',
          icon: Users,
          items: [
            { label: 'Private Tours', href: '#', description: 'Tailored just for you' },
            { label: 'Group Tours', href: '#', description: 'Meet fellow travellers' },
            { label: 'Luxury Tours', href: '#', description: 'Premium lodges & guides' },
            { label: 'Budget Tours', href: '#', description: 'Great value adventures' },
          ],
        },
      ],
    },
  },
  {
    label: 'Trip Planner',
    key: 'trip-planner',
    menu: {
      sections: [
        {
          title: 'Plan Your Journey',
          icon: CalendarDays,
          items: [
            { label: 'Build Your Trip', href: '#', icon: Wand2, description: 'Create a custom itinerary' },
            { label: 'Suggested Itineraries', href: '#', icon: Lightbulb, description: 'Curated routes & schedules' },
            { label: 'Custom Tour Request', href: '#', icon: Map, description: 'We design your dream trip' },
            { label: 'Travel Planning Tools', href: '#', icon: CalendarDays, description: 'Packing lists, visa info & more' },
          ],
        },
      ],
    },
  },
  {
    label: 'Travel Guides',
    key: 'travel-guides',
    href: '#',
  },
] as const
