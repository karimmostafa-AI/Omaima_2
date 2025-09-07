import { prisma } from '@/lib/db';
import { OrderStatus, FinancialStatus } from '@prisma/client';

interface GetOrdersParams {
  status?: OrderStatus | 'all';
  page?: number;
  limit?: number;
}

export const getOrders = async ({ status = 'all', page = 1, limit = 10 }: GetOrdersParams = {}) => {
  const where: any = {};
  if (status && status !== 'all') {
    where.status = status;
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        user: true,
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.order.count({ where }),
  ]);
  return { orders, total };
};

export const getOrderById = async (id: string) => {
  return prisma.order.findUnique({
    where: { id },
    include: {
      user: true,
      items: {
        include: {
          product: true,
        },
      },
      shippingAddress: true,
      billingAddress: true,
    },
  });
};

export const updateOrderStatus = async (id: string, status: OrderStatus) => {
  return prisma.order.update({
    where: { id },
    data: { status },
  });
};

export const updatePaymentStatus = async (id: string, financial_status: FinancialStatus) => {
    return prisma.order.update({
      where: { id },
      data: { financial_status },
    });
  };

export const assignRiderToOrder = async (id: string, riderId: string) => {
    return prisma.order.update({
        where: { id },
        data: { riderId },
    });
};
