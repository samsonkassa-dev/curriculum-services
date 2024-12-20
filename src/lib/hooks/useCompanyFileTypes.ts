import { CompanyFileTypesResponse } from "@/types/company"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"

const API_URL = "http://143.198.54.56:8081/api"

export const useCompanyFileTypes = () => {
  const { data: fileTypes, isLoading } = useQuery<CompanyFileTypesResponse>({
    queryKey: ['companyFileTypes'],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token')
      const response = await axios.get(`${API_URL}/company-file-type`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      return response.data
    }
  })

  return {
    fileTypes: fileTypes?.companyFileTypes || [],
    isLoading
  }
} 