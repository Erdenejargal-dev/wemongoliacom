import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { WeMongoliaLogo } from '@/components/brand/WeMongoliaLogo'

const STEPS = [
  { n: 1, label: 'Үйлчилгээ' },
  { n: 2, label: 'Бизнесийн мэдээлэл' },
  { n: 3, label: 'Бэлэн боллоо' },
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
        <Link href="/" className="inline-block">
          <WeMongoliaLogo className="h-7 w-auto" />
        </Link>
        <Link href="/" className="text-xs text-gray-500 hover:text-gray-700 transition-colors shrink-0">Гарах</Link>
      </header>

      {/* Hero + Progress */}
      <div className="px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-xl mx-auto text-center mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1.5">
            Захиалга хүлээн авч эхлэх
          </h1>
          <p className="text-sm text-gray-600">
            Цөөн алхамаар бизнесийнхээ профайлыг бүртгээрэй. Бид танд аялагчидтай холбогдоход тусална.
          </p>
          <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full bg-brand-50 text-brand-700 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            2 минутаас бага хугацаа шаардана
          </div>
        </div>

        {/* Progress */}
        <div className="max-w-xl mx-auto">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-semibold text-gray-500">
              Алхам {step} / {STEPS.length}
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
                    done ? 'bg-brand-500' : current ? 'bg-gray-900' : 'bg-gray-200'
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
