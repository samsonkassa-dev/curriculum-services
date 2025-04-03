/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { useSubmitModuleInformation, useGetModuleInformation } from "@/lib/hooks/useModuleInformation"
import { Loading } from "@/components/ui/loading"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"

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

interface ModuleProfile {
  moduleId: string
  keyConcepts: string
  primaryMaterials: string[]
  secondaryMaterials: string[]
  digitalTools: string[]
  instructionMethods: Array<{
    id: string
    name: string
    description: string
  }>
  differentiationStrategies: string
  technologyIntegration: {
    id: string
    name: string
    description: string
  }
  technologyIntegrationDescription: string
  inclusionStrategy: string
  teachingStrategy: string
  duration: number
  durationType: 'DAYS' | 'WEEKS' | 'MONTHS'
}

interface ModuleResponse {
  code: string
  message: string
  moduleProfile?: ModuleProfile
}

interface ModuleInformationContextType {
  formData: ModuleInformationData
  updateFormData: (field: keyof ModuleInformationData, value: any) => void
  submitForm: () => Promise<void>
  hasModuleInformation: boolean
  hasReferences: boolean
  hasAppendices: boolean
  isLoadingReferences: boolean
  isLoadingAppendices: boolean
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
  const { data: existingData, isLoading: isLoadingModuleInfo } = useGetModuleInformation(moduleId)
  
  // Add a direct query to check if module profile exists
  const { data: moduleProfileResponse, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['moduleProfileCheck', moduleId],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token')
      try {
        const { data } = await axios.get<ModuleResponse>(
          `${process.env.NEXT_PUBLIC_API}/module/profile/${moduleId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )
        return data
      } catch (error) {
        console.error("Error fetching module profile:", error)
        return { code: "ERROR", message: "Failed to fetch module profile" }
      }
    },
    enabled: !!moduleId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false
  })

  // Add references and appendices hooks here
  const { data: referencesData, isLoading: isLoadingReferences } = useQuery({
    queryKey: ['moduleReferencesCheck', moduleId],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token')
      try {
        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_API}/module/reference/${moduleId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )
        return data
      } catch (error) {
        console.error("Error fetching references:", error)
        return { references: [] }
      }
    },
    enabled: !!moduleId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false
  })

  const { data: appendicesData, isLoading: isLoadingAppendices } = useQuery({
    queryKey: ['moduleAppendicesCheck', moduleId],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token')
      try {
        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_API}/module/appendix/${moduleId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )
        return data
      } catch (error) {
        console.error("Error fetching appendices:", error)
        return { appendices: [] }
      }
    },
    enabled: !!moduleId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false
  })

  const hasReferences = (referencesData?.references?.length || 0) > 0
  const hasAppendices = (appendicesData?.appendices?.length || 0) > 0

  console.log('Context - Existing Data:', existingData)
  console.log('Context - Module Profile Response:', moduleProfileResponse)
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

  // Helper function to check if module information exists
  const hasModuleInformation = Boolean(
    moduleProfileResponse?.code === "OK" && 
    moduleProfileResponse?.moduleProfile && 
    (moduleProfileResponse.moduleProfile.keyConcepts || 
    moduleProfileResponse.moduleProfile.primaryMaterials?.some(material => material.trim() !== '') ||
    moduleProfileResponse.moduleProfile.instructionMethods?.length > 0 ||
    moduleProfileResponse.moduleProfile.technologyIntegration ||
    moduleProfileResponse.moduleProfile.teachingStrategy ||
    moduleProfileResponse.moduleProfile.duration > 0)
  )

  if (isLoadingModuleInfo || isLoadingProfile || isLoadingReferences || isLoadingAppendices) {
    return <Loading />
  }

  return (
    <ModuleInformationContext.Provider value={{ 
      formData, 
      updateFormData, 
      submitForm,
      hasModuleInformation,
      hasReferences,
      hasAppendices,
      isLoadingReferences,
      isLoadingAppendices
    }}>
      {children}
    </ModuleInformationContext.Provider>
  )
}

export const useModuleInformation = () => {
  const context = useContext(ModuleInformationContext)
  if (!context) throw new Error('useModuleInformation must be used within ModuleInformationProvider')
  return context
} 