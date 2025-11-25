/* eslint-disable @typescript-eslint/no-explicit-any */

export type EvaluationFormType = "PRE" | "MID" | "POST";
export type EvaluationQuestionType = "TEXT" | "RADIO" | "CHECKBOX";

// ============================================================================
// Evaluation Form Builder Interfaces (for editing/creating)
// ============================================================================

export interface EvaluationChoiceForm {
  clientId: string;
  choiceText: string;
  choiceImage?: string;
  choiceImageFile?: File;
  id?: string; // For editing existing choices
  
  // Follow-up question attached to this choice
  hasFollowUp?: boolean;
  followUpQuestion?: EvaluationEntryForm;
}

export interface EvaluationEntryForm {
  clientId: string;
  question: string;
  questionImage?: string;
  questionImageFile?: File;
  questionType: EvaluationQuestionType;
  choices: EvaluationChoiceForm[];
  
  // Follow-up logic
  isFollowUp: boolean;
  parentQuestionClientId?: string;
  triggerChoiceClientIds?: string[];
  parentQuestionId?: string; // Server ID
  triggerChoiceIds?: string[]; // Server ID
  
  // For editing existing entries
  id?: string;
}

export interface EvaluationSectionForm {
  title: string;
  description: string;
  entries: EvaluationEntryForm[];
  id?: string; // For editing existing sections
}

// ============================================================================
// Evaluation API Payloads (for mutations)
// ============================================================================

export interface EvaluationChoice {
  clientId: string;
  choiceText: string;
  choiceImage?: string;
}

export interface EvaluationEntry {
  clientId: string;
  question: string;
  questionImage?: string;
  questionType: EvaluationQuestionType;
  choices: EvaluationChoice[];
  
  // Follow-up logic
  isFollowUp: boolean;
  parentQuestionClientId?: string;
  triggerChoiceClientIds?: string[];
  parentQuestionId?: string; // Server ID
  triggerChoiceIds?: string[]; // Server ID
}

export interface EvaluationSection {
  title: string;
  description: string;
  entries: EvaluationEntry[];
}

export interface CreateEvaluationPayload {
  formType: EvaluationFormType;
  sections: {
    title: string;
    description: string;
    entries: EvaluationEntry[];
  }[];
}

// ============================================================================
// Evaluation GET API Response Interfaces
// ============================================================================

export interface EvaluationChoiceDetail {
  id: string;
  choiceText: string;
  choiceImageUrl?: string | null;
}

export interface EvaluationQuestionDetail {
  id: string;
  questionNumber: number;
  question: string;
  questionType: EvaluationQuestionType;
  questionImageUrl?: string | null;
  choices: EvaluationChoiceDetail[];
  
  // Follow-up logic
  isFollowUp: boolean;
  parentQuestionId?: string;
  triggerChoiceIds?: string[];
}

export interface EvaluationSectionDetail {
  id: string;
  title: string;
  description: string;
  sectionNumber: number;
  questions: EvaluationQuestionDetail[];
}

// API Response Types for fetched data
export interface EvaluationChoice {
  id: string;
  choiceText: string;
  choiceImageUrl: string | null;
  isSelected: boolean;
}

export interface EvaluationQuestion {
  id: string;
  outlineGroup: string | null;
  question: string;
  questionImageUrl: string | null;
  questionType: EvaluationQuestionType;
  choices: EvaluationChoice[];
  isFollowUp: boolean;
  parentQuestionId: string | null;
  triggerChoiceIds: string[];
}

export interface EvaluationSection {
  id: string;
  title: string;
  description: string;
  entryCount: number;
  questions: EvaluationQuestion[];
}

export interface EvaluationDetail {
  id: string;
  formType: EvaluationFormType;
  createdAt: string;
  sectionCount: number;
  sections: EvaluationSection[];
}

export interface EvaluationSummary {
  id: string;
  formType: EvaluationFormType;
  createdAt: string;
  sectionCount: number;
}

// ============================================================================
// API Response Wrappers
// ============================================================================

export interface EvaluationResponse {
  code: string;
  message: string;
  monitoringForm: EvaluationSummary[];
}

export interface EvaluationDetailResponse {
  code: string;
  message: string;
  monitoringForm: EvaluationDetail;
}

export interface EvaluationSectionsResponse {
  code: string;
  message: string;
  sections: EvaluationSection[];
}

export interface EvaluationSectionResponse {
  code: string;
  message: string;
  section: EvaluationSection;
}

export interface ApiErrorResponse {
  message: string;
  [key: string]: unknown;
}

// ============================================================================
// Query Keys
// ============================================================================

export const evaluationQueryKeys = {
  all: ['evaluations'] as const,
  training: (trainingId: string) => ['evaluation', trainingId] as const,
  detail: (evaluationId: string) => ['evaluation-detail', evaluationId] as const,
};

