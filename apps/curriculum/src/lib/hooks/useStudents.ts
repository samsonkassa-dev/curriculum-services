/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { getCookie } from "@curriculum-services/auth"
import { toast } from "sonner"
import { useBaseData } from "./useBaseData"

export interface City {
  id: string
  name: string
  description: string
  country: {
    id: string
    name: string
    description: string
  }
}

export interface Language {
  id: string
  name: string
  description: string
}

export interface AcademicLevel {
  id: string
  name: string
  description: string
}

export interface Disability {
  id: string
  name: string
  description: string
}

export interface Student {
  id: string
  firstName: string
  lastName: string
  email: string
  contactPhone: string
  dateOfBirth: string
  gender: string
  city: City
  subCity: string
  woreda: string
  houseNumber: string
  language: Language
  academicLevel: AcademicLevel
  fieldOfStudy: string
  hasSmartphone: boolean
  hasTrainingExperience: boolean
  trainingExperienceDescription: string
  emergencyContactName: string
  emergencyContactPhone: string
  emergencyContactRelationship: string
  disabilities: Disability[]
  marginalizedGroups: any[]
}

export interface CreateStudentData {
  firstName: string
  lastName: string
  email: string
  contactPhone: string
  dateOfBirth: string
  gender: "MALE" | "FEMALE" | "OTHER"
  cityId: string
  subCity: string
  woreda: string
  houseNumber: string
  languageId: string
  academicLevelId: string
  fieldOfStudy: string
  hasSmartphone: boolean
  hasTrainingExperience: boolean
  trainingExperienceDescription?: string
  emergencyContactName: string
  emergencyContactPhone: string
  emergencyContactRelationship: string
  disabilityIds?: string[]
  marginalizedGroupIds?: string[]
}

interface StudentsResponse {
  code: string
  trainees: Student[]
  totalPages: number
  pageSize: number
  message: string
  currentPage: number
  totalElements: number
}

export function useStudents(
  trainingId: string, 
  page?: number, 
  pageSize?: number,
  sessionId?: string
) {
  return useQuery({
    queryKey: ['students', trainingId, page, pageSize, sessionId],
    queryFn: async () => {
      try {
        const token = getCookie('token')
        
        // Build URL with query parameters
        let url = `${process.env.NEXT_PUBLIC_API}/trainee/training/${trainingId}`
        
        // Add pagination parameters if provided
        const params = new URLSearchParams()
        if (page !== undefined) params.append('page', page.toString())
        if (pageSize !== undefined) params.append('page-size', pageSize.toString())
        
        // Append query parameters if any exist
        if (params.toString()) {
          url += `?${params.toString()}`
        }
        
        const response = await axios.get<StudentsResponse>(
          url,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )
        
        return response.data
      } catch (error: any) {
        throw new Error(error?.response?.data?.message || 'Failed to load students')
      }
    },
    enabled: !!trainingId
  })
}

export function useAddStudent() {
  // Use baseData hook for required data for creating a student
  const { data: cities } = useBaseData('city')
  const { data: languages } = useBaseData('language')
  const { data: academicLevels } = useBaseData('academic-level')
  const { data: disabilities } = useBaseData('disability')
  const { data: marginalizedGroups } = useBaseData('marginalized-group')

  // Get query client instance
  const queryClient = useQueryClient()

  // Mutation for adding a student to a training
  const addStudentMutation = useMutation({
    mutationFn: async ({ 
      trainingId, 
      studentData 
    }: { 
      trainingId: string, 
      studentData: CreateStudentData 
    }) => {
      const token = getCookie('token')
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/trainee/training/${trainingId}`,
        studentData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return { responseData: response.data, trainingId }
    },
    onSuccess: ({ trainingId }) => {
      toast.success('Student added successfully')
      queryClient.invalidateQueries({ queryKey: ['students', trainingId] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add student')
    }
  })

  return {
    cities,
    languages,
    academicLevels,
    disabilities,
    marginalizedGroups,
    addStudent: addStudentMutation.mutate,
    isLoading: addStudentMutation.isPending
  }
}
