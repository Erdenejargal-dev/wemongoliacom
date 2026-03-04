"use client";

import { useState, useRef } from "react";
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';

interface AccordionItem {
  title: string;
  content: React.ReactNode;
}

export default function WorkLifeSection() {
  const [openIndex, setOpenIndex] = useState<number>(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const accordionItems: AccordionItem[] = [
    {
      title: "Comprehensive Travel Insurance",
      content: (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="flex justify-center">
            <img
              src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=800"
              alt="Travel Insurance"
              className="w-40 h-auto rounded-lg"
            />
          </div>
          <div className="md:col-span-2">
            <p className="text-gray-600 mb-4">
              Every journey with We Mongolia Travel Agency includes comprehensive travel insurance coverage. Your safety and well-being are our priority.
            </p>
            <ul className="space-y-2 text-gray-600 text-sm mb-4">
              <li><strong>Medical Emergency Coverage</strong> – Full medical and hospitalization expenses covered.</li>
              <li><strong>Trip Cancellation Protection</strong> – Get reimbursed if you need to cancel your trip.</li>
              <li><strong>Lost Baggage & Personal Items</strong> – Coverage for lost, stolen, or damaged belongings.</li>
              <li><strong>24/7 Emergency Assistance</strong> – Round-the-clock support wherever you are in Mongolia.</li>
            </ul>
            <p className="text-gray-600 text-sm">
              Travel with complete peace of mind knowing you&apos;re fully protected throughout your Mongolian adventure.
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Extreme Adventure Packages",
      content: (
        <div>
          <p className="text-gray-600 mb-4">
            For thrill-seekers and adventure enthusiasts, we offer extreme experiences that push boundaries while ensuring your safety with full insurance coverage.
          </p>
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h5 className="font-bold mb-2">Adventure Options:</h5>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Gobi Desert Expeditions – Camel trekking and survival experiences</li>
              <li>• Mountain Climbing & Hiking – Conquer Mongolia&apos;s peaks with expert guides</li>
              <li>• Horseback Adventures – Multi-day riding tours across the steppes</li>
              <li>• Winter Ice Festivals – Experience extreme cold weather adventures</li>
            </ul>
          </div>
          <p className="text-gray-600 text-sm">
            All extreme adventures include specialized equipment, expert guides, and comprehensive accident insurance.
          </p>
        </div>
      ),
    },
    {
      title: "Traditional & Cultural Experiences",
      content: (
        <div>
          <p className="text-gray-600 mb-4">
            Immerse yourself in Mongolia&apos;s rich culture and traditions with our carefully curated experiences:
          </p>
          <ul className="space-y-3 text-gray-600">
            <li>
              <strong>Nomadic Family Stays</strong> – Live with local families and experience authentic nomadic lifestyle.
            </li>
            <li>
              <strong>Buddhist Monastery Visits</strong> – Explore ancient temples and participate in meditation sessions.
            </li>
            <li>
              <strong>Naadam Festival Tours</strong> – Witness the three manly sports: wrestling, archery, and horse racing.
            </li>
            <li>
              <strong>Traditional Cuisine Experiences</strong> – Learn to cook authentic Mongolian dishes with local chefs.
            </li>
          </ul>
        </div>
      ),
    },
    {
      title: "Luxury Travel Services",
      content: (
        <div>
          <p className="text-gray-600 mb-4">
            Experience Mongolia in ultimate comfort with our premium luxury travel packages:
          </p>
          <ul className="space-y-2 text-gray-600">
            <li><strong>5-Star Accommodation</strong> – Stay in Mongolia&apos;s finest hotels and luxury ger camps.</li>
            <li><strong>Private Transportation</strong> – Exclusive vehicles with professional drivers for your entire journey.</li>
            <li><strong>VIP Access</strong> – Priority entry to attractions and exclusive cultural experiences.</li>
            <li><strong>Personal Concierge</strong> – Dedicated travel consultant available throughout your trip.</li>
          </ul>
        </div>
      ),
    },
    {
      title: "Custom Itineraries & Support",
      content: (
        <div>
          <p className="text-gray-600 mb-4">
            Every traveler is unique, and so should be every journey. We create personalized itineraries tailored to your specific needs and interests.
          </p>
          <ul className="space-y-2 text-gray-600 mb-4">
            <li><strong>Flexible Planning</strong> – Customize every aspect of your trip from duration to activities.</li>
            <li><strong>No Waiting Times</strong> – Instant booking confirmation and rapid itinerary adjustments.</li>
            <li><strong>Expert Consultation</strong> – Free consultation with our travel specialists before booking.</li>
            <li><strong>Multi-language Support</strong> – Guides available in English, Chinese, Korean, Japanese, and more.</li>
          </ul>
          <p className="text-gray-600">
            Whether you&apos;re planning a solo adventure, family vacation, or group expedition, we handle every detail so you can focus on enjoying Mongolia.
          </p>
        </div>
      ),
    },
  ];

  return (
    <section ref={ref} id="work-life" className="bg-white py-12 sm:py-16 md:py-20 px-3 sm:px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Section Title */}
        <motion.h2 
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.8 }}
          className="text-2xl sm:text-3xl md:text-4xl font-black mb-4 sm:mb-6"
        >
          <span className="text-gray-900">WE MON</span>
          <span className="text-green-500">GO</span>
          <span className="text-gray-900">LIA</span>
          <br className="sm:hidden" />
          <span className="text-red-500 ml-2">TRAVEL WITH CONFIDENCE & PROTECTION</span>
        </motion.h2>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <p className="text-gray-600 text-sm sm:text-base mb-3 sm:mb-4 leading-relaxed">
            At We Mongolia Travel Agency, your safety and peace of mind are our top priorities. Every journey is backed by comprehensive travel insurance and expert consulting services, ensuring you explore Mongolia with complete confidence. From medical emergencies to trip cancellations, we&apos;ve got you covered.
          </p>
          <p className="text-gray-600 text-sm sm:text-base mb-8 sm:mb-10 md:mb-12 leading-relaxed">
            Our dedicated team provides 24/7 support, helping you navigate every aspect of your Mongolian adventure. With instant booking and no waiting times, your dream trip is just a click away.
          </p>
        </motion.div>

        {/* Accordion */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="space-y-0 border-t border-gray-200"
        >
          {accordionItems.map((item, index) => (
            <div key={index} className="border-b border-gray-200">
              <button
                type="button"
                className="w-full flex items-center justify-between py-5 text-left hover:bg-gray-50 transition-colors px-2"
                onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
              >
                <span className="font-bold text-gray-900">{item.title}</span>
                <motion.span 
                  animate={{ 
                    backgroundColor: openIndex === index ? '#2ED8A7' : '#f3f4f6',
                    rotate: openIndex === index ? 180 : 0
                  }}
                  transition={{ duration: 0.3 }}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                >
                  {openIndex === index ? (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  )}
                </motion.span>
              </button>

              <motion.div
                initial={false}
                animate={{
                  height: openIndex === index ? "auto" : 0,
                  opacity: openIndex === index ? 1 : 0
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="pb-6 px-2">
                  {item.content}
                </div>
              </motion.div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
