import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"
import { TrainingUsersResponse } from "@/types/users"

// Hook to fetch training users by training ID
export function useTrainingUsersByTrainingId(trainingId: string) {
  return useQuery({
    queryKey: ['training-users', trainingId],
    queryFn: async () => {
      try {
        const token = localStorage.getItem('auth_token')
        const response = await axios.get<TrainingUsersResponse>(
          `${process.env.NEXT_PUBLIC_API}/training/users/${trainingId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )
        return response.data
      } catch (error) {
        
        if (axios.isAxiosError(error)) {
          toast.error(error.response?.data?.message || 'Failed to fetch training users')
        }
        throw error
      }
    }
  })
}

// We can keep the paginated version for other use cases
export function useTrainingUsers({ page, pageSize, searchQuery }: {
  page: number
  pageSize: number
  searchQuery?: string
}) {
  // ... implementation for the all users endpoint with server-side pagination
}
