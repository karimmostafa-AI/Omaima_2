import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase-middleware';
import { securityService } from '@/lib/services/security-service';

// Define protected routes and their security requirements
interface RouteConfig {
  paths: string[]
  requiredRoles: string[]
  requiresMFA?: boolean
  ipWhitelist?: string[]
  additionalSecurity?: {
    requireAdminSession?: boolean
    sessionTimeout?: number
    maxConcurrentSessions?: number
  }
}

const protectedRoutes: Record<string, RouteConfig> = {
  // Admin routes - enhanced security
  admin: {
    paths: ['/admin', '/omaima/admin'],
    requiredRoles: ['ADMIN'],
    requiresMFA: true,
    ipWhitelist: [
      '192.168.1.0/24',  // Local network
      '10.0.0.0/8',      // Private network  
      '127.0.0.1',       // Localhost
      '::1'              // IPv6 localhost
    ],
    additionalSecurity: {
      requireAdminSession: true,
      sessionTimeout: 30 * 60 * 1000, // 30 minutes
      maxConcurrentSessions: 2
    }
  },
  // Staff routes - moderate security
  staff: {
    paths: ['/staff', '/dashboard/orders', '/dashboard/inventory'],
    requiredRoles: ['STAFF', 'ADMIN'],
  },
  // Customer dashboard - standard security
  customer: {
    paths: ['/dashboard', '/profile', '/orders', '/designs', '/account'],
    requiredRoles: ['CUSTOMER', 'STAFF', 'ADMIN'],
  },
  // Customizer - authenticated users only
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
  '/auth/callback',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
  '/api/auth/reset-password',
  '/api/auth/callback',
  '/api/auth/get-ip',
  '/products',
  '/about',
  '/contact',
  '/setup-admin'
];

// Routes that should bypass middleware entirely
const bypassRoutes = [
  '/_next',
  '/static',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml'
];

// Helper functions
function getRouteConfig(pathname: string): RouteConfig | null {
  for (const [key, config] of Object.entries(protectedRoutes)) {
    if (config.paths.some(path => pathname.startsWith(path))) {
      return config;
    }
  }
  return null;
}

function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(route => {
    if (route === '/') {
      return pathname === '/';
    }
    return pathname.startsWith(route);
  });
}

function shouldBypassMiddleware(pathname: string): boolean {
  return bypassRoutes.some(route => pathname.startsWith(route)) || 
         pathname.includes('.');
}

function getClientIP(request: NextRequest): string {
  return securityService.getClientIP(request);
}

