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

  const { orders, total } = await getOrders({ status, page, limit });

  return (
    <AdminLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Orders</h1>
        <OrdersList orders={orders} total={total} page={page} limit={limit} />
      </div>
    </AdminLayout>
  );
};

export default OrdersListPage;
