'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { prisma } from '@affiliate/database'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { authOptions } from '@/lib/auth'

// Validation schema for creating a user
const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().optional().nullable(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  role: z.enum(['ADMIN', 'OWNER']).default('OWNER'),
  isActive: z.boolean().default(true),
  siteIds: z.array(z.string()).optional().default([]),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

// Validation schema for updating a user
const updateUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().optional().nullable(),
  password: z.string().min(8, 'Password must be at least 8 characters').optional().or(z.literal('')),
  confirmPassword: z.string().optional().or(z.literal('')),
  role: z.enum(['ADMIN', 'OWNER']),
  isActive: z.boolean(),
  siteIds: z.array(z.string()).optional().default([]),
}).refine((data) => {
  if (data.password && data.password !== data.confirmPassword) {
    return false
  }
  return true
}, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type CreateUserInput = z.infer<typeof createUserSchema>
type UpdateUserInput = z.infer<typeof updateUserSchema>

/**
 * Check if the current user is an admin
 */
async function requireAdmin() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  if (session.user.role !== 'ADMIN') {
    throw new Error('Admin access required')
  }

  return session.user
}

/**
 * Create a new user
 */
export async function createUser(
  data: CreateUserInput
): Promise<{ success: boolean; error?: string; userId?: string }> {
  try {
    await requireAdmin()

    // Validate input
    const validated = createUserSchema.parse(data)

    // Check if email is already taken
    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    })

    if (existingUser) {
      return { success: false, error: 'A user with this email already exists' }
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(validated.password, 12)

    // Create the user
    const user = await prisma.user.create({
      data: {
        email: validated.email,
        name: validated.name || null,
        password: hashedPassword,
        role: validated.role,
        isActive: validated.isActive,
      },
    })

    // Create UserSite relationships for OWNER role
    if (validated.role === 'OWNER' && validated.siteIds.length > 0) {
      await prisma.userSite.createMany({
        data: validated.siteIds.map((siteId) => ({
          userId: user.id,
          siteId,
        })),
      })
    }

    revalidatePath('/users')
    return { success: true, userId: user.id }
  } catch (error) {
    console.error('Failed to create user:', error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message || 'Validation failed' }
    }
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to create user' }
  }
}

/**
 * Update an existing user
 */
export async function updateUser(
  userId: string,
  data: UpdateUserInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const currentUser = await requireAdmin()

    // Validate input
    const validated = updateUserSchema.parse(data)

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!existingUser) {
      return { success: false, error: 'User not found' }
    }

    // Prevent admin from demoting themselves
    if (userId === currentUser.id && validated.role !== 'ADMIN') {
      return { success: false, error: 'You cannot change your own role' }
    }

    // Check if email is already taken by another user
    if (validated.email !== existingUser.email) {
      const emailConflict = await prisma.user.findUnique({
        where: { email: validated.email },
      })

      if (emailConflict) {
        return { success: false, error: 'A user with this email already exists' }
      }
    }

    // Prepare update data
    const updateData: {
      email: string
      name: string | null
      role: 'ADMIN' | 'OWNER'
      isActive: boolean
      password?: string
    } = {
      email: validated.email,
      name: validated.name || null,
      role: validated.role,
      isActive: validated.isActive,
    }

    // Hash password if provided
    if (validated.password) {
      updateData.password = await bcrypt.hash(validated.password, 12)
    }

    // Update the user
    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    })

    // Update UserSite relationships
    // First, remove all existing relationships
    await prisma.userSite.deleteMany({
      where: { userId },
    })

    // Then create new ones for OWNER role
    if (validated.role === 'OWNER' && validated.siteIds.length > 0) {
      await prisma.userSite.createMany({
        data: validated.siteIds.map((siteId) => ({
          userId,
          siteId,
        })),
      })
    }

    revalidatePath('/users')
    revalidatePath(`/users/${userId}`)
    return { success: true }
  } catch (error) {
    console.error('Failed to update user:', error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message || 'Validation failed' }
    }
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to update user' }
  }
}

/**
 * Delete a user
 */
export async function deleteUser(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const currentUser = await requireAdmin()

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return { success: false, error: 'User not found' }
    }

    // Prevent admin from deleting themselves
    if (userId === currentUser.id) {
      return { success: false, error: 'You cannot delete your own account' }
    }

    // Delete the user (cascades to UserSite, Sessions, Accounts)
    await prisma.user.delete({
      where: { id: userId },
    })

    revalidatePath('/users')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete user:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to delete user' }
  }
}

/**
 * Toggle user active status
 */
export async function toggleUserStatus(
  userId: string
): Promise<{ success: boolean; error?: string; isActive?: boolean }> {
  try {
    const currentUser = await requireAdmin()

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return { success: false, error: 'User not found' }
    }

    // Prevent admin from disabling themselves
    if (userId === currentUser.id) {
      return { success: false, error: 'You cannot disable your own account' }
    }

    // Toggle status
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isActive: !user.isActive,
      },
    })

    revalidatePath('/users')
    return { success: true, isActive: updatedUser.isActive }
  } catch (error) {
    console.error('Failed to toggle user status:', error)
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Failed to toggle user status' }
  }
}
