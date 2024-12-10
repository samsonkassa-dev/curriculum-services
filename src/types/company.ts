// Basic Information step
export interface BasicInformation {
  companyName: string
  companyWebsite?: string
  companyAddress: string
  contactPhone: string
  countryOfIncorporation: string
  taxIdentificationNumber: string
}

// Business Details step
export interface BusinessDetails {
  industryType: string
  businessType: string
  numberOfEmployees: string
  registrationNumber?: string
  yearEstablished: string
}

// Additional Information step
export interface AdditionalInformation {
  companyDescription?: string
  companyLogo?: File
  businessLicense?: File
  otherDocuments?: File[]
}

// Combined type for the full form
export interface CompanyProfileFormData extends 
  BasicInformation,
  BusinessDetails,
  AdditionalInformation {} 