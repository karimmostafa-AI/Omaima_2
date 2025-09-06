// Temporary simplified auth service for development
// TODO: Integrate with Supabase database when configured

import { createClient } from '@/lib/supabase-middleware'
import { User } from '@/types'
import { NextRequest } from 'next/server'

export type AuthUser = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'CUSTOMER' | 'STAFF' | 'ADMIN';
  isActive: boolean;
  emailVerified: boolean;
  avatar?: string | null;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date | null;
};

/**
 * Get current authenticated user from Supabase
 * This is a simplified version for development
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    // Return a simplified user object for development
    return {
      id: user.id,
      email: user.email || '',
      firstName: user.user_metadata?.first_name || '',
      lastName: user.user_metadata?.last_name || '',
      role: user.user_metadata?.role || 'CUSTOMER',
      isActive: true,
      emailVerified: !!user.email_confirmed_at,
      avatar: user.user_metadata?.avatar_url || null,
      createdAt: new Date(user.created_at),
      updatedAt: new Date(user.updated_at || user.created_at),
      lastLoginAt: user.last_sign_in_at ? new Date(user.last_sign_in_at) : null,
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Get authenticated user from middleware/API routes
 */
export async function getAuthenticatedUser(request?: NextRequest): Promise<User | null> {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    // Convert to legacy User type for compatibility
    return {
      id: user.id,
      email: user.email,
      first_name: user.firstName || undefined,
      last_name: user.lastName || undefined,
      phone: undefined,
      avatar_url: user.avatar || undefined,
      role: user.role.toLowerCase() as 'customer' | 'admin' | 'staff',
      email_verified: user.emailVerified,
      created_at: user.createdAt.toISOString(),
      updated_at: user.updatedAt.toISOString(),
      last_login: user.lastLoginAt?.toISOString(),
      is_active: user.isActive,
      preferences: {
        currency: 'USD',
        language: 'en',
        notifications: {
          email: true,
          sms: false,
          marketing: false
        },
        theme: 'light' as const
      }
    };
  } catch (error) {
    console.error('Error getting authenticated user:', error);
    return null;
  }
}

// Role-based access control
export function requireRole(user: User | null, requiredRole: 'customer' | 'staff' | 'admin'): boolean {
  if (!user) return false
  
  const roleHierarchy = {
    customer: 1,
    staff: 2,
    admin: 3
  }
  
  return roleHierarchy[user.role] >= roleHierarchy[requiredRole]
}

export function requireAdmin(user: User | null): boolean {
  return user?.role === 'admin'
}

export function requireStaffOrAdmin(user: User | null): boolean {
  return user?.role === 'staff' || user?.role === 'admin'
}

/**
 * Check if user has specific role
 */
export function hasRole(user: AuthUser | null, allowedRoles: string[]): boolean {
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
 * Sign out user from Supabase
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
