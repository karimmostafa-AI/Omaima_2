"use client"
"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useCustomizerStore } from '@/store/customizer'
import { Eye, Shirt, Palette, Ruler, Type } from 'lucide-react'

export function DesignPreview() {
  const { configuration, availableOptions } = useCustomizerStore()

  const getSelectedTemplate = () => {
    return availableOptions.templates?.find(t => t.id === configuration.templateId)
  }

  const getSelectedFabric = () => {
    return availableOptions.fabrics?.find(f => f.id === configuration.components.fabric?.fabricId)
  }

  const template = getSelectedTemplate()
  const fabric = getSelectedFabric()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="w-5 h-5" />
          Design Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Placeholder Image */}
        <div className="aspect-[3/4] bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Shirt className="w-16 h-16 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">3D Preview</p>
            <p className="text-gray-400 text-xs">Coming Soon</p>
          </div>
        </div>

        {/* Configuration Summary */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Your Design</h4>
          
          {template && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Template:</span>
              <Badge variant="outline">{template.name}</Badge>
            </div>
          )}

          {fabric && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Fabric:</span>
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded border"
                    style={{ backgroundColor: fabric.color_hex }}
                  />
                  <span className="text-xs">{fabric.name}</span>
                </div>
              </div>
            </div>
          )}

          {configuration.components.measurements && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Measurements:</span>
              <Badge variant="outline">
                {configuration.components.measurements.sizeGuide === 'standard' 
                  ? `Size ${configuration.components.measurements.standardSize}` 
                  : 'Custom'}
              </Badge>
            </div>
          )}

          {configuration.personalizations && Object.keys(configuration.personalizations).length > 0 && (
            <div className="space-y-1">
              <span className="text-gray-600 text-sm">Personalizations:</span>
              <div className="space-y-1">
                {configuration.personalizations.monogram && (
                  <div className="flex items-center gap-2 text-xs">
                    <Type className="w-3 h-3" />
                    <span>Monogram: {configuration.personalizations.monogram.text}</span>
                  </div>
                )}
                {configuration.personalizations.liningPersonalization && (
                  <div className="flex items-center gap-2 text-xs">
                    <Palette className="w-3 h-3" />
                    <span>Custom Lining</span>
                  </div>
                )}
                {configuration.personalizations.embroidery && (
                  <div className="flex items-center gap-2 text-xs">
                    <Shirt className="w-3 h-3" />
                    <span>Embroidery: {configuration.personalizations.embroidery.design}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Delivery Information */}
        {template?.product && (
          <div className="border-t pt-3">
            <div className="text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Estimated Delivery:</span>
                <span className="font-medium">{template.product.estimated_delivery_days} days</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}