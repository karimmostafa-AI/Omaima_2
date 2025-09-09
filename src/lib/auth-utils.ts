import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: 'ADMIN' | 'CUSTOMER';
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface LoginData {
  email: string;
  password: string;
}

// Password hashing utilities
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

// Session management
export async function createSession(user: AuthUser): Promise<void> {
  const cookieStore = await cookies();
  const sessionData = {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  };
  
  cookieStore.set('user_session', JSON.stringify(sessionData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7 // 7 days
  });
}

export async function getSession(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('user_session');
    
    if (!sessionCookie?.value) {
      return null;
    }
    
    const sessionData = JSON.parse(sessionCookie.value);
    return sessionData as AuthUser;
  } catch (error) {
    console.error('Session parsing error:', error);
    return null;
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('user_session');
}

// Authentication functions
export async function registerCustomer(data: RegisterData): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      return { success: false, error: 'User with this email already exists' };
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: 'CUSTOMER'
      }
    });

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      name: user.name || undefined,
      role: user.role as 'CUSTOMER'
    };

    return { success: true, user: authUser };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: 'Registration failed. Please try again.' };
  }
}

export async function authenticateUser(data: LoginData): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  try {
    // Check admin credentials first (from env variables)
    if (data.email === process.env.ADMIN_EMAIL && data.password === process.env.ADMIN_PASSWORD) {
      // Create or find admin user in database
      let adminUser = await prisma.user.findUnique({
        where: { email: process.env.ADMIN_EMAIL! }
      });

      if (!adminUser) {
        adminUser = await prisma.user.create({
          data: {
            email: process.env.ADMIN_EMAIL!,
            name: 'Admin',
            role: 'ADMIN',
            password: null // Admin uses env variables, not database password
          }
        });
      }

      const authUser: AuthUser = {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name || 'Admin',
        role: 'ADMIN'
      };

      return { success: true, user: authUser };
    }

    // Check customer credentials in database
    const user = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (!user || !user.password) {
      return { success: false, error: 'Invalid email or password' };
    }

    const isValidPassword = await verifyPassword(data.password, user.password);

    if (!isValidPassword) {
      return { success: false, error: 'Invalid email or password' };
    }

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      name: user.name || undefined,
      role: user.role as 'ADMIN' | 'CUSTOMER'
    };

    return { success: true, user: authUser };
  } catch (error) {
    console.error('Authentication error:', error);
    return { success: false, error: 'Login failed. Please try again.' };
  }
}

// Authorization helpers
export async function getCurrentUser(): Promise<AuthUser | null> {
  return await getSession();
}

export async function isAdmin(): Promise<boolean> {
  const user = await getSession();
  return user?.role === 'ADMIN';
}

export async function isCustomer(): Promise<boolean> {
  const user = await getSession();
  return user?.role === 'CUSTOMER';
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getSession();
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
}

export async function requireAdmin(): Promise<AuthUser> {
  const user = await getSession();
  if (!user || user.role !== 'ADMIN') {
    throw new Error('Admin access required');
  }
  return user;
}

export async function requireCustomer(): Promise<AuthUser> {
  const user = await getSession();
  if (!user || user.role !== 'CUSTOMER') {
    throw new Error('Customer access required');
  }
  return user;
}
