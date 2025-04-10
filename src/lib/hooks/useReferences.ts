import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axios from "axios"

interface ReferenceResponse {
  code: string
  message: string
  references?: Array<{
    id: string
    definition: string
    moduleId: string
  }>
}

interface ReferenceData {
  definition: string
  moduleId: string
}

export const useReferences = (moduleId: string) => {
  return useQuery<ReferenceResponse>({
    queryKey: ['references', moduleId],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token')
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/module/reference/${moduleId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return data
    },
    enabled: !!moduleId
  })
}

export const useAddReference = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ReferenceData) => {
      const token = localStorage.getItem('auth_token')
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/module/add-reference`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['references', variables.moduleId]
      })
    }
  })
} 