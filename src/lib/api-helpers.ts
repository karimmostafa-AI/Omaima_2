import { NextRequest, NextResponse } from 'next/server'
import { ZodSchema, ZodError } from 'zod'
import { ApiResponse } from '@/types'

// API Response helpers
export function createApiResponse<T>(data?: T, error?: { message: string; code?: string; details?: any }): ApiResponse<T> {
  return {
    data,
    error
  }
}

export function successResponse<T>(data: T): NextResponse<ApiResponse<T>> {
  return NextResponse.json(createApiResponse(data), { status: 200 })
}

export function errorResponse(message: string, status: number = 400, code?: string, details?: any): NextResponse<ApiResponse<null>> {
  return NextResponse.json(
    createApiResponse(null, { message, code, details }),
    { status }
  )
}

export function notFoundResponse(message: string = 'Resource not found'): NextResponse<ApiResponse<null>> {
  return errorResponse(message, 404, 'NOT_FOUND')
}

export function unauthorizedResponse(message: string = 'Unauthorized'): NextResponse<ApiResponse<null>> {
  return errorResponse(message, 401, 'UNAUTHORIZED')
}

export function forbiddenResponse(message: string = 'Forbidden'): NextResponse<ApiResponse<null>> {
  return errorResponse(message, 403, 'FORBIDDEN')
}

export function validationErrorResponse(error: ZodError): NextResponse<ApiResponse<null>> {
  return errorResponse(
    'Validation failed',
    422,
    'VALIDATION_ERROR',
    error.errors
  )
}

export function internalServerErrorResponse(message: string = 'Internal server error'): NextResponse<ApiResponse<null>> {
  return errorResponse(message, 500, 'INTERNAL_SERVER_ERROR')
}

// Request validation
export async function validateRequest<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; error: ZodError }> {
  try {
    const body = await request.json()
    const data = schema.parse(body)
    return { success: true, data }
  } catch (error) {
    if (error instanceof ZodError) {
      return { success: false, error }
    }
    throw error
  }
}

// Query parameter helpers
export function getQueryParam(request: NextRequest, param: string): string | null {
  return request.nextUrl.searchParams.get(param)
}

export function getQueryParams(request: NextRequest): Record<string, string> {
  const params: Record<string, string> = {}
  request.nextUrl.searchParams.forEach((value, key) => {
    params[key] = value
  })
  return params
}

export function getPaginationParams(request: NextRequest): { page: number; limit: number; offset: number } {
  const page = Math.max(1, parseInt(getQueryParam(request, 'page') || '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(getQueryParam(request, 'limit') || '10', 10)))
  const offset = (page - 1) * limit
  
  return { page, limit, offset }
}

// CORS helper
export function addCorsHeaders(response: NextResponse): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return response
}

// Method validation
export function requireMethod(request: NextRequest, methods: string[]): boolean {
  return methods.includes(request.method)
}

export function methodNotAllowedResponse(allowedMethods: string[]): NextResponse<ApiResponse<null>> {
  return NextResponse.json(
    createApiResponse(null, { 
      message: `Method not allowed. Allowed methods: ${allowedMethods.join(', ')}`,
      code: 'METHOD_NOT_ALLOWED'
    }),
    { 
      status: 405,
      headers: {
        'Allow': allowedMethods.join(', ')
      }
    }
  )
}

// Error handler wrapper
export function withErrorHandler<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args)
    } catch (error) {
      console.error('API Error:', error)
      
      if (error instanceof ZodError) {
        return validationErrorResponse(error)
      }
      
      return internalServerErrorResponse(
        process.env.NODE_ENV === 'development' 
          ? error.message 
          : 'Internal server error'
      )
    }
  }
}

// Rate limiting helper (basic implementation)
const requestCounts = new Map<string, { count: number; resetTime: number }>()

export function rateLimit(ip: string, limit: number = 100, windowMs: number = 60 * 1000): boolean {
  const now = Date.now()
  const key = ip
  const current = requestCounts.get(key)
  
  if (!current || now > current.resetTime) {
    requestCounts.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }
  
  if (current.count >= limit) {
    return false
  }
  
  current.count++
  return true
}

export function rateLimitResponse(): NextResponse<ApiResponse<null>> {
  return errorResponse('Too many requests', 429, 'RATE_LIMIT_EXCEEDED')
}

// Authentication helpers
export function getAuthToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7)
}

// Request logging
export function logRequest(request: NextRequest, startTime: number = Date.now()) {
  if (process.env.NODE_ENV === 'development') {
    const duration = Date.now() - startTime
    console.log(`${request.method} ${request.url} - ${duration}ms`)
  }
}

// Search and filter helpers
export function buildSearchFilter(query?: string, fields: string[] = []): any {
  if (!query || fields.length === 0) return {}
  
  return {
    OR: fields.map(field => ({
      [field]: {
        contains: query,
        mode: 'insensitive'
      }
    }))
  }
}

export function buildSortOrder(sortBy?: string, sortOrder?: string): any {
  if (!sortBy) return { createdAt: 'desc' }
  
  const order = sortOrder === 'asc' ? 'asc' : 'desc'
  return { [sortBy]: order }
}