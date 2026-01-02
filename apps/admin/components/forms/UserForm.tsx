'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Eye, EyeOff, Check, X } from 'lucide-react'
import { toast } from 'sonner'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'

// Password strength checks
const passwordChecks = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'Contains uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Contains lowercase letter', test: (p: string) => /[a-z]/.test(p) },
  { label: 'Contains number', test: (p: string) => /\d/.test(p) },
  { label: 'Contains special character', test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
]

// Form validation schema
const userFormSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().optional().nullable(),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
  role: z.enum(['ADMIN', 'OWNER']),
  isActive: z.boolean(),
  siteIds: z.array(z.string()).optional().default([]),
})

export type UserFormData = z.infer<typeof userFormSchema>

interface Site {
  id: string
  name: string
  slug: string
}

interface UserFormProps {
  sites: Site[]
  defaultValues?: Partial<UserFormData>
  userId?: string
  currentUserId?: string
  onSubmit: (data: UserFormData) => Promise<{ success: boolean; error?: string }>
}

export function UserForm({
  sites,
  defaultValues,
  userId,
  currentUserId,
  onSubmit,
}: UserFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const isEditing = !!userId
  const isEditingSelf = userId === currentUserId

  // Create dynamic schema based on whether we're creating or editing
  const dynamicSchema = userFormSchema.superRefine((data, ctx) => {
    // Password is required for new users
    if (!isEditing && (!data.password || data.password.length < 8)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Password must be at least 8 characters',
        path: ['password'],
      })
    }

    // Confirm password must match if password is provided
    if (data.password && data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Passwords do not match',
        path: ['confirmPassword'],
      })
    }
  })

  const form = useForm<UserFormData>({
    resolver: zodResolver(dynamicSchema),
    defaultValues: {
      email: '',
      name: '',
      password: '',
      confirmPassword: '',
      role: 'OWNER',
      isActive: true,
      siteIds: [],
      ...defaultValues,
    },
  })

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = form

  const watchPassword = watch('password') || ''
  const watchRole = watch('role')
  const watchSiteIds = watch('siteIds') || []

  // Calculate password strength
  const passwordStrength = passwordChecks.filter((check) => check.test(watchPassword)).length
  const passwordStrengthPercent = (passwordStrength / passwordChecks.length) * 100
  const passwordStrengthColor =
    passwordStrengthPercent >= 80
      ? 'bg-green-500'
      : passwordStrengthPercent >= 60
      ? 'bg-yellow-500'
      : passwordStrengthPercent >= 40
      ? 'bg-orange-500'
      : 'bg-red-500'

  const handleFormSubmit = (data: UserFormData) => {
    startTransition(async () => {
      try {
        const result = await onSubmit(data)
        if (result.success) {
          toast.success(isEditing ? 'User updated successfully' : 'User created successfully')
          router.push('/users')
          router.refresh()
        } else {
          toast.error(result.error || 'Something went wrong')
        }
      } catch (error) {
        toast.error('Failed to save user')
      }
    })
  }

  // Site management
  const toggleSite = (siteId: string) => {
    if (watchSiteIds.includes(siteId)) {
      setValue(
        'siteIds',
        watchSiteIds.filter((id) => id !== siteId)
      )
    } else {
      setValue('siteIds', [...watchSiteIds, siteId])
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="bg-white rounded-lg border p-6 space-y-6">
        <h3 className="font-medium text-gray-900">User Information</h3>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" required>
            Email
          </Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder="user@example.com"
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            {...register('name')}
            placeholder="John Doe"
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>
      </div>

      {/* Password Section */}
      <div className="bg-white rounded-lg border p-6 space-y-6">
        <h3 className="font-medium text-gray-900">
          {isEditing ? 'Change Password' : 'Password'}
        </h3>
        {isEditing && (
          <p className="text-sm text-gray-500">
            Leave password fields empty to keep the current password.
          </p>
        )}

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password" required={!isEditing}>
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              placeholder={isEditing ? 'Enter new password' : 'Enter password'}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          )}

          {/* Password Strength Indicator */}
          {watchPassword && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${passwordStrengthColor}`}
                    style={{ width: `${passwordStrengthPercent}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500">
                  {passwordStrengthPercent >= 80
                    ? 'Strong'
                    : passwordStrengthPercent >= 60
                    ? 'Good'
                    : passwordStrengthPercent >= 40
                    ? 'Fair'
                    : 'Weak'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                {passwordChecks.map((check) => (
                  <div
                    key={check.label}
                    className={`flex items-center gap-1 text-xs ${
                      check.test(watchPassword) ? 'text-green-600' : 'text-gray-400'
                    }`}
                  >
                    {check.test(watchPassword) ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <X className="w-3 h-3" />
                    )}
                    {check.label}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" required={!isEditing}>
            Confirm Password
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              {...register('confirmPassword')}
              placeholder="Confirm password"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
          )}
        </div>
      </div>

      {/* Role & Status Section */}
      <div className="bg-white rounded-lg border p-6 space-y-6">
        <h3 className="font-medium text-gray-900">Role & Status</h3>

        {/* Role */}
        <div className="space-y-2">
          <Label htmlFor="role" required>
            Role
          </Label>
          <Select
            value={watchRole}
            onValueChange={(value) => setValue('role', value as 'ADMIN' | 'OWNER')}
            disabled={isEditingSelf}
          >
            <SelectTrigger id="role">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ADMIN">
                <div className="flex items-center gap-2">
                  <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded bg-blue-100 text-blue-700">
                    Admin
                  </span>
                  <span className="text-gray-500">Full platform access</span>
                </div>
              </SelectItem>
              <SelectItem value="OWNER">
                <div className="flex items-center gap-2">
                  <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded bg-gray-100 text-gray-700">
                    Owner
                  </span>
                  <span className="text-gray-500">Manage assigned sites</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          {isEditingSelf && (
            <p className="text-xs text-amber-600">
              You cannot change your own role.
            </p>
          )}
          {errors.role && (
            <p className="text-sm text-red-500">{errors.role.message}</p>
          )}
        </div>

        {/* Active Status */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div>
            <Label htmlFor="isActive">Active</Label>
            <p className="text-xs text-gray-500">
              Inactive users cannot log in to the admin panel.
            </p>
          </div>
          <Switch
            id="isActive"
            checked={watch('isActive')}
            onCheckedChange={(checked) => setValue('isActive', checked)}
            disabled={isEditingSelf}
          />
        </div>
        {isEditingSelf && (
          <p className="text-xs text-amber-600">
            You cannot deactivate your own account.
          </p>
        )}
      </div>

      {/* Site Assignment (Only for OWNER role) */}
      {watchRole === 'OWNER' && (
        <div className="bg-white rounded-lg border p-6 space-y-6">
          <div>
            <h3 className="font-medium text-gray-900">Site Assignment</h3>
            <p className="text-sm text-gray-500 mt-1">
              Select the sites this user can manage.
            </p>
          </div>

          {sites.length === 0 ? (
            <p className="text-sm text-gray-500">
              No sites available. Create sites first.
            </p>
          ) : (
            <div className="space-y-3">
              {sites.map((site) => (
                <div
                  key={site.id}
                  className="flex items-center gap-3"
                >
                  <Checkbox
                    id={`site-${site.id}`}
                    checked={watchSiteIds.includes(site.id)}
                    onCheckedChange={() => toggleSite(site.id)}
                  />
                  <Label
                    htmlFor={`site-${site.id}`}
                    className="font-normal cursor-pointer"
                  >
                    {site.name}
                    <span className="text-xs text-gray-400 ml-2">
                      ({site.slug})
                    </span>
                  </Label>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-md disabled:opacity-50"
        >
          {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          {isEditing ? 'Update User' : 'Create User'}
        </button>
      </div>
    </form>
  )
}
