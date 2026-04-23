'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Star, Users, CalendarDays, Minus, Plus, ChevronRight, Clock, AlertCircle } from 'lucide-react'
import type { BackendDeparture } from '@/lib/api/tours'
import { formatMoney, type Currency, isSupportedCurrency } from '@/lib/money'
import { readPricing, formatPricing, formatSecondaryPricing, type Pricing } from '@/lib/pricing'
import { useMntToUsdHint } from '@/lib/fx-hint'
import { usePreferences } from '@/components/providers/PreferencesProvider'
import { useDisplayCurrency } from '@/components/providers/DisplayCurrencyProvider'
import { describeListingPaymentCapability } from '@/lib/payment-capability'
import { PaymentCapabilityNotice } from '@/components/payments/PaymentCapabilityNotice'
import { RequestBookingModal } from '@/components/booking-requests/RequestBookingModal'
import { track } from '@/lib/analytics'
import { usePublicLocale } from '@/lib/i18n/public/context'
import { useTranslations, formatDateMonthDay, formatDateWithWeekdayShort } from '@/lib/i18n'

interface TourBookingCardProps {
  tour: {
    id: string
    slug: string
    title?: string | null
    /** Legacy fields retained ONLY as fallback. Prefer `pricing`. */
    basePrice: number
    currency?: string
    pricing?: Pricing | null
    durationDays?: number | null
    ratingAverage?: number | null
    reviewsCount?: number | null
    maxGuests: number
  }
  departures?: BackendDeparture[] | null
}

