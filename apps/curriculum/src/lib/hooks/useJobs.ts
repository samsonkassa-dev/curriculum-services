/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { getCookie } from "@curriculum-services/auth"
import { toast } from "sonner"


export type JobStatus = "ACTIVE" | "INACTIVE" | "COMPLETED"

export type DeliveryMethod = "ONLINE" | "SELF_PACED"
export type SessionStatus = "SCHEDULED"
export type DurationType = "WEEKS" | "HOURS"
export type CompensationType = "PER_HOUR" | "PER_TRAINEES"

export interface Lesson {
  id: string
  name: string
  objective: string
  description: string
  duration: number
  durationType: DurationType
}

export interface Cohort {
  id: string
  name: string
  description: string
  tags: string[]
  trainingTitle: string
  parentCohortName: string | null
}

export interface Session {
  id: string
  name: string
  cohort?: Cohort // Optional for sessions in job detail response
  lessons: Lesson[]
  deliveryMethod: DeliveryMethod
  startDate: string
  endDate: string
  numberOfStudents: number
  trainingVenue: string | null
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
  trainingLink: string
  first?: boolean
  last?: boolean
}

export interface Job {
  id: string
  title: string
  description: string
  createdAt: string
  deadlineDate: string
  numberOfSessions: number
  applicantsRequired: number
  status: JobStatus
  sessions: Session[]
}

interface JobsResponse {
  jobs: Job[]
  code: string
  totalPages: number
  message: string
  totalElements: number
}


export interface CreateJobData {
  title: string
  description: string
  deadlineDate: string 
  sessionIds: string[]
}

interface JobResponse {
  code: string
  job: Job 
  message: string
}

interface JobQueryParams {
  status?: JobStatus
  page?: number 
  pageSize?: number
}

