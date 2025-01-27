import axios from "axios"
import { toast } from "sonner"
import { useMutation, useQuery } from "@tanstack/react-query"

interface Lesson {
  id: string
  name: string
  description: string
  sectionId: string
}

interface LessonPayload {
  name: string
  description: string
  sectionId: string
}

export function useCreateLesson() {
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
    onSuccess: () => {
      toast.success('Lesson created successfully')
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Failed to create lesson')
      }
    }
  })
}

export function useGetLessons(sectionId: string) {
  return useQuery({
    queryKey: ['lessons', sectionId],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token')
      const response = await axios.get<{ lessons: Lesson[] }>(
        `${process.env.NEXT_PUBLIC_API}/section/${sectionId}/lessons`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return response.data
    }
  })
} 