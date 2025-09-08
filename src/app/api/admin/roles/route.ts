import { NextRequest, NextResponse } from 'next/server';
import { RoleService } from '@/lib/services/role-service';

export async function GET(request: NextRequest) {
    try {
        const roles = await RoleService.getRoles();
        return NextResponse.json(roles);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Failed to fetch roles' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { name } = await request.json();
        if (!name) {
            return NextResponse.json({ error: 'Role name is required' }, { status: 400 });
        }
        const newRole = await RoleService.createRole(name);
        return NextResponse.json(newRole, { status: 201 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Failed to create role' }, { status: 500 });
    }
}
