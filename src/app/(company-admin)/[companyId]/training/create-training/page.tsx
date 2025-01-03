/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CreateTrainingStep1, CreateTrainingStep2 } from "../components/create-training-forms"
import { useCreateTraining } from "@/lib/hooks/useCreateTraining"

type Step = 1 | 2 | 3 | 4 | 5

export default function CreateTraining() {
  const [currentStep, setCurrentStep] = useState<Step>(1)
  const [formData, setFormData] = useState<any>({})
  const router = useRouter()
  const { createTraining, isLoading } = useCreateTraining()

  const handleNext = (stepData: any) => {
    setFormData((prev: any) => ({ ...prev, ...stepData }))
    if (currentStep < 5) {
      setCurrentStep(prev => (prev + 1) as Step)
    } else {
      // Submit form
      createTraining(formData)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => (prev - 1) as Step)
    }
  }

  const handleExit = () => {
    router.back()
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <CreateTrainingStep1 onNext={handleNext} />
      case 2:
        return <CreateTrainingStep2 onNext={handleNext} onBack={handleBack} />
      // Add other steps as we implement them
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-[#FBFBFB]">
      <div className="w-full mx-auto py-8">
        {/* Progress Header */}
        <div className="flex justify-between items-center mb-8 px-10">
          <div className="text-sm text-gray-500">Step {currentStep} of 5</div>
          <button 
            onClick={handleExit}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Exit
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-[3px] mb-12">
          <div 
            className="h-full bg-brand transition-all duration-300"
            style={{ width: `${(currentStep / 5) * 100}%` }}
          />
        </div>

        {/* Form Steps */}
        <div className="w-full mx-auto">
          {renderStep()}
        </div>
      </div>
    </div>
  )
}
