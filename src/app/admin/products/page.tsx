'use client'

import React from 'react'
import { ColumnDef } from '@tanstack/react-table'
import { AdminLayout } from '@/components/layout/admin-layout'
import { DataTable, DataTableColumnHeader, DataTableRowActions } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatPrice } from '@/lib/utils'
import { 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  CheckCircle,
  XCircle,
  AlertCircle,
  Package
} from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'

// Mock data - replace with real data fetching
interface Product {
  id: string
  name: string
  sku: string
  thumbnail: string
  price: number
  discountPrice?: number
  category: string
  stock: number
  status: 'active' | 'inactive' | 'draft'
  isApproved: boolean
  shop: {
    name: string
    id: string
  }
  createdAt: string
}

const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Professional Blazer Set',
    sku: 'BLZ-001',
    thumbnail: '/products/blazer.jpg',
    price: 199.99,
    discountPrice: 179.99,
    category: 'Blazers',
    stock: 25,
    status: 'active',
    isApproved: true,
    shop: { name: 'Omaima Store', id: '1' },
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    name: 'Executive Pants',
    sku: 'PNT-002',
    thumbnail: '/products/pants.jpg',
    price: 89.99,
    category: 'Pants',
    stock: 15,
    status: 'active',
    isApproved: false,
    shop: { name: 'Professional Wear', id: '2' },
    createdAt: '2024-01-10T14:20:00Z'
  },
  // Add more mock products...
]

const columns: ColumnDef<Product>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'thumbnail',
    header: 'Image',
    cell: ({ row }) => (
      <Avatar className="h-12 w-12">
        <AvatarImage 
          src={row.getValue('thumbnail')} 
          alt={row.getValue('name')}
          className="object-cover"
        />
        <AvatarFallback>IMG</AvatarFallback>
      </Avatar>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Product Name" />
    ),
    cell: ({ row }) => {
      const product = row.original
      return (
        <div className="space-y-1">
          <div className="font-medium">{product.name}</div>
          <div className="text-sm text-muted-foreground">
            SKU: {product.sku}
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'shop',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Shop" />
    ),
    cell: ({ row }) => {
      const shop = row.getValue('shop') as Product['shop']
      return (
        <div className="font-medium text-blue-600 hover:underline cursor-pointer">
          {shop.name}
        </div>
      )
    },
  },
  {
    accessorKey: 'category',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Category" />
    ),
    cell: ({ row }) => (
      <Badge variant="outline">{row.getValue('category')}</Badge>
    ),
  },
  {
    accessorKey: 'price',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Price" />
    ),
    cell: ({ row }) => {
      const price = row.getValue('price') as number
      const discountPrice = row.original.discountPrice
      
      return (
        <div className="space-y-1">
          <div className="font-medium">{formatPrice(price)}</div>
          {discountPrice && (
            <div className="text-sm text-green-600 font-medium">
              {formatPrice(discountPrice)}
            </div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'stock',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Stock" />
    ),
    cell: ({ row }) => {
      const stock = row.getValue('stock') as number
      return (
        <Badge 
          variant={stock > 10 ? 'secondary' : stock > 0 ? 'destructive' : 'outline'}
        >
          {stock} units
        </Badge>
      )
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue('status') as string
      const isApproved = row.original.isApproved
      
      return (
        <div className="flex items-center gap-2">
          <Badge
            variant={status === 'active' ? 'secondary' : status === 'inactive' ? 'destructive' : 'outline'}
          >
            {status}
          </Badge>
          {isApproved ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          )}
        </div>
      )
    },
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const product = row.original
      
      const actions = product.isApproved ? [
        {
          label: 'View Details',
          onClick: (product: Product) => console.log('View', product.id),
        },
        {
          label: 'Edit Product',
          onClick: (product: Product) => console.log('Edit', product.id),
        },
        {
          label: 'Delete',
          onClick: (product: Product) => console.log('Delete', product.id),
          variant: 'destructive' as const,
        },
      ] : [
        {
          label: 'Approve',
          onClick: (product: Product) => console.log('Approve', product.id),
        },
        {
          label: 'Reject',
          onClick: (product: Product) => console.log('Reject', product.id),
          variant: 'destructive' as const,
        },
      ]

      return <DataTableRowActions row={row} actions={actions} />
    },
  },
]

export default function AdminProductsPage() {
  return (
    <AdminLayout title="Product Management" subtitle="Manage your product catalog">
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Products</h1>
            <p className="text-muted-foreground">
              Manage and monitor all products in the system
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="text-sm font-medium">Total Products</div>
              <Package className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </div>
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="text-sm font-medium">Active Products</div>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">892</div>
            <p className="text-xs text-muted-foreground">
              +5.4% from last month
            </p>
          </div>
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="text-sm font-medium">Pending Approval</div>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">
              +12 since yesterday
            </p>
          </div>
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="text-sm font-medium">Out of Stock</div>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">
              -2 from yesterday
            </p>
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={mockProducts}
          searchKey="name"
          searchPlaceholder="Search products..."
        />
      </div>
    </AdminLayout>
  )
}
