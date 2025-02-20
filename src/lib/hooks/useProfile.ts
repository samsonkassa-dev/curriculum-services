/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"
import { setProfilePicture } from "@/lib/utils/profile"

interface EditProfileData {
  firstName: string
  lastName: string
  email?: string
  phoneNumber: string | null
}

interface UploadImageResponse {
  code: string
  message: string
  user: {
    profilePictureUrl: string
  }
}

interface EditProfileResponse {
  code: string
  message: string
}

interface UserRole {
  name: string
  colorCode: string
}

interface User {
  id: string
  firstName: string
  lastName: string
  phoneNumber: string | null
  email: string
  role: UserRole
  profilePictureUrl: string
  emailVerified: boolean
  phoneVerified: boolean
}

interface ProfileResponse {
  code: string
  message: string
  user: User
}

interface ChangePasswordData {
  oldPassword: string;
  newPassword: string;
}

export function useProfile() {
  const queryClient = useQueryClient();

  const profile = useQuery({
    queryKey: ['user-profile'],
    queryFn: async (): Promise<User | null> => {
      if (typeof window === 'undefined') return null;
      const token = localStorage.getItem("auth_token");
      if (!token) throw new Error('No auth token found');
      
      const response = await axios.get<ProfileResponse>(
        `${process.env.NEXT_PUBLIC_API}/user/me`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data.user;
    },
    enabled: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    gcTime: 30 * 60 * 1000,
  });

  // Profile Picture Upload Mutation
  const uploadProfilePicture = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("profile-picture", file);

      const token = localStorage.getItem("auth_token");
      const response = await axios.patch<UploadImageResponse>(
        `${process.env.NEXT_PUBLIC_API}/user/upload-profile-picture`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data.user.profilePictureUrl;
    },
    onSuccess: (url) => {
      setProfilePicture(url);
      queryClient.setQueryData(["user-profile"], (old: any) => ({
        ...old,
        profilePictureUrl: url,
      }));
      toast.success("Profile picture updated successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to update profile picture", {
        description: error?.response?.data?.message || "Please try again",
      });
    },
  });

  // Edit Profile Mutation
  const editProfile = useMutation({
    mutationFn: async (data: EditProfileData) => {
      const token = localStorage.getItem("auth_token");
      const response = await axios.patch<EditProfileResponse>(
        `${process.env.NEXT_PUBLIC_API}/user/edit-profile`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      toast.success("Profile updated successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to update profile", {
        description: error?.response?.data?.message || "Please try again",
      });
    },
  });

  // Deactivate User Mutation
  const DeactivateUser = useMutation({
    mutationFn: async (userId: string) => {
      const token = localStorage.getItem("auth_token");
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API}/user/deactivate-user/${userId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-admins"] });
      toast.success("User deactivated successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to deactivate user", {
        description: error?.response?.data?.message || "Please try again",
      });
    },
  });
  
  // Activate User Mutation 
  const ActivateUser = useMutation({
    mutationFn: async (userId: string) => {
      const token = localStorage.getItem("auth_token");
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API}/user/activate-user/${userId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-admins"] });
      toast.success("User activated successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to activate user", {
        description: error?.response?.data?.message || "Please try again",
      });
    },
  });

  // Change Password Mutation
  const changePassword = useMutation({
    mutationFn: async (data: ChangePasswordData) => {
      const token = localStorage.getItem("auth_token");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/user/change-password`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Password changed successfully");
    },
    onError: (error: any) => {
      toast.error("Failed to change password", {
        description: error?.response?.data?.message || "Please try again",
      });
    },
  });

  return {
    profile,
    uploadProfilePicture,
    editProfile,
    DeactivateUser,
    ActivateUser,
    changePassword
  };
} 