import { prisma } from '@/lib/db'
import type { Category } from '.prisma/client'

export interface CategoryCreateData {
  name: string
}

export class CategoryService {
  // Get all categories
  static async getCategories() {
    return await prisma.category.findMany({
      orderBy: { name: 'asc' }
    })
  }

  // Get category by ID
  static async getCategory(id: string) {
    return await prisma.category.findUnique({
      where: { id }
    })
  }

  // Create new category (Admin only)
  static async createCategory(data: CategoryCreateData) {
    return await prisma.category.create({
      data
    })
  }

  // Update category (Admin only)
  static async updateCategory(id: string, data: Partial<CategoryCreateData>) {
    return await prisma.category.update({
      where: { id },
      data
    })
  }

  // Delete category (Admin only)
  static async deleteCategory(id: string) {
    return await prisma.category.delete({
      where: { id }
    })
  }
}

// Named exports for compatibility
export const getCategories = CategoryService.getCategories;
export const getCategoryById = CategoryService.getCategory;
export const createCategory = CategoryService.createCategory;
export const updateCategory = CategoryService.updateCategory;
export const deleteCategory = CategoryService.deleteCategory;
