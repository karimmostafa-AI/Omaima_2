'use client';

import { MainLayout } from '@/components/layout/main-layout';

export default function CartPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Shopping Cart</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500 text-center">Your cart is empty. Start shopping to add items here!</p>
        </div>
      </div>
    </MainLayout>
  );
}
