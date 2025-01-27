/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { useSubmitModuleInformation, useGetModuleInformation } from "@/lib/hooks/useModuleInformation"
import { Loading } from "@/components/ui/loading"

interface ModuleInformationData {
  keyConcepts: string
  primaryMaterials: string[]
  secondaryMaterials: string[]
  digitalTools: string[]
  instructionMethodIds: string[]
  differentiationStrategies: string
  technologyIntegrationId: string
  technologyIntegrationDescription: string
  inclusionStrategy: string
  teachingStrategy: string
  duration: number
  durationType: 'DAYS' | 'WEEKS' | 'MONTHS'
}

interface ModuleInformationContextType {
  formData: ModuleInformationData
  updateFormData: (field: keyof ModuleInformationData, value: any) => void
  submitForm: () => Promise<void>
}

const ModuleInformationContext = createContext<ModuleInformationContextType | null>(null)

const initialFormData: ModuleInformationData = {
  keyConcepts: '',
  primaryMaterials: [''],
  secondaryMaterials: [''],
  digitalTools: [''],
  instructionMethodIds: [],
  differentiationStrategies: '',
  technologyIntegrationId: '',
  technologyIntegrationDescription: '',
  inclusionStrategy: '',
  teachingStrategy: '',
  duration: 0,
  durationType: 'DAYS'
}

export function ModuleInformationProvider({ children, moduleId }: { children: ReactNode, moduleId: string }) {
  const [formData, setFormData] = useState<ModuleInformationData>(initialFormData)
  const { mutateAsync: submitModuleInformation } = useSubmitModuleInformation(moduleId)
  const { data: existingData, isLoading } = useGetModuleInformation(moduleId)

  console.log('Context - Existing Data:', existingData)
  console.log('Context - Current Form Data:', formData)

  useEffect(() => {
    if (existingData) {
      console.log('Context - Setting form data:', existingData)
      setFormData(existingData)
    }
  }, [existingData])

  const updateFormData = (field: keyof ModuleInformationData, value: any) => {
    console.log('Context - Updating field:', field, 'with value:', value)
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      }
      console.log('Context - New form data:', newData)
      return newData
    })
  }
  
  const submitForm = async () => {
    await submitModuleInformation(formData)
  }

  if (isLoading) {
    return <Loading />
  }

  return (
    <ModuleInformationContext.Provider value={{ formData, updateFormData, submitForm }}>
      {children}
    </ModuleInformationContext.Provider>
  )
}

export const useModuleInformation = () => {
  const context = useContext(ModuleInformationContext)
  if (!context) throw new Error('useModuleInformation must be used within ModuleInformationProvider')
  return context
} 