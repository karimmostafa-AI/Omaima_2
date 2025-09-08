import { GET as getProducts, POST } from '@/app/api/products/route';
import { GET as getProductById, PUT, DELETE } from '@/app/api/products/[id]/route';
import { ProductService } from '@/lib/services/product-service';
import { createRequest } from '@/lib/test-utils';
import { ProductType, ProductStatus } from '@prisma/client';
import { getCurrentUser, isAdmin } from '@/lib/auth';

// Mock dependencies
vi.mock('@/lib/services/product-service', () => ({
  ProductService: {
    getProducts: vi.fn(),
    getProduct: vi.fn(),
    createProduct: vi.fn(),
    updateProduct: vi.fn(),
    deleteProduct: vi.fn(),
  },
}));
vi.mock('@/lib/auth');

vi.mock('@prisma/client', () => ({
  ProductType: {
    STANDARD: 'STANDARD',
  },
  ProductStatus: {
    ACTIVE: 'ACTIVE',
    DRAFT: 'DRAFT',
  },
  PrismaClient: vi.fn(),
}));

describe('/api/products', () => {
  const mockProducts = [
    { id: '1', name: 'Product 1', price: 100, slug: 'prod-1' },
    { id: '2', name: 'Product 2', price: 200, slug: 'prod-2' },
  ];
  const adminUser = { id: 'admin-user', role: 'ADMIN' };

  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(getCurrentUser).mockResolvedValue(adminUser);
    vi.mocked(isAdmin).mockReturnValue(true);
  });

  describe('GET /', () => {
    it('should return a list of products', async () => {
      vi.mocked(ProductService.getProducts).mockResolvedValue({ products: mockProducts, pagination: { total: 2 } } as any);

      const req = createRequest('GET', '/api/products');
      const response = await getProducts(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.products).toEqual(mockProducts);
    });
  });

  describe('GET /[id]', () => {
    it('should return a single product if found', async () => {
      const product = mockProducts[0];
      vi.mocked(ProductService.getProduct).mockResolvedValue(product as any);

      const req = createRequest('GET', `/api/products/${product.id}`);
      const response = await getProductById(req, { params: { id: product.id } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(product);
    });

    it('should return 404 if product not found', async () => {
      vi.mocked(ProductService.getProduct).mockResolvedValue(null);
      const req = createRequest('GET', '/api/products/999');
      const response = await getProductById(req, { params: { id: '999' } });
      expect(response.status).toBe(404);
    });
  });

  describe('POST /', () => {
    it('should create a product and return it', async () => {
        const newProductData = {
            name: 'New Gadget',
            slug: 'new-gadget',
            price: 99.99,
            categoryIds: ['cat1'],
            basePrice: 99.99,
            estimatedDeliveryDays: 3,
            type: ProductType.STANDARD,
            status: ProductStatus.DRAFT,
            requiresShipping: true,
            taxable: true,
            trackQuantity: true,
            quantity: 100,
            images: [{ url: 'http://example.com/image.png', position: 1 }],
        };
        const createdProduct = { id: '3', ...newProductData };

        vi.mocked(ProductService.createProduct).mockResolvedValue(createdProduct as any);

        const req = createRequest('POST', '/api/products', newProductData);
        const response = await POST(req);
        const data = await response.json();

        expect(response.status).toBe(201);
        expect(data).toEqual(createdProduct);
    });
  });

  describe('PUT /[id]', () => {
    it('should update a product and return it', async () => {
      const updatedProductData = { name: 'Updated Gadget' };
      const updatedProduct = { ...mockProducts[0], ...updatedProductData };
      vi.mocked(ProductService.updateProduct).mockResolvedValue(updatedProduct as any);

      const req = createRequest('PUT', `/api/products/1`, updatedProductData);
      const response = await PUT(req, { params: { id: '1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(updatedProduct);
    });
  });

  describe('DELETE /[id]', () => {
    it('should delete a product and return 204', async () => {
      vi.mocked(ProductService.deleteProduct).mockResolvedValue({} as any);

      const req = createRequest('DELETE', '/api/products/1');
      const response = await DELETE(req, { params: { id: '1' } });

      expect(response.status).toBe(204);
    });
  });
});
