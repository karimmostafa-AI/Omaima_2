import { NextRequest, NextResponse } from 'next/server';
import { SocialAuthService } from '@/lib/services/social-auth-service';

export async function GET(request: NextRequest) {
  try {
    const configs = await SocialAuthService.getConfigs();

    const safeConfigs = JSON.parse(JSON.stringify(configs));
    const sensitiveKeys = {
        google: ['client_secret'],
        facebook: ['client_secret'],
        github: ['client_secret'],
    };
    for (const provider in safeConfigs) {
        if(sensitiveKeys[provider]) {
            for(const key of sensitiveKeys[provider]) {
                if(safeConfigs[provider][key]) {
                    safeConfigs[provider][key] = '';
                }
            }
        }
    }

    return NextResponse.json(safeConfigs || {});
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch social auth configs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const currentConfigs = await SocialAuthService.getConfigs();
    const updatedConfigs = { ...currentConfigs, ...body };

    const sensitiveKeys = {
        google: ['client_secret'],
        facebook: ['client_secret'],
        github: ['client_secret'],
    };
    for (const provider in updatedConfigs) {
        if(sensitiveKeys[provider]) {
            for(const key of sensitiveKeys[provider]) {
                if (body[provider] && (body[provider][key] === '' || body[provider][key] === undefined)) {
                    if (currentConfigs[provider]?.[key]) {
                        updatedConfigs[provider][key] = currentConfigs[provider][key];
                    }
                }
            }
        }
    }

    await SocialAuthService.saveConfigs(updatedConfigs);
    return NextResponse.json({ message: 'Social auth settings saved successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
