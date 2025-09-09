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

    // Generate payment slip content
    const paymentSlipContent = generatePaymentSlipContent(order);
    
    // Return as downloadable text file (in production, you'd generate a proper PDF)
    return new Response(paymentSlipContent, {
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename="payment-slip-${order.order_number}.txt"`,
      },
    });

  } catch (error) {
    console.error('Failed to generate payment slip:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to generate payment slip',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: 500 }
    );
  }
}

function generatePaymentSlipContent(order: any): string {
  return `
PAYMENT SLIP
===========

Order Information:
-----------------
Order Number: ${order.order_number}
Order ID: ${order.id}
Order Date: ${new Date(order.created_at).toLocaleDateString()}
Payment Status: ${order.financial_status.toUpperCase()}

Customer Details:
----------------
Name: ${order.customer?.firstName} ${order.customer?.lastName}
Email: ${order.email}
Phone: ${order.customer?.phone || 'N/A'}

Payment Information:
------------------
Payment Method: Cash on Delivery
Financial Status: ${order.financial_status}
Payment Date: ${order.financial_status === 'paid' ? new Date().toLocaleDateString() : 'Pending'}

Order Summary:
-------------
Subtotal: $${order.subtotal.toFixed(2)}
Coupon Discount: -$${order.discount_amount.toFixed(2)}
Delivery Charge: $${order.shipping_amount.toFixed(2)}
VAT & Tax: $${order.tax_amount.toFixed(2)}
---------------------------
TOTAL AMOUNT: $${order.total_amount.toFixed(2)}

Items:
------
${order.items.map((item: any, index: number) => 
  `${index + 1}. ${item.product_name}${item.variant_title ? ` (${item.variant_title})` : ''}
     Quantity: ${item.quantity}
     Unit Price: $${item.unit_price.toFixed(2)}
     Total: $${item.total_price.toFixed(2)}`
).join('\n\n')}

Shipping Address:
----------------
${order.billing_address?.first_name} ${order.billing_address?.last_name}
${order.billing_address?.address_1}
${order.billing_address?.address_2 ? order.billing_address.address_2 + '\n' : ''}${order.billing_address?.city}, ${order.billing_address?.state} ${order.billing_address?.postal_code}
${order.billing_address?.country}

---
Generated on: ${new Date().toLocaleString()}
Omaima - Custom Tailoring Services
  `.trim();
}
