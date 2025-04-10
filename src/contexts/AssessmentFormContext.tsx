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

// Define a common interface for the assessment data structure
interface AssessmentData {
  assessmentMethods: AssessmentMethod[]
  subjectSpecificAssessmentMethod: string
}

interface AssessmentResponse {
  code: string
  message: string
  moduleAssessmentMethods?: AssessmentData & { moduleId: string }
  sectionAssessmentMethods?: AssessmentData & { sectionId: string }
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
  isEditing: boolean
  originalAssessmentData: AssessmentData | null
}

const AssessmentFormContext = createContext<AssessmentFormContextType | null>(null)

const initialFormData: AssessmentFormData = {
  genericFormative: {},
  technologyFormative: {},
  alternativeFormative: {},
  subjectSpecificMethod: ''
}

export function AssessmentFormProvider({ children, moduleId }: { children: ReactNode, moduleId: string }) {
  const [formData, setFormData] = useState<AssessmentFormData>(initialFormData)
  const [isEditing, setIsEditing] = useState(false)
  const [originalAssessmentData, setOriginalAssessmentData] = useState<AssessmentData | null>(null)
  const { mutateAsync: submitAssessment } = useSubmitAssessment(moduleId)
  const { data: existingData, isLoading: isLoadingAssessment } = useGetAssessment(moduleId, {
    staleTime: 1000 * 60 * 15, // 15 minutes cache
    gcTime: 1000 * 60 * 30, // 30 minutes garbage collection
  })

  useEffect(() => {
    if (existingData) {
      // Handle both response structures (moduleAssessmentMethods or sectionAssessmentMethods)
      const assessmentData = existingData.moduleAssessmentMethods || existingData.sectionAssessmentMethods
      
      if (assessmentData) {
        setOriginalAssessmentData(assessmentData)
        
        const transformed: AssessmentFormData = {
          genericFormative: {},
          technologyFormative: {},
          alternativeFormative: {},
          subjectSpecificMethod: assessmentData.subjectSpecificAssessmentMethod || ''
        }
        
        assessmentData.assessmentMethods.forEach((method: AssessmentMethod) => {
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
        
        // Set editing flag if there's existing data
        if (
          assessmentData.assessmentMethods.length > 0 || 
          assessmentData.subjectSpecificAssessmentMethod
        ) {
          setIsEditing(true)
        }
      }
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

  // Improved method to check if we have assessment methods
  const hasAssessmentMethods = Boolean(
    (originalAssessmentData?.assessmentMethods?.length ?? 0) > 0 ||
    (originalAssessmentData?.subjectSpecificAssessmentMethod ?? '').trim() !== ''
  )

  if (isLoadingAssessment) {
    return <Loading />
  }

  return (
    <AssessmentFormContext.Provider value={{ 
      formData, 
      updateFormData, 
      submitForm,
      hasAssessmentMethods,
      isEditing,
      originalAssessmentData
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