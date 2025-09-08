'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

// Add type definitions
interface Permission {
  id: string;
  name: string;
  description?: string;
}

interface RolePermission {
  permission: {
    id: string;
  };
}

interface Role {
  id: string;
  name: string;
  permissions: RolePermission[];
}

type PermissionsMap = Record<string, Permission[]>;

export default function RolesPage() {
  const { toast } = useToast();
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [permissions, setPermissions] = useState<PermissionsMap>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');

  const fetchRoles = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/roles');
      const data: Role[] = await response.json();
      setRoles(data);
      if (data.length > 0 && !selectedRole) {
        setSelectedRole(data[0]);
      }
    } catch (error) {
      console.error("Failed to fetch roles", error);
    }
  }, [selectedRole]);

  const fetchPermissions = useCallback(async () => {
    try {
        const response = await fetch('/api/admin/permissions');
        const data: PermissionsMap = await response.json();
        setPermissions(data);
    } catch (error) {
        console.error("Failed to fetch permissions", error);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, [fetchRoles, fetchPermissions]);

  const handlePermissionToggle = (permissionId: string, granted: boolean) => {
    if (!selectedRole) return;

    let updatedPermissionIds: string[];
    const currentPermissionIds = selectedRole.permissions.map(p => p.permission.id);

    if (granted) {
      updatedPermissionIds = [...currentPermissionIds, permissionId];
    } else {
      updatedPermissionIds = currentPermissionIds.filter(id => id !== permissionId);
    }

    const newSelectedRole: Role = {
        ...selectedRole,
        permissions: updatedPermissionIds.map(id => ({ permission: { id } }))
    };
    setSelectedRole(newSelectedRole);
  };

  const handleUpdatePermissions = async () => {
      if (!selectedRole) return;
      try {
        await fetch(`/api/admin/roles/${selectedRole.id}/permissions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ permissionIds: selectedRole.permissions.map(p => p.permission.id) })
        });
        toast({ title: 'Success', description: `Permissions for ${selectedRole.name} updated.` });
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to update permissions.', variant: 'destructive' });
      }
  }

  const handleCreateRole = async () => {
      if (!newRoleName) return;
      try {
        await fetch('/api/admin/roles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newRoleName })
        });
        setNewRoleName('');
        setIsModalOpen(false);
        fetchRoles();
        toast({ title: 'Success', description: `Role "${newRoleName}" created.` });
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to create role.', variant: 'destructive' });
      }
  }

  return (
    <>
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Roles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {roles.map((role) => (
                <div
                  key={role.id}
                  className={`p-3 rounded-md cursor-pointer ${
                    selectedRole?.id === role.id ? 'bg-muted' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedRole(role)}
                >
                  {role.name}
                </div>
              ))}
              <Button className="w-full mt-4" onClick={() => setIsModalOpen(true)}>Add New Role</Button>
            </div>
          </CardContent>
        </Card>

        {selectedRole && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Permissions for {selectedRole.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(permissions).map(([category, perms]) => (
                    <div key={category}>
                      <h3 className="font-medium mb-2 capitalize">{category.replace('_', ' ')}</h3>
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                        {perms.map((permission) => (
                          <div key={permission.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`perm-${permission.id}`}
                              checked={selectedRole.permissions?.some(p => p.permission.id === permission.id)}
                              onCheckedChange={(checked) => handlePermissionToggle(permission.id, !!checked)}
                            />
                            <label htmlFor={`perm-${permission.id}`} className="text-sm">{permission.name.split('.').pop()?.replace('_', ' ')}</label>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
              <div className="flex justify-end mt-6">
                  <Button onClick={handleUpdatePermissions}>Update Permissions</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Add New Role</DialogTitle>
            </DialogHeader>
            <div className="py-4">
                <Input placeholder="Role Name" value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)} />
            </div>
            <DialogFooter>
                <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateRole}>Create Role</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
