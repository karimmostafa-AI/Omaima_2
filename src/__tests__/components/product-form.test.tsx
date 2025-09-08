import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { ProductForm } from '@/components/forms/product-form';

// Mock dependencies
// The form uses a mockCategories array internally, so we don't need to mock it here
// unless we want to control it from the test. For now, the internal mock is fine.

describe('ProductForm Component', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnSubmit.mockResolvedValue(undefined);
  });

  it('should render correctly in create mode', () => {
    render(
      <ProductForm
        mode="create"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // Check for key fields
    expect(screen.getByLabelText(/product name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^description \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/sku/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^price \*/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();

    // Check for the submit button text
    expect(screen.getByRole('button', { name: /create product/i })).toBeInTheDocument();
  });

  it('should render correctly in edit mode with initial data', () => {
    const initialData = {
      name: 'Test Product',
      description: 'Test Description',
      sku: 'TEST-001',
      price: 99.99,
      category: 'dresses',
      status: 'active' as 'active' | 'draft' | 'inactive',
    };

    render(
      <ProductForm
        mode="edit"
        initialData={initialData}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // Check that fields are populated
    expect(screen.getByLabelText(/product name/i)).toHaveValue('Test Product');
    expect(screen.getByLabelText(/^description \*/i)).toHaveValue('Test Description');
    expect(screen.getByLabelText(/sku/i)).toHaveValue('TEST-001');
    expect(screen.getByLabelText(/^price \*/i)).toHaveValue(99.99);

    // Check the select value for category
    expect(screen.getByRole('combobox', { name: /category/i })).toHaveTextContent('Dresses');

    // Check the submit button text
    expect(screen.getByRole('button', { name: /update product/i })).toBeInTheDocument();
  });

  it('should display validation errors for required fields', async () => {
    const user = userEvent.setup();
    render(
      <ProductForm
        mode="create"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    await user.click(screen.getByRole('button', { name: /create product/i }));

    expect(await screen.findByText('Product name is required')).toBeInTheDocument();
    expect(await screen.findByText('Description is required')).toBeInTheDocument();
    expect(await screen.findByText('SKU is required')).toBeInTheDocument();
    expect(await screen.findByText('Category is required')).toBeInTheDocument();

    // The price field has a default of 0, so it won't show a "required" error,
    // but its validation is for min(0).
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should call onSubmit with form data when submitted correctly', async () => {
    const user = userEvent.setup();
    render(
      <ProductForm
        mode="create"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    await user.type(screen.getByLabelText(/product name/i), 'New Awesome Product');
    await user.type(screen.getByLabelText(/^description \*/i), 'This product is really awesome.');
    await user.type(screen.getByLabelText(/sku/i), 'NAP-001');
    await user.type(screen.getByLabelText(/^price \*/i), '123.45');

    // Select a category
    await user.click(screen.getByRole('combobox', { name: /category/i }));
    await user.click(await screen.findByRole('option', { name: 'Blazers' }));

    await user.click(screen.getByRole('button', { name: /create product/i }));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New Awesome Product',
          description: 'This product is really awesome.',
          sku: 'NAP-001',
          price: 123.45,
          category: 'blazers',
        })
      );
    });
  });

  it('should toggle quantity field based on "Track Quantity" checkbox', async () => {
    const user = userEvent.setup();
    render(
      <ProductForm
        mode="create"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // Quantity should be visible by default because "Track Quantity" is checked
    expect(screen.getByLabelText(/^quantity$/i)).toBeInTheDocument();

    // Uncheck "Track Quantity"
    await user.click(screen.getByLabelText(/track quantity/i));

    // Quantity should now be hidden
    expect(screen.queryByLabelText(/^quantity$/i)).not.toBeInTheDocument();

    // Check it again
    await user.click(screen.getByLabelText(/track quantity/i));

    // Quantity should be visible again
    expect(screen.getByLabelText(/^quantity$/i)).toBeInTheDocument();
  });
});
