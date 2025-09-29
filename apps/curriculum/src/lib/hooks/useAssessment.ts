"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { getCookie } from "@curriculum-services/auth";
import { Cohort } from "./useCohorts";

// TypeScript interfaces for assessment data structures
interface Choice {
  choice: string;
  choiceImage: string;
  choiceImageFile?: File; // For multipart uploads
  isCorrect: boolean;
}

interface AssessmentEntry {
  question: string;
  questionImage: string;
  questionImageFile?: File; // For multipart uploads
  questionType: "RADIO" | "CHECKBOX";
  choices: Choice[];
  weight: number;
}

interface AssessmentSection {
  title: string;
  description: string;
  assessmentEntries: AssessmentEntry[];
}

interface CreateAssessmentPayload {
  name: string;
  type: "PRE_POST";
  description: string;
  duration: number;
  maxAttempts: number;
  contentDeveloperEmail: string;
  sections: AssessmentSection[];
  timed: boolean;
}

interface CreateAnswerLinkPayload {
  cohortIds: string[];
  traineeIds: string[];
  linkType: "PRE_ASSESSMENT" | "POST_ASSESSMENT";
  expiryMinutes: number;
}

interface UpdateAssessmentPayload {
  name: string;
  type: "PRE_POST";
  description: string;
  duration: number;
  maxAttempts: number;
  contentDeveloperEmail: string;
  timed: boolean;
}

interface ExtendAnswerLinkPayload {
  expiryMinutes: number;
}

interface ApiErrorResponse {
  message: string;
  [key: string]: unknown;
}

// Legacy Module Assessment types removed

// Note: ModuleAssessmentData is deprecated and intentionally removed to reduce unused types.

// Note: ModuleAssessmentResponse is deprecated and intentionally removed to reduce unused types.

// GET API Response Interfaces
export interface AssessmentChoice {
  id: string;
  choiceText: string;
  choiceImageUrl: string | null;
  isCorrect: boolean;
}

export interface AssessmentQuestion {
  id: string;
  questionNumber: number;
  question: string;
  questionType: "RADIO" | "CHECKBOX";
  questionImageUrl: string | null;
  choices: AssessmentChoice[];
  weight: number;
}

export interface AssessmentSectionDetail {
  id: string;
  title: string;
  description: string;
  sectionNumber: number;
  questions: AssessmentQuestion[];
}

interface ContentDeveloperRef {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  role: { name: string; colorCode?: string };
  profilePictureUrl: string | null;
}

export interface AssessmentSummary {
  id: string;
  name: string;
  type: "PRE_POST";
  description: string;
  duration: number;
  maxAttempts: number;
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
  contentDeveloper: ContentDeveloperRef | null;
  cohorts: Cohort[];
  sectionCount: number;
  timed: boolean;
}

export interface AssessmentDetail {
  id: string;
  name: string;
  type: "PRE_POST";
  description: string;
  duration: number;
  maxAttempts: number;
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
  contentDeveloper: ContentDeveloperRef | null;
  cohorts: string[];
  sections: AssessmentSectionDetail[];
  timed: boolean;
}

// API Response Wrappers
export interface AssessmentsResponse {
  assessments: AssessmentSummary[];
  code: string;
  message: string;
}

export interface AssessmentDetailResponse {
  assessment: AssessmentDetail;
  code: string;
  message: string;
}

export interface AssessmentSectionsResponse {
  code: string;
  message: string;
  sections: AssessmentSectionDetail[];
}

export interface AssessmentSectionResponse {
  code: string;
  section: AssessmentSectionDetail;
  message: string;
}

// Query Keys
const assessmentQueryKeys = {
  all: ['assessments'] as const,
  training: (trainingId: string) => ['assessments', 'training', trainingId] as const,
  detail: (assessmentId: string) => ['assessments', 'detail', assessmentId] as const,
  sections: (assessmentId: string) => ['assessments', 'sections', assessmentId] as const,
  section: (sectionId: string) => ['assessments', 'section', sectionId] as const,
};

