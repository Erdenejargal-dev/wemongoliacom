'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

export default function Info() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const infoCards = [
    {
      title: 'Culture & Heritage',
      description: 'Discover the rich cultural heritage of Mongolia, from ancient monasteries to traditional nomadic lifestyle.',
    },
    {
      title: 'Natural Wonders',
      description: 'Explore breathtaking landscapes including the Gobi Desert, pristine lakes, and vast steppes.',
    },
    {
      title: 'Adventure Tourism',
      description: 'Experience thrilling adventures like horseback riding, eagle hunting, and desert camping.',
    },
    {
      title: 'Modern Mongolia',
      description: 'Witness the dynamic growth of Ulaanbaatar and Mongolia\'s emerging tech scene.',
    },
  ];

  return (
    <section id="info" className="min-h-screen bg-gray-50 py-20 px-4 flex items-center">
      <div ref={ref} className="max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {infoCards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 60 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
              transition={{ 
                duration: 0.6, 
                ease: "easeOut",
                delay: index * 0.15 
              }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="bg-white rounded-xl p-8 shadow-lg hover:shadow-2xl transition-shadow duration-300"
            >
              <h3 className="text-2xl md:text-3xl font-bold text-brand-500 mb-4 tracking-wide">
                {card.title}
              </h3>
              <p className="text-lg text-gray-700 leading-relaxed">
                {card.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
