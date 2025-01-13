import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"


interface ApiResponse {
  code: string;
  message: string;
  companyProfile: {
    verificationStatus: 'PENDING' | 'ACCEPTED' | 'REJECTED';
    rejectionReason: string | null;
    name: string;
  };
}

export function useVerificationStatus({ enabled = false } = {}) {
  return useQuery({
    queryKey: ['verificationStatus'],
    queryFn: async () => {
      try {
        const token = localStorage.getItem('auth_token')
        const response = await axios.get<ApiResponse>(
          `${process.env.NEXT_PUBLIC_API || 'http://164.90.209.220:8081/api'}/company-profile/me`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )
        
        const { verificationStatus, rejectionReason } = response.data.companyProfile
        return { verificationStatus, rejectionReason }
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const message = error.response?.data?.message || 'Failed to fetch verification status'
          toast.error("Error", { description: message })
        }
        throw error
      }
    },
    enabled,
    retry: 2
  })
} 