/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useQuery } from "@tanstack/react-query"
import axios from "axios"

interface TrainingResponse {
  code: string
  training: {
    id: string
    title: string
    cities: {
      id: string
      name: string
      description: string
      country: {
        id: string
        name: string
        description: string
      }
    }[]
    duration: number
    durationType: string
    ageGroups: {
      id: string
      name: string
      range: string
      description: string
    }[]
    targetAudienceGenders: ("MALE" | "FEMALE")[]
    economicBackgrounds: {
      id: string
      name: string
      description: string
    }[]
    academicQualifications: {
      id: string
      name: string
      description: string
    }[]
    trainingPurposes: {
      id: string
      name: string
      description: string
    }[]
    companyProfile: {
      id: string
      name: string
      // ... other company profile fields
    }
  }
  message: string
}

export function useTraining(trainingId: string) {
  return useQuery({
    queryKey: ['training', trainingId],
    queryFn: async () => {
      try {
        const token = localStorage.getItem('auth_token')
        const response = await axios.get<TrainingResponse>(
          `${process.env.NEXT_PUBLIC_API}/training/${trainingId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )
        return response.data.training
      } catch (error: any) {
        throw new Error(error?.response?.data?.message || 'Failed to load training')
      }
    },
    enabled: !!trainingId,
    retry: 1 // Only retry once on failure
  })
} 