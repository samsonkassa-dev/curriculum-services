import { BaseItem } from "./training-form"; // Assuming BaseItem is suitable or defined/imported here

export interface Training {
  id: string;
  title: string;
  rationale: string;
  trainingType: BaseItem;
  cities: {
    id: string;
    name: string;
    description: string;
    country: BaseItem;
  }[];
  duration: number;
  durationType: "HOURS" | "DAYS" | "WEEKS" | "MONTHS";
  ageGroups: BaseItem[];
  genderPercentages: {
    gender: "MALE" | "FEMALE";
    percentage: number;
  }[];
  disabilityPercentages?: {
    disability: BaseItem;
    percentage: number;
  }[];
  marginalizedGroupPercentages?: {
    marginalizedGroup: BaseItem;
    percentage: number;
  }[];
  economicBackgrounds: BaseItem[];
  academicQualifications: BaseItem[];
  trainingPurposes: BaseItem[];
  trainingTags?: BaseItem[]; // Added trainingTags as optional array of BaseItem
  companyProfile: {
    id: string;
    name: string;
    // ... other company profile fields
  };
  
  // Additional fields used only in API requests, not in API responses
  cityIds?: string[];
  countryIds?: string[];
  trainingTypeId?: string;
  ageGroupIds?: string[];
  economicBackgroundIds?: string[];
  academicQualificationIds?: string[];
  trainingPurposeIds?: string[];
  
  // Special input formats for percentages
  disabilityPercentagesInput?: Array<{
    disabilityId: string;
    percentage: number;
  }>;
  
  marginalizedGroupPercentagesInput?: Array<{
    marginalizedGroupId: string;
    percentage: number;
  }>;
}
