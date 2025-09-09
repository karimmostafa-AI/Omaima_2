import React from 'react';
import AdminLayout from '@/components/layout/admin-layout';
import OrdersList from '@/components/admin/orders-list';
import { getOrders } from '@/lib/services/order-service';
import { OrderStatus } from '@/types';

interface OrdersListPageProps {
  searchParams: {
    status?: OrderStatus | 'all';
    page?: string;
    limit?: string;
  };
}

const OrdersListPage = async ({ searchParams }: OrdersListPageProps) => {
  const status = searchParams.status || 'all';
  const page = parseInt(searchParams.page || '1', 10);
  const limit = parseInt(searchParams.limit || '10', 10);

  const result = await getOrders({ status, page, limit });

  return (
    <AdminLayout>
      <OrdersList 
        orders={result.orders} 
        total={result.total} 
        page={result.currentPage} 
        limit={limit} 
      />
    </AdminLayout>
  );
};

export default OrdersListPage;
