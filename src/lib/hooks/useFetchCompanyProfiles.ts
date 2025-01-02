import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"
import { CompanyUser } from "@/types/users"

interface CompanyProfilesResponse {
  code: string
  companyProfiles: CompanyUser[]
  totalPages: number
  message: string
  totalElements: number
}

interface SingleCompanyResponse {
  code: string
  companyProfile: CompanyUser
  message: string
}

interface UseCompanyProfilesProps {
  page: number
  pageSize: number
  searchQuery?: string
}

export function useCompanyProfiles({ page, pageSize, searchQuery }: UseCompanyProfilesProps) {
  return useQuery<CompanyProfilesResponse>({
    queryKey: ['company-profiles', page, pageSize, searchQuery],
    queryFn: async () => {
      try {
        const token = localStorage.getItem('auth_token')
        const params = new URLSearchParams({
          page: String(Math.max(1, Math.max(1, page) - 1)),
          'page-size': String(pageSize),
          ...(searchQuery && { 'search-query': searchQuery })
        })

        const baseUrl = process.env.NEXT_PUBLIC_API || 'http://164.90.209.220:8081/api';
        
        const response = await axios.get<CompanyProfilesResponse>(
          `${baseUrl}/company-profile?${params.toString()}`,
          {
            headers: { 
              Authorization: `Bearer ${token}`
            }
          }
        )

        return response.data
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const message = error.response?.data?.message || 'Failed to fetch company profiles'
          toast.error("Error", { description: message })
        }
        throw error
      }
    }
  })
}

export function useSingleCompanyProfile(id: string) {
  return useQuery<SingleCompanyResponse>({
    queryKey: ['company-profile', id],
    queryFn: async () => {
      try {
        const token = localStorage.getItem('auth_token')
        const baseUrl = process.env.NEXT_PUBLIC_API || 'http://164.90.209.220:8081/api';
        const response = await axios.get<SingleCompanyResponse>(
          `${baseUrl}/company-profile/${id}`,
          {
            headers: { 
              Authorization: `Bearer ${token}`
            }
          }
        )
        return response.data
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const message = error.response?.data?.message || 'Failed to fetch company profile'
          toast.error("Error", { description: message })
        }
        throw error
      }
    },
    enabled: !!id
  })
} 