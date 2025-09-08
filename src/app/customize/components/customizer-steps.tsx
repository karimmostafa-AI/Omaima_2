"use client"

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Check, Circle } from 'lucide-react'

interface Step {
  id: number
  title: string
  description: string
}

interface CustomizerStepsProps {
  steps: Step[]
  currentStep: number
  onStepClick: (stepNumber: number) => void
}

export function CustomizerSteps({ steps, currentStep, onStepClick }: CustomizerStepsProps) {
  return (
    <div className="space-y-1">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Customization Steps</h3>
      {steps.map((step, index) => {
        const isActive = index === currentStep
        const isCompleted = index < currentStep
        const isAccessible = index <= currentStep

        return (
          <Button
            key={step.id}
            variant="ghost"
            onClick={() => isAccessible && onStepClick(step.id)}
            disabled={!isAccessible}
            className={cn(
              "w-full justify-start h-auto p-4 text-left",
              isActive && "bg-primary/10 border-primary/20 border",
              !isAccessible && "opacity-50 cursor-not-allowed"
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5",
                isCompleted && "bg-green-100 text-green-700",
                isActive && "bg-primary text-primary-foreground",
                !isActive && !isCompleted && "bg-gray-100 text-gray-400"
              )}>
                {isCompleted ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <span>{step.id}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className={cn(
                  "font-medium text-sm",
                  isActive && "text-primary",
                  isCompleted && "text-green-700",
                  !isActive && !isCompleted && "text-gray-500"
                )}>
                  {step.title}
                </div>
                <div className={cn(
                  "text-xs mt-0.5",
                  isActive && "text-primary/70",
                  isCompleted && "text-green-600",
                  !isActive && !isCompleted && "text-gray-400"
                )}>
                  {step.description}
                </div>
              </div>
            </div>
          </Button>
        )
      })}
    </div>
  )
}