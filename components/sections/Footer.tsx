'use client';

import { Facebook, Instagram, Twitter } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

export default function Footer() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.footer 
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="bg-gray-900 text-white py-16 px-4"
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h2 className="text-3xl font-bold tracking-wider mb-2">
              <span className="text-white">MON</span>
              <span className="text-orange-500">GO</span>
              <span className="text-white">LIA</span>
            </h2>
            <p className="text-gray-400 tracking-widest text-sm">ALWAYS MOVING</p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h4 className="text-lg font-bold text-green-500 mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#home" className="text-gray-300 hover:text-green-500 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="#about" className="text-gray-300 hover:text-green-500 transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="#travel" className="text-gray-300 hover:text-green-500 transition-colors">
                  Travel
                </Link>
              </li>
              <li>
                <Link href="#info" className="text-gray-300 hover:text-green-500 transition-colors">
                  Information
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h4 className="text-lg font-bold text-green-500 mb-4">Contact</h4>
            <ul className="space-y-2 text-gray-300">
              <li>Email: info@gomongolia.gov.mn</li>
              <li>Phone: +976 11 123456</li>
              <li>Address: Ulaanbaatar, Mongolia</li>
            </ul>
          </motion.div>

          {/* Social */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h4 className="text-lg font-bold text-green-500 mb-4">Follow Us</h4>
            <div className="flex gap-4">
              <motion.a
                whileHover={{ y: -4, scale: 1.05 }}
                transition={{ duration: 0.2 }}
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-green-500 transition-colors"
              >
                <Facebook size={20} />
              </motion.a>
              <motion.a
                whileHover={{ y: -4, scale: 1.05 }}
                transition={{ duration: 0.2 }}
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-green-500 transition-colors"
              >
                <Instagram size={20} />
              </motion.a>
              <motion.a
                whileHover={{ y: -4, scale: 1.05 }}
                transition={{ duration: 0.2 }}
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-green-500 transition-colors"
              >
                <Twitter size={20} />
              </motion.a>
            </div>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="border-t border-gray-800 pt-8 text-center"
        >
          <p className="text-gray-500 text-sm">
            &copy; 2026 Mongolia Tourism. All rights reserved.
          </p>
        </motion.div>
      </div>
    </motion.footer>
  );
}
