/**
 * components/layout/navbar/mega-menu-data.ts
 *
 * Main navigation item definitions.
 * Desktop uses MegaMenu dropdowns; mobile reads the same data for accordions.
 *
 * Rules:
 * - Every href must be a real, working route.
 * - No '#' placeholder links.
 * - Removed: Trip Planner, Travel Guides, Experiences — routes do not exist.
 */

import { MapPin, Compass, BedDouble } from 'lucide-react'

export const navItems = [
  // ── Destinations — mega menu with real destination slugs ──────────────────
  {
    label: 'Destinations',
    key:   'destinations',
    menu: {
      sections: [
        {
          title: 'Popular Destinations',
          icon:   MapPin,
          items: [
            { label: 'Gobi Desert',          href: '/destinations/gobi-desert',          description: 'Dunes, canyons & ancient fossils' },
            { label: 'Lake Khövsgöl',         href: '/destinations/lake-khovsgol',         description: "Mongolia's pristine Blue Pearl" },
            { label: 'Altai Mountains',       href: '/destinations/altai-mountains',       description: 'Eagle hunters & glacier peaks' },
            { label: 'Ulaanbaatar',           href: '/destinations/ulaanbaatar',           description: "The world's most surprising capital" },
            { label: 'Terelj National Park',  href: '/destinations/terelj-national-park',  description: 'Dramatic granite, 55km from UB' },
            { label: 'Orkhon Valley',         href: '/destinations/orkhon-valley',         description: 'UNESCO World Heritage landscape' },
          ],
        },
        {
          title: 'Browse',
          icon:   Compass,
          items: [
            { label: 'All Destinations', href: '/destinations', description: 'Explore every region of Mongolia' },
            { label: 'All Tours',        href: '/tours',        description: 'Browse scheduled tours & packages' },
            { label: 'All Stays',        href: '/stays',        description: 'Ger camps, hotels & lodges' },
          ],
        },
      ],
    },
  },

  // ── Tours — direct link (no dropdown needed until filter-page exists) ──────
  {
    label: 'Tours',
    key:   'tours',
    href:  '/tours',
  },

  // ── Stays — direct link ───────────────────────────────────────────────────
  {
    label: 'Stays',
    key:   'stays',
    href:  '/stays',
  },
] as const
