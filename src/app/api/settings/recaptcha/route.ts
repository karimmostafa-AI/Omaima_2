import { NextRequest, NextResponse } from 'next/server';
import { ReCaptchaService } from '@/lib/services/recaptcha-service';

export async function GET(request: NextRequest) {
  try {
    const config = await ReCaptchaService.getConfig();
    if (config?.secret_key) {
        config.secret_key = '';
    }
    return NextResponse.json(config || {});
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch ReCaptcha config' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.secret_key) {
        const currentConfig = await ReCaptchaService.getConfig();
        if (currentConfig?.secret_key) {
            body.secret_key = currentConfig.secret_key;
        }
    }

    await ReCaptchaService.saveConfig(body);
    return NextResponse.json({ message: 'ReCaptcha settings saved successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
