"use client";

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefundStatus } from '@/types';

const refundStatuses: (RefundStatus | 'all')[] = ['all', 'pending', 'approved', 'rejected', 'completed'];

const RefundFilters = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get('status') || 'all';
  const currentSearch = searchParams.get('search') || '';

  const handleTabChange = (status: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('status', status);
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const params = new URLSearchParams(searchParams);
    params.set('search', event.target.value);
    params.set('page', '1');
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <Tabs value={currentStatus} onValueChange={handleTabChange}>
        <TabsList>
          {refundStatuses.map(status => (
            <TabsTrigger key={status} value={status} className="capitalize">
              {status}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <div className="w-1/3">
        <Input
          placeholder="Search by ID, customer, or order..."
          value={currentSearch}
          onChange={handleSearchChange}
        />
      </div>
    </div>
  );
};

export default RefundFilters;
