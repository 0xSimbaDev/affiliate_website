import { notFound } from 'next/navigation'
import { prisma } from '@affiliate/database'
import { MediaLibraryClient } from './MediaLibraryClient'

async function getSiteWithMedia(siteId: string) {
  const site = await prisma.site.findUnique({
    where: { id: siteId },
    select: {
      id: true,
      name: true,
    },
  })

  return site
}

export default async function MediaPage({
  params,
}: {
  params: Promise<{ siteId: string }>
}) {
  const { siteId } = await params
  const site = await getSiteWithMedia(siteId)

  if (!site) {
    notFound()
  }

  return (
    <div className="max-w-7xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
        <p className="text-gray-500 mt-1">
          Manage images and files for {site.name}
        </p>
      </div>

      {/* Client-side media library */}
      <MediaLibraryClient siteId={siteId} />
    </div>
  )
}
