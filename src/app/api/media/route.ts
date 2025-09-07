import { NextRequest, NextResponse } from 'next/server';
import { MediaService } from '@/lib/services/media-service';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { mkdir } from 'fs/promises';

// GET handler to list all media
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const result = await MediaService.getMedia(page, limit);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching media:', error);
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 });
  }
}

// POST handler to upload a new image
export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Ensure the upload directory exists
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'media');
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error: any) {
      if (error.code !== 'EEXIST') {
        throw error;
      }
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a unique filename
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const fileName = `${uniqueSuffix}-${file.name.replace(/\s/g, '_')}`;
    const filePath = join(uploadDir, fileName);

    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/media/${fileName}`;

    const newMedia = await MediaService.createMedia({
      fileName: file.name,
      url: fileUrl,
      size: file.size,
      // Note: width and height would require a library like 'sharp' or 'jimp'
      // to be determined on the server. This is omitted for simplicity for now.
    });

    return NextResponse.json(newMedia, { status: 201 });
  } catch (error) {
    console.error('Failed to upload file:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
