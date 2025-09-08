"use client";

import React, { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import CategoryForm from './CategoryForm';
import { z } from 'zod';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long.'),
  description: z.string().optional(),
  image: z.any().optional(),
});

type FormData = z.infer<typeof formSchema>;

const CreateCategoryPageClient = () => {
  const router = useRouter();
  const [isSubmitting, startTransition] = useTransition();

  const handleSubmit = async (data: FormData) => {
    startTransition(async () => {
      // In a real app, you would handle file uploads properly, e.g., to a cloud storage service.
      // For this mock implementation, we'll just log the data.

      // We'll simulate an API call
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        router.push('/admin/categories');
        router.refresh(); // Refresh the page to show the new category
      } else {
        // Handle error
      }
    });
  };

  return <CategoryForm isSubmitting={isSubmitting} onSubmit={handleSubmit} />;
};

export default CreateCategoryPageClient;
