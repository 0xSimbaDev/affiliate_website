import { redirect, notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { prisma } from '@affiliate/database'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { authOptions } from '@/lib/auth'
import { UserForm, UserFormData } from '@/components/forms/UserForm'
import { updateUser } from '../actions'

async function getUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      sites: {
        select: { siteId: true },
      },
    },
  })

  if (!user) return null

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    isActive: user.isActive,
    siteIds: user.sites.map((us) => us.siteId),
  }
}

async function getSites() {
  const sites = await prisma.site.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
    },
    orderBy: { name: 'asc' },
  })

  return sites
}

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  const { userId } = await params
  const session = await getServerSession(authOptions)

  // Check if user is admin
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/sites')
  }

  const [user, sites] = await Promise.all([getUser(userId), getSites()])

  if (!user) {
    notFound()
  }

  async function handleSubmit(data: UserFormData) {
    'use server'

    return updateUser(userId, {
      email: data.email,
      name: data.name,
      password: data.password,
      confirmPassword: data.confirmPassword,
      role: data.role,
      isActive: data.isActive,
      siteIds: data.siteIds || [],
    })
  }

  return (
    <div className="max-w-3xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/users"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Users
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit User</h1>
        <p className="text-gray-500 mt-1">{user.email}</p>
      </div>

      {/* Form */}
      <UserForm
        sites={sites}
        defaultValues={{
          email: user.email,
          name: user.name,
          role: user.role,
          isActive: user.isActive,
          siteIds: user.siteIds,
          password: '',
          confirmPassword: '',
        }}
        userId={user.id}
        currentUserId={session.user.id}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
