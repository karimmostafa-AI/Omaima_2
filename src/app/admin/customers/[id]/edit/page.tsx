'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { CustomerForm } from '@/components/users/customer-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from '@prisma/client';

type SafeUser = Omit<User, 'passwordHash'>;

async function getCustomer(id: string): Promise<SafeUser> {
  const response = await fetch(`/api/users/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch customer');
  }
  return response.json();
}

async function updateCustomer(id: string, data: any) {
  const response = await fetch(`/api/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update customer');
  }
  return response.json();
}

export default function EditCustomerPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [customer, setCustomer] = useState<SafeUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchCustomer = async () => {
        setIsFetching(true);
        try {
          const data = await getCustomer(id);
          setCustomer(data);
        } catch (error) {
          console.error(error);
        } finally {
          setIsFetching(false);
        }
      };
      fetchCustomer();
    }
  }, [id]);

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    setError(null);
    try {
      await updateCustomer(id, data);
      router.push('/admin/customers');
    } catch (err: any) {
      setError(err.message);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return <div className="p-6">Loading...</div>;
  }

  if (!customer) {
    return <div className="p-6">Customer not found.</div>;
  }

  return (
    <div className="p-6">
       <Card>
        <CardHeader>
          <CardTitle>Edit Customer: {customer.firstName} {customer.lastName}</CardTitle>
        </CardHeader>
        <CardContent>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <CustomerForm initialData={customer} onSubmit={handleSubmit} isLoading={isLoading} />
        </CardContent>
      </Card>
    </div>
  );
}
