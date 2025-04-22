/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"
import { getCookie } from "@curriculum-services/auth"
interface Section {
  id: string
  name: string
  topic: string
  creditHour: number
  description: string
  lessons: any[] 
}

interface SectionsResponse {
  code: string
  message: string
  sections: Section[]
}

interface SectionResponse {
  code: string
  message: string
  section: Section
}

interface CreateSectionData {
  name: string
  topic: string
  creditHour: number
  description: string
  moduleId: string
}

export function useCreateSection() {
  const queryClient = useQueryClient()

  return useMutation<SectionResponse, Error, CreateSectionData>({
    mutationFn: async (data: CreateSectionData) => {
      const token = getCookie('token')
      const response = await axios.post<SectionResponse>(
        `${process.env.NEXT_PUBLIC_API}/section`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["sections", variables.moduleId]
      })
      toast.success("Section created successfully")
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to create section")
      }
    }
  })
}

export function useSectionsByModuleId(moduleId: string) {
  return useQuery<SectionsResponse>({
    queryKey: ["sections", moduleId],
    queryFn: async () => {
      const token = getCookie('token')
      const response = await axios.get<SectionsResponse>(
        `${process.env.NEXT_PUBLIC_API}/section/module/${moduleId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return response.data
    }
  })
} 