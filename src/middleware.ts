import { NextResponse, type NextRequest } from 'next/server'
import { getSession } from '@/lib/auth'

// Simple admin route protection
const adminRoutes = ['/admin']
const publicRoutes = [
  '/',
  '/products',
  '/auth/login',
  '/api/auth/login',
  '/api/auth/logout',
  '/api/products'
]

// Routes that should bypass middleware entirely
const bypassRoutes = [
  '/_next',
  '/static',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml'
]

function shouldBypassMiddleware(pathname: string): boolean {
  return bypassRoutes.some(route => pathname.startsWith(route)) || 
         pathname.includes('.')
}

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(route => {
    if (route === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(route)
  })
}

function isAdminRoute(pathname: string): boolean {
  return adminRoutes.some(route => pathname.startsWith(route))
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for static files and bypass routes
  if (shouldBypassMiddleware(pathname)) {
    return NextResponse.next()
  }

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next()
  }

  // Check if this is an admin route
  if (isAdminRoute(pathname)) {
    const user = await getSession()
    
    if (!user || user.role !== 'ADMIN') {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      
      const redirectUrl = new URL('/auth/login', request.url)
      redirectUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }

  return NextResponse.next()
}

// Configure which routes should run the middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (png, jpg, jpeg, gif, svg, webp)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp)$).*)',
  ],
}
