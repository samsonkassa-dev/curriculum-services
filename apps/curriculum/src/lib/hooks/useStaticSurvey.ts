"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import axios, { AxiosError } from "axios"
import { getCookie } from "@curriculum-services/auth"
import { toast } from "sonner"

export type FutureEndeavorImpact = "STRONGLY_DISAGREE" | "DISAGREE" | "NEUTRAL" | "AGREE" | "STRONGLY_AGREE"
export type PerspectiveInfluence = "INCREASED_INTEREST_IN_EDUCATION" | "CONSIDERING_NEW_CAREER_PATHS" | "STRENGTHENED_CURRENT_PATH_CONFIDENCE" | "RECOGNIZED_CONTINUOUS_LEARNING_VALUE" | "NO_SIGNIFICANT_INFLUENCE"
export type SatisfactionLevel = "VERY_DISSATISFIED" | "DISSATISFIED" | "NEUTRAL" | "SATISFIED" | "VERY_SATISFIED"
export type TrainingClarity = "NOT_AT_ALL_CLEAR" | "SLIGHTLY_CLEAR" | "MODERATELY_CLEAR" | "CLEAR" | "VERY_CLEAR"
export type TrainingDuration = "TOO_SHORT" | "JUST_RIGHT" | "TOO_LONG"

export interface TrainingSurvey {
  id: string
  trainingId: string
  trainingName: string
  traineeId: string
  traineeFullName: string
  futureEndeavorImpact: FutureEndeavorImpact
  perspectiveInfluences: PerspectiveInfluence[]
  overallSatisfaction: SatisfactionLevel
  confidenceLevel: string | null
  recommendationRating: number
  trainerDeliverySatisfaction: SatisfactionLevel
  overallQualitySatisfaction: SatisfactionLevel
  trainingClarity: TrainingClarity
  trainingDurationFeedback: TrainingDuration
  createdAt?: string
  updatedAt?: string
}

export interface CreateTrainingSurveyDTO {
  futureEndeavorImpact: FutureEndeavorImpact
  perspectiveInfluences: PerspectiveInfluence[]
  overallSatisfaction: SatisfactionLevel
  confidenceLevel: string
  recommendationRating: number
  trainerDeliverySatisfaction: SatisfactionLevel
  overallQualitySatisfaction: SatisfactionLevel
  trainingClarity: TrainingClarity
  trainingDurationFeedback: TrainingDuration
}

interface TrainingSurveyResponse {
  code: string
  trainingSurvey: TrainingSurvey
  message: string
}

interface TrainingSurveysResponse {
  code: string
  trainingSurveys: TrainingSurvey[]
  totalPages?: number
  pageSize?: number
  message: string
  currentPage?: number
  totalElements?: number
}

interface ApiErrorResponse {
  message: string
}

// Get a specific survey by ID
export function useTrainingSurvey(surveyId: string) {
  return useQuery({
    queryKey: ['trainingSurvey', surveyId],
    queryFn: async () => {
      try {
        const token = getCookie('token')
        const response = await axios.get<TrainingSurveyResponse>(
          `${process.env.NEXT_PUBLIC_API}/training-survey/${surveyId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )
        return response.data.trainingSurvey
      } catch (error: unknown) {
        const axiosError = error as AxiosError<ApiErrorResponse>
        throw new Error(axiosError.response?.data?.message || 'Failed to load survey details')
      }
    },
    enabled: !!surveyId
  })
}

// Get all surveys for a specific training
export function useTrainingSurveys(trainingId: string, traineeId?: string, page = 1, pageSize = 10) {
  return useQuery<TrainingSurveysResponse['trainingSurveys'], Error>({
    queryKey: ['trainingSurveys', trainingId, traineeId, page, pageSize],
    queryFn: async () => {
      try {
        const token = getCookie('token')
        
        // Build URL with query parameters
        const url = `${process.env.NEXT_PUBLIC_API}/training-survey/training/${trainingId}`
        
        // Add pagination and optional trainee parameters
        const queryParams = new URLSearchParams()
        queryParams.append('page', page.toString())
        queryParams.append('pageSize', pageSize.toString())
        
        if (traineeId) {
          queryParams.append('traineeId', traineeId)
        }
        
        const response = await axios.get<TrainingSurveysResponse>(
          `${url}?${queryParams.toString()}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )
        
        return response.data.trainingSurveys
      } catch (error: unknown) {
        const axiosError = error as AxiosError<ApiErrorResponse>
        const errorMessage = axiosError.response?.data?.message || axiosError.message || 'Failed to load training surveys'
        console.log("Error fetching training surveys:", error)
        throw new Error(errorMessage)
      }
    },
    enabled: !!trainingId,
    retry: 1,
    staleTime: 1000 * 60 * 2, // Cache surveys for 2 minutes
    refetchOnWindowFocus: false,
  })
}

