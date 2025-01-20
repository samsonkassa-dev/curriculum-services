import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axios from "axios"

interface TechnologicalRequirement {
  id: string
  name: string
  description: string
  technologicalRequirementType: 'LEARNER' | 'INSTRUCTOR'
}

interface TechnologicalRequirementsResponse {
  code: string
  message: string
  technologicalRequirements: {
    id: string
    trainingId: string
    learnerTechnologicalRequirements: Array<{
      id: string
      name: string
      description: string
    }>
    instructorTechnologicalRequirements: Array<{
      id: string
      name: string
      description: string
    }>
  }
}

interface TechnologicalRequirementsData {
  trainingId: string
  learnerTechnologicalRequirementIds: string[]
  instructorTechnologicalRequirementIds: string[]
}

// Fetch technological requirements data
export const useTechnologicalRequirements = (trainingId: string) => {
  return useQuery<TechnologicalRequirementsResponse>({
    queryKey: ['technological-requirements', trainingId],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token')
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/training/technological-requirement/${trainingId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return data
    },
    enabled: !!trainingId
  })
}

// Add technological requirements
export const useAddTechnologicalRequirements = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: TechnologicalRequirementsData) => {
      const token = localStorage.getItem('auth_token')
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/training/add-technological-requirements`,
        {
          trainingId: data.trainingId,
          learnerTechnologicalRequirementIds: data.learnerTechnologicalRequirementIds,
          instructorTechnologicalRequirementIds: data.instructorTechnologicalRequirementIds
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['technological-requirements', variables.trainingId]
      })
    }
  })
} 