// =============================================================================
// GET HOOKS - Fetching Assessment Data
// =============================================================================

/**
 * Hook to fetch all assessments for a training
 */
export function useAssessments(trainingId: string) {
  return useQuery({
    queryKey: assessmentQueryKeys.training(trainingId),
    queryFn: async () => {
      try {
        const token = getCookie("token");
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API}/assessment/training/${trainingId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        return response.data as AssessmentsResponse;
      } catch (error: unknown) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        throw new Error(axiosError?.response?.data?.message || "Failed to load assessments");
      }
    },
    enabled: !!trainingId,
  });
}

/**
 * Hook to fetch assessment details by ID
 */
export function useAssessmentDetail(assessmentId: string) {
  return useQuery({
    queryKey: assessmentQueryKeys.detail(assessmentId),
    queryFn: async () => {
      try {
        const token = getCookie("token");
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API}/assessment/${assessmentId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        return response.data as AssessmentDetailResponse;
      } catch (error: unknown) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        throw new Error(axiosError?.response?.data?.message || "Failed to load assessment details");
      }
    },
    enabled: !!assessmentId,
  });
}

/**
 * Hook to fetch assessment sections by assessment ID
 */
export function useAssessmentSections(assessmentId: string) {
  return useQuery({
    queryKey: assessmentQueryKeys.sections(assessmentId),
    queryFn: async () => {
      try {
        const token = getCookie("token");
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API}/assessment-section/assessment/${assessmentId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        return response.data as AssessmentSectionsResponse;
      } catch (error: unknown) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        throw new Error(axiosError?.response?.data?.message || "Failed to load assessment sections");
      }
    },
    enabled: !!assessmentId,
  });
}

/**
 * Hook to fetch a specific assessment section by section ID
 */
export function useAssessmentSection(sectionId: string) {
  return useQuery({
    queryKey: assessmentQueryKeys.section(sectionId),
    queryFn: async () => {
      try {
        const token = getCookie("token");
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API}/assessment-section/${sectionId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        return response.data as AssessmentSectionResponse;
      } catch (error: unknown) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        throw new Error(axiosError?.response?.data?.message || "Failed to load assessment section");
      }
    },
    enabled: !!sectionId,
  });
}

// =============================================================================
// MUTATION HOOKS - Creating and Modifying Assessments
// =============================================================================

/**
 * Hook to create a new assessment
 */
