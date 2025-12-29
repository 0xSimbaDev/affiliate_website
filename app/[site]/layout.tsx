import { notFound } from 'next/navigation'
import { getSiteBySlug, getAllSites } from '@/lib/api/sites'
import Header from './_components/Header'
import Footer from './_components/Footer'

interface SiteLayoutProps {
  children: React.ReactNode
  params: Promise<{ site: string }>
}

export default async function SiteLayout({ children, params }: SiteLayoutProps) {
  const { site: siteSlug } = await params
  const site = await getSiteBySlug(siteSlug)

  if (!site) {
    notFound()
  }

  // Extract theme from site configuration
  const theme = site.theme as {
    primaryColor?: string
    secondaryColor?: string
    accentColor?: string
    backgroundColor?: string
    textColor?: string
  } | null

  // Build CSS custom properties for dynamic theming
  const themeStyles: React.CSSProperties = {
    '--site-primary': theme?.primaryColor || '#0066cc',
    '--site-secondary': theme?.secondaryColor || '#4a5568',
    '--site-accent': theme?.accentColor || '#38a169',
    '--site-background': theme?.backgroundColor || '#ffffff',
    '--site-text': theme?.textColor || '#1a202c',
  } as React.CSSProperties

  return (
    <div className="min-h-screen flex flex-col" style={themeStyles}>
      <Header site={site} />
      <main className="flex-1">
        {children}
      </main>
      <Footer site={site} />
    </div>
  )
}

/**
 * Generate static params for all active sites.
 * This pre-renders all site routes at build time.
 */
export async function generateStaticParams() {
  const sites = await getAllSites()

  return sites.map((site) => ({
    site: site.slug,
  }))
}
