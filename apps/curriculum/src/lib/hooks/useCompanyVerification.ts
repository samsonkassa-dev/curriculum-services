/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios, { AxiosError } from "axios"
import { toast } from "sonner"
import { getCookie } from "@curriculum-services/auth"


interface VerificationResponse {
  code: string;
  message: string;
}

interface ErrorResponse {
  message: string;
  code: string;
}

export function useCompanyVerification() {
  const queryClient = useQueryClient()

  const acceptMutation = useMutation({
    mutationFn: async (id: string) => {
      const token = getCookie('token')
      const response = await axios.patch<VerificationResponse>(
        `${process.env.NEXT_PUBLIC_API}/company-profile/accept-request/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return response.data
    },
    onSuccess: (data) => {
      toast.success("Success", { description: data.message })
      queryClient.invalidateQueries({ queryKey: ['company-profile'] })
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error("Error", { 
        description: error.response?.data?.message || "Failed to accept company" 
      })
    }
  })

  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const token = getCookie('token')
      const response = await axios.patch<VerificationResponse>(
        `${process.env.NEXT_PUBLIC_API}/company-profile/reject-request/${id}`,
        null,
        {
          params: { 'rejection-reason': reason },
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return response.data
    },
    onSuccess: (data) => {
      toast.success("Success", { description: data.message })
      queryClient.invalidateQueries({ queryKey: ['company-profile'] })
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error("Error", { 
        description: error.response?.data?.message || "Failed to reject company" 
      })
    }
  })

  return {
    accept: acceptMutation.mutate,
    reject: rejectMutation.mutate,
    isAccepting: acceptMutation.isPending,
    isRejecting: rejectMutation.isPending
  }
} 