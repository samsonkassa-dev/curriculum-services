export interface Training {
  id: string;
  title: string;
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
  targetAudienceGenders: ("MALE" | "FEMALE")[];
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
}
