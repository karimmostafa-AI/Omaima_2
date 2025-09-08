"use client"
"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useCustomizerStore } from '@/store/customizer'
import { MeasurementConfiguration, CustomMeasurements } from '@/types'
import { Ruler, Info, HelpCircle } from 'lucide-react'

const MEASUREMENT_GUIDE = {
  bust: "Measure around the fullest part of your bust",
  waist: "Measure around the narrowest part of your waist",
  hips: "Measure around the fullest part of your hips",
  shoulderWidth: "Measure from shoulder point to shoulder point across the back",
  armLength: "Measure from shoulder to wrist with arm slightly bent",
  jacketLength: "Desired length from base of neck to hem",
  pantWaist: "Measure around your natural waist where you'd wear pants",
  pantLength: "Measure from waist to desired hem length",
  thighCircumference: "Measure around the fullest part of your thigh",
  inseam: "Measure from crotch to ankle"
}

const SIZE_CHART = {
  XS: { bust: "32-34", waist: "24-26", hips: "34-36" },
  S: { bust: "34-36", waist: "26-28", hips: "36-38" },
  M: { bust: "36-38", waist: "28-30", hips: "38-40" },
  L: { bust: "38-40", waist: "30-32", hips: "40-42" },
  XL: { bust: "40-42", waist: "32-34", hips: "42-44" },
  XXL: { bust: "42-44", waist: "34-36", hips: "44-46" }
}

export function MeasurementsInput() {
  const [measurementType, setMeasurementType] = useState<'standard' | 'custom'>('standard')
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [customMeasurements, setCustomMeasurements] = useState<Partial<CustomMeasurements>>({})
  const [showGuide, setShowGuide] = useState<string | null>(null)
  
  const { configuration, setMeasurements } = useCustomizerStore()

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size)
    const sizeData = SIZE_CHART[size as keyof typeof SIZE_CHART]
    if (sizeData) {
      const measurements: MeasurementConfiguration = {
        sizeGuide: 'standard',
        standardSize: size
      }
      setMeasurements(measurements)
    }
  }

  const handleCustomMeasurementChange = (field: string, value: string) => {
    const numericValue = field === 'notes' ? value : (parseFloat(value) || 0)
    const updated = { ...customMeasurements, [field]: numericValue }
    setCustomMeasurements(updated)
    
    if (Object.keys(updated).length > 0) {
      const measurements: MeasurementConfiguration = {
        sizeGuide: 'custom',
        customMeasurements: updated as CustomMeasurements
      }
      setMeasurements(measurements)
    }
  }

  const renderMeasurementInput = (field: string, label: string, required: boolean = true) => {
    return (
      <div key={field} className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor={field} className="text-sm font-medium">
            {label} {required && <span className="text-red-500">*</span>}
          </Label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowGuide(showGuide === field ? null : field)}
            className="p-1 h-auto"
          >
            <HelpCircle className="w-4 h-4" />
          </Button>
        </div>
        {showGuide === field && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              {MEASUREMENT_GUIDE[field as keyof typeof MEASUREMENT_GUIDE]}
            </AlertDescription>
          </Alert>
        )}
        <div className="relative">
          <Input
            id={field}
            type="number"
            step="0.25"
            min="0"
            max="100"
            placeholder="0.0"
            value={customMeasurements[field as keyof CustomMeasurements] || ''}
            onChange={(e) => handleCustomMeasurementChange(field, e.target.value)}
            className="pr-12"
          />
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
            in
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Enter Your Measurements</h2>
        <p className="text-gray-600">Choose standard sizing or provide custom measurements for the perfect fit.</p>
      </div>

      <Tabs value={measurementType} onValueChange={(value) => setMeasurementType(value as 'standard' | 'custom')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="standard">Standard Sizes</TabsTrigger>
          <TabsTrigger value="custom">Custom Measurements</TabsTrigger>
        </TabsList>

        <TabsContent value="standard" className="space-y-6">
          <Alert>
            <Ruler className="h-4 w-4" />
            <AlertDescription>
              Select your standard size. Our garments are designed to fit comfortably within these ranges.
            </AlertDescription>
          </Alert>

          {/* Size Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Size Chart (inches)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Size</th>
                      <th className="text-left p-2">Bust</th>
                      <th className="text-left p-2">Waist</th>
                      <th className="text-left p-2">Hips</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(SIZE_CHART).map(([size, measurements]) => (
                      <tr 
                        key={size}
                        className={`border-b cursor-pointer hover:bg-gray-50 ${
                          selectedSize === size ? 'bg-primary/10' : ''
                        }`}
                        onClick={() => handleSizeSelect(size)}
                      >
                        <td className="p-2 font-medium">{size}</td>
                        <td className="p-2">{measurements.bust}</td>
                        <td className="p-2">{measurements.waist}</td>
                        <td className="p-2">{measurements.hips}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {selectedSize && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-medium">
                    Size {selectedSize} selected
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom" className="space-y-6">
          <Alert>
            <Ruler className="h-4 w-4" />
            <AlertDescription>
              Provide your exact measurements for a custom fit. Hover over the help icons for measuring guides.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Upper Body Measurements */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upper Body</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {renderMeasurementInput('bust', 'Bust')}
                {renderMeasurementInput('waist', 'Waist')}
                {renderMeasurementInput('shoulderWidth', 'Shoulder Width')}
                {renderMeasurementInput('armLength', 'Arm Length')}
                {renderMeasurementInput('jacketLength', 'Jacket Length')}
              </CardContent>
            </Card>

            {/* Lower Body Measurements */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Lower Body</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {renderMeasurementInput('hips', 'Hips')}
                {renderMeasurementInput('pantWaist', 'Pants Waist')}
                {renderMeasurementInput('thighCircumference', 'Thigh')}
                {renderMeasurementInput('inseam', 'Inseam')}
                {renderMeasurementInput('pantLength', 'Pants Length')}
              </CardContent>
            </Card>
          </div>

          {/* Additional Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="notes">Special Instructions (Optional)</Label>
                <textarea
                  id="notes"
                  className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Any special fit preferences, adjustments, or notes for our tailors..."
                  value={(customMeasurements as any).notes || ''}
                  onChange={(e) => handleCustomMeasurementChange('notes', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Measurement Tips */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-2">Measurement Tips</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Wear close-fitting undergarments when measuring</li>
                <li>• Have someone help you for the most accurate measurements</li>
                <li>• Keep the measuring tape parallel to the floor</li>
                <li>• Don't pull the tape too tight - it should be snug but comfortable</li>
                <li>• For best results, take measurements over the clothes you plan to wear under the garment</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}