export function TourBookingCard({ tour, departures }: TourBookingCardProps) {
  const router = useRouter()
  // Phase 6 — preferences drive the display currency for public pages.
  // We still read useDisplayCurrency for back-compat (the two are kept in
  // sync via the shared custom event + cookie), but preferences is
  // authoritative and its changes re-render this component immediately.
  const { currency: preferredCurrency } = usePreferences()
  const { displayCurrency: dcLegacy } = useDisplayCurrency()
  const displayCurrency = preferredCurrency ?? dcLegacy
  const { t } = usePublicLocale()
  const { t: appT, lang } = useTranslations()
  const td = appT.tourDetail
  const fmtDate = (dateLike: string) => formatDateMonthDay(dateLike, lang)
  const fmtDateFull = (dateLike: string) => formatDateWithWeekdayShort(dateLike, lang)
  const [guests, setGuests] = useState(1)
  const [selectedDepId, setSelectedDepId] = useState<string | null>(
    departures?.[0]?.id ?? null,
  )

  const selectedDeparture = departures?.find(d => d.id === selectedDepId) ?? null

  const remainingSeats = selectedDeparture
    ? selectedDeparture.availableSeats - (selectedDeparture.bookedSeats ?? 0)
    : null

  const maxGuestsForDate = remainingSeats != null
    ? Math.min(tour.maxGuests, remainingSeats)
    : tour.maxGuests

  const effectiveGuests =
    remainingSeats != null && guests > remainingSeats
      ? Math.max(1, remainingSeats)
      : guests
  const canReserve =
    selectedDeparture != null &&
    remainingSeats != null &&
    remainingSeats > 0 &&
    effectiveGuests <= remainingSeats

  // Phase 3: prefer the Pricing DTO (dep override first, then tour). Fall back
  // to legacy basePrice/currency only if the backend hasn't yet re-populated
  // the row (incomplete backfill). The legacy branch is explicitly marked so
  // the next cleanup pass can remove it once backfill coverage is 100%.
  const depPricing  = selectedDeparture?.pricing ?? null
  const tourPricing = tour.pricing ?? null
  const pricing: Pricing | null = depPricing ?? tourPricing ?? readPricing({
    pricing:   null,
    basePrice: selectedDeparture?.priceOverride ?? tour.basePrice,
    currency:  selectedDeparture?.currency ?? tour.currency,
  })

  const baseCurrency: Currency = pricing?.base.currency
    ?? (isSupportedCurrency(tour.currency) ? tour.currency : 'MNT')
  const pricePerPerson = pricing?.base.amount
    ?? selectedDeparture?.priceOverride
    ?? tour.basePrice

  // Phase 6 — resolve MNT→USD hint for secondary label on MNT-priced listings
  // when the traveler is viewing in USD.
  const fxHint = useMntToUsdHint(baseCurrency === 'MNT' && displayCurrency === 'USD')
  const primaryPrice   = formatPricing(pricing, displayCurrency) || formatMoney(pricePerPerson, baseCurrency)
  const secondaryPrice = formatSecondaryPricing(
    pricing,
    displayCurrency,
    fxHint ? { fromMnt: fxHint.fromMnt ?? 0 } : null,
  )

  const capability = describeListingPaymentCapability(baseCurrency)
  // Phase 1: frontend does NOT compute totals. The checkout page fetches the
  // authoritative subtotal/serviceFee/total from POST /bookings/quote once the
  // user is on the checkout page. Here we only multiply per-person price by
  // guests to show a listing-level subtotal — the grand total (with service
  // fee) is shown after the backend quotes it.

  const [requestOpen, setRequestOpen] = useState(false)

  // Phase 6 — USD listings are not directly payable today (Bonum is MNT-only).
  // Instead of surfacing that at the checkout 400, we branch the CTA here.
  const mustRequest = !capability.payable

  // Emit an analytics event once when the card renders in "request" mode so
  // we can measure how often travelers hit non-payable listings.
  useEffect(() => {
    if (!mustRequest) return
    track('view_listing_unpayable', {
      listingType:  'tour',
      listingId:    tour.id,
      baseCurrency,
    })
  }, [mustRequest, tour.id, baseCurrency])

  const handleReserve = () => {
    if (mustRequest) {
      setRequestOpen(true)
      return
    }
    if (!selectedDeparture) return
    const params = new URLSearchParams({
      tourId: tour.id,
      depId: selectedDeparture.id,
      slug: tour.slug,
      guests: String(effectiveGuests),
      date: selectedDeparture.startDate.slice(0, 10),
    })
    router.push(`/checkout?${params.toString()}`)
  }

  const durationLabel = tour.durationDays
    ? td.bookingDurationSummary(tour.durationDays)
    : ''
  const hasDepartures = departures && departures.length > 0

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-6">
      {/* Price — base currency is authoritative; secondary shows conversion
          only when the backend provided a normalized figure. */}
      <div className="flex items-baseline gap-1 mb-1">
        <span className="text-2xl font-bold text-gray-900">{primaryPrice}</span>
        <span className="text-sm text-gray-500">{t.tourCard.perPerson}</span>
      </div>
      {secondaryPrice && (
        <p className="text-xs text-gray-500 mb-1">≈ {secondaryPrice}</p>
      )}

      {/* Rating */}
      <div className="flex items-center gap-1.5 mb-5 text-sm">
        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
        <span className="font-semibold text-gray-900">{tour.ratingAverage ?? 0}</span>
        <span className="text-gray-500">{td.reviewCount(tour.reviewsCount ?? 0)}</span>
        {durationLabel && (
          <>
            <span className="text-gray-300 mx-1">·</span>
            <span className="text-gray-500">{durationLabel}</span>
          </>
        )}
      </div>

      {/* Departure selection */}
      <div className="mb-4">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">
          {t.tourCard.selectDeparture}
        </label>
        {hasDepartures ? (
          <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
            {departures.map(dep => {
              const seats = dep.availableSeats - (dep.bookedSeats ?? 0)
              const isSelected = dep.id === selectedDepId
              const depPricing = readPricing({
                pricing:   dep.pricing,
                basePrice: dep.priceOverride,
                currency:  dep.currency,
              })
              const depAmount  = depPricing?.base.amount ?? dep.priceOverride
              const hasOverride = depAmount != null && depAmount !== pricePerPerson
              return (
                <button
                  key={dep.id}
                  type="button"
                  onClick={() => {
                    setSelectedDepId(dep.id)
                    setGuests((current) => Math.min(current, Math.max(1, seats)))
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-brand-400 bg-brand-50/50 ring-2 ring-brand-400/20'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <CalendarDays className={`w-4 h-4 shrink-0 ${isSelected ? 'text-brand-600' : 'text-gray-400'}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${isSelected ? 'text-brand-900' : 'text-gray-900'}`}>
                      {fmtDate(dep.startDate)} — {fmtDate(dep.endDate ?? dep.startDate)}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      {t.tourCard.seatsRemaining(seats)}
                      {seats <= 4 && seats > 0 && <span className="text-amber-600 ml-1">· {t.tourCard.sellingFast}</span>}
                      {hasOverride && depPricing && (
                        <span className="text-brand-600 ml-1">
                          · {formatPricing(depPricing, displayCurrency)}{t.tourCard.perPerson}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    isSelected ? 'border-brand-500 bg-brand-500' : 'border-gray-300'
                  }`}>
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-3 bg-gray-50 border border-gray-200 rounded-xl">
            <AlertCircle className="w-4 h-4 text-gray-400 shrink-0" />
            <p className="text-xs text-gray-500">{t.tourCard.noDepartures}</p>
          </div>
        )}
      </div>

      {/* Selected date summary */}
      {selectedDeparture && (
        <div className="px-3 py-2 bg-brand-50 border border-brand-100 rounded-xl mb-4">
          <p className="text-xs text-brand-800 font-medium">
            {fmtDateFull(selectedDeparture.startDate)} — {fmtDateFull(selectedDeparture.endDate ?? selectedDeparture.startDate)}
          </p>
        </div>
      )}

      {/* Guests */}
      <div className="mb-5">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
          {t.tourCard.guests}
        </label>
        <div className="flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-brand-500" />
            <span className="text-sm text-gray-700">
              {effectiveGuests === 1 ? t.tourCard.guestsOne : `${effectiveGuests} ${t.tourCard.guestsMany}`}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setGuests(g => Math.max(1, g - 1))} disabled={effectiveGuests <= 1}
              className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-gray-400 disabled:opacity-30 transition-colors">
              <Minus className="w-3 h-3" />
            </button>
            <span className="w-5 text-center text-sm font-semibold text-gray-900">{effectiveGuests}</span>
            <button onClick={() => setGuests(g => Math.min(maxGuestsForDate, g + 1))} disabled={effectiveGuests >= maxGuestsForDate}
              className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-gray-400 disabled:opacity-30 transition-colors">
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>
        {remainingSeats != null ? (
          <p className="text-xs text-gray-400 mt-1">
            {t.tourCard.seatsRemaining(remainingSeats)}
            {remainingSeats < 5 && remainingSeats > 0 && (
              <span className="text-amber-600 ml-1">· {t.tourCard.sellingOut}</span>
            )}
          </p>
        ) : (
          <p className="text-xs text-gray-400 mt-1">{t.tourCard.maxGuests(tour.maxGuests)}</p>
        )}
      </div>

      {/* No price breakdown here — Phase 1 moved all total/fee math to the
          backend. The checkout page fetches an authoritative quote via POST
          /bookings/quote and displays the real subtotal/serviceFee/total. */}
      <div className="border-t border-gray-100 pt-4 mb-4">
        <p className="text-xs text-gray-500">
          {t.tourCard.pricePerPerson(primaryPrice || formatMoney(pricePerPerson, baseCurrency), effectiveGuests)}
        </p>
        <p className="text-xs text-gray-400 mt-1">{t.tourCard.serviceFeeAtCheckout}</p>
      </div>

      {/* Phase 3 — payment currency capability notice. Shown BEFORE the CTA
          so a traveler never discovers Bonum's MNT-only limit via a 400.
          Phase 6.2: also shown for the conversion path so travelers know
          they'll be charged in MNT at checkout even for USD-priced tours. */}
      <PaymentCapabilityNotice capability={capability} className="mb-4" />

      {/* Reserve / Request CTA — Phase 6 differentiates MNT (instant) vs
          non-MNT (contact host) without relying on a backend 400. */}
      {mustRequest ? (
        <>
          <button
            onClick={handleReserve}
            className="w-full py-3.5 bg-gray-900 hover:bg-gray-800 text-white font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            {t.tourCard.requestCta} <ChevronRight className="w-4 h-4" />
          </button>
          <p className="text-center text-xs text-gray-400 mt-2">
            {t.tourCard.visaComingSoon}
          </p>
        </>
      ) : (
        <button
          onClick={handleReserve}
          disabled={!canReserve}
          className="w-full py-3.5 bg-brand-500 hover:bg-brand-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold text-sm rounded-xl transition-colors shadow-sm shadow-brand-200 flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          {canReserve ? (
            <>{t.tourCard.reserveCta} <ChevronRight className="w-4 h-4" /></>
          ) : hasDepartures ? (
            t.tourCard.noDepartureSelected
          ) : (
            t.tourCard.notAvailableCta
          )}
        </button>
      )}

      <RequestBookingModal
        open={requestOpen}
        onClose={() => setRequestOpen(false)}
        listingType="tour"
        listingId={tour.id}
        listingTitle={tour.title ?? undefined}
        listingCurrency={baseCurrency}
        initialStartDate={selectedDeparture?.startDate}
        initialEndDate={selectedDeparture?.endDate ?? selectedDeparture?.startDate}
        initialGuests={effectiveGuests}
      />

      {/* Trust badges */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Shield className="w-3.5 h-3.5 text-brand-500 shrink-0" />
          {t.tourCard.freeCancellation}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Clock className="w-3.5 h-3.5 text-brand-500 shrink-0" />
          {t.tourCard.confirmationNotice}
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 mt-3">{t.tourCard.notChargedYet}</p>
    </div>
  )
}
