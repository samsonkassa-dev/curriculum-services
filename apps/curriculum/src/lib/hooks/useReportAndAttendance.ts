"use client"

import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { getCookie } from "@curriculum-services/auth";

// Type for the session report file upload
interface SessionReportFile {
  reportFileTypeId: string;
  file: File;
}

// Type for the session report form data
interface SessionReportFormData {
  topicsCovered: string[];
  significantObservations: string[];
  overallSatisfactionScore: number;
  learnerFeedbackSummary: string;
  positiveFeedback: string;
  areasForImprovement: string;
  specificFeedbackExamples: string;
  teachingMethodEffectiveness: number;
  trainerStrengths: string;
  trainerAreasForGrowth: string;
  trainerProfessionalGoals: string;
  curriculumRecommendations: string;
  deliveryMethodRecommendations: string;
  assessmentRecommendations: string;
  learnerSupportRecommendations: string;
  otherRecommendations: string;
  sessionReportFiles: SessionReportFile[];
}

// Type for session report response file
interface SessionReportResponseFile {
  id: string;
  reportFileTypeId: string;
  fileUrl: string;
  fileName: string;
}

// Type for session report response
interface SessionReportResponse {
  code: string;
  report: {
    id: string;
    sessionId: string;
    topicsCovered: string[];
    significantObservations: string[];
    overallSatisfactionScore: number;
    learnerFeedbackSummary: string;
    positiveFeedback: string;
    areasForImprovement: string;
    specificFeedbackExamples: string;
    teachingMethodEffectiveness: number;
    trainerStrengths: string;
    trainerAreasForGrowth: string;
    trainerProfessionalGoals: string;
    curriculumRecommendations: string;
    deliveryMethodRecommendations: string;
    assessmentRecommendations: string;
    learnerSupportRecommendations: string;
    otherRecommendations: string;
    sessionReportFiles: SessionReportResponseFile[];
  };
  message: string;
}

// Type for API error response
interface ApiErrorResponse {
  message: string;
  [key: string]: unknown;
}

// Utility function to check if a value is a SessionReportFile array
function isSessionReportFile(value: unknown): value is SessionReportFile[] {
  return Array.isArray(value) && value.every(item => 
    typeof item === "object" && 
    item !== null && 
    "reportFileTypeId" in item && 
    "file" in item
  );
}

export function useGetSessionReport(sessionId: string) {
  return useQuery({
    queryKey: ["session-report", sessionId],
    queryFn: async () => {
      try {
        const token = getCookie('token');
        const response = await axios.get<SessionReportResponse>(
          `${process.env.NEXT_PUBLIC_API}/session/${sessionId || ''}/report`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        return response.data;
      } catch (error) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        let errorMessage = "Failed to fetch session report. Please try again.";
        
        if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        } else if (axiosError.message) {
          errorMessage = axiosError.message;
        }
        
        toast.error("Error", {
          description: errorMessage
        });
        
        throw error;
      }
    },
    enabled: !!sessionId
  });
}

export function useSubmitSessionReport() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ sessionId, data }: { sessionId: string, data: SessionReportFormData }) => {
      const token = getCookie('token');
      const formData = new FormData();
      
      // Add all form fields to the FormData
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === "sessionReportFiles" && isSessionReportFile(value)) {
            // Handle file uploads
            value.forEach((fileData) => {
              formData.append(fileData.reportFileTypeId, fileData.file);
            });
          } else if (Array.isArray(value)) {
            // Handle array values like topicsCovered and significantObservations
            value.forEach((item, index) => {
              formData.append(`${key}[${index}]`, item);
            });
          } else {
            // Handle regular fields
            formData.append(key, value.toString());
          }
        }
      });
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/session/${sessionId || ''}/report`.replace(/\/+/g, '/').replace(/^(https?:\/)/, '$1/'),
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`
          },
        }
      );
      
      return response.data;
    },
    onSuccess: (data, variables) => {
      toast.success("Success", { description: data.message || "Session report submitted successfully" });
      // Refetch the specific session report so caller sees "View Report"
      queryClient.invalidateQueries({ queryKey: ["session-report", variables.sessionId] });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      let errorMessage = "Failed to submit session report. Please try again.";
      
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