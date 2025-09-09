import { cookies } from 'next/headers'

export interface SimpleUser {
  id: string
  email: string
  role: 'ADMIN' | 'CUSTOMER'
}

// Simple hardcoded authentication
export function validateAdminCredentials(email: string, password: string): boolean {
  return email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD
}

// Simple session management using cookies
export async function createSession(user: SimpleUser) {
  const cookieStore = await cookies()
  cookieStore.set('user_session', JSON.stringify(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 // 24 hours
  })
}

export async function getSession(): Promise<SimpleUser | null> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('user_session')
    
    if (!sessionCookie) {
      return null
    }
    
    return JSON.parse(sessionCookie.value) as SimpleUser
  } catch {
    return null
  }
}

export async function destroySession() {
  const cookieStore = await cookies()
  cookieStore.delete('user_session')
}

export async function requireAdmin(): Promise<SimpleUser> {
  const user = await getSession()
  
  if (!user || user.role !== 'ADMIN') {
    throw new Error('Admin access required')
  }
  
  return user
}

export async function getCurrentUser(): Promise<SimpleUser | null> {
  return await getSession()
}

export async function isAdmin(): Promise<boolean> {
  const user = await getSession()
  return user?.role === 'ADMIN' || false
}

export async function hasRequiredRole(requiredRole: string): Promise<boolean> {
  const user = await getSession()
  return user?.role === requiredRole || false
}
