export const PERMISSIONS = {
    admin: [
        'admin.dashboard.view',
    ],
    products: [
        'admin.products.read',
        'admin.products.create',
        'admin.products.edit',
        'admin.products.delete',
    ],
    categories: [
        'admin.categories.read',
        'admin.categories.create',
        'admin.categories.edit',
        'admin.categories.delete',
    ],
    orders: [
        'admin.orders.read',
        'admin.orders.edit',
    ],
    employees: [
        'admin.employees.read',
        'admin.employees.create',
        'admin.employees.edit',
        'admin.employees.delete',
    ],
    roles: [
        'admin.roles.read',
        'admin.roles.create',
        'admin.roles.edit',
        'admin.roles.delete',
    ],
    settings: [
        'admin.settings.read',
        'admin.settings.edit',
    ],
};

export const ALL_PERMISSIONS = Object.values(PERMISSIONS).flat();
