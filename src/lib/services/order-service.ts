import { prisma } from '@/lib/db'
import type { OrderStatus } from '.prisma/client'

export class OrderService {
  // Get all orders
  static async getOrders() {
    return await prisma.order.findMany({
      include: {
        user: true,
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  // Get order by ID
  static async getOrder(id: string) {
    return await prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
        items: {
          include: {
            product: true
          }
        }
      }
    })
  }

  // Update order status
  static async updateOrderStatus(id: string, status: OrderStatus) {
    return await prisma.order.update({
      where: { id },
      data: { status }
    })
  }
}

// Named exports for compatibility
export const getOrders = OrderService.getOrders;
export const getOrderById = OrderService.getOrder;
export const updateOrderStatus = OrderService.updateOrderStatus;
