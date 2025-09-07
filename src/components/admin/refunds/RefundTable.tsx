"use client";

import React from 'react';
import { Refund } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

interface RefundTableProps {
  refunds: Refund[];
  total: number;
  page: number;
  limit: number;
}

const RefundTable = ({ refunds, total, page, limit }: RefundTableProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const totalPages = Math.ceil(total / limit);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {refunds.length > 0 ? (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Refund ID</TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Return Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {refunds.map(refund => (
                <TableRow key={refund.id}>
                  <TableCell className="font-medium">{refund.id}</TableCell>
                  <TableCell>
                    <Link href={`/admin/orders/${refund.orderId}`} className="text-blue-600 hover:underline">
                      {refund.orderId}
                    </Link>
                  </TableCell>
                  <TableCell>{new Date(refund.returnDate).toLocaleDateString()}</TableCell>
                  <TableCell>{refund.customer.name}</TableCell>
                  <TableCell>${refund.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={refund.status === 'completed' ? 'default' : 'secondary'}>{refund.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={refund.paymentStatus === 'refunded' ? 'default' : 'secondary'}>{refund.paymentStatus}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">View Details</Button>
                      <Button size="sm">Process Refund</Button>
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
          <p>No refunds found.</p>
        </div>
      )}
    </div>
  );
};

export default RefundTable;
