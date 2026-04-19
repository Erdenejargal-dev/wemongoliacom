'use client'

/**
 * components/providers/DisplayCurrencyProvider.tsx
 *
 * Phase 3 provider kept for back-compat. In Phase 6.1 it became a thin
 * bridge: when a component anywhere in the tree changes the currency
 * through `PreferencesProvider.setCurrency()`, that call dispatches a
 * same-tab `wm:preference-changed` event which this provider listens
 * to and uses to update its own state. Cross-tab `storage` events are
 * still handled for multi-tab scenarios.
 *
 * All existing `useDisplayCurrency()` consumers therefore re-render
 * immediately when the user flips the navbar switcher — no refresh,
 * no refactor at the call site.
 */

import * as React from 'react'
import { SUPPORTED_CURRENCIES, type Currency } from '@/lib/money'
import {
  CURRENCY_STORAGE_KEY,
  PREFERENCE_EVENT,
  readPreferredCurrencyClient,
  writePreferredCurrency,
  type PreferenceChangedDetail,
} from '@/lib/preferences-storage'

export interface DisplayCurrencyContextValue {
  displayCurrency:    Currency
  setDisplayCurrency: (currency: Currency) => void
  /** Whether the value is a user choice vs a fallback default. */
  isUserSelected:     boolean
}

const DEFAULT_CURRENCY: Currency = 'MNT'

const Ctx = React.createContext<DisplayCurrencyContextValue | null>(null)

export function DisplayCurrencyProvider({ children }: { children: React.ReactNode }) {
  // SSR-safe: start from default; hydrate from cookie/localStorage on mount.
  const [state, setState] = React.useState<{ currency: Currency; isUserSelected: boolean }>({
    currency:       DEFAULT_CURRENCY,
    isUserSelected: false,
  })

  React.useEffect(() => {
    const stored = readPreferredCurrencyClient()
    if (stored) setState({ currency: stored, isUserSelected: true })
  }, [])

  // Same-tab update — PreferencesProvider (or any caller of
  // writePreferredCurrency) dispatches this after it writes.
  React.useEffect(() => {
    function onSameTab(e: Event) {
      const detail = (e as CustomEvent<PreferenceChangedDetail>).detail
      if (!detail || detail.field !== 'currency') return
      const v = detail.value
      if (v === 'MNT' || v === 'USD') setState({ currency: v, isUserSelected: true })
    }
    window.addEventListener(PREFERENCE_EVENT, onSameTab)
    return () => window.removeEventListener(PREFERENCE_EVENT, onSameTab)
  }, [])

  // Cross-tab update — still honored.
  React.useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key !== CURRENCY_STORAGE_KEY) return
      const v = e.newValue
      if (v === 'MNT' || v === 'USD') setState({ currency: v, isUserSelected: true })
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const setDisplayCurrency = React.useCallback((currency: Currency) => {
    if (!SUPPORTED_CURRENCIES.includes(currency)) return
    writePreferredCurrency(currency)
    setState({ currency, isUserSelected: true })
    window.dispatchEvent(new CustomEvent<PreferenceChangedDetail>(PREFERENCE_EVENT, {
      detail: { field: 'currency', value: currency },
    }))
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
    return {
      displayCurrency:    DEFAULT_CURRENCY,
      setDisplayCurrency: () => {},
      isUserSelected:     false,
    }
  }
  return v
}
