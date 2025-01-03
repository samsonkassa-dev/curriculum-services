"use client"

import { useQuery } from "@tanstack/react-query"
import axios from "axios"


interface Training {
  id: string
  title: string
  cities: {
    id: string
    name: string
    description: string
    country: {
      id: string
      name: string
      description: string
    }
  }[]
  duration: number
  durationType: "DAYS" | "WEEKS" | "MONTHS"
  ageGroups: {
    id: string
    name: string
    range: string
    description: string
  }[]
  targetAudienceGenders: ("MALE" | "FEMALE")[]
  economicBackgrounds: {
    id: string
    name: string
    description: string
  }[]
  academicQualifications: {
    id: string
    name: string
    description: string
  }[]
  trainingPurposes: {
    id: string
    name: string
    description: string
  }[]
  companyProfile: {
    id: string
    name: string
    taxIdentificationNumber: string
    businessType: {
      id: string
      name: string
      description: string
    }
    industryType: {
      id: string
      name: string
      description: string
    }
    countryOfIncorporation: string
    address: string
    phone: string
    websiteUrl: string
    numberOfEmployees: string
    otherDescription: string
    logoUrl: string | null
    verificationStatus: string
    createdAt: string
  }
}

interface TrainingsResponse {
  code: string
  trainings: Training[]
  message: string
}

export function useTrainings() {
  return useQuery({
    queryKey: ['trainings'],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get<TrainingsResponse>(
        `${process.env.NEXT_PUBLIC_API || 'http://164.90.209.220:8081/api'}/training`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return response.data
    }
  })
} 