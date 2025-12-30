'use client'

/**
 * Product Page Context
 *
 * Provides shared data to all product page sections.
 * Server components pass data to this provider, and client sections can access it.
 */

import { createContext, useContext, type ReactNode } from 'react'
import type { ProductPageContextData } from './types'

/**
 * Context for product page data.
 * undefined when not within a ProductPageProvider.
 */
const ProductPageContext = createContext<ProductPageContextData | undefined>(undefined)

/**
 * Props for ProductPageProvider.
 */
interface ProductPageProviderProps {
  /** Context data to provide */
  value: ProductPageContextData
  /** Child components */
  children: ReactNode
}

/**
 * Provider component for product page context.
 * Wrap product page sections with this to give them access to shared data.
 *
 * @example
 * <ProductPageProvider value={contextData}>
 *   <HeroSection />
 *   <ProsConsSection />
 * </ProductPageProvider>
 */
export function ProductPageProvider({ value, children }: ProductPageProviderProps) {
  return (
    <ProductPageContext.Provider value={value}>
      {children}
    </ProductPageContext.Provider>
  )
}

/**
 * Hook to access product page context.
 *
 * @returns Product page context data
 * @throws Error if used outside of ProductPageProvider
 *
 * @example
 * function HeroSection() {
 *   const { product, site, price } = useProductPage()
 *   return <h1>{product.title}</h1>
 * }
 */
export function useProductPage(): ProductPageContextData {
  const context = useContext(ProductPageContext)
  if (context === undefined) {
    throw new Error('useProductPage must be used within a ProductPageProvider')
  }
  return context
}

/**
 * Hook to optionally access product page context.
 * Returns undefined if not within a provider (useful for testing).
 *
 * @returns Product page context data, or undefined
 */
export function useProductPageOptional(): ProductPageContextData | undefined {
  return useContext(ProductPageContext)
}
