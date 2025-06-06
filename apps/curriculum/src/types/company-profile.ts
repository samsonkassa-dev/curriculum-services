import { z } from "zod";

// Define schemas for BusinessType and IndustryType
const businessTypeSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
});

const industryTypeSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
});

// Company File schema
const companyFileSchema = z.object({
  fileTypeId: z.string(),
  file: z.instanceof(File),
});

// Company Information step
export const companyInformationSchema = z.object({
  name: z.string().min(2, "Company name is required"),
  websiteUrl: z.string().optional(),
  address: z.string().min(2, "Company address is required"),
  phone: z
    .string()
    .regex(
      /^[97]\d{8}$/,
      "Phone number must start with 9 or 7 and be followed by 8 digits"
    )
    .transform((val) => (val.startsWith("+251") ? val : `+251${val}`)),
  countryOfIncorporation: z.string().min(2, "Country is required"),
  taxIdentificationNumber: z
    .string()
    .min(10, "Tax ID is required & must be 10 digits"),
});

// Business Details step
export const businessDetailsSchema = z.object({
  industryType: industryTypeSchema.refine((data) => !!data, {
    message: "Industry type is required",
  }),
  businessType: businessTypeSchema.refine((data) => !!data, {
    message: "Business type is required",
  }),
  numberOfEmployees: z.enum(["MICRO", "SMALL", "MEDIUM", "LARGE"], {
    required_error: "Please select number of employees",
  }),
});

// Additional Information step
export const additionalInformationSchema = z.object({
  otherDescription: z.string().optional(),
  companyFiles: z.array(companyFileSchema).optional(),
  accreditation: z.string().min(2, "Accreditation is required"),
  license: z.string().min(2, "License is required")
});

// Combined schema for the entire form
export const companyProfileSchema = companyInformationSchema
  .merge(businessDetailsSchema)
  .merge(additionalInformationSchema);

// Type inference
export type CompanyProfileFormSchema = z.infer<typeof companyProfileSchema>;
