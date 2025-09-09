'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { useParams } from 'next/navigation';

const productData: Record<string, any> = {
  'professional-blazer-set': {
    name: 'Professional Blazer Set',
    image: '/images/products/blazer.svg',
    category: 'Blazers',
    description: 'A classic and modern blazer perfect for every professional occasion. Crafted with premium fabrics and attention to detail.',
    price: 299.99,
    comparePrice: 349.99,
    tags: ['bestseller'],
    features: ['Premium fabric', 'Tailored fit', 'Professional styling', 'Machine washable']
  },
  'executive-pants': {
    name: 'Executive Pants',
    image: '/images/products/pants.svg',
    category: 'Bottoms',
    description: 'Tailored executive pants that offer sophisticated style and comfort for the modern professional woman.',
    price: 189.99,
    tags: ['new'],
    features: ['Tailored fit', 'Stretch fabric', 'Professional cut', 'Easy care']
  },
  'business-skirt': {
    name: 'Business Skirt',
    image: '/images/products/skirt.svg',
    category: 'Skirts',
    description: 'An elegant and professional skirt designed for the modern businesswoman who values style and comfort.',
    price: 159.99,
    comparePrice: 199.99,
    features: ['A-line cut', 'Knee-length', 'Professional styling', 'Comfortable fit']
  }
};

export default function ProductPage() {
  const params = useParams();
  const slug = params.slug as string;
  const product = productData[slug];

  if (!product) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
            <p className="text-gray-600">The product you're looking for doesn't exist.</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="aspect-[4/5] bg-gray-50 relative overflow-hidden rounded-lg">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-contain p-8"
            />
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-500 mb-2">{product.category}</p>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
              <div className="flex items-center gap-2 mb-4">
                {product.tags.includes('bestseller') && (
                  <Badge className="bg-[#cf1773] text-white">Bestseller</Badge>
                )}
                {product.tags.includes('new') && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">New Arrival</Badge>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-gray-900">${product.price}</span>
              {product.comparePrice && (
                <span className="text-lg text-gray-500 line-through">${product.comparePrice}</span>
              )}
            </div>

            <p className="text-gray-600 leading-relaxed">{product.description}</p>

            {product.features && (
              <div>
                <h3 className="font-semibold text-lg mb-3">Features:</h3>
                <ul className="space-y-2">
                  {product.features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-center text-gray-600">
                      <span className="w-2 h-2 bg-[#cf1773] rounded-full mr-3"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-4">
              <Button className="w-full bg-[#cf1773] hover:bg-[#b91c5c] text-lg py-6">
                Add to Cart - ${product.price}
              </Button>
              <Button variant="outline" className="w-full border-[#cf1773] text-[#cf1773] hover:bg-[#cf1773] hover:text-white">
                Add to Wishlist
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
