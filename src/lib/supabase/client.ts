import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

// Server-side client with service role (for admin operations)
export const createServerClient = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  
  if (!serviceRoleKey) {
    throw new Error('Missing Supabase service role key')
  }
  
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  })
}

// Database types based on our Prisma schema
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          phone: string | null
          avatar_url: string | null
          role: 'CUSTOMER' | 'STAFF' | 'ADMIN'
          email_verified: boolean
          password_hash: string
          created_at: string
          updated_at: string
          last_login: string | null
          is_active: boolean
          preferences: any | null
        }
        Insert: {
          id?: string
          email: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          role?: 'CUSTOMER' | 'STAFF' | 'ADMIN'
          email_verified?: boolean
          password_hash: string
          created_at?: string
          updated_at?: string
          last_login?: string | null
          is_active?: boolean
          preferences?: any | null
        }
        Update: {
          id?: string
          email?: string
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          role?: 'CUSTOMER' | 'STAFF' | 'ADMIN'
          email_verified?: boolean
          password_hash?: string
          created_at?: string
          updated_at?: string
          last_login?: string | null
          is_active?: boolean
          preferences?: any | null
        }
      }
      // Add other table types as needed
    }
    Views: {
      // Define views here
    }
    Functions: {
      // Define functions here
    }
    Enums: {
      UserRole: 'CUSTOMER' | 'STAFF' | 'ADMIN'
      ProductType: 'STANDARD' | 'CUSTOMIZABLE'
      ProductStatus: 'ACTIVE' | 'INACTIVE' | 'DRAFT'
      OrderStatus: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED'
      FinancialStatus: 'PENDING' | 'PAID' | 'PARTIALLY_PAID' | 'REFUNDED' | 'PARTIALLY_REFUNDED' | 'VOIDED'
      FulfillmentStatus: 'UNFULFILLED' | 'PARTIAL' | 'FULFILLED' | 'CANCELLED'
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']