/**
 * Development-only checks: en and mn trees must share the same keys.
 * Production: missing string fallbacks should use getAppMessages('en') at the
 * call site if you add partial locales later.
 */

function collectKeys(obj: unknown, prefix = ''): string[] {
  if (obj === null || obj === undefined) return []
  if (typeof obj === 'function') {
    return prefix ? [`${prefix}(fn)`] : ['(fn)']
  }
  if (Array.isArray(obj)) {
    return prefix ? [`${prefix}[]`] : ['[]']
  }
  if (typeof obj !== 'object') {
    return prefix ? [prefix] : []
  }

  const keys: string[] = []
  for (const k of Object.keys(obj as object)) {
    const path = prefix ? `${prefix}.${k}` : k
    const v = (obj as Record<string, unknown>)[k]
    if (typeof v === 'function') {
      keys.push(`${path}(fn)`)
      continue
    }
    if (Array.isArray(v)) {
      keys.push(`${path}[]`)
      continue
    }
    if (typeof v === 'object' && v !== null) {
      keys.push(...collectKeys(v, path))
    } else {
      keys.push(path)
    }
  }
  return keys
}

export function assertMessageParity(
  en: unknown,
  mn: unknown,
  label: string,
): void {
  const a = new Set(collectKeys(en).sort())
  const b = new Set(collectKeys(mn).sort())
  const onlyEn = [...a].filter((x) => !b.has(x))
  const onlyMn = [...b].filter((x) => !a.has(x))
  if (onlyEn.length || onlyMn.length) {
    throw new Error(
      `[i18n] Namespace "${label}" key mismatch — en-only: ${onlyEn.join(', ') || '(none)'} | mn-only: ${onlyMn.join(', ') || '(none)'}`,
    )
  }
}
