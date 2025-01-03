/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BaseDataItem, BaseDataType } from '@/types/base-data';
import { toast } from 'sonner';
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API || 'http://164.90.209.220:8081/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to get the response data key based on type
const getResponseKey = (type: BaseDataType) => {
  // Special cases for city and country
  if (type === 'city') return 'cities';
  if (type === 'country') return 'countries';

  // Default case for other types
  return type
    .split('-')
    .map((word, index) => 
      index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join('') + 's';
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
      const response = await api.get(`/${type}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data[responseKey] || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  // Mutation for adding new base data
  const addMutation = useMutation({
    mutationFn: async (data: Omit<BaseDataItem, 'id'>) => {
      const token = localStorage.getItem('auth_token');
      const response = await api.post(`/${type}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
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
      const response = await api.patch(`/${type}/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
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
      const response = await api.delete(`/${type}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
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