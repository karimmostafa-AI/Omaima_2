"use client"

import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative min-h-[700px] flex items-center">
      {/* Enhanced background overlay */}
      <div className="absolute inset-0 bg-black/20"></div>
      
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="relative z-20 max-w-2xl">
          {/* Main heading with better contrast */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
            <span className="text-white drop-shadow-lg">Elevate Your</span>
            <br />
            <span className="text-[#cf1773] drop-shadow-lg">Professional Style</span>
          </h1>
          
          {/* Description with backdrop */}
          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 mb-8">
            <p className="text-xl text-white leading-relaxed">
              Discover our curated collection of women's formal suits and uniforms, 
              designed for confidence and sophistication in every professional setting.
            </p>
          </div>
          
          {/* Enhanced call-to-action buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-lg bg-[#cf1773] px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:bg-[#b91c5c] hover:shadow-xl hover:scale-105 focus:ring-4 focus:ring-[#cf1773]/50"
            >
              Browse Collection
              <span className="ml-2">→</span>
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm border-2 border-white/20 px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:bg-white/20 hover:shadow-xl focus:ring-4 focus:ring-white/30"
            >
              Learn More
            </Link>
          </div>
          
          {/* Trust indicators */}
          <div className="mt-12 flex items-center space-x-8 text-white/80">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-[#cf1773] rounded-full shadow-lg"></div>
              <span className="text-sm font-medium">Premium Fabrics</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-[#cf1773] rounded-full shadow-lg"></div>
              <span className="text-sm font-medium">Custom Tailoring</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-[#cf1773] rounded-full shadow-lg"></div>
              <span className="text-sm font-medium">Fast Delivery</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Enhanced background image */}
      <div className="absolute inset-0 -z-10">
        <div className="h-full w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700">
          <img
            alt="Professional woman in elegant business attire"
            className="h-full w-full object-cover opacity-90"
            src="/images/hero/professional-hero.svg"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      </div>
    </section>
  )
}
