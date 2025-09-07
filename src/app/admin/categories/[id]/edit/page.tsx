import React from 'react';
import AdminLayout from '@/components/layout/admin-layout';
import EditCategoryPageClient from '@/components/admin/categories/EditCategoryPageClient';
import { getCategoryById } from '@/lib/services/category-service';
import { notFound } from 'next/navigation';

interface EditCategoryPageProps {
  params: {
    id: string;
  };
}

const EditCategoryPage = async ({ params }: EditCategoryPageProps) => {
  const category = await getCategoryById(params.id);

  if (!category) {
    notFound();
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Edit Category</h1>
        <EditCategoryPageClient category={category} />
      </div>
    </AdminLayout>
  );
};

export default EditCategoryPage;
