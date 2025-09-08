"use client"
"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useCustomizerStore } from '@/store/customizer'
import { CustomizationOption } from '@/types'
import { formatPrice } from '@/lib/utils'
import { CheckCircle, Settings, Plus, Minus } from 'lucide-react'

export function ComponentSelection() {
  const [components, setComponents] = useState<Record<string, CustomizationOption[]>>({})
  const [loading, setLoading] = useState(true)
  
  const { configuration, setJacketStyle, setPantsStyle, updateConfiguration } = useCustomizerStore()

  useEffect(() => {
    fetchComponents()
  }, [configuration.templateId])

  const fetchComponents = async () => {
    if (!configuration.templateId) return

    try {
      setLoading(true)
      const response = await fetch(`/api/customizer/components?templateId=${configuration.templateId}`)
      if (response.ok) {
        const data = await response.json()
        setComponents(data.components || {})
      }
    } catch (error) {
      console.error('Failed to fetch components:', error)
      // Fallback with mock data for development
      setComponents({
        'jacket_style': [
          {
            id: 'js-1',
            template_id: configuration.templateId || '',
            category: 'jacket_style',
            name: 'single_breasted',
            display_name: 'Single Breasted',
            description: 'Classic single-breasted style with clean lines',
            price_modifier: 0,
            price_type: 'fixed',
            position: 1,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'js-2',
            template_id: configuration.templateId || '',
            category: 'jacket_style',
            name: 'double_breasted',
            display_name: 'Double Breasted',
            description: 'Formal double-breasted style with overlapping fronts',
            price_modifier: 35.00,
            price_type: 'fixed',
            position: 2,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ],
        'lapel_style': [
          {
            id: 'ls-1',
            template_id: configuration.templateId || '',
            category: 'lapel_style',
            name: 'notched',
            display_name: 'Notched Lapel',
            description: 'Traditional notched lapel for business wear',
            price_modifier: 0,
            price_type: 'fixed',
            position: 1,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'ls-2',
            template_id: configuration.templateId || '',
            category: 'lapel_style',
            name: 'peak',
            display_name: 'Peak Lapel',
            description: 'Elegant peak lapel for formal occasions',
            price_modifier: 25.00,
            price_type: 'fixed',
            position: 2,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ],
        'button_style': [
          {
            id: 'bs-1',
            template_id: configuration.templateId || '',
            category: 'button_style',
            name: 'standard',
            display_name: 'Standard Buttons',
            description: 'Classic matching buttons',
            price_modifier: 0,
            price_type: 'fixed',
            position: 1,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'bs-2',
            template_id: configuration.templateId || '',
            category: 'button_style',
            name: 'horn',
            display_name: 'Horn Buttons',
            description: 'Premium natural horn buttons',
            price_modifier: 15.00,
            price_type: 'fixed',
            position: 2,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ],
        'pants_style': [
          {
            id: 'ps-1',
            template_id: configuration.templateId || '',
            category: 'pants_style',
            name: 'straight',
            display_name: 'Straight Leg',
            description: 'Classic straight leg cut',
            price_modifier: 0,
            price_type: 'fixed',
            position: 1,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'ps-2',
            template_id: configuration.templateId || '',
            category: 'pants_style',
            name: 'tapered',
            display_name: 'Tapered',
            description: 'Modern tapered fit',
            price_modifier: 10.00,
            price_type: 'fixed',
            position: 2,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ],
        'lining': [
          {
            id: 'l-1',
            template_id: configuration.templateId || '',
            category: 'lining',
            name: 'standard',
            display_name: 'Standard Lining',
            description: 'Quality polyester lining',
            price_modifier: 0,
            price_type: 'fixed',
            position: 1,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'l-2',
            template_id: configuration.templateId || '',
            category: 'lining',
            name: 'silk',
            display_name: 'Silk Lining',
            description: 'Luxurious silk lining',
            price_modifier: 45.00,
            price_type: 'fixed',
            position: 2,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]
      })
    } finally {
      setLoading(false)
    }
  }

  const handleComponentSelect = (category: string, optionId: string) => {
    updateConfiguration({
      [category]: optionId
    })
  }

  const getSelectedOption = (category: string) => {
    return configuration[category as keyof typeof configuration] as string
  }

  const renderComponentSection = (category: string, options: CustomizationOption[]) => {
    const selectedOptionId = getSelectedOption(category)
    
    return (
      <div key={category} className="space-y-4">
        <h3 className="font-semibold text-lg capitalize">
          {category.replace('_', ' ')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {options.map((option) => {
            const isSelected = selectedOptionId === option.id
            const priceModifier = option.price_modifier
            
            return (
              <Card 
                key={option.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  isSelected ? 'ring-2 ring-primary border-primary' : 'hover:border-gray-300'
                }`}
                onClick={() => handleComponentSelect(category, option.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{option.display_name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                    </div>
                    {isSelected && (
                      <CheckCircle className="w-5 h-5 text-primary ml-2" />
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    {priceModifier > 0 ? (
                      <Badge variant="secondary" className="text-green-700 bg-green-50">
                        +{formatPrice(priceModifier)}
                      </Badge>
                    ) : (
                      <Badge variant="outline">Included</Badge>
                    )}
                    
                    <Button 
                      size="sm"
                      variant={isSelected ? "default" : "outline"}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleComponentSelect(category, option.id)
                      }}
                    >
                      {isSelected ? 'Selected' : 'Select'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <Skeleton className="h-6 w-48 mx-auto mb-2" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!configuration.templateId) {
    return (
      <div className="text-center py-12">
        <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Template First</h3>
        <p className="text-gray-600">Please go back and choose a template to see customization options.</p>
      </div>
    )
  }

  const componentCategories = Object.keys(components)

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Customize Style Components</h2>
        <p className="text-gray-600">Choose specific style elements to personalize your garment.</p>
      </div>

      {componentCategories.length > 0 ? (
        <div className="space-y-8">
          {componentCategories.map((category) => 
            renderComponentSection(category, components[category])
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Components Available</h3>
          <p className="text-gray-600">Customization options are being prepared for this template.</p>
        </div>
      )}
    </div>
  )
}