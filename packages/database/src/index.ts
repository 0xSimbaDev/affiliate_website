/**
 * @affiliate/database
 *
 * Prisma client and database utilities for the affiliate platform.
 */

export { prisma } from './client'

// Re-export Prisma namespace for types like Prisma.Decimal, Prisma.JsonNull, etc.
export { Prisma } from '@prisma/client'

// Re-export Prisma types that are commonly used
export type {
  Site,
  Niche,
  Product,
  Category,
  Article,
  ArticleCategory,
  ContentStatus,
  ArticleType,
} from '@prisma/client'
