"use client";

import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import ProductInfoSection from './ProductInfoSection';
import GeneralInfoSection from './GeneralInfoSection';
import PricingSection from './PricingSection';
import MediaSection from './MediaSection';
import SeoSection from './SeoSection';

const productSchema = z.object({
  // Define your full product schema here based on all sections
  name: z.string().min(1, 'Product name is required'),
  shortDescription: z.string().min(1, 'Short description is required'),
  description: z.string().min(1, 'Description is required'),
  // ... other fields from other sections
});

export type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  // initialData?: Product; // For edit mode
  isSubmitting: boolean;
  onSubmit: (data: ProductFormData) => void;
}

const ProductForm = ({ isSubmitting, onSubmit }: ProductFormProps) => {
  const methods = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    // defaultValues: initialData || {},
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
        <ProductInfoSection />
        <GeneralInfoSection />
        <PricingSection />
        <MediaSection />
        <SeoSection />

        <div className="flex justify-end gap-4">
          <Link href="/admin/products" passHref>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Product'}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};

export default ProductForm;
