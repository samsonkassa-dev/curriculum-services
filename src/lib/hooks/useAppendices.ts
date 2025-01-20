import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axios from "axios"

interface AppendixResponse {
  code: string
  message: string
  appendices?: Array<{
    id: string
    definition: string
    trainingId: string
  }>
}

interface AppendixData {
  definition: string
  trainingId: string
}

export const useAppendices = (trainingId: string) => {
  return useQuery<AppendixResponse>({
    queryKey: ['appendices', trainingId],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token')
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/training/appendix/${trainingId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return data
    },
    enabled: !!trainingId
  })
}

export const useAddAppendix = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: AppendixData) => {
      const token = localStorage.getItem('auth_token')
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/training/add-appendix`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['appendices', variables.trainingId]
      })
    }
  })
} 