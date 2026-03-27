'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Loader2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { requestForgotPassword } from '@/lib/api/auth-password'
import { ApiError } from '@/lib/api/client'
import { WeMongoliaLogo } from '@/components/brand/WeMongoliaLogo'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await requestForgotPassword(email.trim())
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-md space-y-6">
        <Link href="/" className="inline-block">
          <WeMongoliaLogo className="h-8 w-auto" />
        </Link>
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">Forgot password</h1>
          <p className="mt-1 text-sm text-gray-500">
            Enter your email and we will send you a link to reset your password if an account exists.
          </p>
        </div>

        {submitted ? (
          <div className="rounded-xl border border-brand-200 bg-brand-50 p-4 text-sm text-brand-800">
            If an account exists for that email, we sent instructions to reset your password. Check your inbox
            and spam folder.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
            )}
            <div>
              <label htmlFor="fp-email" className="mb-1.5 block text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                id="fp-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="rounded-xl"
                placeholder="you@example.com"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-xl bg-[#0285C9] font-semibold text-white hover:bg-[#0269A3]"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending…
                </>
              ) : (
                'Send reset link'
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
