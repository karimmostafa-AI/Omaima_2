import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AuthUser, hasRequiredRole as hasRequiredRoleClient } from '@/lib/auth';

/**
 * Get the authenticated user from server-side context
 * Returns user object or null if not authenticated
 */
export async function getServerUser(): Promise<AuthUser | null> {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    // Convert Supabase user to AuthUser
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
    console.error('Error getting server user:', error);
    return null;
  }
}

/**
 * Require authentication - redirects to login if not authenticated
 * Returns authenticated user or redirects
 */
export async function requireAuth(redirectUrl?: string): Promise<AuthUser> {
  const user = await getServerUser();
  
  if (!user) {
    const loginUrl = redirectUrl 
      ? `/auth/login?redirect=${encodeURIComponent(redirectUrl)}`
      : '/auth/login';
    redirect(loginUrl);
  }
  
  return user;
}

/**
 * Require specific role - redirects if user doesn't have required role
 */
export async function requireRole(
  requiredRole: 'CUSTOMER' | 'STAFF' | 'ADMIN',
  redirectUrl?: string
): Promise<AuthUser> {
  const user = await requireAuth(redirectUrl);
  
  if (!hasRequiredRoleClient(user, requiredRole)) {
    // Redirect to appropriate dashboard based on user role
    switch (user.role) {
      case 'ADMIN':
        redirect('/admin');
        break;
      case 'STAFF':
        redirect('/staff');
        break;
      case 'CUSTOMER':
        redirect('/dashboard');
        break;
      default:
        redirect('/');
    }
  }
  
  return user;
}

/**
 * Require customer role (CUSTOMER, STAFF, or ADMIN)
 */
export async function requireCustomerAuth(redirectUrl?: string): Promise<AuthUser> {
  return requireRole('CUSTOMER', redirectUrl);
}

/**
 * Require staff role (STAFF or ADMIN)
 */
export async function requireStaffAuth(redirectUrl?: string): Promise<AuthUser> {
  return requireRole('STAFF', redirectUrl);
}

/**
 * Require admin role (ADMIN only)
 */
export async function requireAdminAuth(redirectUrl?: string): Promise<AuthUser> {
  return requireRole('ADMIN', redirectUrl);
}

/**
 * Check if user has specific role without redirecting
 */
export async function hasRole(requiredRole: 'CUSTOMER' | 'STAFF' | 'ADMIN'): Promise<boolean> {
  const user = await getServerUser();
  return hasRequiredRoleClient(user, requiredRole);
}

/**
 * Check if current user is admin
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getServerUser();
  return hasRequiredRoleClient(user, 'ADMIN');
}

/**
 * Check if current user is staff or admin
 */
export async function isStaff(): Promise<boolean> {
  const user = await getServerUser();
  return hasRequiredRoleClient(user, 'STAFF');
}

/**
 * Check if current user is customer, staff, or admin
 */
export async function isCustomer(): Promise<boolean> {
  const user = await getServerUser();
  return hasRequiredRoleClient(user, 'CUSTOMER');
}

/**
 * Redirect guests to login if they access protected routes
 */
export async function requireGuest(redirectUrl?: string): Promise<void> {
  const user = await getServerUser();
  
  if (user) {
    // Redirect to appropriate dashboard based on user role
    let dashboardUrl = redirectUrl || '/dashboard';
    
    if (!redirectUrl) {
      switch (user.role) {
        case 'ADMIN':
          dashboardUrl = '/admin';
          break;
        case 'STAFF':
          dashboardUrl = '/staff';
          break;
        case 'CUSTOMER':
          dashboardUrl = '/dashboard';
          break;
        default:
          dashboardUrl = '/';
      }
    }
    
    redirect(dashboardUrl);
  }
}

/**
 * Get user's full name
 */
export function getFullName(user: AuthUser): string {
  return `${user.firstName} ${user.lastName}`.trim() || user.email;
}

/**
 * Get user's initials
 */
export function getInitials(user: AuthUser): string {
  const firstInitial = user.firstName?.[0]?.toUpperCase() || '';
  const lastInitial = user.lastName?.[0]?.toUpperCase() || '';
  
  if (firstInitial && lastInitial) {
    return `${firstInitial}${lastInitial}`;
  }
  
  return user.email?.[0]?.toUpperCase() || '?';
}