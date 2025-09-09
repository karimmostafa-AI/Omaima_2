import { NextRequest, NextResponse } from 'next/server';
import { getOrderById } from '@/lib/services/order-service';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;
    
    // Get the order
    const order = await getOrderById(orderId);
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // For now, we'll create a simple HTML invoice and return it as PDF
    // In production, you'd use a proper PDF generation library like Puppeteer or PDFKit
    const invoiceHTML = generateInvoiceHTML(order);
    
    // Since we don't have PDF generation set up, we'll return a simple text response
    // This would be replaced with actual PDF generation
    return new Response(
      `Invoice for Order ${order.order_number}\n\n` +
      `Customer: ${order.customer?.firstName} ${order.customer?.lastName}\n` +
      `Email: ${order.email}\n` +
      `Date: ${new Date(order.created_at).toLocaleDateString()}\n` +
      `Total: $${order.total_amount.toFixed(2)}\n\n` +
      `Items:\n` +
      order.items.map(item => 
        `- ${item.product_name} (x${item.quantity}): $${item.total_price.toFixed(2)}`
      ).join('\n') +
      `\n\nSubtotal: $${order.subtotal.toFixed(2)}\n` +
      `Tax: $${order.tax_amount.toFixed(2)}\n` +
      `Shipping: $${order.shipping_amount.toFixed(2)}\n` +
      `Total: $${order.total_amount.toFixed(2)}`,
      {
        headers: {
          'Content-Type': 'text/plain',
          'Content-Disposition': `attachment; filename="invoice-${order.order_number}.txt"`,
        },
      }
    );

  } catch (error) {
    console.error('Failed to generate invoice:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to generate invoice',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}

// Helper function to generate invoice HTML (for future PDF generation)
function generateInvoiceHTML(order: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Invoice ${order.order_number}</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { text-align: center; margin-bottom: 40px; }
            .invoice-details { margin-bottom: 30px; }
            .customer-details { margin-bottom: 30px; }
            .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .items-table th, .items-table td { 
                border: 1px solid #ddd; 
                padding: 12px; 
                text-align: left; 
            }
            .items-table th { background-color: #f8f9fa; }
            .totals { text-align: right; }
            .total-row { font-weight: bold; font-size: 1.2em; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>INVOICE</h1>
            <h2>Omaima</h2>
        </div>
        
        <div class="invoice-details">
            <strong>Invoice Number:</strong> ${order.order_number}<br>
            <strong>Date:</strong> ${new Date(order.created_at).toLocaleDateString()}<br>
            <strong>Status:</strong> ${order.status}
        </div>
        
        <div class="customer-details">
            <strong>Bill To:</strong><br>
            ${order.customer?.firstName} ${order.customer?.lastName}<br>
            ${order.email}<br>
            ${order.billing_address ? [
              order.billing_address.address_1,
              order.billing_address.address_2,
              `${order.billing_address.city}, ${order.billing_address.state} ${order.billing_address.postal_code}`,
              order.billing_address.country
            ].filter(Boolean).join('<br>') : ''}
        </div>
        
        <table class="items-table">
            <thead>
                <tr>
                    <th>Item</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                ${order.items.map((item: any) => `
                    <tr>
                        <td>${item.product_name}${item.variant_title ? ` (${item.variant_title})` : ''}</td>
                        <td>${item.quantity}</td>
                        <td>$${item.unit_price.toFixed(2)}</td>
                        <td>$${item.total_price.toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        
        <div class="totals">
            <div>Subtotal: $${order.subtotal.toFixed(2)}</div>
            <div>Tax: $${order.tax_amount.toFixed(2)}</div>
            <div>Shipping: $${order.shipping_amount.toFixed(2)}</div>
            <div class="total-row">Total: $${order.total_amount.toFixed(2)}</div>
        </div>
    </body>
    </html>
  `;
}
