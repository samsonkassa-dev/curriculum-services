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
  trainingTags?: BaseItem[]; // Populated tags in response
  companyProfile: {
    id: string;
    name: string;
    // ... other company profile fields
  };
  
  // Fields used only in API requests, align with backend expectations
  cityIds?: string[];
  countryIds?: string[];
  trainingTypeId?: string;
  trainingTagIds?: string[]; // Added for API request payload
  ageGroupIds?: string[];
  economicBackgroundIds?: string[];
  academicQualificationIds?: string[];
  trainingPurposeIds?: string[];
  
  // Special input formats for percentages in requests
  disabilityPercentagesInput?: Array<{ disabilityId: string; percentage: number; }>;
  marginalizedGroupPercentagesInput?: Array<{ marginalizedGroupId: string; percentage: number; }>;
}
