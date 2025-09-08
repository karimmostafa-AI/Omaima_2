import { NextRequest, NextResponse } from 'next/server';
import { SmsGatewayService } from '@/lib/services/sms-gateway-service';

// GET handler to retrieve all SMS gateway settings
export async function GET(request: NextRequest) {
  try {
    const configs = await SmsGatewayService.getGatewayConfigs();

    const safeConfigs = JSON.parse(JSON.stringify(configs));
    const sensitiveKeys = {
        twilio: ['sid', 'token'],
        vonage: ['api_key', 'api_secret'],
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
    console.error('Error fetching SMS gateway configs:', error);
    return NextResponse.json({ error: 'Failed to fetch SMS gateway configs' }, { status: 500 });
  }
}

// POST handler to save all SMS gateway settings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const currentConfigs = await SmsGatewayService.getGatewayConfigs();
    const updatedConfigs = { ...currentConfigs, ...body };

    const sensitiveKeys = {
        twilio: ['sid', 'token'],
        vonage: ['api_key', 'api_secret'],
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

    await SmsGatewayService.saveGatewayConfigs(updatedConfigs);
    return NextResponse.json({ message: 'SMS gateway settings saved successfully' });
  } catch (error) {
    console.error('Error saving SMS gateway configs:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
