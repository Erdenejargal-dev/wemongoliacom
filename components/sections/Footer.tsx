'use client'

import Link from 'next/link'
import { Fragment } from 'react'
import { WeMongoliaLogo } from '@/components/brand/WeMongoliaLogo'
import { Button } from '@/components/ui/button'
import { useTranslations } from '@/lib/i18n'
import type { FooterColumn } from '@/lib/i18n/messages/footer'

function NavColumn({ column }: { column: FooterColumn }) {
  const { heading, links } = column
  return (
    <nav aria-label={heading}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-100 mb-5">
        {heading}
      </p>
      <ul className="space-y-4">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-gray-200 hover:text-white transition-colors duration-200"
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
  const { t } = useTranslations()
  const f = t.footer
  const year = new Date().getFullYear()
  const sections = f.sections

  return (
    <footer className="w-full px-4 pb-4 md:px-6 md:pb-6 lg:px-8 lg:pb-8">
      <div className="bg-[#0085C9] rounded-2xl md:rounded-3xl px-6 py-10 md:px-10 md:py-12 lg:px-16 lg:py-16">

        {/* ═══ CTA Section ══════════════════════════════════ */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-10 md:pb-12 border-b border-white/10">
          <div>
            <h2 className="text-white text-xl md:text-2xl font-semibold tracking-tight mb-2">
              {f.ctaTitle}
            </h2>
            <p className="text-gray-100 text-sm md:text-base">
              {f.ctaSubtitle}
            </p>
          </div>
          <Button
            asChild
            variant="outline"
            className="bg-transparent border-gray-600 text-white hover:bg-white/5 hover:text-white hover:border-gray-500 px-5 py-2.5 h-auto text-sm font-medium rounded-lg w-fit transition-all"
          >
            <Link href="/tours">{f.ctaButton}</Link>
          </Button>
        </div>

        {/* ═══ Main Content ═════════════════════════════════ */}
        <div className="pt-10 md:pt-12">

          {/* Brand row */}
          <div className="mb-10 md:mb-12">
            <div className="flex items-center gap-2.5 mb-4">
              <WeMongoliaLogo className="h-7 w-auto brightness-0 invert" />
            </div>
            <p className="text-gray-100 text-sm leading-relaxed max-w-xs">
              {f.brandTagline}
            </p>
          </div>

          {/* Navigation columns */}
          <div className="hidden sm:flex">
            {sections.map((section, i) => (
              <Fragment key={section.heading}>
                {i > 0 && (
                  <div className="w-px shrink-0 bg-white/10" aria-hidden="true" />
                )}
                <div
                  className={
                    i === 0
                      ? 'flex-1 pr-8 lg:pr-12'
                      : i === sections.length - 1
                      ? 'flex-1 pl-8 lg:pl-12'
                      : 'flex-1 px-8 lg:px-12'
                  }
                >
                  <NavColumn column={section} />
                </div>
              </Fragment>
            ))}
          </div>

          <div className="sm:hidden grid grid-cols-2 gap-x-8 gap-y-10">
            {sections.map((section) => (
              <NavColumn key={section.heading} column={section} />
            ))}
          </div>

          {/* ═══ Bottom bar ═══════════════════════════════════ */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-10 md:pt-12 mt-10 md:mt-12 border-t border-white/10">

            <p className="text-gray-100 text-sm">
              {f.copyright(year)}
            </p>

            <nav className="flex flex-wrap items-center gap-y-2" aria-label={f.legalNavAria}>
              {f.legal.map((link, i) => (
                <span key={link.href} className="inline-flex items-center">
                  {i > 0 && (
                    <span
                      className="mx-3 inline-block h-[10px] w-px bg-white/20"
                      aria-hidden="true"
                    />
                  )}
                  <Link
                    href={link.href}
                    className="text-sm text-gray-100 hover:text-gray-200 transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </span>
              ))}
            </nav>

          </div>
        </div>
      </div>
    </footer>
  )
}
