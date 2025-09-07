import { Order, OrderStatus, FinancialStatus, FulfillmentStatus, Address, OrderItem, User } from '@/types';

const mockCustomer: User = {
  id: 'cus_123',
  email: 'customer@example.com',
  first_name: 'John',
  last_name: 'Doe',
  phone: '555-123-4567',
  role: 'customer',
  email_verified: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  is_active: true,
};

const mockBillingAddress: Address = {
  first_name: 'John',
  last_name: 'Doe',
  address_1: '123 Billing St',
  city: 'Billington',
  state: 'BI',
  postal_code: '12345',
  country: 'USA',
  phone: '555-123-4567',
};

const mockShippingAddress: Address = {
  first_name: 'John',
  last_name: 'Doe',
  address_1: '456 Shipping Ave',
  city: 'Shipperville',
  state: 'SH',
  postal_code: '67890',
  country: 'USA',
  phone: '555-123-4567',
};

const mockOrderItems: OrderItem[] = [
  {
    id: 'item_1',
    order_id: 'ord_12345',
    product_id: 'prod_abc',
    variant_id: 'var_xyz',
    product_name: 'Classic T-Shirt',
    variant_title: 'Large / Black',
    quantity: 2,
    unit_price: 25.00,
    total_price: 50.00,
    sku: 'TS-BLK-L',
    image_url: '/placeholder-image.jpg',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'item_2',
    order_id: 'ord_12345',
    product_id: 'prod_def',
    variant_id: 'var_uvw',
    product_name: 'Denim Jeans',
    variant_title: '32x32',
    quantity: 1,
    unit_price: 75.00,
    total_price: 75.00,
    sku: 'DNM-3232',
    image_url: '/placeholder-image.jpg',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const mockOrder: Order = {
  id: 'ord_12345',
  order_number: '1001',
  customer_id: 'cus_123',
  customer: mockCustomer,
  email: 'customer@example.com',
  phone: '555-123-4567',
  status: 'processing' as OrderStatus,
  financial_status: 'paid' as FinancialStatus,
  fulfillment_status: 'unfulfilled' as FulfillmentStatus,
  subtotal: 125.00,
  tax_amount: 10.00,
  shipping_amount: 5.00,
  discount_amount: 0.00,
  total_amount: 140.00,
  currency: 'USD',
  billing_address: mockBillingAddress,
  shipping_address: mockShippingAddress,
  items: mockOrderItems,
  shipping_method: 'Standard Shipping',
  tracking_number: '1Z9999999999999999',
  tracking_url: 'https://www.ups.com/track?loc=en_US&tracknum=1Z9999999999999999',
  notes: 'Customer requested gift wrapping.',
  tags: ['gift', 'priority'],
  source: 'web',
  created_at: '2024-07-28T14:48:00.000Z',
  updated_at: '2024-07-28T14:48:00.000Z',
};

export const getOrderById = async (orderId: string): Promise<Order | null> => {
  console.log(`Fetching order with ID: ${orderId}`);
  // In a real application, you would fetch this data from your database or API
  // For now, we'll return the mock data if the ID matches.
  if (orderId === 'ord_12345') {
    return Promise.resolve(mockOrder);
  }
  return Promise.resolve(null);
};
