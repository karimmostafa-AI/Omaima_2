import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { z } from 'zod';

const resetPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

const updatePasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// POST - Send password reset email
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input data
    const validatedData = resetPasswordSchema.parse(body);
    const { email } = validatedData;

    const supabase = createClient();

    // Send password reset email
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
    });

    if (error) {
      console.error('Password reset error:', error);
      
      // Return success anyway for security (don't reveal if email exists)
      return NextResponse.json({
        success: true,
        message: 'If an account with this email exists, you will receive a password reset link.',
      }, { status: 200 });
    }

    return NextResponse.json({
      success: true,
      message: 'Password reset email sent. Please check your inbox and follow the instructions.',
    }, { status: 200 });

  } catch (error) {
    console.error('Password reset request error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid input data',
          details: error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error. Please try again.' },
      { status: 500 }
    );
  }
}

// PUT - Update password with reset token
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input data
    const validatedData = updatePasswordSchema.parse(body);
    const { password } = validatedData;

    const supabase = createClient();

    // Update password
    const { data, error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      console.error('Password update error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    if (!data.user) {
      return NextResponse.json(
        { error: 'Failed to update password' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully. You can now login with your new password.',
    }, { status: 200 });

  } catch (error) {
    console.error('Password update error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid input data',
          details: error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error. Please try again.' },
      { status: 500 }
    );
  }
}