function getUserAgent(request: NextRequest): string {
  return request.headers.get('user-agent') || 'unknown';
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const clientIP = getClientIP(request);
  const userAgent = getUserAgent(request);

  // Skip middleware for static files and bypass routes
  if (shouldBypassMiddleware(pathname)) {
    return NextResponse.next();
  }

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Check if route requires protection
  const routeConfig = getRouteConfig(pathname);
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

    // Enhanced security logging
    await securityService.logSecurityEvent({
      type: 'login',
      userId: session.user.id,
      ip: clientIP,
      userAgent,
      timestamp: new Date(),
      details: { 
        action: 'route_access_attempt',
        path: pathname,
        method: request.method
      }
    });

    // Get user data with role and additional security info
    const { data: user, error: userError } = await supabase
      .from('users')
      .select(`
        id, email, role, isActive, emailVerified, 
        mfaEnabled, lastLoginAt, createdAt
      `)
      .eq('id', session.user.id)
      .single();

    if (userError || !user) {
      console.error('User fetch error:', userError);
      const redirectUrl = new URL('/auth/login', request.url);
      redirectUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Check if user account is active
    if (!user.isActive) {
      await securityService.logSecurityEvent({
        type: 'failed_login',
        userId: user.id,
        ip: clientIP,
        userAgent,
        timestamp: new Date(),
        details: { reason: 'account_suspended' }
      });
      
      const redirectUrl = new URL('/auth/account-suspended', request.url);
      return NextResponse.redirect(redirectUrl);
    }

    // Enhanced admin route security
    if (routeConfig.paths.some(path => pathname.startsWith(path) && path.includes('admin'))) {
      return await handleAdminRouteAccess(request, routeConfig, user, clientIP, userAgent, session);
    }

    // Standard role-based access control
    if (!routeConfig.requiredRoles.includes(user.role)) {
      await securityService.logSecurityEvent({
        type: 'failed_login',
        userId: user.id,
        ip: clientIP,
        userAgent,
        timestamp: new Date(),
        details: { 
          reason: 'insufficient_role',
          requiredRoles: routeConfig.requiredRoles,
          userRole: user.role
        }
      });

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

    // Check for suspicious activity
    const suspiciousActivity = await securityService.detectSuspiciousActivity({
      userId: user.id,
      ip: clientIP
    });

    if (suspiciousActivity) {
      await securityService.triggerSecurityAlert(suspiciousActivity);
      
      // For critical alerts, block access
      if (suspiciousActivity.severity === 'critical') {
        const redirectUrl = new URL('/auth/security-alert', request.url);
        return NextResponse.redirect(redirectUrl);
      }
    }

    // Create response with security headers
    const response = NextResponse.next();
    
    // Add security headers
    response.headers.set('x-user-id', session.user.id);
    response.headers.set('x-user-role', user.role);
    response.headers.set('x-user-email', session.user.email || '');
    response.headers.set('x-security-level', routeConfig.requiresMFA ? 'enhanced' : 'basic');
    response.headers.set('x-client-ip', clientIP);
    
    // Security headers for all responses
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    
    return response;

  } catch (error) {
    console.error('Middleware error:', error);
    
    // Log security error
    await securityService.logSecurityEvent({
      type: 'suspicious_activity',
      ip: clientIP,
      userAgent,
      timestamp: new Date(),
      details: { 
        error: 'middleware_error',
        message: error instanceof Error ? error.message : 'Unknown error',
        path: pathname
      }
    });
    
    // On error, redirect to login
    const redirectUrl = new URL('/auth/login', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    redirectUrl.searchParams.set('error', 'security_error');
    return NextResponse.redirect(redirectUrl);
  }
}

/**
 * Enhanced admin route access handler with additional security measures
 */
async function handleAdminRouteAccess(
  request: NextRequest,
  routeConfig: RouteConfig,
  user: any,
  clientIP: string,
  userAgent: string,
  session: any
): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // Check IP whitelist for admin routes
  if (routeConfig.ipWhitelist && routeConfig.ipWhitelist.length > 0) {
    const isIPAllowed = await securityService.validateIPAddress(clientIP, routeConfig.ipWhitelist);
    
    if (!isIPAllowed) {
      await securityService.logSecurityEvent({
        type: 'ip_blocked',
        userId: user.id,
        ip: clientIP,
        userAgent,
        timestamp: new Date(),
        details: {
          reason: 'admin_ip_not_whitelisted',
          path: pathname,
          whitelist: routeConfig.ipWhitelist
        }
      });
      
      const redirectUrl = new URL('/auth/ip-blocked', request.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Check MFA requirement for admin routes
  if (routeConfig.requiresMFA && !user.mfaEnabled) {
    await securityService.logSecurityEvent({
      type: 'failed_login',
      userId: user.id,
      ip: clientIP,
      userAgent,
      timestamp: new Date(),
      details: {
        reason: 'mfa_required_but_not_enabled',
        path: pathname
      }
    });
    
    const redirectUrl = new URL('/auth/setup-mfa', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Check admin session requirements
  if (routeConfig.additionalSecurity?.requireAdminSession) {
    const adminSessionToken = request.cookies.get('admin-session-token')?.value;
    
    if (!adminSessionToken) {
      const redirectUrl = new URL('/auth/admin-login', request.url);
      redirectUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Validate admin session
    const supabase = createClient();
    const { data: adminSession } = await supabase
      .from('admin_sessions')
      .select('*')
      .eq('sessionToken', adminSessionToken)
      .eq('userId', user.id)
      .eq('isActive', true)
      .single();

    if (!adminSession || new Date(adminSession.expiresAt) < new Date()) {
      await securityService.logSecurityEvent({
        type: 'failed_login',
        userId: user.id,
        ip: clientIP,
        userAgent,
        timestamp: new Date(),
        details: {
          reason: 'invalid_admin_session',
          path: pathname
        }
      });
      
      const redirectUrl = new URL('/auth/admin-login', request.url);
      redirectUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Rate limiting for admin routes
  const rateLimitResult = await securityService.checkRateLimit(
    `${user.id}:${clientIP}`, 
    'admin_access'
  );
  
  if (!rateLimitResult.allowed) {
    await securityService.logSecurityEvent({
      type: 'failed_login',
      userId: user.id,
      ip: clientIP,
      userAgent,
      timestamp: new Date(),
      details: {
        reason: 'admin_rate_limit_exceeded',
        path: pathname,
        remaining: rateLimitResult.remaining
      }
    });
    
    const redirectUrl = new URL('/auth/rate-limited', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Increment rate limit counter
  await securityService.incrementRateLimit(`${user.id}:${clientIP}`, 'admin_access');

  // Log successful admin access
  await securityService.logSecurityEvent({
    type: 'admin_access',
    userId: user.id,
    ip: clientIP,
    userAgent,
    timestamp: new Date(),
    details: {
      action: 'admin_route_access_granted',
      path: pathname,
      security_level: 'enhanced'
    }
  });

  // Continue with the request
  const response = NextResponse.next();
  
  // Add enhanced admin headers
  response.headers.set('x-admin-session', 'verified');
  response.headers.set('x-security-level', 'admin');
  response.headers.set('x-rate-limit-remaining', rateLimitResult.remaining.toString());
  
  return response;
}

// Configure which routes should run the middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes, handled separately)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (png, jpg, jpeg, gif, svg, webp)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp)$).*)',
  ],
};