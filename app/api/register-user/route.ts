import { NextResponse } from 'next/server'
import { z } from 'zod'

const registerUserSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.string().trim().email(),
  password: z.string().min(8),
})

export async function POST(req: Request) {
  const parsed = registerUserSchema.safeParse(await req.json().catch(() => null))

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'Please provide a valid name, email, and password.' },
      { status: 400 },
    )
  }

  const backendUrl = process.env.BACKEND_URL?.trim()
  if (!backendUrl) {
    return NextResponse.json(
      { success: false, error: 'BACKEND_URL is not configured.' },
      { status: 500 },
    )
  }

  const upstream = await fetch(`${backendUrl.replace(/\/$/, '')}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
    body: JSON.stringify(parsed.data),
  }).catch(() => null)

  if (!upstream) {
    return NextResponse.json(
      { success: false, error: 'Registration service is unavailable right now.' },
      { status: 502 },
    )
  }

  const payload = await upstream.json().catch(() => null) as
    | { success?: boolean; data?: { user?: { id?: string; firstName?: string; lastName?: string; email?: string; role?: string } }; error?: string }
    | null

  if (!upstream.ok || !payload?.success || !payload.data?.user) {
    return NextResponse.json(
      { success: false, error: payload?.error ?? 'We could not create your account.' },
      { status: upstream.status || 500 },
    )
  }

  return NextResponse.json({
    success: true,
    data: {
      user: {
        id: payload.data.user.id ?? '',
        firstName: payload.data.user.firstName ?? parsed.data.firstName,
        lastName: payload.data.user.lastName ?? parsed.data.lastName,
        email: payload.data.user.email ?? parsed.data.email,
        role: payload.data.user.role ?? 'traveler',
      },
    },
  })
}
