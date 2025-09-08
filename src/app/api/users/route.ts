import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/lib/services/user-service';
import { z } from 'zod';
import { UserRole, Gender } from '@prisma/client';

// GET handler to list all users (customers by default)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filters = {
        role: searchParams.get('role') as UserRole || UserRole.CUSTOMER,
        page: parseInt(searchParams.get('page') || '1', 10),
        limit: parseInt(searchParams.get('limit') || '10', 10),
        search: searchParams.get('search') || undefined,
    }

    const result = await UserService.getUsers(filters);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

const userCreateSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  gender: z.nativeEnum(Gender).optional(),
  dateOfBirth: z.string().datetime().optional().transform((val) => val ? new Date(val) : undefined),
  avatarUrl: z.string().optional(),
});

// POST handler to create a new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = userCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid user data', details: validation.error.flatten() }, { status: 400 });
    }

    const newUser = await UserService.createUser({
        ...validation.data,
        role: UserRole.CUSTOMER,
    });
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Failed to create user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
