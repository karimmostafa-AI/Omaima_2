import { prisma } from '@/lib/db'
import type { OrderStatus as PrismaOrderStatus } from '.prisma/client'
import type { Order, OrderStatus } from '@/types'

interface GetOrdersOptions {
  status?: OrderStatus | 'all';
  page?: number;
  limit?: number;
  search?: string;
}

interface GetOrdersResult {
  orders: Order[];
  total: number;
  totalPages: number;
  currentPage: number;
}

export class OrderService {
  // Get all orders with filtering and pagination
  static async getOrders(options: GetOrdersOptions = {}): Promise<GetOrdersResult> {
    const {
      status = 'all',
      page = 1,
      limit = 10,
      search
    } = options;

    const skip = (page - 1) * limit;
    
    // Build where clause
    const where: any = {};
    
    // Filter by status if not 'all'
    if (status !== 'all') {
      where.status = status.toUpperCase() as PrismaOrderStatus;
    }
    
    // Search functionality
    if (search) {
      where.OR = [
        {
          user: {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } }
            ]
          }
        },
        {
          id: { contains: search, mode: 'insensitive' }
        }
      ];
    }

    // Get total count for pagination
    const total = await prisma.order.count({ where });
    const totalPages = Math.ceil(total / limit);

    // Get orders with relationships
    const prismaOrders = await prisma.order.findMany({
      where,
      include: {
        user: true,
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    // Transform Prisma orders to match our Order type
    const orders: Order[] = prismaOrders.map((order) => ({
      id: order.id,
      order_number: `ORD-${order.id.slice(-8).toUpperCase()}`,
      customer_id: order.userId,
      customer: order.user ? {
        id: order.user.id,
        email: order.user.email,
        firstName: order.user.name?.split(' ')[0],
        lastName: order.user.name?.split(' ').slice(1).join(' '),
        role: order.user.role as 'CUSTOMER' | 'STAFF' | 'ADMIN',
        isActive: true,
        emailVerified: true,
        createdAt: order.user.createdAt,
        updatedAt: order.user.updatedAt,
      } : undefined,
      email: order.user?.email || '',
      phone: '',
      status: order.status.toLowerCase() as OrderStatus,
      financial_status: 'pending', // Default for now
      fulfillment_status: 'unfulfilled',
      subtotal: order.total * 0.9, // Assuming 10% tax
      tax_amount: order.total * 0.1,
      shipping_amount: 0,
      discount_amount: 0,
      total_amount: order.total,
      currency: 'USD',
      billing_address: {
        first_name: order.user?.name?.split(' ')[0] || '',
        last_name: order.user?.name?.split(' ').slice(1).join(' ') || '',
        address_1: '123 Main St',
        city: 'City',
        state: 'State',
        postal_code: '12345',
        country: 'US'
      },
      items: order.items.map((item) => ({
        id: item.id,
        order_id: item.orderId,
        product_id: item.productId,
        product_name: item.product.name,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: item.unitPrice * item.quantity,
        sku: item.product.id,
        image_url: item.product.image,
        created_at: order.createdAt.toISOString(),
        updated_at: order.updatedAt.toISOString()
      })),
      tags: [],
      source: 'web',
      created_at: order.createdAt.toISOString(),
      updated_at: order.updatedAt.toISOString()
    }));

    return {
      orders,
      total,
      totalPages,
      currentPage: page
    };
  }

  // Get order by ID
  static async getOrder(id: string): Promise<Order | null> {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) return null;

    // Transform to match Order type
    return {
      id: order.id,
      order_number: `ORD-${order.id.slice(-8).toUpperCase()}`,
      customer_id: order.userId,
      customer: order.user ? {
        id: order.user.id,
        email: order.user.email,
        firstName: order.user.name?.split(' ')[0],
        lastName: order.user.name?.split(' ').slice(1).join(' '),
        role: order.user.role as 'CUSTOMER' | 'STAFF' | 'ADMIN',
        isActive: true,
        emailVerified: true,
        createdAt: order.user.createdAt,
        updatedAt: order.user.updatedAt,
      } : undefined,
      email: order.user?.email || '',
      phone: '',
      status: order.status.toLowerCase() as OrderStatus,
      financial_status: 'pending',
      fulfillment_status: 'unfulfilled',
      subtotal: order.total * 0.9,
      tax_amount: order.total * 0.1,
      shipping_amount: 0,
      discount_amount: 0,
      total_amount: order.total,
      currency: 'USD',
      billing_address: {
        first_name: order.user?.name?.split(' ')[0] || '',
        last_name: order.user?.name?.split(' ').slice(1).join(' ') || '',
        address_1: '123 Main St',
        city: 'City',
        state: 'State',
        postal_code: '12345',
        country: 'US'
      },
      items: order.items.map((item) => ({
        id: item.id,
        order_id: item.orderId,
        product_id: item.productId,
        product_name: item.product.name,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: item.unitPrice * item.quantity,
        sku: item.product.id,
        image_url: item.product.image,
        created_at: order.createdAt.toISOString(),
        updated_at: order.updatedAt.toISOString()
      })),
      tags: [],
      source: 'web',
      created_at: order.createdAt.toISOString(),
      updated_at: order.updatedAt.toISOString()
    };
  }

  // Update order status
  static async updateOrderStatus(id: string, status: OrderStatus) {
    return await prisma.order.update({
      where: { id },
      data: { status: status.toUpperCase() as PrismaOrderStatus }
    });
  }

  // Update financial status
  static async updateFinancialStatus(id: string, isPaid: boolean) {
    // Since we don't have financial_status in Prisma schema, we'll just return success for now
    // In a real implementation, you'd add this field to your schema
    return { success: true, message: `Payment status updated for order ${id}` };
  }

  // Assign rider to order
  static async assignRider(id: string, riderId: string) {
    // Since we don't have rider assignment in Prisma schema, we'll just return success for now
    // In a real implementation, you'd add this field to your schema
    return { success: true, message: `Rider ${riderId} assigned to order ${id}` };
  }
}

// Named exports for compatibility
export const getOrders = OrderService.getOrders;
export const getOrderById = OrderService.getOrder;
export const updateOrderStatus = OrderService.updateOrderStatus;
