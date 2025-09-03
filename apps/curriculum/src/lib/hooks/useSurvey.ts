import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { getCookie } from "@curriculum-services/auth";
import { toast } from "sonner";
export { 
  getDefaultQuestionFields, 
  getDefaultAddQuestionFields, 
  validateSurveyEntry, 
  validateCreateSurveyEntry 
} from "@/lib/utils/survey";

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
  questionImage?: string; // For backward compatibility
  questionImageUrl?: string; // From API response
  choices: string[] | SurveyChoice[]; // Support both formats
  allowMultipleAnswers: boolean;
  allowOtherAnswer: boolean;
  rows: string[];
  required: boolean;
  answer?: string | null; // For trainee responses
  // Follow-up support from API response
  questionNumber?: number;
  parentQuestionNumber?: number | null;
  parentChoice?: string | null;
  followUp?: boolean;
}

// For API response choices
export interface SurveyChoice {
  order: string; // A, B, C, etc.
  choiceText: string;
  choiceImageUrl?: string;
}

// For POST API - creating surveys (sections.surveyEntries)
export interface CreateSurveyChoice {
  choice: string;
  choiceImage?: string;
  // local-only field for uploads (not sent to API)
  choiceImageFile?: File;
}

export interface CreateSurveyEntry {
  question: string;
  questionImage?: string;
  questionImageUrl?: string; // From API response
  // local-only field for uploads (not sent to API)
  questionImageFile?: File;
  questionType: QuestionType;
  choices: CreateSurveyChoice[];
  allowTextAnswer: boolean;
  rows: string[];
  required: boolean;
  // follow-up support
  questionNumber?: number;
  parentQuestionNumber?: number;
  parentChoice?: string;
  followUp?: boolean;
}

// For PATCH API - updating individual questions
export interface UpdateSurveyEntryData {
  question: string;
  questionImage?: string;
  questionImageFile?: File; // For multipart uploads
  questionType: QuestionType;
  questionNumber?: number; // Add missing field
  isRequired: boolean;
  choices: {
    choice: string;
    choiceImage?: string;
    choiceImageFile?: File; // For multipart uploads
  }[];
  allowOtherAnswer: boolean;
  rows: string[];
  // Follow-up fields (updated to match API)
  isFollowUp?: boolean;
  parentQuestionNumber?: number;
  parentChoice?: string;
}

// For POST API - adding new questions to section
export interface AddSurveyEntryData {
  question: string;
  questionImage?: string;
  questionImageFile?: File; // For multipart uploads
  questionType: QuestionType;
  questionNumber?: number; // Will be calculated automatically if not provided
  choices: {
    choice: string;
    choiceImage?: string;
    choiceImageFile?: File; // For multipart uploads
  }[];
  allowTextAnswer: boolean;
  rows: string[];
  parentQuestionNumber?: number;
  parentChoice?: string;
  followUp?: boolean;
  required: boolean;
}

// For GET API - viewing survey details (sections.questions)
export interface SurveySection {
  id?: string; // Optional for creation
  title: string;
  description?: string | null;
  questions: SurveyEntry[];
}

// For POST API - creating surveys (sections.surveyEntries)
export interface CreateSurveySection {
  title: string;
  description?: string;
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
  description?: string;
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
// export function useSurveysBySession(sessionId: string) {
//   return useQuery({
//     queryKey: surveyQueryKeys.session(sessionId),
//     queryFn: async () => {
//       try {
//         const token = getCookie("token");
//         const response = await axios.get(
//           `${process.env.NEXT_PUBLIC_API}/survey/session/${sessionId}`,
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           }
//         );
//         return response.data;
//       } catch (error: unknown) {
//         const axiosError = error as AxiosError<ApiErrorResponse>;
//         throw new Error(axiosError?.response?.data?.message || "Failed to load session surveys");
//       }
//     },
//     enabled: !!sessionId,
//   });
// }