// Hook to fetch a list of jobs
export function useJobs(params: JobQueryParams) {
  return useQuery<JobsResponse, Error>({ 
    queryKey: ['jobs', params], 
        queryFn: async () => {
      try {
        const token = getCookie('token')
        const url = `${process.env.NEXT_PUBLIC_API}/job`
        
        const queryParams = new URLSearchParams()
        
       
        if (params.status) queryParams.append('status', params.status)

        if (params.page !== undefined) {
          const pageNumber = Math.max(1, params.page) 
          queryParams.append('page', pageNumber.toString())
        }
        if (params.pageSize !== undefined) queryParams.append('pageSize', params.pageSize.toString())
        
        const response = await axios.get<JobsResponse>(
          `${url}?${queryParams.toString()}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )
        
        // Add basic validation or transformation if needed
        if (!response.data || typeof response.data !== 'object') {
            throw new Error('Invalid API response format');
        }

        return response.data
      } catch (error: any) {
         // Improve error handling to return a proper Error object
         const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load jobs';
         console.log("Error fetching jobs:", error); // Log the actual error
         throw new Error(errorMessage);
      }
    },
    retry: 1, // Reduce retry attempts
    // Keep data fresh for a short period, refetch in background
    staleTime: 1000 * 60 * 1, // 1 minute
    refetchOnWindowFocus: false, // Disable refetch on focus for potentially less background noise
  })
}

// Hook to create a new job
export function useAddJob() {
  const queryClient = useQueryClient()

  const addJobMutation = useMutation({
    mutationFn: async (jobData: CreateJobData) => {
      const token = getCookie('token')
      const response = await axios.post<JobResponse>( 
        `${process.env.NEXT_PUBLIC_API}/job`,
        jobData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return response.data 
    },
    onSuccess: () => {
      toast.success('Job created successfully')
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create job')
    }
  })

  return {
    addJob: addJobMutation.mutate,
    isLoading: addJobMutation.isPending,
    isSuccess: addJobMutation.isSuccess,
    isError: addJobMutation.isError,
    error: addJobMutation.error,
  }
}

// Hook to fetch a single job (optional, if needed)
export function useJobDetail(jobId: string) {
  return useQuery({
    queryKey: ['job', jobId],
    queryFn: async () => {
      try {
        const token = getCookie('token')
        const response = await axios.get<{code: string, job: Job, message: string}>( // Assuming a single job endpoint exists
          `${process.env.NEXT_PUBLIC_API}/job/${jobId}`, 
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )
        return response.data.job
      } catch (error: any) {
        throw new Error(error?.response?.data?.message || 'Failed to load job details')
      }
    },
    enabled: !!jobId 
  })
}

// Hook to update a job
export function useUpdateJob() {
  const queryClient = useQueryClient()

  const updateJobMutation = useMutation({
    mutationFn: async ({ jobId, jobData }: { jobId: string; jobData: CreateJobData }) => {
      const token = getCookie('token')
      const response = await axios.put<JobResponse>(
        `${process.env.NEXT_PUBLIC_API}/job/${jobId}`,
        jobData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return response.data
    },
    onSuccess: () => {
      toast.success('Job updated successfully')
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      queryClient.invalidateQueries({ queryKey: ['job'] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update job')
    }
  })

  return {
    updateJob: updateJobMutation.mutate,
    isLoading: updateJobMutation.isPending,
    isSuccess: updateJobMutation.isSuccess,
    isError: updateJobMutation.isError,
    error: updateJobMutation.error,
  }
}

// Hook to delete a job
export function useDeleteJob() {
  const queryClient = useQueryClient()

  const deleteJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const token = getCookie('token')
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API}/job/${jobId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return response.data
    },
    onSuccess: () => {
      toast.success('Job deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete job')
    }
  })

  return {
    deleteJob: deleteJobMutation.mutate,
    isLoading: deleteJobMutation.isPending,
    isSuccess: deleteJobMutation.isSuccess,
    isError: deleteJobMutation.isError,
    error: deleteJobMutation.error,
  }
}

// Hook to apply for a job
export function useApplyForJob() {
  const queryClient = useQueryClient()

  const applyJobMutation = useMutation({
    mutationFn: async (applicationData: { reason: string; jobId: string; applicationType: "MAIN" | "ASSISTANT" }) => {
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
      queryClient.invalidateQueries({ queryKey: ['jobs'] })
      queryClient.invalidateQueries({ queryKey: ['applications'] })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to submit application')
    }
  })

  return {
    applyForJob: applyJobMutation.mutate,
    isLoading: applyJobMutation.isPending,
    isSuccess: applyJobMutation.isSuccess,
    isError: applyJobMutation.isError,
    error: applyJobMutation.error,
  }
}

export type Gender = "MALE" | "FEMALE"
export type ApplicationStatus = "PENDING" | "ACCEPTED" | "REJECTED"

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

export interface TrainingTag {
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
  gender: Gender
  dateOfBirth: string
  language: Language
  location: string
  academicLevel: AcademicLevel
  trainingTags: TrainingTag[]
  experienceYears: number
  coursesTaught: any[] // TODO: Type this properly if needed
  certifications: any[] // TODO: Type this properly if needed
}

export interface Application {
  id: string
  reason: string
  applicationType: "MAIN" | "ASSISTANT"
  job: Job
  trainer: Trainer
  status: ApplicationStatus
  createdAt: string
}

export interface ApplicationsResponse {
  code: string
  totalPages: number
  message: string
  applications: Application[]
  totalElements: number
}

// Hook to fetch user's applications
export function useMyApplications() {
  return useQuery<ApplicationsResponse, Error>({
    queryKey: ['applications'],
    queryFn: async () => {
      try {
        const token = getCookie('token')
        const response = await axios.get<ApplicationsResponse>(
          `${process.env.NEXT_PUBLIC_API}/application/me`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )

        if (!response.data || typeof response.data !== 'object') {
          throw new Error('Invalid API response format')
        }

        return response.data
      } catch (error: any) {
        const errorMessage = error?.response?.data?.message || error?.message || 'Failed to load applications'
        console.log("Error fetching applications:", error)
        throw new Error(errorMessage)
      }
    },
    staleTime: 1000 * 60 * 1, // 1 minute
    refetchOnWindowFocus: false
  })
}
