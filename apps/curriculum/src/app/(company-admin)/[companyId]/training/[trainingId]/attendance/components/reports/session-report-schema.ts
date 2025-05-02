import { z } from "zod";

// Schema for session report file upload
export const SessionReportFileSchema = z.object({
  reportFileTypeId: z.string(),
  file: z.instanceof(File),
});

// Schema for step 1: Summary of Training Sessions Conducted
export const SummaryOfTrainingSchema = z.object({
  topicsCovered: z.array(z.string().min(1, "Topic is required")),
  significantObservations: z.array(z.string().min(1, "Observation is required")),
});

// Schema for step 2: Learner Feedback and Satisfaction
export const LearnerFeedbackSchema = z.object({
  overallSatisfactionScore: z.number().min(1, "Please provide a satisfaction score"),
  learnerFeedbackSummary: z.string().min(1, "Please provide a summary of learner feedback"),
  positiveFeedback: z.string().min(1, "Please provide positive feedback"),
  areasForImprovement: z.string().min(1, "Please provide areas for improvement"),
  specificFeedbackExamples: z.string().min(1, "Please provide specific feedback examples"),
});

// Schema for step 3: Self-Reflection on Teaching Practices
export const SelfReflectionSchema = z.object({
  teachingMethodEffectiveness: z.number().min(1, "Please rate the effectiveness of teaching methods"),
  trainerStrengths: z.string().min(1, "Please provide trainer strengths"),
  trainerAreasForGrowth: z.string().min(1, "Please provide areas for growth"),
  trainerProfessionalGoals: z.string().min(1, "Please provide professional development goals"),
});

// Schema for step 4: Recommendations for Future Training Sessions
export const RecommendationsSchema = z.object({
  curriculumRecommendations: z.string().min(1, "Please provide curriculum recommendations"),
  deliveryMethodRecommendations: z.string().min(1, "Please provide delivery method recommendations"),
  assessmentRecommendations: z.string().min(1, "Please provide assessment recommendations"),
  learnerSupportRecommendations: z.string().min(1, "Please provide learner support recommendations"),
  otherRecommendations: z.string().optional(),
});

// Schema for step 5: Supporting Documents
export const SupportingDocumentsSchema = z.object({
  sessionReportFiles: z.array(SessionReportFileSchema).optional(),
});

// Combined schema for the complete form
export const SessionReportFormSchema = SummaryOfTrainingSchema
  .merge(LearnerFeedbackSchema)
  .merge(SelfReflectionSchema)
  .merge(RecommendationsSchema)
  .merge(SupportingDocumentsSchema);

// Type for the session report form
export type SessionReportFormValues = z.infer<typeof SessionReportFormSchema>; 