/**
 * Hook for creating a new survey with sections and questions
 */
export function useCreateSurvey(trainingId: string) {
  const queryClient = useQueryClient();

  const createSurveyMutation = useMutation({
    mutationFn: async (surveyData: CreateSurveyData) => {
      const token = getCookie("token");

      // Build multipart form data: send all fields as individual multipart keys (no JSON payload)
      const formData = new FormData();

      // Top-level fields
      formData.append('name', surveyData.name ?? '');
      formData.append('type', surveyData.type);
      formData.append('description', surveyData.description ?? '');

      // Nested fields (sections, surveyEntries, choices, rows)
      surveyData.sections.forEach((sec, si) => {
        formData.append(`sections[${si}].title`, sec.title ?? '');
        if (sec.description) formData.append(`sections[${si}].description`, sec.description);

        sec.surveyEntries.forEach((entry, ei) => {
          formData.append(`sections[${si}].surveyEntries[${ei}].question`, entry.question ?? '');
          formData.append(`sections[${si}].surveyEntries[${ei}].questionType`, entry.questionType);
          if (entry.questionNumber != null) formData.append(`sections[${si}].surveyEntries[${ei}].questionNumber`, String(entry.questionNumber));
          if (entry.parentQuestionNumber != null) formData.append(`sections[${si}].surveyEntries[${ei}].parentQuestionNumber`, String(entry.parentQuestionNumber));
          if (entry.parentChoice) formData.append(`sections[${si}].surveyEntries[${ei}].parentChoice`, entry.parentChoice);
          if (entry.followUp != null) formData.append(`sections[${si}].surveyEntries[${ei}].followUp`, String(!!entry.followUp));
          formData.append(`sections[${si}].surveyEntries[${ei}].allowTextAnswer`, String(!!entry.allowTextAnswer));
          formData.append(`sections[${si}].surveyEntries[${ei}].required`, String(!!entry.required));

          // Rows
          (entry.rows || []).forEach((row, ri) => {
            formData.append(`sections[${si}].surveyEntries[${ei}].rows[${ri}]`, row ?? '');
          });

          // Choices (text or image)
          (entry.choices || []).forEach((c, ci) => {
            formData.append(`sections[${si}].surveyEntries[${ei}].choices[${ci}].choice`, c.choice ?? '');
            if (c.choiceImageFile instanceof File) {
              formData.append(`sections[${si}].surveyEntries[${ei}].choices[${ci}].choiceImage`, c.choiceImageFile);
            } else if (c.choiceImage) {
              formData.append(`sections[${si}].surveyEntries[${ei}].choices[${ci}].choiceImage`, c.choiceImage);
            }
          });

          // Question image (file or existing URL)
          if (entry.questionImageFile instanceof File) {
            formData.append(`sections[${si}].surveyEntries[${ei}].questionImage`, entry.questionImageFile);
          } else if (entry.questionImage) {
            formData.append(`sections[${si}].surveyEntries[${ei}].questionImage`, entry.questionImage);
          }
        });
      });

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/survey/training/${trainingId}`,
        formData,
        {
          headers: { 
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}` 
          },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Survey created successfully");
      queryClient.invalidateQueries({ queryKey: ["surveys", trainingId] });
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
      queryClient.invalidateQueries({ queryKey: ["surveys"] });
      queryClient.invalidateQueries({ queryKey: ["survey", surveyId] });
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
      queryClient.invalidateQueries({ queryKey: ["surveys"] });
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
      questionData: Partial<UpdateSurveyEntryData>;
    }) => {
      const token = getCookie("token");
      
      // Use multipart form data for selective updates
      const formData = new FormData();
      
      // Only append fields that are defined (selective update)
      if (questionData.question !== undefined) {
        formData.append('question', questionData.question);
      }
      if (questionData.questionType !== undefined) {
        formData.append('questionType', questionData.questionType);
      }
      if (questionData.allowOtherAnswer !== undefined) {
        formData.append('allowOtherAnswer', String(!!questionData.allowOtherAnswer));
      }
      if (questionData.isRequired !== undefined) {
        formData.append('isRequired', String(!!questionData.isRequired));
      }
      
     // Add question number if provided
      // if (questionData.questionNumber != null) {
      //   formData.append('questionNumber', String(questionData.questionNumber));
      // }
      
      // Add follow-up fields if provided
      if (questionData.parentQuestionNumber != null) {
        formData.append('parentQuestionNumber', String(questionData.parentQuestionNumber));
      }
      if (questionData.parentChoice) {
        formData.append('parentChoice', questionData.parentChoice);
      }
      if (questionData.isFollowUp != null) {
        formData.append('isFollowUp', String(!!questionData.isFollowUp));
      }
      
      // Add rows if provided
      if (questionData.rows !== undefined) {
        questionData.rows.forEach((row, i) => {
          formData.append(`rows[${i}]`, row);
        });
      }
      
      // Add choices if provided
      if (questionData.choices !== undefined) {
        questionData.choices.forEach((choice, i) => {
          formData.append(`choices[${i}].choice`, choice.choice);
          if (choice.choiceImageFile instanceof File) {
            formData.append(`choices[${i}].choiceImage`, choice.choiceImageFile);
          } else if (choice.choiceImage) {
            formData.append(`choices[${i}].choiceImage`, choice.choiceImage);
          }
        });
      }
      
      // Add question image if provided
      if (questionData.questionImageFile instanceof File) {
        formData.append('questionImage', questionData.questionImageFile);
      } else if (questionData.questionImage !== undefined) {
        formData.append('questionImage', questionData.questionImage);
      }
      
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API}/survey-entry/${surveyEntryId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`
          },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Question updated successfully");
      // Only invalidate survey list - specific survey details will be refetched by the component
      queryClient.invalidateQueries({ queryKey: ["surveys"] });
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
      
      // Always use multipart form data
      const formData = new FormData();
      
      // Add basic fields
      formData.append('question', questionData.question);
      formData.append('questionType', questionData.questionType);
      formData.append('allowTextAnswer', String(!!questionData.allowTextAnswer));
      formData.append('required', String(!!questionData.required));
      
      // Add question number if provided
      if (questionData.questionNumber != null) {
        formData.append('questionNumber', String(questionData.questionNumber));
      }
      
      // Add optional follow-up fields
      if (questionData.parentQuestionNumber != null) {
        formData.append('parentQuestionNumber', String(questionData.parentQuestionNumber));
      }
      if (questionData.parentChoice) {
        formData.append('parentChoice', questionData.parentChoice);
      }
      if (questionData.followUp != null) {
        formData.append('followUp', String(!!questionData.followUp));
      }
      
      // Add rows
      questionData.rows.forEach((row, i) => {
        formData.append(`rows[${i}]`, row);
      });
      
      // Add choices
      questionData.choices.forEach((choice, i) => {
        formData.append(`choices[${i}].choice`, choice.choice);
        if (choice.choiceImageFile instanceof File) {
          formData.append(`choices[${i}].choiceImage`, choice.choiceImageFile);
        } else if (choice.choiceImage) {
          formData.append(`choices[${i}].choiceImage`, choice.choiceImage);
        }
      });
      
      // Add question image
      if (questionData.questionImageFile instanceof File) {
        formData.append('questionImage', questionData.questionImageFile);
      } else if (questionData.questionImage) {
        formData.append('questionImage', questionData.questionImage);
      }
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/survey-entry/survey-section/${sectionId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`
          },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Question added successfully");
      queryClient.invalidateQueries({ queryKey: ["surveys"] });
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
      queryClient.invalidateQueries({ queryKey: ["surveys"] });
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
        `${process.env.NEXT_PUBLIC_API}/survey-entry/${surveyEntryId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Question deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["surveys"] });
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
 * Hook for deleting a survey section
 */
export function useUpdateSurveySection() {
  const queryClient = useQueryClient();

  const updateSurveySectionMutation = useMutation({
    mutationFn: async ({ sectionId, title, description }: { sectionId: string; title: string; description?: string }) => {
      const token = getCookie("token");
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API}/survey-section/${sectionId}`,
        { title, description },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Section updated successfully");
      queryClient.invalidateQueries({ queryKey: ["surveys"] });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error(error.response?.data?.message || "Failed to update section");
    },
  });

  return {
    updateSurveySection: updateSurveySectionMutation.mutate,
    isLoading: updateSurveySectionMutation.isPending,
    isSuccess: updateSurveySectionMutation.isSuccess,
    isError: updateSurveySectionMutation.isError,
    error: updateSurveySectionMutation.error,
  };
}

