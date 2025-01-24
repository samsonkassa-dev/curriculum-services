"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

interface Training {
  id: string;
  title: string;
  cities: {
    id: string;
    name: string;
    description: string;
    country: {
      id: string;
      name: string;
      description: string;
    };
  }[];
  duration: number;
  durationType: "DAYS" | "WEEKS" | "MONTHS";
  ageGroups: {
    id: string;
    name: string;
    range: string;
    description: string;
  }[];
  targetAudienceGenders: ("MALE" | "FEMALE")[];
  economicBackgrounds: {
    id: string;
    name: string;
    description: string;
  }[];
  academicQualifications: {
    id: string;
    name: string;
    description: string;
  }[];
  trainingPurposes: {
    id: string;
    name: string;
    description: string;
  }[];
  companyProfile: {
    id: string;
    name: string;
    taxIdentificationNumber: string;
    businessType: {
      id: string;
      name: string;
      description: string;
    };
    industryType: {
      id: string;
      name: string;
      description: string;
    };
    countryOfIncorporation: string;
    address: string;
    phone: string;
    websiteUrl: string;
    numberOfEmployees: string;
    otherDescription: string;
    logoUrl: string | null;
    verificationStatus: string;
    createdAt: string;
  };
}

interface TrainingsResponse {
  code: string;
  trainings: Training[];
  message: string;
}

export function useTrainings() {
  return useQuery({
    queryKey: ["trainings"],
    queryFn: async () => {
      const token = localStorage.getItem("auth_token");
      const response = await axios.get<TrainingsResponse>(
        `${
          process.env.NEXT_PUBLIC_API || "http://164.90.209.220:8081/api"
        }/training`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
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
