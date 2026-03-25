'use client'

import Link from 'next/link'
import { Fragment } from 'react'

const SECTIONS = [
  {
    heading: 'Explore',
    links: [
      { label: 'Tours & Experiences', href: '/tours' },
      { label: 'Destinations', href: '/destinations' },
      { label: 'Travel Planning', href: '/travel-board' },
      { label: 'How It Works', href: '/how-it-works' },
    ],
  },
  {
    heading: 'Hosting',
    links: [
      { label: 'Become a Host', href: '/onboarding' },
      { label: 'Business Portal', href: '/dashboard/business' },
      { label: 'Provider Resources', href: '/help/provider-guidelines' },
      { label: 'Hosting Standards', href: '/help/standards' },
    ],
  },
  {
    heading: 'Support',
    links: [
      { label: 'Help Center', href: '/help' },
      { label: 'Booking Support', href: '/help/bookings' },
      { label: 'Trust & Safety', href: '/trust' },
      { label: 'Cancellation Policy', href: '/help/cancellation' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Our Mission', href: '/about#mission' },
      { label: 'Partnerships', href: '/partnerships' },
      { label: 'Contact', href: '/contact' },
    ],
  },
]

const LEGAL = [
  { label: 'Terms', href: '/terms' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Cookies', href: '/cookies' },
  { label: 'Sitemap', href: '/sitemap' },
]

function NavColumn({ heading, links }: (typeof SECTIONS)[number]) {
  return (
    <nav aria-label={heading}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8a8884] mb-6">
        {heading}
      </p>
      <ul className="space-y-[18px]">
        {links.map(link => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="text-[13.5px] text-[#56554f] hover:text-[#1c1c1e] transition-colors duration-[350ms]"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default function Footer() {
  return (
    <footer className="bg-[#faf9f7] antialiased selection:bg-[#1db681]/10">

      {/* ═══ Layer 1 — Brand ═══════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-20 sm:pt-24 pb-14 sm:pb-16">
          <img
            src="/wemongolia.svg"
            alt="WeMongolia"
            className="h-8 w-auto"
          />
          <div className="mt-10 max-w-md">
            <p className="text-[18px] leading-[1.55] font-normal text-[#3a3935] tracking-[-0.015em]">
              A more thoughtful way to explore Mongolia.
            </p>
            <p className="mt-3 text-[13px] leading-relaxed text-[#9c9a95]">
              Trusted tours, stays, and transport — from local hosts who know it best.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-px bg-[#e8e7e2]" />
      </div>

      {/* ═══ Layer 2 — Navigation ══════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-14 sm:py-16">

          {/* Desktop: flex row with vertical dividers */}
          <div className="hidden sm:flex">
            {SECTIONS.map((section, i) => (
              <Fragment key={section.heading}>
                {i > 0 && (
                  <div className="w-px shrink-0 bg-[#e8e7e2]" aria-hidden="true" />
                )}
                <div className={`flex-1 ${i === 0 ? 'pr-10' : i === SECTIONS.length - 1 ? 'pl-10' : 'px-10'}`}>
                  <NavColumn {...section} />
                </div>
              </Fragment>
            ))}
          </div>

          {/* Mobile: 2-col grid, no dividers */}
          <div className="sm:hidden grid grid-cols-2 gap-x-8 gap-y-14">
            {SECTIONS.map(section => (
              <NavColumn key={section.heading} {...section} />
            ))}
          </div>

        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-px bg-[#e8e7e2]" />
      </div>

      {/* ═══ Layer 3 — Legal / Meta ════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 sm:py-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <span className="text-[12px] text-[#b0aea9] whitespace-nowrap">
              © {new Date().getFullYear()} WeMongolia, Inc.
            </span>
            <nav className="flex flex-wrap items-center gap-y-2" aria-label="Legal">
              {LEGAL.map((link, i) => (
                <span key={link.label} className="inline-flex items-center">
                  {i > 0 && (
                    <span
                      className="mx-3 inline-block h-[10px] w-px bg-[#dddcd8]"
                      aria-hidden="true"
                    />
                  )}
                  <Link
                    href={link.href}
                    className="text-[12px] text-[#86847f] hover:text-[#3a3935] transition-colors duration-[350ms]"
                  >
                    {link.label}
                  </Link>
                </span>
              ))}
            </nav>
          </div>

          <p className="text-[12px] text-[#b0aea9]">
            Mongolia&ensp;·&ensp;English&ensp;·&ensp;USD
          </p>
        </div>
      </div>
    </footer>
  )
}
