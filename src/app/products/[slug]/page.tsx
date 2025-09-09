'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { AddToCartButton } from '@/components/cart/add-to-cart-button';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';

interface DatabaseProduct {
  id: string;
  name: string;
  price: number;
  image?: string;
  stock?: number;
}

const productData: Record<string, any> = {
  'professional-blazer-set': {
    name: 'Classic Black Suit',
    description: 'Timeless elegance for the modern professional',
    price: 299.00,
    category: 'Suits',
    images: [
      '/d3aa7ce5-3d38-4e2d-8751-cba0172f7af7.jfif',
      '/057fa6a6-c770-47be-9c24-3b15ffb77188.jfif',
      '/271000eb-d4f1-4171-812a-55e3b31fa80d.jfif',
      '/2b9a4c7d-cd39-4ab0-b36c-77de46b4a36c.jfif',
      '/43c47dc4-5ec8-454c-9ac0-fa356cbc802c.jfif'
    ],
    material: '70% Polyester, 30% Viscose',
    care: 'Dry clean only'
  },
  'executive-dress': {
    name: 'Classic Black Suit',
    description: 'Timeless elegance for the modern professional',
    price: 299.00,
    category: 'Suits',
    images: [
      '/81f8f837-f8ff-45b0-a05a-9ee5fa79d5f5.jfif',
      '/8ee09d5c-9bf0-4a3c-b98d-0bcc537d00db.jfif',
      '/9f05a07f-72e0-4213-ad1d-1d230da091e0.jfif',
      '/d3aa7ce5-3d38-4e2d-8751-cba0172f7af7.jfif',
      '/057fa6a6-c770-47be-9c24-3b15ffb77188.jfif'
    ],
    material: '70% Polyester, 30% Viscose',
    care: 'Dry clean only'
  }
};

const relatedProducts = [
  {
    name: 'Crisp White Blouse',
    price: 59.00,
    image: '/271000eb-d4f1-4171-812a-55e3b31fa80d.jfif'
  },
  {
    name: 'Classic Pencil Skirt',
    price: 79.00,
    image: '/2b9a4c7d-cd39-4ab0-b36c-77de46b4a36c.jfif'
  },
  {
    name: 'Tailored Blazer',
    price: 129.00,
    image: '/43c47dc4-5ec8-454c-9ac0-fa356cbc802c.jfif'
  },
  {
    name: 'Elegant Silk Scarf',
    price: 49.00,
    image: '/81f8f837-f8ff-45b0-a05a-9ee5fa79d5f5.jfif'
  }
];

const reviews = [
  {
    name: 'Sophia Carter',
    avatar: '/8ee09d5c-9bf0-4a3c-b98d-0bcc537d00db.jfif',
    rating: 5,
    date: '2 months ago',
    comment: "Absolutely love this suit! The fit is perfect and the fabric feels luxurious. I've received so many compliments wearing it to work.",
    likes: 25,
    dislikes: 2
  },
  {
    name: 'Ava Bennett',
    avatar: '/9f05a07f-72e0-4213-ad1d-1d230da091e0.jfif',
    rating: 4,
    date: '4 months ago',
    comment: 'Great suit for the price. The material is good quality and it looks very professional. I would recommend sizing up if you\'re between sizes.',
    likes: 18,
    dislikes: 3
  }
];

