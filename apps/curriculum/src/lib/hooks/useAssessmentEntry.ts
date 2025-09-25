"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import { getCookie } from "@curriculum-services/auth";

// TypeScript interfaces for assessment entry operations
interface Choice {
  choice: string;
  choiceImage?: string;
  choiceImageFile?: File;
  isCorrect: boolean;
}

interface UpdateAssessmentEntryPayload {
  questionNumber?: number;
  question: string;
  questionImage?: string; // Only used for display, not sent in PATCH
  questionImageFile?: File; // Only this is sent in PATCH requests
  questionType: "RADIO" | "CHECKBOX";
  choices?: Choice[]; // Optional - when empty, only question is updated
  weight: number;
}

interface CreateAssessmentEntryPayload {
  question: string;
  questionImage?: string;
  questionImageFile?: File;
  questionType: "RADIO" | "CHECKBOX";
  choices: Choice[];
  weight: number;
}

interface UpdateChoicePayload {
  choice: string;
  choiceImage?: string; // Only used for display, not sent in PATCH
  choiceImageFile?: File; // Only this is sent in PATCH requests
  isCorrect: boolean;
}

interface AddChoicePayload {
  choice: string;
  choiceImage?: string;
  choiceImageFile?: File;
  isCorrect: boolean;
}

interface ApiErrorResponse {
  message: string;
  [key: string]: unknown;
}

// Note: We invalidate broader assessment queries since entries are nested within assessments

// =============================================================================
// ASSESSMENT ENTRY MUTATION HOOKS
// =============================================================================

/**
 * Hook to update an existing assessment entry (question)
 */
