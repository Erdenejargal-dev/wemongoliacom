'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { confirmPasswordReset } from '@/lib/api/auth-password'
import { ApiError } from '@/lib/api/client'
import { cn } from '@/lib/utils'
import { WeMongoliaLogo } from '@/components/brand/WeMongoliaLogo'
import { useTranslations } from '@/lib/i18n'

function ResetPasswordForm() {
  const { t: appT } = useTranslations()
  const c = appT.resetPassword
  const com = appT.common
  const searchParams = useSearchParams()
  const tokenFromUrl = searchParams.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (password.length < 8) {
      setError(c.errTooShort)
      return
    }
    if (password !== confirm) {
      setError(c.errMismatch)
      return
    }
    if (!tokenFromUrl.trim()) {
      setError(c.errInvalidToken)
      return
    }
    setLoading(true)
    try {
      await confirmPasswordReset(tokenFromUrl.trim(), password)
      setDone(true)
    } catch (ex) {
      setError(ex instanceof ApiError ? ex.message : c.errGeneric)
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
          {c.backToSignIn}
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">{c.title}</h1>
          <p className="mt-1 text-sm text-gray-500">{c.lead}</p>
        </div>

        {done ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-brand-200 bg-brand-50 p-4 text-sm text-brand-800">
              {c.successMessage}
            </div>
            <Button asChild className="h-11 w-full rounded-xl bg-[#0285C9] font-semibold">
              <Link href="/auth/login">{c.signInCta}</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
            )}
            {!tokenFromUrl && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                {c.missingTokenLead}{' '}
                <Link href="/auth/forgot-password" className="font-semibold underline">
                  {c.missingTokenRequestLink}
                </Link>
                {c.missingTokenAfterLink}
              </div>
            )}
            <div>
              <label htmlFor="np" className="mb-1.5 block text-sm font-medium text-gray-700">
                {c.newPasswordLabel}
              </label>
              <div className="relative">
                <Input
                  id="np"
                  type={show ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className={cn('rounded-xl pr-11')}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShow((s) => !s)}
                  aria-label={show ? com.hidePassword : com.showPassword}
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="npc" className="mb-1.5 block text-sm font-medium text-gray-700">
                {c.confirmPasswordLabel}
              </label>
              <Input
                id="npc"
                type={show ? 'text' : 'password'}
                autoComplete="new-password"
                required
                minLength={8}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                disabled={loading}
                className="rounded-xl"
              />
            </div>
            <Button
              type="submit"
              disabled={loading || !tokenFromUrl.trim()}
              className="h-11 w-full rounded-xl bg-[#0285C9] font-semibold text-white hover:bg-[#0269A3]"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {c.saving}
                </>
              ) : (
                c.submit
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  const { t: appT } = useTranslations()
  const c = appT.resetPassword
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-[#0285C9]" />
          <span className="sr-only">{c.suspenseLoading}</span>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  )
}
