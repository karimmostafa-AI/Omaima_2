import { NextRequest } from 'next/server'
import { errorResponse } from '@/lib/api-helpers'

// Temporarily disabled - will implement once database is configured
export const POST = async (request: NextRequest) => {
  return errorResponse('Registration temporarily disabled', 501)
}
