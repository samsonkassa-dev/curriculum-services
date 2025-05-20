import { z } from "zod"

// Schema for assessment form validation
export const catFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  assessmentLevel: z.enum(["TRAINING", "MODULE", "LESSON"], {
    required_error: "Assessment level is required"
  }),
  assessmentTypeId: z.string().min(1, "Assessment type is required"),
  
  // Additional fields for managing parent relationship
  parentId: z.string().optional(),
  moduleId: z.string().optional(),
  lessonId: z.string().optional(),
})

// Extract type from schema
export type CatFormValues = z.infer<typeof catFormSchema>

// Assessment type interface
export interface AssessmentType {
  id: string
  name: string
  description: string
  assessmentSubType: string
}

// Module interface for dropdown selections
export interface Module {
  id: string
  name: string
  description: string
  parentModuleId?: string | null
}

// Lesson interface for dropdown selections
export interface Lesson {
  id: string
  name: string
  description: string
  moduleId: string
} 