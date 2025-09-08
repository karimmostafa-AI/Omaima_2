import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { CartSidebar } from '@/components/cart/cart-sidebar';
import { useCartStore } from '@/store/cart-store';

// Mock the cart store
vi.mock('@/store/cart-store');

// Mock next/image and next/link
vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { src, alt, ...rest } = props;
    return <img src={src} alt={alt} {...rest} />;
  },
}));

vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode, href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('CartSidebar Component', () => {
  const mockUseCartStore = useCartStore as jest.Mock;
  let mockSetIsOpen = vi.fn();
  let mockUpdateQuantity = vi.fn();
  let mockRemoveItem = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockSetIsOpen = vi.fn();
    mockUpdateQuantity = vi.fn();
    mockRemoveItem = vi.fn();
  });

  const setupMockStore = (state: any) => {
    mockUseCartStore.mockReturnValue({
      setIsOpen: mockSetIsOpen,
      updateQuantity: mockUpdateQuantity,
      removeItem: mockRemoveItem,
      ...state,
    });
  };

  it('should render the empty cart view when there are no items', () => {
    setupMockStore({
      items: [],
      getSummary: () => ({
        itemCount: 0,
        subtotal: 0,
        discountAmount: 0,
        shippingAmount: 0,
        taxAmount: 0,
        total: 0,
      }),
      isOpen: true,
    });

    render(<CartSidebar />);

    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
    expect(screen.getByText('Add some beautiful suits to get started')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continue shopping/i })).toBeInTheDocument();
  });

  it('should render items correctly when the cart is not empty', () => {
    const mockItems = [
      { id: '1', name: 'Executive Power Suit', price: 459.00, quantity: 1, imageUrl: '/suit.jpg', slug: 'suit' },
      { id: '2', name: 'Classic Business Dress', price: 299.00, quantity: 2, imageUrl: '/dress.jpg', slug: 'dress' },
    ];
    setupMockStore({
      items: mockItems,
      getSummary: () => ({
        itemCount: 3,
        subtotal: 459.00 + 299.00 * 2,
        total: 459.00 + 299.00 * 2,
        discountAmount: 0,
        shippingAmount: 0,
        taxAmount: 0,
      }),
      isOpen: true,
    });

    render(<CartSidebar />);

    expect(screen.getByText('Executive Power Suit')).toBeInTheDocument();
    expect(screen.getByText('Classic Business Dress')).toBeInTheDocument();
    expect(screen.getByText(/subtotal/i)).toBeInTheDocument();
    expect(screen.getByText(/proceed to checkout/i)).toBeInTheDocument();
    expect(screen.getAllByRole('img')).toHaveLength(2);
  });

  it('should call updateQuantity when plus/minus buttons are clicked', async () => {
    const user = userEvent.setup();
    const mockItems = [
      { id: '1', name: 'Executive Power Suit', price: 459.00, quantity: 2, imageUrl: '/suit.jpg', slug: 'suit' },
    ];
    setupMockStore({
      items: mockItems,
      getSummary: () => ({ itemCount: 2, total: 918, subtotal: 918, discountAmount: 0, shippingAmount: 0, taxAmount: 0 }),
      isOpen: true,
    });

    render(<CartSidebar />);

    const plusButton = screen.getByRole('button', { name: /increase quantity/i });
    const minusButton = screen.getByRole('button', { name: /decrease quantity/i });

    await user.click(plusButton);
    expect(mockUpdateQuantity).toHaveBeenCalledWith('1', 3);

    await user.click(minusButton);
    expect(mockUpdateQuantity).toHaveBeenCalledWith('1', 1);
  });


  it('should call removeItem when remove button is clicked', async () => {
    const user = userEvent.setup();
    const mockItems = [
      { id: '1', name: 'Executive Power Suit', price: 459.00, quantity: 1, imageUrl: '/suit.jpg', slug: 'suit' },
    ];
    setupMockStore({
      items: mockItems,
      getSummary: () => ({ itemCount: 1, total: 459, subtotal: 459, discountAmount: 0, shippingAmount: 0, taxAmount: 0 }),
      isOpen: true,
    });

    render(<CartSidebar />);

    const removeButton = screen.getByRole('button', { name: /remove item/i });
    await user.click(removeButton);

    expect(mockRemoveItem).toHaveBeenCalledWith('1');
  });

  it('should display the correct subtotal and total', () => {
    const mockItems = [
      { id: '1', name: 'Suit', price: 100, quantity: 2, slug: 'suit' },
      { id: '2', name: 'Dress', price: 50, quantity: 1, slug: 'dress' },
    ];
    setupMockStore({
      items: mockItems,
      getSummary: () => ({
        itemCount: 3,
        subtotal: 250,
        discountAmount: 25,
        shippingAmount: 10,
        taxAmount: 20,
        total: 255,
      }),
      isOpen: true,
    });

    render(<CartSidebar />);

    expect(screen.getByText('Subtotal')).toBeInTheDocument();
    expect(screen.getByText('$250.00')).toBeInTheDocument();
    expect(screen.getByText('Discount')).toBeInTheDocument();
    expect(screen.getByText('-$25.00')).toBeInTheDocument();
    expect(screen.getByText('Shipping')).toBeInTheDocument();
    expect(screen.getByText('$10.00')).toBeInTheDocument();
    expect(screen.getByText('Tax')).toBeInTheDocument();
    expect(screen.getByText('$20.00')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('$255.00')).toBeInTheDocument();
  });
});
