import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../http";
import { toast } from "sonner";

// Assessment Link Types
export interface AssessmentChoice {
  id: string;
  choiceText: string;
  choiceImageUrl: string | null;
  isCorrect: boolean | null;
}

export interface AssessmentQuestion {
  id: string;
  questionNumber: number | null;
  question: string;
  questionType: "RADIO" | "CHECKBOX" | "TEXT";
  questionImageUrl: string | null;
  choices: AssessmentChoice[];
  weight: number;
}

export interface AssessmentSection {
  id: string;
  title: string;
  description: string;
  sectionNumber: number;
  questions: AssessmentQuestion[];
}

export interface Assessment {
  id: string;
  name: string;
  type: string;
  description: string;
  duration: number; // in minutes
  maxAttempts: number;
  approvalStatus: string | null;
  contentDeveloper: string | null;
  cohorts: any;
  sections: AssessmentSection[];
  timed: boolean;
}

export interface AssessmentLink {
  assessment: Assessment;
  linkType: "PRE_ASSESSMENT" | "POST_ASSESSMENT";
  cohortId: string;
  cohortName: string;
  traineeId: string;
  traineeName: string;
  link: string;
  expiryDate: string;
  valid: boolean;
}

export interface AssessmentLinkValidityResponse {
  code: string;
  assessmentLink: AssessmentLink;
  message: string;
}

export interface AssessmentAnswer {
  assessmentEntryId: string;
  selectedChoiceIds: string[];
  textAnswer?: string;
}

export interface AssessmentAttempt {
  id: string;
  assessment: Assessment;
  traineeId: string;
  traineeName: string;
  attemptType: "PRE_ASSESSMENT" | "POST_ASSESSMENT";
  attemptNumber: number;
  startedAt: string;
  submittedAt: string | null;
  score: number | null;
  maxScore: number | null;
  percentage: number | null;
  attemptStatus: "IN_PROGRESS" | "SUBMITTED" | "EXPIRED";
  assessmentAnswers: AssessmentAnswer[];
}

export interface StartAssessmentResponse {
  code: string;
  assessmentAttempt: AssessmentAttempt;
  message: string;
}

// Hook to check assessment link validity
export function useCheckAssessmentLinkValidity(linkId: string) {
  return useQuery({
    queryKey: ["assessment", "link-validity", linkId],
    queryFn: async () => {
      const response = await api.get(`/assessment/check-link-validity/${linkId}`);
      return response.data as AssessmentLinkValidityResponse;
    },
    enabled: !!linkId,
    retry: false,
  });
}

// Hook to start assessment
export function useStartAssessment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (linkId: string) => {
      const response = await api.post(`/assessment-attempt/link/${linkId}/start`);
      return response.data as StartAssessmentResponse;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Assessment started successfully");
      // Invalidate and refetch assessment link validity
      queryClient.invalidateQueries({ queryKey: ["assessment", "link-validity"] });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "Failed to start assessment";
      toast.error(errorMessage);
    },
  });
}

// Hook to save assessment answers
export function useSaveAssessmentAnswers() {
  return useMutation({
    mutationFn: async ({ linkId, assessmentAnswers }: { linkId: string; assessmentAnswers: AssessmentAnswer[] }) => {
      const response = await api.post(`/assessment-attempt/link/${linkId}/save-answers`, {
        assessmentAnswers
      });
      return response.data;
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "Failed to save answers";
      console.error("Save answers error:", errorMessage);
    },
  });
}

// Hook to submit assessment
export function useSubmitAssessment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (linkId: string) => {
      const response = await api.post(`/assessment-attempt/link/${linkId}/submit`);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Assessment submitted successfully");
      // Set flag for success page
      try {
        sessionStorage.setItem('assessmentSubmitted', '1');
      } catch (error) {
        console.warn('Failed to set sessionStorage flag:', error);
      }
      queryClient.invalidateQueries({ queryKey: ["assessment"] });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || "Failed to submit assessment";
      toast.error(errorMessage);
    },
  });
}
