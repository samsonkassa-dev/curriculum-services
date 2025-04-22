import axios from "axios"
import { toast } from "sonner"
import { useMutation, useQuery } from "@tanstack/react-query"
import { ModuleInformationData } from "@/types/module"
import { getCookie } from "@curriculum-services/auth"

interface ModuleResponse {
  code: string
  message: string
  moduleProfile?: {
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
}

export function useGetModuleInformation(moduleId: string) {
  return useQuery({
    queryKey: ['moduleInformation', moduleId],
    queryFn: async () => {
      const token = getCookie('token')
      const response = await axios.get<ModuleResponse>(
        `${process.env.NEXT_PUBLIC_API}/module/profile/${moduleId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      
      if (!response.data.moduleProfile) return null

      // Transform the API response to match our ModuleInformationData type
      return {
        ...response.data.moduleProfile,
        instructionMethodIds: response.data.moduleProfile.instructionMethods?.map(m => m.id) || [],
        technologyIntegrationId: response.data.moduleProfile.technologyIntegration?.id || ''
      }
    },
    retry: false
  })
}



export function useSubmitModuleInformation(moduleId: string) {
  return useMutation({
    mutationFn: async (data: ModuleInformationData) => {
      const token = getCookie('token')
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/module/add-module-profile/${moduleId}`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return response.data
    },
    onSuccess: () => {
      toast.success('Module information saved successfully')
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Failed to save module information')
      }
    }
  })
} 