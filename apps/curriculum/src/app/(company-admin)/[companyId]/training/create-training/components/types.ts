/* eslint-disable @typescript-eslint/no-explicit-any */
export interface StepProps {
  onNext: (data: any) => void;
  onBack?: () => void;
  onCancel?: () => void;
  initialData?: {
    title?: string;
    rationale?: string;
    countryIds?: string[];
    cityIds?: string[];
    duration?: number;
    durationType?: 'DAYS' | 'WEEKS' | 'MONTHS' | 'HOURS';
    trainingTypeId?: string;
    trainingPurposeIds?: string[];
    ageGroupIds?: string[];
    genderPercentages?: Array<{
      gender: "MALE" | "FEMALE";
      percentage: number;
    }>;
    disabilityPercentages?: Array<{
      disabilityId: string;
      percentage: number;
    }>;
    marginalizedGroupPercentages?: Array<{
      marginalizedGroupId: string;
      percentage: number;
    }>;
    economicBackgroundIds?: string[];
    academicQualificationIds?: string[];
    // Preloaded reference data to avoid unnecessary API calls
    preloadedTrainingType?: any;
    preloadedTrainingTypes?: any[];
    preloadedTrainingPurposes?: any[];
    preloadedCountries?: any[];
    preloadedCities?: any[];
    preloadedAgeGroups?: any[];
    preloadedDisabilities?: any[];
    preloadedMarginalizedGroups?: any[];
    preloadedEconomicBackgrounds?: any[];
    preloadedAcademicQualifications?: any[];
  };
  isSubmitting?: boolean;
  isEditing?: boolean;
} 