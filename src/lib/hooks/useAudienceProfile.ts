/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useQuery } from "@tanstack/react-query"
import axios from "axios"

interface BaseItem {
  id: string
  name: string
  description: string
}

interface AudienceProfile {
  id: string
  trainingId: string
  learnerLevel: BaseItem
  language?: BaseItem
  educationLevel?: BaseItem
  specificCoursesList?: string[]
  certifications?: string
  licenses?: string
  workExperience?: BaseItem
  specificPrerequisites?: string[]
}

interface AudienceProfileResponse {
  audienceProfile: AudienceProfile | null
  code: string
  message: string
}

export function useAudienceProfile(trainingId: string) {
  return useQuery({
    queryKey: ['audience-profile', trainingId],
    queryFn: async () => {
      try {
        const token = localStorage.getItem('auth_token')
        const response = await axios.get<AudienceProfileResponse>(
          `${process.env.NEXT_PUBLIC_API}/training/audience-profile/${trainingId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )
        return response.data.audienceProfile || null  
      } catch (error: any) {
        return null
      }
    },
    enabled: !!trainingId,
    retry: 1
  })
} 