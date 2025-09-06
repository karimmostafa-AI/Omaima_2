'use client';

import { useEffect, ComponentType } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { UserRole } from '@prisma/client';
import { Loader2 } from 'lucide-react';

export interface AuthOptions {
  requireAuth?: boolean;
  requiredRoles?: UserRole[];
  redirectTo?: string;
  fallbackComponent?: ComponentType;
}

/**
 * Higher-order component that provides authentication and role-based protection
 * 
 * @param WrappedComponent - Component to wrap with authentication
 * @param options - Authentication options
 */
export function withAuth<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: AuthOptions = {}
) {
  const {
    requireAuth = true,
    requiredRoles = [],
    redirectTo,
    fallbackComponent: FallbackComponent
  } = options;

  const AuthenticatedComponent = (props: P) => {
    const router = useRouter();
    const { 
      user, 
      isAuthenticated, 
      isLoading, 
      refreshAuth 
    } = useAppStore((state) => ({
      user: state.user,
      isAuthenticated: state.isAuthenticated,
      isLoading: state.isLoading,
      refreshAuth: state.refreshAuth,
    }));

    useEffect(() => {
      // Initialize authentication check on mount
      if (!isAuthenticated && !user && !isLoading) {
        refreshAuth();
      }
    }, [isAuthenticated, user, isLoading, refreshAuth]);

    useEffect(() => {
      // Handle authentication requirements
      if (!isLoading) {
        if (requireAuth && !isAuthenticated) {
          const redirectPath = redirectTo || '/auth/login';
          const currentPath = window.location.pathname;
          
          // Add return URL if not already on auth pages
          if (currentPath !== '/auth/login' && currentPath !== '/auth/register') {
            router.push(`${redirectPath}?redirect=${encodeURIComponent(currentPath)}`);
          } else {
            router.push(redirectPath);
          }
          return;
        }

        // Handle role-based access control
        if (requireAuth && isAuthenticated && user && requiredRoles.length > 0) {
          const hasRequiredRole = requiredRoles.includes(user.role);
          
          if (!hasRequiredRole) {
            // Redirect to appropriate dashboard based on user role
            let dashboardPath = '/dashboard';
            if (user.role === 'ADMIN') {
              dashboardPath = '/admin';
            } else if (user.role === 'STAFF') {
              dashboardPath = '/staff';
            }
            
            router.push(dashboardPath);
            return;
          }
        }

        // Check if user account is active
        if (requireAuth && isAuthenticated && user && !user.isActive) {
          router.push('/auth/account-suspended');
          return;
        }
      }
    }, [
      isLoading, 
      requireAuth, 
      isAuthenticated, 
      user, 
      requiredRoles, 
      redirectTo, 
      router
    ]);

    // Show loading spinner while checking authentication
    if (isLoading) {
      if (FallbackComponent) {
        return <FallbackComponent />;
      }
      
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      );
    }

    // Show loading if authentication is required but not yet verified
    if (requireAuth && !isAuthenticated) {
      if (FallbackComponent) {
        return <FallbackComponent />;
      }
      
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">Authenticating...</p>
          </div>
        </div>
      );
    }

    // Show loading if role check is in progress
    if (requireAuth && isAuthenticated && user && requiredRoles.length > 0) {
      const hasRequiredRole = requiredRoles.includes(user.role);
      if (!hasRequiredRole) {
        if (FallbackComponent) {
          return <FallbackComponent />;
        }
        
        return (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">Redirecting...</p>
            </div>
          </div>
        );
      }
    }

    // Render the wrapped component
    return <WrappedComponent {...props} />;
  };

  AuthenticatedComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name})`;

  return AuthenticatedComponent;
}

/**
 * HOC for protecting admin routes
 */
export const withAdminAuth = <P extends object>(Component: ComponentType<P>) =>
  withAuth(Component, {
    requireAuth: true,
    requiredRoles: ['ADMIN'],
  });

/**
 * HOC for protecting staff routes (staff and admin access)
 */
export const withStaffAuth = <P extends object>(Component: ComponentType<P>) =>
  withAuth(Component, {
    requireAuth: true,
    requiredRoles: ['STAFF', 'ADMIN'],
  });

/**
 * HOC for protecting customer routes (any authenticated user)
 */
export const withCustomerAuth = <P extends object>(Component: ComponentType<P>) =>
  withAuth(Component, {
    requireAuth: true,
    requiredRoles: ['CUSTOMER', 'STAFF', 'ADMIN'],
  });

/**
 * HOC for routes that require authentication but no specific role
 */
export const withAuthRequired = <P extends object>(Component: ComponentType<P>) =>
  withAuth(Component, {
    requireAuth: true,
  });

/**
 * HOC for guest-only routes (redirect to dashboard if authenticated)
 */
export const withGuestOnly = <P extends object>(Component: ComponentType<P>) => {
  const GuestOnlyComponent = (props: P) => {
    const router = useRouter();
    const { isAuthenticated, user, isLoading } = useAppStore((state) => ({
      isAuthenticated: state.isAuthenticated,
      user: state.user,
      isLoading: state.isLoading,
    }));

    useEffect(() => {
      if (!isLoading && isAuthenticated && user) {
        // Redirect to appropriate dashboard
        let dashboardPath = '/dashboard';
        if (user.role === 'ADMIN') {
          dashboardPath = '/admin';
        } else if (user.role === 'STAFF') {
          dashboardPath = '/staff';
        }
        
        router.push(dashboardPath);
      }
    }, [isAuthenticated, user, isLoading, router]);

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      );
    }

    if (isAuthenticated) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">Redirecting...</p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };

  GuestOnlyComponent.displayName = `withGuestOnly(${Component.displayName || Component.name})`;

  return GuestOnlyComponent;
};
