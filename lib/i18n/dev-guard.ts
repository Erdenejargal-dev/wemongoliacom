/**
 * Development-only: wraps the message tree in a Proxy that warns on undefined reads.
 * Production: no-op (returns input as-is). Does not break functions, arrays, or class instances.
 */

function isPlainObject(v: unknown): v is Record<string, unknown> {
  if (v === null || typeof v !== 'object') return false
  if (Array.isArray(v)) return false
  return Object.getPrototypeOf(v) === Object.prototype
}

function wrap<T>(val: T, path: string): T {
  if (val == null) return val
  if (typeof val === 'function') return val
  if (Array.isArray(val)) return val
  if (!isPlainObject(val)) return val
  if (process.env.NODE_ENV !== 'development') return val
  return new Proxy(val, {
    get(t, p, recv) {
      if (typeof p === 'symbol') return Reflect.get(t, p, recv)
      const k = String(p)
      const out = Reflect.get(t, p, recv)
      if (out === undefined) {
        console.error(`[i18n] Missing translation: ${path}.${k}`)
        return out
      }
      if (isPlainObject(out)) {
        return wrap(out, `${path}.${k}`) as T
      }
      return out
    },
  }) as T
}

export function withDevI18nGuard<T>(messages: T): T {
  if (process.env.NODE_ENV !== 'development') return messages
  return wrap(messages, 'i18n')
}
