import { CreateModuleData } from "@/types/module"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"
import { ModulesResponse } from "@/types/module"
import { getCookie } from "@curriculum-services/auth"

interface ModuleResponse {
  code: string
  message: string
  module: {
    id: string
    name: string
    description: string
    trainingId: string
    trainingTagId: string
  }
}

interface ModuleDetailsResponse {
  code: string
  message: string
  module: {
    id: string
    name: string
    description: string
    trainingTag: {
      id: string
      name: string
      description: string
    } | null
    parentModule: null | {
      id: string
      name: string
      description: string
      trainingTag: {
        id: string
        name: string
        description: string
      } | null
    }
    childModules: Array<{
      id: string
      name: string
      description: string
      trainingTag: {
        id: string
        name: string
        description: string
      } | null
    }>
  }
}

// Now ModuleData and Module interfaces are identical

// Hook to create module
export function useCreateModule() {
  const queryClient = useQueryClient();

  return useMutation<ModuleResponse, Error, CreateModuleData>({
    mutationFn: async (data: CreateModuleData) => {
      const token = getCookie('token');
      const response = await axios.post<ModuleResponse>(
        `${process.env.NEXT_PUBLIC_API}/module`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate the training modules query
      queryClient.invalidateQueries({
        queryKey: ["modules", variables.trainingId],
      });
      
      // If this is a sub-module creation (moduleId exists), invalidate the parent module details
      if (variables.moduleId) {
        queryClient.invalidateQueries({
          queryKey: ["module-details", variables.moduleId],
        });
      }
      
      toast.success("Module created successfully");
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to create module");
      } else {
        toast.error("An unexpected error occurred");
      }
    },
  });
}

// Hook to fetch modules by module ID
export function useModules(moduleId: string) {
  return useQuery<ModuleDetailsResponse>({
    queryKey: ["module-details", moduleId],
    queryFn: async () => {
      const token = getCookie('token');
      const response = await axios.get<ModuleDetailsResponse>(
        `${process.env.NEXT_PUBLIC_API}/module/${moduleId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    },
    enabled: !!moduleId,
  });
}

export function useModulesByTrainingId(trainingId: string, includeAll: boolean = false) {
  return useQuery<ModulesResponse>({
    queryKey: ["modules", trainingId, includeAll],
    queryFn: async () => {
      const token = getCookie('token')
      const response = await axios.get<ModulesResponse>(
        `${process.env.NEXT_PUBLIC_API}/module/training/${trainingId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { 'include-all': includeAll }
        }
      )
      return response.data
    }
  })
}

interface UpdateModuleData {
  moduleId: string;
  data: {
    name: string;
    description: string;
    trainingTagId: string;
  };
  trainingId: string;
}

export function useUpdateModule() {
  const queryClient = useQueryClient()

  return useMutation<ModuleResponse, Error, UpdateModuleData>({
    mutationFn: async ({ moduleId, data, trainingId }: UpdateModuleData) => {
      const token = getCookie('token')
      const response = await axios.patch<ModuleResponse>(
        `${process.env.NEXT_PUBLIC_API}/module/${moduleId}`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return response.data
    },
    onSuccess: (_, variables) => {
      // Invalidate both the modules list and the specific module details
      queryClient.invalidateQueries({ 
        queryKey: ['modules', variables.trainingId] 
      })
      queryClient.invalidateQueries({ 
        queryKey: ['module-details', variables.moduleId] 
      })
      toast.success('Module updated successfully')
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Failed to update module')
      } else {
         toast.error("An unexpected error occurred");
      }
    }
  })
}

interface DeleteModuleData {
  moduleId: string;
  trainingId: string; // Include trainingId to invalidate the modules list
}

export function useDeleteModule() {
  const queryClient = useQueryClient()

  return useMutation<ModuleResponse, Error, DeleteModuleData>({
    mutationFn: async ({ moduleId }: DeleteModuleData) => {
      const token = getCookie('token')
      const response = await axios.delete<ModuleResponse>(
        `${process.env.NEXT_PUBLIC_API}/module/${moduleId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return response.data
    },
    onSuccess: (_, variables) => {
      // Invalidate both the modules list and the specific module details
      queryClient.invalidateQueries({ 
        queryKey: ['modules', variables.trainingId] 
      })
      queryClient.invalidateQueries({ 
        queryKey: ['module-details', variables.moduleId] 
      })
      toast.success('Module deleted successfully')
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Failed to delete module')
      } else {
        toast.error("An unexpected error occurred")
      }
    }
  })
}