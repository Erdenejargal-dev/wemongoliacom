"use client";

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

export default function TravelSectionNew() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} id="travel" className="bg-white py-12 sm:py-16 md:py-20 px-3 sm:px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section Title */}
        <motion.h2 
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8 }}
          className="text-3xl sm:text-4xl md:text-5xl font-black mb-8 sm:mb-10 md:mb-12"
        >
          <span className="text-gray-900">WE MON</span>
          <span className="text-brand-500">GO</span>
          <span className="text-gray-900">LIA</span>
          <span className="text-brand-500 ml-2 sm:ml-4">EXPERIENCES</span>
        </motion.h2>

        {/* Main Feature Card */}
        <motion.div 
          initial={{ opacity: 0, y: 60 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid md:grid-cols-2 gap-6 mb-8"
        >
          {/* Left - Image */}
          <div className="relative h-[500px] rounded-2xl overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1609137144813-7d9921338f24?q=80&w=2000"
              alt="Mongolian Yurt"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Right - Info Cards */}
          <div className="flex flex-col gap-4">
            {/* White Card */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
            >
              <h3 className="text-lg font-black mb-3">
                <span className="text-gray-900">MON</span>
                <span className="text-brand-500">GO</span>
                <span className="text-gray-900">LIA</span>
                <span className="text-gray-900 ml-2">WHERE THERE&apos;S MORE THAN MEETS THE EYE</span>
              </h3>
              <div className="w-16 h-0.5 bg-orange-500 mb-4" />
              <p className="text-gray-600 text-sm mb-4">
                Mongolia is a place of endless opportunity for all types of traveller. Whether you want to experience the serenity of the Erdene Zuu Monastery, go on a pulse-racing Gobi Desert adventure or explore something more urban, travelling to Mongolia reveals countless unique, hidden (and not so hidden) gems. There&apos;s something for everyone.
              </p>
              <img
                src="https://images.unsplash.com/photo-1517400508447-f8dd518b86db?q=80&w=2000"
                alt="Mongolia Landscape"
                className="w-full h-32 object-cover rounded-lg"
              />
            </motion.div>

            {/* Orange Card */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-orange-500 rounded-2xl p-6 text-white"
            >
              <h3 className="text-lg font-black mb-2">
                <span className="text-white">MON</span>
                <span className="text-brand-800">GO</span>
                <span className="text-white">LIA</span>
                <span className="text-white ml-2">BEYOND EVERYDAY ADVENTURE</span>
              </h3>
              <p className="text-white/90 text-sm">
                Lonely Planet and National Geographic have both made it clear – now is the time to visit Mongolia.
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Feature Cards Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="grid md:grid-cols-2 gap-6 mb-8"
        >
          {/* Know Before You Go */}
          <a
            href="#"
            className="relative h-32 rounded-2xl overflow-hidden group"
          >
            <img
              src="https://images.unsplash.com/photo-1564399579883-451a5d44ec08?q=80&w=2000"
              alt="Know Before You Go"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20 p-6 flex flex-col justify-end">
              <h4 className="text-white font-black text-lg mb-1">KNOW BEFORE YOU GO</h4>
              <p className="text-white/80 text-xs">
                Mongolia is as wild as it is wonderful, and a little planning goes a long way. From visas to weather, here&apos;s everything you need to know before your adventure begins.
              </p>
            </div>
            <div className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </a>

          {/* Experience Mongolia */}
          <a
            href="#"
            className="relative h-32 rounded-2xl overflow-hidden group"
          >
            <img
              src="https://images.unsplash.com/photo-1584646098378-0874589d76b1?q=80&w=2000"
              alt="Experience Mongolia"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20 p-6 flex flex-col justify-end">
              <h4 className="text-white font-black text-lg mb-1">EXPERIENCE MONGOLIA</h4>
              <p className="text-white/80 text-xs">
                Whether you&apos;re a sightseeing, checklist-ticking traveller or a spontaneous, go with the wind adventurer, no two visits to Mongolia are ever the same.
              </p>
            </div>
            <div className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </a>
        </motion.div>

        {/* Action Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="grid md:grid-cols-3 gap-6"
        >
          {/* Travel Packages */}
          <a
            href="https://hk.trip.com/sale/w/15542/mongolia.html"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow group"
          >
            <div className="flex justify-between items-start mb-4">
              <h4 className="font-black text-sm">
                THE TRAVEL PACKAGES YOU NEED TO<br />
                <span className="text-gray-900">MON</span>
                <span className="text-brand-500">GO</span>
                <span className="text-gray-900">LIA</span>
              </h4>
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
            </div>
            <p className="text-gray-600 text-sm">
              Book travel packages and more via trip.com to make the most of your trip.
            </p>
          </a>

          {/* Get Your Visa */}
          <a
            href="https://www.evisa.mn/en"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow group"
          >
            <div className="flex justify-between items-start mb-4">
              <h4 className="font-black text-sm">
                GET YOUR VISA TO<br />
                <span className="text-gray-900">MON</span>
                <span className="text-brand-500">GO</span>
                <span className="text-gray-900">LIA</span>
              </h4>
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
            </div>
            <p className="text-gray-600 text-sm">
              Mongolia E-Visa Application
            </p>
          </a>

          {/* Athletes Image */}
          <div className="relative rounded-2xl overflow-hidden h-48">
            <img
              src="https://images.unsplash.com/photo-1590735213920-68192a487bc2?q=80&w=2000"
              alt="Mongolian Athletes"
              className="w-full h-full object-cover"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
