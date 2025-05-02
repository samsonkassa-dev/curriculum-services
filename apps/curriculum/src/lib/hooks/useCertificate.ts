/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios"
import { toast } from "sonner"
import { useMutation, useQuery, UseQueryOptions, useQueryClient } from "@tanstack/react-query"
import { getCookie } from "@curriculum-services/auth"

// Update interface for creating a certificate
interface CertificateInput {
  issuingOrganization: string
  issueDate: string
  completionDate: string
  description: string
  creditHours: number
  grade: number
  trainingId: string
  traineeId: string
}

// Full certificate interface including received data
export interface Certificate {
  id: string
  issuingOrganization: string
  issueDate: string
  completionDate: string
  description: string
  creditHours: number
  grade: number
  fileUrl?: string
  trainee?: {
    id: string
    firstName: string
    lastName: string
    email: string
    contactPhone?: string
  }
}

interface CertificateResponse {
  code: string
  certificates: Certificate[]
  message: string
  totalElements?: number
  totalPages?: number
  currentPage?: number
}

interface CertificateQueryParams {
  page?: number
  pageSize?: number
}

export function useSubmitCertificate() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CertificateInput) => {
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
    onSuccess: (_, variables) => {
      toast.success('Certificate saved successfully')
      // Invalidate certificates query to trigger refetch
      queryClient.invalidateQueries({
        queryKey: ['certificates', variables.trainingId]
      })
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
  params?: CertificateQueryParams,
  options?: UseQueryOptions<CertificateResponse, Error>
) {
  return useQuery<CertificateResponse, Error>({
    queryKey: ['certificates', trainingId, params],
    queryFn: async () => {
      try {
        const token = getCookie('token')
        if (!token) {
          console.log("No auth token found for certificates fetch");
          throw new Error("Authentication required");
        }
        
        // Build query parameters for pagination
        const queryParams = new URLSearchParams();
        if (params?.page !== undefined) {
          queryParams.append('page', params.page.toString());
        }
        if (params?.pageSize !== undefined) {
          queryParams.append('page-size', params.pageSize.toString());
        }
        
        const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
        
        console.log(`Fetching certificates for training: ${trainingId} with params: ${queryString}`);
        const response = await axios.get<CertificateResponse>(
          `${process.env.NEXT_PUBLIC_API}/certificate/training/${trainingId}${queryString}`,
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