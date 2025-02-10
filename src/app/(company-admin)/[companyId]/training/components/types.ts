/* eslint-disable @typescript-eslint/no-explicit-any */
export interface StepProps {
  onNext: (data: any) => void;
  onBack?: () => void;
  initialData?: {
    title?: string;
    countryIds?: string[];
    cityIds?: string[];
    duration?: number;
    durationType?: 'DAYS' | 'WEEKS' | 'MONTHS';
    ageGroupIds?: string[];
    economicBackgroundIds?: string[];
    academicQualificationIds?: string[];
    targetAudienceGenders?: string[];
    trainingPurposeIds?: string[];
  };
  isSubmitting?: boolean;
} 