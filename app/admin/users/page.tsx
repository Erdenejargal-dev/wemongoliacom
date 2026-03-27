'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Search, ChevronLeft, ChevronRight, Shield, UserCheck, User } from 'lucide-react'
import { useDebounce } from '@/lib/hooks/useDebounce'
import { fetchAdminUsers, setAdminUserRole } from '@/lib/api/admin'
import type { AdminUser } from '@/lib/api/admin'

// ── helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const roleConfig: Record<string, { label: string; cls: string; icon: React.ElementType }> = {
  traveler:       { label: 'Traveler',        cls: 'bg-blue-50 text-blue-700 border-blue-200',   icon: User },
  provider_owner: { label: 'Provider Owner',  cls: 'bg-purple-50 text-purple-700 border-purple-200', icon: UserCheck },
  admin:          { label: 'Admin',           cls: 'bg-amber-50 text-amber-700 border-amber-200', icon: Shield },
}

function RoleBadge({ role }: { role: string }) {
  const cfg = roleConfig[role] ?? { label: role, cls: 'bg-gray-50 text-gray-600 border-gray-200', icon: User }
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${cfg.cls}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  )
}

// ── page ─────────────────────────────────────────────────────────────────────

export default function AdminUsersPage() {
  const { data: session } = useSession()
  const token = session?.user?.accessToken

  const [users, setUsers]         = useState<AdminUser[]>([])
  const [total, setTotal]         = useState(0)
  const [pages, setPages]         = useState(1)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState<string | null>(null)
  const [search, setSearch]       = useState('')
  const debouncedSearch           = useDebounce(search, 300)
  const [roleFilter, setRoleFilter] = useState('')
  const [page, setPage]           = useState(1)

  // Reset to page 1 only when debounced search value changes — not on every keystroke
  useEffect(() => { setPage(1) }, [debouncedSearch])
  const [roleModal, setRoleModal] = useState<AdminUser | null>(null)
  const [newRole, setNewRole]     = useState<string>('')
  const [saving, setSaving]       = useState(false)

  const LIMIT = 20

  const load = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const result = await fetchAdminUsers(
        { search: debouncedSearch || undefined, role: roleFilter || undefined, page, limit: LIMIT },
        token,
      )
      setUsers(result.data)
      setTotal(result.pagination.total)
      setPages(result.pagination.pages)
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [token, debouncedSearch, roleFilter, page])

  useEffect(() => { load() }, [load])

  async function handleSetRole() {
    if (!token || !roleModal || !newRole) return
    setSaving(true)
    try {
      await setAdminUserRole(roleModal.id, newRole as any, token)
      setRoleModal(null)
      load()
    } catch (e: any) {
      alert(e?.message ?? 'Failed to update role')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {total.toLocaleString()} total accounts
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10"
          />
        </div>
        <select
          value={roleFilter}
          onChange={e => { setRoleFilter(e.target.value); setPage(1) }}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/10"
        >
          <option value="">All roles</option>
          <option value="traveler">Traveler</option>
          <option value="provider_owner">Provider Owner</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {error ? (
          <div className="p-8 text-center text-sm text-red-600">{error}</div>
        ) : loading ? (
          <div className="p-8 flex justify-center">
            <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Bookings</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Reviews</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Joined</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 shrink-0">
                          {u.firstName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {u.firstName} {u.lastName}
                          </p>
                          <p className="text-xs text-gray-400 truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
                      {u._count.bookings}
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">
                      {u._count.reviews}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs hidden lg:table-cell whitespace-nowrap">
                      {fmtDate(u.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => { setRoleModal(u); setNewRole(u.role) }}
                        className="text-xs text-gray-500 hover:text-gray-900 font-medium px-2 py-1 rounded hover:bg-gray-100 transition-colors"
                      >
                        Edit role
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && pages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm">
            <p className="text-gray-500 text-xs">
              Page {page} of {pages} · {total} total
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(pages, p + 1))}
                disabled={page === pages}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Role edit modal */}
      {roleModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h2 className="text-base font-bold text-gray-900 mb-1">Change Role</h2>
            <p className="text-sm text-gray-500 mb-4">
              {roleModal.firstName} {roleModal.lastName} · {roleModal.email}
            </p>
            <select
              value={newRole}
              onChange={e => setNewRole(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
            >
              <option value="traveler">Traveler</option>
              <option value="provider_owner">Provider Owner</option>
              <option value="admin">Admin</option>
            </select>
            <div className="flex gap-2">
              <button
                onClick={() => setRoleModal(null)}
                className="flex-1 px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSetRole}
                disabled={saving || newRole === roleModal.role}
                className="flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
