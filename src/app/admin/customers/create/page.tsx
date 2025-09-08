'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CustomerForm } from '@/components/users/customer-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

async function createCustomer(data: any) {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create customer');
  }
  return response.json();
}

export default function CreateCustomerPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    setError(null);
    try {
      await createCustomer(data);
      router.push('/admin/customers');
    } catch (err: any) {
      setError(err.message);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
       <Card>
        <CardHeader>
          <CardTitle>Add New Customer</CardTitle>
        </CardHeader>
        <CardContent>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <CustomerForm onSubmit={handleSubmit} isLoading={isLoading} />
        </CardContent>
      </Card>
    </div>
  );
}
