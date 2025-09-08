import { NextRequest, NextResponse } from 'next/server';
import { MailConfigService } from '@/lib/services/mail-config-service';
import { z } from 'zod';

const testEmailSchema = z.object({
  recipient: z.string().email('A valid recipient email is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = testEmailSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid data', details: validation.error.flatten() }, { status: 400 });
    }

    const result = await MailConfigService.sendTestEmail(validation.data.recipient);

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 500 });
    }
  } catch (error: any) {
    console.error('Failed to send test email:', error);
    return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
  }
}
