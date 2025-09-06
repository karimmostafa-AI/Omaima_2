"use client"

import React, { useState } from 'react'
import { useForm, ControllerRenderProps } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  Upload, 
  X, 
  Plus, 
  Eye, 
  Save, 
  AlertCircle 
} from 'lucide-react'

const productFormSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().min(1, 'Description is required'),
  shortDescription: z.string().optional(),
  sku: z.string().min(1, 'SKU is required'),
  price: z.number().min(0, 'Price must be positive'),
  compareAtPrice: z.number().optional(),
  costPrice: z.number().optional(),
  category: z.string().min(1, 'Category is required'),
  brand: z.string().optional(),
  tags: z.array(z.string()),
  trackQuantity: z.boolean(),
  quantity: z.number().min(0),
  weight: z.number().optional(),
  requiresShipping: z.boolean(),
  taxable: z.boolean(),
  status: z.enum(['active', 'draft', 'inactive']),
  images: z.array(z.string())
})

type ProductFormData = z.infer<typeof productFormSchema>

const mockCategories = [
  { id: 'blazers', name: 'Blazers' },
  { id: 'dresses', name: 'Dresses' },
  { id: 'pants', name: 'Pants' },
  { id: 'skirts', name: 'Skirts' },
  { id: 'accessories', name: 'Accessories' },
]

interface ProductFormProps {
  initialData?: Partial<ProductFormData>
  onSubmit: (data: ProductFormData) => Promise<void>
  onCancel?: () => void
  isLoading?: boolean
  mode: 'create' | 'edit'
  className?: string
}

export function ProductForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  mode = 'create',
  className
}: ProductFormProps) {
  const [images, setImages] = useState<string[]>(initialData?.images || [])
  const [tags, setTags] = useState<string[]>(initialData?.tags || [])
  const [tagInput, setTagInput] = useState('')

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      description: '',
      shortDescription: '',
      sku: '',
      price: 0,
      compareAtPrice: undefined,
      costPrice: undefined,
      category: '',
      brand: '',
      tags: [],
      trackQuantity: true,
      quantity: 0,
      weight: undefined,
      requiresShipping: true,
      taxable: true,
      status: 'draft',
      images: [],
      ...initialData,
    },
  })

  const handleSubmit = async (data: ProductFormData) => {
    try {
      await onSubmit({ ...data, tags, images })
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          if (e.target?.result) {
            setImages(prev => [...prev, e.target!.result as string])
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags(prev => [...prev, tagInput.trim()])
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }: { field: ControllerRenderProps<ProductFormData, "name"> }) => (
                    <FormItem>
                      <FormLabel>Product Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter product name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }: { field: ControllerRenderProps<ProductFormData, "description"> }) => (
                    <FormItem>
                      <FormLabel>Description *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter product description"
                          rows={4}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="shortDescription"
                  render={({ field }: { field: ControllerRenderProps<ProductFormData, "shortDescription"> }) => (
                    <FormItem>
                      <FormLabel>Short Description</FormLabel>
                      <FormControl>
                        <Input placeholder="Brief product summary" {...field} />
                      </FormControl>
                      <FormDescription>
                        This will appear in product listings
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="sku"
                    render={({ field }: { field: ControllerRenderProps<ProductFormData, "sku"> }) => (
                      <FormItem>
                        <FormLabel>SKU *</FormLabel>
                        <FormControl>
                          <Input placeholder="PROD-001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }: { field: ControllerRenderProps<ProductFormData, "category"> }) => (
                      <FormItem>
                        <FormLabel>Category *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {mockCategories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }: { field: ControllerRenderProps<ProductFormData, "price"> }) => (
                      <FormItem>
                        <FormLabel>Price *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="0.00" 
                            {...field}
                            onChange={e => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="compareAtPrice"
                    render={({ field }: { field: ControllerRenderProps<ProductFormData, "compareAtPrice"> }) => (
                      <FormItem>
                        <FormLabel>Compare at Price</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="0.00" 
                            {...field}
                            value={field.value ?? ''}
                            onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormDescription>
                          Show customers the original price
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="costPrice"
                    render={({ field }: { field: ControllerRenderProps<ProductFormData, "costPrice"> }) => (
                      <FormItem>
                        <FormLabel>Cost Price</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="0.00" 
                            {...field}
                            value={field.value ?? ''}
                            onChange={e => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormDescription>
                          For profit calculations
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>Product Status</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }: { field: ControllerRenderProps<ProductFormData, "status"> }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Inventory */}
            <Card>
              <CardHeader>
                <CardTitle>Inventory</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="trackQuantity"
                  render={({ field }: { field: ControllerRenderProps<ProductFormData, "trackQuantity"> }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Track Quantity</FormLabel>
                        <FormDescription>
                          Monitor stock levels
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {form.watch('trackQuantity') && (
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }: { field: ControllerRenderProps<ProductFormData, "quantity"> }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="0" 
                            {...field}
                            onChange={e => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-between pt-6 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <span>* Required fields</span>
          </div>
          <div className="flex items-center gap-3">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isLoading}>
              <Save className="mr-2 h-4 w-4" />
              {mode === 'create' ? 'Create Product' : 'Update Product'}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}

// Product Form Modal
interface ProductFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: Partial<ProductFormData>
  mode: 'create' | 'edit'
}

export function ProductFormModal({ 
  open, 
  onOpenChange, 
  initialData, 
  mode 
}: ProductFormModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: ProductFormData) => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      console.log('Product data:', data)
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving product:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create New Product' : 'Edit Product'}
          </DialogTitle>
        </DialogHeader>
        <ProductForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isLoading={isLoading}
          mode={mode}
        />
      </DialogContent>
    </Dialog>
  )
}
