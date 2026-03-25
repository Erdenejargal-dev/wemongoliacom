"use client";

import { useState } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const exploreCategories = [
  { id: "all", label: "All", icon: null },
  { id: "nature", label: "Nature & Adventure", icon: "mountain" },
  { id: "culture", label: "Culture & Heritage", icon: "flag" },
  { id: "museums", label: "Must Visit Museums", icon: "building" },
  { id: "family", label: "Family Fun", icon: "users" },
  { id: "unique", label: "Unique Experiences", icon: "star" },
];

const exploreItems = [
  {
    id: 1,
    title: "Gobi Desert",
    subtitle: "Explore its Stark Beauty and Ancient Secrets",
    image: "https://ext.same-assets.com/2520781875/2798077067.webp",
    category: "nature",
    description: "The Gobi Desert is a place of awe-inspiring contrasts and one of Mongolia's most iconic natural wonders.",
  },
  {
    id: 2,
    title: "Kharkhorum (Karakorum) & Erdene Zuu Monastery",
    subtitle: "The Ancient Mongol Capital",
    image: "https://ext.same-assets.com/2520781875/268164889.webp",
    category: "culture",
    description: "Once the bustling capital of the Mongol Empire in the 13th century.",
  },
  {
    id: 3,
    title: "Chinggis Khaan Museum",
    subtitle: "The Largest Museum in Mongolia",
    image: "https://ext.same-assets.com/2520781875/1232143384.webp",
    category: "museums",
    description: "A cutting-edge space dedicated to the legacy of Chinggis Khaan.",
  },
  {
    id: 4,
    title: "Terelj National Park",
    subtitle: "A Perfect Family Getaway",
    image: "https://ext.same-assets.com/2520781875/1343450095.webp",
    category: "family",
    description: "Just an hour's drive from Ulaanbaatar, offering a perfect mix of adventure and relaxation.",
  },
  {
    id: 5,
    title: "Eagle Hunting with Kazakh Nomads",
    subtitle: "A Tradition With No Equal",
    image: "https://ext.same-assets.com/2520781875/595352061.webp",
    category: "unique",
    description: "For over 2,000 years, Kazakh nomads have practiced the ancient tradition of eagle hunting.",
  },
  {
    id: 6,
    title: "Throat Singing & Folk Dance",
    subtitle: "Immerse Yourself in the Culture",
    image: "https://ext.same-assets.com/2520781875/3306913390.webp",
    category: "culture",
    description: "Khoomei and Morin Khuur performances are unique musical traditions.",
  },
];

const festivals = [
  {
    title: "Tsagaan Sar (Mongolian New Year)",
    dates: "1 MAR",
    image: "https://ext.same-assets.com/2520781875/2035272008.webp",
  },
  {
    title: "Naadam",
    dates: "11-13 JUL",
    image: "https://ext.same-assets.com/2520781875/1898367467.webp",
  },
  {
    title: "Silk Road and Kharkhorum Tourism Festival",
    dates: "AUG",
    image: "https://ext.same-assets.com/2520781875/582926859.webp",
  },
];

