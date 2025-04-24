/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useMutation } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"
import { getCookie } from "@curriculum-services/auth"

interface InviteTrainerAdminData {
  userEmail: string
}

interface InviteTrainerAdminResponse {
  code: string
  message: string
}

export function useInviteTrainerAdmin() {
  const mutation = useMutation({
    mutationFn: async (data: InviteTrainerAdminData) => {
      const token = getCookie('token');
      const response = await axios.post<InviteTrainerAdminResponse>(
        `${process.env.NEXT_PUBLIC_API}/company-profile/invite-trainer-admin`,
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
      toast.success(data.message || "Trainer Admin invitation sent successfully")
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || 
        "Failed to send Trainer Admin invitation. Please try again."
      )
    }
  })

  const inviteTrainerAdmin = (email: string, onSuccessCallback?: () => void) => {
    return mutation.mutate({
      userEmail: email
    }, {
      onSuccess: () => {
        if (onSuccessCallback) onSuccessCallback();
      }
    })
  }

  return {
    inviteTrainerAdmin,
    isLoading: mutation.isPending,
    error: mutation.error
  }
} 