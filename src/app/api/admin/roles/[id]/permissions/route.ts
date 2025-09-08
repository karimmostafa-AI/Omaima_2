import { NextRequest, NextResponse } from 'next/server';
import { RoleService } from '@/lib/services/role-service';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const { permissionIds } = await request.json();
        if (!Array.isArray(permissionIds)) {
            return NextResponse.json({ error: 'permissionIds must be an array' }, { status: 400 });
        }

        await RoleService.syncPermissions(params.id, permissionIds);
        return NextResponse.json({ message: 'Permissions updated successfully' });

    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Failed to update permissions' }, { status: 500 });
    }
}
