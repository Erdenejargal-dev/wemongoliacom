"use client";

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function HeroGsap() {
  const heroRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const shapesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate title letters
      const titleChars = titleRef.current?.querySelectorAll('.char');
      if (titleChars) {
        gsap.from(titleChars, {
          opacity: 0,
          y: 100,
          rotationX: -90,
          stagger: 0.05,
          duration: 1,
          ease: 'back.out(1.7)',
          delay: 0.3,
        });
      }

      // Animate subtitle
      gsap.from(subtitleRef.current, {
        opacity: 0,
        y: 30,
        duration: 1,
        delay: 1.5,
        ease: 'power3.out',
      });

      // Animate scroll indicator
      gsap.from(scrollRef.current, {
        opacity: 0,
        y: -30,
        duration: 1,
        delay: 2,
        ease: 'power3.out',
      });

      // Continuous bounce animation for scroll indicator
      gsap.to(scrollRef.current, {
        y: 15,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
        delay: 2.5,
      });

      // Animate floating shapes
      const shapes = shapesRef.current?.querySelectorAll('.shape');
      shapes?.forEach((shape, index) => {
        gsap.to(shape, {
          y: `${Math.random() * 100 - 50}`,
          x: `${Math.random() * 100 - 50}`,
          rotation: Math.random() * 360,
          duration: 3 + Math.random() * 2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: index * 0.2,
        });
      });

      // Parallax effect on scroll
      gsap.to(heroRef.current, {
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
        y: 200,
        opacity: 0.5,
        scale: 1.1,
      });

    }, heroRef);

    return () => ctx.revert();
  }, []);

  const splitText = (text: string) => {
    return text.split('').map((char, index) => (
      <span key={index} className="char inline-block">
        {char === ' ' ? '\u00A0' : char}
      </span>
    ));
  };

  return (
    <section
      ref={heroRef}
      className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-gray-900 via-green-900 to-gray-900"
    >
      {/* Floating Geometric Shapes */}
      <div ref={shapesRef} className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="shape absolute top-20 left-10 w-32 h-32 bg-green-500/20 rounded-full blur-xl" />
        <div className="shape absolute top-40 right-20 w-40 h-40 bg-orange-500/20 rounded-lg blur-xl rotate-45" />
        <div className="shape absolute bottom-32 left-1/4 w-24 h-24 bg-pink-500/20 rounded-full blur-xl" />
        <div className="shape absolute top-1/3 right-1/3 w-36 h-36 bg-blue-500/20 blur-xl" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
        <div className="shape absolute bottom-20 right-10 w-28 h-28 bg-purple-500/20 rounded-lg blur-xl -rotate-12" />
      </div>

      {/* Background Image Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1583037189850-1921ae7c6c22?q=80&w=2000')",
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-6 text-center">
        <h1
          ref={titleRef}
          className="text-[60px] sm:text-[100px] md:text-[140px] lg:text-[200px] font-black leading-none tracking-tight mb-6"
        >
          <span className="text-white">{splitText('MON')}</span>
          <span className="text-green-400">{splitText('GO')}</span>
          <span className="text-white">{splitText('LIA')}</span>
        </h1>

        <p
          ref={subtitleRef}
          className="text-white/90 text-lg md:text-2xl font-light tracking-[0.3em] uppercase mb-12"
        >
          Your #1 Travel Consulting Service
        </p>

        {/* Scroll Indicator */}
        <div ref={scrollRef} className="absolute bottom-12 left-1/2 -translate-x-1/2">
          <div className="flex flex-col items-center gap-3">
            <span className="text-white/70 text-sm uppercase tracking-wider">Scroll to Explore</span>
            <div className="w-8 h-12 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
              <div className="w-1.5 h-3 bg-white/70 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Gradient Overlay at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
}
