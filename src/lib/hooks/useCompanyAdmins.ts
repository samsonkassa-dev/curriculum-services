"use client"

import { useQuery } from "@tanstack/react-query"
import axios from "axios"

interface Role {
  createdAt: string
  updatedAt: string
  id: string
  name: string
  colorCode: string
}

export interface CompanyAdmin {
  id: string
  firstName: string
  lastName: string
  phoneNumber: string | null
  email: string
  role: Role
  profilePictureUrl: string | null
  emailVerified: boolean
  phoneVerified: boolean
  deactivated: boolean
}

interface CompanyAdminsResponse {
  code: string
  companyAdmins: CompanyAdmin[]
  message: string
}

export function useCompanyAdmins() {
  return useQuery({
    queryKey: ['company-admins'],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token')
      const response = await axios.get<CompanyAdminsResponse>(
        `${process.env.NEXT_PUBLIC_API || 'http://164.90.209.220:8081/api'}/company-admin`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return response.data
    },
    retry: 2
  })
} 