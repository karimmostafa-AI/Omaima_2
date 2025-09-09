'use client'

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'
import { AdminLayout } from '@/components/layout/admin-layout'
import { DataTable, DataTableColumnHeader, DataTableRowActions } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatPrice } from '@/lib/utils'
import { ProductFormModal } from '@/components/forms/product-form'
import { 
  Plus, 
  Loader2
} from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Product } from '@/types'
import { useToast } from '@/components/ui/use-toast'

// API functions
async function fetchProducts(): Promise<Product[]> {
  const response = await fetch('/api/products')
  if (!response.ok) {
    throw new Error('Failed to fetch products')
  }
  const data = await response.json()
  return data.products || []
}

async function deleteProduct(id: string): Promise<void> {
  const response = await fetch(`/api/products/${id}`, { method: 'DELETE' })
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to delete product');
  }
}

// Helper function to convert Product to form data
function productToFormData(product: Product) {
  return {
    name: product.name,
    description: product.description || '',
    shortDescription: product.short_description || '',
    sku: product.sku || '',
    price: product.price,
    compareAtPrice: product.compare_at_price,
    costPrice: product.cost_price,
    category: product.categories?.[0]?.id || '',
    brand: '',
    tags: product.tags || [],
    trackQuantity: product.track_quantity,
    quantity: product.quantity || 0,
    weight: product.weight,
    requiresShipping: product.requires_shipping,
    taxable: product.taxable,
    status: product.status as 'active' | 'inactive' | 'draft',
    images: product.images?.map(img => img.url) || []
  }
}

export default function AdminProductsPage() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const { data: products = [], isLoading, error } = useQuery<Product[]>({
    queryKey: ['adminProducts'],
    queryFn: fetchProducts,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      toast({ title: 'Success', description: 'Product deleted successfully.' })
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] })
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      })
    },
  })

  const handleAddProduct = () => {
    setSelectedProduct(null)
    setIsModalOpen(true)
  }

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  const handleDeleteProduct = (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteMutation.mutate(id)
    }
  }

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
      accessorKey: 'images',
      header: 'Image',
      cell: ({ row }) => {
        const images = row.getValue('images') as { url: string; altText: string }[]
        const firstImage = images?.[0]?.url
        return (
          <Avatar className="h-12 w-12">
            <AvatarImage
              src={firstImage}
              alt={row.original.name}
              className="object-cover"
            />
            <AvatarFallback>IMG</AvatarFallback>
          </Avatar>
        )
      },
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
      accessorKey: 'categories',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Category" />
      ),
      cell: ({ row }) => {
        const categories = row.original.categories
        const categoryName = categories?.[0]?.name || 'N/A'
        return <Badge variant="outline">{categoryName}</Badge>
      },
    },
    {
      accessorKey: 'price',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Price" />
      ),
      cell: ({ row }) => {
        const price = row.getValue('price') as number
        const discountPrice = row.original.compare_at_price

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
      accessorKey: 'quantity',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Stock" />
      ),
      cell: ({ row }) => {
        const stock = row.getValue('quantity') as number
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
        return (
          <div className="flex items-center gap-2">
            <Badge
              variant={status === 'ACTIVE' ? 'secondary' : status === 'INACTIVE' ? 'destructive' : 'outline'}
              className="capitalize"
            >
              {status.toLowerCase()}
            </Badge>
          </div>
        )
      },
    },
    {
      id: 'actions',
      enableHiding: false,
      cell: ({ row }) => {
        const product = row.original

        const actions = [
          {
            label: 'Edit Product',
            onClick: () => handleEditProduct(product),
          },
          {
            label: 'Delete',
            onClick: () => handleDeleteProduct(product.id),
            variant: 'destructive' as const,
          },
        ]

        return <DataTableRowActions row={row} actions={actions} />
      },
    },
  ]

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="text-red-500">Error: {(error as Error).message}</div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Product Management" subtitle="Manage your product catalog">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Products</h1>
            <p className="text-muted-foreground">
              Manage and monitor all products in the system
            </p>
          </div>
          <Button onClick={handleAddProduct}>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Stats Cards could be implemented here */}
        </div>

        <DataTable
          columns={columns}
          data={products}
          searchKey="name"
          searchPlaceholder="Search products..."
        />
      </div>

      <ProductFormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        initialData={selectedProduct ? productToFormData(selectedProduct) : undefined}
        mode={selectedProduct ? 'edit' : 'create'}
      />
    </AdminLayout>
  )
}
