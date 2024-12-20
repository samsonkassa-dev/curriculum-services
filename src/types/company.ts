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

interface BaseApiResponse {
  code: string;
  message: string;
}

export interface BusinessTypesResponse extends BaseApiResponse {
  businessTypes: BusinessType[];
}

export interface IndustryTypesResponse extends BaseApiResponse {
  industryTypes: IndustryType[];
}

export interface CompanyProfile {
  name: string;
  taxIdentificationNumber: string;
  businessTypeId: string;
  industryTypeId: string;
  countryOfIncorporation: string;
  address: string;
  phone: string;
  websiteUrl?: string;
  numberOfEmployees: 'SMALL' | 'MEDIUM' | 'LARGE';
  otherDescription?: string;
}

export interface CompanyFileType {
  id: string;
  name: string;
  description: string;
}

export interface CompanyFileTypesResponse extends BaseApiResponse {
  companyFileTypes: CompanyFileType[];
}

export interface CompanyFile {
  fileTypeId: string;
  fileName?: string;
  fileUrl?: string;
}

export interface CompanyProfileFormData {
  name: string;
  taxIdentificationNumber: string;
  businessType: BusinessType;
  industryType: IndustryType;
  countryOfIncorporation: string;
  address: string;
  phone: string;
  websiteUrl?: string;
  numberOfEmployees: 'SMALL' | 'MEDIUM' | 'LARGE';
  otherDescription?: string;
  companyFiles?: CompanyFileUpload[];
  fileType?: string;
}

// Client-side only interface
export interface CompanyFileUpload {
  fileTypeId: string;
  file: File;
}

// Helper function to transform form data to API format
export function transformToApiFormat(data: CompanyProfileFormData) {
  if (!data.businessType || !data.industryType) {
    throw new Error("Business type and industry type are required")
  }

  return {
    name: data.name,
    taxIdentificationNumber: data.taxIdentificationNumber,
    businessTypeId: data.businessType.id,
    industryTypeId: data.industryType.id,
    countryOfIncorporation: data.countryOfIncorporation,
    address: data.address,
    phone: data.phone,
    websiteUrl: data.websiteUrl,
    numberOfEmployees: data.numberOfEmployees,
    otherDescription: data.otherDescription
  }
}

export interface CompanyProfileResponse {
  code: string;
  companyProfile: {
    id: string;
    verificationStatus: 'PENDING' | 'ACCEPTED' | 'REJECTED';
    // ... other fields
  };
  message: string;
}

// Add this to store company info in context/state
export interface CompanyInfo {
  id: string;
  verificationStatus: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}