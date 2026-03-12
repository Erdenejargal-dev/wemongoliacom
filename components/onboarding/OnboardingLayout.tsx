import Link from 'next/link'
import { Check } from 'lucide-react'

const STEPS = [
  { n: 1, label: 'Business Info'   },
  { n: 2, label: 'Service Types'   },
  { n: 3, label: 'Profile Setup'   },
]

interface OnboardingLayoutProps {
  step: 1 | 2 | 3
  children: React.ReactNode
}

export function OnboardingLayout({ step, children }: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50/30 flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-green-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">W</span>
          </div>
          <span className="text-sm font-bold text-gray-900">WeMongolia</span>
          <span className="text-xs text-gray-400 hidden sm:inline">· Provider Onboarding</span>
        </Link>
        <Link href="/" className="text-xs text-gray-500 hover:text-gray-700 transition-colors">Exit</Link>
      </header>

      {/* Progress stepper */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            {STEPS.map((s, i) => {
              const done    = step > s.n
              const current = step === s.n
              return (
                <div key={s.n} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${done ? 'bg-green-500 text-white' : current ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400'}`}>
                      {done ? <Check className="w-4 h-4" /> : s.n}
                    </div>
                    <span className={`text-[10px] font-semibold mt-1 whitespace-nowrap ${current ? 'text-gray-900' : done ? 'text-green-600' : 'text-gray-400'}`}>
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-3 mb-4 ${step > s.n ? 'bg-green-400' : 'bg-gray-200'}`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-2xl">
          {children}
        </div>
      </main>
    </div>
  )
}
