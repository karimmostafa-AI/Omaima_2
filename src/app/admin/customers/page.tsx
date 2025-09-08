'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlusCircle, Edit, Trash2, KeyRound } from 'lucide-react';
import { User } from '@prisma/client';
import { ResetPasswordModal } from '@/components/users/reset-password-modal';

type SafeUser = Omit<User, 'passwordHash'>;

async function getCustomers(): Promise<{ data: SafeUser[] }> {
  const response = await fetch('/api/users?role=CUSTOMER');
  if (!response.ok) {
    throw new Error('Failed to fetch customers');
  }
  return response.json();
}

async function deleteCustomer(id: string): Promise<void> {
  const response = await fetch(`/api/users/${id}`, { method: 'DELETE' });
  if (!response.ok) {
    throw new Error('Failed to delete customer');
  }
}

export default function AdminCustomersListPage() {
  const [customers, setCustomers] = useState<SafeUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getCustomers();
      setCustomers(result.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleDelete = async (id: string) => {
      if (window.confirm('Are you sure you want to delete this customer?')) {
          try {
              await deleteCustomer(id);
              fetchCustomers();
          } catch(error) {
              console.error(error);
          }
      }
  }

  const openResetPasswordModal = (id: string) => {
      setSelectedCustomerId(id);
      setIsModalOpen(true);
  }

  return (
    <>
      <ResetPasswordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userId={selectedCustomerId}
      />
      <div className="p-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>All Customers</CardTitle>
            <Button asChild>
              <Link href="/admin/customers/create">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create New Customer
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Loading...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Profile</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer, index) => (
                    <TableRow key={customer.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <Avatar>
                          <AvatarImage src={customer.avatarUrl || ''} alt={customer.firstName || ''} />
                          <AvatarFallback>{customer.firstName?.[0]}{customer.lastName?.[0]}</AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell className="font-medium">{customer.firstName} {customer.lastName}</TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell>{customer.phone || 'N/A'}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openResetPasswordModal(customer.id)}>
                           <KeyRound className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                           <Link href={`/admin/customers/${customer.id}/edit`}>
                             <Edit className="h-4 w-4" />
                           </Link>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(customer.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
