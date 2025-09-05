import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase';
import { prisma } from '@/lib/supabase';

// Define protected routes and their required roles
const protectedRoutes = {
  // Admin routes - require ADMIN role
  admin: {
    paths: ['/admin'],
    requiredRoles: ['ADMIN'],
  },
  // Staff routes - require STAFF or ADMIN role
  staff: {
    paths: ['/staff', '/dashboard/orders', '/dashboard/inventory'],
    requiredRoles: ['STAFF', 'ADMIN'],
  },
  // Customer dashboard - require any authenticated user
  dashboard: {
    paths: ['/dashboard', '/profile', '/orders', '/designs'],
    requiredRoles: ['CUSTOMER', 'STAFF', 'ADMIN'],
  },
  // Customizer - require any authenticated user
  customizer: {
    paths: ['/customize'],
    requiredRoles: ['CUSTOMER', 'STAFF', 'ADMIN'],
  },
};

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/auth/login',
  '/auth/register',
  '/auth/reset-password',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
  '/api/auth/reset-password',
  '/products',
  '/about',
  '/contact',
];

// Check if a path matches any of the protected route patterns
function getProtectedRouteConfig(pathname: string) {
  for (const [key, config] of Object.entries(protectedRoutes)) {
    if (config.paths.some(path => pathname.startsWith(path))) {
      return config;
    }
  }
  return null;
}

// Check if a path is public
function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(route => {
    if (route === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(route);
  });
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes (except auth)
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.') ||
    (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth/'))
  ) {
    return NextResponse.next();
  }

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Check if route requires authentication
  const routeConfig = getProtectedRouteConfig(pathname);
  if (!routeConfig) {
    return NextResponse.next();
  }

  try {
    const supabase = createClient();

    // Get session from cookies or headers
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      // Redirect to login with return URL
      const redirectUrl = new URL('/auth/login', request.url);
      redirectUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Get user role from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        role: true,
        isActive: true,
        emailVerified: true,
      },
    });

    if (!user) {
      // User not found in database, redirect to login
      const redirectUrl = new URL('/auth/login', request.url);
      redirectUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Check if user account is active
    if (!user.isActive) {
      const redirectUrl = new URL('/auth/account-suspended', request.url);
      return NextResponse.redirect(redirectUrl);
    }

    // Check if user has required role for this route
    if (!routeConfig.requiredRoles.includes(user.role)) {
      // Redirect based on user role
      let redirectPath = '/dashboard';
      if (user.role === 'ADMIN') {
        redirectPath = '/admin';
      } else if (user.role === 'STAFF') {
        redirectPath = '/staff';
      }

      const redirectUrl = new URL(redirectPath, request.url);
      return NextResponse.redirect(redirectUrl);
    }

    // Add user info to headers for use in pages
    const response = NextResponse.next();
    response.headers.set('x-user-id', session.user.id);
    response.headers.set('x-user-role', user.role);
    response.headers.set('x-user-email', session.user.email || '');

    return response;

  } catch (error) {
    console.error('Middleware error:', error);
    
    // On error, redirect to login
    const redirectUrl = new URL('/auth/login', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }
}

// Configure which routes should run the middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
