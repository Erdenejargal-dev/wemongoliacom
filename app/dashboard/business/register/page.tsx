import { redirect } from 'next/navigation'

/**
 * Backward-compatible redirect:
 * The single official provider onboarding flow is `/onboarding`.
 */
export default function BusinessRegisterRedirect() {
  redirect('/onboarding')
}
