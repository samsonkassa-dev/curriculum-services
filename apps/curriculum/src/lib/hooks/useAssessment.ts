import axios from "axios"
import { toast } from "sonner"
import { useMutation, useQuery, UseQueryOptions } from "@tanstack/react-query"
import { getCookie } from "@curriculum-services/auth"
interface AssessmentMethod {
  id: string
  name: string
  description: string
  assessmentSubType: 'FORMATIVE' | 'SUMMATIVE' | 'OTHER'
}

// Common structure for assessment data
interface AssessmentData {
  assessmentMethods: AssessmentMethod[]
  subjectSpecificAssessmentMethod: string
}

interface AssessmentResponse {
  code: string
  message: string
  moduleAssessmentMethods?: AssessmentData & { moduleId: string }
  sectionAssessmentMethods?: AssessmentData & { sectionId: string }
}

interface AssessmentPayload {
  assessmentIds: string[]
  subjectSpecificAssessmentMethod?: string
}

export function useSubmitAssessment(moduleId: string) {
  return useMutation({
    mutationFn: async (data: AssessmentPayload) => {
      const token = getCookie('token')
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/module/add-assessment-methods/${moduleId}`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return response.data
    },
    onSuccess: () => {
      toast.success('Assessment methods saved successfully')
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Failed to save assessment methods')
      }
    }
  })
}

export function useGetAssessment(
  moduleId: string,
  options?: Omit<UseQueryOptions<AssessmentResponse, Error, AssessmentResponse, string[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['assessment', moduleId],
    queryFn: async () => {
      try {
        const token = getCookie('token')
        if (!token) {
          console.log("No auth token found for assessment methods fetch");
          throw new Error("Authentication required");
        }

        console.log(`Fetching assessment methods for module: ${moduleId}`);
        const response = await axios.get<AssessmentResponse>(
          `${process.env.NEXT_PUBLIC_API}/module/assessment-method/${moduleId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )

        console.log("Assessment API Response:", response.data);

        // Add some validation to ensure expected data structure
        if (response.data.code !== "OK") {
          console.warn("Assessment API returned non-OK status:", response.data);
        }

        return response.data;
      } catch (error) {
        console.log("Error fetching assessment methods:", error);
        // Still throw the error so React Query can handle it
        throw error;
      }
    },
    ...options,
    // Improve retry behavior
    retry: (failureCount, error) => {
      console.log(`Retry attempt ${failureCount} for assessment methods`);
      // Only retry network errors, not 404s or other API errors
      if (axios.isAxiosError(error) && !error.response) {
        return failureCount < 3;
      }
      return false;
    }
  })
}
