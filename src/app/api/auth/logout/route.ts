import { NextRequest, NextResponse } from 'next/server';
import { destroySession } from '@/lib/auth-utils';

export async function POST(request: NextRequest) {
  try {
    // Destroy the session
    await destroySession();

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again.' },
      { status: 500 }
    );
  }
}
