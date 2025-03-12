"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"

interface AudienceProfileData {
  trainingId: string
  learnerLevelId: string
  languageId?: string
  educationLevelId?: string
  specificCourseList?: string[]
  certifications?: string
  licenses?: string
  workExperienceId?: string
  specificPrerequisites?: string[]
}

export function useCreateAudienceProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: AudienceProfileData) => {
      const token = localStorage.getItem('auth_token')
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/training/add-audience-profile`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['audience-profile', variables.trainingId] 
      })
    }
  })
}

export function useUpdateAudienceProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: AudienceProfileData) => {
      const token = localStorage.getItem('auth_token')
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/training/add-audience-profile`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['audience-profile', variables.trainingId] 
      })
    }
  })
} 