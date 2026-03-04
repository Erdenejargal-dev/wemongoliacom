"use client";

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

export default function InvestSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const investCards = [
    {
      title: "EXTREME ADVENTURES",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800",
    },
    {
      title: "TRADITIONAL EXPERIENCES",
      image: "https://images.unsplash.com/photo-1609137144813-7d9921338f24?q=80&w=800",
    },
    {
      title: "LUXURY TRAVEL",
      image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?q=80&w=800",
    },
    {
      title: "CUSTOM ITINERARIES",
      image: "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?q=80&w=800",
    },
  ];

  return (
    <section ref={ref} id="invest" className="bg-white py-12 sm:py-16 md:py-20 px-3 sm:px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section Title */}
        <motion.h2 
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8 }}
          className="text-3xl sm:text-4xl md:text-5xl font-black mb-8 sm:mb-10 md:mb-12"
        >
          <span className="text-gray-900">WE MON</span>
          <span className="text-green-500">GO</span>
          <span className="text-gray-900">LIA</span>
          <br />
          <span className="text-red-500">SERVICES</span>
        </motion.h2>

        {/* Main Feature */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative mb-8"
        >
          <div className="grid md:grid-cols-2 gap-0 rounded-2xl overflow-hidden">
            {/* Info Cards Stack */}
            <div className="relative z-10 flex flex-col gap-4 p-6 md:p-0 md:absolute md:left-6 md:top-1/2 md:-translate-y-1/2 md:w-80">
              {/* White Card 1 */}
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-white rounded-xl p-5 shadow-lg"
              >
                <h4 className="font-black text-sm mb-2">
                  <span className="text-gray-900">WE MON</span>
                  <span className="text-green-500">GO</span>
                  <span className="text-gray-900">LIA</span>
                  <span className="text-gray-900 ml-1">COMPREHENSIVE INSURANCE</span>
                </h4>
                <p className="text-gray-600 text-sm">All trips include full travel insurance coverage for your peace of mind.</p>
              </motion.div>

              {/* White Card 2 */}
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="bg-white rounded-xl p-5 shadow-lg"
              >
                <h4 className="font-black text-sm mb-2">
                  NO WAITING TIMES
                  <br />
                  <span className="text-gray-900">INSTANT</span>
                  <span className="text-green-500"> BOOKING</span>
                </h4>
                <p className="text-gray-600 text-sm">Quick and efficient travel planning without delays. Your adventure starts immediately.</p>
              </motion.div>

              {/* Turquoise Card */}
              <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="bg-[#2ED8A7] rounded-xl p-5"
              >
                <h4 className="font-black text-sm mb-2 text-gray-900">
                  <span className="text-gray-900">TAILORED</span>
                  <span className="text-green-900"> EXPERIENCES</span>
                  <span className="text-gray-900 ml-1">FOR EVERY NEED</span>
                </h4>
                <p className="text-gray-800 text-sm">From extreme adventures to luxury retreats, we customize every detail to match your preferences.</p>
              </motion.div>
            </div>

            {/* Large Image */}
            <div className="md:col-span-2 h-[400px] md:h-[500px]">
              <img
                src="https://ext.same-assets.com/2520781875/2367243968.webp"
                alt="Mining Operation"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </motion.div>

        {/* Investment Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {investCards.map((card, index) => (
            <motion.a
              key={index}
              href="#"
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
              transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
              whileHover={{ y: -8 }}
              className="relative h-48 rounded-2xl overflow-hidden group"
            >
              <img
                src={card.image}
                alt={card.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex flex-col justify-end">
                <h4 className="text-white font-bold text-xs">
                  <span className="text-white">MON</span>
                  <span className="text-green-500">GO</span>
                  <span className="text-white">LIA</span>
                </h4>
                <p className="text-white font-black text-sm">{card.title}</p>
              </div>
              <div className="absolute top-3 right-3 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            </motion.a>
          ))}
        </div>

        {/* Golden Opportunity Card */}
        <motion.div 
          initial={{ opacity: 0, y: 60 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="grid md:grid-cols-2 gap-6 items-center"
        >
          <div className="relative h-80 rounded-2xl overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1504384764586-bb4cdc1707b0?q=80&w=2000"
              alt="Worker at sunset"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm relative">
            <h3 className="text-xl font-black mb-4">
              <span className="text-gray-900">WE MON</span>
              <span className="text-green-500">GO</span>
              <span className="text-gray-900">LIA</span>
              <span className="text-gray-900 ml-2">YOUR TRUSTED TRAVEL PARTNER</span>
            </h3>

            <p className="text-gray-600 mb-6">
              Experience Mongolia like never before with the nation&apos;s premier travel consulting service. We combine expert local knowledge, comprehensive insurance coverage, and personalized itineraries to create unforgettable journeys. From the vast Gobi Desert to the bustling streets of Ulaanbaatar, every adventure is carefully crafted and fully protected.
            </p>

            <a
              href="#travel"
              className="inline-flex items-center gap-2 text-gray-900 font-semibold hover:text-green-500 transition-colors"
            >
              Plan Your Journey
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
