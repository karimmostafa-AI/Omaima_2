"use client";

import React, { useState } from 'react';
import { ProductWithDetails } from '@/lib/services/product-service';
import { MainLayout } from '@/components/layout/main-layout';
import Link from 'next/link';
import Image from 'next/image';

interface ProductPageClientProps {
  products: ProductWithDetails[];
  total: number;
  page: number;
  limit: number;
}

const ProductPageClient = ({ products, total, page, limit }: ProductPageClientProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState(500);
  const [sortBy, setSortBy] = useState('newest');

  const handleMaterialChange = (material: string, checked: boolean) => {
    if (checked) {
      setSelectedMaterials([...selectedMaterials, material]);
    } else {
      setSelectedMaterials(selectedMaterials.filter(m => m !== material));
    }
  };

  // Mock product data - replace with your actual products
  const mockProducts = [
    {
      id: '1',
      name: 'Tailored Black Suit',
      price: 299.99,
      image: '/d3aa7ce5-3d38-4e2d-8751-cba0172f7af7.jfif',
      slug: 'tailored-black-suit'
    },
    {
      id: '2',
      name: 'Classic Navy Uniform',
      price: 179.99,
      image: '/057fa6a6-c770-47be-9c24-3b15ffb77188.jfif',
      slug: 'classic-navy-uniform'
    },
    {
      id: '3',
      name: 'Modern Gray Suit',
      price: 329.99,
      image: '/271000eb-d4f1-4171-812a-55e3b31fa80d.jfif',
      slug: 'modern-gray-suit'
    },
    {
      id: '4',
      name: 'Relaxed Fit Blazer',
      price: 149.99,
      image: '/2b9a4c7d-cd39-4ab0-b36c-77de46b4a36c.jfif',
      slug: 'relaxed-fit-blazer'
    },
    {
      id: '5',
      name: 'Slim Fit Black Suit',
      price: 349.99,
      image: '/43c47dc4-5ec8-454c-9ac0-fa356cbc802c.jfif',
      slug: 'slim-fit-black-suit'
    },
    {
      id: '6',
      name: 'Professional Blue Uniform',
      price: 199.99,
      image: '/81f8f837-f8ff-45b0-a05a-9ee5fa79d5f5.jfif',
      slug: 'professional-blue-uniform'
    },
    {
      id: '7',
      name: 'Elegant Beige Suit',
      price: 279.99,
      image: '/8ee09d5c-9bf0-4a3c-b98d-0bcc537d00db.jfif',
      slug: 'elegant-beige-suit'
    },
    {
      id: '8',
      name: 'Structured Gray Blazer',
      price: 169.99,
      image: '/9f05a07f-72e0-4213-ad1d-1d230da091e0.jfif',
      slug: 'structured-gray-blazer'
    }
  ];

  return (
    <MainLayout>
      <div className="relative flex size-full min-h-screen flex-col overflow-x-hidden">
        <main className="flex flex-1">
          {/* Filters Sidebar */}
          <aside className="w-80 shrink-0 border-r border-[#e5dce0] p-6 hidden lg:block">
            <h2 className="text-[#181114] text-2xl font-bold leading-tight tracking-[-0.015em] mb-6">Filters</h2>
            <div className="space-y-8">
              {/* Size Filter */}
              <div>
                <h3 className="text-[#181114] text-lg font-bold leading-tight tracking-[-0.015em] mb-4">Size</h3>
                <div className="flex flex-wrap gap-2">
                  {['XS', 'S', 'M', 'L', 'XL'].map((size) => (
                    <label key={size} className="cursor-pointer">
                      <input 
                        className="peer sr-only" 
                        name="size" 
                        type="radio" 
                        value={size}
                        checked={selectedSize === size}
                        onChange={(e) => setSelectedSize(e.target.value)}
                      />
                      <div className="flex items-center justify-center rounded-md border border-[#e5dce0] px-4 py-2 text-sm font-medium text-[#181114] peer-checked:bg-[#cf1773] peer-checked:text-white peer-checked:border-[#cf1773] transition-all">
                        {size}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Color Filter */}
              <div>
                <h3 className="text-[#181114] text-lg font-bold leading-tight tracking-[-0.015em] mb-4">Color</h3>
                <div className="flex flex-wrap gap-3">
                  {[
                    { name: 'white', color: 'bg-white' },
                    { name: 'black', color: 'bg-black' },
                    { name: 'gray', color: 'bg-gray-500' },
                    { name: 'blue', color: 'bg-blue-700' },
                    { name: 'green', color: 'bg-green-700' }
                  ].map((colorOption) => (
                    <label key={colorOption.name} className="cursor-pointer">
                      <input 
                        className="peer sr-only" 
                        name="color" 
                        type="radio" 
                        value={colorOption.name}
                        checked={selectedColor === colorOption.name}
                        onChange={(e) => setSelectedColor(e.target.value)}
                      />
                      <div className={`size-8 rounded-full border border-[#e5dce0] ${colorOption.color} peer-checked:ring-2 peer-checked:ring-offset-2 peer-checked:ring-[#cf1773] transition-all`}></div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Style Filter */}
              <div>
                <h3 className="text-[#181114] text-lg font-bold leading-tight tracking-[-0.015em] mb-4">Style</h3>
                <div className="space-y-2">
                  {['Classic', 'Modern', 'Tailored', 'Relaxed'].map((style) => (
                    <label key={style} className="flex items-center gap-3 cursor-pointer">
                      <input 
                        className="form-radio text-[#cf1773] focus:ring-[#cf1773]" 
                        name="style" 
                        type="radio" 
                        value={style}
                        checked={selectedStyle === style}
                        onChange={(e) => setSelectedStyle(e.target.value)}
                      />
                      <span className="text-sm font-medium text-[#181114]">{style}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Material Filter */}
              <div>
                <h3 className="text-[#181114] text-lg font-bold leading-tight tracking-[-0.015em] mb-4">Material</h3>
                <div className="space-y-2">
                  {['Wool', 'Cotton', 'Linen', 'Polyester'].map((material) => (
                    <label key={material} className="flex items-center gap-3 cursor-pointer">
                      <input 
                        className="form-checkbox rounded text-[#cf1773] focus:ring-[#cf1773]" 
                        type="checkbox" 
                        checked={selectedMaterials.includes(material)}
                        onChange={(e) => handleMaterialChange(material, e.target.checked)}
                      />
                      <span className="text-sm font-medium text-[#181114]">{material}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div>
                <h3 className="text-[#181114] text-lg font-bold leading-tight tracking-[-0.015em] mb-4">Price Range</h3>
                <div className="relative pt-1">
                  <input 
                    className="w-full h-2 bg-[#e5dce0] rounded-lg appearance-none cursor-pointer" 
                    max="500" 
                    min="0" 
                    type="range" 
                    value={priceRange}
                    onChange={(e) => setPriceRange(Number(e.target.value))}
                  />
                  <div className="flex justify-between text-sm text-[#886375] mt-2">
                    <span>$0</span>
                    <span>${priceRange}+</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 p-6">
            <div className="mb-6">
              <h1 className="text-[#181114] text-4xl font-bold leading-tight tracking-tight">Women's Suits & Uniforms</h1>
              <p className="text-[#886375] text-base mt-2">Explore our curated collection of women's formal wear, designed for elegance and professionalism.</p>
            </div>

            {/* Sort Tabs */}
            <div className="border-b border-[#e5dce0] mb-6">
              <nav className="flex -mb-px gap-8">
                {[
                  { id: 'newest', label: 'Newest Arrivals' },
                  { id: 'price-low', label: 'Price: Low to High' },
                  { id: 'price-high', label: 'Price: High to Low' },
                  { id: 'bestselling', label: 'Bestselling' }
                ].map((sort) => (
                  <button
                    key={sort.id}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      sortBy === sort.id
                        ? 'text-[#cf1773] border-[#cf1773]'
                        : 'text-[#886375] border-transparent hover:text-[#181114] hover:border-gray-300'
                    }`}
                    onClick={() => setSortBy(sort.id)}
                  >
                    {sort.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
              {mockProducts.map((product) => (
                <div key={product.id} className="group relative">
                  <div className="aspect-[3/4] w-full overflow-hidden rounded-md bg-gray-200">
                    <Image
                      alt={product.name}
                      className="h-full w-full object-cover object-center group-hover:opacity-75 transition-opacity"
                      src={product.image}
                      width={300}
                      height={400}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="mt-4 flex justify-between">
                    <div>
                      <h3 className="text-sm text-[#181114] font-medium">
                        <Link href={`/products/${product.slug}`}>{product.name}</Link>
                      </h3>
                      <p className="mt-1 text-sm text-[#886375]">${product.price}</p>
                    </div>
                  </div>
                  <div className="absolute inset-x-0 bottom-24 hidden group-hover:block">
                    <button className="w-11/12 mx-auto flex items-center justify-center rounded-md bg-white/80 backdrop-blur text-sm font-medium text-[#181114] py-2 hover:bg-white transition-colors">
                      Quick View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </MainLayout>
  );
};

export default ProductPageClient;
