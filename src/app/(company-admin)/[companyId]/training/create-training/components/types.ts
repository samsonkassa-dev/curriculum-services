/* eslint-disable @typescript-eslint/no-explicit-any */
export interface StepProps {
  onNext: (data: any) => void;
  onBack?: () => void;
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
  };
  isSubmitting?: boolean;
} 