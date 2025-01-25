/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Training } from "@/types/training";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

interface TrainingResponse {
  code: string;
  training: Training;
  message: string;
}

export function useTraining(trainingId: string) {
  return useQuery({
    queryKey: ["training", trainingId],
    queryFn: async () => {
      try {
        const token = localStorage.getItem("auth_token");
        const response = await axios.get<TrainingResponse>(
          `${process.env.NEXT_PUBLIC_API}/training/${trainingId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        return response.data.training;
      } catch (error: any) {
        throw new Error(
          error?.response?.data?.message || "Failed to load training"
        );
      }
    },
    enabled: !!trainingId,
    retry: 1, // Only retry once on failure
  });
}
