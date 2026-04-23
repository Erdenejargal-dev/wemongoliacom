import Link from 'next/link'

const messageByError: Record<string, string> = {
  CredentialsSignin: 'The email or password was incorrect. Please try again.',
  AccessDenied: 'Access was denied for this sign-in request.',
  Verification: 'This sign-in link is no longer valid. Please request a new one.',
  Default: 'We could not complete sign-in. Please try again.',
}

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams
  const message = messageByError[error ?? ''] ?? messageByError.Default

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-6 py-16 text-center">
      <div className="w-full rounded-3xl border border-amber-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-amber-700">Auth Error</p>
        <h1 className="mt-3 text-2xl font-semibold text-slate-900">Sign-in needs another try</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">{message}</p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            href="/auth/login"
            className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Back to login
          </Link>
          <Link
            href="/auth/forgot-password"
            className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            Reset password
          </Link>
        </div>
      </div>
    </main>
  )
}
