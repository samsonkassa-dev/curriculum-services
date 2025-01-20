/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"

interface ObjectiveResponse {
  code: string
  message: string
  generalObjective: {
    id: string
    definition: string
    outcomes: null
  } | null
  specificObjectives: Array<{
    id: string
    definition: string
    outcomes: Array<{
      id: string
      definition: string
    }>
  }>
}

interface ObjectiveData {
  definition: string
  trainingId: string
}

// Hook to fetch objectives
export function useObjective(trainingId: string) {
  return useQuery({
    queryKey: ['objective', trainingId],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token')
      const response = await axios.get<ObjectiveResponse>(
        `${process.env.NEXT_PUBLIC_API}/training/objective/${trainingId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      
      return response.data ? {
        generalObjective: response.data.generalObjective ? {
          id: response.data.generalObjective.id,
          definition: response.data.generalObjective.definition
        } : undefined,
        specificObjectives: response.data.specificObjectives.map(obj => ({
          id: obj.id,
          definition: obj.definition,
          outcomes: obj.outcomes || []
        }))
      } : null
    }
  })
}

// Hook to create objective
export function useCreateObjective() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ data, isGeneral }: { data: ObjectiveData, isGeneral: boolean }) => {
      const token = localStorage.getItem('auth_token')
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/training/add-objective?is-objective-general=${isGeneral}`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['objective', variables.data.trainingId] 
      })
    }
  })
}

// Hook to update objective
export function useUpdateObjective() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      objectiveId, 
      data, 
      isGeneral 
    }: { 
      objectiveId: string
      data: ObjectiveData
      isGeneral: boolean 
    }) => {
      const token = localStorage.getItem('auth_token')
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API}/training/objective/${objectiveId}?is-objective-general=${isGeneral}`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['objective', variables.data.trainingId] 
      })
    }
  })
} 