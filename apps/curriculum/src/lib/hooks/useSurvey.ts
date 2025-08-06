import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { getCookie } from "@curriculum-services/auth";
import { toast } from "sonner";

// Define error interface for API responses
interface ApiErrorResponse {
  message?: string;
}

// Define types based on the new API structure
export type QuestionType = 'TEXT' | 'RADIO' | 'CHECKBOX' | 'GRID';
export type SurveyType = 'BASELINE' | 'ENDLINE' | 'OTHER';

// For GET API - viewing survey details
export interface SurveyEntry {
  id?: string; // Optional for creation, required for existing entries
  question: string;
  questionType: QuestionType;
  choices: string[];
  allowMultipleAnswers: boolean;
  allowOtherAnswer: boolean;
  rows: string[];
  required: boolean;
  answer?: string | null; // For trainee responses
}

// For POST API - creating surveys (sections.surveyEntries)
export interface CreateSurveyEntry {
  question: string;
  questionType: QuestionType;
  choices: string[];
  allowTextAnswer: boolean;
  rows: string[];
  required: boolean;
}

// For PATCH API - updating individual questions
export interface UpdateSurveyEntryData {
  question: string;
  questionType: QuestionType;
  isRequired: boolean;
  choices: string[];
  allowOtherAnswer: boolean;
  rows: string[];
}

// For POST API - adding new questions to section
export interface AddSurveyEntryData {
  question: string;
  questionType: QuestionType;
  choices: string[];
  allowTextAnswer: boolean;
  rows: string[];
  required: boolean;
}

// For GET API - viewing survey details (sections.questions)
export interface SurveySection {
  id?: string; // Optional for creation
  title: string;
  questions: SurveyEntry[];
}

// For POST API - creating surveys (sections.surveyEntries)
export interface CreateSurveySection {
  title: string;
  surveyEntries: CreateSurveyEntry[];
}

export interface Survey {
  id: string;
  name: string;
  type: SurveyType | null;
  description: string;
  sectionCount: number;
}

export interface SurveyDetail {
  id: string;
  name: string;
  type: SurveyType | null;
  description: string;
  sections: SurveySection[];
  sessions: null;
}



export interface SurveysResponse {
  code: string;
  surveys: Survey[];
  message: string;
}

export interface SurveyDetailResponse {
  code: string;
  survey: SurveyDetail;
  message: string;
}

export interface CreateSurveyData {
  name: string;
  type: SurveyType;
  description: string;
  sections: CreateSurveySection[];
}

export interface UpdateSurveyData {
  name: string;
  type: SurveyType;
  description: string;
}

export interface SubmitAnswerData {
  answer: string;
  traineeId: string;
}

// Interface for survey sections response from GET /api/survey-section/survey/{surveyId}
export interface SurveySectionsResponse {
  code: string;
  message: string;
  sections: SurveySection[];
}

// Interface for adding a section with questions
export interface AddSectionData {
  title: string;
  surveyEntries: CreateSurveyEntry[];
}



// Define query keys
const surveyQueryKeys = {
  all: ['surveys'] as const,
  training: (trainingId: string) => ['surveys', 'training', trainingId] as const,
  detail: (surveyId: string, traineeId?: string) => ['surveys', 'detail', surveyId, traineeId] as const,
  session: (sessionId: string) => ['surveys', 'session', sessionId] as const,
  sections: (surveyId: string) => ['surveys', 'sections', surveyId] as const,
};

/**
 * Hook to fetch all surveys for a training
 */
export function useSurveys(trainingId: string) {
  return useQuery({
    queryKey: surveyQueryKeys.training(trainingId),
    queryFn: async () => {
      try {
        const token = getCookie("token");
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API}/survey/training/${trainingId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        return response.data as SurveysResponse;
      } catch (error: unknown) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        throw new Error(axiosError?.response?.data?.message || "Failed to load surveys");
      }
    },
  });
}

/**
 * Hook to fetch survey details including all questions
 */
export function useSurveyDetail(surveyId: string, traineeId?: string) {
  return useQuery({
    queryKey: surveyQueryKeys.detail(surveyId, traineeId),
    queryFn: async () => {
      try {
        const token = getCookie("token");
        let url = `${process.env.NEXT_PUBLIC_API}/survey/${surveyId}`;
        if (traineeId) {
          url += `?traineeId=${traineeId}`;
        }
        
        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data as SurveyDetailResponse;
      } catch (error: unknown) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        throw new Error(axiosError?.response?.data?.message || "Failed to load survey details");
      }
    },
    enabled: !!surveyId,
  });
}