export function useCreateAssessment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      trainingId, 
      data 
    }: { 
      trainingId: string;
      data: CreateAssessmentPayload;
    }) => {
      const token = getCookie("token");
      
      // Build multipart form data: send all fields as individual multipart keys (no JSON payload)
      const formData = new FormData();

      // Top-level fields
      formData.append('name', data.name ?? '');
      formData.append('type', data.type);
      formData.append('description', data.description ?? '');
      formData.append('duration', String(data.duration ?? 0));
      formData.append('maxAttempts', String(data.maxAttempts ?? 1));
      formData.append('contentDeveloperEmail', data.contentDeveloperEmail ?? '');
      formData.append('timed', String(!!data.timed));

      // Nested fields (sections, assessmentEntries, choices)
      data.sections.forEach((sec, si) => {
        formData.append(`sections[${si}].title`, sec.title ?? '');
        if (sec.description) formData.append(`sections[${si}].description`, sec.description);

        sec.assessmentEntries.forEach((entry, ei) => {
          formData.append(`sections[${si}].assessmentEntries[${ei}].question`, entry.question ?? '');
          formData.append(`sections[${si}].assessmentEntries[${ei}].questionType`, entry.questionType);
          formData.append(`sections[${si}].assessmentEntries[${ei}].weight`, String(entry.weight ?? 1));

          // Choices (text, image, and correctness)
          (entry.choices || []).forEach((c, ci) => {
            formData.append(`sections[${si}].assessmentEntries[${ei}].choices[${ci}].choice`, c.choice ?? '');
            formData.append(`sections[${si}].assessmentEntries[${ei}].choices[${ci}].isCorrect`, String(!!c.isCorrect));
            if (c.choiceImageFile instanceof File) {
              formData.append(`sections[${si}].assessmentEntries[${ei}].choices[${ci}].choiceImage`, c.choiceImageFile);
            } else if (c.choiceImage) {
              formData.append(`sections[${si}].assessmentEntries[${ei}].choices[${ci}].choiceImage`, c.choiceImage);
            }
          });

          // Question image (file or existing URL)
          if (entry.questionImageFile instanceof File) {
            formData.append(`sections[${si}].assessmentEntries[${ei}].questionImage`, entry.questionImageFile);
          } else if (entry.questionImage) {
            formData.append(`sections[${si}].assessmentEntries[${ei}].questionImage`, entry.questionImage);
          }
        });
      });
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/assessment/training/${trainingId}`,
        formData,
        {
          headers: { 
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}` 
          }
        }
      );
      
      return response.data;
    },
    onSuccess: (data) => {
      toast.success("Success", { 
        description: data.message || "Assessment created successfully" 
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ 
        queryKey: ["assessments"] 
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      let errorMessage = "Failed to create assessment. Please try again.";
      
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

// Hook to create answer link for assessment
export function useCreateAnswerLink() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      assessmentId, 
      data 
    }: { 
      assessmentId: string;
      data: CreateAnswerLinkPayload;
    }) => {
      const token = getCookie("token");
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/assessment/${assessmentId}/create-answer-link`,
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
        description: data.message || "Answer link created successfully" 
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ 
        queryKey: ["assessmentLinks"] 
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      let errorMessage = "Failed to create answer link. Please try again.";
      
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

export function useDeleteAssessmentLink() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (linkId: string) => {
      const token = getCookie("token");
      
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API}/assessment/answer-links/${linkId}`,
        {
          headers: { 
            Authorization: `Bearer ${token}` 
          }
        }
      );
      
      return response.data;
    },
    onSuccess: (data) => {
      toast.success("Success", { 
        description: data.message || "Assessment link deleted successfully" 
      });
      
      // Invalidate assessment links queries to immediately update the UI
      queryClient.invalidateQueries({ 
        queryKey: ["assessment", "answer-links"] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["assessment", "answered-trainees"] 
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      let errorMessage = "Failed to delete assessment link. Please try again.";
      
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

// Hook to change assessment status
export function useChangeAssessmentStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      assessmentId, 
      status 
    }: { 
      assessmentId: string;
      status: "PENDING" | "APPROVED" | "REJECTED";
    }) => {
      const token = getCookie("token");
      
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API}/assessment/${assessmentId}/change-status?status=${status}`,
        {},
        {
          headers: { 
            Authorization: `Bearer ${token}` 
          }
        }
      );
      
      return response.data;
    },
    onSuccess: (data) => {
      toast.success("Success", { 
        description: data.message || "Assessment status updated successfully" 
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ 
        queryKey: ["assessments"] 
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      let errorMessage = "Failed to update assessment status. Please try again.";
      
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

// Hook to invalidate answer link
export function useInvalidateAnswerLink() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (linkId: string) => {
      const token = getCookie("token");
      
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API}/assessment/answer-links/${linkId}/invalidate`,
        {},
        {
          headers: { 
            Authorization: `Bearer ${token}` 
          }
        }
      );
      
      return response.data;
    },
    onSuccess: (data) => {
      toast.success("Success", { 
        description: data.message || "Answer link invalidated successfully" 
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ 
        queryKey: ["assessmentLinks"] 
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      let errorMessage = "Failed to invalidate answer link. Please try again.";
      
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

// Hook to extend answer link
export function useExtendAnswerLink() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      linkId, 
      data 
    }: { 
      linkId: string;
      data: ExtendAnswerLinkPayload;
    }) => {
      const token = getCookie("token");
      
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API}/assessment/answer-links/${linkId}/extend`,
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
        description: data.message || "Answer link extended successfully" 
      });
      
      // Invalidate assessment links queries to immediately update the UI
      queryClient.invalidateQueries({ 
        queryKey: ["assessment", "answer-links"] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["assessment", "answered-trainees"] 
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      let errorMessage = "Failed to extend answer link. Please try again.";
      
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

// Hook to update assessment
export function useUpdateAssessment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      assessmentId, 
      data 
    }: { 
      assessmentId: string;
      data: UpdateAssessmentPayload;
    }) => {
      const token = getCookie("token");
      
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API}/assessment/${assessmentId}`,
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
        description: data.message || "Assessment updated successfully" 
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ 
        queryKey: ["assessments"] 
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      const message = error.response?.data?.message || "Failed to update assessment. Please try again."
      toast.error("Error", { description: message })
    }
  });
}

