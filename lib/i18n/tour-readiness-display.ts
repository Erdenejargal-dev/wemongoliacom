import type { ProviderTourEditorMessages } from '@/lib/i18n/messages/providerTourEditor'

const API_EN_TO_KEY: Record<string, keyof ProviderTourEditorMessages['readinessMissing']> = {
  'Title must be at least 2 characters':          'titleMin2',
  'Description must be at least 50 characters':     'descMin50',
  'Price must be greater than 0':                   'pricePositive',
  'At least 1 image is required':                   'oneImage',
  'At least 1 upcoming departure is required':      'oneDeparture',
}

/**
 * Map backend `readiness.missing` lines (fixed English from `checkTourReadiness`) to
 * the active locale. Unknown lines pass through for forward compatibility.
 */
export function displayTourReadinessMissing(
  line: string,
  m: ProviderTourEditorMessages['readinessMissing'],
): string {
  const k = API_EN_TO_KEY[line]
  return k ? m[k] : line
}
