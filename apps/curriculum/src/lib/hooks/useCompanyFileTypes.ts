import { CompanyFileTypesResponse } from "@/types/company"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { getCookie } from "@curriculum-services/auth"
const API_URL = process.env.NEXT_PUBLIC_API

export const useCompanyFileTypes = () => {
  const { data: fileTypes, isLoading } = useQuery<CompanyFileTypesResponse>({
    queryKey: ['companyFileTypes'],
    queryFn: async () => {
      const token = getCookie('token')
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