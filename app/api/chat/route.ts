import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { convertToModelMessages, stepCountIs, streamText, tool, type UIMessage } from 'ai'
import { z } from 'zod'

export const maxDuration = 30

const registerUserInputSchema = z.object({
  name: z
    .string()
    .min(3)
    .describe('The user full name, including both first and last name'),
  email: z.string().email().describe('The user email address'),
  password: z
    .string()
    .min(8)
    .describe('The password the user wants to use. It must be at least 8 characters'),
})

const systemPrompt = [
  'You are the official We Mongolia Concierge.',
  'Only assist with We Mongolia site tasks such as Mongolian travel browsing, booking guidance, and account registration.',
  'If a user asks for off-topic help, politely refuse and redirect them to We Mongolia related help only.',
  'When a user wants to sign up or create an account, collect their full name, email, and password naturally in chat.',
  'Before calling the registerUser tool, make sure you have all three fields.',
  'Ask for the full legal first and last name if the user only gives one name.',
  'Do not repeat passwords back to the user.',
  'After a successful registration, confirm the account was created and invite the user to sign in.',
].join(' ')

export async function POST(req: Request) {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim()

  if (!apiKey) {
    return Response.json(
      { error: 'GOOGLE_GENERATIVE_AI_API_KEY is not configured.' },
      { status: 500 },
    )
  }

  const { messages } = await req.json().catch(() => ({ messages: [] })) as {
    messages?: UIMessage[]
  }

  const google = createGoogleGenerativeAI({ apiKey })
  const registerUrl = new URL('/api/register-user', req.url)
  const modelMessages = await convertToModelMessages(messages ?? [])

  const result = streamText({
    model: google('gemini-2.5-flash-lite'),
    system: systemPrompt,
    messages: modelMessages,
    stopWhen: stepCountIs(5),
    tools: {
      registerUser: tool({
        description:
          'Create a We Mongolia traveler account after collecting the full name, email, and password.',
        inputSchema: registerUserInputSchema,
        execute: async ({ name, email, password }) => {
          const parts = name.trim().split(/\s+/).filter(Boolean)

          if (parts.length < 2) {
            return {
              success: false,
              message: 'Please provide both a first name and a last name.',
            }
          }

          const firstName = parts[0]
          const lastName = parts.slice(1).join(' ')

          const res = await fetch(registerUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-store',
            body: JSON.stringify({
              firstName,
              lastName,
              email,
              password,
            }),
          }).catch(() => null)

          if (!res) {
            return {
              success: false,
              message: 'The registration service is unavailable right now.',
            }
          }

          const payload = await res.json().catch(() => null) as
            | {
                success?: boolean
                data?: {
                  user?: {
                    id?: string
                    firstName?: string
                    lastName?: string
                    email?: string
                    role?: string
                  }
                }
                error?: string
              }
            | null

          if (!res.ok || !payload?.success || !payload.data?.user) {
            return {
              success: false,
              message: payload?.error ?? 'We could not create the account.',
            }
          }

          return {
            success: true,
            message: `Account created for ${payload.data.user.firstName ?? firstName}.`,
            user: {
              id: payload.data.user.id ?? '',
              firstName: payload.data.user.firstName ?? firstName,
              lastName: payload.data.user.lastName ?? lastName,
              email: payload.data.user.email ?? email,
              role: payload.data.user.role ?? 'traveler',
            },
          }
        },
      }),
    },
  })

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
  })
}
