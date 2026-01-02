'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@affiliate/database'
import { z } from 'zod'

// Social links schema
const socialLinksSchema = z.object({
  twitter: z.string().url().optional().nullable().or(z.literal('')),
  facebook: z.string().url().optional().nullable().or(z.literal('')),
  instagram: z.string().url().optional().nullable().or(z.literal('')),
  youtube: z.string().url().optional().nullable().or(z.literal('')),
  linkedin: z.string().url().optional().nullable().or(z.literal('')),
  tiktok: z.string().url().optional().nullable().or(z.literal('')),
  pinterest: z.string().url().optional().nullable().or(z.literal('')),
})

// Theme schema
const themeSchema = z.object({
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color'),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color'),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color'),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color').optional(),
  textColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color').optional(),
  fontFamily: z.string().optional(),
  headingFontFamily: z.string().optional(),
})

// SEO settings schema
const seoSettingsSchema = z.object({
  metaTitleTemplate: z.string().max(100).optional().nullable(),
  metaDescription: z.string().max(200).optional().nullable(),
  robotsIndex: z.boolean().default(true),
  robotsFollow: z.boolean().default(true),
})

// General settings schema
const generalSettingsSchema = z.object({
  name: z.string().min(1, 'Site name is required').max(100),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  domain: z.string().min(1, 'Domain is required'),
  tagline: z.string().max(200).optional().nullable(),
  description: z.string().max(1000).optional().nullable(),
  logoUrl: z.string().url().optional().nullable().or(z.literal('')),
})

// Advanced settings schema
const advancedSettingsSchema = z.object({
  contentSlug: z.string().min(1, 'Content slug is required').regex(/^[a-z0-9-]+$/, 'Content slug can only contain lowercase letters, numbers, and hyphens'),
  gtmId: z.string().optional().nullable(),
  customHeadScripts: z.string().optional().nullable(),
  cdnBaseUrl: z.string().url().optional().nullable().or(z.literal('')),
  isActive: z.boolean().default(true),
})

// Full site settings schema
const siteSettingsSchema = z.object({
  // General
  name: generalSettingsSchema.shape.name,
  slug: generalSettingsSchema.shape.slug,
  domain: generalSettingsSchema.shape.domain,
  tagline: generalSettingsSchema.shape.tagline,
  description: generalSettingsSchema.shape.description,
  logoUrl: generalSettingsSchema.shape.logoUrl,
  // Theme
  theme: themeSchema,
  // Social
  social: socialLinksSchema,
  // SEO (stored in theme.seo)
  seo: seoSettingsSchema,
  // Advanced
  contentSlug: advancedSettingsSchema.shape.contentSlug,
  gtmId: advancedSettingsSchema.shape.gtmId,
  customHeadScripts: advancedSettingsSchema.shape.customHeadScripts,
  cdnBaseUrl: advancedSettingsSchema.shape.cdnBaseUrl,
  isActive: advancedSettingsSchema.shape.isActive,
})

export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>
export type GeneralSettingsInput = z.infer<typeof generalSettingsSchema>
export type ThemeSettingsInput = z.infer<typeof themeSchema>
export type SocialLinksInput = z.infer<typeof socialLinksSchema>
export type SeoSettingsInput = z.infer<typeof seoSettingsSchema>
export type AdvancedSettingsInput = z.infer<typeof advancedSettingsSchema>

