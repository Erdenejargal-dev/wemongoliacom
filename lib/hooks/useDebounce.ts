/**
 * lib/hooks/useDebounce.ts
 * Returns a debounced version of `value` that only updates
 * after `delay` ms of inactivity. Use to avoid firing API
 * calls on every keystroke in search inputs.
 */
import { useState, useEffect } from 'react'

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])

  return debouncedValue
}
