/**
 * Production safety: for non-English locales, deep-merge the English tree so any
 * missing key falls back to English copy instead of undefined (no broken UI).
 */

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v) && Object.getPrototypeOf(v) === Object.prototype
}

export function mergeLocaleWithEnglish<T extends object>(en: T, loc: T): T {
  if (!isPlainObject(en) || !isPlainObject(loc)) {
    return (loc as T) ?? en
  }
  const out: Record<string, unknown> = { ...en }
  for (const k of Object.keys(en as object)) {
    const ev = (en as Record<string, unknown>)[k]
    const lv = (loc as Record<string, unknown>)[k]
    if (lv === undefined) continue
    if (isPlainObject(ev) && isPlainObject(lv)) {
      out[k] = mergeLocaleWithEnglish(ev, lv)
    } else {
      out[k] = lv
    }
  }
  return out as T
}