export async function getSiteSettings(siteId: string) {
  const site = await prisma.site.findUnique({
    where: { id: siteId },
    include: {
      niche: { select: { id: true, name: true } },
    },
  })

  if (!site) return null

  // Parse theme JSON
  const theme = (site.theme as Record<string, unknown>) || {}
  const social = (site.social as Record<string, unknown>) || {}
  const seo = (theme.seo as Record<string, unknown>) || {}

  return {
    id: site.id,
    nicheId: site.nicheId,
    nicheName: site.niche.name,
    // General
    name: site.name,
    slug: site.slug,
    domain: site.domain,
    tagline: site.tagline || '',
    description: site.description || '',
    logoUrl: (theme.logoUrl as string) || '',
    // Theme
    theme: {
      primaryColor: (theme.primaryColor as string) || '#3B82F6',
      secondaryColor: (theme.secondaryColor as string) || '#6366F1',
      accentColor: (theme.accentColor as string) || '#F59E0B',
      backgroundColor: (theme.backgroundColor as string) || '#FFFFFF',
      textColor: (theme.textColor as string) || '#1F2937',
      fontFamily: (theme.fontFamily as string) || 'Inter',
      headingFontFamily: (theme.headingFontFamily as string) || 'Inter',
    },
    // Social
    social: {
      twitter: (social.twitter as string) || '',
      facebook: (social.facebook as string) || '',
      instagram: (social.instagram as string) || '',
      youtube: (social.youtube as string) || '',
      linkedin: (social.linkedin as string) || '',
      tiktok: (social.tiktok as string) || '',
      pinterest: (social.pinterest as string) || '',
    },
    // SEO
    seo: {
      metaTitleTemplate: (seo.metaTitleTemplate as string) || '%s | {siteName}',
      metaDescription: (seo.metaDescription as string) || '',
      robotsIndex: (seo.robotsIndex as boolean) ?? true,
      robotsFollow: (seo.robotsFollow as boolean) ?? true,
    },
    // Advanced
    contentSlug: site.contentSlug,
    gtmId: site.gtmId || '',
    cdnBaseUrl: site.cdnBaseUrl || '',
    customHeadScripts: (theme.customHeadScripts as string) || '',
    isActive: site.isActive,
    createdAt: site.createdAt,
    updatedAt: site.updatedAt,
  }
}

export async function updateGeneralSettings(
  siteId: string,
  data: GeneralSettingsInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const validated = generalSettingsSchema.parse(data)

    // Check if site exists
    const existingSite = await prisma.site.findUnique({
      where: { id: siteId },
      select: { id: true, slug: true, domain: true, theme: true },
    })

    if (!existingSite) {
      return { success: false, error: 'Site not found' }
    }

    // Check for slug uniqueness (excluding current site)
    if (validated.slug !== existingSite.slug) {
      const slugConflict = await prisma.site.findFirst({
        where: {
          slug: validated.slug,
          NOT: { id: siteId },
        },
      })
      if (slugConflict) {
        return { success: false, error: 'A site with this slug already exists' }
      }
    }

    // Check for domain uniqueness (excluding current site)
    if (validated.domain !== existingSite.domain) {
      const domainConflict = await prisma.site.findFirst({
        where: {
          domain: validated.domain,
          NOT: { id: siteId },
        },
      })
      if (domainConflict) {
        return { success: false, error: 'A site with this domain already exists' }
      }
    }

    // Update theme with logoUrl
    const currentTheme = (existingSite.theme as Record<string, unknown>) || {}
    const updatedTheme = {
      ...currentTheme,
      logoUrl: validated.logoUrl || null,
    }

    await prisma.site.update({
      where: { id: siteId },
      data: {
        name: validated.name,
        slug: validated.slug,
        domain: validated.domain,
        tagline: validated.tagline || null,
        description: validated.description || null,
        theme: updatedTheme,
      },
    })

    revalidatePath(`/sites/${siteId}/settings`)
    return { success: true }
  } catch (error) {
    console.error('Failed to update general settings:', error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message || 'Validation failed' }
    }
    return { success: false, error: 'Failed to update settings' }
  }
}

