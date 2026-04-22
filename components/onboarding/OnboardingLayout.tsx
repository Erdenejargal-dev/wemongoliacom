'use client'

import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { WeMongoliaLogo } from '@/components/brand/WeMongoliaLogo'
import { useTranslations } from '@/lib/i18n'

interface OnboardingLayoutProps {
  step: 1 | 2 | 3
  children: React.ReactNode
}

export function OnboardingLayout({ step, children }: OnboardingLayoutProps) {
  const { t } = useTranslations()
  const o = t.onboarding
  const l = o.layout
  const stepLabels: [string, string, string] = [l.step1Label, l.step2Label, l.step3Label]

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
      <header className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link href="/" className="inline-block">
          <WeMongoliaLogo className="h-7 w-auto" />
        </Link>
        <Link href="/" className="text-xs text-gray-500 hover:text-gray-700 transition-colors shrink-0">
          {l.exit}
        </Link>
      </header>

      <div className="px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-xl mx-auto text-center mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1.5">
            {l.heroTitle}
          </h1>
          <p className="text-sm text-gray-600">
            {l.heroLead}
          </p>
          <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full bg-brand-50 text-brand-700 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            {l.timeBadge}
          </div>
        </div>

        <div className="max-w-xl mx-auto">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-semibold text-gray-500">
              {o.stepLabel(step, stepLabels.length)}
            </span>
            <span className="text-xs text-gray-400">{stepLabels[step - 1]}</span>
          </div>
          <div className="flex gap-1">
            {stepLabels.map((_, idx) => {
              const s = (idx + 1) as 1 | 2 | 3
              const done = step > s
              const current = step === s
              return (
                <div
                  key={s}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    done ? 'bg-brand-500' : current ? 'bg-gray-900' : 'bg-gray-200'
                  }`}
                  aria-hidden
                />
              )
            })}
          </div>
        </div>
      </div>

      <main className="flex-1 px-4 sm:px-6 pb-10 sm:pb-16">
        <div className="max-w-xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
