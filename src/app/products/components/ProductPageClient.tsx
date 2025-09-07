"use client";

import React from 'react';
import { Product } from '@/types';
import { MainLayout } from '@/components/layout/main-layout';
import ProductGrid from './ProductGrid';
import ProductFilters from '@/components/products/product-filters';
import SearchBar from './SearchBar';
import Pagination from './Pagination';
import FilterModal from './FilterModal';
import { ProductSort } from '@/components/products/product-sort';

interface ProductPageClientProps {
  products: Product[];
  total: number;
  page: number;
  limit: number;
}

const ProductPageClient = ({ products, total, page, limit }: ProductPageClientProps) => {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="hidden lg:block w-80 space-y-6">
            <h3 className="font-semibold">Filters</h3>
            <ProductFilters />
          </aside>
          <main className="flex-1">
            <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
              <div className="w-full md:w-1/2">
                <SearchBar />
              </div>
              <div className="flex items-center gap-4">
                <FilterModal />
                <ProductSort />
              </div>
            </div>

            {products.length > 0 ? (
              <>
                <ProductGrid products={products} />
                <div className="mt-12 flex justify-center">
                  <Pagination
                    currentPage={page}
                    totalPages={Math.ceil(total / limit)}
                  />
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium mb-2">No products found</h3>
                <p className="text-muted-foreground">Try adjusting your filters or search terms.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProductPageClient;
