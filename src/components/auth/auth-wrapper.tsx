"use client"

import { useEffect, ComponentType } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { Loader2 } from 'lucide-react'

interface AuthWrapperProps {
  requireAuth?: boolean
  allowedRoles?: ('CUSTOMER' | 'STAFF' | 'ADMIN')[]
  redirectTo?: string
  fallback?: React.ReactNode
}

/**
 * Higher-order component for authentication and role-based protection
 */
export function withAuth<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: AuthWrapperProps = {}
) {
  const {
    requireAuth = true,
    allowedRoles = ['CUSTOMER', 'STAFF', 'ADMIN'],
    redirectTo = '/auth/login',
    fallback
  } = options

  const AuthComponent = (props: P) => {
    const router = useRouter()
    const { user, loading } = useAuthStore()

    useEffect(() => {
      if (loading) return

      if (requireAuth) {
        if (!user) {
          // Redirect to login with return URL
          const currentPath = window.location.pathname
          const loginUrl = currentPath !== '/auth/login' && currentPath !== '/auth/register' 
            ? `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`
            : redirectTo
          router.push(loginUrl)
          return
        }

        // Check role permissions
        if (!allowedRoles.includes(user.role)) {
          // Redirect to appropriate dashboard
          const dashboardPath = user.role === 'ADMIN' ? '/admin' : '/account'
          router.push(dashboardPath)
          return
        }
      }
    }, [user, loading, router])

    // Show loading while checking auth
    if (loading) {
      if (fallback) return <>{fallback}</>
      
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      )
    }

    // Show loading if auth is required but user not loaded
    if (requireAuth && !user) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">Authenticating...</p>
          </div>
        </div>
      )
    }

    return <WrappedComponent {...props} />
  }

  AuthComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name})`
  return AuthComponent
}

/**
 * HOC for guest-only routes (redirect authenticated users)
 */
export function withGuestOnly<P extends object>(Component: ComponentType<P>) {
  const GuestComponent = (props: P) => {
    const router = useRouter()
    const { user, loading } = useAuthStore()

    useEffect(() => {
      if (loading) return

      if (user) {
        // Redirect authenticated users to dashboard
        const dashboardPath = user.role === 'ADMIN' ? '/admin' : '/account'
        router.push(dashboardPath)
      }
    }, [user, loading, router])

    if (loading || user) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">
              {loading ? 'Loading...' : 'Redirecting...'}
            </p>
          </div>
        </div>
      )
    }

    return <Component {...props} />
  }

  GuestComponent.displayName = `withGuestOnly(${Component.displayName || Component.name})`
  return GuestComponent
}

/**
 * Convenient HOCs for specific roles
 */
export const withAdminAuth = <P extends object>(Component: ComponentType<P>) =>
  withAuth(Component, { requireAuth: true, allowedRoles: ['ADMIN'] })

export const withCustomerAuth = <P extends object>(Component: ComponentType<P>) =>
  withAuth(Component, { requireAuth: true, allowedRoles: ['CUSTOMER', 'STAFF', 'ADMIN'] })

export const withAnyAuth = <P extends object>(Component: ComponentType<P>) =>
  withAuth(Component, { requireAuth: true })
