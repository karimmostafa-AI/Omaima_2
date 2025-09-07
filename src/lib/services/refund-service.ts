import { Refund, RefundStatus, RefundPaymentStatus } from '@/types';

const mockRefunds: Refund[] = [
  {
    id: 'REF-12345',
    orderId: 'ORD-67890',
    returnDate: '2023-10-15',
    customer: { id: 'CUST-001', name: 'John Doe', email: 'john@example.com' },
    shop: { id: 'SHOP-001', name: 'Fashion Store' },
    items: [{ productId: 'PROD-123', name: 'Blue T-Shirt', quantity: 1, price: 29.99 }],
    amount: 29.99,
    status: 'pending',
    paymentStatus: 'pending',
    reason: 'Product damaged during shipping',
    notes: 'Customer provided photos of damaged item',
    createdAt: '2023-10-15T14:30:00Z',
    updatedAt: '2023-10-15T14:30:00Z',
  },
  {
    id: 'REF-12346',
    orderId: 'ORD-67891',
    returnDate: '2023-10-16',
    customer: { id: 'CUST-002', name: 'Jane Smith', email: 'jane@example.com' },
    shop: { id: 'SHOP-002', name: 'Gadget World' },
    items: [{ productId: 'PROD-124', name: 'Wireless Headphones', quantity: 1, price: 99.99 }],
    amount: 99.99,
    status: 'approved',
    paymentStatus: 'processing',
    reason: 'Item not as described',
    createdAt: '2023-10-16T10:00:00Z',
    updatedAt: '2023-10-16T11:00:00Z',
  },
  {
    id: 'REF-12347',
    orderId: 'ORD-67892',
    returnDate: '2023-10-17',
    customer: { id: 'CUST-003', name: 'Peter Jones', email: 'peter@example.com' },
    shop: { id: 'SHOP-001', name: 'Fashion Store' },
    items: [{ productId: 'PROD-125', name: 'Leather Jacket', quantity: 1, price: 199.99 }],
    amount: 199.99,
    status: 'completed',
    paymentStatus: 'refunded',
    reason: 'Wrong size',
    createdAt: '2023-10-17T09:00:00Z',
    updatedAt: '2023-10-18T15:00:00Z',
  },
  {
    id: 'REF-12348',
    orderId: 'ORD-67893',
    returnDate: '2023-10-18',
    customer: { id: 'CUST-004', name: 'Mary Johnson', email: 'mary@example.com' },
    shop: { id: 'SHOP-003', name: 'Home Goods' },
    items: [{ productId: 'PROD-126', name: 'Coffee Maker', quantity: 1, price: 49.99 }],
    amount: 49.99,
    status: 'rejected',
    paymentStatus: 'pending',
    reason: 'Return period expired',
    notes: 'Customer contacted support after 30-day return window.',
    createdAt: '2023-10-18T16:00:00Z',
    updatedAt: '2023-10-18T17:00:00Z',
  },
];

interface GetRefundsParams {
  status?: RefundStatus | 'all';
  search?: string;
  page?: number;
  limit?: number;
}

export const getRefunds = async ({ status = 'all', search = '', page = 1, limit = 10 }: GetRefundsParams = {}): Promise<{ refunds: Refund[], total: number }> => {
  let filteredRefunds = mockRefunds;

  if (status && status !== 'all') {
    filteredRefunds = filteredRefunds.filter(refund => refund.status === status);
  }

  if (search) {
    const lowercasedSearch = search.toLowerCase();
    filteredRefunds = filteredRefunds.filter(refund =>
      refund.id.toLowerCase().includes(lowercasedSearch) ||
      refund.orderId.toLowerCase().includes(lowercasedSearch) ||
      refund.customer.name.toLowerCase().includes(lowercasedSearch) ||
      refund.shop.name.toLowerCase().includes(lowercasedSearch)
    );
  }

  const paginatedRefunds = filteredRefunds.slice((page - 1) * limit, page * limit);

  return Promise.resolve({ refunds: paginatedRefunds, total: filteredRefunds.length });
};

export const getRefundById = async (id: string): Promise<Refund | null> => {
  const refund = mockRefunds.find(r => r.id === id);
  return Promise.resolve(refund || null);
};

export const updateRefund = async (id: string, data: { status: RefundStatus; notes?: string }): Promise<Refund | null> => {
  const refundIndex = mockRefunds.findIndex(r => r.id === id);
  if (refundIndex === -1) {
    return null;
  }
  const updatedRefund = { ...mockRefunds[refundIndex], ...data, updatedAt: new Date().toISOString() };
  mockRefunds[refundIndex] = updatedRefund;
  return Promise.resolve(updatedRefund);
};

export const getRefundStats = async (): Promise<Record<RefundStatus | 'total', number>> => {
  const stats = mockRefunds.reduce((acc, refund) => {
    acc[refund.status] = (acc[refund.status] || 0) + 1;
    return acc;
  }, {} as Record<RefundStatus, number>);

  return Promise.resolve({
    total: mockRefunds.length,
    pending: stats.pending || 0,
    approved: stats.approved || 0,
    rejected: stats.rejected || 0,
    completed: stats.completed || 0,
  });
};
