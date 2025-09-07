import { NextRequest, NextResponse } from 'next/server';
import { MediaService } from '@/lib/services/media-service';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: 'Media ID is required' }, { status: 400 });
    }

    await MediaService.deleteMedia(id);

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error(`Error deleting media item ${params.id}:`, error);
    if (error.message === 'Media not found') {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to delete media item' }, { status: 500 });
  }
}
