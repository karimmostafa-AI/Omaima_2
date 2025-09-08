import React from 'react';
import { ProductWithDetails } from '@/lib/services/product-service';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: ProductWithDetails[];
}

const ProductGrid = ({ products }: ProductGridProps) => {
  return (
    <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
