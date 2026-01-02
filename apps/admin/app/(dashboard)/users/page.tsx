import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { prisma } from '@affiliate/database'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { authOptions } from '@/lib/auth'
import { UsersTable } from './UsersTable'

async function getUsers() {
  const users = await prisma.user.findMany({
    include: {
      sites: {
        include: {
          site: {
            select: { id: true, name: true, slug: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return users.map((user) => ({
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    sites: user.sites.map((us) => us.site),
  }))
}

export default async function UsersPage() {
  const session = await getServerSession(authOptions)

  // Check if user is admin
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/sites')
  }

  const users = await getUsers()

  return (
    <div className="max-w-6xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500 mt-1">
            Manage admin and site owner accounts
          </p>
        </div>
        <Link
          href="/users/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white font-medium rounded-md hover:bg-primary-hover transition-colors"
        >
          <Plus className="w-4 h-4" />
          New User
        </Link>
      </div>

      {/* Users Table */}
      <UsersTable users={users} currentUserId={session.user.id} />
    </div>
  )
}
