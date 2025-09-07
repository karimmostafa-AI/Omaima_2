import { prisma } from '@/lib/supabase';
import { Media } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

export interface MediaCreateData {
  fileName: string;
  url: string;
  altText?: string;
  size: number;
  width?: number;
  height?: number;
}

export class MediaService {
  /**
   * Get all media items with pagination.
   */
  static async getMedia(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [media, total] = await Promise.all([
      prisma.media.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.media.count(),
    ]);

    return {
      data: media,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Create a new media record in the database.
   */
  static async createMedia(data: MediaCreateData): Promise<Media> {
    return prisma.media.create({
      data,
    });
  }

  /**
   * Delete a media item from the database and the filesystem.
   */
  static async deleteMedia(id: string): Promise<Media> {
    // 1. Find the media record
    const media = await prisma.media.findUnique({
      where: { id },
    });

    if (!media) {
      throw new Error('Media not found');
    }

    // 2. Delete the file from the filesystem
    try {
      const filePath = path.join(process.cwd(), 'public', media.url);
      await fs.unlink(filePath);
    } catch (error: any) {
      // Log the error but don't block deletion of the DB record
      // The file might have been deleted manually already.
      console.error(`Failed to delete file from filesystem: ${media.url}`, error);
    }

    // 3. Delete the media record from the database
    return prisma.media.delete({
      where: { id },
    });
  }
}
