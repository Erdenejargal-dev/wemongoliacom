'use client'

/**
 * components/providers/DisplayCurrencyProvider.tsx
 *
 * Phase 3 — production-ready display-currency preference flow.
 *
 * RESOLUTION ORDER (authoritative; matches the audit prompt):
 *   1. User profile preference   (future, see notes below)
 *   2. Client storage            (localStorage key "wm.displayCurrency")
 *   3. Request / locale hint     (not implemented here — reserved)
 *   4. Default                   ("MNT", matching the production MNT-Bonum path)
 *
 * GEO-LOCATION DEFAULTS:
 *   Deliberately NOT implemented yet. The resolution order above is designed
 *   so that when we add "Mongolia → MNT, everywhere else → USD" defaults, we
 *   do it in ONE place (the `resolveInitial` helper) without touching any
 *   consumer. User override remains authoritative — that is the spec.
 *
 * NEEDS CLARIFICATION:
 *   Whether `users.preferredCurrency` should be added to the user model in
 *   this phase. For now the provider reads localStorage + ignores a session
 *   preference; wiring the profile field in is a future additive change.
 */

import * as React from 'react'
import { writeDisplayCurrency, readDisplayCurrency } from '@/lib/pricing'
import { SUPPORTED_CURRENCIES, type Currency } from '@/lib/money'

export interface DisplayCurrencyContextValue {
  displayCurrency:    Currency
  setDisplayCurrency: (currency: Currency) => void
  /** Whether the value is a user choice vs a fallback default. */
  isUserSelected:     boolean
}

const DEFAULT_CURRENCY: Currency = 'MNT'

const Ctx = React.createContext<DisplayCurrencyContextValue | null>(null)

function resolveInitial(): { currency: Currency; isUserSelected: boolean } {
  // SSR: default only — localStorage is not available.
  if (typeof window === 'undefined') return { currency: DEFAULT_CURRENCY, isUserSelected: false }
  const stored = readDisplayCurrency()
  if (stored) return { currency: stored, isUserSelected: true }
  return { currency: DEFAULT_CURRENCY, isUserSelected: false }
}

export function DisplayCurrencyProvider({ children }: { children: React.ReactNode }) {
  // Initial render must match SSR to avoid hydration warnings → always start
  // from default, then hydrate from localStorage in an effect.
  const [state, setState] = React.useState<{ currency: Currency; isUserSelected: boolean }>({
    currency:       DEFAULT_CURRENCY,
    isUserSelected: false,
  })

  React.useEffect(() => {
    setState(resolveInitial())
  }, [])

  // Sync across tabs — one tab changes preference → every other tab reflects it.
  React.useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key !== 'wm.displayCurrency') return
      const next = e.newValue
      if (next === 'MNT' || next === 'USD') {
        setState({ currency: next, isUserSelected: true })
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const setDisplayCurrency = React.useCallback((currency: Currency) => {
    if (!SUPPORTED_CURRENCIES.includes(currency)) return
    writeDisplayCurrency(currency)
    setState({ currency, isUserSelected: true })
  }, [])

  const value = React.useMemo<DisplayCurrencyContextValue>(() => ({
    displayCurrency:    state.currency,
    setDisplayCurrency,
    isUserSelected:     state.isUserSelected,
  }), [state, setDisplayCurrency])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useDisplayCurrency(): DisplayCurrencyContextValue {
  const v = React.useContext(Ctx)
  if (!v) {
    // Graceful fallback: components that render outside the provider (stray
    // story/test setups) get the default. Production layout wraps the app.
    return {
      displayCurrency:    DEFAULT_CURRENCY,
      setDisplayCurrency: () => {},
      isUserSelected:     false,
    }
  }
  return v
}
