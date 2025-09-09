// Basic refund service for MVP
// In a full implementation, this would handle refund processing logic

export interface Refund {
  id: string;
  orderId: string;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export class RefundService {
  // For MVP, we'll just return empty arrays
  static async getAll(): Promise<Refund[]> {
    return [];
  }

  static async getById(id: string): Promise<Refund | null> {
    return null;
  }

  static async create(data: Partial<Refund>): Promise<Refund> {
    throw new Error('Refund functionality not implemented in MVP');
  }

  static async update(id: string, data: Partial<Refund>): Promise<Refund> {
    throw new Error('Refund functionality not implemented in MVP');
  }

  static async delete(id: string): Promise<void> {
    throw new Error('Refund functionality not implemented in MVP');
  }

  static async getRefundStats() {
    return { total: 0, pending: 0, approved: 0, rejected: 0 };
  }
}

// Named exports for compatibility
export const getRefunds = RefundService.getAll;
export const getRefundById = RefundService.getById;
export const updateRefund = RefundService.update;
export const getRefundStats = RefundService.getRefundStats;