/**
 * Hook to fetch surveys by session
 */
export function useSurveysBySession(sessionId: string) {
  return useQuery({
    queryKey: surveyQueryKeys.session(sessionId),
    queryFn: async () => {
      try {
        const token = getCookie("token");
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API}/survey/session/${sessionId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        return response.data;
      } catch (error: unknown) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        throw new Error(axiosError?.response?.data?.message || "Failed to load session surveys");
      }
    },
    enabled: !!sessionId,
  });
}

/**
 * Hook for creating a new survey with sections and questions
 */
export function useCreateSurvey(trainingId: string) {
  const queryClient = useQueryClient();

  const createSurveyMutation = useMutation({
    mutationFn: async (surveyData: CreateSurveyData) => {
      const token = getCookie("token");
      // Using the new API endpoint structure from the documentation
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/survey/training/${trainingId}`,
        surveyData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Survey created successfully");
      queryClient.invalidateQueries({ queryKey: surveyQueryKeys.training(trainingId) });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error(error.response?.data?.message || "Failed to create survey");
    },
  });

  return {
    createSurvey: createSurveyMutation.mutate,
    isLoading: createSurveyMutation.isPending,
    isSuccess: createSurveyMutation.isSuccess,
    isError: createSurveyMutation.isError,
    error: createSurveyMutation.error,
  };
}

/**
 * Hook for updating survey name and description only
 */
export function useUpdateSurvey() {
  const queryClient = useQueryClient();

  const updateSurveyMutation = useMutation({
    mutationFn: async ({ surveyId, data }: { surveyId: string; data: UpdateSurveyData }) => {
      const token = getCookie("token");
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API}/survey/${surveyId}`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return { responseData: response.data, surveyId };
    },
    onSuccess: ({ responseData, surveyId }) => {
      toast.success(responseData.message || "Survey updated successfully");
      queryClient.invalidateQueries({ queryKey: surveyQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: surveyQueryKeys.detail(surveyId) });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error(error.response?.data?.message || "Failed to update survey");
    },
  });

  return {
    updateSurvey: updateSurveyMutation.mutate,
    isLoading: updateSurveyMutation.isPending,
    isSuccess: updateSurveyMutation.isSuccess,
    isError: updateSurveyMutation.isError,
    error: updateSurveyMutation.error,
  };
}

/**
 * Hook for deleting a survey
 */
export function useDeleteSurvey() {
  const queryClient = useQueryClient();

  const deleteSurveyMutation = useMutation({
    mutationFn: async (surveyId: string) => {
      const token = getCookie("token");
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API}/survey/${surveyId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Survey deleted successfully");
      queryClient.invalidateQueries({ queryKey: surveyQueryKeys.all });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error(error.response?.data?.message || "Failed to delete survey");
    },
  });

  return {
    deleteSurvey: deleteSurveyMutation.mutate,
    isLoading: deleteSurveyMutation.isPending,
    isSuccess: deleteSurveyMutation.isSuccess,
    isError: deleteSurveyMutation.isError,
    error: deleteSurveyMutation.error,
  };
}





/**
 * Hook for updating a specific question (survey entry) - NEW API
 */
export function useUpdateSurveyEntry() {
  const queryClient = useQueryClient();

  const updateSurveyEntryMutation = useMutation({
    mutationFn: async ({
      surveyEntryId,
      questionData,
    }: {
      surveyEntryId: string;
      questionData: UpdateSurveyEntryData;
    }) => {
      const token = getCookie("token");
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API}/survey-entry/${surveyEntryId}`,
        questionData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Question updated successfully");
      queryClient.invalidateQueries({ queryKey: surveyQueryKeys.all });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error(error.response?.data?.message || "Failed to update question");
    },
  });

  return {
    updateSurveyEntry: updateSurveyEntryMutation.mutate,
    isLoading: updateSurveyEntryMutation.isPending,
    isSuccess: updateSurveyEntryMutation.isSuccess,
    isError: updateSurveyEntryMutation.isError,
    error: updateSurveyEntryMutation.error,
  };
}

/**
 * Hook for adding a new question to a section - NEW API
 */
export function useAddQuestionToSection() {
  const queryClient = useQueryClient();

  const addQuestionToSectionMutation = useMutation({
    mutationFn: async ({
      sectionId,
      questionData,
    }: {
      sectionId: string;
      questionData: AddSurveyEntryData;
    }) => {
      const token = getCookie("token");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/survey-entry/survey-section/${sectionId}`,
        questionData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Question added successfully");
      queryClient.invalidateQueries({ queryKey: surveyQueryKeys.all });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error(error.response?.data?.message || "Failed to add question");
    },
  });

  return {
    addQuestionToSection: addQuestionToSectionMutation.mutate,
    isLoading: addQuestionToSectionMutation.isPending,
    isSuccess: addQuestionToSectionMutation.isSuccess,
    isError: addQuestionToSectionMutation.isError,
    error: addQuestionToSectionMutation.error,
  };
}

