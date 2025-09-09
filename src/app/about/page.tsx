'use client';

import { MainLayout } from '@/components/layout/main-layout';

export default function AboutPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">About Omaima</h1>
        <div className="bg-white rounded-lg shadow p-8">
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 leading-relaxed mb-6">
              At Omaima, we believe that professional attire should embody both elegance and confidence. 
              Our curated collection of women's formal suits and uniforms is designed for the modern 
              professional who values sophistication without compromising on comfort.
            </p>
            <p className="text-gray-600 leading-relaxed mb-6">
              Founded with the vision of empowering women through exceptional fashion, we specialize in 
              creating tailored pieces that make a statement in any professional setting. From executive 
              boardrooms to creative workspaces, our designs adapt to your lifestyle while maintaining 
              the highest standards of quality and craftsmanship.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Every piece in our collection is carefully selected to ensure it meets our standards for 
              fit, fabric quality, and timeless design. We're committed to helping you build a wardrobe 
              that reflects your professional aspirations and personal style.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
