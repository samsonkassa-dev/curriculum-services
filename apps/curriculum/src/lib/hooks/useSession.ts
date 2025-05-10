/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { getCookie } from "@curriculum-services/auth"
import { toast } from "sonner"
import { Student } from "./useStudents"

export type DeliveryMethod = "OFFLINE" | "ONLINE" | "SELF_PACED"
export type CompensationType = "PER_HOUR" | "PER_TRAINEES" 
export type SessionStatus = "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELED" | "POSTPONED"
export type DurationType = "HOURS" | "DAYS" | "WEEKS" | "MONTHS"

export interface Lesson {
  id: string
  name: string
  objective: string
  description: string
  duration: number
  durationType: DurationType
}

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

export interface TrainingVenue {
  id: string
  name: string
  location: string
  city: City
  zone: string
  woreda: string
  latitude: number
  longitude: number
}

export interface Trainer {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  gender?: string
  dateOfBirth?: string
  language?: { id: string; name: string; description?: string }
  location?: string
  academicLevel?: { id: string; name: string; description?: string }
  trainingTags?: Array<{ id: string; name: string; description?: string }>
  experienceYears?: number
  coursesTaught?: Array<any>
  certifications?: Array<any>
}

export interface Session {
  id: string
  name: string
  lessons: Lesson[]
  deliveryMethod: DeliveryMethod
  startDate: string
  endDate: string
  numberOfStudents: number
  trainingVenue: TrainingVenue
  meetsRequirement: boolean
  requirementRemark: string
  trainerCompensationType: CompensationType
  trainerCompensationAmount: number
  numberOfAssistantTrainers: number
  assistantTrainerCompensationType: CompensationType
  assistantTrainerCompensationAmount: number
  status: SessionStatus
  incompletionReason: string | null
  fileUrls: string[]
  trainingLink: string | null
}

export interface CreateSessionData {
  name: string
  lessonIds: string[]
  deliveryMethod: DeliveryMethod
  startDate: string
  endDate: string
  numberOfStudents: number
  trainingVenueId: string
  meetsRequirement: boolean
  requirementRemark: string
  trainerCompensationType: CompensationType
  trainerCompensationAmount: number
  numberOfAssistantTrainer: number
  assistantTrainerCompensationType: CompensationType
  assistantTrainerCompensationAmount: number
  trainingLink?: string
}

