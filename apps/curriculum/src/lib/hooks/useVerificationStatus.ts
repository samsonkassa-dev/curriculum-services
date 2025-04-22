import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"
import { getCookie } from "@curriculum-services/auth"


interface ApiResponse {
  code: string;
  message: string;
  companyProfile: {
    verificationStatus: 'PENDING' | 'ACCEPTED' | 'REJECTED';
    rejectionReason: string | null;
    name: string;
  };
}

interface VerificationData {
  verificationStatus: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  rejectionReason: string | null;
}

export function useVerificationStatus({ enabled = false } = {}) {
  return useQuery<VerificationData>({
    queryKey: ['verificationStatus'],
    queryFn: async () => {
      try {
        const token = getCookie('token');
        // console.log("token", token)
        if (!token) {
          throw new Error('No authentication token found');
        }
        
        const response = await axios.get<ApiResponse>(
          `${process.env.NEXT_PUBLIC_API}/company-profile/me`,
          {
            headers: { 
              Authorization: `Bearer ${token}`
            }
          }
        )
        
        const { verificationStatus, rejectionReason } = response.data.companyProfile;
        return { verificationStatus, rejectionReason };
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const message = error.response?.data?.message || 'Failed to fetch verification status';
          toast.error("Error", { description: message });
        }
        throw error;
      }
    },
    enabled,
    retry: 2,
    refetchInterval: (query) => 
      query.state.data?.verificationStatus === 'ACCEPTED' ? false : 300000000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: (query) => 
      query.state.data?.verificationStatus !== 'ACCEPTED'
  });
} 