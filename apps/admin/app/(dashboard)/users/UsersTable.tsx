'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, Pencil, Trash2, MoreHorizontal, UserCheck, UserX } from 'lucide-react'
import { toast } from 'sonner'
import { toggleUserStatus, deleteUser } from './actions'

interface Site {
  id: string
  name: string
  slug: string
}

interface User {
  id: string
  email: string
  name: string | null
  image: string | null
  role: 'ADMIN' | 'OWNER'
  isActive: boolean
  createdAt: Date
  sites: Site[]
}

interface UsersTableProps {
  users: User[]
  currentUserId: string
}

export function UsersTable({ users, currentUserId }: UsersTableProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  // Filter users
  const filteredUsers = users.filter((user) => {
    // Search filter
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch =
      !searchQuery ||
      user.email.toLowerCase().includes(searchLower) ||
      (user.name && user.name.toLowerCase().includes(searchLower))

    // Role filter
    const matchesRole = !roleFilter || user.role === roleFilter

    // Status filter
    const matchesStatus =
      !statusFilter ||
      (statusFilter === 'active' && user.isActive) ||
      (statusFilter === 'inactive' && !user.isActive)

    return matchesSearch && matchesRole && matchesStatus
  })

  // Get initials for avatar
  const getInitials = (name: string | null, email: string) => {
    if (name) {
      const parts = name.split(' ')
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
      }
      return name.substring(0, 2).toUpperCase()
    }
    return email.substring(0, 2).toUpperCase()
  }

  // Handle toggle status
  const handleToggleStatus = async (userId: string) => {
    setOpenMenuId(null)
    startTransition(async () => {
      const result = await toggleUserStatus(userId)
      if (result.success) {
        toast.success(result.isActive ? 'User activated' : 'User deactivated')
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to toggle user status')
      }
    })
  }

  // Handle delete
  const handleDelete = async (userId: string, email: string) => {
    setOpenMenuId(null)
    if (!confirm(`Are you sure you want to delete ${email}? This action cannot be undone.`)) {
      return
    }

    startTransition(async () => {
      const result = await deleteUser(userId)
      if (result.success) {
        toast.success('User deleted successfully')
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to delete user')
      }
    })
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="bg-white rounded-lg border mb-4">
        <div className="p-4 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-10 px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="OWNER">Owner</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Search className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {users.length === 0 ? 'No users yet' : 'No matching users'}
            </h3>
            <p className="text-gray-500 mb-6">
              {users.length === 0
                ? 'Create your first user to get started.'
                : 'Try adjusting your search or filters.'}
            </p>
            {users.length === 0 && (
              <Link
                href="/users/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white font-medium rounded-md hover:bg-primary-hover transition-colors"
              >
                Create User
              </Link>
            )}
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sites
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredUsers.map((user) => {
                const isCurrentUser = user.id === currentUserId

                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        {user.image ? (
                          <img
                            src={user.image}
                            alt={user.name || user.email}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
                            {getInitials(user.name, user.email)}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">
                            {user.name || 'No name'}
                            {isCurrentUser && (
                              <span className="ml-2 text-xs text-gray-400">(you)</span>
                            )}
                          </p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                          user.role === 'ADMIN'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {user.role === 'ADMIN' ? 'Admin' : 'Owner'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.role === 'ADMIN' ? (
                        <span className="text-sm text-gray-500 italic">All sites</span>
                      ) : user.sites.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {user.sites.slice(0, 3).map((site) => (
                            <span
                              key={site.id}
                              className="inline-flex px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
                            >
                              {site.name}
                            </span>
                          ))}
                          {user.sites.length > 3 && (
                            <span className="inline-flex px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                              +{user.sites.length - 3} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">No sites</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            user.isActive ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        />
                        <span className="text-sm text-gray-600">
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/users/${user.id}`}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        {/* Actions Menu */}
                        <div className="relative">
                          <button
                            onClick={() =>
                              setOpenMenuId(openMenuId === user.id ? null : user.id)
                            }
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                            disabled={isPending}
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                          {openMenuId === user.id && (
                            <>
                              {/* Backdrop */}
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() => setOpenMenuId(null)}
                              />
                              {/* Menu */}
                              <div className="absolute right-0 mt-1 w-48 bg-white border rounded-md shadow-lg z-20">
                                <div className="py-1">
                                  {!isCurrentUser && (
                                    <button
                                      onClick={() => handleToggleStatus(user.id)}
                                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                      {user.isActive ? (
                                        <>
                                          <UserX className="w-4 h-4" />
                                          Deactivate
                                        </>
                                      ) : (
                                        <>
                                          <UserCheck className="w-4 h-4" />
                                          Activate
                                        </>
                                      )}
                                    </button>
                                  )}
                                  {!isCurrentUser && (
                                    <button
                                      onClick={() => handleDelete(user.id, user.email)}
                                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                      Delete
                                    </button>
                                  )}
                                  {isCurrentUser && (
                                    <div className="px-4 py-2 text-sm text-gray-400">
                                      Cannot modify your own account
                                    </div>
                                  )}
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Summary */}
      {filteredUsers.length > 0 && (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <p>
            Showing {filteredUsers.length} of {users.length} users
          </p>
        </div>
      )}
    </div>
  )
}
