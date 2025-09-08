import { NextRequest, NextResponse } from 'next/server';
import { MailConfigService } from '@/lib/services/mail-config-service';
import { z } from 'zod';

// GET handler to retrieve mail settings
export async function GET(request: NextRequest) {
  try {
    const config = await MailConfigService.getMailConfig();
    if (config?.password) {
        config.password = '';
    }
    return NextResponse.json(config || {});
  } catch (error) {
    console.error('Error fetching mail config:', error);
    return NextResponse.json({ error: 'Failed to fetch mail configuration' }, { status: 500 });
  }
}

const mailConfigSchema = z.object({
  mailer: z.literal('smtp'),
  host: z.string().min(1, 'Host is required'),
  port: z.coerce.number().min(1, 'Port is required'),
  username: z.string().optional(),
  password: z.string().optional(),
  encryption: z.enum(['tls', 'ssl', 'none']).optional(),
  from_address: z.string().email('Invalid from address'),
  from_name: z.string().min(1, 'From name is required'),
});

// POST handler to save mail settings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = mailConfigSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid mail configuration data', details: validation.error.flatten() }, { status: 400 });
    }

    if (!validation.data.password) {
        const currentConfig = await MailConfigService.getMailConfig();
        if (currentConfig?.password) {
            validation.data.password = currentConfig.password;
        }
    }

    await MailConfigService.saveMailConfig(validation.data);
    return NextResponse.json({ message: 'Mail configuration saved successfully' });
  } catch (error) {
    console.error('Error saving mail config:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
