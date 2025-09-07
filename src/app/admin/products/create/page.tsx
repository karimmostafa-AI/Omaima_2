import React from 'react';
import AdminLayout from '@/components/layout/admin-layout';
import CreateProductPageClient from '@/components/admin/products/CreateProductPageClient';

const CreateProductPage = () => {
  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Create New Product</h1>
        <CreateProductPageClient />
      </div>
    </AdminLayout>
  );
};

export default CreateProductPage;