export function useDeleteSurveySection() {
  const queryClient = useQueryClient();

  const deleteSurveySectionMutation = useMutation({
    mutationFn: async (sectionId: string) => {
      const token = getCookie("token");
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API}/survey-section/${sectionId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Section deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["surveys"] });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error(error.response?.data?.message || "Failed to delete section");
    },
  });

  return {
    deleteSurveySection: deleteSurveySectionMutation.mutate,
    isLoading: deleteSurveySectionMutation.isPending,
    isSuccess: deleteSurveySectionMutation.isSuccess,
    isError: deleteSurveySectionMutation.isError,
    error: deleteSurveySectionMutation.error,
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
      queryClient.invalidateQueries({ queryKey: ["surveys"] });
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
 * Hook for adding a choice to an existing survey question
 */
export function useAddChoice() {
  const queryClient = useQueryClient();

  const addChoiceMutation = useMutation({
    mutationFn: async ({
      surveyEntryId,
      choiceData,
    }: {
      surveyEntryId: string;
      choiceData: {
        choice: string;
        choiceImage?: string;
        choiceImageFile?: File;
      };
    }) => {
      const token = getCookie("token");
      
      // Use multipart form data for potential image uploads
      const formData = new FormData();
      formData.append('choice', choiceData.choice);
      
      if (choiceData.choiceImageFile instanceof File) {
        formData.append('choiceImage', choiceData.choiceImageFile);
      } else if (choiceData.choiceImage) {
        formData.append('choiceImage', choiceData.choiceImage);
      }
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/survey-entry/${surveyEntryId}/add-choice`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`
          },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Choice added successfully");
      queryClient.invalidateQueries({ queryKey: ["surveys"] });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error(error.response?.data?.message || "Failed to add choice");
    },
  });

  return {
    addChoice: addChoiceMutation.mutate,
    isLoading: addChoiceMutation.isPending,
    isSuccess: addChoiceMutation.isSuccess,
    isError: addChoiceMutation.isError,
    error: addChoiceMutation.error,
  };
}

/**
 * Hook for removing a choice from an existing survey question
 */
export function useRemoveChoice() {
  const queryClient = useQueryClient();

  const removeChoiceMutation = useMutation({
    mutationFn: async ({
      surveyEntryId,
      order,
    }: {
      surveyEntryId: string;
      order: string;
    }) => {
      const token = getCookie("token");

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/survey-entry/${surveyEntryId}/remove-choice?order=${order}`,
        "", // 👈 important: send empty string body (like curl -d '')
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Choice removed successfully");
      queryClient.invalidateQueries({ queryKey: ["surveys"] });
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      toast.error(error.response?.data?.message || "Failed to remove choice");
    },
  });
  

  return {
    removeChoice: removeChoiceMutation.mutate,
    isLoading: removeChoiceMutation.isPending,
    isSuccess: removeChoiceMutation.isSuccess,
    isError: removeChoiceMutation.isError,
    error: removeChoiceMutation.error,
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
      queryClient.invalidateQueries({ queryKey: ["surveys"] });
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



// utility exports re-exported above