// Create a new training survey
export function useCreateTrainingSurvey() {
  const queryClient = useQueryClient()

  const createSurveyMutation = useMutation({
    mutationFn: async ({ 
      trainingId, 
      traineeId, 
      surveyData 
    }: { 
      trainingId: string, 
      traineeId: string, 
      surveyData: CreateTrainingSurveyDTO 
    }) => {
      const token = getCookie('token')
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/training-survey/training/${trainingId}/trainee/${traineeId}`,
        surveyData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return { responseData: response.data, trainingId, traineeId }
    },
    onSuccess: ({ trainingId, traineeId }) => {
      queryClient.invalidateQueries({ queryKey: ['trainingSurveys', trainingId] })
      queryClient.invalidateQueries({ queryKey: ['trainingSurveys', trainingId, traineeId] })
      toast.success('Survey submitted successfully')
    },
    onError: (error: unknown) => {
      const axiosError = error as AxiosError<ApiErrorResponse>
      toast.error(axiosError.response?.data?.message || 'Failed to submit survey')
    }
  })

  return {
    createTrainingSurvey: createSurveyMutation.mutate,
    isSubmitting: createSurveyMutation.isPending
  }
}

// Update an existing survey
export function useUpdateTrainingSurvey() {
  const queryClient = useQueryClient()

  const updateSurveyMutation = useMutation({
    mutationFn: async ({ 
      surveyId, 
      surveyData 
    }: { 
      surveyId: string, 
      surveyData: Partial<CreateTrainingSurveyDTO>
    }) => {
      const token = getCookie('token')
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API}/training-survey/${surveyId}`,
        surveyData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return { responseData: response.data, surveyId }
    },
    onSuccess: ({ surveyId, responseData }) => {
      // Extract trainingId and traineeId from the response if available
      const trainingId = responseData?.trainingSurvey?.trainingId
      const traineeId = responseData?.trainingSurvey?.traineeId
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['trainingSurvey', surveyId] })
      
      if (trainingId) {
        queryClient.invalidateQueries({ queryKey: ['trainingSurveys', trainingId] })
        
        if (traineeId) {
          queryClient.invalidateQueries({ queryKey: ['trainingSurveys', trainingId, traineeId] })
        }
      }
      
      toast.success('Survey updated successfully')
    },
    onError: (error: unknown) => {
      const axiosError = error as AxiosError<ApiErrorResponse>
      toast.error(axiosError.response?.data?.message || 'Failed to update survey')
    }
  })

  return {
    updateTrainingSurvey: updateSurveyMutation.mutate,
    isUpdating: updateSurveyMutation.isPending
  }
}

// Delete a survey
export function useDeleteTrainingSurvey() {
  const queryClient = useQueryClient()

  const deleteSurveyMutation = useMutation({
    mutationFn: async ({ surveyId, trainingId, traineeId }: { 
      surveyId: string, 
      trainingId?: string, 
      traineeId?: string 
    }) => {
      const token = getCookie('token')
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API}/training-survey/${surveyId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return { responseData: response.data, surveyId, trainingId, traineeId }
    },
    onSuccess: ({ surveyId, trainingId, traineeId }) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['trainingSurvey', surveyId] })
      
      if (trainingId) {
        queryClient.invalidateQueries({ queryKey: ['trainingSurveys', trainingId] })
        
        if (traineeId) {
          queryClient.invalidateQueries({ queryKey: ['trainingSurveys', trainingId, traineeId] })
        }
      }
      
      toast.success('Survey deleted successfully')
    },
    onError: (error: unknown) => {
      const axiosError = error as AxiosError<ApiErrorResponse>
      toast.error(axiosError.response?.data?.message || 'Failed to delete survey')
    }
  })

  return {
    deleteTrainingSurvey: deleteSurveyMutation.mutate,
    isDeleting: deleteSurveyMutation.isPending
  }
}
