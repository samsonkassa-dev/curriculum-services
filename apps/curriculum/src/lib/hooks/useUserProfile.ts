import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"
import { getCookie } from "@curriculum-services/auth"





interface ApiResponse {
  code: string;
  message: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string | null;
    email: string;
    role: {
      name: string;
      colorCode: string;
    };
    profilePictureUrl: string | null;
    deactivated: boolean;
    phoneVerified: boolean;
    emailVerified: boolean;
  };
}

export function useUserProfile({ enabled = false }) {
  return useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      try {
        const token = getCookie('token')
        // console.log("token", token)
        const response = await axios.get<ApiResponse>(
          `${process.env.NEXT_PUBLIC_API}/user/me`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )
        return response.data.user
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