"use client";

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

export default function FindOutMoreSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const learnMoreLinks = [
    { title: "Government of Mongolia", url: "https://www.gov.mn/en" },
    { title: "Vision 2050", url: "https://vision2050.gov.mn/eng/" },
    { title: "Invest Mongolia", url: "https://investmongolia.gov.mn/" },
    { title: "Prime Minister of Mongolia", url: "https://www.pmomongolia.com/" },
    { title: "Mongolia House at Davos 2025", url: "#" },
    { title: "Mongolia National News Agency", url: "https://montsame.mn/en/" },
  ];

  const exploreLinks = [
    { title: "Destination Mongolia", url: "https://edition.cnn.com/travel/destinations/mongolia" },
    { title: "Life on the Move", url: "#" },
    { title: "Harnessing Mongolia's Greatest Resource", url: "#" },
  ];

  return (
    <section ref={ref} id="find-out-more" className="bg-white py-20 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section Title */}
        <motion.h2 
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8 }}
          className="text-3xl md:text-4xl font-black mb-12"
        >
          <span className="text-gray-900">MON</span>
          <span className="text-green-500">GO</span>
          <span className="text-gray-900">LIA</span>
          <br />
          <span className="text-orange-500">FIND OUT MORE</span>
        </motion.h2>

        {/* Links Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Learn More About Mongolia */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-gray-50 rounded-2xl p-8 relative"
          >
            {/* Decorative dots */}
            <div className="absolute top-0 right-0 w-24 h-24 opacity-20">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <pattern id="dots1" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1" fill="currentColor" />
                </pattern>
                <rect width="100" height="100" fill="url(#dots1)" />
              </svg>
            </div>

            <h3 className="text-xl font-black mb-6">Learn More About Mongolia</h3>

            <div className="flex flex-wrap gap-3">
              {learnMoreLinks.map((link, index) => (
                <motion.a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-green-500 hover:text-green-500 transition-colors"
                >
                  {link.title}
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Explore Mongolia's Untapped Potential */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-gray-50 rounded-2xl p-8 relative"
          >
            {/* Decorative dots */}
            <div className="absolute top-0 right-0 w-24 h-24 opacity-20">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <pattern id="dots2" x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1" fill="currentColor" />
                </pattern>
                <rect width="100" height="100" fill="url(#dots2)" />
              </svg>
            </div>

            <h3 className="text-xl font-black mb-6">Explore Mongolia&apos;s Untapped Potential</h3>

            <div className="flex flex-wrap gap-3">
              {exploreLinks.map((link, index) => (
                <motion.a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-green-500 hover:text-green-500 transition-colors"
                >
                  {link.title}
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
