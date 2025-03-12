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
  rationale?: string
  cityIds?: string[]
  countryIds?: string[]
  duration?: number
  durationType?: "DAYS" | "WEEKS" | "MONTHS" | "HOURS"
  trainingTypeId?: string
  ageGroupIds?: string[]
  genderPercentages?: Array<{
    gender: "MALE" | "FEMALE";
    percentage: number;
  }>
  disabilityPercentages?: Array<{
    disabilityId: string;
    percentage: number;
  }>
  marginalizedGroupPercentages?: Array<{
    marginalizedGroupId: string;
    percentage: number;
  }>
  economicBackgroundIds?: string[]
  academicQualificationIds?: string[]
  trainingPurposeIds?: string[]
}

export function OverviewEdit({ training, initialStep = 1, onSave, onCancel }: OverviewEditProps) {
  const [currentStep, setCurrentStep] = useState(initialStep)
  
  // Transform the disability and marginalized group data to match the expected structure
  const transformedDisabilityPercentages = Array.isArray((training as any).disabilityPercentages) 
    ? (training as any).disabilityPercentages.map((item: any) => ({
        disabilityId: item.disability?.id || "",
        percentage: item.percentage || 0
      }))
    : [];
  
  const transformedMarginalizedGroupPercentages = Array.isArray((training as any).marginalizedGroupPercentages)
    ? (training as any).marginalizedGroupPercentages.map((item: any) => ({
        marginalizedGroupId: item.marginalizedGroup?.id || "",
        percentage: item.percentage || 0
      }))
    : [];
  
  const [formData, setFormData] = useState<StepData>({
    title: training.title,
    rationale: training.rationale,
    countryIds: training.cities.map(c => c.country?.id).filter(Boolean) as string[],
    cityIds: training.cities.map(c => c.id),
    duration: training.duration,
    durationType: training.durationType as "DAYS" | "WEEKS" | "MONTHS" | "HOURS",
    trainingTypeId: (training as any).trainingType?.id ?? "",
    ageGroupIds: training.ageGroups.map(ag => ag.id),
    genderPercentages: training.genderPercentages,
    disabilityPercentages: transformedDisabilityPercentages,
    marginalizedGroupPercentages: transformedMarginalizedGroupPercentages,
    economicBackgroundIds: training.economicBackgrounds.map(eb => eb.id),
    academicQualificationIds: training.academicQualifications.map(aq => aq.id),
    trainingPurposeIds: training.trainingPurposes.map(tp => tp.id)
  })
  const [dirtyFields, setDirtyFields] = useState<Set<keyof StepData>>(new Set())
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Log form data to debug
  useEffect(() => {
    console.log('Form data initialized:', formData);
  }, [formData]);

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
    const updatedData = { ...formData, ...stepData }
    setFormData(updatedData)
    trackChanges(stepData)
    
    // Automatically move to the next step
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    } else {
      // If we're on the last step, trigger the save
      const changedData = {} as Partial<Training>
      
      Object.keys(updatedData).forEach(key => {
        const typedKey = key as keyof StepData
        if (updatedData[typedKey] !== undefined) {
          (changedData as any)[typedKey] = updatedData[typedKey]
        }
      })
      
      setIsSubmitting(true)
      onSave(changedData)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    } else {
      onCancel()
    }
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <CreateTrainingStep1
            initialData={formData as any}
            onNext={handleStepSave}
          />
        )
      case 2:
        return (
          <CreateTrainingStep2
            initialData={formData as any}
            onNext={handleStepSave}
            onBack={handleBack}
          />
        )
      case 3:
        return (
          <CreateTrainingStep3
            initialData={formData as any}
            onNext={handleStepSave}
            onBack={handleBack}
          />
        )
      case 4:
        return (
          <CreateTrainingStep4
            initialData={formData as any}
            onNext={handleStepSave}
            onBack={handleBack}
          />
        )
      case 5:
        return (
          <CreateTrainingStep5
            initialData={formData as any}
            onNext={handleStepSave}
            onBack={handleBack}
            isSubmitting={isSubmitting}
            isEditing={true}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen">
      <div className="w-full mx-auto py-8">
        <div className="flex justify-end px-10 mb-8">
          <Button variant="outline" onClick={onCancel} className="mr-4">
            Cancel
          </Button>
        </div>

        {/* Step Content */}
        <div className="w-full mx-auto px-5">
          {renderCurrentStep()}
        </div>
      </div>
    </div>
  )
} 