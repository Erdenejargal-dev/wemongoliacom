'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

export default function GuideSettingsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const userName = session?.user?.name ?? 'Guide'

  async function handleSignOut() {
    await signOut({ redirect: false })
    router.push('/')
  }

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-xl font-bold text-gray-900">Account Settings</h1>

      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <p className="text-sm font-medium text-gray-700">Signed in as</p>
        <p className="text-sm text-gray-500 mt-0.5">{session?.user?.email}</p>
        <p className="text-xs text-gray-400 mt-0.5">{userName}</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <p className="text-sm font-medium text-gray-700 mb-3">Actions</p>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <p className="text-sm font-medium text-gray-700 mb-1">Guide Portal</p>
        <p className="text-xs text-gray-400">
          To update your email or password, contact{' '}
          <a href="mailto:hello@wemongolia.com" className="text-brand-600 hover:underline">hello@wemongolia.com</a>
        </p>
      </div>
    </div>
  )
}
