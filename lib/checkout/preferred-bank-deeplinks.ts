import type { BonumDeeplink } from '@/lib/api/payments'
import { getBonumBankDescription, getBonumBankDisplayName } from '@/lib/api/payments'

/** Max banks to show before requiring expansion (when preferred matchers find enough). */
const MAX_PREFERRED_SLOTS = 4

/**
 * Ordered matchers: Khan → TDB → Social Pay → M Bank.
 * Each matcher runs once to pick at most one bank; order is stable across responses.
 */
function matchKhanBank(name: string, desc: string): boolean {
  const t = `${name} ${desc}`.toLowerCase()
  return (
    /\bkhaan\b/.test(t) ||
    /\bkhan\b/.test(t) ||
    t.includes('khan bank') ||
    t.includes('хаан')
  )
}

function matchTdb(name: string, desc: string): boolean {
  const t = `${name} ${desc}`.toLowerCase()
  return /\btdb\b/.test(t) || t.includes('trade and development') || t.includes('тдб')
}

function matchSocialPay(name: string, desc: string): boolean {
  const t = `${name} ${desc}`.toLowerCase().replace(/\s+/g, ' ')
  return t.includes('social pay') || t.includes('socialpay') || t.includes('social-pay')
}

function matchMBank(name: string, desc: string): boolean {
  const raw = `${name} ${desc}`
  const t = raw.toLowerCase()
  return (
    /\bm[\s-]?bank\b/i.test(raw) ||
    /\bmbank\b/.test(t) ||
    t.includes('m-bank') ||
    t.includes('m_bank')
  )
}

const PREFERRED_MATCHERS: Array<(name: string, desc: string) => boolean> = [
  matchKhanBank,
  matchTdb,
  matchSocialPay,
  matchMBank,
]

/**
 * Splits deeplinks into a short "initial" list (preferred by name) and the remainder.
 * If no matcher hits, falls back to the first 4 entries so the list is never empty-weird.
 */
export function partitionPreferredBankDeeplinks(banks: BonumDeeplink[]): {
  initial: BonumDeeplink[]
  more: BonumDeeplink[]
} {
  if (banks.length === 0) {
    return { initial: [], more: [] }
  }

  const n = banks.length
  const usedIdx = new Set<number>()
  const initial: BonumDeeplink[] = []

  for (const matcher of PREFERRED_MATCHERS) {
    if (initial.length >= MAX_PREFERRED_SLOTS) break
    for (let i = 0; i < n; i++) {
      if (usedIdx.has(i)) continue
      const name = getBonumBankDisplayName(banks[i])
      const desc = getBonumBankDescription(banks[i]) ?? ''
      if (matcher(name, desc)) {
        usedIdx.add(i)
        initial.push(banks[i])
        break
      }
    }
  }

  if (initial.length > 0) {
    const more = banks.filter((_, i) => !usedIdx.has(i))
    return { initial, more }
  }

  /* No name match: show a short slice so we don’t dump the full list (position fallback only). */
  const fb = Math.min(MAX_PREFERRED_SLOTS, n)
  for (let i = 0; i < fb; i++) {
    usedIdx.add(i)
    initial.push(banks[i])
  }
  const more = banks.filter((_, i) => !usedIdx.has(i))
  return { initial, more }
}
