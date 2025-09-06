"use client"

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { ProductGrid } from '@/components/products/product-grid'
import { ProductFilters } from '@/components/products/product-filters'
import { ProductSort } from '@/components/products/product-sort'
import { Pagination } from '@/components/ui/pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Filter } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import type { ProductWithDetails } from '@/lib/services/product-service'

interface ProductsPageData {
  products: ProductWithDetails[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

function ProductsContent() {
  const searchParams = useSearchParams()
  const [data, setData] = useState<ProductsPageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const currentPage = parseInt(searchParams.get('page') || '1')
  const category = searchParams.get('category')
  const search = searchParams.get('search')
  const sortBy = searchParams.get('sortBy') || 'createdAt'
  const sortOrder = searchParams.get('sortOrder') || 'desc'

  useEffect(() => {
    fetchProducts()
  }, [searchParams])

  const fetchProducts = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams()
      if (category) params.append('category', category)
      if (search) params.append('search', search)
      params.append('sortBy', sortBy)
      params.append('sortOrder', sortOrder)
      params.append('page', currentPage.toString())
      params.append('limit', '12')

      const response = await fetch(`/api/products?${params.toString()}`)
      if (!response.ok) throw new Error('Failed to fetch products')
      
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const getBreadcrumbs = () => {
    const breadcrumbs = [{ label: 'Home', href: '/' }]
    
    if (category) {
      // In a real app, you'd fetch the category name
      const categoryName = category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
      breadcrumbs.push({ label: categoryName, href: `/products?category=${category}` })
    } else {
      breadcrumbs.push({ label: 'All Products', href: '/products' })
    }
    
    return breadcrumbs
  }

  const getPageTitle = () => {
    if (search) return `Search results for "${search}"`
    if (category) {
      const categoryName = category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
      return categoryName
    }
    return 'All Products'
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-8">
          {getBreadcrumbs().map((crumb, index) => (
            <div key={crumb.href} className="flex items-center space-x-2">
              {index > 0 && <span>/</span>}
              <a 
                href={crumb.href}
                className="hover:text-foreground transition-colors"
              >
                {crumb.label}
              </a>
            </div>
          ))}
        </nav>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block w-80 space-y-6">
            <ProductFilters />
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  {getPageTitle()}
                </h1>
                {!loading && data && (
                  <p className="text-muted-foreground mt-1">
                    {data.pagination.total} product{data.pagination.total !== 1 ? 's' : ''} found
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-4">
                {/* Mobile Filter Toggle */}
                <div className="lg:hidden">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-80">
                      <div className="py-4">
                        <ProductFilters />
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>

                {/* Sort */}
                <ProductSort />
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="aspect-[4/5] w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">{error}</p>
                <Button 
                  onClick={fetchProducts} 
                  variant="outline" 
                  className="mt-4"
                >
                  Try Again
                </Button>
              </div>
            )}

            {/* Products Grid */}
            {!loading && !error && data && (
              <>
                {data.products.length > 0 ? (
                  <>
                    <ProductGrid products={data.products} />
                    
                    {/* Pagination */}
                    {data.pagination.totalPages > 1 && (
                      <div className="mt-12 flex justify-center">
                        <Pagination
                          currentPage={data.pagination.page}
                          totalPages={data.pagination.totalPages}
                          onPageChange={(page) => {
                            const params = new URLSearchParams(searchParams.toString())
                            params.set('page', page.toString())
                            window.history.pushState(null, '', `?${params.toString()}`)
                            fetchProducts()
                          }}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                      <span className="text-2xl">👔</span>
                    </div>
                    <h3 className="text-lg font-medium mb-2">No products found</h3>
                    <p className="text-muted-foreground mb-4">
                      Try adjusting your filters or search terms
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => window.location.href = '/products'}
                    >
                      View All Products
                    </Button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </MainLayout>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div>Loading...</div></div>}>
      <ProductsContent />
    </Suspense>
  )
}
