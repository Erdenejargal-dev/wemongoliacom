'use client'

/**
 * components/ui/LocationPicker.tsx
 *
 * Provider-side geocoding component.
 * Converts a typed address/place name → GPS coordinates via the
 * Google Geocoding REST API, then renders a mini map preview.
 *
 * Hardening:
 *  - Mongolia bias via `region=mn`
 *  - Country restriction via `components=country:MN`
 *  - Granular API error messages (ZERO_RESULTS, DENIED, QUOTA, etc.)
 *  - Fails gracefully when API key is not configured
 *
 * Required env var: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
 */

import { useState, useEffect, useRef } from 'react'
import { MapPin, Search, Loader2, CheckCircle2, AlertCircle, X } from 'lucide-react'

declare global {
  interface Window { google: any }
}

export interface LocationResult {
  lat:     number
  lng:     number
  address: string
}

interface LocationPickerProps {
  initialAddress?: string | null
  initialLat?:     number | null
  initialLng?:     number | null
  onChange:        (result: LocationResult | null) => void
  className?:      string
}

// ── Geocoding API error → user-facing message ─────────────────────────────────

function geocodeErrorMessage(status: string): string {
  switch (status) {
    case 'ZERO_RESULTS':
      return 'No location found in Mongolia. Try a more specific place name, ger camp name, or district.'
    case 'OVER_DAILY_LIMIT':
    case 'OVER_QUERY_LIMIT':
      return 'Geocoding limit reached for today. Please try again later.'
    case 'REQUEST_DENIED':
      return 'Location lookup was denied. The API key may be misconfigured — contact support.'
    case 'INVALID_REQUEST':
      return 'The search query was invalid. Please enter a valid address or place name.'
    default:
      return `Location lookup failed (${status}). Please try again.`
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export function LocationPicker({
  initialAddress,
  initialLat,
  initialLng,
  onChange,
  className = '',
}: LocationPickerProps) {
  const [query,  setQuery]  = useState(initialAddress ?? '')
  const [status, setStatus] = useState<'idle' | 'loading' | 'found' | 'error'>('idle')
  const [errMsg, setErrMsg] = useState<string | null>(null)
  const [result, setResult] = useState<LocationResult | null>(
    initialLat && initialLng && initialAddress
      ? { lat: initialLat, lng: initialLng, address: initialAddress }
      : null,
  )
  const mapRef = useRef<HTMLDivElement>(null)
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  // Sync from parent when initial values change (e.g. on first load)
  useEffect(() => {
    if (initialAddress) setQuery(initialAddress)
    if (initialLat && initialLng && initialAddress) {
      setResult({ lat: initialLat, lng: initialLng, address: initialAddress })
      setStatus('found')
    }
  }, [initialAddress, initialLat, initialLng])

  // Render mini-map preview whenever a confirmed result changes
  useEffect(() => {
    if (!result || !mapRef.current || !apiKey) return

    function render() {
      if (!mapRef.current || !window.google?.maps) return
      const center = { lat: result!.lat, lng: result!.lng }
      const map = new window.google.maps.Map(mapRef.current, {
        center,
        zoom:              14,
        mapTypeControl:    false,
        streetViewControl: false,
        zoomControl:       false,
        fullscreenControl: false,
        gestureHandling:   'none',
      })
      new window.google.maps.Marker({ position: center, map })
    }

    if (window.google?.maps) { render(); return }

    const existing = document.getElementById('gmap-script')
    if (existing) {
      const poll = setInterval(() => {
        if (window.google?.maps) { render(); clearInterval(poll) }
      }, 150)
      return () => clearInterval(poll)
    }

    const script = document.createElement('script')
    script.id    = 'gmap-script'
    script.src   = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`
    script.async = true
    script.defer = true
    script.onload = render
    document.head.appendChild(script)
  }, [result, apiKey])

  async function geocode() {
    if (!query.trim() || !apiKey) return
    setStatus('loading')
    setErrMsg(null)
    try {
      // Mongolia bias (region=mn) + country restriction (components=country:MN)
      // This ensures results stay within Mongolia unless the user explicitly types
      // a cross-border location, in which case ZERO_RESULTS is shown.
      const url = [
        'https://maps.googleapis.com/maps/api/geocode/json',
        `?address=${encodeURIComponent(query)}`,
        '&region=mn',
        '&components=country:MN',
        `&key=${apiKey}`,
      ].join('')

      const res  = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()

      if (data.status === 'OK' && data.results.length > 0) {
        const r    = data.results[0]
        const loc  = r.geometry.location
        const next: LocationResult = {
          lat:     loc.lat,
          lng:     loc.lng,
          address: r.formatted_address,
        }
        setResult(next)
        setQuery(r.formatted_address)
        setStatus('found')
        onChange(next)
      } else {
        setStatus('error')
        setErrMsg(geocodeErrorMessage(data.status ?? 'UNKNOWN'))
      }
    } catch (err) {
      setStatus('error')
      setErrMsg(
        err instanceof TypeError
          ? 'Network error. Check your internet connection and try again.'
          : 'Geocoding request failed. Please try again.',
      )
    }
  }

  function clear() {
    setResult(null)
    setQuery('')
    setStatus('idle')
    setErrMsg(null)
    onChange(null)
  }

  // ── API key not configured ───────────────────────────────────────────────────
  if (!apiKey) {
    return (
      <div className={`flex items-start gap-2 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700 ${className}`}>
        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <span>
          Google Maps API key not configured.
          Add <code className="font-mono bg-amber-100 px-1 rounded">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to your environment variables.
        </span>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Search row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            value={query}
            onChange={e => { setQuery(e.target.value); if (status !== 'idle') setStatus('idle') }}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); geocode() } }}
            placeholder="Enter camp name, address, or area in Mongolia…"
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-colors"
          />
        </div>
        <button
          type="button"
          onClick={geocode}
          disabled={status === 'loading' || !query.trim()}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 disabled:bg-gray-300 text-white text-sm font-semibold rounded-xl transition-colors shrink-0"
        >
          {status === 'loading'
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : <Search className="w-4 h-4" />}
          Find
        </button>
      </div>

      {/* Hint */}
      <p className="mt-1.5 text-[11px] text-gray-400">
        Search is restricted to Mongolia. Results are biased towards Mongolian locations.
      </p>

      {/* Success */}
      {status === 'found' && result && (
        <div className="mt-2 flex items-start justify-between gap-2 p-2.5 bg-green-50 border border-green-200 rounded-xl">
          <div className="flex items-start gap-1.5 text-xs text-green-700">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>
              <span className="font-medium">{result.address}</span>
              <span className="text-green-500 ml-1.5 tabular-nums">
                ({result.lat.toFixed(5)}, {result.lng.toFixed(5)})
              </span>
            </span>
          </div>
          <button
            type="button"
            onClick={clear}
            title="Clear location"
            className="text-green-400 hover:text-red-500 transition-colors shrink-0 mt-0.5"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Error */}
      {status === 'error' && (
        <div className="mt-2 flex items-start gap-1.5 p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>{errMsg}</span>
        </div>
      )}

      {/* Mini map preview */}
      {result && (
        <div
          ref={mapRef}
          className="mt-3 h-44 rounded-xl overflow-hidden border border-gray-100 bg-gray-100"
        />
      )}
    </div>
  )
}