interface SessionsResponse {
  sessions: Session[]
  code: string
  totalPages: number
  message: string
  totalElements: number
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

interface SessionResponse {
  code: string
  session: Session
  message: string
}

interface SessionQueryParams {
  trainingIds: string[]
  deliveryMethod?: DeliveryMethod
  trainerCompensationType?: CompensationType
  status?: SessionStatus
  startDate?: string
  endDate?: string
  page?: number
  pageSize?: number
}

interface SessionTrainersResponse {
  code: string
  trainers: Trainer[]
  message: string
}

export function useSession(sessionId: string) {
  return useQuery({
    queryKey: ['session', sessionId],
    queryFn: async () => {
      try {
        const token = getCookie('token')
        const response = await axios.get<SessionResponse>(
          `${process.env.NEXT_PUBLIC_API}/session/${sessionId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )
        return response.data.session
      } catch (error: any) {
        throw new Error(error?.response?.data?.message || 'Failed to load session details')
      }
    },
    enabled: !!sessionId
  })
}

export function useSessionTrainers(sessionId: string, trainerType: 'MAIN' | 'ASSISTANT') {
  return useQuery({
    queryKey: ['sessionTrainers', sessionId, trainerType],
    queryFn: async () => {
      try {
        const token = getCookie('token')
        const response = await axios.get<SessionTrainersResponse>(
          `${process.env.NEXT_PUBLIC_API}/session/${sessionId}/trainers`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { 'trainer-type': trainerType }
          }
        )
        return response.data.trainers
      } catch (error: any) {
        throw new Error(error?.response?.data?.message || `Failed to load ${trainerType.toLowerCase().replace('_', ' ')}s`)
      }
    },
    enabled: !!sessionId && !!trainerType,
    retry: 2
  })
}

export function useSessions(params: SessionQueryParams) {
  return useQuery<SessionsResponse, Error>({
    queryKey: ['sessions', params],
    queryFn: async () => {
      try {
        const token = getCookie('token')
        
        // Build URL with query parameters
        const url = `${process.env.NEXT_PUBLIC_API}/session`
        
        // Add query parameters
        const queryParams = new URLSearchParams()
        
        // --- Add trainingIds (Required) --- 
        // Revert: Assume trainingIds is always provided and required by API
        params.trainingIds.forEach(id => {
          queryParams.append('trainingIds', id)
        })
        
        // Add other optional parameters if provided
        if (params.deliveryMethod) queryParams.append('deliveryMethod', params.deliveryMethod)
        if (params.trainerCompensationType) queryParams.append('trainerCompensationType', params.trainerCompensationType)
        if (params.status) queryParams.append('status', params.status)
        if (params.startDate) queryParams.append('startDate', params.startDate)
        if (params.endDate) queryParams.append('endDate', params.endDate)
        
        // Make sure page is at least 1 (backend uses 1-based indexing)
        if (params.page !== undefined) {
          const pageNumber = Math.max(1, params.page)
          queryParams.append('page', pageNumber.toString())
        }
        
        if (params.pageSize !== undefined) queryParams.append('pageSize', params.pageSize.toString())
        
        const response = await axios.get<SessionsResponse>(
          `${url}?${queryParams.toString()}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )
        
        return response.data
      } catch (error: any) {
        // Improve error handling
        const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load sessions';
        console.log("Error fetching sessions:", error);
        throw new Error(errorMessage);
      }
    },
    // Revert enabled logic: Only run if trainingIds are provided
    enabled: params.trainingIds && params.trainingIds.length > 0, 
    retry: 1,
    staleTime: 1000 * 60 * 2, // Cache sessions for 2 minutes
    refetchOnWindowFocus: false,
  })
}

export function useAddSession() {
  // Get query client instance
  const queryClient = useQueryClient()

  // Mutation for adding a session to a training
  const addSessionMutation = useMutation({
    mutationFn: async ({ 
      trainingId, 
      sessionData 
    }: { 
      trainingId: string, 
      sessionData: CreateSessionData 
    }) => {
      const token = getCookie('token')
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/session`,
        sessionData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return { responseData: response.data, trainingId }
    },
    onSuccess: ({ trainingId }) => {
      toast.success('Session added successfully')
      queryClient.invalidateQueries({ queryKey: ['sessions', { trainingIds: [trainingId] }] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add session')
    }
  })

  return {
    addSession: addSessionMutation.mutate,
    isLoading: addSessionMutation.isPending
  }
}

// Add trainees to a session
export function useAddTraineesToSession() {
  const queryClient = useQueryClient()
  
  const addTraineeseMutation = useMutation({
    mutationFn: async ({ 
      sessionId, 
      traineeIds,
      trainingId 
    }: { 
      sessionId: string, 
      traineeIds: string[],
      trainingId?: string 
    }) => {
      const token = getCookie('token')
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API}/session/${sessionId}/add-trainees`,
        { traineeIds },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return { responseData: response.data, sessionId, trainingId }
    },
    onSuccess: ({ sessionId, trainingId }) => {
      toast.success('Students added to session successfully')
      
      // Invalidate session-specific student queries
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const queryKey = query.queryKey;
          return (
            // Match any query key that contains the sessionId
            Array.isArray(queryKey) && 
            queryKey.includes(sessionId)
          );
        }
      });
      
      // Also invalidate training-level student queries if trainingId is provided
      if (trainingId) {
        queryClient.invalidateQueries({
          queryKey: ['students', trainingId]
        });
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add students to session')
    }
  })

  return {
    addTrainees: addTraineeseMutation.mutate,
    isLoading: addTraineeseMutation.isPending
  }
}


// fetch students for session 
export function useAssignedStudentsForSession(
  sessionId: string, 
  page?: number, 
  pageSize?: number,
) {
  return useQuery({
    queryKey: ['students', page, pageSize, sessionId],
    queryFn: async () => {
      try {
        const token = getCookie('token')
        
        // Build URL with query parameters
        let url = `${process.env.NEXT_PUBLIC_API}/session/${sessionId}/trainees`
        
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
    enabled: !!sessionId
  })
}

