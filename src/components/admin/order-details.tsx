"use client";

import React, { useState } from 'react';
import { Order, OrderStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import AssignRiderModal from './assign-rider-modal';

interface OrderDetailsProps {
  order: Order;
}

const OrderDetails = ({ order }: OrderDetailsProps) => {
  const [currentOrderStatus, setCurrentOrderStatus] = useState<OrderStatus>(order.status);
  const [isPaid, setIsPaid] = useState(order.financial_status === 'paid');
  const [isAssignRiderModalOpen, setIsAssignRiderModalOpen] = useState(false);

  const handleChangeOrderStatus = (status: OrderStatus) => {
    console.log(`Changing order status to: ${status}`);
    // Here you would typically call an API to update the status
    setCurrentOrderStatus(status);
  };

  const handleTogglePaymentStatus = (checked: boolean) => {
    console.log(`Changing payment status to: ${checked ? 'Paid' : 'Unpaid'}`);
    // Here you would typically call an API to update the status
    setIsPaid(checked);
  };

  const handleAssignRider = (riderId: string) => {
    console.log(`Assigning rider ${riderId} to order ${order.id}`);
    // Here you would typically call an API to assign the rider
    setIsAssignRiderModalOpen(false);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Order #{order.order_number}</h2>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Order Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div><span className="font-semibold">Order ID:</span> {order.id}</div>
                <div><span className="font-semibold">Payment Status:</span> <span className={`px-2 py-1 text-xs font-semibold text-white rounded-full ${isPaid ? 'bg-green-500' : 'bg-yellow-500'}`}>{isPaid ? 'Paid' : 'Pending'}</span></div>
                <div><span className="font-semibold">Payment Method:</span> Cash on Delivery</div>
                <div><span className="font-semibold">Order Status:</span> <span className="px-2 py-1 text-xs font-semibold text-white bg-blue-500 rounded-full">{currentOrderStatus}</span></div>
                <div><span className="font-semibold">Order Date:</span> {new Date(order.created_at).toLocaleDateString()}</div>
                <div><span className="font-semibold">Delivery Date:</span> {order.delivered_at ? new Date(order.delivered_at).toLocaleDateString() : 'N/A'}</div>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Product List</h3>
              <table className="w-full text-left">
                <thead>
                  <tr>
                    <th className="pb-2">Product</th>
                    <th className="pb-2">Quantity</th>
                    <th className="pb-2">Price</th>
                    <th className="pb-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map(item => (
                    <tr key={item.id} className="border-b">
                      <td className="py-2 flex items-center">
                        <img src={item.image_url || '/placeholder.svg'} alt={item.product_name} className="w-12 h-12 object-cover rounded-md mr-4" />
                        <div>
                          <div>{item.product_name}</div>
                          <div className="text-sm text-gray-500">{item.variant_title}</div>
                        </div>
                      </td>
                      <td>{item.quantity}</td>
                      <td>${item.unit_price.toFixed(2)}</td>
                      <td className="text-right">${item.total_price.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <div className="w-full md:w-1/2">
                <div className="flex justify-between py-2">
                  <span>Subtotal</span>
                  <span>${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span>Tax</span>
                  <span>${order.tax_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span>Shipping</span>
                  <span>${order.shipping_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 font-bold text-lg border-t mt-2">
                  <span>Total</span>
                  <span>${order.total_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Customer Info</h3>
            <p><span className="font-semibold">Name:</span> {order.customer?.first_name} {order.customer?.last_name}</p>
            <p><span className="font-semibold">Phone:</span> {order.customer?.phone}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Shipping Address</h3>
            <address className="not-italic">
              {order.shipping_address?.first_name} {order.shipping_address?.last_name}<br />
              {order.shipping_address?.address_1}<br />
              {order.shipping_address?.address_2 && <>{order.shipping_address?.address_2}<br /></>}
              {order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.postal_code}<br />
              {order.shipping_address?.country}
            </address>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-4">Order & Shipping Info</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="order-status">Change Order Status</Label>
                  <Select value={currentOrderStatus} onValueChange={(value: OrderStatus) => handleChangeOrderStatus(value)}>
                    <SelectTrigger id="order-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="payment-status">Payment Status (Paid)</Label>
                  <Switch
                    id="payment-status"
                    checked={isPaid}
                    onCheckedChange={handleTogglePaymentStatus}
                  />
                </div>
                <Button className="w-full" onClick={() => setIsAssignRiderModalOpen(true)}>
                  Assign Rider
                </Button>
              </div>
          </div>
        </div>
      </div>
      <AssignRiderModal
        isOpen={isAssignRiderModalOpen}
        onClose={() => setIsAssignRiderModalOpen(false)}
        onAssign={handleAssignRider}
        orderId={order.order_number}
      />
    </>
  );
};

export default OrderDetails;
