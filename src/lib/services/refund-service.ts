import { prisma } from '@/lib/db';
import { RefundStatus } from '@prisma/client';

interface GetRefundsParams {
  status?: RefundStatus | 'all';
  search?: string;
  page?: number;
  limit?: number;
}

export const getRefunds = async ({ status = 'all', search = '', page = 1, limit = 10 }: GetRefundsParams = {}) => {
  const where: any = {};
  if (status && status !== 'all') {
    where.status = status;
  }
  if (search) {
    where.OR = [
      { id: { contains: search, mode: 'insensitive' } },
      { orderId: { contains: search, mode: 'insensitive' } },
      { user: { name: { contains: search, mode: 'insensitive' } } },
    ];
  }

  const [refunds, total] = await Promise.all([
    prisma.refund.findMany({
      where,
      include: {
        user: true,
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.refund.count({ where }),
  ]);
  return { refunds, total };
};

export const getRefundById = async (id: string) => {
  return prisma.refund.findUnique({
    where: { id },
    include: {
      user: true,
      items: true,
    },
  });
};

export const updateRefund = async (id: string, data: { status: RefundStatus; notes?: string }) => {
  return prisma.refund.update({
    where: { id },
    data,
  });
};

export const getRefundStats = async () => {
  const stats = await prisma.refund.groupBy({
    by: ['status'],
    _count: {
      status: true,
    },
  });

  const total = await prisma.refund.count();

  const result = stats.reduce((acc, stat) => {
    acc[stat.status] = stat._count.status;
    return acc;
  }, {} as Record<RefundStatus, number>);

  return {
    total,
    pending: result.pending || 0,
    approved: result.approved || 0,
    rejected: result.rejected || 0,
    completed: result.completed || 0,
  };
};
