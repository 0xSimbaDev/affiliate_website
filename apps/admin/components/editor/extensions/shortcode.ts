import { Node, mergeAttributes, type ChainedCommands } from '@tiptap/core'

export type ShortcodeType = 'product' | 'products' | 'comparison'

export interface ShortcodeAttrs {
  type: ShortcodeType
  value: string // The full shortcode text, e.g., "product:slug,variant"
  label: string // Display label for the shortcode
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    shortcode: {
      insertShortcode: (attrs: ShortcodeAttrs) => ReturnType
    }
  }
}

/**
 * Tiptap extension for shortcode nodes.
 * Renders shortcodes as atomic, non-editable blocks within the editor.
 */
export const Shortcode = Node.create({
  name: 'shortcode',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      type: {
        default: 'product',
      },
      value: {
        default: '',
      },
      label: {
        default: '',
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-shortcode]',
        getAttrs: (node: string | HTMLElement) => {
          if (typeof node === 'string') return false
          const element = node as HTMLElement
          return {
            type: element.getAttribute('data-shortcode-type') || 'product',
            value: element.getAttribute('data-shortcode-value') || '',
            label: element.getAttribute('data-shortcode-label') || '',
          }
        },
      },
    ]
  },

  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, unknown> }) {
    const attrs = HTMLAttributes as unknown as ShortcodeAttrs
    const shortcodeText = `[${attrs.value}]`

    return [
      'div',
      mergeAttributes(
        {
          'data-shortcode': 'true',
          'data-shortcode-type': attrs.type,
          'data-shortcode-value': attrs.value,
          'data-shortcode-label': attrs.label,
          class: 'shortcode-node',
        },
        HTMLAttributes
      ),
      shortcodeText,
    ]
  },

  addCommands() {
    return {
      insertShortcode:
        (attrs: ShortcodeAttrs) =>
        ({ chain }: { chain: () => ChainedCommands }) => {
          return chain()
            .insertContent({
              type: this.name,
              attrs,
            })
            .run()
        },
    }
  },
})

/**
 * Parse a shortcode string into its components.
 * Examples:
 * - "product:slug" -> { type: 'product', slug: 'slug' }
 * - "product:slug,featured" -> { type: 'product', slug: 'slug', variant: 'featured' }
 * - "products:category-slug,3" -> { type: 'products', categorySlug: 'category-slug', limit: 3 }
 * - "comparison:slug1,slug2,slug3" -> { type: 'comparison', slugs: ['slug1', 'slug2', 'slug3'] }
 */
export function parseShortcodeValue(value: string): {
  type: ShortcodeType
  params: Record<string, string | number | string[]>
} | null {
  const colonIndex = value.indexOf(':')
  if (colonIndex === -1) return null

  const type = value.substring(0, colonIndex) as ShortcodeType
  const paramsStr = value.substring(colonIndex + 1)

  if (!['product', 'products', 'comparison'].includes(type)) {
    return null
  }

  const parts = paramsStr.split(',').map((s) => s.trim())

  switch (type) {
    case 'product':
      return {
        type,
        params: {
          slug: parts[0] || '',
          variant: parts[1] || 'default',
        },
      }
    case 'products':
      return {
        type,
        params: {
          categorySlug: parts[0] || '',
          limit: parts[1] ? parseInt(parts[1], 10) : 3,
        },
      }
    case 'comparison':
      return {
        type,
        params: {
          slugs: parts,
        },
      }
    default:
      return null
  }
}

/**
 * Build a shortcode value string from its components.
 */
export function buildShortcodeValue(
  type: ShortcodeType,
  params: Record<string, string | number | string[]>
): string {
  switch (type) {
    case 'product': {
      const slug = params.slug as string
      const variant = params.variant as string
      if (variant && variant !== 'default') {
        return `product:${slug},${variant}`
      }
      return `product:${slug}`
    }
    case 'products': {
      const categorySlug = params.categorySlug as string
      const limit = params.limit as number
      if (limit && limit !== 3) {
        return `products:${categorySlug},${limit}`
      }
      return `products:${categorySlug}`
    }
    case 'comparison': {
      const slugs = params.slugs as string[]
      return `comparison:${slugs.join(',')}`
    }
    default:
      return ''
  }
}

/**
 * Get a human-readable label for a shortcode.
 */
export function getShortcodeLabel(
  type: ShortcodeType,
  params: Record<string, string | number | string[]>
): string {
  switch (type) {
    case 'product': {
      const slug = params.slug as string
      const variant = params.variant as string
      if (variant && variant !== 'default') {
        return `Product: ${slug} (${variant})`
      }
      return `Product: ${slug}`
    }
    case 'products': {
      const categorySlug = params.categorySlug as string
      const limit = params.limit as number
      return `Products: ${categorySlug} (limit: ${limit})`
    }
    case 'comparison': {
      const slugs = params.slugs as string[]
      return `Comparison: ${slugs.length} products`
    }
    default:
      return 'Unknown shortcode'
  }
}

export default Shortcode
