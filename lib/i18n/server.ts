/**
 * Server Components — resolve the same message tree as the client using
 * `getResolvedLocaleCurrencyForRequest()` (user → cookies → CF → fallback).
 */

import { getResolvedLocaleCurrencyForRequest } from '@/lib/locale-currency-resolver.server'
import { getAppMessages, toAppLang, type AppMessages, type AppLang } from './messages/registry'

export async function getTranslations(): Promise<{
  t: AppMessages
  lang: AppLang
}> {
  const resolved = await getResolvedLocaleCurrencyForRequest()
  const lang = toAppLang(resolved.language)
  return { t: getAppMessages(lang), lang }
}
