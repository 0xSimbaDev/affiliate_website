import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { prisma } from '@affiliate/database'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { authOptions } from '@/lib/auth'
import { UserForm, UserFormData } from '@/components/forms/UserForm'
import { createUser } from '../actions'

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

export default async function NewUserPage() {
  const session = await getServerSession(authOptions)

  // Check if user is admin
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/sites')
  }

  const sites = await getSites()

  async function handleSubmit(data: UserFormData) {
    'use server'

    return createUser({
      email: data.email,
      name: data.name,
      password: data.password || '',
      confirmPassword: data.confirmPassword || '',
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
        <h1 className="text-2xl font-bold text-gray-900">Create New User</h1>
        <p className="text-gray-500 mt-1">
          Add a new admin or site owner account
        </p>
      </div>

      {/* Form */}
      <UserForm
        sites={sites}
        currentUserId={session.user.id}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
