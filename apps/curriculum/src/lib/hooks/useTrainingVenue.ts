/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { getCookie } from "@curriculum-services/auth"
import { City } from "./useStudents" // Reuse City type

export interface TrainingVenue {
  id: string
  name: string
  location: string
  city: City
  zone: string
  woreda: string
  latitude: number
  longitude: number
}

interface TrainingVenueResponse {
  code: string
  message: string
  venues: TrainingVenue[]
  totalPages: number
  pageSize: number
  currentPage: number
  totalElements: number
}

export function useTrainingVenues(page = 1, pageSize = 50) {
  return useQuery({
    queryKey: ['training-venues', page, pageSize],
    queryFn: async () => {
      try {
        const token = getCookie('token')
        const response = await axios.get<TrainingVenueResponse>(
          `${process.env.NEXT_PUBLIC_API}/venue?page=${page}&page-size=${pageSize}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )
        return response.data
      } catch (error: any) {
        throw new Error(error?.response?.data?.message || 'Failed to load training venues')
      }
    }
  })
} 