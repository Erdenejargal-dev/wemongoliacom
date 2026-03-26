/**
 * Safe formatting for transactional email content (no HTML injection).
 */

export function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function formatMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD' }).format(amount)
  } catch {
    return `${currency} ${amount.toFixed(2)}`
  }
}

export function formatDateTime(isoOrDate: Date | string, timeZone = 'UTC'): string {
  const d = typeof isoOrDate === 'string' ? new Date(isoOrDate) : isoOrDate
  if (Number.isNaN(d.getTime())) return '—'
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone,
  }).format(d)
}

export function formatListingTypeLabel(listingType: string): string {
  const map: Record<string, string> = {
    tour:          'Tour',
    vehicle:       'Vehicle rental',
    accommodation: 'Accommodation',
  }
  return map[listingType] ?? listingType
}
