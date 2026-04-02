'use client'

import { useState } from 'react'
import {
  ShieldCheck, ShieldAlert, Shield, Clock, ArrowRight, RefreshCw,
} from 'lucide-react'
import { submitProviderForVerification } from '@/lib/api/provider'
import { PLATFORM } from '@/lib/constants/platform'
import { useProviderLocale } from '@/lib/i18n/provider/context'

type VerificationStatus = 'unverified' | 'pending_review' | 'verified' | 'rejected'

interface VerificationBannerProps {
  verificationStatus: VerificationStatus
  token: string
  rejectionReason?: string | null
  onStatusChange?: (newStatus: VerificationStatus) => void
}

const STATUS_STYLE: Record<VerificationStatus, {
  bg: string; border: string; textCls: string; icon: React.ElementType; iconCls: string
}> = {
  unverified: {
    bg: 'bg-gray-50', border: 'border-gray-200', textCls: 'text-gray-700',
    icon: Shield, iconCls: 'text-gray-400',
  },
  pending_review: {
    bg: 'bg-blue-50', border: 'border-blue-200', textCls: 'text-blue-800',
    icon: Clock, iconCls: 'text-blue-400',
  },
  verified: {
    bg: 'bg-green-50', border: 'border-green-200', textCls: 'text-green-800',
    icon: ShieldCheck, iconCls: 'text-green-500',
  },
  rejected: {
    bg: 'bg-red-50', border: 'border-red-200', textCls: 'text-red-800',
    icon: ShieldAlert, iconCls: 'text-red-400',
  },
}

export function VerificationBanner({
  verificationStatus,
  token,
  rejectionReason,
  onStatusChange,
}: VerificationBannerProps) {
  const { t } = useProviderLocale()
  const vt = t.verification

  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const canSubmit = verificationStatus === 'unverified' || verificationStatus === 'rejected'
  const style     = STATUS_STYLE[verificationStatus] ?? STATUS_STYLE.unverified
  const Icon      = style.icon

  // Locale-aware config for each status
  const config: Record<VerificationStatus, { title: string; desc: string }> = {
    unverified:     { title: vt.unverified.title,     desc: vt.unverified.desc },
    pending_review: { title: vt.pendingReview.title,  desc: vt.pendingReview.desc },
    verified:       { title: vt.verified.title,       desc: '' },
    rejected:       { title: vt.rejected.title,       desc: vt.rejected.desc },
  }
  const { title, desc } = config[verificationStatus]

  async function handleSubmit() {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      await submitProviderForVerification(token)
      onStatusChange?.('pending_review')
    } catch (e: any) {
      setError(e?.message ?? vt.failedToSubmit)
    } finally {
      setLoading(false)
    }
  }

  // Verified: compact pill only
  if (verificationStatus === 'verified') {
    return (
      <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border ${style.bg} ${style.border}`}>
        <ShieldCheck className="w-4 h-4 text-green-500 shrink-0" />
        <p className="text-sm font-medium text-green-800">{vt.verified.title}</p>
      </div>
    )
  }

  return (
    <div className={`rounded-xl border ${style.bg} ${style.border} p-4`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${style.iconCls}`} />
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold ${style.textCls}`}>{title}</p>
          {desc && (
            <p className={`text-xs mt-0.5 ${style.textCls} opacity-80 leading-relaxed`}>{desc}</p>
          )}

          {/* Rejection reason — read-only */}
          {verificationStatus === 'rejected' && rejectionReason && (
            <div className="mt-3 rounded-lg border border-red-200 bg-white/60 px-3 py-2">
              <p className="text-[11px] font-semibold text-red-700 uppercase tracking-wider mb-1">
                {vt.rejected.reason}
              </p>
              <p className="text-xs text-red-800 leading-relaxed">{rejectionReason}</p>
            </div>
          )}

          {error && <p className="text-xs text-red-600 mt-2 font-medium">{error}</p>}

          {verificationStatus === 'rejected' && (
            <p className="text-xs text-red-600 mt-2">
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
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                {vt.submitting}
              </>
            ) : verificationStatus === 'rejected' ? (
              <>
                <RefreshCw className="w-3.5 h-3.5" />
                {vt.rejected.btn}
              </>
            ) : (
              <>
                {vt.unverified.btn}
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
