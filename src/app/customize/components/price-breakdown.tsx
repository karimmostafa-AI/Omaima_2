"use client"
"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useCustomizerStore } from '@/store/customizer'
import { formatPrice } from '@/lib/utils'
import { Calculator, Tag } from 'lucide-react'

export function PriceBreakdown() {
  const { totalPrice, priceBreakdown, configuration, availableOptions } = useCustomizerStore()

  const getSelectedTemplate = () => {
    return availableOptions.templates?.find(t => t.id === configuration.templateId)
  }

  const getSelectedFabric = () => {
    return availableOptions.fabrics?.find(f => f.id === configuration.components?.fabric?.fabricId)
  }

  const template = getSelectedTemplate()
  const fabric = getSelectedFabric()

  // Calculate estimated values if priceBreakdown is not available
  const estimatedBreakdown = {
    basePrice: template?.base_price || 0,
    fabricCost: fabric ? fabric.price_per_unit * (template?.estimated_fabric_yards || 0) : 0,
    componentModifiers: {} as Record<string, number>, // Would be calculated from selected components
    personalizationCosts: {} as Record<string, number>, // Would be calculated from personalizations
    premiumUpcharges: 0,
    subtotal: 0,
    taxes: 0,
    total: 0
  }

  // Calculate personalization costs
  if (configuration.personalizations) {
    if (configuration.personalizations.monogram) {
      estimatedBreakdown.personalizationCosts['monogram'] = 25
    }
    if (configuration.personalizations.liningPersonalization) {
      estimatedBreakdown.personalizationCosts['liningPersonalization'] = 35
    }
    if (configuration.personalizations.embroidery) {
      estimatedBreakdown.personalizationCosts['embroidery'] = 45
    }
  }

  // Calculate custom measurements fee
  if (configuration.components?.measurements?.sizeGuide === 'custom') {
    estimatedBreakdown.premiumUpcharges += 75
  }

  // Calculate subtotal
  const personalizationTotal = Object.values(estimatedBreakdown.personalizationCosts).reduce((sum: number, cost: number) => sum + cost, 0)
  const componentModifierTotal = Object.values(estimatedBreakdown.componentModifiers).reduce((sum: number, cost: number) => sum + cost, 0)
  
  estimatedBreakdown.subtotal = 
    estimatedBreakdown.basePrice + 
    estimatedBreakdown.fabricCost + 
    componentModifierTotal + 
    personalizationTotal + 
    estimatedBreakdown.premiumUpcharges

  // Calculate tax (8.25%)
  estimatedBreakdown.taxes = estimatedBreakdown.subtotal * 0.0825

  // Calculate total
  estimatedBreakdown.total = estimatedBreakdown.subtotal + (estimatedBreakdown.taxes || 0)

  const breakdown = priceBreakdown || estimatedBreakdown

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Price Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Base Price */}
        {breakdown.basePrice > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Base Price</span>
            <span>{formatPrice(breakdown.basePrice)}</span>
          </div>
        )}

        {/* Fabric Cost */}
        {breakdown.fabricCost > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              Fabric ({template?.estimated_fabric_yards || 0} yards)
            </span>
            <span>{formatPrice(breakdown.fabricCost)}</span>
          </div>
        )}

        {/* Component Modifiers */}
        {Object.values(breakdown.componentModifiers || {}).reduce((sum, cost) => sum + cost, 0) > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Style Upgrades</span>
            <span>+{formatPrice(Object.values(breakdown.componentModifiers || {}).reduce((sum, cost) => sum + cost, 0))}</span>
          </div>
        )}

        {/* Personalization */}
        {Object.values(breakdown.personalizationCosts || {}).reduce((sum, cost) => sum + cost, 0) > 0 && (
          <div className="space-y-1">
            {configuration.personalizations?.monogram && breakdown.personalizationCosts?.monogram && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 ml-2">• Monogram</span>
                <span>+{formatPrice(breakdown.personalizationCosts.monogram)}</span>
              </div>
            )}
            {configuration.personalizations?.liningPersonalization && breakdown.personalizationCosts?.liningPersonalization && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 ml-2">• Custom Lining</span>
                <span>+{formatPrice(breakdown.personalizationCosts.liningPersonalization)}</span>
              </div>
            )}
            {configuration.personalizations?.embroidery && breakdown.personalizationCosts?.embroidery && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 ml-2">• Embroidery</span>
                <span>+{formatPrice(breakdown.personalizationCosts.embroidery)}</span>
              </div>
            )}
          </div>
        )}

        {/* Premium Upcharges */}
        {breakdown.premiumUpcharges > 0 && (
          <div className="space-y-1">
            {configuration.components?.measurements?.sizeGuide === 'custom' && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Custom Measurements</span>
                <span>+{formatPrice(75)}</span>
              </div>
            )}
          </div>
        )}

        {/* Subtotal */}
        {breakdown.subtotal > 0 && (
          <>
            <Separator />
            <div className="flex justify-between font-medium">
              <span>Subtotal</span>
              <span>{formatPrice(breakdown.subtotal)}</span>
            </div>
          </>
        )}

        {/* Tax */}
        {(breakdown.taxes || 0) > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax (8.25%)</span>
            <span>{formatPrice(breakdown.taxes || 0)}</span>
          </div>
        )}

        {/* Total */}
        <Separator />
        <div className="flex justify-between text-lg font-bold">
          <span>Total</span>
          <span className="text-primary">
            {formatPrice(totalPrice || breakdown.total)}
          </span>
        </div>

        {/* Savings Notice */}
        {breakdown.total >= 500 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-green-600" />
              <span className="text-green-800 text-sm font-medium">
                Free shipping included!
              </span>
            </div>
          </div>
        )}

        {/* Payment Options */}
        <div className="mt-4 pt-3 border-t">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Payment Options</h4>
          <div className="text-xs text-gray-600 space-y-1">
            <div>• Pay in full: {formatPrice(totalPrice || breakdown.total)}</div>
            <div>• 50% deposit: {formatPrice((totalPrice || breakdown.total) * 0.5)}</div>
            <div className="text-gray-500">  Balance due on completion</div>
          </div>
        </div>

        {/* Delivery Information */}
        {template && (
          <div className="mt-4 pt-3 border-t">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Delivery</h4>
            <div className="text-xs text-gray-600 space-y-1">
              <div>• Production time: 14-21 business days</div>
              <div>• Shipping: 2-5 business days</div>
              <div>• Rush orders: +{formatPrice(50)} (7-day delivery)</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}