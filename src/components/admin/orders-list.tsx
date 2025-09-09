"use client";

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Order, OrderStatus } from '@/types';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Eye, Package, Clock, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

interface OrdersListProps {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
}

const orderStatuses: (OrderStatus | 'all')[] = [
  'all',
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled'
];

const statusIcons = {
  pending: Clock,
  confirmed: CheckCircle,
  processing: Package,
  shipped: Package,
  delivered: CheckCircle,
  cancelled: XCircle,
};

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  confirmed: 'bg-blue-100 text-blue-800 border-blue-300',
  processing: 'bg-purple-100 text-purple-800 border-purple-300',
  shipped: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  delivered: 'bg-green-100 text-green-800 border-green-300',
  cancelled: 'bg-red-100 text-red-800 border-red-300',
};

const paymentStatusColors = {
  paid: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  partially_paid: 'bg-orange-100 text-orange-800',
  refunded: 'bg-gray-100 text-gray-800',
  partially_refunded: 'bg-gray-100 text-gray-800',
  voided: 'bg-red-100 text-red-800',
};

const getStatusLabel = (status: string) => {
  return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const OrdersList = ({ orders, total, page, limit }: OrdersListProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get('status') || 'all';

  const handleTabChange = (status: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('status', status);
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  const totalPages = Math.ceil(total / limit);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    router.push(`?${params.toString()}`);
  };

  const handleDownloadInvoice = async (orderId: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/invoice`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${orderId}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else {
        console.error('Failed to download invoice');
      }
    } catch (error) {
      console.error('Error downloading invoice:', error);
    }
  };

  const getOrderStatusCount = (status: OrderStatus | 'all') => {
    if (status === 'all') return total;
    return orders.filter(order => order.status === status).length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">
            Manage and track all your orders from one place.
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          {total} total orders
        </div>
      </div>

      {/* Status Tabs */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium">Filter by Status</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={currentStatus} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-7">
              {orderStatuses.map(status => {
                const count = getOrderStatusCount(status);
                return (
                  <TabsTrigger 
                    key={status} 
                    value={status} 
                    className="capitalize flex flex-col gap-1 py-3"
                  >
                    <span>{getStatusLabel(status)}</span>
                    <span className="text-xs opacity-70">({count})</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardContent className="p-0">
          {orders.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-32">Order ID</TableHead>
                      <TableHead className="w-36">Date</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead className="w-32">Status</TableHead>
                      <TableHead className="w-40">Total Amount</TableHead>
                      <TableHead className="w-32">Payment</TableHead>
                      <TableHead className="w-48 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map(order => {
                      const StatusIcon = statusIcons[order.status as keyof typeof statusIcons];
                      return (
                        <TableRow 
                          key={order.id} 
                          className="hover:bg-muted/50 transition-colors"
                        >
                          <TableCell className="font-mono text-sm">
                            {order.order_number}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">
                                {order.customer?.firstName} {order.customer?.lastName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {order.email}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={`${statusColors[order.status as keyof typeof statusColors]} border font-medium`}
                            >
                              {StatusIcon && <StatusIcon className="w-3 h-3 mr-1" />}
                              {getStatusLabel(order.status)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="font-semibold">
                              ${order.total_amount.toFixed(2)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {order.currency.toUpperCase()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="secondary" 
                              className={paymentStatusColors[order.financial_status as keyof typeof paymentStatusColors]}
                            >
                              {getStatusLabel(order.financial_status)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                asChild
                                className="h-8"
                              >
                                <Link href={`/admin/orders/${order.id}`}>
                                  <Eye className="w-4 h-4 mr-1" />
                                  View
                                </Link>
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleDownloadInvoice(order.id)}
                                className="h-8"
                              >
                                <Download className="w-4 h-4 mr-1" />
                                Invoice
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} orders
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page <= 1}
                    >
                      Previous
                    </Button>
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNumber = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                        if (pageNumber > totalPages) return null;
                        
                        return (
                          <Button
                            key={pageNumber}
                            variant={page === pageNumber ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(pageNumber)}
                            className="w-8 h-8 p-0"
                          >
                            {pageNumber}
                          </Button>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page >= totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Package className="w-12 h-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No orders found</h3>
              <p className="text-muted-foreground max-w-sm">
                {currentStatus === 'all' 
                  ? "There are no orders yet. When customers place orders, they'll appear here."
                  : `No orders with status "${getStatusLabel(currentStatus)}" were found.`
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrdersList;
