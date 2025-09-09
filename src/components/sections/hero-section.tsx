"use client"

import Link from "next/link"

export function HeroSection() {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          alt="Woman in a formal suit"
          className="h-full w-full object-cover"
          src="/9f05a07f-72e0-4213-ad1d-1d230da091e0.jfif"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-black/30"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center text-center text-white p-8">
        <div className="max-w-3xl space-y-8">
          <h1 className="text-5xl font-bold leading-tight tracking-tight text-white md:text-7xl font-serif">
            Elegance Redefined
          </h1>
          <p className="text-lg leading-relaxed text-gray-200 md:text-xl">
            At Omaima, we believe in the power of a perfectly tailored suit. Our collections are crafted with meticulous attention to detail, offering timeless sophistication and confidence for the modern woman.
          </p>
          <Link
            href="/products"
            className="inline-block rounded-md bg-white px-10 py-4 text-lg font-semibold text-gray-900 shadow-lg transition-transform duration-300 ease-in-out hover:scale-105 hover:bg-gray-100"
          >
            Shop The Collection
          </Link>
        </div>
      </div>
    </div>
  )
}
