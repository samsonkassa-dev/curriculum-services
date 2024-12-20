import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"

interface UserRole {
  name: string;
}

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
}

interface ApiResponse {
  code: string;
  message: string;
  companyAdmin: UserProfile;
}

export function useUserProfile({ enabled = false }) {
  return useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      try {
        const token = localStorage.getItem('auth_token')
        const response = await axios.get<ApiResponse>(
          `${process.env.NEXT_PUBLIC_API}/company-admin/me`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )
        return response.data.companyAdmin
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const message = error.response?.data?.message || 'Failed to fetch user profile'
          toast.error("Error", { description: message })
        }
        throw error
      }
    },
    enabled
  })
} 