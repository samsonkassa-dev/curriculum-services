"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"

interface TrainingProfileData {
  trainingId: string
  keywords: string[]
  scope: string
  rationale: string
  alignmentsWithStandard: string
  executiveSummary: string | null
}

export function useCreateTrainingProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: TrainingProfileData) => {
      const token = localStorage.getItem('auth_token')
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/training/add-training-profile`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['training-profile', variables.trainingId] 
      })
    }
  })
}

export function useUpdateTrainingProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: TrainingProfileData) => {
      const token = localStorage.getItem('auth_token')
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API}/training/${data.trainingId}/training-profile`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['training-profile', variables.trainingId] 
      })
    }
  })
} 