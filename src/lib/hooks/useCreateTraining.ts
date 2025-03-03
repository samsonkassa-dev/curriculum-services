/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';
import { useBaseData } from './useBaseData';

interface CreateTrainingData {
  title: string;
  cityIds: string[];
  duration: number;
  durationType: 'HOURS' | 'DAYS' | 'WEEKS' | 'MONTHS';
  ageGroupIds: string[];
  targetAudienceGenders: ('MALE' | 'FEMALE' | 'OTHER')[];
  economicBackgroundIds: string[];
  academicQualificationIds: string[];
  trainingPurposeIds: string[];
}

export function useCreateTraining() {
  // Use baseData hook for all required data
  const { data: cities } = useBaseData('city');
  const { data: ageGroups } = useBaseData('age-group');
  const { data: economicBackgrounds } = useBaseData('economic-background');
  const { data: academicQualifications } = useBaseData('academic-qualification');
  const { data: trainingPurposes } = useBaseData('training-purpose');
  const { data: disabilities } = useBaseData('disability');
  const { data: marginalizedGroups } = useBaseData('marginalized-group');
  const { data: trainingTypes } = useBaseData('training-type');

  // Create training mutation
  const createTrainingMutation = useMutation({
    mutationFn: async (data: CreateTrainingData) => {
      const token = localStorage.getItem('auth_token');
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/training`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success('Training created successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create training');
    }
  });

  return {
    cities,
    ageGroups,
    economicBackgrounds,
    academicQualifications,
    trainingPurposes,
    createTraining: createTrainingMutation.mutate,
    isLoading: createTrainingMutation.isPending
  };
} 