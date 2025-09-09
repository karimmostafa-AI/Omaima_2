// Basic role service for MVP
// In this simplified version, we only have admin/user roles

export interface Role {
  id: string;
  name: string;
  permissions: string[];
}

export interface Permission {
  id: string;
  name: string;
  description: string;
}

export class RoleService {
  // For MVP, we have simple predefined roles
  private static readonly ROLES: Role[] = [
    {
      id: '1',
      name: 'admin',
      permissions: ['manage_products', 'manage_categories', 'manage_orders', 'view_dashboard']
    },
    {
      id: '2',
      name: 'user',
      permissions: ['view_products', 'create_orders']
    }
  ];

  private static readonly PERMISSIONS: Permission[] = [
    { id: '1', name: 'manage_products', description: 'Can create, edit, delete products' },
    { id: '2', name: 'manage_categories', description: 'Can create, edit, delete categories' },
    { id: '3', name: 'manage_orders', description: 'Can view and manage orders' },
    { id: '4', name: 'view_dashboard', description: 'Can access admin dashboard' },
    { id: '5', name: 'view_products', description: 'Can view products' },
    { id: '6', name: 'create_orders', description: 'Can place orders' },
  ];

  static async getAllRoles(): Promise<Role[]> {
    return this.ROLES;
  }

  static async getRoleById(id: string): Promise<Role | null> {
    return this.ROLES.find(role => role.id === id) || null;
  }

  static async getAllPermissions(): Promise<Permission[]> {
    return this.PERMISSIONS;
  }

  static async getUserRoles(userId: string): Promise<Role[]> {
    // For MVP, we'll determine roles based on user type
    // This would normally come from the database
    return [this.ROLES[1]]; // Default to user role
  }

  static async hasPermission(userId: string, permission: string): Promise<boolean> {
    const userRoles = await this.getUserRoles(userId);
    return userRoles.some(role => role.permissions.includes(permission));
  }
}
