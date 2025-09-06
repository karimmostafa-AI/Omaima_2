import { NextResponse, type NextRequest } from 'next/server'
import { securityService } from '@/lib/services/security-service'

/**
 * Get client IP address and basic location info
 * Used for security monitoring and admin access validation
 */
export async function GET(request: NextRequest) {
  try {
    const clientIP = securityService.getClientIP(request)
    const userAgent = request.headers.get('user-agent') || 'unknown'
    
    // Get additional headers that might contain location info
    const cfCountry = request.headers.get('cf-ipcountry')
    const cfCity = request.headers.get('cf-ipcity')
    const cfRegion = request.headers.get('cf-ipcontinent')
    
    // Determine location from headers (if available from CDN like Cloudflare)
    let location = 'Unknown Location'
    if (cfCity && cfCountry) {
      location = `${cfCity}, ${cfCountry}`
    } else if (cfCountry) {
      location = cfCountry
    }

    // Check if IP is from localhost/private network
    const isLocal = clientIP === '127.0.0.1' || 
                   clientIP === '::1' || 
                   clientIP.startsWith('192.168.') || 
                   clientIP.startsWith('10.') ||
                   clientIP.startsWith('172.')

    if (isLocal) {
      location = 'Local Network'
    }

    // Log the IP check request (non-sensitive)
    await securityService.logSecurityEvent({
      type: 'login',
      ip: clientIP,
      userAgent,
      details: {
        action: 'ip_check_request',
        location
      }
    })

    return NextResponse.json({
      ip: clientIP,
      location,
      isLocal,
      timestamp: new Date().toISOString(),
      userAgent,
      headers: {
        'cf-country': cfCountry,
        'cf-city': cfCity,
        'cf-region': cfRegion
      }
    })

  } catch (error) {
    console.error('Get IP error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to get IP information',
        ip: 'unknown',
        location: 'Unknown Location',
        isLocal: false,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}