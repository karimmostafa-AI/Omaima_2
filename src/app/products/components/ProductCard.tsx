"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ProductWithDetails } from '@/lib/services/product-service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import { QuickAddButton } from '@/components/cart/add-to-cart-button';

interface ProductCardProps {
  product: ProductWithDetails;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const productForCart = {
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.images?.[0]?.url,
    stock: product.quantity
  };

  return (
    <div className="group relative">
      <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-md bg-gray-200 lg:aspect-none group-hover:opacity-75 lg:h-80">
        <Image
          src={product.images?.[0]?.url || '/placeholder.svg'}
          alt={product.name}
          width={400}
          height={500}
          className="h-full w-full object-cover object-center lg:h-full lg:w-full"
        />
        {/* Quick Add Button - appears on hover */}
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <QuickAddButton 
            product={productForCart}
            className="bg-white hover:bg-gray-100 text-gray-900 shadow-lg"
          />
        </div>
      </div>
      <div className="mt-4 flex justify-between">
        <div className="flex-1">
          <h3 className="text-sm text-gray-700">
            <Link href={`/products/${product.slug}`}>
              <span aria-hidden="true" className="absolute inset-0 z-10" />
              {product.name}
            </Link>
          </h3>
          <p className="mt-1 text-sm text-gray-500">{product.categories[0]?.name}</p>
        </div>
        <p className="text-sm font-medium text-gray-900">${product.price.toFixed(2)}</p>
      </div>
      <div className="mt-1 flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`h-4 w-4 ${i < 4 ? 'text-yellow-400' : 'text-gray-300'}`} />
            ))}
          </div>
          <p className="ml-2 text-sm text-gray-500">4.0 (12 reviews)</p>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