export default function ProductPage() {
  const params = useParams();
  const slug = params.slug as string;
  const mockProduct = productData[slug] || productData['professional-blazer-set'];
  
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('black');
  const [mainImage, setMainImage] = useState(0);
  const [realProduct, setRealProduct] = useState<DatabaseProduct | null>(null);
  const [loading, setLoading] = useState(true);

  // Try to fetch real product data, fallback to mock data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch('/api/products/simple');
        if (response.ok) {
          const products = await response.json();
          
          // Try to find a product that matches the slug or just use the first one
          let dbProduct = products.find((p: any) => 
            p.name.toLowerCase().replace(/\s+/g, '-').includes(slug.toLowerCase()) ||
            slug.includes(p.name.toLowerCase().replace(/\s+/g, '-'))
          );
          
          // If no match found, use the first product
          if (!dbProduct && products.length > 0) {
            dbProduct = products[0];
          }
          
          if (dbProduct) {
            setRealProduct({
              id: dbProduct.id,
              name: dbProduct.name,
              price: dbProduct.price,
              image: dbProduct.image,
              stock: dbProduct.stock
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  // Use real product data if available, otherwise use mock data
  const product = realProduct ? {
    ...mockProduct,
    name: realProduct.name,
    price: realProduct.price,
    description: mockProduct.description // Keep mock description for now
  } : mockProduct;

  return (
    <MainLayout>
      <main className="flex-1 px-16 py-10 bg-stone-50">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="text-sm text-stone-500 mb-8">
            <Link href="/" className="hover:text-stone-700">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/products" className="hover:text-stone-700">Suits</Link>
            <span className="mx-2">/</span>
            <span className="text-stone-800 font-medium">{product.name}</span>
          </div>

          {/* Product Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image Gallery */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 rounded-xl overflow-hidden">
                <Image
                  alt={`${product.name} - Main view`}
                  className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                  src={product.images[mainImage]}
                  width={600}
                  height={600}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              {product.images.slice(1, 5).map((image: string, index: number) => (
                <div key={index} className="rounded-xl overflow-hidden cursor-pointer" onClick={() => setMainImage(index + 1)}>
                  <Image
                    alt={`${product.name} - View ${index + 2}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    src={image}
                    width={200}
                    height={200}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Product Details */}
            <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-stone-800">{product.name}</h1>
              <p className="text-stone-500 mt-2 text-lg">{product.description}</p>
              {realProduct && (
                <div className="mt-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    ✓ Live Product Data
                  </span>
                </div>
              )}
            </div>

              <p className="text-4xl font-bold text-stone-900">${product.price.toFixed(2)}</p>

              {/* Size Selection */}
              <div>
                <h3 className="text-lg font-bold text-stone-800 mb-4">Size</h3>
                <div className="flex flex-wrap gap-3">
                  {['XS', 'S', 'M', 'L', 'XL'].map((size) => (
                    <label key={size} className="flex items-center justify-center rounded-md border border-stone-300 px-5 py-3 text-sm font-medium text-stone-700 cursor-pointer has-[:checked]:bg-stone-800 has-[:checked]:text-white has-[:checked]:border-stone-800 transition-colors">
                      {size}
                      <input 
                        className="invisible absolute" 
                        name="size" 
                        type="radio" 
                        value={size}
                        checked={selectedSize === size}
                        onChange={(e) => setSelectedSize(e.target.value)}
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div>
                <h3 className="text-lg font-bold text-stone-800 mb-4">Color</h3>
                <div className="flex flex-wrap gap-4">
                  {[
                    { name: 'black', color: 'rgb(0, 0, 0)' },
                    { name: 'charcoal', color: 'rgb(51, 51, 51)' },
                    { name: 'gray', color: 'rgb(102, 102, 102)' }
                  ].map((colorOption) => (
                    <label key={colorOption.name} className="size-10 rounded-full border-2 border-transparent cursor-pointer has-[:checked]:ring-2 has-[:checked]:ring-offset-2 has-[:checked]:ring-[#cf1773] transition" style={{ backgroundColor: colorOption.color }}>
                      <input 
                        className="invisible" 
                        name="color" 
                        type="radio" 
                        value={colorOption.name}
                        checked={selectedColor === colorOption.name}
                        onChange={(e) => setSelectedColor(e.target.value)}
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* Add to Cart */}
              <div className="pt-4">
                {realProduct ? (
                  <AddToCartButton
                    product={realProduct}
                    variantId={`${selectedSize}-${selectedColor}`}
                    quantity={1}
                    estimatedDeliveryDays={5}
                    className="w-full h-14 text-lg font-bold bg-[#cf1773] hover:bg-[#b01460] border-[#cf1773]"
                    size="lg"
                  />
                ) : (
                  <button 
                    className="w-full flex items-center justify-center rounded-lg h-14 px-6 bg-[#cf1773] text-white text-lg font-bold hover:bg-opacity-90 transition-colors"
                    disabled={loading}
                  >
                    {loading ? 'Loading...' : 'Add to Cart'}
                  </button>
                )}
                <p className="text-center text-stone-500 text-sm mt-3">Estimated Delivery: 3-5 business days</p>
              </div>
            </div>
          </div>

          {/* Product Details Section */}
          <div className="mt-20">
            <div className="border-b border-stone-200">
              <h2 className="text-2xl font-bold text-stone-800 pb-4">Product Details</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 pt-8">
              <p className="text-stone-600 leading-relaxed">
                Our Classic Black Suit is a staple for any professional wardrobe. Crafted from high-quality, wrinkle-resistant fabric, it offers both style and comfort. The tailored fit ensures a flattering silhouette, while the timeless design makes it suitable for any occasion.
              </p>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <p className="text-stone-500 font-medium">Material</p>
                  <p className="text-stone-700 col-span-2">{product.material}</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <p className="text-stone-500 font-medium">Care</p>
                  <p className="text-stone-700 col-span-2">{product.care}</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <p className="text-stone-500 font-medium">Sizing</p>
                  <a className="text-[#cf1773] col-span-2 font-medium hover:underline" href="#">
                    View size guide
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Reviews */}
          <div className="mt-20">
            <div className="border-b border-stone-200">
              <h2 className="text-2xl font-bold text-stone-800 pb-4">Customer Reviews</h2>
            </div>
            <div className="flex flex-wrap gap-x-16 gap-y-8 pt-8">
              <div className="flex flex-col gap-2 items-center">
                <p className="text-stone-800 text-6xl font-bold">4.5</p>
                <div className="flex gap-1 text-yellow-500">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} fill="currentColor" height="20px" viewBox="0 0 256 256" width="20px">
                      <path d="M234.5,114.38l-45.1,39.36,13.51,58.6a16,16,0,0,1-23.84,17.34l-51.11-31-51,31a16,16,0,0,1-23.84-17.34L66.61,153.8,21.5,114.38a16,16,0,0,1,9.11-28.06l59.46-5.15,23.21-55.36a15.95,15.95,0,0,1,29.44,0h0L166,81.17l59.44,5.15a16,16,0,0,1,9.11,28.06Z"></path>
                    </svg>
                  ))}
                </div>
                <p className="text-stone-500 text-sm">Based on 150 reviews</p>
              </div>
              <div className="grid min-w-[240px] max-w-[400px] flex-1 grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-2">
                <p className="text-stone-600 text-sm font-medium">5 star</p>
                <div className="flex h-2 flex-1 overflow-hidden rounded-full bg-stone-200">
                  <div className="rounded-full bg-yellow-500" style={{ width: '40%' }}></div>
                </div>
                <p className="text-stone-500 text-sm font-medium text-right">40%</p>
                
                <p className="text-stone-600 text-sm font-medium">4 star</p>
                <div className="flex h-2 flex-1 overflow-hidden rounded-full bg-stone-200">
                  <div className="rounded-full bg-yellow-500" style={{ width: '30%' }}></div>
                </div>
                <p className="text-stone-500 text-sm font-medium text-right">30%</p>
                
                <p className="text-stone-600 text-sm font-medium">3 star</p>
                <div className="flex h-2 flex-1 overflow-hidden rounded-full bg-stone-200">
                  <div className="rounded-full bg-yellow-500" style={{ width: '15%' }}></div>
                </div>
                <p className="text-stone-500 text-sm font-medium text-right">15%</p>
                
                <p className="text-stone-600 text-sm font-medium">2 star</p>
                <div className="flex h-2 flex-1 overflow-hidden rounded-full bg-stone-200">
                  <div className="rounded-full bg-yellow-500" style={{ width: '10%' }}></div>
                </div>
                <p className="text-stone-500 text-sm font-medium text-right">10%</p>
                
                <p className="text-stone-600 text-sm font-medium">1 star</p>
                <div className="flex h-2 flex-1 overflow-hidden rounded-full bg-stone-200">
                  <div className="rounded-full bg-yellow-500" style={{ width: '5%' }}></div>
                </div>
                <p className="text-stone-500 text-sm font-medium text-right">5%</p>
              </div>
            </div>
            <div className="divide-y divide-stone-200 mt-10">
              {reviews.map((review, index) => (
                <div key={index} className="py-8">
                  <div className="flex items-start gap-4">
                    <Image
                      alt={`${review.name}'s profile picture`}
                      className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-12"
                      src={review.avatar}
                      width={48}
                      height={48}
                    />
                    <div className="flex-1">
                      <p className="text-stone-800 font-semibold">{review.name}</p>
                      <p className="text-stone-500 text-sm">{review.date}</p>
                      <div className="flex gap-0.5 mt-2 text-yellow-500">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg key={star} fill="currentColor" height="16px" viewBox="0 0 256 256" width="16px" className={star > review.rating ? 'text-stone-300' : ''}>
                            <path d="M234.5,114.38l-45.1,39.36,13.51,58.6a16,16,0,0,1-23.84,17.34l-51.11-31-51,31a16,16,0,0,1-23.84-17.34L66.61,153.8,21.5,114.38a16,16,0,0,1,9.11-28.06l59.46-5.15,23.21-55.36a15.95,15.95,0,0,1,29.44,0h0L166,81.17l59.44,5.15a16,16,0,0,1,9.11,28.06Z"></path>
                          </svg>
                        ))}
                      </div>
                      <p className="text-stone-600 leading-relaxed mt-4">{review.comment}</p>
                      <div className="flex gap-6 text-stone-500 mt-4">
                        <button className="flex items-center gap-2 hover:text-stone-800 transition-colors">
                          <svg fill="currentColor" height="20px" viewBox="0 0 256 256" width="20px">
                            <path d="M234,80.12A24,24,0,0,0,216,72H160V56a40,40,0,0,0-40-40,8,8,0,0,0-7.16,4.42L75.06,96H32a16,16,0,0,0-16,16v88a16,16,0,0,0,16,16H204a24,24,0,0,0,23.82-21l12-96A24,24,0,0,0,234,80.12ZM32,112H72v88H32ZM223.94,97l-12,96a8,8,0,0,1-7.94,7H88V105.89l36.71-73.43A24,24,0,0,1,144,56V80a8,8,0,0,0,8,8h64a8,8,0,0,1,7.94,9Z"></path>
                          </svg>
                          <span className="text-sm font-medium">{review.likes}</span>
                        </button>
                        <button className="flex items-center gap-2 hover:text-stone-800 transition-colors">
                          <svg fill="currentColor" height="20px" viewBox="0 0 256 256" width="20px">
                            <path d="M239.82,157l-12-96A24,24,0,0,0,204,40H32A16,16,0,0,0,16,56v88a16,16,0,0,0,16,16H75.06l37.78,75.58A8,8,0,0,0,120,240a40,40,0,0,0,40-40V184h56a24,24,0,0,0,23.82-27ZM72,144H32V56H72Zm150,21.29a7.88,7.88,0,0,1-6,2.71H152a8,8,0,0,0-8,8v24a24,24,0,0,1-19.29,23.54L88,150.11V56H204a8,8,0,0,1,7.94,7l12,96A7.87,7.87,0,0,1,222,165.29Z"></path>
                          </svg>
                          <span className="text-sm font-medium">{review.dislikes}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Related Products */}
          <div className="mt-20">
            <h2 className="text-2xl font-bold text-stone-800 pb-4">Customers Also Viewed</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8 pt-8">
              {relatedProducts.map((product, index) => (
                <div key={index} className="group">
                  <div className="rounded-lg overflow-hidden mb-4">
                    <Image
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      src={product.image}
                      width={200}
                      height={250}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                  <h3 className="text-stone-800 font-semibold text-lg group-hover:text-[#cf1773] transition-colors">{product.name}</h3>
                  <p className="text-stone-500">${product.price.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </MainLayout>
  );
}
