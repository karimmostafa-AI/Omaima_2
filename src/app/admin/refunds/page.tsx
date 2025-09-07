import React from 'react';
import AdminLayout from '@/components/layout/admin-layout';
import RefundsPageClient from '@/components/admin/refunds/RefundsPageClient';
import { getRefunds } from '@/lib/services/refund-service';
import { RefundStatus } from '@/types';

interface RefundManagementPageProps {
  searchParams: {
    status?: RefundStatus | 'all';
    search?: string;
    page?: string;
    limit?: string;
  };
}

const RefundManagementPage = async ({ searchParams }: RefundManagementPageProps) => {
  const status = searchParams.status || 'all';
  const search = searchParams.search || '';
  const page = parseInt(searchParams.page || '1', 10);
  const limit = parseInt(searchParams.limit || '10', 10);

  const { refunds, total } = await getRefunds({ status, search, page, limit });

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Refund Management</h1>
        <RefundsPageClient
          initialRefunds={refunds}
          total={total}
          page={page}
          limit={limit}
        />
      </div>
    </AdminLayout>
  );
};

export default RefundManagementPage;
