import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { getCookie } from "@curriculum-services/auth";
import { toast } from "sonner";

export interface SurveyLinkDto {
  survey: unknown | null;
  cohortId?: string | null;
  cohortName?: string | null;
  traineeId?: string | null;
  traineeName?: string | null;
  link: string; // e.g. "/survey/answer/<linkId>"
  expiryDate: string;
  valid: boolean;
}

export interface SurveyLinksResponse {
  code: string;
  count: number;
  message: string;
  surveyLinks: SurveyLinkDto[];
}

export type ExpiryUnit = "minutes" | "hours" | "days" | "weeks";

export const toExpiryMinutes = (value: number, unit: ExpiryUnit): number => {
  if (!Number.isFinite(value) || value <= 0) return 60; // default 1h
  switch (unit) {
    case "minutes":
      return Math.round(value);
    case "hours":
      return Math.round(value * 60);
    case "days":
      return Math.round(value * 60 * 24);
    case "weeks":
      return Math.round(value * 60 * 24 * 7);
    default:
      return 60;
  }
};

const getAuthHeaders = () => {
  const token = getCookie("token");
  return { Authorization: `Bearer ${token}` };
};

export function useGetAnswerLinks(surveyId?: string, traineeIds?: string[]) {
  return useQuery({
    queryKey: ["survey", "answer-links", surveyId, traineeIds?.join(",")],
    enabled: Boolean(surveyId),
    queryFn: async () => {
      const headers = getAuthHeaders();
      const params = new URLSearchParams();
      if (traineeIds && traineeIds.length > 0) {
        traineeIds.forEach((t) => params.append("traineeIds", t));
      }
      const url = `${process.env.NEXT_PUBLIC_API}/survey/${surveyId}/answer-links${params.toString() ? `?${params.toString()}` : ""}`;
      const res = await axios.get<SurveyLinksResponse>(url, { headers });
      return res.data;
    },
  });
}

export function useCreateCohortAnswerLinks() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { surveyId: string; cohortId: string; expiryMinutes: number }) => {
      const headers = getAuthHeaders();
      const url = `${process.env.NEXT_PUBLIC_API}/survey/${args.surveyId}/create-answer-link`;
      const res = await axios.post(url, { cohortId: args.cohortId, expiryMinutes: args.expiryMinutes }, { headers });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Links generated for cohort");
      qc.invalidateQueries({ queryKey: ["survey", "answer-links"] });
    },
    onError: (e: AxiosError<{ message?: string }>) => {
      toast.error(e.response?.data?.message || "Failed to generate links");
    },
  });
}

export function useCreateTraineeAnswerLinks() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { surveyId: string; traineeIds: string[]; expiryMinutes: number }) => {
      const headers = getAuthHeaders();
      const url = `${process.env.NEXT_PUBLIC_API}/survey/${args.surveyId}/create-answer-link-for-trainees`;
      const res = await axios.post(url, { traineeIds: args.traineeIds, expiryMinutes: args.expiryMinutes }, { headers });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Links generated");
      qc.invalidateQueries({ queryKey: ["survey", "answer-links"] });
    },
    onError: (e: AxiosError<{ message?: string }>) => {
      toast.error(e.response?.data?.message || "Failed to generate links");
    },
  });
}

export function useExtendAnswerLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { linkId: string; expiryMinutes: number }) => {
      const headers = getAuthHeaders();
      const url = `${process.env.NEXT_PUBLIC_API}/survey/answer-links/${args.linkId}/extend`;
      const res = await axios.patch(url, { expiryMinutes: args.expiryMinutes }, { headers });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Link updated");
      qc.invalidateQueries({ queryKey: ["survey", "answer-links"] });
    },
    onError: (e: AxiosError<{ message?: string }>) => {
      toast.error(e.response?.data?.message || "Failed to update link");
    },
  });
}

export const buildPortalLink = (relativeLink: string): string => {
  const base = process.env.NEXT_PUBLIC_ASSESSMENTPORTAL || "http://localhost:3002";
  return `${base}${relativeLink}`;
};

export function useDeleteAnswerLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { linkId: string }) => {
      const headers = getAuthHeaders();
      const url = `${process.env.NEXT_PUBLIC_API}/survey/answer-links/${args.linkId}`;
      const res = await axios.delete(url, { headers });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Link deleted");
      qc.invalidateQueries({ queryKey: ["survey", "answer-links"] });
    },
    onError: (e: AxiosError<{ message?: string }>) => {
      toast.error(e.response?.data?.message || "Failed to delete link");
    },
  });
}


