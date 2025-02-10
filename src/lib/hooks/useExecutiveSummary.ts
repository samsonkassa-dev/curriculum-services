import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axios from "axios"

interface ExecutiveSummaryResponse {
  code: string
  executiveSummary: string
  message: string
}

interface ExecutiveSummaryData {
  trainingId: string
  executiveSummary: string
}

interface AIRecommendationResponse {
  code: string
  response: string
  message: string
}

export const useExecutiveSummary = (trainingId: string) => {
  return useQuery<ExecutiveSummaryResponse>({
    queryKey: ['executive-summary', trainingId],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token')
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/training/executive-summary/${trainingId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return data
    },
    enabled: !!trainingId
  })
}

export const useAddExecutiveSummary = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ExecutiveSummaryData) => {
      const token = localStorage.getItem('auth_token')
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/training/add-executive-summary`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['executive-summary', variables.trainingId]
      })
    }
  })
}

export const useAIRecommendation = (trainingId: string) => {
  return useQuery<AIRecommendationResponse>({
    queryKey: ['ai-recommendation', trainingId],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token')
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/ai/recommendation/${trainingId}?type=EXECUTIVE_SUMMARY`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return data
    },
    enabled: !!trainingId
  })
} 