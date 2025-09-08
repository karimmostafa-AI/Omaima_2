"use client"
"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useCustomizerStore } from '@/store/customizer'
import { CustomizationTemplate } from '@/types'
import { formatPrice } from '@/lib/utils'
import { CheckCircle, Shirt, Palette, Scissors } from 'lucide-react'

export function TemplateSelection() {
  const [templates, setTemplates] = useState<CustomizationTemplate[]>([])
  const [loading, setLoading] = useState(true)
  
  const { configuration, initializeCustomizer } = useCustomizerStore()

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/customizer/templates')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data.templates || [])
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error)
      // Fallback with mock data for development
      setTemplates([
        {
          id: 'template-1',
          name: 'Professional Suit',
          description: 'Classic two-piece professional suit perfect for business meetings and formal occasions.',
          product_id: 'product-1',
          category: 'suits',
          base_price: 299.99,
          estimated_delivery_days: 14,
          estimated_fabric_yards: 3.5,
          available_components: ['jacket', 'pants', 'vest'],
          default_configuration: {
            templateId: 'template-1',
            templateName: 'Professional Suit',
            components: {
              fabric: {
                fabricId: 'default-wool',
                fabricName: 'Classic Wool',
                colorway: 'charcoal',
                pattern: 'solid',
                pricePerUnit: 50
              },
              measurements: {
                sizeGuide: 'standard' as const,
                standardSize: 'M'
              }
            },
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            version: 1
          },
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'template-2',
          name: 'Modern Blazer Set',
          description: 'Contemporary blazer with matching skirt or pants, ideal for professional settings.',
          product_id: 'product-2',
          category: 'blazers',
          base_price: 249.99,
          estimated_delivery_days: 12,
          estimated_fabric_yards: 2.8,
          available_components: ['blazer', 'skirt', 'pants'],
          default_configuration: {
            templateId: 'template-2',
            templateName: 'Modern Blazer Set',
            components: {
              fabric: {
                fabricId: 'default-cotton',
                fabricName: 'Premium Cotton',
                colorway: 'navy',
                pattern: 'solid',
                pricePerUnit: 40
              },
              measurements: {
                sizeGuide: 'standard' as const,
                standardSize: 'M'
              }
            },
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            version: 1
          },
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'template-3',
          name: 'Executive Dress',
          description: 'Sophisticated dress design perfect for executive meetings and professional events.',
          product_id: 'product-3',
          category: 'dresses',
          base_price: 199.99,
          estimated_delivery_days: 10,
          estimated_fabric_yards: 2.2,
          available_components: ['dress', 'belt'],
          default_configuration: {
            templateId: 'template-3',
            templateName: 'Executive Dress',
            components: {
              fabric: {
                fabricId: 'default-silk',
                fabricName: 'Silk Blend',
                colorway: 'black',
                pattern: 'solid',
                pricePerUnit: 60
              },
              measurements: {
                sizeGuide: 'standard' as const,
                standardSize: 'M'
              }
            },
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            version: 1
          },
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleTemplateSelect = async (template: CustomizationTemplate) => {
    try {
      await initializeCustomizer(template.id)
    } catch (error) {
      console.error('Failed to initialize customizer:', error)
    }
  }

  const getTemplateIcon = (category: string) => {
    switch (category) {
      case 'suits':
        return <Shirt className="w-8 h-8 text-blue-600" />
      case 'blazers':
        return <Palette className="w-8 h-8 text-purple-600" />
      case 'dresses':
        return <Scissors className="w-8 h-8 text-pink-600" />
      default:
        return <Shirt className="w-8 h-8 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-center mb-6">
          <Skeleton className="h-6 w-48 mx-auto mb-2" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Choose Your Base Template</h2>
        <p className="text-gray-600">Select a template that best matches your desired style. You can customize every detail in the following steps.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((template) => {
          const isSelected = configuration.templateId === template.id
          
          return (
            <Card 
              key={template.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                isSelected ? 'ring-2 ring-primary border-primary' : 'hover:border-gray-300'
              }`}
              onClick={() => handleTemplateSelect(template)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getTemplateIcon(template.category)}
                    <div>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <Badge variant="secondary" className="mt-1">
                        {template.category}
                      </Badge>
                    </div>
                  </div>
                  {isSelected && (
                    <CheckCircle className="w-6 h-6 text-primary" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  {template.description}
                </p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Starting Price:</span>
                    <span className="font-semibold text-primary">
                      {formatPrice(template.base_price)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Delivery:</span>
                    <span className="font-medium">
                      {template.estimated_delivery_days || 14} days
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Components:</span>
                    <span className="font-medium">
                      {template.available_components?.length || 0} pieces
                    </span>
                  </div>
                </div>

                <Button 
                  className="w-full mt-4" 
                  variant={isSelected ? "default" : "outline"}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleTemplateSelect(template)
                  }}
                >
                  {isSelected ? 'Selected' : 'Select Template'}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {templates.length === 0 && !loading && (
        <div className="text-center py-12">
          <Shirt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Templates Available</h3>
          <p className="text-gray-600">Templates are being prepared. Please check back later.</p>
        </div>
      )}
    </div>
  )
}