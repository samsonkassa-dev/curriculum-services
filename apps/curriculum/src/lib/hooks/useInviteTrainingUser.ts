/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"
import { AxiosError } from "axios"
import { getCookie } from "@curriculum-services/auth"

// Role type enum to match API requirements
export enum RoleType {
  CURRICULUM_ADMIN = "ROLE_CURRICULUM_ADMIN",
  PROJECT_MANAGER = "ROLE_PROJECT_MANAGER",
  COMPANY_ADMIN = "ROLE_COMPANY_ADMIN",
  TRAINING_ADMIN = "ROLE_TRAINING_ADMIN",
  TRAINER_ADMIN = "ROLE_TRAINER_ADMIN"
}

interface InviteUserData {
  trainingId: string
  userEmail: string
  roleType: RoleType
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
        const token = getCookie('token');
      const response = await axios.patch<InviteUserResponse>(
        `${process.env.NEXT_PUBLIC_API}/training/invite-user`,
        data,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
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

  const inviteUser = (trainingId: string, email: string, roleType: RoleType, onSuccessCallback?: () => void) => {
    return mutation.mutate({
      trainingId,
      userEmail: email,
      roleType
    }, {
      onSuccess: () => {
        if (onSuccessCallback) onSuccessCallback();
      }
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
      const token = getCookie('token')
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API}/user/change-role/${userId}`,
        null, // no body needed since we're using query params
        {
          params: { 'new-role': newRole },
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
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