import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { CompanyFilesType } from "@/types/users";
import { getCookie } from "@curriculum-services/auth"
interface CompanyProfilesResponse {
  code: string;
  companyProfiles: CompanyFilesType[];
  totalPages: number;
  message: string;
  totalElements: number;
}

interface SingleCompanyResponse {
  code: string;
  companyProfile: CompanyFilesType;
  message: string;
}

interface UseCompanyProfilesProps {
  page: number;
  pageSize: number;
  searchQuery?: string;
  verificationStatus?: string;
}

export function useCompanyProfiles({
  page,
  pageSize,
  searchQuery,
  verificationStatus,
}: UseCompanyProfilesProps) {
  return useQuery<CompanyProfilesResponse>({
    queryKey: ["company-profiles", page, pageSize, searchQuery, verificationStatus],
    queryFn: async () => {
      try {
        const token = getCookie('token');
        const params = new URLSearchParams({
          page: String(page),
          "page-size": String(pageSize),
          ...(searchQuery && { "search-query": searchQuery }),
          ...(verificationStatus && { "verification-status": verificationStatus }),
        });

        const baseUrl =
          process.env.NEXT_PUBLIC_API;

        const response = await axios.get<CompanyProfilesResponse>(
          `${baseUrl}/company-profile?${params.toString()}`,
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
            error.response?.data?.message || "Failed to fetch company profiles";
          toast.error("Error", { description: message });
        }
        throw error;
      }
    },
    retry: 2,
  });
}

export function useSingleCompanyProfile(id: string) {
  return useQuery<SingleCompanyResponse>({
    queryKey: ["company-profile", id],
    queryFn: async () => {
      try {
        const token = getCookie('token');
        const baseUrl =
          process.env.NEXT_PUBLIC_API;
        const response = await axios.get<SingleCompanyResponse>(
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
          const message =
            error.response?.data?.message || "Failed to fetch company profile";
          toast.error("Error", { description: message });
        }
        throw error;
      }
    },
    enabled: !!id,
  });
}

export function useMyCompanyProfile() {
  return useQuery({
    queryKey: ["my-company-profile"],
    queryFn: async () => {
      try {
        const token = getCookie('token');
        const response = await axios.get<SingleCompanyResponse>(
          `${
            process.env.NEXT_PUBLIC_API
          }/company-profile/me`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        return response.data.companyProfile;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const message =
            error.response?.data?.message ||
            "Failed to fetch your company profile";
          toast.error("Error", { description: message });
        }
        throw error;
      }
    },
    retry: 2,
  });
}
