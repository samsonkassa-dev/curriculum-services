"use client"

import { useMutation } from "@tanstack/react-query"
import axios, { AxiosError } from "axios"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { getCookie, deleteCookie } from "@curriculum-services/auth"


interface ChangePasswordData {
  oldPassword: string
  newPassword: string
}

interface ResetPasswordData {
  email: string
  otp: string
  newPassword: string
}

interface AuthResponse {
  code: string
  message: string
}

interface ErrorResponse {
  message: string
}

export function useForgotPassword() {
  const router = useRouter()

  // Request OTP Mutation
  const requestOtp = useMutation({
    mutationFn: async (email: string) => {
      const response = await axios.patch<AuthResponse>(
        `${process.env.NEXT_PUBLIC_API}/auth/request-otp/${email}`
      )
      return response.data
    },
    onSuccess: (data) => {
      toast.success(data.message)
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error(error.response?.data?.message || "Failed to send OTP")
    },
  })

  // Reset Password Mutation
  const resetPassword = useMutation({
    mutationFn: async (data: ResetPasswordData) => {
      const response = await axios.post<AuthResponse>(
        `${process.env.NEXT_PUBLIC_API}/auth/reset-password`,
        data
      )
      return response.data
    },
    onSuccess: (data) => {
      toast.success(data.message)
      router.push("/login")
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error(error.response?.data?.message || "Failed to reset password")
    },
  })

  return {
    requestOtp,
    resetPassword,
  }
}

export function useChangePassword() {
  const router = useRouter()

  const changePassword = useMutation({
    mutationFn: async (data: ChangePasswordData) => {
      const token = getCookie('auth_token')
      if (!token) throw new Error('No auth token found')
      
      const response = await axios.post<AuthResponse>(
        `${process.env.NEXT_PUBLIC_API}/user/change-password`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      return response.data
    },
    onSuccess: (data) => {
      toast.success(data.message)
      // Clear the token and redirect to login
      deleteCookie('token')
      router.push("/login")
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error(error.response?.data?.message || "Failed to change password")
    },
  })

  return {
    changePassword,
  }
}