import { NextRequest, NextResponse } from 'next/server';
import { CmsService } from '@/lib/services/cms-service';
import { z } from 'zod';
import { ContentStatus } from '@prisma/client';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET handler for a single page
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const page = await CmsService.getCmsContent(params.id);
    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }
    return NextResponse.json(page);
  } catch (error) {
    console.error(`Error fetching page ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to fetch page' }, { status: 500 });
  }
}

const pageUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with dashes').optional(),
  content: z.string().min(1, 'Content is required').optional(),
  status: z.nativeEnum(ContentStatus).optional(),
  excerpt: z.string().optional(),
});

// PUT handler to update a page
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await request.json();
    const validation = pageUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid page data', details: validation.error.flatten() }, { status: 400 });
    }

    const updatedPage = await CmsService.updateCmsContent(params.id, validation.data);
    return NextResponse.json(updatedPage);
  } catch (error) {
    console.error(`Error updating page ${params.id}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE handler to delete a page
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await CmsService.deleteCmsContent(params.id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`Error deleting page ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to delete page' }, { status: 500 });
  }
}
