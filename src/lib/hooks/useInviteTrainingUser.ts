/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"
import { AxiosError } from "axios"


interface InviteUserData {
  trainingId: string
  roleId: string
  userEmail: string
}

interface InviteUserResponse {
  code: string
  message: string
  inviteLink?: string
}

interface ErrorResponse {
  message: string
}

export function useInviteTrainingUser() {
  const mutation = useMutation({
    mutationFn: async (data: InviteUserData) => {
        const token = localStorage.getItem('auth_token');
      const response = await axios.patch<InviteUserResponse>(
        `${process.env.NEXT_PUBLIC_API}/training/invite-curriculum-admin`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return response.data
    },
    onSuccess: (data) => {
      toast.success(data.message || "Invitation sent successfully")
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 
        "Failed to send invitation. Please try again."
      )
    }
  })

  const inviteUser = (trainingId: string, email: string, p0?: { onSuccess: () => void }) => {
    return mutation.mutate({
      trainingId,
      roleId: "a307d367-073b-4c61-8fb6-40995fdef1be", // Curriculum admin role ID
      userEmail: email
    })
  }

  return {
    inviteUser,
    isLoading: mutation.isPending,
    error: mutation.error
  }
}

export function useChangeUserRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: string }) => {
      const token = localStorage.getItem('auth_token')
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API}/user/change-role/${userId}`,
        null, // no body needed since we're using query params
        {
          params: { 'new-role': newRole },
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['training-users'] })
      toast.success('Role updated successfully')
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error("Error", { 
        description: error.response?.data?.message || "Failed to update role" 
      })
    }
  })
} 