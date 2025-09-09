import React from 'react';
import { getOrderById } from '@/lib/services/order-service';
import OrderDetails from '@/components/admin/order-details';
import { notFound } from 'next/navigation';
import AdminLayout from '@/components/layout/admin-layout';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

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
    <AdminLayout 
      title={`Order ${order.order_number}`}
      subtitle={`View and manage order details`}
    >
      <div className="space-y-6">
        {/* Back Button */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/orders">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Orders
            </Link>
          </Button>
        </div>

        {/* Order Details Component */}
        <OrderDetails order={order} />
      </div>
    </AdminLayout>
  );
};

export default OrderDetailsPage;
