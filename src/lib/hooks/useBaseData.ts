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
    case 'learner-style-preference':
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
      const token = localStorage.getItem('auth_token');
      const response = await baseDataApi.getBaseData(type, { 
        Authorization: `Bearer ${token}` 
      });
      return response[responseKey] || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  // Mutation for adding new base data
  const addMutation = useMutation({
    mutationFn: async (data: Omit<BaseDataItem, 'id'>) => {
      const token = localStorage.getItem('auth_token');
      return baseDataApi.addBaseData(
        type,
        { Authorization: `Bearer ${token}` },
        data
      );
    },
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
      const token = localStorage.getItem('auth_token');
      return baseDataApi.updateBaseData(
        type,
        id,
        { Authorization: `Bearer ${token}` },
        data
      );
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
      const token = localStorage.getItem('auth_token');
      return baseDataApi.deleteBaseData(
        type,
        id,
        { Authorization: `Bearer ${token}` }
      );
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