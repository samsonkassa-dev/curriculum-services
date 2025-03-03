"use client"

/* eslint-disable @typescript-eslint/no-explicit-any */
import { BusinessType, CompanyFileUpload, CompanyProfileFormData, IndustryType } from "@/types/company";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

interface ApiResponse {
  code: string;
  message: string;
  companyProfile: {
    id: string;
    verificationStatus: "PENDING" | "ACCEPTED" | "REJECTED";
  };
}

interface CreateCompanyProfileData {
  data: CompanyProfileFormData;
}

interface UpdateCompanyProfileData {
  id: string;
  data: Partial<CompanyProfileFormData>;
}

// Add type guards
function isBusinessType(value: unknown): value is BusinessType {
  return typeof value === "object" && value !== null && "id" in value
}

function isIndustryType(value: unknown): value is IndustryType {
  return typeof value === "object" && value !== null && "id" in value
}

function isCompanyFileUpload(value: unknown): value is CompanyFileUpload[] {
  return Array.isArray(value) && value.every(item => 
    typeof item === "object" && 
    item !== null && 
    "fileTypeId" in item && 
    "file" in item
  )
}

function formatPhoneNumber(phone: string): string {
  // Remove any existing +251 prefix
  const cleanPhone = phone.replace(/^\+251/, '')
  // Add the prefix
  return `+251${cleanPhone}`
}

export function useCompanyProfile() {
  const queryClient = useQueryClient();
  const baseUrl = process.env.NEXT_PUBLIC_API;

  const createMutation = useMutation<ApiResponse, Error, CreateCompanyProfileData>({
    mutationFn: async ({ data }) => {
      const token = localStorage.getItem("auth_token");
      const formData = new FormData();

      try {
        // Transform data to API format and append each field
        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (key === "businessType" && isBusinessType(value)) {
              formData.append("businessTypeId", value.id);
            } else if (key === "industryType" && isIndustryType(value)) {
              formData.append("industryTypeId", value.id);
            } else if (key === "companyFiles" && isCompanyFileUpload(value)) {
              value.forEach((fileData) => {
                formData.append(fileData.fileTypeId, fileData.file);
              });
            } else if (key === "phone") {
              formData.append(key, formatPhoneNumber(value.toString()));
            } else {
              formData.append(key, value.toString());
            }
          }
        });

        const response = await axios.post<ApiResponse>(
          `${baseUrl}/company-profile`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const message = error.response?.data?.message || "Failed to create company profile";
          // Don't show toast here since we handle it in onError
          throw new Error(message);
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      toast.success("Success", { description: data.message });
      queryClient.invalidateQueries({ queryKey: ["company-profiles"] });
      queryClient.invalidateQueries({ queryKey: ["my-company-profile"] });
    },
    onError: (error) => {
      toast.error("Error", {
        description: error.message || "Failed to create company profile"
      });
    }
  });

  const updateMutation = useMutation<ApiResponse, Error, UpdateCompanyProfileData>({
    mutationFn: async ({ id, data }) => {
      const token = localStorage.getItem("auth_token");
      const formData = new FormData();

      try {
        // Append each field to formData
        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (key === "businessType" && isBusinessType(value)) {
              formData.append("businessTypeId", value.id);
            } else if (key === "industryType" && isIndustryType(value)) {
              formData.append("industryTypeId", value.id);
            } else if (key === "companyFiles" && isCompanyFileUpload(value)) {
              value.forEach((fileData) => {
                formData.append(fileData.fileTypeId, fileData.file);
              });
            } else if (key === "phone") {
              formData.append(key, formatPhoneNumber(value.toString()));
            } else {
              formData.append(key, value.toString());
            }
          }
        });

        const response = await axios.put<ApiResponse>(
          `${baseUrl}/company-profile/edit/${id}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const message = error.response?.data?.message || "Failed to update company profile";
          // Don't show toast here since we handle it in onError
          throw new Error(message);
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      toast.success("Success", { description: data.message });
      queryClient.invalidateQueries({ queryKey: ["company-profiles"] });
      queryClient.invalidateQueries({ queryKey: ["my-company-profile"] });
    },
    onError: (error) => {
      toast.error("Error", {
        description: error.message || "Failed to update company profile"
      });
    }
  });

  const deleteMutation = useMutation<ApiResponse, Error, string>({
    mutationFn: async (id) => {
      try {
        const token = localStorage.getItem("auth_token");
        const response = await axios.delete<ApiResponse>(
          `${baseUrl}/company-profile/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const message = error.response?.data?.message || "Failed to delete company profile";
          toast.error("Error", { description: message });
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      toast.success("Success", { description: data.message });
      queryClient.invalidateQueries({ queryKey: ["company-profiles"] });
    },
    onError: (error) => {
      toast.error("Error", {
        description: error.message || "Failed to delete company profile"
      });
    }
  });

  return {
    createCompanyProfile: createMutation.mutate,
    updateCompanyProfile: updateMutation.mutate,
    deleteCompanyProfile: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending
  };
}