/**
 * Hook to fetch survey sections for editing
 */
export function useSurveySections(surveyId: string) {
  return useQuery({
    queryKey: surveyQueryKeys.sections(surveyId),
    queryFn: async () => {
      try {
        const token = getCookie("token");
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API}/survey-section/survey/${surveyId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        return response.data as SurveySectionsResponse;
      } catch (error: unknown) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        throw new Error(axiosError?.response?.data?.message || "Failed to load survey sections");
      }
    },
    enabled: !!surveyId,
  });
}

/**
 * Hook for adding a new section to an existing survey
 */
export function useAddSectionToSurvey() {
  const queryClient = useQueryClient();

  const addSectionMutation = useMutation({
    mutationFn: async ({
      surveyId,
      sectionData,
    }: {
      surveyId: string;
      sectionData: AddSectionData;
    }) => {
      const token = getCookie("token");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/survey-section/survey/${surveyId}`,
        sectionData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Section added successfully");
      queryClient.invalidateQueries({ queryKey: surveyQueryKeys.all });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error(error.response?.data?.message || "Failed to add section");
    },
  });

  return {
    addSection: addSectionMutation.mutate,
    isLoading: addSectionMutation.isPending,
    isSuccess: addSectionMutation.isSuccess,
    isError: addSectionMutation.isError,
    error: addSectionMutation.error,
  };
}



/**
 * Hook for deleting a specific survey entry (question)
 */
export function useDeleteSurveyEntry() {
  const queryClient = useQueryClient();

  const deleteSurveyEntryMutation = useMutation({
    mutationFn: async (surveyEntryId: string) => {
      const token = getCookie("token");
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API}/survey/entry/${surveyEntryId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Question deleted successfully");
      queryClient.invalidateQueries({ queryKey: surveyQueryKeys.all });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error(error.response?.data?.message || "Failed to delete question");
    },
  });

  return {
    deleteSurveyEntry: deleteSurveyEntryMutation.mutate,
    isLoading: deleteSurveyEntryMutation.isPending,
    isSuccess: deleteSurveyEntryMutation.isSuccess,
    isError: deleteSurveyEntryMutation.isError,
    error: deleteSurveyEntryMutation.error,
  };
}

/**
 * Hook for submitting an answer to a survey question (trainee side)
 */
export function useSubmitSurveyAnswer() {
  const queryClient = useQueryClient();

  const submitAnswerMutation = useMutation({
    mutationFn: async ({
      surveyEntryId,
      answerData,
    }: {
      surveyEntryId: string;
      answerData: SubmitAnswerData;
    }) => {
      const token = getCookie("token");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/survey/entry/${surveyEntryId}/answer`,
        answerData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Answer submitted successfully");
      queryClient.invalidateQueries({ queryKey: surveyQueryKeys.all });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error(error.response?.data?.message || "Failed to submit answer");
    },
  });

  return {
    submitAnswer: submitAnswerMutation.mutate,
    isLoading: submitAnswerMutation.isPending,
    isSuccess: submitAnswerMutation.isSuccess,
    isError: submitAnswerMutation.isError,
    error: submitAnswerMutation.error,
  };
}

/**
 * Hook for assigning a survey to a session
 */
