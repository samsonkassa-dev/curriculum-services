/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { baseDataApi } from '../services/api-service';
import { BaseDataItem, BaseDataType } from '@/types/base-data';
import { toast } from 'sonner';

// Helper to get the response data key based on type
const getResponseKey = (type: BaseDataType) => {
  switch (type) {
    case 'education-level':
      return 'educationLevels';
    case 'academic-level':
      return 'academicLevels';
    case 'learning-style':
      return 'learningStyles';
    // Add other cases following the same pattern
    default:
      return type + 's'; // fallback pattern
  }
};

export function useBaseData(type: BaseDataType) {
  const queryClient = useQueryClient();
  const queryKey = ['base-data', type];
  const responseKey = getResponseKey(type);

  // Query for fetching base data
  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await baseDataApi.getBaseData(type);
      return response[responseKey] || []; // Extract the correct array from response
    },
    staleTime: 1000 * 60 * 5,
  });

  // Mutation for adding new base data
  const addMutation = useMutation({
    mutationFn: (data: Omit<BaseDataItem, 'id'>) => 
      baseDataApi.addBaseData(type, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success('Data added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add data');
      console.error('Add error:', error);
    },
  });

  // Mutation for updating base data
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<BaseDataItem> }) => {
      const response = await baseDataApi.updateBaseData(type, id, data);
      return response;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey });
      toast.success(response.message || 'Data updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update data');
    },
  });

  // Mutation for deleting base data
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await baseDataApi.deleteBaseData(type, id);
      return response;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey });
      toast.success(response.message || 'Data deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete data');
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    add: addMutation,
    update: updateMutation.mutate,
    remove: deleteMutation.mutate,
    isAddLoading: addMutation.isPending,
    isUpdateLoading: updateMutation.isPending,
    isDeleteLoading: deleteMutation.isPending,
  };
} 