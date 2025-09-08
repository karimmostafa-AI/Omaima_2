import { NextRequest, NextResponse } from 'next/server';
import { PaymentGatewayService } from '@/lib/services/payment-gateway-service';

// GET handler to retrieve all payment gateway settings
export async function GET(request: NextRequest) {
  try {
    const configs = await PaymentGatewayService.getGatewayConfigs();

    const safeConfigs = JSON.parse(JSON.stringify(configs));
    const sensitiveKeys = {
        stripe: ['stripe_secret_key'],
        paypal: ['paypal_client_secret'],
    };
    for (const gw in safeConfigs) {
        if(sensitiveKeys[gw]) {
            for(const key of sensitiveKeys[gw]) {
                if(safeConfigs[gw][key]) {
                    safeConfigs[gw][key] = '';
                }
            }
        }
    }

    return NextResponse.json(safeConfigs || {});
  } catch (error) {
    console.error('Error fetching payment gateway configs:', error);
    return NextResponse.json({ error: 'Failed to fetch payment gateway configs' }, { status: 500 });
  }
}

// POST handler to save all payment gateway settings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const currentConfigs = await PaymentGatewayService.getGatewayConfigs();
    const updatedConfigs = { ...currentConfigs, ...body };

    const sensitiveKeys = {
        stripe: ['stripe_secret_key'],
        paypal: ['paypal_client_secret'],
    };
    for (const gw in updatedConfigs) {
        if(sensitiveKeys[gw]) {
            for(const key of sensitiveKeys[gw]) {
                if (body[gw] && (body[gw][key] === '' || body[gw][key] === undefined)) {
                    if (currentConfigs[gw]?.[key]) {
                        updatedConfigs[gw][key] = currentConfigs[gw][key];
                    }
                }
            }
        }
    }

    await PaymentGatewayService.saveGatewayConfigs(updatedConfigs);
    return NextResponse.json({ message: 'Payment gateway settings saved successfully' });
  } catch (error) {
    console.error('Error saving payment gateway configs:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
