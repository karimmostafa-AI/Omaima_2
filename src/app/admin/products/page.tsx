'use client'

import React, { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/layout/admin-layout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'
import { Plus, Loader2, Edit, Trash2 } from 'lucide-react'

interface SimpleProduct {
  id: string
  name: string
  description?: string
  price: number
  stock: number
  status: 'ACTIVE' | 'INACTIVE'
  image?: string
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<SimpleProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      // For MVP, we'll use mock data since the product service might not be fully implemented
      const mockProducts: SimpleProduct[] = [
        {
          id: '1',
          name: 'Sample Product 1',
          description: 'A great product for testing',
          price: 99.99,
          stock: 10,
          status: 'ACTIVE',
        },
        {
          id: '2',
          name: 'Sample Product 2',
          description: 'Another test product',
          price: 149.99,
          stock: 5,
          status: 'INACTIVE',
        }
      ]
      setProducts(mockProducts)
    } catch (err) {
      setError('Failed to fetch products')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    
    try {
      // For MVP, just remove from local state
      setProducts(products.filter(p => p.id !== id))
      alert('Product deleted successfully')
    } catch (err) {
      alert('Failed to delete product')
      console.error(err)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-96">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="text-center py-8">
          <p className="text-red-600">{error}</p>
          <Button onClick={fetchProducts} className="mt-4">
            Try Again
          </Button>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Products</h1>
            <p className="text-muted-foreground">Manage your product catalog</p>
          </div>
          <Button onClick={() => alert('Add product functionality not implemented in MVP')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Product</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Price</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Stock</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium">{product.name}</div>
                          {product.description && (
                            <div className="text-sm text-gray-600">{product.description}</div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {formatPrice(product.price)}
                      </td>
                      <td className="py-3 px-4">
                        {product.stock}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={product.status === 'ACTIVE' ? 'default' : 'secondary'}>
                          {product.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => alert('Edit functionality not implemented in MVP')}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {products.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-600">No products found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
