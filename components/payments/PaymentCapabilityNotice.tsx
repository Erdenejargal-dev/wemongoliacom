'use client'

/**
 * components/payments/PaymentCapabilityNotice.tsx
 *
 * Phase 3 — trust-building notice shown in traveler-facing flows when the
 * viewing/booking currency is NOT what the live payment gateway can charge.
 *
 * RULE: a user must never learn about processor limits only from a 400 on
 * payment initiation. This component renders ABOVE the primary CTA in
 * booking cards, the checkout summary, and the pay page so the expectation
 * is set before they commit.
 *
 * Styling intentionally matches existing cards (simple bordered box, no new
 * dependencies, no animation). Variant:
 *   - "info"   : pricing is OK; occasionally used to note conversion labels
 *   - "warn"   : payment is currently blocked (e.g. USD listing via Bonum)
 *   - "error"  : unexpected unsupported currency (fallback)
 */

import * as React from 'react'
import type { PaymentCapability } from '@/lib/payment-capability'

export interface PaymentCapabilityNoticeProps {
  capability: PaymentCapability
  /** Extra copy shown after the base message. Optional. */
  extra?: React.ReactNode
  className?: string
}

export function PaymentCapabilityNotice({ capability, extra, className }: PaymentCapabilityNoticeProps) {
  if (capability.payable) return null

  const variant = capability.reasonCode === 'bonum_mnt_only' ? 'warn' : 'error'
  const styles =
    variant === 'warn'
      ? 'border-amber-300 bg-amber-50 text-amber-900'
      : 'border-red-300 bg-red-50 text-red-900'

  return (
    <div
      role="status"
      className={[
        'rounded-md border px-4 py-3 text-sm leading-relaxed',
        styles,
        className ?? '',
      ].join(' ')}
    >
      <div className="font-medium">
        {capability.reasonCode === 'bonum_mnt_only'
          ? 'Online payment currently supports MNT only'
          : 'Online payment not yet available'}
      </div>
      {capability.userMessage && (
        <p className="mt-1">{capability.userMessage}</p>
      )}
      {extra && <div className="mt-2">{extra}</div>}
    </div>
  )
}
