/**
 * ArticleHero Component
 *
 * Featured article hero section for the article listing page.
 * Displays the most prominent featured article in a large format.
 */

import { ArticleCard } from '@affiliate/ui/articles'
import type { ArticleCardData, ContentSlugType } from '@affiliate/types'

interface ArticleHeroProps {
  article: ArticleCardData
  siteSlug: string
  contentSlug: ContentSlugType
  className?: string
}

export default function ArticleHero({
  article,
  siteSlug,
  contentSlug,
  className = '',
}: ArticleHeroProps) {
  return (
    <section className={`mb-8 lg:mb-12 ${className}`}>
      <ArticleCard
        article={article}
        siteSlug={siteSlug}
        contentSlug={contentSlug}
        variant="featured"
        showCategory
      />
    </section>
  )
}
