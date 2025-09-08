import { prisma } from '@/lib/db';
import { Role, Permission } from '@prisma/client';

export class RoleService {
  /**
   * Get all roles with their permissions.
   */
  static async getRoles(): Promise<Role[]> {
    return prisma.role.findMany({
      include: {
        permissions: { include: { permission: true } },
      },
    });
  }

  /**
   * Get all available permissions.
   */
  static async getPermissions(): Promise<Permission[]> {
      return prisma.permission.findMany({
          orderBy: { name: 'asc' }
      });
  }

  /**
   * Create a new role.
   */
  static async createRole(name: string): Promise<Role> {
    return prisma.role.create({
      data: { name },
    });
  }

  /**
   * Update the permissions for a given role.
   */
  static async syncPermissions(roleId: string, permissionIds: string[]): Promise<void> {
    await prisma.$transaction(async (tx) => {
      await tx.rolePermissions.deleteMany({
        where: { roleId },
      });

      if (permissionIds.length > 0) {
        await tx.rolePermissions.createMany({
          data: permissionIds.map(permissionId => ({
            roleId,
            permissionId,
          })),
        });
      }
    });
  }
}
