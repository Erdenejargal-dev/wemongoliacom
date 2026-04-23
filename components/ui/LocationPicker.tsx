'use client'

/**
 * components/ui/LocationPicker.tsx
 *
 * Provider-side geocoding + drag-to-place component.
 *
 * Flow:
 *  1. Provider types an address/place name and clicks Find.
 *  2. Geocoding goes through /api/geocode (server-side proxy) → no API key in
 *     client JS, no HTTP-referrer issues on localhost.
 *  3. A confirmed result renders an interactive map with a draggable pin.
 *  4. If geocoding doesn't find the exact spot (common for remote ger camps),
 *     the provider can:
 *       • Drag the pin to the correct location
 *       • Click anywhere on the map to move the pin there
 *  5. Every pin position change calls onChange() with the updated lat/lng.
 *
 * Required env vars:
 *   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY  — for the interactive map
 *   GOOGLE_MAPS_API_KEY              — server-side key for /api/geocode proxy
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { MapPin, Search, Loader2, CheckCircle2, AlertCircle, X, Move } from 'lucide-react'

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

// ── Geocoding error → user-facing message ─────────────────────────────────────

function geocodeErrorMessage(status: string): string {
  switch (status) {
    case 'ZERO_RESULTS':
      return 'No location found in Mongolia. Try a broader place name, the nearest sum centre, or a province name — then drag the pin to the exact spot.'
    case 'OVER_DAILY_LIMIT':
    case 'OVER_QUERY_LIMIT':
      return 'Geocoding limit reached for today. Please try again later.'
    case 'REQUEST_DENIED':
      return 'Location lookup was denied. Contact support to check the API key.'
    case 'INVALID_REQUEST':
      return 'The search query was invalid. Please enter a valid address or place name.'
    case 'NOT_CONFIGURED':
      return 'Geocoding service is not configured on the server. Contact support.'
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

  // Map / marker instance refs — prevent re-init on every render
  const mapRef        = useRef<HTMLDivElement>(null)
  const mapObjRef     = useRef<any>(null)
  const markerRef     = useRef<any>(null)
  // Track whether initial props have been synced (prevent overwriting user input)
  const syncedRef     = useRef(false)
  // Always-fresh onChange ref (avoid stale closures in map event listeners)
  const onChangeRef   = useRef(onChange)
  useEffect(() => { onChangeRef.current = onChange }, [onChange])

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  // ── Sync initial props once on first meaningful value ────────────────────────
  useEffect(() => {
    if (syncedRef.current) return
    if (initialAddress) {
      syncedRef.current = true
      queueMicrotask(() => {
        setQuery(initialAddress)
      })
    }
    if (initialLat && initialLng && initialAddress) {
      queueMicrotask(() => {
        setResult({ lat: initialLat, lng: initialLng, address: initialAddress })
        setStatus('found')
      })
    }
  }, [initialAddress, initialLat, initialLng])

  // ── Pin position update — shared between dragend and map click ───────────────
  const updatePin = useCallback((lat: number, lng: number) => {
    setResult(prev => {
      const updated: LocationResult = {
        lat,
        lng,
        address: prev?.address ?? '',
      }
      onChangeRef.current(updated)
      return updated
    })
  }, [])

  // ── Render / update the interactive map whenever a result is confirmed ────────
  useEffect(() => {
    if (!result || !mapRef.current || !apiKey) return

    const { lat, lng } = result
    const center = { lat, lng }

    function buildMap() {
      if (!mapRef.current || !window.google?.maps) return

      // ── Map already built — just pan + reposition the marker ────────────────
      if (mapObjRef.current) {
        mapObjRef.current.panTo(center)
        markerRef.current?.setPosition(center)
        return
      }

      // ── First render — create interactive map + draggable marker ────────────
      mapObjRef.current = new window.google.maps.Map(mapRef.current, {
        center,
        zoom:              14,
        mapTypeControl:    false,
        streetViewControl: false,
        zoomControl:       true,
        fullscreenControl: false,
        // 'cooperative' lets the user scroll the page without accidentally
        // panning the map; two-finger drag / scroll inside map still works.
        gestureHandling:   'cooperative',
      })

      markerRef.current = new window.google.maps.Marker({
        position: center,
        map:      mapObjRef.current,
        draggable: true,
        title:     'Drag to move the pin',
      })

      // Drag pin to fine-tune position
      markerRef.current.addListener('dragend', (e: any) => {
        updatePin(e.latLng.lat(), e.latLng.lng())
      })

      // Click anywhere on the map to teleport the pin
      mapObjRef.current.addListener('click', (e: any) => {
        const newLat = e.latLng.lat()
        const newLng = e.latLng.lng()
        markerRef.current?.setPosition({ lat: newLat, lng: newLng })
        updatePin(newLat, newLng)
      })
    }

    // Script already available
    if (window.google?.maps) { buildMap(); return }

    // Script tag already in DOM — wait for it
    const existing = document.getElementById('gmap-script')
    if (existing) {
      const poll = setInterval(() => {
        if (window.google?.maps) { buildMap(); clearInterval(poll) }
      }, 150)
      return () => clearInterval(poll)
    }

    // First Maps JS consumer on the page — inject the script tag
    const script   = document.createElement('script')
    script.id      = 'gmap-script'
    script.src     = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`
    script.async   = true
    script.defer   = true
    script.onload  = buildMap
    document.head.appendChild(script)
  }, [result, apiKey, updatePin])

  // ── Geocode via the server-side proxy ─────────────────────────────────────────

  async function geocode() {
    if (!query.trim()) return
    setStatus('loading')
    setErrMsg(null)

    try {
      const res  = await fetch(`/api/geocode?address=${encodeURIComponent(query.trim())}`)
      const data = await res.json()

      if (data.status === 'OK' && data.results?.length > 0) {
        const r    = data.results[0]
        const loc  = r.geometry.location
        const next: LocationResult = {
          lat:     loc.lat,
          lng:     loc.lng,
          address: r.formatted_address,
        }
        // Reset map instance so buildMap creates a fresh one centered on new result
        mapObjRef.current = null
        markerRef.current = null
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
    mapObjRef.current = null
    markerRef.current = null
    onChange(null)
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
        Results are restricted to Mongolia. If your camp isn&apos;t found, search for the nearest town or province, then drag the pin.
      </p>

      {/* Error */}
      {status === 'error' && (
        <div className="mt-2 flex items-start gap-1.5 p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>{errMsg}</span>
        </div>
      )}

      {/* Interactive map — shown once a result exists */}
      {result && (
        <>
          {apiKey ? (
            <div className="mt-3 space-y-1.5">
              {/* Map canvas */}
              <div
                ref={mapRef}
                className="h-56 rounded-xl overflow-hidden border border-gray-200 bg-gray-100 cursor-crosshair"
              />
              {/* Drag hint */}
              <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                <Move className="w-3 h-3 shrink-0" />
                Drag the pin or click the map to fine-tune the exact location.
              </div>
            </div>
          ) : (
            <div className="mt-3 h-12 flex items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 text-xs text-amber-700">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              Map preview unavailable — add{' '}
              <code className="font-mono bg-amber-100 px-1 rounded">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code>
            </div>
          )}

          {/* Coordinate readout + clear */}
          <div className="mt-1.5 flex items-start justify-between gap-2 p-2.5 bg-green-50 border border-green-200 rounded-xl">
            <div className="flex items-start gap-1.5 text-xs text-green-700 min-w-0">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span className="min-w-0">
                <span className="font-medium truncate block">{result.address || 'Location selected'}</span>
                <span className="text-green-500 tabular-nums">
                  {result.lat.toFixed(6)}, {result.lng.toFixed(6)}
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
        </>
      )}
    </div>
  )
}
