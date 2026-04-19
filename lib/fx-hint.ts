/**
 * lib/fx-hint.ts
 *
 * Phase 6 — UX + Growth Layer.
 *
 * Tiny React hook that resolves an MNT→USD display hint from the backend
 * once per session. Used ONLY to show a secondary "≈ $X" label on
 * MNT-priced listings when the user is viewing in USD.
 *
 * This is explicitly separate from the pricing/booking path — the
 * authoritative FX conversion on bookings still happens on the backend
 * at quote/create time via `getActiveRate` + `convert`.
 */

'use client'

import * as React from 'react'

const CACHE_KEY = 'wm.fxHint.mntToUsd.v1'
const CACHE_TTL_MS = 10 * 60 * 1000  // 10 minutes — plenty for a display hint

export interface FxHint {
  /** 1 MNT = `fromMnt` USD */
  fromMnt: number | null
  capturedAt: string | null
}

function readCache(): { value: FxHint; at: number } | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { value: FxHint; at: number }
    if (Date.now() - parsed.at > CACHE_TTL_MS) return null
    return parsed
  } catch { return null }
}

function writeCache(value: FxHint): void {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(CACHE_KEY, JSON.stringify({ value, at: Date.now() }))
  } catch {
    // private mode, quota, etc — just skip caching.
  }
}

export function useMntToUsdHint(enabled: boolean = true): FxHint | null {
  const [hint, setHint] = React.useState<FxHint | null>(() => readCache()?.value ?? null)

  React.useEffect(() => {
    if (!enabled) return
    const cached = readCache()
    if (cached) { setHint(cached.value); return }

    let cancelled = false
    async function run() {
      try {
        const base = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1').replace(/\/$/, '')
        const r = await fetch(`${base}/fx/rate?from=MNT&to=USD`, { cache: 'no-store' })
        const j = await r.json().catch(() => null) as any
        if (cancelled) return
        const rate = j?.data?.rate
        const at   = j?.data?.capturedAt ?? null
        const next: FxHint = {
          fromMnt:    typeof rate === 'number' && rate > 0 ? rate : null,
          capturedAt: at,
        }
        setHint(next)
        if (next.fromMnt) writeCache(next)
      } catch {
        // Ignore — the hint is purely cosmetic.
      }
    }
    run()
    return () => { cancelled = true }
  }, [enabled])

  return hint
}
