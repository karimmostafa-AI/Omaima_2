import { createClient } from '@/lib/supabase-middleware'
import { User } from '@/types'

/**
 * Get current authenticated user from Supabase and maps it to the unified User type.
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    // Map Supabase user to our unified User type
    return {
      id: user.id,
      email: user.email || '',
      firstName: user.user_metadata?.first_name || '',
      lastName: user.user_metadata?.last_name || '',
      role: user.user_metadata?.role || 'CUSTOMER',
      isActive: true, // Assuming active if logged in; adjust if a db field exists
      emailVerified: !!user.email_confirmed_at,
      avatarUrl: user.user_metadata?.avatar_url || null,
      createdAt: new Date(user.created_at),
      updatedAt: new Date(user.updated_at || user.created_at),
      lastLoginAt: user.last_sign_in_at ? new Date(user.last_sign_in_at) : null,
      phone: user.phone,
      // preferences: user.user_metadata?.preferences, // TODO: Add preferences to user_metadata
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// --- CONSOLIDATED ROLE-BASED ACCESS CONTROL ---

const roleHierarchy = {
  CUSTOMER: 1,
  STAFF: 2,
  ADMIN: 3,
};

/**
 * The single source of truth for checking user roles with hierarchy.
 * An ADMIN can do everything a STAFF can, and a STAFF can do everything a CUSTOMER can.
 * @param user The authenticated user object.
 * @param requiredRole The minimum role required for the action.
 * @returns {boolean} True if the user has the required role or higher.
 */
export function hasRequiredRole(user: User | null, requiredRole: keyof typeof roleHierarchy): boolean {
  if (!user) return false;
  const userLevel = roleHierarchy[user.role] || 0;
  const requiredLevel = roleHierarchy[requiredRole];
  return userLevel >= requiredLevel;
}

/**
 * Checks if a user is an administrator.
 * @param user The authenticated user object.
 * @returns {boolean} True if the user is an ADMIN.
 */
export function isAdmin(user: User | null): boolean {
  return hasRequiredRole(user, 'ADMIN');
}

/**
 * Checks if a user is staff or an administrator.
 * @param user The authenticated user object.
 * @returns {boolean} True if the user is STAFF or ADMIN.
 */
export function isStaff(user: User | null): boolean {
  return hasRequiredRole(user, 'STAFF');
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
export function getUserFullName(user: User | null): string {
  if (!user) return 'Anonymous';
  return `${user.firstName} ${user.lastName}`.trim() || user.email;
}

/**
 * Get user's initials for avatar
 */
export function getUserInitials(user: User | null): string {
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
export function canAccessAdmin(user: User | null): boolean {
  return isAdmin(user);
}

/**
 * Check if user can access staff features
 */
export function canAccessStaff(user: User | null): boolean {
  return isStaff(user);
}

/**
 * Get appropriate dashboard URL for user role
 */
export function getDashboardUrl(user: User | null): string {
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
