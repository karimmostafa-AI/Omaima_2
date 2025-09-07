"use client";

import React, { useState, useTransition } from 'react';
import { Refund, RefundStatus } from '@/types';
import RefundFilters from './RefundFilters';
import RefundTable from './RefundTable';
import StatusUpdateModal from './StatusUpdateModal';
import RefundDetails from './RefundDetails';
import { useRouter } from 'next/navigation';

interface RefundsPageClientProps {
  initialRefunds: Refund[];
  total: number;
  page: number;
  limit: number;
}

const RefundsPageClient = ({ initialRefunds, total, page, limit }: RefundsPageClientProps) => {
  const [refunds, setRefunds] = useState(initialRefunds);
  const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isUpdating, startTransition] = useTransition();
  const router = useRouter();

  const handleProcessRefund = (refund: Refund) => {
    setSelectedRefund(refund);
    setIsModalOpen(true);
  };

  const handleViewDetails = (refund: Refund) => {
    setSelectedRefund(refund);
    setIsDetailsOpen(true);
  };

  const handleUpdateStatus = async (refundId: string, status: RefundStatus, notes: string) => {
    startTransition(async () => {
      const response = await fetch(`/api/admin/refunds/${refundId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, notes }),
      });
      if (response.ok) {
        const updatedRefund = await response.json();
        setRefunds(refunds.map(r => r.id === refundId ? updatedRefund : r));
        setIsModalOpen(false);
        router.refresh();
      } else {
        // Handle error
        console.error('Failed to update refund status');
      }
    });
  };

  return (
    <>
      <RefundFilters />
      <RefundTable
        refunds={refunds}
        total={total}
        page={page}
        limit={limit}
        onViewDetails={handleViewDetails}
        onProcessRefund={handleProcessRefund}
      />
      <StatusUpdateModal
        refund={selectedRefund}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpdate={handleUpdateStatus}
        isUpdating={isUpdating}
      />
      <RefundDetails
        refund={selectedRefund}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />
    </>
  );
};

export default RefundsPageClient;
