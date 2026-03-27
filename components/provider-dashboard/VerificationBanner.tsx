'use client'

import { useState } from 'react'
import {
  ShieldCheck, ShieldAlert, Shield, Clock, ArrowRight, RefreshCw,
} from 'lucide-react'
import { submitProviderForVerification } from '@/lib/api/provider'
import { PLATFORM } from '@/lib/constants/platform'

type VerificationStatus = 'unverified' | 'pending_review' | 'verified' | 'rejected'

interface VerificationBannerProps {
  verificationStatus: VerificationStatus
  token: string
  rejectionReason?: string | null
  onStatusChange?: (newStatus: VerificationStatus) => void
}

const config: Record<
  VerificationStatus,
  { title: string; description: string; bg: string; border: string; textCls: string; icon: React.ElementType; iconCls: string }
> = {
  unverified: {
    title:       'Your business is not yet verified',
    description: 'Submit your profile for admin review to unlock full access and appear in traveler search.',
    bg:          'bg-gray-50',
    border:      'border-gray-200',
    textCls:     'text-gray-700',
    icon:        Shield,
    iconCls:     'text-gray-400',
  },
  pending_review: {
    title:       'Verification under review',
    description: 'Your submission is being reviewed by our team. We will notify you once complete. This typically takes 1–2 business days.',
    bg:          'bg-blue-50',
    border:      'border-blue-200',
    textCls:     'text-blue-800',
    icon:        Clock,
    iconCls:     'text-blue-400',
  },
  verified: {
    title:       'Business verified',
    description: 'Your business is verified and visible to travelers.',
    bg:          'bg-green-50',
    border:      'border-green-200',
    textCls:     'text-green-800',
    icon:        ShieldCheck,
    iconCls:     'text-green-500',
  },
  rejected: {
    title:       'Verification not approved',
    description: 'Your verification was not approved. Please review the reason below, update your profile, then resubmit.',
    bg:          'bg-red-50',
    border:      'border-red-200',
    textCls:     'text-red-800',
    icon:        ShieldAlert,
    iconCls:     'text-red-400',
  },
}

export function VerificationBanner({
  verificationStatus,
  token,
  rejectionReason,
  onStatusChange,
}: VerificationBannerProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const canSubmit = verificationStatus === 'unverified' || verificationStatus === 'rejected'
  const cfg       = config[verificationStatus] ?? config.unverified
  const Icon      = cfg.icon

  async function handleSubmit() {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      await submitProviderForVerification(token)
      onStatusChange?.('pending_review')
    } catch (e: any) {
      setError(e?.message ?? 'Failed to submit. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Verified: show compact pill only
  if (verificationStatus === 'verified') {
    return (
      <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border ${cfg.bg} ${cfg.border}`}>
        <ShieldCheck className="w-4 h-4 text-green-500 shrink-0" />
        <p className="text-sm font-medium text-green-800">Business verified</p>
      </div>
    )
  }

  return (
    <div className={`rounded-xl border ${cfg.bg} ${cfg.border} p-4`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${cfg.iconCls}`} />
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold ${cfg.textCls}`}>{cfg.title}</p>
          <p className={`text-xs mt-0.5 ${cfg.textCls} opacity-80 leading-relaxed`}>
            {cfg.description}
          </p>

          {/* Rejection reason — shown prominently when present */}
          {verificationStatus === 'rejected' && rejectionReason && (
            <div className="mt-3 rounded-lg border border-red-200 bg-white/60 px-3 py-2">
              <p className="text-[11px] font-semibold text-red-700 uppercase tracking-wider mb-1">Reason from WeMongolia</p>
              <p className="text-xs text-red-800 leading-relaxed">{rejectionReason}</p>
            </div>
          )}

          {error && (
            <p className="text-xs text-red-600 mt-2 font-medium">{error}</p>
          )}

          {verificationStatus === 'rejected' && (
            <p className="text-xs text-red-600 mt-2">
              Questions? Contact{' '}
              <a href={`mailto:${PLATFORM.supportEmail}`} className="underline font-medium">
                {PLATFORM.supportEmail}
              </a>
            </p>
          )}
        </div>

        {canSubmit && (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 ${
              verificationStatus === 'rejected'
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-gray-900 text-white hover:bg-gray-800'
            }`}
          >
            {loading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : verificationStatus === 'rejected' ? (
              <>
                <RefreshCw className="w-3.5 h-3.5" />
                Resubmit
              </>
            ) : (
              <>
                Submit for Review
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
