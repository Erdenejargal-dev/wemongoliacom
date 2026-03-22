import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const BENEFITS = [
  { emoji: '🌍', title: 'Reach global travelers', desc: 'Connect with visitors from 50+ countries looking for authentic Mongolian experiences.' },
  { emoji: '📊', title: 'Powerful tools', desc: 'Manage bookings, track revenue, respond to reviews, and message guests — all in one place.' },
  { emoji: '💰', title: 'Grow your revenue', desc: 'Set your own prices, create packages, and get paid securely through the platform.' },
  { emoji: '🤝', title: 'Join trusted operators', desc: 'Be part of a curated marketplace that travelers trust for quality and authenticity.' },
]

const STEPS = ['Create your business profile', 'Select your service types', 'Start listing your services']

export default function CreateBusinessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-green-950 flex flex-col">
      {/* Nav */}
      <header className="px-6 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-green-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">W</span>
          </div>
          <span className="text-sm font-bold text-white">WeMongolia</span>
        </Link>
        <Link href="/auth/login" className="text-xs text-white/60 hover:text-white transition-colors">Sign in</Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-5xl w-full mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left — copy */}
            <div>
              <div className="inline-flex items-center gap-2 bg-green-500/20 text-green-400 text-xs font-bold px-3 py-1.5 rounded-full mb-6">
                🚀 For local providers
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
                List your business on<br />WeMongolia
              </h1>
              <p className="text-white/60 text-base leading-relaxed mb-8">
                Join Mongolia&apos;s fastest-growing travel marketplace. List tours, rentals, camps, and more — and connect with travelers from around the world.
              </p>

              {/* How it works */}
              <div className="space-y-3 mb-8">
                {STEPS.map((s, i) => (
                  <div key={s} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-500 text-white text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</div>
                    <span className="text-sm text-white/80">{s}</span>
                  </div>
                ))}
              </div>

              <Link href="/onboarding"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-green-500 hover:bg-green-400 text-white font-bold text-sm rounded-xl transition-colors shadow-xl shadow-green-900/30">
                Get Started Free <ArrowRight className="w-4 h-4" />
              </Link>
              <p className="text-white/30 text-xs mt-3">Free to set up · No credit card required</p>
            </div>

            {/* Right — benefits grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {BENEFITS.map(b => (
                <div key={b.title} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/8 transition-colors">
                  <span className="text-2xl mb-3 block">{b.emoji}</span>
                  <p className="text-sm font-bold text-white mb-1">{b.title}</p>
                  <p className="text-xs text-white/50 leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-5 text-center text-xs text-white/30">
        By signing up you agree to our{' '}
        <Link href="/terms" className="text-white/50 hover:text-white underline transition-colors">Terms of Service</Link>
        {' '}and{' '}
        <Link href="/privacy" className="text-white/50 hover:text-white underline transition-colors">Privacy Policy</Link>
      </footer>
    </div>
  )
}
