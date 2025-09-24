/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { getCookie } from "@curriculum-services/auth";

// TypeScript interfaces for module assessment methods
interface ModuleAssessmentMethod {
  id: string;
  name: string;
  description: string;
  assessmentSubType: "FORMATIVE" | "SUMMATIVE" | "OTHER";
}

interface ModuleAssessmentData {
  assessmentMethods: ModuleAssessmentMethod[];
  subjectSpecificAssessmentMethod?: any; // For backward compatibility
}

interface ModuleAssessmentResponse {
  moduleAssessmentMethods?: ModuleAssessmentData;
  sectionAssessmentMethods?: ModuleAssessmentData;
  code: string;
  message: string;
}

interface ApiErrorResponse {
  message: string;
  [key: string]: unknown;
}

// =============================================================================
// MODULE ASSESSMENT METHODS HOOKS (Legacy System)
// =============================================================================

/**
 * Hook to fetch module assessment methods by module ID
 */
export function useGetAssessment(moduleId: string, options?: { staleTime?: number; gcTime?: number }) {
  return useQuery({
    queryKey: ['moduleAssessment', moduleId],
    queryFn: async () => {
      try {
        const token = getCookie("token");
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API}/module/assessment-method/${moduleId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        return response.data as ModuleAssessmentResponse;
      } catch (error: unknown) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        throw new Error(axiosError?.response?.data?.message || "Failed to load module assessment methods");
      }
    },
    enabled: !!moduleId,
    retry: 2, // Retry twice, then stop
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
    refetchOnMount: false, // Don't refetch on component mount if data exists
    refetchInterval: false, // Disable polling/auto-refetch
    staleTime: options?.staleTime || 1000 * 60 * 5, // 5 minutes default
    gcTime: options?.gcTime || 1000 * 60 * 10, // 10 minutes default
  });
}

/**
 * Hook to submit module assessment methods
 */
export function useSubmitAssessment(moduleId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { assessmentIds: string[] }) => {
      const token = getCookie("token");
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/module/add-assessment-methods/${moduleId}`,
        data,
        {
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}` 
          }
        }
      );
      
      return response.data;
    },
    onSuccess: (data) => {
      toast.success("Success", { 
        description: data.message || "Assessment methods submitted successfully" 
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ 
        queryKey: ['moduleAssessment', moduleId] 
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      let errorMessage = "Failed to submit assessment methods. Please try again.";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error("Error", {
        description: errorMessage
      });
    }
  });
}

// Export types for use in other files
export type {
  ModuleAssessmentMethod,
  ModuleAssessmentData,
  ModuleAssessmentResponse,
  ApiErrorResponse,
};
