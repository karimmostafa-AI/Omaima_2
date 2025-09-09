"use client"

import Link from "next/link"

export function HeroSection() {
  return (
    <section className="relative min-h-[800px] flex items-center">
      {/* Subtle enhancement overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-transparent"></div>
      
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="relative z-20 max-w-2xl">
          {/* Main heading with better contrast */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
            <span className="text-white drop-shadow-lg">Elevate Your</span>
            <br />
            <span className="text-[#cf1773] drop-shadow-lg">Professional Style</span>
          </h1>
          
          {/* Description with elegant backdrop */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-8 mb-8 shadow-2xl">
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
      
      {/* Beautiful background image without gradient overlay */}
      <div className="absolute inset-0 -z-10">
        <img
          alt="Professional woman in elegant business attire"
          className="h-full w-full object-cover"
          src="/9f05a07f-72e0-4213-ad1d-1d230da091e0.jfif"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        {/* Subtle overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/20"></div>
      </div>
    </section>
  )
}
