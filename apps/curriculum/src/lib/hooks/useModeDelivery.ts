import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { getCookie } from "@curriculum-services/auth"

interface ModeDeliveryData {
  trainingId: string
  deliveryToolIds: string[]
}

interface ModeDeliveryResponse {
  deliveryTools: {
    id: string
    trainingId: string
    deliveryTools: Array<{
      id: string
      name: string
      description: string
    }>
  }
  code: string
  message: string
}


// Fetch mode of delivery data
export const useModeDelivery = (trainingId: string) => {
  return useQuery<ModeDeliveryResponse>({
    queryKey: ['mode-delivery', trainingId],
    queryFn: async () => {
      const token = getCookie('token')
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/training/delivery-tool/${trainingId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return data
    },
    enabled: !!trainingId
  })
}

// Create mode of delivery
export const useAddDeliveryTools = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ModeDeliveryData) => {
      const token = getCookie('token')
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/training/add-delivery-tools`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['mode-delivery', variables.trainingId]
      })
    }
  })
}

// Update mode of delivery YET TO BE IMPLEMENTED
export const useUpdateModeDelivery = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ModeDeliveryData) => {
      const token = getCookie('token')
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API}/training/delivery-tool/${data.trainingId}`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['mode-delivery', variables.trainingId]
      })
    }
  })
} 