// =============================================================================
// SECTION MUTATION HOOKS - Managing Assessment Sections
// =============================================================================

/**
 * Hook to add a new section to an existing assessment
 */
export function useAddAssessmentSection() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      assessmentId, 
      data 
    }: { 
      assessmentId: string;
      data: {
        title: string;
        description: string;
        assessmentEntries: {
          question: string;
          questionImage?: string;
          questionImageFile?: File;
          questionType: "RADIO" | "CHECKBOX";
          choices: {
            choice: string;
            choiceImage?: string;
            choiceImageFile?: File;
            isCorrect: boolean;
          }[];
          weight: number;
        }[];
      };
    }) => {
      const token = getCookie("token");
      
      // Use multipart form data for potential image uploads
      const formData = new FormData();
      
      // Add section fields
      formData.append('title', data.title);
      formData.append('description', data.description);
      
      // Add assessment entries
      data.assessmentEntries.forEach((entry, ei) => {
        formData.append(`assessmentEntries[${ei}].question`, entry.question);
        formData.append(`assessmentEntries[${ei}].questionType`, entry.questionType);
        formData.append(`assessmentEntries[${ei}].weight`, String(entry.weight));
        
        // Add choices
        entry.choices.forEach((choice, ci) => {
          formData.append(`assessmentEntries[${ei}].choices[${ci}].choice`, choice.choice);
          formData.append(`assessmentEntries[${ei}].choices[${ci}].isCorrect`, String(choice.isCorrect));
          
          if (choice.choiceImageFile instanceof File) {
            formData.append(`assessmentEntries[${ei}].choices[${ci}].choiceImage`, choice.choiceImageFile);
          } else if (choice.choiceImage) {
            formData.append(`assessmentEntries[${ei}].choices[${ci}].choiceImage`, choice.choiceImage);
          }
        });
        
        // Add question image
        if (entry.questionImageFile instanceof File) {
          formData.append(`assessmentEntries[${ei}].questionImage`, entry.questionImageFile);
        } else if (entry.questionImage) {
          formData.append(`assessmentEntries[${ei}].questionImage`, entry.questionImage);
        }
      });
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/assessment-section/assessment/${assessmentId}`,
        formData,
        {
          headers: { 
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}` 
          }
        }
      );
      
      return response.data;
    },
    onSuccess: (data) => {
      toast.success("Success", { 
        description: data.message || "Assessment section added successfully" 
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ 
        queryKey: assessmentQueryKeys.all 
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      let errorMessage = "Failed to add assessment section. Please try again.";
      
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

/**
 * Hook to delete an assessment section
 */
export function useDeleteAssessmentSection() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (sectionId: string) => {
      const token = getCookie("token");
      
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API}/assessment-section/${sectionId}`,
        {
          headers: { 
            Authorization: `Bearer ${token}` 
          }
        }
      );
      
      return response.data;
    },
    onSuccess: (data) => {
      toast.success("Success", { 
        description: data.message || "Assessment section deleted successfully" 
      });
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ 
        queryKey: assessmentQueryKeys.all 
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      let errorMessage = "Failed to delete assessment section. Please try again.";
      
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

