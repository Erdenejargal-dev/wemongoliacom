'use client';

import { ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Hero() {
  return (
    <section 
      id="home" 
      className="h-screen relative flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
      style={{
        backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=2000)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="text-center px-4">
        <motion.h1 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-6xl md:text-8xl lg:text-9xl font-bold text-white tracking-[0.2em] mb-4"
        >
          <span className="text-white">MON</span>
          <span className="text-orange-500">GO</span>
          <span className="text-white">LIA</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
          className="text-xl md:text-3xl text-white tracking-[0.3em] font-light"
        >
          ALWAYS • MOVING
        </motion.p>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.8 }}
        className="absolute bottom-12 left-1/2 transform -translate-x-1/2 text-center"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="text-white w-10 h-10 mx-auto mb-2" />
          <p className="text-white text-sm tracking-widest">
            SCROLL DOWN<br />TO EXPLORE
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}
