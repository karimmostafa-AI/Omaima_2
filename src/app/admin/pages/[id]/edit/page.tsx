'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PageForm } from '@/components/cms/page-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CMSContent } from '@prisma/client';

async function getPage(id: string): Promise<CMSContent> {
  const response = await fetch(`/api/pages/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch page');
  }
  return response.json();
}

async function updatePage(id: string, data: any) {
  const response = await fetch(`/api/pages/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to update page');
  }
  return response.json();
}

export default function EditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [page, setPage] = useState<CMSContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchPage = async () => {
        setIsFetching(true);
        try {
          const data = await getPage(id);
          setPage(data);
        } catch (error) {
          console.error(error);
        } finally {
          setIsFetching(false);
        }
      };
      fetchPage();
    }
  }, [id]);

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      await updatePage(id, data);
      router.push('/admin/pages');
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return <div className="p-6">Loading...</div>;
  }

  if (!page) {
    return <div className="p-6">Page not found.</div>;
  }

  return (
    <div className="p-6">
       <Card>
        <CardHeader>
          <CardTitle>Edit Page: {page.title}</CardTitle>
        </CardHeader>
        <CardContent>
            <PageForm initialData={page} onSubmit={handleSubmit} isLoading={isLoading} />
        </CardContent>
      </Card>
    </div>
  );
}