export default function ExploreExperiencePage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [foodAccordion, setFoodAccordion] = useState(0);
  const [currentFestival, setCurrentFestival] = useState(0);

  const filteredItems = activeCategory === "all"
    ? exploreItems
    : exploreItems.filter(item => item.category === activeCategory);

  const nextFestival = () => {
    setCurrentFestival((prev) => (prev + 1) % festivals.length);
  };

  const prevFestival = () => {
    setCurrentFestival((prev) => (prev - 1 + festivals.length) % festivals.length);
  };

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[70vh] w-full overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('https://ext.same-assets.com/2520781875/1077326873.webp')",
          }}
        />
        <div className="absolute inset-0 bg-black/10" />

        {/* MONGOLIA Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <h1 className="text-[60px] sm:text-[100px] md:text-[140px] lg:text-[180px] font-black leading-none tracking-tight">
            <span className="text-white">MON</span>
            <span className="text-green-500">GO</span>
            <span className="text-white">LIA</span>
          </h1>
          <p className="text-white text-sm md:text-lg tracking-[0.3em] mt-2">
            • EXPLORE & EXPERIENCE •
          </p>
        </div>

        {/* Navigation Pills */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2 md:gap-3 px-4">
          <a href="#explore" className="flex items-center gap-2 px-4 md:px-6 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white font-semibold text-xs md:text-sm hover:bg-white/30 transition-all">
            Explore
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </a>
          <a href="#eat-like-a-local" className="flex items-center gap-2 px-4 md:px-6 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white font-semibold text-xs md:text-sm hover:bg-white/30 transition-all">
            Eat like a local
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </a>
          <a href="#shop" className="flex items-center gap-2 px-4 md:px-6 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white font-semibold text-xs md:text-sm hover:bg-white/30 transition-all">
            Shop
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </a>
          <a href="#events-festivals" className="hidden md:flex items-center gap-2 px-4 md:px-6 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white font-semibold text-xs md:text-sm hover:bg-white/30 transition-all">
            Events & Festivals
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </a>
        </div>
      </section>

      {/* Explore Section */}
      <section id="explore" className="bg-white py-16 md:py-20 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-black text-pink-500 mb-8">EXPLORE</h2>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 md:gap-3 mb-10">
            {exploreCategories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                  activeCategory === cat.id
                    ? "bg-pink-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Explore Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {filteredItems.map((item) => (
              <article key={item.id} className="bg-orange-50 rounded-2xl overflow-hidden group">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{item.title}</h3>
                    <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">{item.subtitle}</p>
                  <a href="#" className="inline-flex items-center gap-1 text-gray-900 font-semibold text-sm hover:text-pink-500 transition-colors">
                    Read more
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </a>
                </div>
                <div className="h-64 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </article>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-10">
            <button type="button" className="inline-flex items-center gap-2 text-gray-900 font-semibold border-b-2 border-gray-900 pb-1 hover:text-orange-500 hover:border-orange-500 transition-colors">
              Load More
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Eat Like a Local Section */}
      <section id="eat-like-a-local" className="bg-white py-16 md:py-20 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-black text-orange-500 mb-8">EAT LIKE A LOCAL</h2>

          <p className="text-lg text-gray-700 mb-10">
            Mongolia&apos;s food scene is as bold and fascinating as its landscapes — shaped by centuries of nomadic heritage and now spiced with modern flair. From steamy meat dumplings to trendy cafés in Ulaanbaatar, Mongolian cuisine is a journey in itself. So bring your appetite — there&apos;s a lot to discover.
          </p>

          {/* Food Accordion */}
          <div className="border-t border-gray-200">
            <div className="border-b border-gray-200">
              <button
                type="button"
                className="w-full flex items-center justify-between py-5 text-left"
                onClick={() => setFoodAccordion(foodAccordion === 0 ? -1 : 0)}
              >
                <span className="font-bold text-gray-900">Mongolia: A Taste of the Nomadic Spirit</span>
                <span className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${foodAccordion === 0 ? 'bg-orange-500 text-white' : 'bg-gray-100'}`}>
                  {foodAccordion === 0 ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  )}
                </span>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${foodAccordion === 0 ? 'max-h-[500px] pb-6' : 'max-h-0'}`}>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <img
                      src="https://ext.same-assets.com/2520781875/2244412607.webp"
                      alt="Mongolian Food"
                      className="w-full h-auto rounded-lg"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-gray-600 mb-4">
                      Mongolian food is built on the backbone of our nomadic lifestyle. Warming, protein-packed, and made for life on the move, every bite tells a story — of survival, season, and a people deeply connected to their land.
                    </p>
                    <ul className="space-y-2 text-gray-600 text-sm">
                      <li><strong>Meat-Lovers&apos; Paradise</strong> – Think tender mutton and rich beef, boiled, grilled, or stewed into dishes that fuel long days on the steppe.</li>
                      <li><strong>Dairy Delights</strong> – From tangy fermented mare&apos;s milk to chewy dried curds, dairy isn&apos;t just food—it&apos;s tradition.</li>
                      <li><strong>Hearty Dough Staples</strong> – Dumplings, noodles, and fried treats make a frequent appearance.</li>
                      <li><strong>Simplicity is Key</strong> – With little access to spices, seasoning stays minimal, letting natural flavors shine.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-b border-gray-200">
              <button
                type="button"
                className="w-full flex items-center justify-between py-5 text-left"
                onClick={() => setFoodAccordion(foodAccordion === 1 ? -1 : 1)}
              >
                <span className="font-bold text-gray-900">Mongolia: The New Flavour Frontier</span>
                <span className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${foodAccordion === 1 ? 'bg-orange-500 text-white' : 'bg-gray-100'}`}>
                  {foodAccordion === 1 ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  )}
                </span>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${foodAccordion === 1 ? 'max-h-[500px] pb-6' : 'max-h-0'}`}>
                <p className="text-gray-600 mb-4">
                  Step into Ulaanbaatar and you&apos;ll find a dining scene that&apos;s buzzing with change. Mongolia&apos;s capital is quickly becoming a hotspot for culinary creativity.
                </p>
                <ul className="space-y-2 text-gray-600 text-sm">
                  <li><strong>Tradition with a Twist</strong> – Chefs are reimagining classic dishes with modern techniques.</li>
                  <li><strong>Global Bites</strong> – Craving sushi, kimchi, or a Western brunch? You&apos;ll find all that and more.</li>
                  <li><strong>Café Culture on the Rise</strong> – Specialty brews and cozy hangouts are popping up all over.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Shop Section */}
      <section id="shop" className="bg-white py-16 md:py-20 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-black text-orange-500 mb-4">SHOP</h2>
          <h3 className="text-xl md:text-2xl text-orange-500 mb-10">What to Buy</h3>

          {/* Shop Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 auto-rows-[180px] md:auto-rows-[200px]">
            {/* Mongolian Cashmere - Tall */}
            <div className="relative row-span-2 rounded-2xl overflow-hidden group cursor-pointer">
              <img
                src="https://ext.same-assets.com/2520781875/3485290746.webp"
                alt="Mongolian Cashmere"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 md:p-6 flex flex-col justify-end">
                <h4 className="text-white font-bold text-sm md:text-base mb-1">MONGOLIAN CASHMERE</h4>
                <p className="text-white/80 text-xs md:text-sm">Renowned globally for its incredible softness, warmth, and durability.</p>
              </div>
            </div>

            {/* Yak Wool - Medium */}
            <div className="relative row-span-1 rounded-2xl overflow-hidden group cursor-pointer">
              <img
                src="https://ext.same-assets.com/2520781875/778287511.webp"
                alt="Yak Wool & Felt Products"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 flex flex-col justify-end">
                <h4 className="text-white font-bold text-xs md:text-sm mb-1">YAK WOOL & FELT</h4>
              </div>
            </div>

            {/* Traditional Clothing - Tall */}
            <div className="relative row-span-2 rounded-2xl overflow-hidden group cursor-pointer">
              <img
                src="https://ext.same-assets.com/2520781875/3290115196.webp"
                alt="Traditional Mongolian Clothing"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 md:p-6 flex flex-col justify-end">
                <h4 className="text-white font-bold text-sm md:text-base mb-1">TRADITIONAL DEEL</h4>
                <p className="text-white/80 text-xs md:text-sm">The traditional robe worn for festivals and ceremonies.</p>
              </div>
            </div>

            {/* Snacks - Medium */}
            <div className="relative row-span-1 rounded-2xl overflow-hidden group cursor-pointer">
              <img
                src="https://ext.same-assets.com/2520781875/3644793404.webp"
                alt="Snacks & Traditional Treats"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 flex flex-col justify-end">
                <h4 className="text-white font-bold text-xs md:text-sm mb-1">TRADITIONAL TREATS</h4>
              </div>
            </div>

            {/* Leather Goods */}
            <div className="relative row-span-2 rounded-2xl overflow-hidden group cursor-pointer">
              <img
                src="https://ext.same-assets.com/2520781875/4058804319.webp"
                alt="Leather Goods"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 md:p-6 flex flex-col justify-end">
                <h4 className="text-white font-bold text-sm md:text-base mb-1">LEATHER GOODS</h4>
              </div>
            </div>

            {/* Art - Wide */}
            <div className="relative row-span-2 col-span-2 rounded-2xl overflow-hidden group cursor-pointer">
              <img
                src="https://ext.same-assets.com/2520781875/2840362998.webp"
                alt="Art & Calligraphy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 md:p-6 flex flex-col justify-end">
                <h4 className="text-white font-bold text-sm md:text-lg mb-1">ART & CALLIGRAPHY</h4>
              </div>
            </div>

            {/* Jewelry */}
            <div className="relative row-span-1 rounded-2xl overflow-hidden group cursor-pointer">
              <img
                src="https://ext.same-assets.com/2520781875/693921060.webp"
                alt="Handmade Jewelry"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 flex flex-col justify-end">
                <h4 className="text-white font-bold text-xs md:text-sm mb-1">JEWELRY</h4>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Events & Festivals Section - Swiper Carousel */}
      <section id="events-festivals" className="bg-white py-16 md:py-20 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-black mb-8">
            <span className="text-orange-500">EVENTS</span>
            <span className="text-pink-500"> & FESTIVALS</span>
          </h2>

          {/* Swiper Carousel */}
          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={24}
            slidesPerView={1}
            navigation={{
              prevEl: '.swiper-button-prev-custom',
              nextEl: '.swiper-button-next-custom',
            }}
            pagination={{
              clickable: true,
              el: '.swiper-pagination-custom',
            }}
            breakpoints={{
              640: {
                slidesPerView: 2,
              },
              1024: {
                slidesPerView: 3,
              },
            }}
            className="!pb-12"
          >
            {festivals.map((festival, index) => (
              <SwiperSlide key={index}>
                <div className="relative h-80 rounded-2xl overflow-hidden group cursor-pointer">
                  <img
                    src={festival.image}
                    alt={festival.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent p-6 flex flex-col justify-between">
                    <div className="self-start px-3 py-1.5 bg-white/90 rounded-lg text-center">
                      <span className="text-xs font-bold text-gray-800">{festival.dates}</span>
                    </div>
                    <h4 className="text-white font-bold text-lg">{festival.title}</h4>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Custom Navigation Buttons */}
          <div className="swiper-button-prev-custom absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-12 h-12 md:w-14 md:h-14 bg-pink-500 hover:bg-pink-600 rounded-full flex items-center justify-center text-white transition-all z-10 shadow-lg cursor-pointer">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </div>
          <div className="swiper-button-next-custom absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-12 h-12 md:w-14 md:h-14 bg-pink-500 hover:bg-pink-600 rounded-full flex items-center justify-center text-white transition-all z-10 shadow-lg cursor-pointer">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>

          {/* Custom Pagination */}
          <div className="swiper-pagination-custom flex justify-center gap-2 mt-6" />
        </div>
      </section>

    </main>
  );
}
