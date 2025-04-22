import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { getCookie } from "@curriculum-services/auth"
interface AppendixResponse {
  code: string
  message: string
  appendices?: Array<{
    id: string
    definition: string
    moduleId: string
  }>
}

interface AppendixData {
  definition: string
  moduleId: string
}

export const useAppendices = (moduleId: string) => {
  return useQuery<AppendixResponse>({
    queryKey: ['appendices', moduleId],
    queryFn: async () => {
      const token = getCookie('token')
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/module/appendix/${moduleId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return data
    },
    enabled: !!moduleId
  })
}

export const useAddAppendix = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: AppendixData) => {
      const token = getCookie('token')
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/module/add-appendix`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['appendices', variables.moduleId]
      })
    }
  })
} 