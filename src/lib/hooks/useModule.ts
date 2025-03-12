import { CreateModuleData } from "@/types/module"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import axios from "axios"
import { toast } from "sonner"
import { ModulesResponse } from "@/types/module"

interface ModuleResponse {
  code: string
  message: string
  module: {
    id: string
    name: string
    description: string
    trainingId: string
  }
}

interface ModuleDetailsResponse {
  code: string
  message: string
  module: {
    id: string
    name: string
    description: string
    parentModule: null | {
      id: string
      name: string
      description: string
    }
    childModules: Array<{
      id: string
      name: string
      description: string
    }>
  }
}

// Now ModuleData and Module interfaces are identical

// Hook to create module
export function useCreateModule() {
  const queryClient = useQueryClient();

  return useMutation<ModuleResponse, Error, CreateModuleData>({
    mutationFn: async (data: CreateModuleData) => {
      const token = localStorage.getItem("auth_token");
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
      }
    },
  });
}

// Hook to fetch modules by module ID
export function useModules(moduleId: string) {
  return useQuery<ModuleDetailsResponse>({
    queryKey: ["module-details", moduleId],
    queryFn: async () => {
      const token = localStorage.getItem("auth_token");
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

//hook to fetch module by trainingId
export function useModulesByTrainingId(trainingId: string) {
  return useQuery<ModulesResponse>({
    queryKey: ["modules", trainingId],
    queryFn: async () => {
      const token = localStorage.getItem("auth_token")
      const response = await axios.get<ModulesResponse>(
        `${process.env.NEXT_PUBLIC_API}/module/training/${trainingId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return response.data
    }
  })
}

interface UpdateModuleData {
  moduleId: string;
  data: CreateModuleData;  // Reuse CreateModuleData type
}

export function useUpdateModule() {
  const queryClient = useQueryClient()

  return useMutation<ModuleResponse, Error, UpdateModuleData>({
    mutationFn: async ({ moduleId, data }: UpdateModuleData) => {
      const token = localStorage.getItem('auth_token')
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
      queryClient.invalidateQueries({ 
        queryKey: ['modules', variables.data.trainingId] 
      })
      toast.success('Module updated successfully')
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || 'Failed to update module')
      }
    }
  })
}