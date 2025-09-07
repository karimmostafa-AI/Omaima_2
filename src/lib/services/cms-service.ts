import { prisma } from '@/lib/supabase';
import { CMSContent, ContentStatus } from '@prisma/client';

export interface CmsContentCreateData {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  status?: ContentStatus;
  seo?: object;
}

export interface CmsContentUpdateData extends Partial<CmsContentCreateData> {}

export class CmsService {
  /**
   * Get a paginated list of all CMS content.
   */
  static async getCmsContentList(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [content, total] = await Promise.all([
      prisma.cMSContent.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.cMSContent.count(),
    ]);

    return {
      data: content,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single CMS content item by its ID.
   */
  static async getCmsContent(id: string): Promise<CMSContent | null> {
    return prisma.cMSContent.findUnique({
      where: { id },
    });
  }

  /**
   * Create a new CMS content item.
   */
  static async createCmsContent(data: CmsContentCreateData): Promise<CMSContent> {
    return prisma.cMSContent.create({
      data,
    });
  }

  /**
   * Update an existing CMS content item.
   */
  static async updateCmsContent(id: string, data: CmsContentUpdateData): Promise<CMSContent> {
    return prisma.cMSContent.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete a CMS content item.
   */
  static async deleteCmsContent(id: string): Promise<CMSContent> {
    return prisma.cMSContent.delete({
      where: { id },
    });
  }
}
