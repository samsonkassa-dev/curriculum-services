export interface Training {
  id: string;
  title: string;
  rationale: string;
  trainingType: {
    id: string;
    name: string;
    description: string;
  };
  cities: {
    id: string;
    name: string;
    description: string;
    country: {
      id: string;
      name: string;
      description: string;
    };
  }[];
  duration: number;
  durationType: string;
  ageGroups: {
    id: string;
    name: string;
    range: string;
    description: string;
  }[];
  genderPercentages: {
    gender: "MALE" | "FEMALE";
    percentage: number;
  }[];
  disabilityPercentages: {
    disability: {
      id: string;
      name: string;
      description: string;
    };
    percentage: number;
  }[];
  marginalizedGroupPercentages: {
    marginalizedGroup: {
      id: string;
      name: string;
      description: string;
    };
    percentage: number;
  }[];
  economicBackgrounds: {
    id: string;
    name: string;
    description: string;
  }[];
  academicQualifications: {
    id: string;
    name: string;
    description: string;
  }[];
  trainingPurposes: {
    id: string;
    name: string;
    description: string;
  }[];
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
