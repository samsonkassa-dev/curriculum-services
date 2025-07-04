import axios, { AxiosError } from "axios"
import { toast } from "sonner"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { getCookie } from "@curriculum-services/auth"

interface GenerateRegistrationLinkPayload {
  trainingId: string
  expiryMinutes: number
}

interface ErrorResponse {
  message: string
  code: string
}

export function useGenerateRegistrationLink() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: GenerateRegistrationLinkPayload) => {
      const token = getCookie('token')
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/registration-link/generate`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return response.data
    },
    onSuccess: () => {
      toast.success('Registration link generated successfully')
      queryClient.invalidateQueries({ queryKey: ['registration-links'] })
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error("Error", { 
        description: error.response?.data?.message || "Failed to generate registration link" 
      })
    }
  })
}
