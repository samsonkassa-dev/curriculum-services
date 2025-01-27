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

export function useSubmitAssessment(sectionId: string) {
  return useMutation({
    mutationFn: async (data: AssessmentPayload) => {
      const token = localStorage.getItem('auth_token')
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/section/add-assessment-methods/${sectionId}`,
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

export function useGetAssessment(sectionId: string) {
  return useQuery({
    queryKey: ['assessment', sectionId],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token')
      const response = await axios.get<AssessmentResponse>(
        `${process.env.NEXT_PUBLIC_API}/section/assessment-method/${sectionId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      
      return response.data
    }
  })
}


 