export function useAssignSurveyToSession() {
  const queryClient = useQueryClient();

  const assignSurveyMutation = useMutation({
    mutationFn: async (surveyId: string) => {
      const token = getCookie("token");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/survey/${surveyId}/assign-session`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Survey assigned to session successfully");
      queryClient.invalidateQueries({ queryKey: surveyQueryKeys.all });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error(error.response?.data?.message || "Failed to assign survey to session");
    },
  });

  return {
    assignSurveyToSession: assignSurveyMutation.mutate,
    isLoading: assignSurveyMutation.isPending,
    isSuccess: assignSurveyMutation.isSuccess,
    isError: assignSurveyMutation.isError,
    error: assignSurveyMutation.error,
  };
}

// Utility functions for question validation based on type
export const getDefaultQuestionFields = (questionType: QuestionType): Partial<CreateSurveyEntry> => {
  switch (questionType) {
    case 'TEXT':
      return {
        choices: [],
        allowTextAnswer: true,
        rows: [],
      };
    case 'RADIO':
      return {
        choices: ['', ''],
        allowTextAnswer: false,
        rows: [],
      };
    case 'CHECKBOX':
      return {
        choices: ['', ''],
        allowTextAnswer: false,
        rows: [],
      };
    case 'GRID':
      return {
        choices: ['', ''],
        allowTextAnswer: false,
        rows: ['', ''],
      };
    default:
      return {
        choices: [],
        allowTextAnswer: false,
        rows: [],
      };
  }
};

// Utility function for default fields when adding individual questions
export const getDefaultAddQuestionFields = (questionType: QuestionType): Partial<AddSurveyEntryData> => {
  switch (questionType) {
    case 'TEXT':
      return {
        choices: [],
        allowTextAnswer: true,
        rows: [],
      };
    case 'RADIO':
      return {
        choices: ['', ''],
        allowTextAnswer: false,
        rows: [],
      };
    case 'CHECKBOX':
      return {
        choices: ['', ''],
        allowTextAnswer: false,
        rows: [],
      };
    case 'GRID':
      return {
        choices: ['', ''],
        allowTextAnswer: false,
        rows: ['', ''],
      };
    default:
      return {
        choices: [],
        allowTextAnswer: false,
        rows: [],
      };
  }
};

export const validateSurveyEntry = (entry: SurveyEntry): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Check required question text
  if (!entry.question.trim()) {
    errors.push('Question text is required');
  }

  // Validate based on question type
  switch (entry.questionType) {
    case 'TEXT':
      // TEXT questions don't need choices or rows
      break;
      
    case 'RADIO':
    case 'CHECKBOX':
      // RADIO and CHECKBOX need at least 2 choices
      if (entry.choices.length < 2) {
        errors.push('At least 2 choices are required');
      }
      if (entry.choices.some(choice => !choice.trim())) {
        errors.push('All choices must have text');
      }
      break;
      
    case 'GRID':
      // GRID needs both choices (columns) and rows
      if (entry.choices.length < 2) {
        errors.push('At least 2 column choices are required for grid questions');
      }
      if (entry.rows.length < 2) {
        errors.push('At least 2 rows are required for grid questions');
      }
      if (entry.choices.some(choice => !choice.trim())) {
        errors.push('All column choices must have text');
      }
      if (entry.rows.some(row => !row.trim())) {
        errors.push('All row options must have text');
      }
      break;
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validation function for CreateSurveyEntry (for form creation)
export const validateCreateSurveyEntry = (entry: CreateSurveyEntry): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Check required question text
  if (!entry.question.trim()) {
    errors.push('Question text is required');
  }

  // Validate based on question type
  switch (entry.questionType) {
    case 'TEXT':
      // TEXT questions don't need choices or rows
      break;
      
    case 'RADIO':
    case 'CHECKBOX':
      // RADIO and CHECKBOX need at least 2 choices
      if (entry.choices.length < 2) {
        errors.push('At least 2 choices are required');
      }
      if (entry.choices.some(choice => !choice.trim())) {
        errors.push('All choices must have text');
      }
      break;
      
    case 'GRID':
      // GRID needs both choices (columns) and rows
      if (entry.choices.length < 2) {
        errors.push('At least 2 column choices are required for grid questions');
      }
      if (entry.rows.length < 2) {
        errors.push('At least 2 rows are required for grid questions');
      }
      if (entry.choices.some(choice => !choice.trim())) {
        errors.push('All column choices must have text');
      }
      if (entry.rows.some(row => !row.trim())) {
        errors.push('All row options must have text');
      }
      break;
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
