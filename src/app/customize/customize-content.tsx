"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, ArrowRight, Save, ShoppingCart } from 'lucide-react'
import { useCustomizerStore } from '@/store/customizer'
import { useAuthStore } from '@/store/auth-store'
// Import components for customization
import { 
  CustomizerSteps,
  TemplateSelection,
  FabricSelection,
  ComponentSelection,
  MeasurementsInput,
  PersonalizationOptions,
  DesignPreview,
  DesignReview,
  PriceBreakdown,
  SaveDesignModal
} from './components'

const STEPS = [
  { id: 1, title: 'Template', description: 'Choose your base style' },
  { id: 2, title: 'Fabric', description: 'Select material and color' },
  { id: 3, title: 'Components', description: 'Customize style details' },
  { id: 4, title: 'Measurements', description: 'Enter your measurements' },
  { id: 5, title: 'Personalization', description: 'Add personal touches' },
  { id: 6, title: 'Review', description: 'Finalize your design' }
]

export default function CustomizeContent() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false)
  
  const {
    currentStep,
    totalSteps,
    configuration,
    totalPrice,
    priceBreakdown,
    isLoading,
    hasUnsavedChanges,
    validationErrors,
    goToStep,
    goToNextStep,
    goToPreviousStep,
    validateCurrentStep,
    saveDesign,
    addToCart,
    resetConfiguration
  } = useCustomizerStore()

  // Initialize customizer on mount
  useEffect(() => {
    // Set total steps to match our STEPS array
    useCustomizerStore.setState({ totalSteps: STEPS.length })
  }, [])

  const handleNext = () => {
    if (validateCurrentStep()) {
      goToNextStep()
    }
  }

  const handlePrevious = () => {
    goToPreviousStep()
  }

  const handleStepClick = (stepNumber: number) => {
    goToStep(stepNumber - 1) // Convert to 0-based index
  }

  const handleSaveDesign = () => {
    // If user is not logged in, redirect to login with return URL
    if (!user) {
      router.push('/auth/login?redirect=/customize')
      return
    }
    
    setIsSaveModalOpen(true)
  }

  const handleAddToCart = async () => {
    try {
      // If user is not logged in, redirect to login with return URL
      if (!user) {
        router.push('/auth/login?redirect=/customize')
        return
      }
      
      await addToCart()
      router.push('/cart')
    } catch (error) {
      console.error('Failed to add to cart:', error)
    }
  }

  const handleStartOver = () => {
    resetConfiguration()
    goToStep(0)
  }

  const currentStepConfig = STEPS[currentStep] || STEPS[0]
  const progress = ((currentStep + 1) / totalSteps) * 100

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <TemplateSelection />
      case 1:
        return <FabricSelection />
      case 2:
        return <ComponentSelection />
      case 3:
        return <MeasurementsInput />
      case 4:
        return <PersonalizationOptions />
      case 5:
        return <DesignReview />
      default:
        return <TemplateSelection />
    }
  }

  const canProceed = currentStep === totalSteps - 1 ? true : validateCurrentStep()
  const isLastStep = currentStep === totalSteps - 1

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Guest notification banner */}
        {!user && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-blue-800">
              <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                i
              </div>
              <div>
                <p className="font-medium">Guest Mode</p>
                <p className="text-sm text-blue-600">
                  You're browsing as a guest. <Button variant="link" className="h-auto p-0 text-blue-600 underline" onClick={() => router.push('/auth/login?redirect=/customize')}>Login</Button> or <Button variant="link" className="h-auto p-0 text-blue-600 underline" onClick={() => router.push('/auth/register?redirect=/customize')}>create an account</Button> to save your design and place orders.
                </p>
              </div>
            </div>
          </div>
        )}
                
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Custom Builder</h1>
              <p className="text-gray-600 mt-1">Create your perfect professional garment</p>
            </div>
            <div className="flex items-center gap-4">
              {hasUnsavedChanges && (
                <Badge variant="outline" className="text-orange-600 border-orange-600">
                  Unsaved changes
                </Badge>
              )}
              <Button variant="outline" onClick={handleStartOver}>
                Start Over
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Step {currentStep + 1} of {totalSteps}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Steps Sidebar */}
          <div className="lg:col-span-1">
            <CustomizerSteps 
              steps={STEPS}
              currentStep={currentStep}
              onStepClick={handleStepClick}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                    {currentStep + 1}
                  </span>
                  {currentStepConfig.title}
                </CardTitle>
                <p className="text-gray-600">{currentStepConfig.description}</p>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  renderStepContent()
                )}

                {/* Validation Errors */}
                {Object.keys(validationErrors).length > 0 && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="text-red-800 font-medium mb-2">Please fix the following errors:</h4>
                    <ul className="text-red-700 text-sm space-y-1">
                      {Object.entries(validationErrors).map(([field, error]) => (
                        <li key={field}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between items-center mt-8 pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Previous
                  </Button>

                  <div className="flex items-center gap-3">
                    {isLastStep ? (
                      <>
                        {user ? (
                          <>
                            <Button
                              variant="outline"
                              onClick={handleSaveDesign}
                              className="flex items-center gap-2"
                            >
                              <Save className="w-4 h-4" />
                              Save Design
                            </Button>
                            <Button
                              onClick={handleAddToCart}
                              disabled={!canProceed}
                              className="flex items-center gap-2"
                            >
                              <ShoppingCart className="w-4 h-4" />
                              Add to Cart
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="outline"
                              onClick={() => router.push('/auth/login?redirect=/customize')}
                              className="flex items-center gap-2"
                            >
                              Login to Save
                            </Button>
                            <Button
                              onClick={() => router.push('/auth/login?redirect=/customize')}
                              disabled={!canProceed}
                              className="flex items-center gap-2"
                            >
                              <ShoppingCart className="w-4 h-4" />
                              Login to Order
                            </Button>
                          </>
                        )}
                      </>
                    ) : (
                      <Button
                        onClick={handleNext}
                        disabled={!canProceed}
                        className="flex items-center gap-2"
                      >
                        Next
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Price Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <DesignPreview />
            <PriceBreakdown />
          </div>
        </div>
      </div>

      {/* Save Design Modal */}
      <SaveDesignModal 
        open={isSaveModalOpen}
        onOpenChange={setIsSaveModalOpen}
        onSave={saveDesign}
      />
    </div>
  )
}