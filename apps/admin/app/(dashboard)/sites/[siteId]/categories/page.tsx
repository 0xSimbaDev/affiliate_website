import { notFound } from 'next/navigation'
import { prisma } from '@affiliate/database'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Search, Pencil, Trash2, ChevronRight, FolderTree } from 'lucide-react'
import { DeleteCategoryButton } from './DeleteCategoryButton'
import { deleteCategory } from './actions'

interface CategoryWithChildren {
  id: string
  name: string
  slug: string
  categoryType: string
  description: string | null
  featuredImage: string | null
  isActive: boolean
  sortOrder: number
  parentId: string | null
  _count: {
    products: number
    children: number
  }
  children?: CategoryWithChildren[]
}

async function getCategories(siteId: string) {
  const site = await prisma.site.findUnique({
    where: { id: siteId },
    select: { id: true, name: true },
  })

  if (!site) return null

  const categories = await prisma.category.findMany({
    where: { siteId },
    include: {
      _count: {
        select: {
          products: true,
          children: true,
        },
      },
    },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  })

  // Build hierarchical structure
  const categoryMap = new Map<string, CategoryWithChildren>()
  const rootCategories: CategoryWithChildren[] = []

  // First pass: create map of all categories
  for (const category of categories) {
    categoryMap.set(category.id, { ...category, children: [] })
  }

  // Second pass: build tree structure
  for (const category of categories) {
    const cat = categoryMap.get(category.id)!
    if (category.parentId) {
      const parent = categoryMap.get(category.parentId)
      if (parent) {
        parent.children!.push(cat)
      } else {
        // Parent doesn't exist, treat as root
        rootCategories.push(cat)
      }
    } else {
      rootCategories.push(cat)
    }
  }

  return { site, categories: rootCategories, totalCount: categories.length }
}

function CategoryRow({
  category,
  siteId,
  level = 0,
}: {
  category: CategoryWithChildren
  siteId: string
  level?: number
}) {
  return (
    <>
      <tr className="hover:bg-gray-50">
        <td className="px-6 py-4">
          <div className="flex items-center gap-3" style={{ paddingLeft: `${level * 24}px` }}>
            {level > 0 && (
              <ChevronRight className="w-4 h-4 text-gray-300" />
            )}
            {category.featuredImage ? (
              <Image
                src={category.featuredImage}
                alt={category.name}
                width={40}
                height={40}
                className="w-10 h-10 object-cover rounded"
              />
            ) : (
              <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                <FolderTree className="w-5 h-5" />
              </div>
            )}
            <div>
              <p className="font-medium text-gray-900">{category.name}</p>
              <p className="text-sm text-gray-500">/{category.slug}</p>
            </div>
          </div>
        </td>
        <td className="px-6 py-4">
          <span className="text-sm text-gray-500">{category.categoryType}</span>
        </td>
        <td className="px-6 py-4">
          <span className="text-sm text-gray-500">{category._count.products}</span>
        </td>
        <td className="px-6 py-4">
          <span
            className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
              category.isActive
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {category.isActive ? 'Active' : 'Inactive'}
          </span>
        </td>
        <td className="px-6 py-4">
          <span className="text-sm text-gray-500">{category.sortOrder}</span>
        </td>
        <td className="px-6 py-4 text-right">
          <div className="flex items-center justify-end gap-1">
            <Link
              href={`/sites/${siteId}/categories/${category.id}`}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
              title="Edit"
            >
              <Pencil className="w-4 h-4" />
            </Link>
            <DeleteCategoryButton
              categoryId={category.id}
              categoryName={category.name}
              siteId={siteId}
              hasChildren={category._count.children > 0}
              hasProducts={category._count.products > 0}
            />
          </div>
        </td>
      </tr>
      {category.children?.map((child) => (
        <CategoryRow
          key={child.id}
          category={child}
          siteId={siteId}
          level={level + 1}
        />
      ))}
    </>
  )
}

export default async function CategoriesPage({
  params,
}: {
  params: Promise<{ siteId: string }>
}) {
  const { siteId } = await params
  const data = await getCategories(siteId)

  if (!data) {
    notFound()
  }

  const { site, categories, totalCount } = data

  return (
    <div className="max-w-6xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-500 mt-1">
            Manage categories for {site.name}
          </p>
        </div>
        <Link
          href={`/sites/${siteId}/categories/new`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white font-medium rounded-md hover:bg-primary-hover transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Category
        </Link>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-lg border mb-4">
        <div className="p-4 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories..."
              className="w-full h-10 pl-10 pr-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
          <select className="h-10 px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        {totalCount === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <FolderTree className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No categories yet
            </h3>
            <p className="text-gray-500 mb-6">
              Create your first category to organize your products.
            </p>
            <Link
              href={`/sites/${siteId}/categories/new`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white font-medium rounded-md hover:bg-primary-hover transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Category
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Products
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {categories.map((category) => (
                <CategoryRow
                  key={category.id}
                  category={category}
                  siteId={siteId}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalCount > 0 && (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <p>Showing {totalCount} categories</p>
        </div>
      )}
    </div>
  )
}
