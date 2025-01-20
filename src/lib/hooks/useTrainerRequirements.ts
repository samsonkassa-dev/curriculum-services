import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axios from "axios"

interface TrainerRequirementsResponse {
  code: string
  message: string
  trainerRequirements: {
    id: string
    trainingId: string
    trainerRequirements: Array<{
      id: string
      name: string
      description: string
    }>
  }
}

interface TrainerRequirementsData {
  trainingId: string
  trainerRequirementIds: string[]
}

export const useTrainerRequirements = (trainingId: string) => {
  return useQuery<TrainerRequirementsResponse>({
    queryKey: ['trainer-requirements', trainingId],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token')
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/training/trainer-requirement/${trainingId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return data
    },
    enabled: !!trainingId
  })
}

export const useAddTrainerRequirements = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: TrainerRequirementsData) => {
      const token = localStorage.getItem('auth_token')
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/training/add-trainer-requirements`,
        {
          trainingId: data.trainingId,
          trainerRequirementIds: data.trainerRequirementIds
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['trainer-requirements', variables.trainingId]
      })
    }
  })
} 