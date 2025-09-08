import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/lib/services/user-service';
import { z } from 'zod';

interface RouteParams {
  params: {
    id: string;
  };
}

const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params;
    const body = await request.json();
    const validation = resetPasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid password data', details: validation.error.flatten() }, { status: 400 });
    }

    await UserService.resetPassword(id, validation.data.password);

    return NextResponse.json({ message: 'Password reset successfully' });

  } catch (error) {
    console.error(`Error resetting password for user ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
  }
}
