import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"
import { TrainingUsersResponse, CompanyUsersResponse } from "@/types/users"
import { getCookie } from "@curriculum-services/auth"

// Hook to fetch training users by training ID
export function useTrainingUsersByTrainingId(trainingId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['training-users', trainingId],
    queryFn: async () => {
      try {
        const token = getCookie('token')
        const response = await axios.get<TrainingUsersResponse>(
          `${process.env.NEXT_PUBLIC_API}/training/users/${trainingId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )
        return response.data
      } catch (error) {
        
        if (axios.isAxiosError(error)) {
          toast.error(error.response?.data?.message || 'Failed to fetch training users')
        }
        throw error
      }
    },
    enabled: (options?.enabled ?? true) && !!trainingId,
  })
}

// Hook to fetch company users with server-side pagination
export function useCompanyUsers({ page, pageSize, searchQuery, companyId, role }: {
  page: number
  pageSize: number
  searchQuery?: string
  companyId: string
  role?: string
}) {
  return useQuery({
    queryKey: ['company-users', companyId, page, pageSize, searchQuery, role],
    queryFn: async () => {
      try {
        const token = getCookie('token')
        
        // Build the URL with query parameters
        let url = `${process.env.NEXT_PUBLIC_API}/company-profile/users?page=${page}&page-size=${pageSize}`
        
        // Add search query if provided
        if (searchQuery) {
          url += `&search-query=${encodeURIComponent(searchQuery)}`
        }

        if (role) {
          url += `&roles=${encodeURIComponent(role)}`
        }
        
        const response = await axios.get<CompanyUsersResponse>(url, {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        return response.data
      } catch (error) {
        if (axios.isAxiosError(error)) {
          toast.error(error.response?.data?.message || 'Failed to fetch company users')
        }
        throw error
      }
    },
    placeholderData: (previousData) => previousData // Use previous data as placeholder while loading
  })
}
