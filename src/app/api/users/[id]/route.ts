import { NextRequest, NextResponse } from 'next/server';
import { UserService } from '@/lib/services/user-service';
import { z } from 'zod';
import { Gender } from '@prisma/client';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET handler for a single user
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await UserService.getUser(params.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (error) {
    console.error(`Error fetching user ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

const userUpdateSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().optional(),
  gender: z.nativeEnum(Gender).optional(),
  dateOfBirth: z.string().datetime().optional().transform((val) => val ? new Date(val) : undefined),
});

// PUT handler to update a user
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await request.json();
    const validation = userUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid user data', details: validation.error.flatten() }, { status: 400 });
    }

    const updatedUser = await UserService.updateUser(params.id, validation.data);
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error(`Error updating user ${params.id}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE handler to delete a user
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await UserService.deleteUser(params.id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`Error deleting user ${params.id}:`, error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
