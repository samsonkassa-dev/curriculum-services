export interface IndividualUser {
  id: string;
  fullName: string;
  email: string;
  deactivated: boolean;
  role: Role;
}

export interface Role {
  name: string;
  colorCode: string;
}

export interface BusinessType {
  id: string;
  name: string;
  description: string;
}

export interface IndustryType {
  id: string;
  name: string;
  description: string;
}

export interface CompanyFilesType {
  id: string;
  name: string;
  taxIdentificationNumber: string;
  businessType: {
    id: string;
    name: string;
    description: string;
  };
  industryType: {
    id: string;
    name: string;
    description: string;
  };
  countryOfIncorporation: string;
  address: string;
  phone: string;
  websiteUrl: string;
  numberOfEmployees: string;
  otherDescription: string | null;
  logoUrl: string | null;
  verificationStatus: 'ACCEPTED' | 'PENDING' | 'REJECTED';
  createdAt: string;
  companyFiles?: {
    fileUrl: string;
    companyFileType: {
      id: string;
      name: string;
      description: string;
    };
  }[];
}

export interface TrainingUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  email: string;
  role: Role;
  profilePictureUrl: string | null;
  phoneVerified: boolean;
  emailVerified: boolean;
}

export interface TrainingUsersResponse {
  code: string;
  message: string;
  users: TrainingUser[];
} 

export interface CompanyUsersResponse{
  totalPages: number;
  pageSize: number;
  currentPage: number;
  message: string;
  totalElements: number;
  users:TrainingUser[];
}