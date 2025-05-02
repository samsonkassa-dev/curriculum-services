import axios from "axios"
import { toast } from "sonner"
import { useMutation, useQuery, UseQueryOptions } from "@tanstack/react-query"
import { getCookie } from "@curriculum-services/auth"

interface Certificate {
  issuingOrganization: string
  issueDate: string
  completionDate: string
  description: string
  creditHours: number
  grade: number
  trainingId: string
  traineeId: string
}

interface CertificateResponse {
  code: string
  certificates: Certificate[]
  message: string
}

export function useSubmitCertificate() {
  return useMutation({
    mutationFn: async (data: Certificate) => {
      const token = getCookie('token')
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/certificate`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return response.data
    },
    onSuccess: () => {
      toast.success('Certificate saved successfully')
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Failed to save certificate')
      }
    }
  })
}

export function useGetCertificates(
  trainingId: string,
  options?: Omit<UseQueryOptions<CertificateResponse, Error, CertificateResponse, string[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['certificates', trainingId],
    queryFn: async () => {
      try {
        const token = getCookie('token')
        if (!token) {
          console.log("No auth token found for certificates fetch");
          throw new Error("Authentication required");
        }
        
        console.log(`Fetching certificates for training: ${trainingId}`);
        const response = await axios.get<CertificateResponse>(
          `${process.env.NEXT_PUBLIC_API}/certificate/training/${trainingId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )
        
        console.log("Certificate API Response:", response.data);
        
        // Add validation to ensure expected data structure
        if (response.data.code !== "OK") {
          console.warn("Certificate API returned non-OK status:", response.data);
        }
        
        return response.data;
      } catch (error) {
        console.log("Error fetching certificates:", error);
        // Still throw the error so React Query can handle it
        throw error;
      }
    },
    ...options,
    // Improve retry behavior
    retry: (failureCount, error) => {
      console.log(`Retry attempt ${failureCount} for certificates`);
      // Only retry network errors, not 404s or other API errors
      if (axios.isAxiosError(error) && !error.response) {
        return failureCount < 3;
      }
      return false;
    }
  })
}
