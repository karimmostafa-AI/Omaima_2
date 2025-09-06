"use client"

import { useEffect, ComponentType, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
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
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
      const checkAuth = async () => {
        try {
          if (!requireAuth) {
            setLoading(false)
            return
          }

          const { data: { session } } = await supabase.auth.getSession()
          
          if (!session) {
            const currentPath = window.location.pathname
            const loginUrl = currentPath !== '/auth/login' && currentPath !== '/auth/register' 
              ? `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`
              : redirectTo
            router.push(loginUrl)
            return
          }

          const userRole = session.user?.user_metadata?.role || 'CUSTOMER'
          
          // Check role permissions
          if (!allowedRoles.includes(userRole as any)) {
            const dashboardPath = userRole === 'ADMIN' ? '/admin' : '/account'
            router.push(dashboardPath)
            return
          }

          setUser(session.user)
        } catch (error) {
          console.error('Auth check error:', error)
          if (requireAuth) {
            router.push(redirectTo)
          }
        } finally {
          setLoading(false)
        }
      }

      checkAuth()
    }, [requireAuth, allowedRoles, redirectTo, router])

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
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
      const checkAuth = async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession()
          
          if (session) {
            // Redirect authenticated users to dashboard
            const userRole = session.user?.user_metadata?.role || 'CUSTOMER'
            const dashboardPath = userRole === 'ADMIN' ? '/admin' : '/account'
            router.push(dashboardPath)
            return
          }
          
          setUser(null)
        } catch (error) {
          console.error('Guest auth check error:', error)
        } finally {
          setLoading(false)
        }
      }

      checkAuth()
    }, [router])

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
