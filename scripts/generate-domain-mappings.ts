/**
 * Domain Mappings Generator
 *
 * Queries the database for active sites and generates a JSON file
 * mapping domains to site slugs. This file is used by the proxy middleware
 * for fast domain lookups at runtime.
 *
 * Run: npx tsx scripts/generate-domain-mappings.ts
 * Or:  npm run generate:domains
 */

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import { config } from 'dotenv'
import * as fs from 'fs'
import * as path from 'path'

// Load environment variables
config()

interface Site {
  slug: string
  domain: string
}

async function generateDomainMappings() {
  console.log('Generating domain mappings...')

  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  try {
    // Fetch all active sites
    const sites = await prisma.site.findMany({
      where: { isActive: true },
      select: {
        slug: true,
        domain: true,
      },
    })

    // Create domain -> slug mapping
    const domainMap: Record<string, string> = {
      // Development defaults
      localhost: sites[0]?.slug || 'demo-gaming',
    }

    for (const site of sites as Site[]) {
      // Add main domain
      domainMap[site.domain] = site.slug

      // Add subdomain version for local development
      // e.g., demo-gaming.localhost -> demo-gaming
      domainMap[`${site.slug}.localhost`] = site.slug
    }

    // Output path - write to apps/web/lib/config for the web app
    const outputPath = path.join(process.cwd(), 'apps', 'web', 'lib', 'config', 'domain-mappings.json')

    // Ensure directory exists
    fs.mkdirSync(path.dirname(outputPath), { recursive: true })

    // Write the mapping file
    fs.writeFileSync(outputPath, JSON.stringify(domainMap, null, 2))

    console.log(`Generated domain mappings at: ${outputPath}`)
    console.log(`Mapped ${Object.keys(domainMap).length} domains:`)
    Object.entries(domainMap).forEach(([domain, slug]) => {
      console.log(`  ${domain} -> ${slug}`)
    })
  } catch (error) {
    console.error('Error generating domain mappings:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
    await pool.end()
  }
}

generateDomainMappings()
