"use client";

import React from 'react';
import { ProductWithDetails } from '@/lib/services/product-service';
import { MainLayout } from '@/components/layout/main-layout';
import ProductFilters from '@/components/products/product-filters';
import { ProductSort } from '@/components/products/product-sort';
import SearchBar from './SearchBar';
import FilterModal from './FilterModal';
import { AdvancedSearch } from '@/components/search/advanced-search';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useComparison } from '@/hooks/use-comparison';
import { useWishlist } from '@/hooks/use-wishlist';
import { Heart, GitCompare, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductPageClientProps {
  products: ProductWithDetails[];
  total: number;
  page: number;
  limit: number;
}

const ProductPageClient = ({ products, total, page, limit }: ProductPageClientProps) => {
  const { addToComparison, removeFromComparison, isInComparison, comparisonCount, canAddMore } = useComparison();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const totalPages = Math.ceil(total / limit);
  const hasProducts = products && products.length > 0;
  const showingFrom = hasProducts ? (page - 1) * limit + 1 : 0;
  const showingTo = hasProducts ? Math.min(page * limit, total) : 0;

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block w-80">
            <ProductFilters />
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Women's Suits & Uniforms
              </h1>
              <p className="text-gray-600">
                Explore our curated collection of women's formal wear, designed for elegance and professionalism.
              </p>
            </div>

            {/* Search and Mobile Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <SearchBar />
              </div>
              <div className="flex items-center gap-2">
                <AdvancedSearch />
                <div className="lg:hidden">
                  <FilterModal />
                </div>
                <div className="hidden sm:block">
                  <ProductSort />
                </div>
              </div>
            </div>

            {/* Results Summary and Comparison Status */}
            <div className="flex justify-between items-center mb-6 text-sm text-gray-600">
              {hasProducts ? (
                <span>
                  Showing {showingFrom}-{showingTo} of {total} products
                </span>
              ) : (
                <span></span>
              )}
              <div className="flex items-center gap-4">
                {comparisonCount > 0 && (
                  <div className="flex items-center gap-2 text-blue-600 text-sm">
                    <GitCompare className="h-4 w-4" />
                    <span>{comparisonCount} items to compare</span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-7 px-2 text-xs"
                      onClick={() => {
                        // Navigate to comparison page
                        window.open('/compare', '_blank')
                      }}
                    >
                      Compare Now
                    </Button>
                  </div>
                )}
                <div className="sm:hidden">
                  <ProductSort />
                </div>
              </div>
            </div>

            {/* Product Grid */}
            {hasProducts ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {products.map((product) => {
                  const isOutOfStock = product.stock <= 0;
                  const isCustomizable = false; // Not available in current schema
                  const isReadyMade = false; // Not available in current schema
                  const primaryImage = product.image;
                  
                  return (
                    <div key={product.id} className="group relative bg-white border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="aspect-[4/5] w-full overflow-hidden bg-gray-100">
                        {primaryImage ? (
                          <Image
                            alt={product.name}
                            className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                            src={primaryImage}
                            width={400}
                            height={500}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-gray-400">
                            No Image
                          </div>
                        )}
                        
                        {/* Badges */}
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          {isOutOfStock && (
                            <Badge variant="destructive">Out of Stock</Badge>
                          )}
                          {isCustomizable && (
                            <Badge variant="secondary">Customizable</Badge>
                          )}
                          {isReadyMade && (
                            <Badge variant="outline">Ready-made</Badge>
                          )}
                        </div>
                        
                        {/* Action Buttons Overlay */}
                        <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {/* Wishlist Button */}
                          <Button
                            size="sm"
                            variant="secondary"
                            className={cn(
                              "h-8 w-8 p-0 bg-white/90 backdrop-blur hover:bg-white",
                              isInWishlist(product.id) && "text-red-500 hover:text-red-600"
                            )}
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              toggleWishlist({
                                id: product.id,
                                name: product.name,
                                price: product.price,
                                image: product.image || '',
                                slug: product.id // Using ID as slug since schema doesn't have slug
                              })
                            }}
                          >
                            <Heart className={cn(
                              "h-4 w-4",
                              isInWishlist(product.id) && "fill-current"
                            )} />
                          </Button>
                          
                          {/* Compare Button */}
                          <Button
                            size="sm"
                            variant="secondary"
                            className={cn(
                              "h-8 w-8 p-0 bg-white/90 backdrop-blur hover:bg-white",
                              isInComparison(product.id) && "text-blue-500 hover:text-blue-600"
                            )}
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              if (isInComparison(product.id)) {
                                removeFromComparison(product.id)
                              } else if (canAddMore) {
                                addToComparison({
                                  id: product.id,
                                  name: product.name,
                                  price: product.price,
                                  image: product.image || '',
                                  slug: product.id, // Using ID as slug
                                  categories: product.categories?.map(c => c.name) || [],
                                  tags: [] // Not available in current schema
                                })
                              }
                            }}
                            disabled={!isInComparison(product.id) && !canAddMore}
                          >
                            <GitCompare className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        {/* Quick View Button */}
                        <div className="absolute inset-x-0 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity px-4">
                          <Button 
                            className="w-full bg-white/90 backdrop-blur text-gray-900 hover:bg-white" 
                            variant="secondary"
                            size="sm"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Quick View
                          </Button>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <div className="mb-2">
                          <h3 className="text-lg font-medium text-gray-900 mb-1">
                            <Link 
                              href={`/products/${product.id}`} 
                              className="hover:text-primary transition-colors"
                            >
                              {product.name}
                            </Link>
                          </h3>
                          {product.description && (
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {product.description}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-semibold text-gray-900">
                              {formatPrice(product.price)}
                            </span>
                          </div>
                          
                          <span className="text-xs text-gray-500">
                            {product.stock} left
                          </span>
                        </div>
                        
                        {/* Categories */}
                        {product.categories && product.categories.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {product.categories.slice(0, 2).map((category) => (
                              <Badge key={category.id} variant="outline" className="text-xs">
                                {category.name}
                              </Badge>
                            ))}
                            {product.categories.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{product.categories.length - 2} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2M4 13h2m13-8V4a1 1 0 00-1-1H7a1 1 0 00-1 1v1m2 0h8" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-4">
                  We couldn't find any products matching your criteria. Try adjusting your filters or search terms.
                </p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2">
                {page > 1 && (
                  <Link
                    href={`/products?${new URLSearchParams({ ...Object.fromEntries(new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')), page: (page - 1).toString() }).toString()}`}
                    className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 border rounded-md hover:bg-gray-50"
                  >
                    Previous
                  </Link>
                )}
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + Math.max(1, page - 2);
                  if (pageNum > totalPages) return null;
                  
                  return (
                    <Link
                      key={pageNum}
                      href={`/products?${new URLSearchParams({ ...Object.fromEntries(new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')), page: pageNum.toString() }).toString()}`}
                      className={`px-3 py-2 text-sm font-medium border rounded-md ${
                        pageNum === page
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </Link>
                  );
                })}
                
                {page < totalPages && (
                  <Link
                    href={`/products?${new URLSearchParams({ ...Object.fromEntries(new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')), page: (page + 1).toString() }).toString()}`}
                    className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 border rounded-md hover:bg-gray-50"
                  >
                    Next
                  </Link>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProductPageClient;
