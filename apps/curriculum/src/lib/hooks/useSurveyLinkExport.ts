"use client"

import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { getCookie } from "@curriculum-services/auth"

export interface SurveyLink {
  traineePhoneNumber: string
  expiryDate: string
  survey: string
  cohort: string
  traineeFullName: string
  link: string
  isValid: boolean
}

export interface SurveyLinkExportResponse {
  cohortId: string
  surveyId: string
  code: string
  count: number
  message: string
  surveyLinks: SurveyLink[]
}

export function useSurveyLinkExport(surveyId: string, cohortId: string, enabled: boolean = false) {
  return useQuery<SurveyLinkExportResponse>({
    queryKey: ['survey-link-export', surveyId, cohortId],
    queryFn: async () => {
      const token = getCookie('token')
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/survey/${surveyId}/export-links`,
        {
          params: { cohortId },
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return response.data
    },
    enabled: enabled && !!surveyId && !!cohortId,
  })
}

