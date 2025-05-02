/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { getCookie } from "@curriculum-services/auth"
import { toast } from "sonner"

export interface TrainingTag {
  id: string
  name: string
  description: string
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

export interface Trainer {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  gender: string
  dateOfBirth: string
  language: Language
  location: string
  academicLevel: AcademicLevel
  trainingTags: TrainingTag[]
  experienceYears: number
  coursesTaught: any[]
  certifications: any[]
}

export interface Job {
  id: string
  title: string
  description: string
  createdAt: string
  deadlineDate: string
  numberOfSessions: number
  applicantsRequired: number
  status: string
}

export interface Application {
  id: string
  reason: string
  job: Job
  trainer: Trainer
  status: "PENDING" | "ACCEPTED" | "REJECTED"
  createdAt: string
}

export interface CreateApplicationData {
  jobId: string
  reason: string
}

export interface RejectApplicationData {
  reason: string
}

interface ApplicationsResponse {
  code: string
  applications: Application[]
  totalPages: number
  message: string
  totalElements: number
}

interface SingleApplicationResponse {
  code: string
  application: Application
  message: string
}

export function useApplications(
  page?: number,
  pageSize?: number
) {
  return useQuery({
    queryKey: ['applications', page, pageSize],
    queryFn: async () => {
      try {
        const token = getCookie('token')
        
        // Build URL with query parameters
        let url = `${process.env.NEXT_PUBLIC_API}/application`
        
        // Add pagination parameters if provided
        const params = new URLSearchParams()
        if (page !== undefined) params.append('page', page.toString())
        if (pageSize !== undefined) params.append('page-size', pageSize.toString())
        
        // Append query parameters if any exist
        if (params.toString()) {
          url += `?${params.toString()}`
        }
        
        const response = await axios.get<ApplicationsResponse>(
          url,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )
        
        return response.data
      } catch (error: any) {
        throw new Error(error?.response?.data?.message || 'Failed to load applications')
      }
    }
  })
}

export function useApplication(id: string) {
  return useQuery({
    queryKey: ['application', id],
    queryFn: async () => {
      try {
        const token = getCookie('token')
        const response = await axios.get<SingleApplicationResponse>(
          `${process.env.NEXT_PUBLIC_API}/application/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )
        return response.data
      } catch (error: any) {
        throw new Error(error?.response?.data?.message || 'Failed to load application')
      }
    },
    enabled: !!id
  })
}

export function useCreateApplication() {
  const queryClient = useQueryClient()

  const createApplicationMutation = useMutation({
    mutationFn: async (applicationData: CreateApplicationData) => {
      const token = getCookie('token')
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/application`,
        applicationData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return response.data
    },
    onSuccess: () => {
      toast.success('Application submitted successfully')
      queryClient.invalidateQueries({ queryKey: ['applications'] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to submit application')
    }
  })

  return {
    createApplication: createApplicationMutation.mutate,
    isLoading: createApplicationMutation.isPending
  }
}

export function useAcceptApplication() {
  const queryClient = useQueryClient()

  const acceptMutation = useMutation({
    mutationFn: async (applicationId: string) => {
      const token = getCookie('token')
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API}/application/${applicationId}/accept`,
        {},  // No request body needed
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return response.data
    },
    onSuccess: (data, applicationId) => {
      toast.success('Application accepted successfully')
      // Invalidate the specific application to refetch
      queryClient.invalidateQueries({ queryKey: ['application', applicationId] })
      // Update the specific application in the cache immediately
      queryClient.setQueryData(['application', applicationId], data)
      // Invalidate all applications list queries
      queryClient.invalidateQueries({ queryKey: ['applications'] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to accept application')
    }
  })

  return {
    acceptApplication: acceptMutation.mutate,
    acceptApplicationAsync: acceptMutation.mutateAsync,
    isLoading: acceptMutation.isPending,
    isSuccess: acceptMutation.isSuccess,
    isError: acceptMutation.isError,
    error: acceptMutation.error
  }
}

export function useRejectApplication() {
  const queryClient = useQueryClient()

  const rejectMutation = useMutation({
    mutationFn: async ({ 
      applicationId, 
      reason 
    }: { 
      applicationId: string, 
      reason: string 
    }) => {
      const token = getCookie('token')
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API}/application/${applicationId}/reject`,
        { reason },  // Include rejection reason in request body
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return response.data
    },
    onSuccess: (data, variables) => {
      toast.success('Application rejected successfully')
      // Invalidate the specific application to refetch
      queryClient.invalidateQueries({ queryKey: ['application', variables.applicationId] })
      // Update the specific application in the cache immediately
      queryClient.setQueryData(['application', variables.applicationId], data)
      // Invalidate all applications list queries
      queryClient.invalidateQueries({ queryKey: ['applications'] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to reject application')
    }
  })

  return {
    rejectApplication: rejectMutation.mutate,
    rejectApplicationAsync: rejectMutation.mutateAsync,
    isLoading: rejectMutation.isPending,
    isSuccess: rejectMutation.isSuccess,
    isError: rejectMutation.isError,
    error: rejectMutation.error
  }
}
