import { BusinessTypesResponse, IndustryTypesResponse } from "@/types/company"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { getCookie } from "@curriculum-services/auth"
const API_URL = process.env.NEXT_PUBLIC_API 

export const useBusinessTypes = () => {
  const { data: businessTypes, isLoading: isLoadingBusinessTypes } = useQuery<BusinessTypesResponse>({
    queryKey: ['businessTypes'],
    queryFn: async () => {
      const token = getCookie('token')
      const response = await axios.get(`${API_URL}/business-type`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      return response.data
    }
  })

  const { data: industryTypes, isLoading: isLoadingIndustryTypes } = useQuery<IndustryTypesResponse>({
    queryKey: ['industryTypes'],
    queryFn: async () => {
      const token = getCookie('token')
      const response = await axios.get(`${API_URL}/industry-type`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      return response.data
    }
  })

  return {
    businessTypes: businessTypes?.businessTypes || [],
    industryTypes: industryTypes?.industryTypes || [],
    isLoading: isLoadingBusinessTypes || isLoadingIndustryTypes
  }
} 