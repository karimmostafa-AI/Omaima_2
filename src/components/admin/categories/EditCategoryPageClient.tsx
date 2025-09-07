"use client";

import React, { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Category } from '@/types';
import CategoryForm from './CategoryForm';
import { z } from 'zod';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long.'),
  description: z.string().optional(),
  image: z.any().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface EditCategoryPageClientProps {
  category: Category;
}

const EditCategoryPageClient = ({ category }: EditCategoryPageClientProps) => {
  const router = useRouter();
  const [isSubmitting, startTransition] = useTransition();

  const handleSubmit = async (data: FormData) => {
    startTransition(async () => {
      console.log('Updating category with data:', data);

      const response = await fetch(`/api/admin/categories/${category.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        router.push('/admin/categories');
        router.refresh();
      } else {
        console.error('Failed to update category');
      }
    });
  };

  return <CategoryForm category={category} isSubmitting={isSubmitting} onSubmit={handleSubmit} />;
};

export default EditCategoryPageClient;
