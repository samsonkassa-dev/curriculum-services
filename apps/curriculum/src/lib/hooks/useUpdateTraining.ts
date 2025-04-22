"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Training } from "@/types/training"
import axios from "axios"
import { toast } from "sonner"
import { getCookie } from "@curriculum-services/auth"

interface UpdateTrainingResponse {
  code: string
  training: Training
  message: string
}

interface UpdateTrainingData {
  id: string
  data: Partial<Training>
}

export function useUpdateTraining() {
  const queryClient = useQueryClient()

  return useMutation<UpdateTrainingResponse, Error, UpdateTrainingData>({
    mutationFn: async ({ id, data }) => {
      try {
        const token = getCookie('token');
        if (!token) {
          throw new Error('No authentication token found');
        }
        
        const baseUrl = process.env.NEXT_PUBLIC_API

        const response = await axios.patch<UpdateTrainingResponse>(
          `${baseUrl}/training/${id}`,
          data,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        )

        return response.data
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const message = error.response?.data?.message || "Failed to update training"
          toast.error("Error", { description: message })
        }
        throw error
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ["trainings"] })
      queryClient.invalidateQueries({ queryKey: ["training", variables.id] })
      toast.success("Training updated successfully")
    },
    onError: (error) => {
      toast.error("Failed to update training", {
        description: error.message || "Please try again"
      })
    }
  })
} 