/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"

interface BaseItem {
  id: string
  name: string
  description: string
}

interface WorkExperience extends BaseItem {
  range: string
}

interface Prerequisite {
  id: string
  trainingId: string
  educationLevel: BaseItem
  language: BaseItem
  specificCourseList: string[]
  certifications: string
  licenses: string
  workExperience: WorkExperience
  specificPrerequisites: string[]
}

interface PrerequisiteResponse {
  prerequisite: Prerequisite | null
  code: string
  message: string
}

interface PrerequisiteData {
  languageId: string
  educationLevelId: string
  specificCourseList: string[]
  trainingId: string
  certifications: string
  licenses: string
  workExperienceId: string
  specificPrerequisites: string[]
}

// Hook to fetch prerequisite data
export function usePrerequisite(trainingId: string) {
  return useQuery({
    queryKey: ['prerequisite', trainingId],
    queryFn: async () => {
      try {
        const token = localStorage.getItem('auth_token')
        const response = await axios.get<PrerequisiteResponse>(
          `${process.env.NEXT_PUBLIC_API}/training/prerequisite/${trainingId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )
        return response.data.prerequisite || null
      } catch (error: any) {
        return null
      }
    },
    enabled: !!trainingId,
    retry: 1
  })
}

// Hook to create prerequisite
export function useCreatePrerequisite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: PrerequisiteData) => {
      const token = localStorage.getItem('auth_token')
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/training/add-prerequisite`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['prerequisite', variables.trainingId] 
      })
    }
  })
}

// Hook to update prerequisite
export function useUpdatePrerequisite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: PrerequisiteData) => {
      const token = localStorage.getItem('auth_token')
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API}/training/prerequisite/${data.trainingId}`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['prerequisite', variables.trainingId] 
      })
    }
  })
}