export async function updateThemeSettings(
  siteId: string,
  data: ThemeSettingsInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const validated = themeSchema.parse(data)

    const site = await prisma.site.findUnique({
      where: { id: siteId },
      select: { id: true, theme: true },
    })

    if (!site) {
      return { success: false, error: 'Site not found' }
    }

    const currentTheme = (site.theme as Record<string, unknown>) || {}
    const updatedTheme = {
      ...currentTheme,
      primaryColor: validated.primaryColor,
      secondaryColor: validated.secondaryColor,
      accentColor: validated.accentColor,
      backgroundColor: validated.backgroundColor || currentTheme.backgroundColor,
      textColor: validated.textColor || currentTheme.textColor,
      fontFamily: validated.fontFamily || currentTheme.fontFamily,
      headingFontFamily: validated.headingFontFamily || currentTheme.headingFontFamily,
    }

    await prisma.site.update({
      where: { id: siteId },
      data: { theme: updatedTheme },
    })

    revalidatePath(`/sites/${siteId}/settings`)
    return { success: true }
  } catch (error) {
    console.error('Failed to update theme settings:', error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message || 'Validation failed' }
    }
    return { success: false, error: 'Failed to update theme settings' }
  }
}

export async function updateSocialLinks(
  siteId: string,
  data: SocialLinksInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const validated = socialLinksSchema.parse(data)

    const site = await prisma.site.findUnique({
      where: { id: siteId },
      select: { id: true },
    })

    if (!site) {
      return { success: false, error: 'Site not found' }
    }

    // Filter out empty strings and convert to null-safe object
    const socialData: Record<string, string> = {}
    for (const [key, value] of Object.entries(validated)) {
      if (value && value.trim() !== '') {
        socialData[key] = value
      }
    }

    await prisma.site.update({
      where: { id: siteId },
      data: { social: socialData },
    })

    revalidatePath(`/sites/${siteId}/settings`)
    return { success: true }
  } catch (error) {
    console.error('Failed to update social links:', error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message || 'Validation failed' }
    }
    return { success: false, error: 'Failed to update social links' }
  }
}

export async function updateSeoSettings(
  siteId: string,
  data: SeoSettingsInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const validated = seoSettingsSchema.parse(data)

    const site = await prisma.site.findUnique({
      where: { id: siteId },
      select: { id: true, theme: true },
    })

    if (!site) {
      return { success: false, error: 'Site not found' }
    }

    const currentTheme = (site.theme as Record<string, unknown>) || {}
    const updatedTheme = {
      ...currentTheme,
      seo: {
        metaTitleTemplate: validated.metaTitleTemplate || null,
        metaDescription: validated.metaDescription || null,
        robotsIndex: validated.robotsIndex,
        robotsFollow: validated.robotsFollow,
      },
    }

    await prisma.site.update({
      where: { id: siteId },
      data: { theme: updatedTheme },
    })

    revalidatePath(`/sites/${siteId}/settings`)
    return { success: true }
  } catch (error) {
    console.error('Failed to update SEO settings:', error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message || 'Validation failed' }
    }
    return { success: false, error: 'Failed to update SEO settings' }
  }
}

export async function updateAdvancedSettings(
  siteId: string,
  data: AdvancedSettingsInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const validated = advancedSettingsSchema.parse(data)

    const site = await prisma.site.findUnique({
      where: { id: siteId },
      select: { id: true, theme: true },
    })

    if (!site) {
      return { success: false, error: 'Site not found' }
    }

    const currentTheme = (site.theme as Record<string, unknown>) || {}
    const updatedTheme = {
      ...currentTheme,
      customHeadScripts: validated.customHeadScripts || null,
    }

    await prisma.site.update({
      where: { id: siteId },
      data: {
        contentSlug: validated.contentSlug,
        gtmId: validated.gtmId || null,
        cdnBaseUrl: validated.cdnBaseUrl || null,
        isActive: validated.isActive,
        theme: updatedTheme,
      },
    })

    revalidatePath(`/sites/${siteId}/settings`)
    return { success: true }
  } catch (error) {
    console.error('Failed to update advanced settings:', error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message || 'Validation failed' }
    }
    return { success: false, error: 'Failed to update advanced settings' }
  }
}
