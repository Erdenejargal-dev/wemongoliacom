'use client'

/**
 * components/ui/ContactProviderButton.tsx
 *
 * Reusable CTA used on public tour and stay detail pages.
 *
 * Behaviour:
 *   - Signed out → redirect to /auth/login?callbackUrl=<current path>
 *   - Signed in  → reveal inline message form (no modal — stays in context)
 *   - On submit  → POST /conversations (create or reuse existing thread)
 *               → redirect to /account/messages?convId=<id>
 *   - No provider id → disabled button (graceful degradation)
 *
 * Uses the EXISTING conversation infrastructure — does NOT create a
 * parallel contact system.
 */

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { MessageSquare, Send, Loader2 } from 'lucide-react'
import { startConversation } from '@/lib/api/conversations'
import { getFreshAccessToken } from '@/lib/auth-utils'
import { ApiError } from '@/lib/api/client'

interface Props {
  /** The provider's CUID — from tour.provider.id or stay.provider.id */
  providerId:    string | null | undefined
  /** Display name of the provider — used in form label */
  providerName:  string
  /** Listing type passed to the conversation so the thread is contextualised */
  listingType:   'tour' | 'accommodation'
  /** Optional listing CUID for extra context */
  listingId?:    string
  /** Button label — defaults to "Message Us" */
  label?:        string
}

export function ContactProviderButton({
  providerId,
  providerName,
  listingType,
  listingId: _listingId,  // reserved for future use; not yet sent to API
  label = 'Message Us',
}: Props) {
  const { data: session, status } = useSession()
  const router   = useRouter()
  const pathname = usePathname()
  const token    = session?.user?.accessToken

  const [open,    setOpen]    = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  // ── CTA click ─────────────────────────────────────────────────────────────

  function handleClick() {
    // Still resolving session — do nothing to avoid flicker
    if (status === 'loading') return

    if (status !== 'authenticated' || !token) {
      // Redirect to login, preserve current page as callbackUrl
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(pathname)}`)
      return
    }

    setOpen(true)
    setMessage('')
    setError(null)
  }

  // ── Send initial message ───────────────────────────────────────────────────

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!providerId || !message.trim() || loading) return

    setLoading(true)
    setError(null)

    try {
      const ft = await getFreshAccessToken()
      if (!ft) {
        await signOut({ redirect: false })
        router.push('/auth/login')
        return
      }

      const result = await startConversation(
        providerId,
        message.trim(),
        ft,
        listingType,
      )

      if (!result) {
        setError('Failed to send your message. Please try again.')
        return
      }

      // Deep-link into the exact conversation thread
      router.push(`/account/messages?convId=${result.conversation.id}`)
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        await signOut({ redirect: false })
        router.push('/auth/login')
        return
      }
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to send your message. Please try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  // ── Render: no provider available ─────────────────────────────────────────

  if (!providerId) {
    return (
      <button
        disabled
        className="w-full py-2.5 border border-gray-200 text-sm font-medium text-gray-400 rounded-xl cursor-not-allowed"
      >
        {label}
      </button>
    )
  }

  // ── Render: inline message form ───────────────────────────────────────────

  if (open) {
    const placeholder = listingType === 'tour'
      ? "Hi! I'm interested in this tour. Could you share more details about availability and what's included?"
      : "Hi! I'm interested in booking a stay. Could you help with availability for my dates?"

    return (
      <form onSubmit={handleSend} className="space-y-3">
        <label className="block">
          <span className="text-xs font-semibold text-gray-700 block mb-1.5">
            Message {providerName}
          </span>
          <textarea
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
            required
            minLength={2}
            maxLength={1000}
            rows={3}
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder={placeholder}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 resize-none transition-colors"
          />
        </label>

        {error && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => { setOpen(false); setError(null) }}
            disabled={loading}
            className="flex-1 py-2.5 text-xs font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !message.trim()}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 disabled:bg-gray-300 rounded-xl transition-colors"
          >
            {loading ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending…</>
            ) : (
              <><Send className="w-3.5 h-3.5" /> Send Message</>
            )}
          </button>
        </div>

        <p className="text-[10px] text-gray-400 text-center">
          You&apos;ll be redirected to your messages after sending.
        </p>
      </form>
    )
  }

  // ── Render: default CTA button ────────────────────────────────────────────

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={status === 'loading'}
      className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-200 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
    >
      <MessageSquare className="w-4 h-4" />
      {label}
    </button>
  )
}
