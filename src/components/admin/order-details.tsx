"use client";

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Order, OrderStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, FileText, CreditCard, Package, MapPin, User, Phone } from 'lucide-react';
import AssignRiderModal from './assign-rider-modal';

interface OrderDetailsProps {
  order: Order;
}

const OrderDetails = ({ order }: OrderDetailsProps) => {
  const router = useRouter();
  const [isUpdating, startTransition] = useTransition();
  const [currentOrderStatus, setCurrentOrderStatus] = useState<OrderStatus>(order.status);
  const [isPaid, setIsPaid] = useState(order.financial_status === 'paid');
  const [isAssignRiderModalOpen, setIsAssignRiderModalOpen] = useState(false);

  const handleUpdate = (payload: any) => {
    startTransition(async () => {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        router.refresh();
      } else {
        // TODO: Add proper error handling with toasts
        console.error("Failed to update order");
      }
    });
  };

  const handleChangeOrderStatus = (status: OrderStatus) => {
    setCurrentOrderStatus(status);
    handleUpdate({ action: 'change_status', status });
  };

  const handleTogglePaymentStatus = (checked: boolean) => {
    setIsPaid(checked);
    handleUpdate({ action: 'change_payment_status', isPaid: checked });
  };

  const handleAssignRider = (riderId: string) => {
    handleUpdate({ action: 'assign_rider', riderId });
    setIsAssignRiderModalOpen(false);
  };

  const handleDownloadInvoice = async () => {
    try {
      const response = await fetch(`/api/admin/orders/${order.id}/invoice`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${order.order_number}.txt`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading invoice:', error);
    }
  };

  const handleDownloadPaymentSlip = async () => {
    try {
      const response = await fetch(`/api/admin/orders/${order.id}/payment-slip`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `payment-slip-${order.order_number}.txt`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading payment slip:', error);
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'partially_paid': return 'bg-orange-100 text-orange-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header Section */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold">Order #{order.order_number}</CardTitle>
                <p className="text-muted-foreground mt-1">
                  Order placed on {new Date(order.created_at).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleDownloadPaymentSlip}
                  className="flex items-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  Payment Slip
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleDownloadInvoice}
                  className="flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Invoice
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Order Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Order ID:</span>
                      <span className="font-mono text-sm">{order.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payment Method:</span>
                      <span>Cash on Delivery</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Order Date:</span>
                      <span>{new Date(order.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Payment Status:</span>
                      <Badge className={getPaymentStatusColor(order.financial_status)}>
                        {formatStatus(order.financial_status)}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Order Status:</span>
                      <Badge className={getStatusColor(currentOrderStatus)}>
                        {formatStatus(currentOrderStatus)}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Delivery Date:</span>
                      <span>{order.delivered_at ? new Date(order.delivered_at).toLocaleDateString() : 'Not delivered yet'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product List */}
            <Card>
              <CardHeader>
                <CardTitle>Product List</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Image</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead className="w-20">Quantity</TableHead>
                      <TableHead className="w-24">Size</TableHead>
                      <TableHead className="w-24">Color</TableHead>
                      <TableHead className="w-28 text-right">Price</TableHead>
                      <TableHead className="w-28 text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <img 
                            src={item.image_url || '/placeholder.svg'} 
                            alt={item.product_name}
                            className="w-12 h-12 object-cover rounded-md border"
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.product_name}</div>
                            {item.variant_title && (
                              <div className="text-sm text-muted-foreground">{item.variant_title}</div>
                            )}
                            <div className="text-xs text-muted-foreground">SKU: {item.sku}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{item.quantity}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">L</Badge> {/* Mock size */}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full bg-blue-500 border"></div> {/* Mock color */}
                            <span className="text-sm">Blue</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">${item.unit_price.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-medium">${item.total_price.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Order Totals */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span>${order.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Coupon Discount:</span>
                    <span className="text-green-600">-${order.discount_amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery Charge:</span>
                    <span>${order.shipping_amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">VAT & Tax:</span>
                    <span>${order.tax_amount.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Grand Total:</span>
                    <span>${order.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Customer Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">
                    {order.customer?.firstName} {order.customer?.lastName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span>{order.customer?.phone || 'No phone provided'}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {order.email}
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <address className="not-italic text-sm leading-relaxed">
                  <div className="font-medium">
                    {order.shipping_address?.first_name} {order.shipping_address?.last_name}
                  </div>
                  <div className="mt-1 space-y-1 text-muted-foreground">
                    <div>{order.shipping_address?.address_1}</div>
                    {order.shipping_address?.address_2 && (
                      <div>{order.shipping_address.address_2}</div>
                    )}
                    <div>
                      {order.shipping_address?.city}, {order.shipping_address?.state} {order.shipping_address?.postal_code}
                    </div>
                    <div>{order.shipping_address?.country}</div>
                  </div>
                </address>
              </CardContent>
            </Card>

            {/* Order & Shipping Controls */}
            <Card>
              <CardHeader>
                <CardTitle>Order & Shipping Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="order-status">Change Order Status</Label>
                  <Select 
                    value={currentOrderStatus} 
                    onValueChange={(value: OrderStatus) => handleChangeOrderStatus(value)} 
                    disabled={isUpdating}
                  >
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
                
                <div className="flex items-center justify-between py-2">
                  <Label htmlFor="payment-status" className="text-sm font-medium">
                    Payment Status (Paid)
                  </Label>
                  <Switch
                    id="payment-status"
                    checked={isPaid}
                    onCheckedChange={handleTogglePaymentStatus}
                    disabled={isUpdating}
                  />
                </div>

                <Button 
                  className="w-full" 
                  onClick={() => setIsAssignRiderModalOpen(true)} 
                  disabled={isUpdating}
                  variant="outline"
                >
                  <Package className="w-4 h-4 mr-2" />
                  Assign Rider
                </Button>
              </CardContent>
            </Card>
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
