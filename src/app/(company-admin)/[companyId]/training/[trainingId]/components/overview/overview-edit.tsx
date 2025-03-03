/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import { Training } from "@/types/training"
import {
  CreateTrainingStep1,
  CreateTrainingStep2,
  CreateTrainingStep3,
  CreateTrainingStep4,
} from "@/app/(company-admin)/[companyId]/training/components/create-training-forms"
import { CreateTrainingStep5 } from "@/app/(company-admin)/[companyId]/training/components/steps/step-5"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface OverviewEditProps {
  training: Training
  initialStep?: number
  onSave: (data: Partial<Training>) => void
  onCancel: () => void
}

type StepData = {
  title?: string
  cityIds?: string[]
  duration?: number
  durationType?: "DAYS" | "WEEKS" | "MONTHS"
  ageGroupIds?: string[]
  genderPercentages?: Training['genderPercentages']
  economicBackgroundIds?: string[]
  academicQualificationIds?: string[]
  trainingPurposeIds?: string[]
}

export function OverviewEdit({ training, initialStep = 1, onSave, onCancel }: OverviewEditProps) {
  const [currentStep, setCurrentStep] = useState(initialStep)
  const [formData, setFormData] = useState<StepData>({
    title: training.title,
    cityIds: training.cities.map(c => c.id),
    duration: training.duration,
    durationType: training.durationType as "DAYS" | "WEEKS" | "MONTHS",
    ageGroupIds: training.ageGroups.map(ag => ag.id),
    genderPercentages: training.genderPercentages,
    economicBackgroundIds: training.economicBackgrounds.map(eb => eb.id),
    academicQualificationIds: training.academicQualifications.map(aq => aq.id),
    trainingPurposeIds: training.trainingPurposes.map(tp => tp.id)
  })
  const [dirtyFields, setDirtyFields] = useState<Set<keyof StepData>>(new Set())

  // Update currentStep when initialStep changes
  useEffect(() => {
    setCurrentStep(initialStep)
  }, [initialStep])

  const trackChanges = (newData: Partial<StepData>) => {
    Object.keys(newData).forEach(key => {
      const typedKey = key as keyof StepData
      if (JSON.stringify(newData[typedKey]) !== JSON.stringify(formData[typedKey])) {
        setDirtyFields(prev => new Set([...prev, typedKey]))
      }
    })
  }

  const handleStepChange = (step: number) => {
    setCurrentStep(step)
  }

  const handleStepSave = (stepData: Partial<StepData>) => {
    setFormData(prev => ({ ...prev, ...stepData }))
    trackChanges(stepData)
  }

  const handleSave = () => {
    const changedData = {} as Partial<Training>
    dirtyFields.forEach(field => {
      if (formData[field] !== undefined) {
        (changedData as any)[field] = formData[field]
      }
    })
    onSave(changedData)
  }

  // Determine which steps are complete
  const getCompletedSteps = () => {
    const completed = new Set<number>()
    
    // Step 1: Title
    if (formData.title) completed.add(1)
    
    // Step 2: Location & Duration
    if (formData.cityIds?.length && formData.duration && formData.durationType) completed.add(2)
    
    // Step 3: Target Audience
    if (formData.ageGroupIds?.length && formData.genderPercentages?.length) completed.add(3)
    
    // Step 4: Background & Qualifications
    if (formData.economicBackgroundIds?.length && formData.academicQualificationIds?.length) completed.add(4)
    
    // Step 5: Purpose
    if (formData.trainingPurposeIds?.length) completed.add(5)
    
    return completed
  }

  return (
    <div className="min-h-screen bg-[#FBFBFB]">
      <div className="w-full mx-auto py-8">
        {/* Step Navigation */}
        <div className="flex justify-between items-center px-10 mb-8">
          <div className="flex gap-4">
            {[1, 2, 3, 4, 5].map(step => (
              <Button
                key={step}
                onClick={() => handleStepChange(step)}
                variant={currentStep === step ? "default" : "outline"}
                className={cn(
                  "rounded-full w-10 h-10",
                  getCompletedSteps().has(step) && "bg-green-50 border-green-500 text-green-500"
                )}
              >
                {step}
              </Button>
            ))}
          </div>
          <div className="flex gap-4">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={dirtyFields.size === 0}
              className="bg-brand text-white"
            >
              Save Changes
            </Button>
          </div>
        </div>

        {/* Step Content */}
        <div className="w-full mx-auto px-5">
          {currentStep === 1 && (
            <CreateTrainingStep1
              initialData={formData}
              onNext={handleStepSave}
            />
          )}
          {currentStep === 2 && (
            <CreateTrainingStep2
              initialData={formData}
              onNext={handleStepSave}
              onBack={() => handleStepChange(1)}
            />
          )}
          {currentStep === 3 && (
            <CreateTrainingStep3
              initialData={formData}
              onNext={handleStepSave}
              onBack={() => handleStepChange(2)}
            />
          )}
          {currentStep === 4 && (
            <CreateTrainingStep4
              initialData={formData}
              onNext={handleStepSave}
              onBack={() => handleStepChange(3)}
            />
          )}
          {currentStep === 5 && (
            <CreateTrainingStep5
              initialData={formData}
              onNext={handleStepSave}
              onBack={() => handleStepChange(4)}
            />
          )}
        </div>
      </div>
    </div>
  )
} 