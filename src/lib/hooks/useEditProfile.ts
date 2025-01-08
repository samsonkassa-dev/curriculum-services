/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"
import { setProfilePicture } from "@/lib/utils/profile"

interface EditProfileData {
  firstName: string
  lastName: string
  email: string
  phoneNumber: string | null
}

interface UploadImageResponse {
  code: string
  message: string
  user: {
    profilePictureUrl: string
  }
}

interface EditProfileResponse {
  code: string
  message: string
}

export function useEditProfile() {
  const queryClient = useQueryClient()

  // Profile Picture Upload Mutation
  const uploadProfilePicture = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('profile-picture', file)

      const token = localStorage.getItem('auth_token')
      const response = await axios.patch<UploadImageResponse>(
        `${process.env.NEXT_PUBLIC_API}/user/upload-profile-picture`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      )
      return response.data.user.profilePictureUrl
    },
    onSuccess: (url) => {
      setProfilePicture(url)
      queryClient.setQueryData(['user-profile'], (old: any) => ({
        ...old,
        profilePictureUrl: url
      }))
      toast.success('Profile picture updated successfully')
    },
    onError: (error: any) => {
      toast.error('Failed to update profile picture', {
        description: error?.response?.data?.message || 'Please try again'
      })
    }
  })

  // Edit Profile Mutation
  const editProfile = useMutation({
    mutationFn: async (data: EditProfileData) => {
      const token = localStorage.getItem('auth_token')
      const response = await axios.patch<EditProfileResponse>(
        `${process.env.NEXT_PUBLIC_API}/user/edit-profile`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] })
      toast.success('Profile updated successfully')
    },
    onError: (error: any) => {
      toast.error('Failed to update profile', {
        description: error?.response?.data?.message || 'Please try again'
      })
    }
  })

  return {
    uploadProfilePicture,
    editProfile
  }
} 