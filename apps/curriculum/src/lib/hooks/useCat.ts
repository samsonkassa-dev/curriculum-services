import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { getCookie } from "@curriculum-services/auth";
import { Lesson } from "./useLesson";
// Types for the API
interface Assessment {
  id: string;
  name: string;
  description: string;
  assessmentLevel: 'TRAINING';
  assessmentType: {
    id: string;
    name: string;
    description: string;
    assessmentSubType: string;
  };
  trainingTitle: string;
  moduleName: string | null;
  lessonName: string | null;
}

interface Module{
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

// Type for detailed assessment with training information
interface DetailedAssessment {
  id: string;
  name: string;
  description: string;
  assessmentLevel: 'TRAINING' | 'MODULE' | 'LESSON';
  assessmentType: {
    id: string;
    name: string;
    description: string;
    assessmentSubType: string;
  };
  training: {
    id: string;
    title: string;
    rationale: string;
    cities: Array<{
      id: string;
      name: string;
      description: string;
      country: {
        id: string;
        name: string;
        description: string;
      };
    }>;
    totalParticipants: number | null;
    deliveryMethod: string | null;
    duration: number;
    durationType: string;
    ageGroups: Array<{
      id: string;
      name: string;
      range: string;
      description: string;
    }>;
    genderPercentages: Array<{
      gender: string;
      percentage: number;
    }>;
    trainingTags: Array<{
      id: string;
      name: string;
      description: string;
    }>;
  };
  module: Module | null; // Could be more specific if needed
  lesson: Lesson | null; // Could be more specific if needed
}

interface DetailedAssessmentResponse {
  assessment: DetailedAssessment;
  code: string;
  message: string;
}

interface AssessmentResponse {
  assessments: Assessment[];
  code: string;
  message: string;
}

interface CreateAssessmentPayload {
  name: string;
  description: string;
  assessmentTypeId: string;
  assessmentLevel: 'TRAINING' | 'MODULE' | 'LESSON';
  parentId: string;
}

interface UpdateAssessmentPayload {
  name?: string;
  description?: string;
  assessmentTypeId?: string;
  assessmentLevel?: 'TRAINING' | 'MODULE' | 'LESSON';
  parentId?: string;
}

// Define query keys
const assessmentQueryKey = "assessments";
const singleAssessmentQueryKey = "assessment";

/**
 * Hook for creating a new assessment
 */
export function useCreateAssessment() {
  const queryClient = useQueryClient();

  const createAssessmentMutation = useMutation({
    mutationFn: async (assessmentData: CreateAssessmentPayload) => {
      const token = getCookie("token");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/assessment`,
        assessmentData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [assessmentQueryKey] });
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create assessment';
      console.log(errorMessage);
    },
  });

  return {
    createAssessment: createAssessmentMutation.mutateAsync,
    isLoading: createAssessmentMutation.isPending,
    isSuccess: createAssessmentMutation.isSuccess,
    isError: createAssessmentMutation.isError,
    error: createAssessmentMutation.error,
  };
}

/**
 * Hook for updating an existing assessment
 */
export function useUpdateAssessment() {
  const queryClient = useQueryClient();

  const updateAssessmentMutation = useMutation({
    mutationFn: async ({ 
      assessmentId, 
      assessmentData 
    }: { 
      assessmentId: string; 
      assessmentData: UpdateAssessmentPayload 
    }) => {
      const token = getCookie("token");
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API}/assessment/${assessmentId}`,
        assessmentData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate queries for all assessments and the specific assessment
      queryClient.invalidateQueries({ queryKey: [assessmentQueryKey] });
      queryClient.invalidateQueries({ queryKey: [singleAssessmentQueryKey, variables.assessmentId] });
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update assessment';
      console.log(errorMessage);
    },
  });

  return {
    updateAssessment: updateAssessmentMutation.mutateAsync,
    isLoading: updateAssessmentMutation.isPending,
    isSuccess: updateAssessmentMutation.isSuccess,
    isError: updateAssessmentMutation.isError,
    error: updateAssessmentMutation.error,
  };
}

/**
 * Hook for deleting an assessment
 */
export function useDeleteAssessment() {
  const queryClient = useQueryClient();

  const deleteAssessmentMutation = useMutation({
    mutationFn: async (assessmentId: string) => {
      const token = getCookie("token");
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API}/assessment/${assessmentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return { data: response.data, assessmentId };
    },
    onSuccess: ({ data, assessmentId }) => {
      // Remove the deleted assessment from the cache and invalidate the list
      queryClient.invalidateQueries({ queryKey: [assessmentQueryKey] });
     
      queryClient.removeQueries({ queryKey: [singleAssessmentQueryKey, assessmentId] });
    },
    onError: (error: unknown) => {
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete assessment';
      console.log(errorMessage);
    },
  });

  return {
    deleteAssessment: deleteAssessmentMutation.mutateAsync,
    isLoading: deleteAssessmentMutation.isPending,
    isSuccess: deleteAssessmentMutation.isSuccess,
    isError: deleteAssessmentMutation.isError,
    error: deleteAssessmentMutation.error,
  };
}

/**
 * Hook to fetch training assessments
 */
export function useTrainingAssessments(trainingId: string, page: number = 1, pageSize: number = 10) {
  // Ensure valid values
  const validPageSize = Math.max(1, pageSize);
  const validPage = Math.max(1, page);
  
  return useQuery({
    queryKey: [assessmentQueryKey, trainingId, validPage, validPageSize],
    queryFn: async () => {
      let retries = 0;
      const maxRetries = 2;
      
      while (true) {
        try {
          const token = getCookie("token");
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API}/assessment/training/${trainingId}`, 
            {
              params: {
                page: validPage,
                'page-size': validPageSize,
              },
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          return response.data as AssessmentResponse;
        } catch (error: unknown) {
          // If we haven't exceeded max retries, try again
          if (retries < maxRetries) {
            retries++;
            // Add delay of 1 second between retries
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }
          
          // If we've exceeded max retries, handle the error
          const errorMessage = error instanceof Error ? error.message : 'An error occurred';
          throw new Error(`Failed after ${maxRetries + 1} attempts: ${errorMessage}`);
        }
      }
    },
  });
}

/**
 * Hook to fetch a specific assessment by ID
 */
export function useAssessment(assessmentId: string) {
  return useQuery({
    queryKey: [singleAssessmentQueryKey, assessmentId],
    queryFn: async () => {
      if (!assessmentId) {
        throw new Error("Assessment ID is required");
      }

      let retries = 0;
      const maxRetries = 2;
      
      while (true) {
        try {
          const token = getCookie("token");
          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API}/assessment/${assessmentId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          return response.data as DetailedAssessmentResponse;
        } catch (error: unknown) {
          // If we haven't exceeded max retries, try again
          if (retries < maxRetries) {
            retries++;
            // Add delay of 1 second between retries
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }
          
          // If we've exceeded max retries, handle the error
          const errorMessage = error instanceof Error ? error.message : 'An error occurred';
          throw new Error(`Failed after ${maxRetries + 1} attempts: ${errorMessage}`);
        }
      }
    },
    enabled: !!assessmentId, // Only run query if assessmentId is provided
  });
}

/**
 * Main Cat hook that provides access to all assessment-related hooks
 */
export const useCat = () => {
  const createAssessmentMutation = useCreateAssessment();
  const updateAssessmentMutation = useUpdateAssessment();
  const deleteAssessmentMutation = useDeleteAssessment();
  
  return {
    // From create assessment
    createAssessment: createAssessmentMutation.createAssessment,
    isCreateLoading: createAssessmentMutation.isLoading,
    isCreateSuccess: createAssessmentMutation.isSuccess,
    isCreateError: createAssessmentMutation.isError,
    createError: createAssessmentMutation.error,
    
    // Update assessment
    updateAssessment: updateAssessmentMutation.updateAssessment,
    isUpdateLoading: updateAssessmentMutation.isLoading,
    isUpdateSuccess: updateAssessmentMutation.isSuccess,
    isUpdateError: updateAssessmentMutation.isError,
    updateError: updateAssessmentMutation.error,
    
    // Delete assessment
    deleteAssessment: deleteAssessmentMutation.deleteAssessment,
    isDeleteLoading: deleteAssessmentMutation.isLoading,
    isDeleteSuccess: deleteAssessmentMutation.isSuccess,
    isDeleteError: deleteAssessmentMutation.isError,
    deleteError: deleteAssessmentMutation.error,
    
    // For getting training assessments, return the hook itself
    useTrainingAssessments,
    
    // For getting a specific assessment by ID
    useAssessment,
  };
};

export default useCat;
