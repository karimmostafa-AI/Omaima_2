import { Category } from '@/types';

// In a real app, you'd use a function from a utility library.
const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
};

let mockCategories: Category[] = [
  {
    id: 'cat_1',
    name: 'T-Shirts',
    slug: 't-shirts',
    description: 'A variety of T-shirts for all occasions.',
    image: '/placeholder-image.jpg',
    parent_id: null,
    position: 1,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cat_2',
    name: 'Jeans',
    slug: 'jeans',
    description: 'Durable and stylish jeans.',
    image: '/placeholder-image.jpg',
    parent_id: null,
    position: 2,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'cat_3',
    name: 'Jackets',
    slug: 'jackets',
    description: 'Jackets for all seasons.',
    image: '/placeholder-image.jpg',
    parent_id: null,
    position: 3,
    is_active: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

interface GetCategoriesParams {
  page?: number;
  limit?: number;
}

export const getCategories = async ({ page = 1, limit = 10 }: GetCategoriesParams = {}): Promise<{ categories: Category[], total: number }> => {
  const paginatedCategories = mockCategories.slice((page - 1) * limit, page * limit);
  return Promise.resolve({ categories: paginatedCategories, total: mockCategories.length });
};

export const getCategoryById = async (id: string): Promise<Category | null> => {
  const category = mockCategories.find(c => c.id === id);
  return Promise.resolve(category || null);
};

export const createCategory = async (data: Omit<Category, 'id' | 'slug' | 'created_at' | 'updated_at' | 'position'>): Promise<Category> => {
  const newCategory: Category = {
    ...data,
    id: `cat_${Date.now()}`,
    slug: slugify(data.name),
    position: mockCategories.length + 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  mockCategories.push(newCategory);
  return Promise.resolve(newCategory);
};

export const updateCategory = async (id: string, data: Partial<Omit<Category, 'id' | 'slug' | 'created_at' | 'updated_at'>>): Promise<Category | null> => {
  const categoryIndex = mockCategories.findIndex(c => c.id === id);
  if (categoryIndex === -1) {
    return null;
  }
  const updatedCategory = {
    ...mockCategories[categoryIndex],
    ...data,
    slug: data.name ? slugify(data.name) : mockCategories[categoryIndex].slug,
    updated_at: new Date().toISOString()
  };
  mockCategories[categoryIndex] = updatedCategory;
  return Promise.resolve(updatedCategory);
};
