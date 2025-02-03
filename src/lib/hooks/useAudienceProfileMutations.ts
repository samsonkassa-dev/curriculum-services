"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"

interface AudienceProfileData {
  learnerLevelId: string
  academicLevelId: string
  learningStylePreferenceIds: string[]
  priorKnowledgeList: string[]
  professionalBackground: string
  trainingId: string
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