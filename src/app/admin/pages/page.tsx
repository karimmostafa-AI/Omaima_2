'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { CMSContent, ContentStatus } from '@prisma/client';

async function getPages(): Promise<{ data: CMSContent[] }> {
  const response = await fetch('/api/pages');
  if (!response.ok) {
    throw new Error('Failed to fetch pages');
  }
  return response.json();
}

async function deletePage(id: string): Promise<void> {
  const response = await fetch(`/api/pages/${id}`, { method: 'DELETE' });
  if (!response.ok) {
    throw new Error('Failed to delete page');
  }
}

export default function AdminPagesListPage() {
  const [pages, setPages] = useState<CMSContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPages = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getPages();
      setPages(result.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const handleDelete = async (id: string) => {
      if (window.confirm('Are you sure you want to delete this page?')) {
          try {
              await deletePage(id);
              fetchPages();
          } catch(error) {
              console.error(error);
          }
      }
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Pages</CardTitle>
          <Button asChild>
            <Link href="/admin/pages/create">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Page
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
                  <TableHead>Title</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pages.map((page) => (
                  <TableRow key={page.id}>
                    <TableCell className="font-medium">{page.title}</TableCell>
                    <TableCell>/ {page.slug}</TableCell>
                    <TableCell>
                      <Badge variant={page.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                        {page.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(page.updatedAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" asChild>
                         <Link href={`/admin/pages/${page.id}/edit`}>
                           <Edit className="h-4 w-4" />
                         </Link>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(page.id)}>
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
  );
}
