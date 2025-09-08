"use client"
"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useCustomizerStore } from '@/store/customizer'
import { formatPrice } from '@/lib/utils'
import { CheckCircle, AlertCircle, Info, Shirt, Palette, Ruler, Type, Award, Clock, Package } from 'lucide-react'

export function DesignReview() {
  const { configuration, totalPrice, availableOptions, validateConfiguration } = useCustomizerStore()

  const validation = validateConfiguration()
  const template = availableOptions.templates?.find(t => t.id === configuration.templateId)
  const fabric = availableOptions.fabrics?.find(f => f.id === configuration.components?.fabric?.fabricId)

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Review Your Design</h2>
        <p className="text-gray-600">Confirm all details before adding to cart or saving your design.</p>
      </div>

      {/* Validation Status */}
      <Alert className={validation.isValid ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
        <div className="flex items-center gap-2">
          {validation.isValid ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600" />
          )}
          <AlertDescription className={validation.isValid ? "text-green-800" : "text-red-800"}>
            {validation.isValid ? (
              "Your design is complete and ready to order!"
            ) : (
              `Please complete the following: ${validation.errors.join(', ')}`
            )}
          </AlertDescription>
        </div>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Design Summary */}
        <div className="space-y-6">
          {/* Template & Fabric */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shirt className="w-5 h-5" />
                Style & Fabric
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {template && (
                <div className="space-y-2">
                  <h4 className="font-medium">Template</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{template.name}</p>
                      <p className="text-sm text-gray-600">{template.description}</p>
                    </div>
                    <Badge variant="outline">{template.category}</Badge>
                  </div>
                </div>
              )}

              {fabric && (
                <div className="space-y-2">
                  <h4 className="font-medium">Fabric</h4>
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: fabric.color_hex }}
                    />
                    <div>
                      <p className="font-medium">{fabric.name}</p>
                      <p className="text-sm text-gray-600">{fabric.color_name}</p>
                      <p className="text-xs text-gray-500">{fabric.composition}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Measurements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ruler className="w-5 h-5" />
                Measurements
              </CardTitle>
            </CardHeader>
            <CardContent>
              {configuration.components?.measurements ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Measurement Type</span>
                    <Badge variant={configuration.components.measurements.sizeGuide === 'custom' ? 'default' : 'secondary'}>
                      {configuration.components.measurements.sizeGuide === 'custom' ? 'Custom' : `Size ${configuration.components.measurements.standardSize}`}
                    </Badge>
                  </div>
                  
                  {configuration.components.measurements.sizeGuide === 'custom' && configuration.components.measurements.customMeasurements && (
                    <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                      {[
                        { label: 'Bust', value: configuration.components.measurements.customMeasurements.bust },
                        { label: 'Waist', value: configuration.components.measurements.customMeasurements.waist },
                        { label: 'Hips', value: configuration.components.measurements.customMeasurements.hips },
                        { label: 'Shoulder', value: configuration.components.measurements.customMeasurements.shoulderWidth }
                      ].map(({ label, value }) => value && value > 0 && (
                        <div key={label} className="flex justify-between">
                          <span className="text-gray-600">{label}:</span>
                          <span>{value}"</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Notes section - could be added to measurements interface if needed */}
                </div>
              ) : (
                <p className="text-gray-500">No measurements specified</p>
              )}
            </CardContent>
          </Card>

          {/* Personalization */}
          {configuration.personalizations && Object.keys(configuration.personalizations).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Personalization
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {configuration.personalizations.monogram && (
                  <div className="flex items-center gap-3">
                    <Type className="w-4 h-4 text-primary" />
                    <div>
                      <p className="font-medium">Monogram: {configuration.personalizations.monogram.text}</p>
                      <p className="text-sm text-gray-600">
                        {configuration.personalizations.monogram.font} font, {configuration.personalizations.monogram.color} thread
                      </p>
                    </div>
                  </div>
                )}

                {configuration.personalizations.liningPersonalization && (
                  <div className="flex items-center gap-3">
                    <Palette className="w-4 h-4 text-primary" />
                    <div>
                      <p className="font-medium">Custom Lining</p>
                      <p className="text-sm text-gray-600">
                        {configuration.personalizations.liningPersonalization.color} {configuration.personalizations.liningPersonalization.type}
                      </p>
                    </div>
                  </div>
                )}

                {configuration.personalizations.embroidery && (
                  <div className="flex items-center gap-3">
                    <Award className="w-4 h-4 text-primary" />
                    <div>
                      <p className="font-medium">Embroidery: {configuration.personalizations.embroidery.design}</p>
                      <p className="text-sm text-gray-600">
                        {configuration.personalizations.embroidery.position}, {configuration.personalizations.embroidery.color} thread
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          {/* Price Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {template && (
                <div className="flex justify-between">
                  <span>Base Price</span>
                  <span>{formatPrice(template.base_price)}</span>
                </div>
              )}

              {fabric && template && (
                <div className="flex justify-between">
                  <span>Fabric ({template.estimated_fabric_yards} yards)</span>
                  <span>{formatPrice(fabric.price_per_unit * template.estimated_fabric_yards)}</span>
                </div>
              )}

              {configuration.personalizations?.monogram && (
                <div className="flex justify-between">
                  <span>Monogram</span>
                  <span>+{formatPrice(25)}</span>
                </div>
              )}

              {configuration.personalizations?.liningPersonalization && (
                <div className="flex justify-between">
                  <span>Custom Lining</span>
                  <span>+{formatPrice(35)}</span>
                </div>
              )}

              {configuration.personalizations?.embroidery && (
                <div className="flex justify-between">
                  <span>Embroidery</span>
                  <span>+{formatPrice(45)}</span>
                </div>
              )}

              {configuration.components?.measurements?.sizeGuide === 'custom' && (
                <div className="flex justify-between">
                  <span>Custom Measurements</span>
                  <span>+{formatPrice(75)}</span>
                </div>
              )}

              <Separator />
              
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">{formatPrice(totalPrice)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Production Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Production & Delivery
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {template && (
                <>
                  <div className="flex justify-between">
                    <span>Production Time</span>
                    <span>{template.estimated_fabric_yards ? Math.ceil(template.estimated_fabric_yards * 2) : 10} business days</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>2-5 business days</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Total Delivery Time</span>
                    <span>{(template.estimated_fabric_yards ? Math.ceil(template.estimated_fabric_yards * 2) : 10) + 3}-{(template.estimated_fabric_yards ? Math.ceil(template.estimated_fabric_yards * 2) : 10) + 5} days</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Order Information */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="space-y-2">
                  <h4 className="font-medium text-blue-900">What happens next?</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Your order will be reviewed by our design team</li>
                    <li>• We'll contact you within 24 hours to confirm details</li>
                    <li>• Production begins after final approval</li>
                    <li>• You'll receive updates throughout the process</li>
                    <li>• Quality inspection before shipping</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}