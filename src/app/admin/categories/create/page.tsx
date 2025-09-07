import React from 'react';
import AdminLayout from '@/components/layout/admin-layout';
import CreateCategoryPageClient from '@/components/admin/categories/CreateCategoryPageClient';

const CreateCategoryPage = () => {
  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Create New Category</h1>
        <CreateCategoryPageClient />
      </div>
    </AdminLayout>
  );
};

export default CreateCategoryPage;
