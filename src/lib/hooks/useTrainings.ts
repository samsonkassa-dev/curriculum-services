/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { Training } from "@/types/training";

interface TrainingsResponse {
  code: string;
  trainings: Training[];
  message: string;
}

interface UseTrainingsProps {
  isArchived?: boolean;
}

export function useTrainings({ isArchived }: UseTrainingsProps = {}) {
  return useQuery({
    queryKey: ["trainings", isArchived],
    queryFn: async () => {
      try {
        const token = localStorage.getItem("auth_token");
        const params = new URLSearchParams();
        if (isArchived) {
          params.append("is-archived", "true");
        }
        
        const response = await axios.get<TrainingsResponse>(
          `${process.env.NEXT_PUBLIC_API}/training${params.toString() ? `?${params.toString()}` : ''}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const message = error.response?.data?.message || "Failed to fetch trainings";
          // We don't toast here anymore since we handle it in the component
          // This allows the component to display the error in the UI as well
        }
        throw error; // Re-throw to let the component handle it
      }
    },
  });
}

interface PaginatedTrainingsResponse {
  code: string;
  trainings: Training[];
  totalPages: number;
  pageSize: number;
  currentPage: number;
  totalElements: number;
  message: string;
}

interface UsePaginatedTrainingProps {
  page: number;
  pageSize: number;
  searchQuery?: string;
}

export function usePaginatedTrainings({
  page,
  pageSize,
  searchQuery,
}: UsePaginatedTrainingProps) {
  return useQuery<PaginatedTrainingsResponse>({
    queryKey: ["trainings", page, pageSize, searchQuery],
    queryFn: async () => {
      try {
        const token = localStorage.getItem("auth_token");
        const params = new URLSearchParams({
          page: String(page),
          "page-size": String(pageSize),
          ...(searchQuery && { "search-query": searchQuery }),
        });

        const baseUrl = process.env.NEXT_PUBLIC_API;

        const response = await axios.get<PaginatedTrainingsResponse>(
          `${baseUrl}/training?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const message =
            error.response?.data?.message || "Failed to fetch trainings";
          toast.error("Error", { description: message });
        }
        throw error;
      }
    },
  });
}

export function useArchiveTraining() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (trainingId: string) => {
      const token = localStorage.getItem("auth_token");
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API}/training/archive/${trainingId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Training archived successfully");
      queryClient.invalidateQueries({ queryKey: ["trainings"] });
    },
    onError: (error: any) => {
      toast.error("Error", {
        description: error.response?.data?.message || "Failed to archive training"
      });
    }
  });
}

export function useUnarchiveTraining() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (trainingId: string) => {
      const token = localStorage.getItem("auth_token");
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API}/training/unarchive/${trainingId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Training unarchived successfully");
      queryClient.invalidateQueries({ queryKey: ["trainings"] });
    },
    onError: (error: any) => {
      toast.error("Error", {
        description: error.response?.data?.message || "Failed to unarchive training"
      });
    }
  });
}
