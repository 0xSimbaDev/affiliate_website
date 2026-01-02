'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Save, ExternalLink, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'

import {
  getSiteSettings,
  updateGeneralSettings,
  updateThemeSettings,
  updateSocialLinks,
  updateSeoSettings,
  updateAdvancedSettings,
  type GeneralSettingsInput,
  type ThemeSettingsInput,
  type SocialLinksInput,
  type SeoSettingsInput,
  type AdvancedSettingsInput,
} from './actions'

// Validation schemas
const generalFormSchema = z.object({
  name: z.string().min(1, 'Site name is required').max(100),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  domain: z.string().min(1, 'Domain is required'),
  tagline: z.string().max(200).optional().nullable(),
  description: z.string().max(1000).optional().nullable(),
  logoUrl: z.string().url('Must be a valid URL').optional().nullable().or(z.literal('')),
})

const themeFormSchema = z.object({
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color'),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color'),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color'),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color').optional(),
  textColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color').optional(),
  fontFamily: z.string().optional(),
  headingFontFamily: z.string().optional(),
})

const socialFormSchema = z.object({
  twitter: z.string().url('Must be a valid URL').optional().nullable().or(z.literal('')),
  facebook: z.string().url('Must be a valid URL').optional().nullable().or(z.literal('')),
  instagram: z.string().url('Must be a valid URL').optional().nullable().or(z.literal('')),
  youtube: z.string().url('Must be a valid URL').optional().nullable().or(z.literal('')),
  linkedin: z.string().url('Must be a valid URL').optional().nullable().or(z.literal('')),
  tiktok: z.string().url('Must be a valid URL').optional().nullable().or(z.literal('')),
  pinterest: z.string().url('Must be a valid URL').optional().nullable().or(z.literal('')),
})

const seoFormSchema = z.object({
  metaTitleTemplate: z.string().max(100).optional().nullable(),
  metaDescription: z.string().max(200).optional().nullable(),
  robotsIndex: z.boolean().default(true),
  robotsFollow: z.boolean().default(true),
})

const advancedFormSchema = z.object({
  contentSlug: z.string().min(1, 'Content slug is required').regex(/^[a-z0-9-]+$/, 'Content slug can only contain lowercase letters, numbers, and hyphens'),
  gtmId: z.string().optional().nullable(),
  customHeadScripts: z.string().optional().nullable(),
  cdnBaseUrl: z.string().url('Must be a valid URL').optional().nullable().or(z.literal('')),
  isActive: z.boolean().default(true),
})

type GeneralFormData = z.infer<typeof generalFormSchema>
type ThemeFormData = z.infer<typeof themeFormSchema>
type SocialFormData = z.infer<typeof socialFormSchema>
type SeoFormData = z.infer<typeof seoFormSchema>
type AdvancedFormData = z.infer<typeof advancedFormSchema>

interface SiteSettings {
  id: string
  nicheId: string
  nicheName: string
  name: string
  slug: string
  domain: string
  tagline: string
  description: string
  logoUrl: string
  theme: ThemeFormData
  social: SocialFormData
  seo: SeoFormData
  contentSlug: string
  gtmId: string
  cdnBaseUrl: string
  customHeadScripts: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Font options
const fontOptions = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Lato', label: 'Lato' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Source Sans Pro', label: 'Source Sans Pro' },
  { value: 'Playfair Display', label: 'Playfair Display' },
  { value: 'Merriweather', label: 'Merriweather' },
]

