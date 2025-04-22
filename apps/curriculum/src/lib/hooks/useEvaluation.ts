import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query"
import axios from "axios"
import { getCookie } from "@curriculum-services/auth"

interface EvaluationFormEntry {
  outlineGroup: string
  questions: string[]
}

interface EvaluationFormData {
  formType: "PRE" | "POST"
  monitoringFormEntries: EvaluationFormEntry[]
}

interface EvaluationResponse {
  code: string
  monitoringForm: Array<{
    id: string
    formType: "PRE" | "MID" | "POST"
    createdAt: string
    monitoringFormEntries: EvaluationFormEntry[]
  }>
  message: string
}

interface MonitoringFormEntry {
  id: string
  outlineGroup: string
  question: string
  answer: string | null
}

interface MonitoringFormDetail {
  id: string
  formType: "PRE" | "POST"
  monitoringFormEntries: MonitoringFormEntry[]
}

interface MonitoringFormResponse {
  code: string
  monitoringForm: MonitoringFormDetail
  message: string
}

export function useGetEvaluations(trainingId: string) {
  return useQuery({
    queryKey: ['evaluation', trainingId],
    queryFn: async () => {
      const token = getCookie('token')
      const response = await axios.get<EvaluationResponse>(
        `${process.env.NEXT_PUBLIC_API}/monitoring-form/training/${trainingId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return response.data
    }
  })
}

export function useCreateEvaluation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ data, trainingId }: { data: EvaluationFormData; trainingId: string }) => {
      const token = getCookie('token')
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/monitoring-form/training/${trainingId}`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return response.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['evaluation', variables.trainingId] 
      })
    }
  })
}

export function useGetEvaluationDetail(formId: string) {
  return useQuery({
    queryKey: ['evaluation-detail', formId],
    queryFn: async () => {
      const token = getCookie('token')
      const response = await axios.get<MonitoringFormResponse>(
        `${process.env.NEXT_PUBLIC_API}/monitoring-form/${formId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return response.data.monitoringForm
    }
  })
} 