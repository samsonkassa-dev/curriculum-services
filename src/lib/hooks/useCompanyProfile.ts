/* eslint-disable @typescript-eslint/no-explicit-any */
import { CompanyProfileFormData, transformToApiFormat } from "@/types/company"
import { useMutation} from "@tanstack/react-query"
import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API || 'http://164.90.209.220:8081/api'

interface ApiResponse {
  code: string;
  message: string;
  companyProfile: {
    id: string;
    verificationStatus: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  };
}

export const useCompanyProfile = () => {
  
  const { mutate: createCompanyProfile, isPending: isCreating } = useMutation({
    mutationFn: async (data: CompanyProfileFormData) => {
      const token = localStorage.getItem('auth_token')
      const formData = new FormData()
      
      // Transform data to API format and append each field directly to formData
      const apiData = transformToApiFormat(data)
      Object.entries(apiData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString())
        }
      })

      // Add files if present - now using file ID as the key directly
      data.companyFiles?.forEach((fileData) => {
        formData.append(fileData.fileTypeId, fileData.file)
      })

      return axios.post<ApiResponse>(`${API_URL}/company-profile`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        },
      })
    }
  })

  const { mutate: updateCompanyProfile, isPending: isUpdating } = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CompanyProfileFormData> }) => {
      const token = localStorage.getItem('auth_token')
      const formData = new FormData()
      
      // Append each field directly to formData
      if (data.name) formData.append('name', data.name)
      if (data.taxIdentificationNumber) formData.append('taxIdentificationNumber', data.taxIdentificationNumber)
      if (data.businessType?.id) formData.append('businessTypeId', data.businessType.id)
      if (data.industryType?.id) formData.append('industryTypeId', data.industryType.id)
      if (data.countryOfIncorporation) formData.append('countryOfIncorporation', data.countryOfIncorporation)
      if (data.address) formData.append('address', data.address)
      if (data.phone) formData.append('phone', data.phone)
      if (data.websiteUrl) formData.append('websiteUrl', data.websiteUrl)
      if (data.numberOfEmployees) formData.append('numberOfEmployees', data.numberOfEmployees.toString())
      if (data.otherDescription) formData.append('otherDescription', data.otherDescription)

      // Add files if present - using file ID as the key directly
      data.companyFiles?.forEach((fileData) => {
        formData.append(fileData.fileTypeId, fileData.file)
      })

      const response = await axios.patch(`${API_URL}/company-profile/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        },
      })
      return response.data
    }
  })

  const { mutate: deleteCompanyProfile, isPending: isDeleting } = useMutation({
    mutationFn: async (id: string) => {
      const token = localStorage.getItem('auth_token')
      const response = await axios.delete(`${API_URL}/company-profile/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      return response.data
    }
  })

  return {
    createCompanyProfile,
    updateCompanyProfile,
    deleteCompanyProfile,
    isLoading: isCreating || isUpdating || isDeleting
  }
} 