// Color input component
function ColorInput({
  id,
  value,
  onChange,
  error,
}: {
  id: string
  value: string
  onChange: (value: string) => void
  error?: string
}) {
  return (
    <div className="flex gap-2">
      <input
        type="color"
        id={`${id}-picker`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-11 h-11 rounded-md border border-gray-300 cursor-pointer p-1"
      />
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="#3B82F6"
        className="flex-1 font-mono"
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  )
}

export default function SiteSettingsPage({
  params,
}: {
  params: Promise<{ siteId: string }>
}) {
  const router = useRouter()
  const [siteId, setSiteId] = useState<string | null>(null)
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('general')
  const [isPending, startTransition] = useTransition()

  // Load siteId from params
  useEffect(() => {
    params.then(({ siteId }) => setSiteId(siteId))
  }, [params])

  // Load settings
  useEffect(() => {
    if (!siteId) return

    async function loadSettings() {
      setLoading(true)
      try {
        const data = await getSiteSettings(siteId!)
        if (data) {
          setSettings(data as SiteSettings)
        }
      } catch (error) {
        console.error('Failed to load settings:', error)
        toast.error('Failed to load site settings')
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [siteId])

  // General form
  const generalForm = useForm<GeneralFormData>({
    resolver: zodResolver(generalFormSchema),
    values: settings
      ? {
          name: settings.name,
          slug: settings.slug,
          domain: settings.domain,
          tagline: settings.tagline,
          description: settings.description,
          logoUrl: settings.logoUrl,
        }
      : undefined,
  })

  // Theme form
  const themeForm = useForm<ThemeFormData>({
    resolver: zodResolver(themeFormSchema),
    values: settings?.theme,
  })

  // Social form
  const socialForm = useForm<SocialFormData>({
    resolver: zodResolver(socialFormSchema),
    values: settings?.social,
  })

  // SEO form
  const seoForm = useForm<SeoFormData>({
    resolver: zodResolver(seoFormSchema),
    values: settings?.seo,
  })

  // Advanced form
  const advancedForm = useForm<AdvancedFormData>({
    resolver: zodResolver(advancedFormSchema),
    values: settings
      ? {
          contentSlug: settings.contentSlug,
          gtmId: settings.gtmId,
          customHeadScripts: settings.customHeadScripts,
          cdnBaseUrl: settings.cdnBaseUrl,
          isActive: settings.isActive,
        }
      : undefined,
  })

  // Submit handlers
  const handleGeneralSubmit = (data: GeneralFormData) => {
    if (!siteId) return
    startTransition(async () => {
      const result = await updateGeneralSettings(siteId, data as GeneralSettingsInput)
      if (result.success) {
        toast.success('General settings updated')
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to update settings')
      }
    })
  }

  const handleThemeSubmit = (data: ThemeFormData) => {
    if (!siteId) return
    startTransition(async () => {
      const result = await updateThemeSettings(siteId, data as ThemeSettingsInput)
      if (result.success) {
        toast.success('Theme settings updated')
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to update theme')
      }
    })
  }

  const handleSocialSubmit = (data: SocialFormData) => {
    if (!siteId) return
    startTransition(async () => {
      const result = await updateSocialLinks(siteId, data as SocialLinksInput)
      if (result.success) {
        toast.success('Social links updated')
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to update social links')
      }
    })
  }

  const handleSeoSubmit = (data: SeoFormData) => {
    if (!siteId) return
    startTransition(async () => {
      const result = await updateSeoSettings(siteId, data as SeoSettingsInput)
      if (result.success) {
        toast.success('SEO settings updated')
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to update SEO settings')
      }
    })
  }

  const handleAdvancedSubmit = (data: AdvancedFormData) => {
    if (!siteId) return
    startTransition(async () => {
      const result = await updateAdvancedSettings(siteId, data as AdvancedSettingsInput)
      if (result.success) {
        toast.success('Advanced settings updated')
        router.refresh()
      } else {
        toast.error(result.error || 'Failed to update advanced settings')
      }
    })
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto animate-fadeIn">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="max-w-4xl mx-auto animate-fadeIn">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-red-900">Site not found</h3>
            <p className="text-sm text-red-700 mt-1">
              The site you are looking for does not exist or you do not have access to it.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Site Settings</h1>
        <p className="text-gray-500 mt-1">
          Manage settings for {settings.name}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="theme">Theme</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general">
          <form onSubmit={generalForm.handleSubmit(handleGeneralSubmit)} className="space-y-6">
            <div className="bg-white rounded-lg border p-6 space-y-6">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-medium text-gray-900">General Information</h3>
                  <p className="text-sm text-gray-500">Basic site configuration</p>
                </div>
                <span className="text-xs text-gray-400 px-2 py-1 bg-gray-100 rounded">
                  Niche: {settings.nicheName}
                </span>
              </div>

              {/* Site Name */}
              <div className="space-y-2">
                <Label htmlFor="name" required>Site Name</Label>
                <Input
                  id="name"
                  {...generalForm.register('name')}
                  placeholder="My Awesome Site"
                />
                {generalForm.formState.errors.name && (
                  <p className="text-sm text-red-500">{generalForm.formState.errors.name.message}</p>
                )}
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <Label htmlFor="slug" required>Slug</Label>
                <Input
                  id="slug"
                  {...generalForm.register('slug')}
                  placeholder="my-awesome-site"
                />
                <p className="text-xs text-gray-500">Used in admin URLs and internal references</p>
                {generalForm.formState.errors.slug && (
                  <p className="text-sm text-red-500">{generalForm.formState.errors.slug.message}</p>
                )}
              </div>

              {/* Domain */}
              <div className="space-y-2">
                <Label htmlFor="domain" required>Domain</Label>
                <div className="flex gap-2">
                  <Input
                    id="domain"
                    {...generalForm.register('domain')}
                    placeholder="example.com"
                    className="flex-1"
                  />
                  {generalForm.watch('domain') && (
                    <a
                      href={`https://${generalForm.watch('domain')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 text-gray-500 hover:text-gray-700 border rounded-md"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
                {generalForm.formState.errors.domain && (
                  <p className="text-sm text-red-500">{generalForm.formState.errors.domain.message}</p>
                )}
              </div>

              {/* Tagline */}
              <div className="space-y-2">
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  {...generalForm.register('tagline')}
                  placeholder="Your site tagline"
                />
                {generalForm.formState.errors.tagline && (
                  <p className="text-sm text-red-500">{generalForm.formState.errors.tagline.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...generalForm.register('description')}
                  placeholder="A brief description of your site"
                  rows={4}
                />
                {generalForm.formState.errors.description && (
                  <p className="text-sm text-red-500">{generalForm.formState.errors.description.message}</p>
                )}
              </div>

              {/* Logo URL */}
              <div className="space-y-2">
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input
                  id="logoUrl"
                  {...generalForm.register('logoUrl')}
                  placeholder="https://example.com/logo.png"
                />
                <p className="text-xs text-gray-500">URL to your site logo image</p>
                {generalForm.formState.errors.logoUrl && (
                  <p className="text-sm text-red-500">{generalForm.formState.errors.logoUrl.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-md disabled:opacity-50"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </form>
        </TabsContent>

        {/* Theme Tab */}
        <TabsContent value="theme">
          <form onSubmit={themeForm.handleSubmit(handleThemeSubmit)} className="space-y-6">
            <div className="bg-white rounded-lg border p-6 space-y-6">
              <div>
                <h3 className="font-medium text-gray-900">Color Scheme</h3>
                <p className="text-sm text-gray-500">Customize your site colors</p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Primary Color */}
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <ColorInput
                    id="primaryColor"
                    value={themeForm.watch('primaryColor') || '#3B82F6'}
                    onChange={(value) => themeForm.setValue('primaryColor', value)}
                    error={themeForm.formState.errors.primaryColor?.message}
                  />
                </div>

                {/* Secondary Color */}
                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <ColorInput
                    id="secondaryColor"
                    value={themeForm.watch('secondaryColor') || '#6366F1'}
                    onChange={(value) => themeForm.setValue('secondaryColor', value)}
                    error={themeForm.formState.errors.secondaryColor?.message}
                  />
                </div>

                {/* Accent Color */}
                <div className="space-y-2">
                  <Label htmlFor="accentColor">Accent Color</Label>
                  <ColorInput
                    id="accentColor"
                    value={themeForm.watch('accentColor') || '#F59E0B'}
                    onChange={(value) => themeForm.setValue('accentColor', value)}
                    error={themeForm.formState.errors.accentColor?.message}
                  />
                </div>

                {/* Background Color */}
                <div className="space-y-2">
                  <Label htmlFor="backgroundColor">Background Color</Label>
                  <ColorInput
                    id="backgroundColor"
                    value={themeForm.watch('backgroundColor') || '#FFFFFF'}
                    onChange={(value) => themeForm.setValue('backgroundColor', value)}
                    error={themeForm.formState.errors.backgroundColor?.message}
                  />
                </div>

                {/* Text Color */}
                <div className="space-y-2">
                  <Label htmlFor="textColor">Text Color</Label>
                  <ColorInput
                    id="textColor"
                    value={themeForm.watch('textColor') || '#1F2937'}
                    onChange={(value) => themeForm.setValue('textColor', value)}
                    error={themeForm.formState.errors.textColor?.message}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border p-6 space-y-6">
              <div>
                <h3 className="font-medium text-gray-900">Typography</h3>
                <p className="text-sm text-gray-500">Font settings for your site</p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Body Font */}
                <div className="space-y-2">
                  <Label htmlFor="fontFamily">Body Font</Label>
                  <Select
                    value={themeForm.watch('fontFamily') || 'Inter'}
                    onValueChange={(value) => themeForm.setValue('fontFamily', value)}
                  >
                    <SelectTrigger id="fontFamily">
                      <SelectValue placeholder="Select font" />
                    </SelectTrigger>
                    <SelectContent>
                      {fontOptions.map((font) => (
                        <SelectItem key={font.value} value={font.value}>
                          {font.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Heading Font */}
                <div className="space-y-2">
                  <Label htmlFor="headingFontFamily">Heading Font</Label>
                  <Select
                    value={themeForm.watch('headingFontFamily') || 'Inter'}
                    onValueChange={(value) => themeForm.setValue('headingFontFamily', value)}
                  >
                    <SelectTrigger id="headingFontFamily">
                      <SelectValue placeholder="Select font" />
                    </SelectTrigger>
                    <SelectContent>
                      {fontOptions.map((font) => (
                        <SelectItem key={font.value} value={font.value}>
                          {font.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Theme Preview */}
            <div className="bg-white rounded-lg border p-6 space-y-4">
              <h3 className="font-medium text-gray-900">Preview</h3>
              <div
                className="p-6 rounded-lg border"
                style={{
                  backgroundColor: themeForm.watch('backgroundColor') || '#FFFFFF',
                  color: themeForm.watch('textColor') || '#1F2937',
                  fontFamily: themeForm.watch('fontFamily') || 'Inter',
                }}
              >
                <h4
                  className="text-xl font-bold mb-2"
                  style={{
                    fontFamily: themeForm.watch('headingFontFamily') || 'Inter',
                    color: themeForm.watch('primaryColor') || '#3B82F6',
                  }}
                >
                  Sample Heading
                </h4>
                <p className="mb-4">This is sample body text to preview your typography settings.</p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    className="px-4 py-2 rounded-md text-white text-sm font-medium"
                    style={{ backgroundColor: themeForm.watch('primaryColor') || '#3B82F6' }}
                  >
                    Primary Button
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 rounded-md text-white text-sm font-medium"
                    style={{ backgroundColor: themeForm.watch('secondaryColor') || '#6366F1' }}
                  >
                    Secondary
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 rounded-md text-white text-sm font-medium"
                    style={{ backgroundColor: themeForm.watch('accentColor') || '#F59E0B' }}
                  >
                    Accent
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-md disabled:opacity-50"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </form>
        </TabsContent>

        {/* SEO Tab */}
        <TabsContent value="seo">
          <form onSubmit={seoForm.handleSubmit(handleSeoSubmit)} className="space-y-6">
            <div className="bg-white rounded-lg border p-6 space-y-6">
              <div>
                <h3 className="font-medium text-gray-900">Default SEO Settings</h3>
                <p className="text-sm text-gray-500">Configure default meta tags for your site</p>
              </div>

              {/* Meta Title Template */}
              <div className="space-y-2">
                <Label htmlFor="metaTitleTemplate">Meta Title Template</Label>
                <Input
                  id="metaTitleTemplate"
                  {...seoForm.register('metaTitleTemplate')}
                  placeholder="%s | Site Name"
                />
                <p className="text-xs text-gray-500">
                  Use %s as placeholder for page title. Example: "%s | {settings.name}"
                </p>
                {seoForm.formState.errors.metaTitleTemplate && (
                  <p className="text-sm text-red-500">{seoForm.formState.errors.metaTitleTemplate.message}</p>
                )}
              </div>

              {/* Meta Description */}
              <div className="space-y-2">
                <Label htmlFor="metaDescription">Default Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  {...seoForm.register('metaDescription')}
                  placeholder="Default description for pages without a specific meta description"
                  rows={3}
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Used when pages don't have their own description</span>
                  <span>{(seoForm.watch('metaDescription') || '').length}/200</span>
                </div>
                {seoForm.formState.errors.metaDescription && (
                  <p className="text-sm text-red-500">{seoForm.formState.errors.metaDescription.message}</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg border p-6 space-y-6">
              <div>
                <h3 className="font-medium text-gray-900">Robots Settings</h3>
                <p className="text-sm text-gray-500">Control how search engines interact with your site</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="robotsIndex">Allow Search Indexing</Label>
                    <p className="text-xs text-gray-500">
                      Allow search engines to index your site pages
                    </p>
                  </div>
                  <Switch
                    id="robotsIndex"
                    checked={seoForm.watch('robotsIndex')}
                    onCheckedChange={(checked) => seoForm.setValue('robotsIndex', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="robotsFollow">Allow Link Following</Label>
                    <p className="text-xs text-gray-500">
                      Allow search engines to follow links on your site
                    </p>
                  </div>
                  <Switch
                    id="robotsFollow"
                    checked={seoForm.watch('robotsFollow')}
                    onCheckedChange={(checked) => seoForm.setValue('robotsFollow', checked)}
                  />
                </div>
              </div>

              {/* Robots Preview */}
              <div className="pt-4 border-t">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Robots Meta Tag Preview</h4>
                <code className="block p-3 bg-gray-50 rounded-lg text-sm font-mono text-gray-600">
                  {`<meta name="robots" content="${seoForm.watch('robotsIndex') ? 'index' : 'noindex'}, ${seoForm.watch('robotsFollow') ? 'follow' : 'nofollow'}" />`}
                </code>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-md disabled:opacity-50"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </form>
        </TabsContent>

        {/* Social Tab */}
        <TabsContent value="social">
          <form onSubmit={socialForm.handleSubmit(handleSocialSubmit)} className="space-y-6">
            <div className="bg-white rounded-lg border p-6 space-y-6">
              <div>
                <h3 className="font-medium text-gray-900">Social Media Links</h3>
                <p className="text-sm text-gray-500">Connect your social media profiles</p>
              </div>

              <div className="grid gap-6">
                {/* Twitter */}
                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter / X</Label>
                  <Input
                    id="twitter"
                    {...socialForm.register('twitter')}
                    placeholder="https://twitter.com/yourhandle"
                  />
                  {socialForm.formState.errors.twitter && (
                    <p className="text-sm text-red-500">{socialForm.formState.errors.twitter.message}</p>
                  )}
                </div>

                {/* Facebook */}
                <div className="space-y-2">
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    {...socialForm.register('facebook')}
                    placeholder="https://facebook.com/yourpage"
                  />
                  {socialForm.formState.errors.facebook && (
                    <p className="text-sm text-red-500">{socialForm.formState.errors.facebook.message}</p>
                  )}
                </div>

                {/* Instagram */}
                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    {...socialForm.register('instagram')}
                    placeholder="https://instagram.com/yourhandle"
                  />
                  {socialForm.formState.errors.instagram && (
                    <p className="text-sm text-red-500">{socialForm.formState.errors.instagram.message}</p>
                  )}
                </div>

                {/* YouTube */}
                <div className="space-y-2">
                  <Label htmlFor="youtube">YouTube</Label>
                  <Input
                    id="youtube"
                    {...socialForm.register('youtube')}
                    placeholder="https://youtube.com/@yourchannel"
                  />
                  {socialForm.formState.errors.youtube && (
                    <p className="text-sm text-red-500">{socialForm.formState.errors.youtube.message}</p>
                  )}
                </div>

                {/* LinkedIn */}
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    {...socialForm.register('linkedin')}
                    placeholder="https://linkedin.com/company/yourcompany"
                  />
                  {socialForm.formState.errors.linkedin && (
                    <p className="text-sm text-red-500">{socialForm.formState.errors.linkedin.message}</p>
                  )}
                </div>

                {/* TikTok */}
                <div className="space-y-2">
                  <Label htmlFor="tiktok">TikTok</Label>
                  <Input
                    id="tiktok"
                    {...socialForm.register('tiktok')}
                    placeholder="https://tiktok.com/@yourhandle"
                  />
                  {socialForm.formState.errors.tiktok && (
                    <p className="text-sm text-red-500">{socialForm.formState.errors.tiktok.message}</p>
                  )}
                </div>

                {/* Pinterest */}
                <div className="space-y-2">
                  <Label htmlFor="pinterest">Pinterest</Label>
                  <Input
                    id="pinterest"
                    {...socialForm.register('pinterest')}
                    placeholder="https://pinterest.com/yourprofile"
                  />
                  {socialForm.formState.errors.pinterest && (
                    <p className="text-sm text-red-500">{socialForm.formState.errors.pinterest.message}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-md disabled:opacity-50"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </form>
        </TabsContent>

        {/* Advanced Tab */}
        <TabsContent value="advanced">
          <form onSubmit={advancedForm.handleSubmit(handleAdvancedSubmit)} className="space-y-6">
            <div className="bg-white rounded-lg border p-6 space-y-6">
              <div>
                <h3 className="font-medium text-gray-900">Content Settings</h3>
                <p className="text-sm text-gray-500">Configure content URL structure</p>
              </div>

              {/* Content Slug */}
              <div className="space-y-2">
                <Label htmlFor="contentSlug" required>Content Section Slug</Label>
                <Input
                  id="contentSlug"
                  {...advancedForm.register('contentSlug')}
                  placeholder="reviews"
                />
                <p className="text-xs text-gray-500">
                  URL path for content section (e.g., "reviews", "articles", "blog"). Your content will be available at /{advancedForm.watch('contentSlug') || 'reviews'}/
                </p>
                {advancedForm.formState.errors.contentSlug && (
                  <p className="text-sm text-red-500">{advancedForm.formState.errors.contentSlug.message}</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg border p-6 space-y-6">
              <div>
                <h3 className="font-medium text-gray-900">Analytics & Tracking</h3>
                <p className="text-sm text-gray-500">Configure analytics and tracking scripts</p>
              </div>

              {/* GTM ID */}
              <div className="space-y-2">
                <Label htmlFor="gtmId">Google Tag Manager ID</Label>
                <Input
                  id="gtmId"
                  {...advancedForm.register('gtmId')}
                  placeholder="GTM-XXXXXXX"
                />
                <p className="text-xs text-gray-500">
                  Your GTM container ID for analytics tracking
                </p>
                {advancedForm.formState.errors.gtmId && (
                  <p className="text-sm text-red-500">{advancedForm.formState.errors.gtmId.message}</p>
                )}
              </div>

              {/* Custom Head Scripts */}
              <div className="space-y-2">
                <Label htmlFor="customHeadScripts">Custom Head Scripts</Label>
                <Textarea
                  id="customHeadScripts"
                  {...advancedForm.register('customHeadScripts')}
                  placeholder="<!-- Custom scripts go here -->"
                  rows={6}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-gray-500">
                  Custom HTML/JavaScript to be added to the &lt;head&gt; section. Use with caution.
                </p>
                {advancedForm.formState.errors.customHeadScripts && (
                  <p className="text-sm text-red-500">{advancedForm.formState.errors.customHeadScripts.message}</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg border p-6 space-y-6">
              <div>
                <h3 className="font-medium text-gray-900">CDN & Assets</h3>
                <p className="text-sm text-gray-500">Configure content delivery settings</p>
              </div>

              {/* CDN Base URL */}
              <div className="space-y-2">
                <Label htmlFor="cdnBaseUrl">CDN Base URL</Label>
                <Input
                  id="cdnBaseUrl"
                  {...advancedForm.register('cdnBaseUrl')}
                  placeholder="https://cdn.example.com"
                />
                <p className="text-xs text-gray-500">
                  Base URL for serving static assets via CDN
                </p>
                {advancedForm.formState.errors.cdnBaseUrl && (
                  <p className="text-sm text-red-500">{advancedForm.formState.errors.cdnBaseUrl.message}</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg border p-6 space-y-6">
              <div>
                <h3 className="font-medium text-gray-900">Site Status</h3>
                <p className="text-sm text-gray-500">Control site visibility</p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="isActive">Site Active</Label>
                  <p className="text-xs text-gray-500">
                    When disabled, the site will not be publicly accessible
                  </p>
                </div>
                <Switch
                  id="isActive"
                  checked={advancedForm.watch('isActive')}
                  onCheckedChange={(checked) => advancedForm.setValue('isActive', checked)}
                />
              </div>

              {!advancedForm.watch('isActive') && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>This site is currently inactive and not publicly accessible.</span>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-md disabled:opacity-50"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  )
}
