"use client";

import React, { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import ProductForm, { ProductFormData } from './ProductForm';

const CreateProductPageClient = () => {
  const router = useRouter();
  const [isSubmitting, startTransition] = useTransition();

  const handleSubmit = async (data: ProductFormData) => {
    startTransition(async () => {
      console.log('Creating product with data:', data);

      // In a real app, you would handle file uploads properly here
      // For now, we'll just simulate the API call
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        router.push('/admin/products');
        router.refresh();
      } else {
        console.error('Failed to create product');
        // TODO: Show an error message to the user
      }
    });
  };

  return <ProductForm isSubmitting={isSubmitting} onSubmit={handleSubmit} />;
};

export default CreateProductPageClient;
