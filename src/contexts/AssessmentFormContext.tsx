"use client"

import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { useSubmitAssessment, useGetAssessment } from "@/lib/hooks/useAssessment"
import { Loading } from "@/components/ui/loading"

interface AssessmentMethod {
  id: string
  name: string
  description: string
  assessmentSubType: 'GENERAL_FORMATIVE' | 'TECHNOLOGY_SPECIFIC_FORMATIVE' | 'ALTERNATIVE_FORMATIVE'
}

interface AssessmentResponse {
  code: string
  message: string
  sectionAssessmentMethods: {
    sectionId: string
    assessmentMethods: AssessmentMethod[]
    subjectSpecificAssessmentMethod: string
  }
}

interface AssessmentFormData {
  genericFormative: Record<string, boolean>
  technologyFormative: Record<string, boolean>
  alternativeFormative: Record<string, boolean>
  subjectSpecificMethod: string
}

interface AssessmentFormContextType {
  formData: AssessmentFormData
  updateFormData: (
    type: keyof AssessmentFormData, 
    methodId: string, 
    value: boolean | string
  ) => void
  submitForm: () => Promise<void>
  hasAssessmentMethods: boolean
}

const AssessmentFormContext = createContext<AssessmentFormContextType | null>(null)

const initialFormData: AssessmentFormData = {
  genericFormative: {},
  technologyFormative: {},
  alternativeFormative: {},
  subjectSpecificMethod: ''
}

export function AssessmentFormProvider({ children, sectionId }: { children: ReactNode, sectionId: string }) {
  const [formData, setFormData] = useState<AssessmentFormData>(initialFormData)
  const { mutateAsync: submitAssessment } = useSubmitAssessment(sectionId)
  const { data: existingData, isLoading: isLoadingAssessment } = useGetAssessment(sectionId)

  useEffect(() => {
    if (existingData?.sectionAssessmentMethods) {
      const transformed: AssessmentFormData = {
        genericFormative: {},
        technologyFormative: {},
        alternativeFormative: {},
        subjectSpecificMethod: existingData.sectionAssessmentMethods.subjectSpecificAssessmentMethod || ''
      }
      
      existingData.sectionAssessmentMethods.assessmentMethods.forEach((method: AssessmentMethod) => {
        switch (method.assessmentSubType) {
          case 'GENERAL_FORMATIVE':
            transformed.genericFormative[method.id] = true
            break
          case 'TECHNOLOGY_SPECIFIC_FORMATIVE':
            transformed.technologyFormative[method.id] = true
            break
          case 'ALTERNATIVE_FORMATIVE':
            transformed.alternativeFormative[method.id] = true
            break
        }
      })
      
      setFormData(transformed)
    }
  }, [existingData])

  const updateFormData = (
    type: keyof AssessmentFormData,
    methodId: string,
    value: boolean | string
  ) => {
    setFormData(prev => ({
      ...prev,
      [type]: type === 'subjectSpecificMethod' 
        ? value 
        : {
            ...prev[type as keyof Omit<AssessmentFormData, 'subjectSpecificMethod'>],
            [methodId]: value
          }
    }))
  }
  
  const submitForm = async () => {
    const assessmentIds = [
      ...Object.entries(formData.genericFormative)
        .filter(([_, isSelected]) => isSelected)
        .map(([id]) => id),
      ...Object.entries(formData.technologyFormative)
        .filter(([_, isSelected]) => isSelected)
        .map(([id]) => id),
      ...Object.entries(formData.alternativeFormative)
        .filter(([_, isSelected]) => isSelected)
        .map(([id]) => id)
    ]

    await submitAssessment({ 
      assessmentIds,
      subjectSpecificAssessmentMethod: formData.subjectSpecificMethod 
    })
  }

  const hasAssessmentMethods = Boolean(
    existingData?.sectionAssessmentMethods?.assessmentMethods.length || 
    existingData?.sectionAssessmentMethods?.subjectSpecificAssessmentMethod
  )

  if (isLoadingAssessment) {
    return <Loading />
  }

  return (
    <AssessmentFormContext.Provider value={{ 
      formData, 
      updateFormData, 
      submitForm,
      hasAssessmentMethods 
    }}>
      {children}
    </AssessmentFormContext.Provider>
  )
}

export const useAssessmentForm = () => {
  const context = useContext(AssessmentFormContext)
  if (!context) throw new Error('useAssessmentForm must be used within AssessmentFormProvider')
  return context
} 