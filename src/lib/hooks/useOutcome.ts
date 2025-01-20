import { useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"

interface OutcomeData {
  definition: string
  trainingId: string
  objectiveId: string
}

export function useCreateOutcome() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: OutcomeData) => {
      const token = localStorage.getItem('auth_token')
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/training/add-outcome`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return response.data
    }
  })
} 