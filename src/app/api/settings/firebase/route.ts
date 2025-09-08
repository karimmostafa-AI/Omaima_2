import { NextRequest, NextResponse } from 'next/server';
import { FirebaseService } from '@/lib/services/firebase-service';

export async function GET(request: NextRequest) {
  try {
    const config = await FirebaseService.getConfig();
    if (config?.server_key) {
        config.server_key = '';
    }
    return NextResponse.json(config || {});
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch Firebase config' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.server_key) {
        const currentConfig = await FirebaseService.getConfig();
        if (currentConfig?.server_key) {
            body.server_key = currentConfig.server_key;
        }
    }

    await FirebaseService.saveConfig(body);
    return NextResponse.json({ message: 'Firebase settings saved successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
