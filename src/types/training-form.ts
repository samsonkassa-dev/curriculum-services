import { z } from "zod"

// Step 1: Title & Rationale
export const titleRationaleSchema = z.object({
  title: z.string().min(1, "Title is required"),
  rationale: z.string().min(1, "Rationale is required")
})

export type TitleRationaleFormData = z.infer<typeof titleRationaleSchema>

// Step 2: Location
export const locationSchema = z.object({
  cityIds: z.array(z.string()).min(1, "At least one city is required")
})

export type LocationFormData = z.infer<typeof locationSchema>

// Step 3: Duration and Purpose
export const durationSchema = z.object({
  duration: z.number().min(1, "Duration must be at least 1"),
  durationType: z.enum(["DAYS", "WEEKS", "MONTHS", "HOURS"]),
  trainingTypeId: z.string().min(1, "Training type is required"),
  trainingPurposeIds: z.array(z.string()).min(1, "At least one training purpose is required")
})

export type DurationFormData = z.infer<typeof durationSchema>

// Step 4: Target Audience
export const targetAudienceSchema = z.object({
  ageGroupIds: z.array(z.string()).min(1, "At least one age group is required"),
  genderPercentages: z.array(z.object({
    gender: z.enum(["MALE", "FEMALE"]),
    percentage: z.number().min(0).max(100)
  })).min(1, "Gender percentages are required"),
  disabilityPercentages: z.array(z.object({
    disabilityId: z.string(),
    percentage: z.number().min(0).max(100)
  })).optional(),
  marginalizedGroupPercentages: z.array(z.object({
    marginalizedGroupId: z.string(),
    percentage: z.number().min(0).max(100)
  })).optional(),
  economicBackgroundIds: z.array(z.string()).min(1, "At least one economic background is required"),
  academicQualificationIds: z.array(z.string()).min(1, "At least one academic qualification is required")
})

export type TargetAudienceFormData = z.infer<typeof targetAudienceSchema>

// Step 5: Background & Qualifications
export const backgroundSchema = z.object({
  economicBackgroundIds: z.array(z.string()).min(1, "At least one economic background is required"),
  academicQualificationIds: z.array(z.string()).min(1, "At least one academic qualification is required")
})

export type BackgroundFormData = z.infer<typeof backgroundSchema>

// Step 6: Purpose
export const purposeSchema = z.object({
  trainingPurposeIds: z.array(z.string()).min(1, "At least one training purpose is required")
})

export type PurposeFormData = z.infer<typeof purposeSchema>

// Combined schema for the entire form
export const trainingFormSchema = titleRationaleSchema
  .merge(locationSchema)
  .merge(durationSchema)
  .merge(targetAudienceSchema)
  .merge(backgroundSchema)
  .merge(purposeSchema)

export type TrainingFormData = z.infer<typeof trainingFormSchema> 