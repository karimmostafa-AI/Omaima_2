import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// =============================================
// Supabase Configuration for Edge Runtime
// =============================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validate environment variables
function validateSupabaseConfig(): { url: string; key: string; isValid: boolean } {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase environment variables. Using placeholder values for development.')
    return {
      url: 'https://placeholder.supabase.co',
      key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDk3NzUyMDAsImV4cCI6MTk2NTM1MTIwMH0.fake-key-for-development',
      isValid: false
    }
  }

  // Validate URL format
  try {
    new URL(supabaseUrl)
    return {
      url: supabaseUrl,
      key: supabaseAnonKey,
      isValid: true
    }
  } catch (error) {
    console.error('Invalid Supabase URL format:', supabaseUrl)
    return {
      url: 'https://placeholder.supabase.co',
      key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDk3NzUyMDAsImV4cCI6MTk2NTM1MTIwMH0.fake-key-for-development',
      isValid: false
    }
  }
}

const config = validateSupabaseConfig()

/**
 * Create Supabase client for middleware (Edge Runtime compatible)
 */
export function createClient() {
  if (!config.isValid) {
    // Return a mock client for development when env vars are missing
    return {
      auth: {
        getSession: async () => ({ data: { session: null }, error: new Error('Supabase not configured') }),
        signOut: async () => ({ error: null }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            single: async () => ({ data: null, error: new Error('Supabase not configured') }),
            limit: async () => ({ data: [], error: new Error('Supabase not configured') }),
          }),
          gte: () => ({
            eq: () => ({ data: [], error: new Error('Supabase not configured') }),
          }),
          order: () => ({
            limit: async () => ({ data: [], error: new Error('Supabase not configured') }),
          }),
        }),
        insert: async () => ({ data: null, error: new Error('Supabase not configured') }),
        update: () => ({
          eq: async () => ({ data: null, error: new Error('Supabase not configured') }),
        }),
        delete: () => ({
          eq: async () => ({ data: null, error: new Error('Supabase not configured') }),
        }),
      })
    } as any
  }

  return createSupabaseClient(
    config.url,
    config.key,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  )
}