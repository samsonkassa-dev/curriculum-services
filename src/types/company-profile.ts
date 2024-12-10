import { z } from "zod"
import type { BasicInformation, BusinessDetails, AdditionalInformation } from "./company"

export const basicInformationSchema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  companyWebsite: z.string().optional(),
  companyAddress: z.string().min(5, "Company address is required"),
  contactPhone: z.string()
    .min(9, "Phone number must be at least 9 digits")
    .max(12, "Phone number must not exceed 12 digits")
    .regex(/^\d+$/, "Phone number must contain only digits"),
  countryOfIncorporation: z.string().min(2, "Country is required"),
  taxIdentificationNumber: z.string().min(5, "Tax ID is required"),
}) satisfies z.ZodType<BasicInformation>

export const businessDetailsSchema = z.object({
  industryType: z.string().min(2, "Industry type is required"),
  businessType: z.string().min(2, "Business type is required"),
  numberOfEmployees: z.string().min(1, "Number of employees is required"),
  registrationNumber: z.string().optional(),
  yearEstablished: z.string().min(4, "Year established is required"),
}) satisfies z.ZodType<BusinessDetails>

export const additionalInformationSchema = z.object({
  companyDescription: z.string().optional(),
  companyLogo: z.any().optional(),
  businessLicense: z.any().optional(),
  otherDocuments: z.array(z.any()).optional(),
}) satisfies z.ZodType<AdditionalInformation>

// Combined schema
export const companyProfileSchema = basicInformationSchema
  .merge(businessDetailsSchema)
  .merge(additionalInformationSchema) 