import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { getCookie } from "@curriculum-services/auth";
import { toast } from "sonner";

// Assessment Links interfaces
export interface AssessmentLinkDto {
  assessment: unknown | null;
  cohortId?: string | null;
  cohortName?: string | null;
  traineeId?: string | null;
  traineeName?: string | null;
  link: string; // e.g. "/assessment/answer/<linkId>"
  linkType: "PRE_ASSESSMENT" | "POST_ASSESSMENT";
  expiryDate: string;
  valid: boolean;
}

export interface AssessmentLinksResponse {
  code: string;
  count: number;
  assessmentLinks: AssessmentLinkDto[];
}

// Utility function to convert time units to minutes
export function toExpiryMinutes(value: number, unit: 'minutes'|'hours'|'days'|'weeks'): number {
  switch (unit) {
    case 'minutes': return value;
    case 'hours': return value * 60;
    case 'days': return value * 60 * 24;
    case 'weeks': return value * 60 * 24 * 7;
    default: return value;
  }
}

// Utility function to build assessment portal link
export function buildAssessmentPortalLink(link: string): string {
  const base = process.env.NEXT_PUBLIC_ASSESSMENTPORTAL || "http://localhost:3002";
  return `${base}${link}`;
}

// Hook to get assessment answer links
export function useGetAssessmentLinks(assessmentId?: string, traineeIds?: string[]) {
  const getAuthHeaders = () => {
    const token = getCookie("token");
    return { Authorization: `Bearer ${token}` };
  };

  return useQuery({
    queryKey: ["assessment", "answer-links", assessmentId, traineeIds],
    queryFn: async () => {
      const headers = getAuthHeaders();
      const params = new URLSearchParams();
      if (traineeIds?.length) {
        traineeIds.forEach(id => params.append('traineeIds', id));
      }
      const url = `${process.env.NEXT_PUBLIC_API}/assessment/${assessmentId}/answer-links${params.toString() ? `?${params}` : ''}`;
      const res = await axios.get(url, { headers });
      return res.data as AssessmentLinksResponse;
    },
    enabled: !!assessmentId,
  });
}

// Attempts summary (who has attempted) - used for answered view in cohort
export interface TraineeAttemptsSummary {
  traineeId: string;
  traineeName: string;
  traineeEmail?: string;
  traineeContactPhone?: string;
  totalAttempts: number;
  preAssessmentScore: number | null;
  postAssessmentScore: number | null;
  hasPassed: boolean | null;
}

export interface AssessmentAttemptsSummaryResponse {
  code: string;
  count: number;
  traineeAttempts: TraineeAttemptsSummary[];
  message: string;
}

export function useAssessmentAttemptsSummary(assessmentId?: string) {
  const getAuthHeaders = () => {
    const token = getCookie("token");
    return { Authorization: `Bearer ${token}` };
  };

  return useQuery({
    queryKey: ["assessment", "attempts-summary", assessmentId],
    queryFn: async () => {
      const headers = getAuthHeaders();
      const url = `${process.env.NEXT_PUBLIC_API}/assessment-attempt/assessment/${assessmentId}`;
      const res = await axios.get(url, { headers });
      return res.data as AssessmentAttemptsSummaryResponse;
    },
    enabled: !!assessmentId,
  });
}

// Hook to create cohort assessment answer links
export function useCreateCohortAssessmentLinks() {
  const qc = useQueryClient();
  const getAuthHeaders = () => {
    const token = getCookie("token");
    return { Authorization: `Bearer ${token}` };
  };

  return useMutation({
    mutationFn: async (args: { assessmentId: string; cohortIds: string[]; linkType: "PRE_ASSESSMENT" | "POST_ASSESSMENT"; expiryMinutes: number }) => {
      const headers = getAuthHeaders();
      const url = `${process.env.NEXT_PUBLIC_API}/assessment/${args.assessmentId}/create-answer-link`;
      const payload = {
        cohortIds: args.cohortIds,
        traineeIds: [],
        linkType: args.linkType,
        expiryMinutes: args.expiryMinutes
      };
      const res = await axios.post(url, payload, { headers });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Assessment links generated for cohorts");
      qc.invalidateQueries({ queryKey: ["assessment", "answer-links"] });
    },
    onError: (e: AxiosError<{ message?: string }>) => {
      toast.error(e.response?.data?.message || "Failed to generate assessment links");
    },
  });
}

// Hook to create trainee assessment answer links
export function useCreateTraineeAssessmentLinks() {
  const qc = useQueryClient();
  const getAuthHeaders = () => {
    const token = getCookie("token");
    return { Authorization: `Bearer ${token}` };
  };

  return useMutation({
    mutationFn: async (args: { assessmentId: string; cohortId: string; traineeIds: string[]; linkType: "PRE_ASSESSMENT" | "POST_ASSESSMENT"; expiryMinutes: number }) => {
      const headers = getAuthHeaders();
      const url = `${process.env.NEXT_PUBLIC_API}/assessment/${args.assessmentId}/create-answer-link`;
      const payload = {
        cohortIds: [args.cohortId],
        traineeIds: args.traineeIds,
        linkType: args.linkType,
        expiryMinutes: args.expiryMinutes
      };
      const res = await axios.post(url, payload, { headers });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Assessment links generated for trainees");
      qc.invalidateQueries({ queryKey: ["assessment", "answer-links"] });
    },
    onError: (e: AxiosError<{ message?: string }>) => {
      toast.error(e.response?.data?.message || "Failed to generate assessment links");
    },
  });
}

// Hook to extend assessment answer link
export function useExtendAssessmentLink() {
  const qc = useQueryClient();
  const getAuthHeaders = () => {
    const token = getCookie("token");
    return { Authorization: `Bearer ${token}` };
  };

  return useMutation({
    mutationFn: async (args: { linkId: string; expiryMinutes: number }) => {
      const headers = getAuthHeaders();
      const url = `${process.env.NEXT_PUBLIC_API}/assessment/answer-link/${args.linkId}/extend`;
      const res = await axios.patch(url, { expiryMinutes: args.expiryMinutes }, { headers });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Assessment link extended successfully");
      qc.invalidateQueries({ queryKey: ["assessment", "answer-links"] });
    },
    onError: (e: AxiosError<{ message?: string }>) => {
      toast.error(e.response?.data?.message || "Failed to extend assessment link");
    },
  });
}

// Note: useDeleteAssessmentLink is imported from @/lib/hooks/useAssessment

// Hook to get answered trainees for assessment (fetches all, no linkType filtering)
export function useAnsweredAssessmentTrainees(assessmentId?: string) {
  const getAuthHeaders = () => {
    const token = getCookie("token");
    return { Authorization: `Bearer ${token}` };
  };

  return useQuery({
    queryKey: ["assessment", "answered-trainees", assessmentId],
    queryFn: async () => {
      const headers = getAuthHeaders();
      const url = `${process.env.NEXT_PUBLIC_API}/assessment/${assessmentId}/answered-trainees`;
      const res = await axios.get(url, { headers });
      return res.data;
    },
    enabled: !!assessmentId,
  });
}
