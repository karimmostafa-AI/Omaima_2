import { GET as getCategoriesRoute } from '@/app/api/categories/route';
import { getCategories } from '@/lib/services/category-service';
import { createRequest } from '@/lib/test-utils';

// Mock the CategoryService
vi.mock('@/lib/services/category-service');

describe('/api/categories', () => {
  const mockCategories = [
    { id: '1', name: 'Category 1', slug: 'cat-1' },
    { id: '2', name: 'Category 2', slug: 'cat-2' },
  ];

  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('GET /', () => {
    it('should return a list of categories', async () => {
      vi.mocked(getCategories).mockResolvedValue({ categories: mockCategories, total: 2 } as any);

      const req = createRequest('GET', '/api/categories');
      const response = await getCategoriesRoute(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.categories).toEqual(mockCategories);
      expect(getCategories).toHaveBeenCalledTimes(1);
    });
  });
});
