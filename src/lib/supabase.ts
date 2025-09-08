import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { PrismaClient } from '@prisma/client'

// =============================================
// Supabase Configuration
// =============================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Check if we're in demo mode (missing or demo environment variables)
const isDemoMode = !supabaseUrl || !supabaseAnonKey || 
                  supabaseUrl.includes('demo') || 
                  supabaseUrl === 'https://your-project.supabase.co'

if (isDemoMode) {
  console.log('🚀 Running in demo mode - using mock authentication')
} else if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Missing Supabase environment variables - check your .env.local file')
}

// Client-side Supabase client
export const supabase = isDemoMode 
  ? createSupabaseClient('https://demo.supabase.co', 'demo-key', {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : createSupabaseClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    })

// Server-side Supabase client with service role key (optional)
export const supabaseAdmin = process.env.SUPABASE_SERVICE_ROLE_KEY 
  ? createSupabaseClient(
      supabaseUrl,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
  : null

// =============================================
// Prisma Configuration
// =============================================

declare global {
  var __prisma: PrismaClient | undefined
}

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit during development
export const prisma = globalThis.__prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  errorFormat: 'pretty',
})

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma
}

// Handle graceful shutdown (only in Node.js environment, not Edge Runtime)
if (typeof window === 'undefined' && typeof process !== 'undefined' && process.on) {
  try {
    process.on('beforeExit', async () => {
      await prisma.$disconnect()
    })
  } catch (error) {
    // Ignore errors in Edge Runtime environment
    console.debug('Process handlers not available in Edge Runtime')
  }
}

// =============================================
// Helper Functions
// =============================================

/**
 * Create or get Supabase client for server-side operations
 */
export function createServerClient(req?: Request) {
  return createSupabaseClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  )
}

/**
 * Create Supabase client for middleware (alias for createServerClient)
 */
export function createClient(req?: Request) {
  return createSupabaseClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  )
}

/**
 * Sync Supabase auth user with Prisma database
 */
export async function syncUserWithDatabase(supabaseUser: any) {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: supabaseUser.email }
    })

    if (existingUser) {
      // Update last login
      return await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          lastLogin: new Date(),
          emailVerified: supabaseUser.email_confirmed_at ? true : false
        }
      })
    } else {
      // Create new user from Supabase auth
      return await prisma.user.create({
        data: {
          id: supabaseUser.id,
          email: supabaseUser.email,
          firstName: supabaseUser.user_metadata?.first_name || null,
          lastName: supabaseUser.user_metadata?.last_name || null,
          avatarUrl: supabaseUser.user_metadata?.avatar_url || null,
          emailVerified: supabaseUser.email_confirmed_at ? true : false,
          passwordHash: '', // Supabase handles auth, we don't store password hashes
          lastLogin: new Date(),
          preferences: {
            currency: 'USD',
            language: 'en',
            notifications: {
              email: true,
              sms: false,
              marketing: false
            },
            theme: 'system'
          }
        }
      })
    }
  } catch (error) {
    console.error('Error syncing user with database:', error)
    throw error
  }
}

/**
 * Get user with full profile data from database
 */
export async function getUserProfile(userId: string) {
  return await prisma.user.findUnique({
    where: { id: userId },
    include: {
      orders: {
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          items: true
        }
      },
      savedDesigns: {
        take: 10,
        orderBy: { updatedAt: 'desc' },
        include: {
          template: true
        }
      }
    }
  })
}

/**
 * Create database connection string from Supabase config
 */
export function getDatabaseUrl() {
  const host = process.env.SUPABASE_DB_HOST || 'db.supabase.co'
  const dbName = process.env.SUPABASE_DB_NAME || 'postgres'
  const user = process.env.SUPABASE_DB_USER || 'postgres'
  const password = process.env.SUPABASE_DB_PASSWORD || ''
  const port = process.env.SUPABASE_DB_PORT || '5432'
  
  return `postgresql://${user}:${password}@${host}:${port}/${dbName}?schema=public&sslmode=require`
}

export default prisma
