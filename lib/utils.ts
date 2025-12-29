import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Re-export content URL utilities
export {
  getContentListUrl,
  getArticleUrl,
  getContentSectionTitle,
  getContentNavLabel,
  getContentSectionDescription,
  getArticleCategoryUrl,
  getArticleUrlWithCategory,
} from './utils/content-url'

// Re-export SEO utilities
export {
  buildCanonicalUrl,
  getSiteBaseUrl,
  buildOgImage,
  buildTwitterCard,
  getArticleSchemaType,
  getTwitterHandle,
  truncateForSeo,
} from './utils/seo'
