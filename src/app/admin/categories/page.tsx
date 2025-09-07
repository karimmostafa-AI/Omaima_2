import React from 'react';
import AdminLayout from '@/components/layout/admin-layout';
import CategoriesList from '@/components/admin/categories/CategoriesList';
import { getCategories } from '@/lib/services/category-service';

interface CategoriesPageProps {
  searchParams: {
    page?: string;
    limit?: string;
  };
}

const CategoriesPage = async ({ searchParams }: CategoriesPageProps) => {
  const page = parseInt(searchParams.page || '1', 10);
  const limit = parseInt(searchParams.limit || '10', 10);

  const { categories, total } = await getCategories({ page, limit });

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Category List</h1>
        <CategoriesList categories={categories} total={total} page={page} limit={limit} />
      </div>
    </AdminLayout>
  );
};

export default CategoriesPage;
