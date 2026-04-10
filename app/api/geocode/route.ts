import { NextRequest, NextResponse } from 'next/server'

/**
 * app/api/geocode/route.ts
 *
 * Server-side proxy for the Google Geocoding REST API.
 *
 * Why proxy through the server?
 *  - The GOOGLE_MAPS_API_KEY env var (non-NEXT_PUBLIC) stays on the server —
 *    never exposed in client JS bundles.
 *  - HTTP referrer restrictions on the API key don't apply here; the server
 *    makes the outbound request, not the browser.
 *  - IP restrictions can be set to the server's static IP for tighter security.
 *
 * Query params:
 *   address  — the search query string (required)
 *
 * Returns the raw Google Geocoding JSON response so the client can reuse
 * the same `data.status` / `data.results` logic it had before.
 */
export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get('address')?.trim()

  if (!address) {
    return NextResponse.json(
      { status: 'INVALID_REQUEST', results: [] },
      { status: 400 },
    )
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { status: 'NOT_CONFIGURED', results: [] },
      { status: 503 },
    )
  }

  try {
    const url = new URL('https://maps.googleapis.com/maps/api/geocode/json')
    url.searchParams.set('address',    address)
    url.searchParams.set('region',     'mn')           // Mongolia region bias
    url.searchParams.set('components', 'country:MN')   // restrict to Mongolia
    url.searchParams.set('key',        apiKey)

    const upstream = await fetch(url.toString(), {
      // Cache identical address lookups for 1 hour to reduce API usage
      next: { revalidate: 3600 },
    })

    if (!upstream.ok) {
      return NextResponse.json(
        { status: 'UPSTREAM_ERROR', results: [] },
        { status: 502 },
      )
    }

    const data = await upstream.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json(
      { status: 'REQUEST_ERROR', results: [] },
      { status: 502 },
    )
  }
}
