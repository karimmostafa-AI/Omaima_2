import { createClient } from '@/lib/supabase';
import { prisma } from '@/lib/supabase';
import { User, UserRole } from '@prisma/client';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export type AuthUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  emailVerified: boolean;
  avatar: string | null;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
};

/**
 * Get current authenticated user on the server side
 * This function can be used in server components and API routes
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        emailVerified: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
      },
    });

    if (!dbUser) {
      return null;
    }

    return dbUser;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Get current user with authentication requirement
 * Redirects to login if user is not authenticated
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/auth/login');
  }

  return user;
}

/**
 * Require specific role for access
 * Redirects to appropriate page if user doesn't have required role
 */
export async function requireRole(allowedRoles: UserRole[]): Promise<AuthUser> {
  const user = await requireAuth();

  if (!allowedRoles.includes(user.role)) {
    // Redirect based on user role
    if (user.role === 'ADMIN') {
      redirect('/admin');
    } else if (user.role === 'STAFF') {
      redirect('/staff');
    } else {
      redirect('/dashboard');
    }
  }

  return user;
}

/**
 * Require admin access
 */
export async function requireAdmin(): Promise<AuthUser> {
  return requireRole(['ADMIN']);
}

/**
 * Require staff or admin access
 */
export async function requireStaff(): Promise<AuthUser> {
  return requireRole(['STAFF', 'ADMIN']);
}

/**
 * Check if user has specific role
 */
export function hasRole(user: AuthUser | null, allowedRoles: UserRole[]): boolean {
  if (!user) return false;
  return allowedRoles.includes(user.role);
}

/**
 * Check if user is admin
 */
export function isAdmin(user: AuthUser | null): boolean {
  return hasRole(user, ['ADMIN']);
}

/**
 * Check if user is staff or admin
 */
export function isStaff(user: AuthUser | null): boolean {
  return hasRole(user, ['STAFF', 'ADMIN']);
}

/**
 * Get user info from middleware headers
 * This is useful in server components when middleware has already verified the user
 */
export function getUserFromHeaders() {
  const headersList = headers();
  const userId = headersList.get('x-user-id');
  const userRole = headersList.get('x-user-role') as UserRole;
  const userEmail = headersList.get('x-user-email');

  if (!userId || !userRole || !userEmail) {
    return null;
  }

  return {
    id: userId,
    role: userRole,
    email: userEmail,
  };
}

/**
 * Create or update user profile in database after Supabase auth
 */
export async function syncUserWithDatabase(supabaseUser: any): Promise<User> {
  const { id, email, user_metadata } = supabaseUser;

  return await prisma.user.upsert({
    where: { id },
    create: {
      id,
      email,
      firstName: user_metadata?.first_name || '',
      lastName: user_metadata?.last_name || '',
      phone: user_metadata?.phone || null,
      role: 'CUSTOMER', // Default role
      isActive: true,
      emailVerified: !!supabaseUser.email_confirmed_at,
    },
    update: {
      email,
      emailVerified: !!supabaseUser.email_confirmed_at,
      lastLoginAt: new Date(),
      // Only update metadata if it exists and is different
      ...(user_metadata?.first_name && { firstName: user_metadata.first_name }),
      ...(user_metadata?.last_name && { lastName: user_metadata.last_name }),
      ...(user_metadata?.phone && { phone: user_metadata.phone }),
    },
  });
}

/**
 * Sign out user from both Supabase and clear session
 */
export async function signOut(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
}

/**
 * Get user's full name
 */
export function getUserFullName(user: AuthUser | null): string {
  if (!user) return 'Anonymous';
  return `${user.firstName} ${user.lastName}`.trim() || user.email;
}

/**
 * Get user's initials for avatar
 */
export function getUserInitials(user: AuthUser | null): string {
  if (!user) return '?';
  
  const firstInitial = user.firstName?.[0]?.toUpperCase() || '';
  const lastInitial = user.lastName?.[0]?.toUpperCase() || '';
  
  if (firstInitial && lastInitial) {
    return `${firstInitial}${lastInitial}`;
  }
  
  return user.email?.[0]?.toUpperCase() || '?';
}

/**
 * Check if user can access admin features
 */
export function canAccessAdmin(user: AuthUser | null): boolean {
  return isAdmin(user);
}

/**
 * Check if user can access staff features
 */
export function canAccessStaff(user: AuthUser | null): boolean {
  return isStaff(user);
}

/**
 * Get appropriate dashboard URL for user role
 */
export function getDashboardUrl(user: AuthUser | null): string {
  if (!user) return '/auth/login';
  
  switch (user.role) {
    case 'ADMIN':
      return '/admin';
    case 'STAFF':
      return '/staff';
    case 'CUSTOMER':
    default:
      return '/dashboard';
  }
}
