/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { getCookie } from "@curriculum-services/auth"
import { toast } from "sonner"
import { useBaseData } from "./useBaseData"

// --- Reusable Interfaces (Consider moving to a common types file if used elsewhere) ---
export interface Language {
  id: string
  name: string
  description?: string // Make optional if not always present
}

export interface AcademicLevel {
  id: string
  name: string
  description?: string // Make optional if not always present
}

export interface TrainingTag {
  id: string;
  name: string;
  description?: string; // Make optional if not always present
}

// --- Trainer Specific Interfaces ---
export interface Trainer {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  gender: "MALE" | "FEMALE" | "OTHER" // Assuming based on student type
  dateOfBirth: string // Assuming string format like 'YYYY-MM-DD'
  language: Language
  location: string // Assuming string, adjust if it's an object
  academicLevel: AcademicLevel
  trainingTags: TrainingTag[]
  experienceYears: number
  coursesTaught: string[]
  certifications: string[]
}

interface TrainersResponse {
  code: string
  message: string
  trainers: Trainer[]
  // Assuming pagination fields might be present based on useStudents & query params
  totalPages?: number
  pageSize?: number
  currentPage?: number
  totalElements?: number
}

export interface CreateTrainerData {
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  gender: "MALE" | "FEMALE" | "OTHER"
  dateOfBirth: string // e.g., "2025-04-21"
  languageId: string
  location: string
  academicLevelId: string
  trainingTagIds?: string[] // Optional based on example
  experienceYears: number
  coursesTaught?: string[] // Optional based on example
  certifications?: string[] // Optional based on example
}


// --- Hook for Fetching Trainers ---
export function useTrainers(
  page?: number,
  pageSize?: number
) {
  return useQuery({
    // Include page and pageSize in queryKey for proper caching
    queryKey: ['trainers', page, pageSize],
    queryFn: async () => {
      try {
        const token = getCookie('token')
        if (!token) {
          throw new Error('No authentication token found')
        }

        // Build URL with query parameters
        let url = `${process.env.NEXT_PUBLIC_API}/trainer`
        const params = new URLSearchParams()
        if (page !== undefined) params.append('page', page.toString())
        if (pageSize !== undefined) params.append('page-size', pageSize.toString())

        if (params.toString()) {
          url += `?${params.toString()}`
        }

        const response = await axios.get<TrainersResponse>(url, {
          headers: { Authorization: `Bearer ${token}` }
        })

        // Return the whole response data including potential pagination info
        return response.data
      } catch (error: any) {
        console.error("Error fetching trainers:", error)
        throw new Error(error?.response?.data?.message || 'Failed to load trainers')
      }
    },
    // Keep data fresh for a certain time or disable refetch on window focus if needed
    // staleTime: 5 * 60 * 1000, // e.g., 5 minutes
    // refetchOnWindowFocus: false,
  })
}


// --- Hook for Adding a Trainer ---
export function useAddTrainer() {
  const { data: languages } = useBaseData('language')
  const { data: academicLevels } = useBaseData('academic-level')
  const { data: trainingTags } = useBaseData('training-tag')

  const queryClient = useQueryClient()

  const addTrainerMutation = useMutation({
    mutationFn: async (trainerData: CreateTrainerData) => {
      const token = getCookie('token')
      if (!token) {
        throw new Error('No authentication token found')
      }
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/trainer`,
        trainerData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return response.data // Return response data
    },
    onSuccess: () => {
      toast.success('Trainer added successfully')
      // Invalidate all queries starting with 'trainers' to refetch lists on different pages
      queryClient.invalidateQueries({ queryKey: ['trainers'] })
    },
    onError: (error: any) => {
      console.error("Error adding trainer:", error);
      toast.error(error.response?.data?.message || 'Failed to add trainer')
    }
  })

  return {
    // Data needed for the form
    languages,
    academicLevels,
    trainingTags,
    // Mutation function and state
    addTrainer: addTrainerMutation.mutate,
    addTrainerAsync: addTrainerMutation.mutateAsync, // Expose async version if needed
    isLoading: addTrainerMutation.isPending,
    isSuccess: addTrainerMutation.isSuccess,
    isError: addTrainerMutation.isError,
    error: addTrainerMutation.error,
  }
}
