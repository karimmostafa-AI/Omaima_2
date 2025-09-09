// Basic authentication service for MVP
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export interface AuthResult {
  success: boolean;
  user?: any;
  error?: string;
}

export class AuthService {
  static async authenticate(email: string, password: string): Promise<AuthResult> {
    // Check hardcoded admin credentials from env
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (email === adminEmail && password === adminPassword) {
      // Find or create admin user
      let adminUser = await prisma.user.findUnique({
        where: { email: adminEmail }
      });

      if (!adminUser) {
        adminUser = await prisma.user.create({
          data: {
            email: adminEmail,
            name: 'Admin',
            role: 'ADMIN'
          }
        });
      }

      return {
        success: true,
        user: adminUser
      };
    }

    // For other users, check database (not implemented in MVP)
    return {
      success: false,
      error: 'Invalid credentials'
    };
  }

  static async setSession(userId: string): Promise<void> {
    const cookieStore = await cookies();
    // Set a simple session cookie
    cookieStore.set('session', userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 // 30 days
    });
  }

  static async getSession(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get('session')?.value || null;
  }

  static async clearSession(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete('session');
  }

  static async getCurrentUser(): Promise<any | null> {
    const sessionUserId = await this.getSession();
    if (!sessionUserId) return null;

    return await prisma.user.findUnique({
      where: { id: sessionUserId }
    });
  }

  static async isAdmin(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user?.role === 'ADMIN';
  }
}

// Named export for compatibility
export const authService = AuthService;
