'use client'

/**
 * components/stays/PropertyMap.tsx
 *
 * Customer-facing Google Map with a pin for accommodation listings.
 *
 * Hardening:
 *  - Reads API key only from NEXT_PUBLIC_GOOGLE_MAPS_API_KEY env var
 *  - Renders a "Map unavailable" placeholder when the key is absent
 *  - Script loading is idempotent — only one <script> tag appended per page
 *  - Map and marker instances are stored in refs; lat/lng changes pan the
 *    existing map instead of destroying and rebuilding it
 *  - Coordinates validated (finite, within WGS-84 bounds) before rendering
 *  - Mounted ref prevents initMap from updating DOM after component unmounts
 */

import { useEffect, useRef } from 'react'
import { MapPin, ExternalLink, AlertCircle } from 'lucide-react'

declare global {
  interface Window { google: any }
}

interface PropertyMapProps {
  lat:   number
  lng:   number
  /** Human-readable location label shown above the map */
  label: string
}

/** Returns true if the value is a valid WGS-84 latitude */
function isValidLat(v: number) { return isFinite(v) && v >= -90  && v <= 90  }
/** Returns true if the value is a valid WGS-84 longitude */
function isValidLng(v: number) { return isFinite(v) && v >= -180 && v <= 180 }

export function PropertyMap({ lat, lng, label }: PropertyMapProps) {
  const mapRef     = useRef<HTMLDivElement>(null)
  const mapObjRef  = useRef<any>(null)   // google.maps.Map instance
  const markerRef  = useRef<any>(null)   // google.maps.Marker instance
  const mountedRef = useRef(true)        // false after unmount

  const apiKey     = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  const coordsValid = isValidLat(lat) && isValidLng(lng)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  useEffect(() => {
    if (!apiKey || !mapRef.current || !coordsValid) return

    const center = { lat, lng }

    function initMap() {
      if (!mountedRef.current || !mapRef.current || !window.google?.maps) return

      // ── Map already exists — just pan + reposition the marker ──────────────
      if (mapObjRef.current) {
        mapObjRef.current.panTo(center)
        if (markerRef.current) {
          markerRef.current.setPosition(center)
        }
        return
      }

      // ── First render — create map + marker ─────────────────────────────────
      mapObjRef.current = new window.google.maps.Map(mapRef.current, {
        center,
        zoom:              14,
        mapTypeControl:    false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl:       true,
      })
      markerRef.current = new window.google.maps.Marker({
        position: center,
        map:      mapObjRef.current,
        title:    label,
      })
    }

    // Script already available in this browser session
    if (window.google?.maps) { initMap(); return }

    // Another component already requested the script — poll until ready
    const existingScript = document.getElementById('gmap-script')
    if (existingScript) {
      const poll = setInterval(() => {
        if (window.google?.maps) { initMap(); clearInterval(poll) }
      }, 150)
      return () => clearInterval(poll)
    }

    // First Maps JS consumer on the page — inject the script tag
    const script   = document.createElement('script')
    script.id      = 'gmap-script'
    script.src     = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`
    script.async   = true
    script.defer   = true
    script.onload  = initMap
    document.head.appendChild(script)
  }, [lat, lng, label, apiKey, coordsValid])

  const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`

  // ── Invalid coordinates ──────────────────────────────────────────────────────
  if (!coordsValid) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-50">
          <MapPin className="w-4 h-4 text-gray-400" />
          <h2 className="text-lg font-bold text-gray-900">Location</h2>
        </div>
        <div className="h-24 flex items-center justify-center gap-2 text-sm text-gray-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          Location coordinates not available
        </div>
      </div>
    )
  }

  // ── API key not configured ───────────────────────────────────────────────────
  if (!apiKey) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-brand-500" />
            <h2 className="text-lg font-bold text-gray-900">Location</h2>
          </div>
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open in Google Maps
          </a>
        </div>
        {label && (
          <div className="px-5 py-3 border-b border-gray-50 flex items-start gap-2">
            <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
            <p className="text-sm text-gray-700">{label}</p>
          </div>
        )}
        <div className="flex items-center justify-center gap-2 h-32 bg-gray-50 text-sm text-gray-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          Interactive map unavailable — API key not configured
        </div>
      </div>
    )
  }

  // ── Full interactive map ─────────────────────────────────────────────────────
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-brand-500" />
          <h2 className="text-lg font-bold text-gray-900">Location</h2>
        </div>
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Open in Google Maps
        </a>
      </div>

      {/* Location label */}
      {label && (
        <div className="px-5 py-3 border-b border-gray-50 flex items-start gap-2">
          <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
          <p className="text-sm text-gray-700">{label}</p>
        </div>
      )}

      {/* Map canvas — kept in the DOM so the map instance is preserved */}
      <div ref={mapRef} className="h-72 w-full bg-gray-100" />
    </div>
  )
}
