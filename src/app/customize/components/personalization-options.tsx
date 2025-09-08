"use client"
"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useCustomizerStore } from '@/store/customizer'
import { formatPrice } from '@/lib/utils'
import { Type, Palette, Award, Plus, X } from 'lucide-react'

const MONOGRAM_FONTS = [
  { id: 'classic', name: 'Classic', preview: 'ABC' },
  { id: 'modern', name: 'Modern', preview: 'ABC' },
  { id: 'script', name: 'Script', preview: 'ABC' },
  { id: 'block', name: 'Block', preview: 'ABC' }
]

const MONOGRAM_COLORS = [
  { id: 'gold', name: 'Gold', hex: '#FFD700' },
  { id: 'silver', name: 'Silver', hex: '#C0C0C0' },
  { id: 'navy', name: 'Navy', hex: '#1B365D' },
  { id: 'burgundy', name: 'Burgundy', hex: '#722F37' },
  { id: 'black', name: 'Black', hex: '#000000' },
  { id: 'white', name: 'White', hex: '#FFFFFF' }
]

const LINING_COLORS = [
  { id: 'navy', name: 'Navy Blue', hex: '#1B365D' },
  { id: 'burgundy', name: 'Burgundy', hex: '#722F37' },
  { id: 'emerald', name: 'Emerald Green', hex: '#50C878' },
  { id: 'royal', name: 'Royal Purple', hex: '#6B46C1' },
  { id: 'charcoal', name: 'Charcoal', hex: '#36454F' },
  { id: 'cream', name: 'Cream', hex: '#F5F5DC' }
]

const EMBROIDERY_POSITIONS = [
  { id: 'chest_left', name: 'Left Chest', description: 'Small logo on left chest area' },
  { id: 'chest_right', name: 'Right Chest', description: 'Small logo on right chest area' },
  { id: 'back_neck', name: 'Back Neck', description: 'Logo at back neck area' },
  { id: 'sleeve', name: 'Sleeve', description: 'Logo on sleeve' }
]

