import { NextRequest, NextResponse } from 'next/server';
import { PusherService } from '@/lib/services/pusher-service';

export async function GET(request: NextRequest) {
  try {
    const config = await PusherService.getConfig();
    if (config?.app_secret) {
        config.app_secret = '';
    }
    return NextResponse.json(config || {});
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch Pusher config' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.app_secret) {
        const currentConfig = await PusherService.getConfig();
        if (currentConfig?.app_secret) {
            body.app_secret = currentConfig.app_secret;
        }
    }

    await PusherService.saveConfig(body);
    return NextResponse.json({ message: 'Pusher settings saved successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
