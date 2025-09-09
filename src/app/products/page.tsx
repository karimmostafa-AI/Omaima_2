import React, { Suspense } from 'react';
import { ProductService } from '@/lib/services/product-service';
import ProductPageClient from './components/ProductPageClient';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    categoryId?: string;
    search?: string;
    sortBy?: 'name' | 'price' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
    priceMin?: string;
    priceMax?: string;
    materials?: string;
    sizes?: string;
    colors?: string;
    brands?: string;
    inStock?: string;
    isCustomizable?: string;
    isReadyMade?: string;
    page?: string;
    limit?: string;
  }>;
}

async function ProductsList({ searchParams }: ProductsPageProps) {
  const resolvedSearchParams = await searchParams;
  const page = parseInt(resolvedSearchParams.page || '1', 10);
  const limit = parseInt(resolvedSearchParams.limit || '12', 10);

  const { products, pagination } = await ProductService.getProducts({
    categoryId: resolvedSearchParams.categoryId || resolvedSearchParams.category,
    search: resolvedSearchParams.search,
    sortBy: resolvedSearchParams.sortBy,
    sortOrder: resolvedSearchParams.sortOrder,
    priceMin: resolvedSearchParams.priceMin ? parseFloat(resolvedSearchParams.priceMin) : undefined,
    priceMax: resolvedSearchParams.priceMax ? parseFloat(resolvedSearchParams.priceMax) : undefined,
    materials: resolvedSearchParams.materials ? resolvedSearchParams.materials.split(',') : undefined,
    sizes: resolvedSearchParams.sizes ? resolvedSearchParams.sizes.split(',') : undefined,
    colors: resolvedSearchParams.colors ? resolvedSearchParams.colors.split(',') : undefined,
    brands: resolvedSearchParams.brands ? resolvedSearchParams.brands.split(',') : undefined,
    inStock: resolvedSearchParams.inStock === 'true',
    isCustomizable: resolvedSearchParams.isCustomizable === 'true',
    isReadyMade: resolvedSearchParams.isReadyMade === 'true',
    page,
    limit,
  });

  return (
    <ProductPageClient
      products={products}
      total={pagination.total}
      page={page}
      limit={limit}
    />
  );
}

const ProductsPage = ({ searchParams }: ProductsPageProps) => {
  return (
    <Suspense fallback={<ProductsSkeleton />}>
      <ProductsList searchParams={searchParams} />
    </Suspense>
  );
};

const ProductsSkeleton = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="hidden lg:block w-80 space-y-6">
          <Skeleton className="h-8 w-1/3" />
          <div className="space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        </aside>
        <main className="flex-1">
          <div className="flex justify-between mb-6">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-8 w-1/4" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-[4/5] w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

export default ProductsPage;
