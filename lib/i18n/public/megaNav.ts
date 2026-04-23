/**
 * Top navigation + desktop mega menu copy (labels + item blurbs).
 * Hrefs and structure live in `mega-menu-data.ts`; this file is copy only.
 */

export type MegaNavItemCopy = { label: string; description: string }

export type MegaNavBundle = {
  rootDestinations: string
  rootTours: string
  rootStays: string
  popularTitle: string
  browseTitle: string
  popular: MegaNavItemCopy[]
  browse: MegaNavItemCopy[]
}

export const megaNavEn: MegaNavBundle = {
  rootDestinations: 'Destinations',
  rootTours: 'Tours',
  rootStays: 'Stays',
  popularTitle: 'Popular Destinations',
  browseTitle: 'Browse',
  popular: [
    { label: 'Gobi Desert', description: 'Dunes, canyons & ancient fossils' },
    { label: 'Lake Khövsgöl', description: "Mongolia's pristine Blue Pearl" },
    { label: 'Altai Mountains', description: 'Eagle hunters & glacier peaks' },
    { label: 'Ulaanbaatar', description: "The world's most surprising capital" },
    { label: 'Terelj National Park', description: 'Dramatic granite, 55km from UB' },
    { label: 'Orkhon Valley', description: 'UNESCO World Heritage landscape' },
  ],
  browse: [
    { label: 'All Destinations', description: 'Explore every region of Mongolia' },
    { label: 'All Tours', description: 'Browse scheduled tours & packages' },
    { label: 'All Stays', description: 'Ger camps, hotels & lodges' },
  ],
}

export const megaNavMn: MegaNavBundle = {
  rootDestinations: 'Чиглэлүүд',
  rootTours: 'Аяллууд',
  rootStays: 'Буудал, камп',
  popularTitle: 'Алдартай чиглэлүүд',
  browseTitle: 'Үзэх',
  popular: [
    { label: 'Говь цөл', description: 'Элс, хавцал, олдворууд' },
    { label: 'Хөвсгөл нуур', description: 'Монголын “Цэнхэр суврага”' },
    { label: 'Алтайн нуруу', description: 'Мөсөн гол' },
    { label: 'Улаанбаатар', description: 'Өнгө аястай нийслэл' },
    { label: 'Тэрэлж', description: 'UB-аас 55 км ой толгод' },
    { label: 'Орхонын хөндий', description: 'ДУТ үзлэг' },
  ],
  browse: [
    { label: 'Бүх чиглэл', description: 'Монголын бүс нутгууд' },
    { label: 'Бүх аялал', description: 'Хуваарьт аялал, багц' },
    { label: 'Бүх хоноглох', description: 'Гэр, зочид буудал' },
  ],
}
