import axios from "axios"
import { toast } from "sonner"
import { useMutation, useQuery } from "@tanstack/react-query"

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

interface AssessmentPayload {
  assessmentIds: string[]
  subjectSpecificAssessmentMethod?: string
}

export function useSubmitAssessment(moduleId: string) {
  return useMutation({
    mutationFn: async (data: AssessmentPayload) => {
      const token = localStorage.getItem('auth_token')
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/module/add-assessment-methods/${moduleId}`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return response.data
    },
    onSuccess: () => {
      toast.success('Assessment methods saved successfully')
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Failed to save assessment methods')
      }
    }
  })
}

export function useGetAssessment(moduleId: string) {
  return useQuery({
    queryKey: ['assessment', moduleId],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token')
      const response = await axios.get<AssessmentResponse>(
        `${process.env.NEXT_PUBLIC_API}/module/assessment-method/${moduleId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      
      return response.data
    }
  })
}
