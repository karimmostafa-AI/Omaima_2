import React from 'react';
import { getOrderById } from '@/lib/services/order-service';
import OrderDetails from '@/components/admin/order-details';
import { notFound } from 'next/navigation';
import AdminLayout from '@/components/layout/admin-layout';

interface OrderDetailsPageProps {
  params: {
    id: string;
  };
}

const OrderDetailsPage = async ({ params }: OrderDetailsPageProps) => {
  const order = await getOrderById(params.id);

  if (!order) {
    notFound();
  }

  return (
    <AdminLayout>
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Order Details</h1>
            <OrderDetails order={order} />
        </div>
    </AdminLayout>
  );
};

export default OrderDetailsPage;
