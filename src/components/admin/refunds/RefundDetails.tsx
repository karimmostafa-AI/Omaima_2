"use client";

import React from 'react';
import { Refund } from '@/types';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface RefundDetailsProps {
  refund: Refund | null;
  isOpen: boolean;
  onClose: () => void;
}

const RefundDetails = ({ refund, isOpen, onClose }: RefundDetailsProps) => {
  if (!refund) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full md:w-1/2 lg:w-1/3">
        <SheetHeader>
          <SheetTitle>Refund Details: #{refund.id}</SheetTitle>
          <SheetDescription>
            Detailed information about the refund request.
          </SheetDescription>
        </SheetHeader>
        <div className="py-6 space-y-6">
          <div>
            <h4 className="font-semibold mb-2">Refund Information</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><strong>Order ID:</strong> {refund.orderId}</div>
              <div><strong>Return Date:</strong> {new Date(refund.returnDate).toLocaleDateString()}</div>
              <div><strong>Amount:</strong> ${refund.amount.toFixed(2)}</div>
              <div><strong>Status:</strong> <Badge>{refund.status}</Badge></div>
              <div><strong>Payment Status:</strong> <Badge variant="secondary">{refund.paymentStatus}</Badge></div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Customer Details</h4>
            <div className="text-sm">
              <p><strong>Name:</strong> {refund.customer.name}</p>
              <p><strong>Email:</strong> {refund.customer.email}</p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Items to be Returned</h4>
            <ul className="text-sm space-y-2">
              {refund.items.map(item => (
                <li key={item.productId} className="flex justify-between">
                  <span>{item.name} (x{item.quantity})</span>
                  <span>${item.price.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Reason for Return</h4>
            <p className="text-sm">{refund.reason}</p>
          </div>
          {refund.notes && (
            <div>
              <h4 className="font-semibold mb-2">Admin Notes</h4>
              <p className="text-sm bg-gray-100 p-2 rounded-md">{refund.notes}</p>
            </div>
          )}
          <div className="pt-4">
            <Button className="w-full">Process Refund</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default RefundDetails;
