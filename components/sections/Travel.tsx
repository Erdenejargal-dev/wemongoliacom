'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

export default function Travel() {
  const ref1 = useRef(null);
  const ref2 = useRef(null);
  const ref3 = useRef(null);
  const ref4 = useRef(null);
  
  const isInView1 = useInView(ref1, { once: true, margin: "-100px" });
  const isInView2 = useInView(ref2, { once: true, margin: "-100px" });
  const isInView3 = useInView(ref3, { once: true, margin: "-100px" });
  const isInView4 = useInView(ref4, { once: true, margin: "-100px" });

  return (
    <section id="travel" className="min-h-screen bg-white py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Title */}
        <motion.h2 
          ref={ref1}
          initial={{ opacity: 0, y: 40 }}
          animate={isInView1 ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-4xl md:text-6xl font-bold mb-12 tracking-wider"
        >
          <span className="text-gray-600">MON</span>
          <span className="text-green-500">GO</span>
          <span className="text-gray-600">LIA</span>
          {' '}
          <span className="text-green-500">TRAVEL</span>
        </motion.h2>

        {/* Main Image */}
        <motion.div 
          ref={ref2}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView2 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-12"
        >
          <div 
            className="w-full h-96 rounded-xl shadow-xl"
            style={{
              backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), url(https://images.unsplash.com/photo-1584646098378-0874589d76b1?q=80&w=2000)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        </motion.div>

        {/* Info Box */}
        <motion.div 
          ref={ref3}
          initial={{ opacity: 0, y: 60 }}
          animate={isInView3 ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="bg-gray-50 rounded-xl p-8 md:p-12 mb-12"
        >
          <h3 className="text-2xl md:text-3xl font-bold mb-6 tracking-wide">
            <span className="text-gray-600">MON</span>
            <span className="text-gray-600">GO</span>
            <span className="text-gray-600">LIA</span>
            {' '}WHERE THERE&apos;S MORE THAN MEETS THE EYE
          </h3>
          <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
            Mongolia is a place of endless opportunity for all types of traveller. Whether you 
            want to experience the serenity of the Erdene Zuu Monastery, go on a pulse-racing 
            Gobi Desert adventure or explore something more urban, travelling to Mongolia reveals 
            countless unique, hidden (and not so hidden) gems. There&apos;s something for everyone.
          </p>
        </motion.div>

        {/* Destination Image */}
        <motion.div 
          ref={ref4}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView4 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div 
            className="w-full h-96 rounded-xl shadow-xl"
            style={{
              backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), url(https://images.unsplash.com/photo-1517400508447-f8dd518b86db?q=80&w=2000)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        </motion.div>
      </div>
    </section>
  );
}
