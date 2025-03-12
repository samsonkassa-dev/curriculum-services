import axios, { AxiosError } from "axios"
import { toast } from "sonner"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export interface InstructionalMethod {
  id: string
  name: string
  description: string
}

export interface TechnologyIntegration {
  id: string
  name: string
  description: string
}

export interface Lesson {
  id: string
  name: string
  description: string
  objective: string
  duration: number
  durationType: "HOURS" | "DAYS" | "WEEKS" | "MONTHS"
  moduleId: string
  instructionalMethods: InstructionalMethod[]
  technologyIntegrations: TechnologyIntegration[]
}

export interface LessonPayload {
  name: string
  description: string
  objective: string
  duration: number
  durationType: "HOURS" | "DAYS" | "WEEKS" | "MONTHS"
  moduleId: string
  instructionalMethodIds: string[]
  technologyIntegrationIds: string[]
}

interface ErrorResponse {
  message: string;
  code: string;
}

interface LessonResponse {
  code: string;
  message: string;
  lessons: Lesson[];
}

export function useCreateLesson() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: LessonPayload) => {
      const token = localStorage.getItem('auth_token')
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/lesson`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return response.data
    },
    onSuccess: (_, variables) => {
      // Invalidate lessons for the module
      queryClient.invalidateQueries({ 
        queryKey: ['lessons', variables.moduleId] 
      })
      toast.success('Lesson created successfully')
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error("Error", { 
        description: error.response?.data?.message || "Failed to create lesson" 
      })
    }
  })
}

export function useGetLessons(moduleId: string) {
  return useQuery({
    queryKey: ['lessons', moduleId],
    queryFn: async () => {
      if (!moduleId) {
        return { lessons: [] }
      }

      const token = localStorage.getItem('auth_token')
      const response = await axios.get<LessonResponse>(
        `${process.env.NEXT_PUBLIC_API}/lesson/module/${moduleId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return response.data
    },
    select: (data) => data.lessons,
    enabled: !!moduleId // Only run the query if moduleId exists
  })
}

export function useUpdateLesson() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ lessonId, data }: { lessonId: string; data: LessonPayload }) => {
      const token = localStorage.getItem('auth_token')
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API}/lesson/${lessonId}`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return response.data
    },
    onSuccess: (_, variables) => {
      // Invalidate lessons for the module
      queryClient.invalidateQueries({ 
        queryKey: ['lessons', variables.data.moduleId] 
      })
      toast.success('Lesson updated successfully')
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      toast.error("Error", { 
        description: error.response?.data?.message || "Failed to update lesson" 
      })
    }
  })
} 