import { NextRequest, NextResponse } from 'next/server';
import { RoleService } from '@/lib/services/role-service';

export async function GET(request: NextRequest) {
    try {
        const permissions = await RoleService.getPermissions();

        const groupedPermissions = permissions.reduce((acc, permission) => {
            const category = permission.name.split('.')[1] || 'general';
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(permission);
            return acc;
        }, {} as Record<string, typeof permissions>);

        return NextResponse.json(groupedPermissions);
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Failed to fetch permissions' }, { status: 500 });
    }
}