export function useUpdateAssessmentEntry() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      entryId, 
      data 
    }: { 
      entryId: string;
      data: UpdateAssessmentEntryPayload;
    }) => {
      const token = getCookie("token");
      
      // Build multipart form data for image support
      const formData = new FormData();
      
      // Add basic fields
      if (data.questionNumber !== undefined) {
        formData.append('questionNumber', String(data.questionNumber));
      }
      formData.append('question', data.question);
      formData.append('questionType', data.questionType);
      formData.append('weight', String(data.weight));
      
      // Add question image - only if it's a new file, don't send existing URLs
      if (data.questionImageFile instanceof File) {
        formData.append('questionImage', data.questionImageFile);
      }
      
      // Add choices (only if provided)
      if (data.choices && data.choices.length > 0) {
        data.choices.forEach((choice, index) => {
          formData.append(`choices[${index}].choice`, choice.choice);
          formData.append(`choices[${index}].isCorrect`, String(choice.isCorrect));
          
          // Only send choice image if it's a new file, don't send existing URLs
          if (choice.choiceImageFile instanceof File) {
            formData.append(`choices[${index}].choiceImage`, choice.choiceImageFile);
          }
        });
      }
      
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API}/assessment-entry/${entryId}`,
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
        description: data.message || "Question updated successfully" 
      });
      
      // Invalidate all assessment-related queries
      queryClient.invalidateQueries({ 
        queryKey: ['assessments'] 
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      let errorMessage = "Failed to update question. Please try again.";
      
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
 * Hook to add a new question to an existing section
 */
export function useAddAssessmentEntry() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      sectionId, 
      data 
    }: { 
      sectionId: string;
      data: CreateAssessmentEntryPayload;
    }) => {
      const token = getCookie("token");
      
      // Build multipart form data for image support
      const formData = new FormData();
      
      // Add basic fields
      formData.append('question', data.question);
      formData.append('questionType', data.questionType);
      formData.append('weight', String(data.weight));
      
      // Add question image
      if (data.questionImageFile instanceof File) {
        formData.append('questionImage', data.questionImageFile);
      } else if (data.questionImage) {
        formData.append('questionImage', data.questionImage);
      }
      
      // Add choices
      data.choices.forEach((choice, index) => {
        formData.append(`choices[${index}].choice`, choice.choice);
        formData.append(`choices[${index}].isCorrect`, String(choice.isCorrect));
        
        if (choice.choiceImageFile instanceof File) {
          formData.append(`choices[${index}].choiceImage`, choice.choiceImageFile);
        } else if (choice.choiceImage) {
          formData.append(`choices[${index}].choiceImage`, choice.choiceImage);
        }
      });
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/assessment-entry/assessment-section/${sectionId}`,
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
        description: data.message || "Question added successfully" 
      });
      
      // Invalidate all assessment-related queries
      queryClient.invalidateQueries({ 
        queryKey: ['assessments'] 
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      let errorMessage = "Failed to add question. Please try again.";
      
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

// =============================================================================
// CHOICE MUTATION HOOKS
// =============================================================================

/**
 * Hook to update an existing choice
 */
export function useUpdateChoice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      choiceId, 
      data 
    }: { 
      choiceId: string;
      data: UpdateChoicePayload;
    }) => {
      const token = getCookie("token");
      
      // Build multipart form data for image support
      const formData = new FormData();
      
      formData.append('choice', data.choice);
      formData.append('isCorrect', String(data.isCorrect));
      
      // Add choice image - only if it's a new file, don't send existing URLs
      if (data.choiceImageFile instanceof File) {
        formData.append('choiceImage', data.choiceImageFile);
      }
      
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API}/assessment-entry/edit-choice/${choiceId}`,
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
        description: data.message || "Choice updated successfully" 
      });
      
      // Invalidate all assessment-related queries
      queryClient.invalidateQueries({ 
        queryKey: ['assessments'] 
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      let errorMessage = "Failed to update choice. Please try again.";
      
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
 * Hook to delete a choice with confirmation
 */
export function useDeleteChoice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (choiceId: string) => {
      const token = getCookie("token");
      
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API}/assessment-entry/delete-choice/${choiceId}`,
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
        description: data.message || "Choice deleted successfully" 
      });
      
      // Invalidate all assessment-related queries
      queryClient.invalidateQueries({ 
        queryKey: ['assessments'] 
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      let errorMessage = "Failed to delete choice. Please try again.";
      
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
 * Hook to add a new choice to an existing question
 */
export function useAddChoice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      entryId, 
      data 
    }: { 
      entryId: string;
      data: AddChoicePayload;
    }) => {
      const token = getCookie("token");
      
      // Build multipart form data for image support
      const formData = new FormData();
      
      formData.append('choice', data.choice);
      formData.append('isCorrect', String(data.isCorrect));
      
      // Add choice image
      if (data.choiceImageFile instanceof File) {
        formData.append('choiceImage', data.choiceImageFile);
      } else if (data.choiceImage) {
        formData.append('choiceImage', data.choiceImage);
      }
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/assessment-entry/${entryId}/add-choice`,
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
        description: data.message || "Choice added successfully" 
      });
      
      // Invalidate all assessment-related queries
      queryClient.invalidateQueries({ 
        queryKey: ['assessments'] 
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      let errorMessage = "Failed to add choice. Please try again.";
      
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

// =============================================================================
// HELPER HOOKS FOR CONFIRMATION DIALOGS
// =============================================================================

/**
 * Hook to delete an assessment entry (question) with confirmation
 */
export function useDeleteAssessmentEntry() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (entryId: string) => {
      const token = getCookie("token");
      
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API}/assessment-entry/${entryId}`,
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
        description: data.message || "Question deleted successfully" 
      });
      
      // Invalidate all assessment-related queries
      queryClient.invalidateQueries({ 
        queryKey: ['assessments'] 
      });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      let errorMessage = "Failed to delete question. Please try again.";
      
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

// Export types for use in components
export type {
  UpdateAssessmentEntryPayload,
  CreateAssessmentEntryPayload,
  UpdateChoicePayload,
  AddChoicePayload,
  Choice
};
