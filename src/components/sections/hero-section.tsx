"use client"

import Link from "next/link"

export function HeroSection() {
  return (
    <div className="relative min-h-[600px] w-full overflow-hidden bg-white">
      {/* Background Image - Optimized size */}
      <div className="absolute inset-0">
        <img
          alt="Woman in a formal suit"
          className="h-full w-full object-cover object-center"
          src="/9f05a07f-72e0-4213-ad1d-1d230da091e0.jfif"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        {/* Overlay using theme colors */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/70 via-gray-800/50 to-transparent"></div>
      </div>
      
      {/* Content - Aligned with theme */}
      <div className="relative z-10 flex h-[600px] items-center justify-start">
        <div className="container mx-auto px-10">
          <div className="max-w-2xl space-y-6">
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-white md:text-6xl" style={{ fontFamily: 'Manrope, "Noto Sans", sans-serif' }}>
              Elegance Redefined
            </h1>
            <p className="text-lg leading-relaxed text-gray-200 md:text-xl max-w-xl" style={{ fontFamily: 'Manrope, "Noto Sans", sans-serif' }}>
              At Omaima, we believe in the power of a perfectly tailored suit. Our collections are crafted with meticulous attention to detail, offering timeless sophistication and confidence for the modern woman.
            </p>
            <div className="pt-4">
              <Link
                href="/products"
                className="inline-block rounded-md bg-[#cf1773] px-8 py-3 text-base font-semibold text-white shadow-lg transition-colors duration-200 hover:bg-[#b91c5c] focus:outline-none focus:ring-4 focus:ring-[#cf1773]/50"
                style={{ fontFamily: 'Manrope, "Noto Sans", sans-serif' }}
              >
                Shop The Collection
              </Link>
            </div>
            
            {/* Trust indicators matching theme */}
            <div className="pt-8 flex items-center space-x-6 text-gray-300">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-[#cf1773] rounded-full"></div>
                <span className="text-sm font-medium">Premium Fabrics</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-[#cf1773] rounded-full"></div>
                <span className="text-sm font-medium">Custom Tailoring</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-[#cf1773] rounded-full"></div>
                <span className="text-sm font-medium">Fast Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
