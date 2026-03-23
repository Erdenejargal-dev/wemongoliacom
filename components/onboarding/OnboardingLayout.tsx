import Link from 'next/link'
import { Check, Sparkles } from 'lucide-react'

const STEPS = [
  { n: 1, label: 'What you offer' },
  { n: 2, label: 'About you' },
  { n: 3, label: "You're ready" },
]

interface OnboardingLayoutProps {
  step: 1 | 2 | 3
  children: React.ReactNode
}

export function OnboardingLayout({ step, children }: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-100 px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center shrink-0">
            <span className="text-white text-sm font-bold">W</span>
          </div>
          <span className="text-sm font-bold text-gray-900 truncate">WeMongolia</span>
        </Link>
        <Link href="/" className="text-xs text-gray-500 hover:text-gray-700 transition-colors shrink-0">Exit</Link>
      </header>

      {/* Hero + Progress */}
      <div className="px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-xl mx-auto text-center mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1.5">
            Start getting bookings
          </h1>
          <p className="text-sm text-gray-600">
            Set up your business profile in a few steps. We&apos;ll help you reach travelers.
          </p>
          <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            Takes less than 2 minutes
          </div>
        </div>

        {/* Progress: Step X of 3 */}
        <div className="max-w-xl mx-auto">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-semibold text-gray-500">
              Step {step} of {STEPS.length}
            </span>
            <span className="text-xs text-gray-400">{STEPS[step - 1].label}</span>
          </div>
          <div className="flex gap-1">
            {STEPS.map((s) => {
              const done = step > s.n
              const current = step === s.n
              return (
                <div
                  key={s.n}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    done ? 'bg-green-500' : current ? 'bg-gray-900' : 'bg-gray-200'
                  }`}
                  aria-hidden
                />
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 px-4 sm:px-6 pb-10 sm:pb-16">
        <div className="max-w-xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
