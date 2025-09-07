"use client";

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Order, OrderStatus } from '@/types';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import Link from 'next/link';

interface OrdersListProps {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
}

const orderStatuses: (OrderStatus | 'all')[] = ['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

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
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <Tabs value={currentStatus} onValueChange={handleTabChange}>
        <TabsList>
          {orderStatuses.map(status => (
            <TabsTrigger key={status} value={status} className="capitalize">
              {status}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="mt-6">
        {orders.length > 0 ? (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Order Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map(order => (
                  <TableRow key={order.id}>
                    <TableCell>#{order.order_number}</TableCell>
                    <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>{order.customer?.first_name} {order.customer?.last_name}</TableCell>
                    <TableCell>
                      <div>${order.total_amount.toFixed(2)}</div>
                      <Badge variant={order.financial_status === 'paid' ? 'default' : 'secondary'}>
                        {order.financial_status}
                      </Badge>
                    </TableCell>
                    <TableCell>Cash on Delivery</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Link href={`/admin/orders/${order.id}`} passHref>
                          <Button variant="outline" size="sm">View Details</Button>
                        </Link>
                        <Button variant="outline" size="sm">Download Invoice</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious onClick={() => handlePageChange(page - 1)} />
                  </PaginationItem>
                  {[...Array(totalPages)].map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink isActive={page === i + 1} onClick={() => handlePageChange(i + 1)}>
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext onClick={() => handlePageChange(page + 1)} />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p>No order found for this status.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersList;
