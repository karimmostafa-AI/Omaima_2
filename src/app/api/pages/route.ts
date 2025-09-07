import { NextRequest, NextResponse } from 'next/server';
import { CmsService } from '@/lib/services/cms-service';
import { z } from 'zod';
import { ContentStatus } from '@prisma/client';

// GET handler to list all pages
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const result = await CmsService.getCmsContentList(page, limit);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching pages:', error);
    return NextResponse.json({ error: 'Failed to fetch pages' }, { status: 500 });
  }
}

const pageCreateSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with dashes'),
  content: z.string().min(1, 'Content is required'),
  status: z.nativeEnum(ContentStatus).optional(),
  excerpt: z.string().optional(),
});

// POST handler to create a new page
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = pageCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid page data', details: validation.error.flatten() }, { status: 400 });
    }

    const newPage = await CmsService.createCmsContent(validation.data);
    return NextResponse.json(newPage, { status: 201 });
  } catch (error) {
    console.error('Failed to create page:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