export function PersonalizationOptions() {
  const { configuration, addPersonalization, removePersonalization } = useCustomizerStore()
  
  const [monogramEnabled, setMonogramEnabled] = useState(false)
  const [monogramText, setMonogramText] = useState('')
  const [monogramFont, setMonogramFont] = useState('classic')
  const [monogramColor, setMonogramColor] = useState('gold')
  const [monogramPosition, setMonogramPosition] = useState('chest_left')
  
  const [liningEnabled, setLiningEnabled] = useState(false)
  const [liningColor, setLiningColor] = useState('navy')
  const [liningPattern, setLiningPattern] = useState('solid')
  
  const [embroideryEnabled, setEmbroideryEnabled] = useState(false)
  const [embroideryText, setEmbroideryText] = useState('')
  const [embroideryPosition, setEmbroideryPosition] = useState('chest_left')
  const [embroideryColor, setEmbroideryColor] = useState('gold')

  const handleMonogramToggle = (enabled: boolean) => {
    setMonogramEnabled(enabled)
    if (enabled && monogramText) {
      addPersonalization('monogram', {
        text: monogramText,
        font: monogramFont,
        color: monogramColor,
        position: monogramPosition
      })
    } else {
      removePersonalization('monogram')
    }
  }

  const handleMonogramChange = () => {
    if (monogramEnabled && monogramText) {
      addPersonalization('monogram', {
        text: monogramText,
        font: monogramFont,
        color: monogramColor,
        position: monogramPosition
      })
    }
  }

  const handleLiningToggle = (enabled: boolean) => {
    setLiningEnabled(enabled)
    if (enabled) {
      addPersonalization('lining_personalization', {
        color: liningColor,
        pattern: liningPattern
      })
    } else {
      removePersonalization('lining_personalization')
    }
  }

  const handleLiningChange = () => {
    if (liningEnabled) {
      addPersonalization('lining_personalization', {
        color: liningColor,
        pattern: liningPattern
      })
    }
  }

  const handleEmbroideryToggle = (enabled: boolean) => {
    setEmbroideryEnabled(enabled)
    if (enabled && embroideryText) {
      addPersonalization('embroidery', {
        text: embroideryText,
        position: embroideryPosition,
        color: embroideryColor
      })
    } else {
      removePersonalization('embroidery')
    }
  }

  const handleEmbroideryChange = () => {
    if (embroideryEnabled && embroideryText) {
      addPersonalization('embroidery', {
        text: embroideryText,
        position: embroideryPosition,
        color: embroideryColor
      })
    }
  }

  const getPersonalizationCost = () => {
    let cost = 0
    if (monogramEnabled) cost += 25
    if (liningEnabled) cost += 35
    if (embroideryEnabled) cost += 45
    return cost
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Add Personal Touches</h2>
        <p className="text-gray-600">Customize your garment with personal details and premium options.</p>
      </div>

      <div className="space-y-6">
        {/* Monogram Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Type className="w-5 h-5 text-primary" />
                <div>
                  <CardTitle className="text-lg">Monogram</CardTitle>
                  <p className="text-sm text-gray-600">Add your initials for a personal touch</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary">+{formatPrice(25)}</Badge>
                <Switch
                  checked={monogramEnabled}
                  onChange={(e) => handleMonogramToggle(e.target.checked)}
                />
              </div>
            </div>
          </CardHeader>
          {monogramEnabled && (
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="monogram-text">Initials (2-3 characters)</Label>
                  <Input
                    id="monogram-text"
                    value={monogramText}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase().slice(0, 3)
                      setMonogramText(value)
                      if (value.length >= 2) {
                        handleMonogramChange()
                      }
                    }}
                    placeholder="ABC"
                    maxLength={3}
                    className="uppercase"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Position</Label>
                  <Select value={monogramPosition} onValueChange={(value) => {
                    setMonogramPosition(value)
                    handleMonogramChange()
                  }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EMBROIDERY_POSITIONS.map((position) => (
                        <SelectItem key={position.id} value={position.id}>
                          {position.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Font Style</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {MONOGRAM_FONTS.map((font) => (
                    <Button
                      key={font.id}
                      variant={monogramFont === font.id ? "default" : "outline"}
                      onClick={() => {
                        setMonogramFont(font.id)
                        handleMonogramChange()
                      }}
                      className="h-12"
                    >
                      <div className="text-center">
                        <div className="font-bold">{font.preview}</div>
                        <div className="text-xs">{font.name}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Thread Color</Label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {MONOGRAM_COLORS.map((color) => (
                    <Button
                      key={color.id}
                      variant={monogramColor === color.id ? "default" : "outline"}
                      onClick={() => {
                        setMonogramColor(color.id)
                        handleMonogramChange()
                      }}
                      className="h-12 flex items-center gap-2"
                    >
                      <div 
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="text-xs">{color.name}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Custom Lining Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Palette className="w-5 h-5 text-primary" />
                <div>
                  <CardTitle className="text-lg">Custom Lining</CardTitle>
                  <p className="text-sm text-gray-600">Choose a colored lining for the interior</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary">+{formatPrice(35)}</Badge>
                <Switch
                  checked={liningEnabled}
                  onChange={(e) => handleLiningToggle(e.target.checked)}
                />
              </div>
            </div>
          </CardHeader>
          {liningEnabled && (
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Lining Color</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {LINING_COLORS.map((color) => (
                    <Button
                      key={color.id}
                      variant={liningColor === color.id ? "default" : "outline"}
                      onClick={() => {
                        setLiningColor(color.id)
                        handleLiningChange()
                      }}
                      className="h-12 flex items-center gap-2"
                    >
                      <div 
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="text-sm">{color.name}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Pattern</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={liningPattern === 'solid' ? "default" : "outline"}
                    onClick={() => {
                      setLiningPattern('solid')
                      handleLiningChange()
                    }}
                  >
                    Solid
                  </Button>
                  <Button
                    variant={liningPattern === 'subtle_pattern' ? "default" : "outline"}
                    onClick={() => {
                      setLiningPattern('subtle_pattern')
                      handleLiningChange()
                    }}
                  >
                    Subtle Pattern
                  </Button>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Custom Embroidery Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-primary" />
                <div>
                  <CardTitle className="text-lg">Custom Embroidery</CardTitle>
                  <p className="text-sm text-gray-600">Add company logo or custom text</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary">+{formatPrice(45)}</Badge>
                <Switch
                  checked={embroideryEnabled}
                  onChange={(e) => handleEmbroideryToggle(e.target.checked)}
                />
              </div>
            </div>
          </CardHeader>
          {embroideryEnabled && (
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="embroidery-text">Text or Logo Description</Label>
                  <Input
                    id="embroidery-text"
                    value={embroideryText}
                    onChange={(e) => {
                      setEmbroideryText(e.target.value)
                      if (e.target.value.trim()) {
                        handleEmbroideryChange()
                      }
                    }}
                    placeholder="Company name or logo description"
                    maxLength={50}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Position</Label>
                  <Select value={embroideryPosition} onValueChange={(value) => {
                    setEmbroideryPosition(value)
                    handleEmbroideryChange()
                  }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EMBROIDERY_POSITIONS.map((position) => (
                        <SelectItem key={position.id} value={position.id}>
                          <div>
                            <div>{position.name}</div>
                            <div className="text-xs text-gray-500">{position.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Thread Color</Label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {MONOGRAM_COLORS.map((color) => (
                    <Button
                      key={color.id}
                      variant={embroideryColor === color.id ? "default" : "outline"}
                      onClick={() => {
                        setEmbroideryColor(color.id)
                        handleEmbroideryChange()
                      }}
                      className="h-12 flex items-center gap-2"
                    >
                      <div 
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="text-xs">{color.name}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Summary */}
      {(monogramEnabled || liningEnabled || embroideryEnabled) && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <h4 className="font-medium text-green-900 mb-3">Personalization Summary</h4>
            <div className="space-y-2 text-sm">
              {monogramEnabled && monogramText && (
                <div className="flex justify-between">
                  <span>Monogram: {monogramText}</span>
                  <span className="font-medium">+{formatPrice(25)}</span>
                </div>
              )}
              {liningEnabled && (
                <div className="flex justify-between">
                  <span>Custom Lining: {LINING_COLORS.find(c => c.id === liningColor)?.name}</span>
                  <span className="font-medium">+{formatPrice(35)}</span>
                </div>
              )}
              {embroideryEnabled && embroideryText && (
                <div className="flex justify-between">
                  <span>Embroidery: {embroideryText}</span>
                  <span className="font-medium">+{formatPrice(45)}</span>
                </div>
              )}
              <div className="border-t border-green-300 pt-2 flex justify-between font-semibold">
                <span>Total Personalization Cost:</span>
                <span>+{formatPrice(getPersonalizationCost())}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}