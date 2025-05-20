import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { getCookie } from "@curriculum-services/auth";
import { toast } from "sonner";

// Define types
export interface AssessmentQuestion {
  question: string;
  choices: string[];
}

export interface CreateSessionAssessmentData {
  name: string;
  description: string;
  surveyQuestions: AssessmentQuestion[];
}

export interface AssessmentEntry {
  id: string;
  question: string;
  choices: string[];
  answer: string | null;
}

export interface Survey {
  id: string;
  name: string;
  description: string;
  sessionId: string | null;
  sessionName: string | null;
}

export interface SessionAssessmentResponse {
  code: string;
  surveys: Survey[];
  message: string;
}

export interface UpdateQuestionData {
  question: string;
  choices: string[];
}

export interface AddQuestionData {
  question: string;
  choices: string[];
}

// Define query keys
const sessionAssessmentQueryKey = "sessionAssessments";

/**
 * Hook for creating a new session assessment
 */
export function useCreateSessionAssessment(trainingId: string) {
  const queryClient = useQueryClient();

  const createAssessmentMutation = useMutation({
    mutationFn: async (assessmentData: CreateSessionAssessmentData) => {
      const token = getCookie("token");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/survey/training/${trainingId}`,
        assessmentData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data as SessionAssessmentResponse;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Survey created successfully");
      queryClient.invalidateQueries({ queryKey: [sessionAssessmentQueryKey] });
      queryClient.invalidateQueries({ queryKey: [sessionAssessmentQueryKey, trainingId] });
    },
    onError: (error: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      toast.error(error.response?.data?.message || "Failed to create survey");
    },
  });

  return {
    createSessionAssessment: createAssessmentMutation.mutate,
    isLoading: createAssessmentMutation.isPending,
    isSuccess: createAssessmentMutation.isSuccess,
    isError: createAssessmentMutation.isError,
    error: createAssessmentMutation.error,
  };
}

/**
 * Hook to fetch session assessment
 */
export function useSessionAssessments(trainingId: string, traineeId?: string) {
  return useQuery({
    queryKey: [sessionAssessmentQueryKey, trainingId, traineeId],
    queryFn: async () => {
      try {
        const token = getCookie("token");
        
        // Build URL with query parameters if traineeId is provided
        let url = `${process.env.NEXT_PUBLIC_API}/survey/training/${trainingId}`;
        if (traineeId) {
          url += `?traineeId=${traineeId}`;
        }
        
        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data as SessionAssessmentResponse;
      } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
        throw new Error(error?.response?.data?.message || "Failed to load surveys");
      }
    },
  });
}

/**
 * Hook for updating an existing session assessment
 */
export function useUpdateSessionAssessment() {
  const queryClient = useQueryClient();

  const updateAssessmentMutation = useMutation({
    mutationFn: async (surveyData: {
      id: string;
      name: string;
      description: string;
      surveyQuestions: AssessmentQuestion[];
    }) => {
      const token = getCookie("token");
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API}/survey/${surveyData.id}`,
        {
          name: surveyData.name,
          description: surveyData.description,
          surveyQuestions: surveyData.surveyQuestions
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return { responseData: response.data, surveyId: surveyData.id };
    },
    onSuccess: ({ responseData, surveyId }) => {
      toast.success(responseData.message || "Survey updated successfully");
      queryClient.invalidateQueries({ queryKey: [sessionAssessmentQueryKey] });
      queryClient.invalidateQueries({ queryKey: [sessionAssessmentQueryKey, surveyId] });
    },
    onError: (error: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      toast.error(error.response?.data?.message || "Failed to update survey");
    },
  });

  return {
    updateSessionAssessment: updateAssessmentMutation.mutate,
    isLoading: updateAssessmentMutation.isPending,
    isSuccess: updateAssessmentMutation.isSuccess,
    isError: updateAssessmentMutation.isError,
    error: updateAssessmentMutation.error,
  };
}

/**
 * Hook for deleting a session assessment
 */
export function useDeleteSessionAssessment() {
  const queryClient = useQueryClient();

  const deleteAssessmentMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      const token = getCookie("token");
      await axios.delete(`${process.env.NEXT_PUBLIC_API}/session-assessment/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return sessionId;
    },
    onSuccess: (sessionId) => {
      toast.success("Assessment deleted successfully");
      queryClient.invalidateQueries({ queryKey: [sessionAssessmentQueryKey] });
      queryClient.removeQueries({ queryKey: [sessionAssessmentQueryKey, sessionId] });
    },
    onError: (error: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      toast.error(error.response?.data?.message || "Failed to delete assessment");
    },
  });

  return {
    deleteSessionAssessment: deleteAssessmentMutation.mutate,
    isLoading: deleteAssessmentMutation.isPending,
    isSuccess: deleteAssessmentMutation.isSuccess,
    isError: deleteAssessmentMutation.isError,
    error: deleteAssessmentMutation.error,
  };
}

/**
 * Hook for submitting an answer to a pre-training assessment question
 */
export interface SubmitAnswerData {
  answer: string;
  traineeId: string;
}

export function useSubmitAssessmentAnswer() {
  const queryClient = useQueryClient();

  const submitAnswerMutation = useMutation({
    mutationFn: async ({
      preTrainingAssessmentEntryId,
      answerData,
    }: {
      preTrainingAssessmentEntryId: string;
      answerData: SubmitAnswerData;
    }) => {
      const token = getCookie("token");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/pre-training-assessment/entry/${preTrainingAssessmentEntryId}/answer`,
        answerData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Answer submitted successfully");
      // Invalidate any queries that might be affected by this answer submission
      queryClient.invalidateQueries({ queryKey: [sessionAssessmentQueryKey] });
    },
    onError: (error: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
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
 * Hook for updating a pre-training assessment question
 */
export function useUpdateAssessmentQuestion() {
  const queryClient = useQueryClient();

  const updateQuestionMutation = useMutation({
    mutationFn: async ({
      preTrainingAssessmentEntryId,
      questionData,
    }: {
      preTrainingAssessmentEntryId: string;
      questionData: UpdateQuestionData;
    }) => {
      const token = getCookie("token");
      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API}/pre-training-assessment/entry/${preTrainingAssessmentEntryId}/question`,
        questionData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Question updated successfully");
      // Invalidate session assessments to refresh data
      queryClient.invalidateQueries({ queryKey: [sessionAssessmentQueryKey] });
    },
    onError: (error: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      toast.error(error.response?.data?.message || "Failed to update question");
    },
  });

  return {
    updateQuestion: updateQuestionMutation.mutate,
    isLoading: updateQuestionMutation.isPending,
    isSuccess: updateQuestionMutation.isSuccess,
    isError: updateQuestionMutation.isError,
    error: updateQuestionMutation.error,
  };
}

/**
 * Hook to fetch a pre-training assessment by ID
 */
export function usePreTrainingAssessment(assessmentId: string) {
  return useQuery({
    queryKey: ["preTrainingAssessment", assessmentId],
    queryFn: async () => {
      if (!assessmentId) {
        throw new Error("Assessment ID is required");
      }
      try {
        const token = getCookie("token");
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API}/pre-training-assessment/${assessmentId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        return response.data as SessionAssessmentResponse;
      } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
        throw new Error(error?.response?.data?.message || "Failed to load pre-training assessment");
      }
    },
    enabled: !!assessmentId, // Only run query if assessmentId is provided
  });
}

/**
 * Hook for deleting a pre-training assessment
 */
export function useDeletePreTrainingAssessment() {
  const queryClient = useQueryClient();

  const deleteAssessmentMutation = useMutation({
    mutationFn: async (assessmentId: string) => {
      const token = getCookie("token");
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API}/pre-training-assessment/${assessmentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return assessmentId;
    },
    onSuccess: (assessmentId) => {
      toast.success("Assessment deleted successfully");
      // Invalidate both session and pre-training assessment queries
      queryClient.invalidateQueries({ queryKey: [sessionAssessmentQueryKey] });
      queryClient.invalidateQueries({ queryKey: ["preTrainingAssessment"] });
      queryClient.removeQueries({ queryKey: ["preTrainingAssessment", assessmentId] });
    },
    onError: (error: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      toast.error(error.response?.data?.message || "Failed to delete assessment");
    },
  });

  return {
    deletePreTrainingAssessment: deleteAssessmentMutation.mutate,
    isLoading: deleteAssessmentMutation.isPending,
    isSuccess: deleteAssessmentMutation.isSuccess,
    isError: deleteAssessmentMutation.isError,
    error: deleteAssessmentMutation.error,
  };
}

/**
 * Hook for deleting a specific assessment entry (question)
 */ 
export function useDeleteAssessmentEntry() {
  const queryClient = useQueryClient();

  const deleteEntryMutation = useMutation({
    mutationFn: async (entryId: string) => {
      const token = getCookie("token");
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API}/pre-training-assessment/entry/${entryId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return entryId;
    },
    onSuccess: () => {
      toast.success("Question deleted successfully");
      // Invalidate all assessment queries as the entry could be part of any assessment
      queryClient.invalidateQueries({ queryKey: [sessionAssessmentQueryKey] });
      queryClient.invalidateQueries({ queryKey: ["preTrainingAssessment"] });
    },
    onError: (error: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      toast.error(error.response?.data?.message || "Failed to delete question");
    },
  });

  return {
    deleteAssessmentEntry: deleteEntryMutation.mutate,
    isLoading: deleteEntryMutation.isPending,
    isSuccess: deleteEntryMutation.isSuccess,
    isError: deleteEntryMutation.isError,
    error: deleteEntryMutation.error,
  };
}

/**
 * Hook for adding a new question to an existing survey
 */
export function useAddQuestionToSurvey() {
  const queryClient = useQueryClient();

  const addQuestionMutation = useMutation({
    mutationFn: async ({
      surveyId,
      questionData,
    }: {
      surveyId: string;
      questionData: AddQuestionData;
    }) => {
      const token = getCookie("token");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/survey/${surveyId}/question`,
        questionData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Question added successfully");
      // Invalidate session assessments to refresh data
      queryClient.invalidateQueries({ queryKey: [sessionAssessmentQueryKey] });
    },
    onError: (error: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      toast.error(error.response?.data?.message || "Failed to add question");
    },
  });

  return {
    addQuestion: addQuestionMutation.mutate,
    isLoading: addQuestionMutation.isPending,
    isSuccess: addQuestionMutation.isSuccess,
    isError: addQuestionMutation.isError,
    error: addQuestionMutation.error,
  };
}

/**
 * Hook for adding a new question to an existing assessment
 */
export function useAddQuestionToAssessment() {
  const queryClient = useQueryClient();

  const addQuestionMutation = useMutation({
    mutationFn: async ({
      assessmentId,
      questionData,
    }: {
      assessmentId: string;
      questionData: AddQuestionData;
    }) => {
      const token = getCookie("token");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/pre-training-assessment/${assessmentId}/question`,
        questionData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Question added successfully");
      // Invalidate session assessments to refresh data
      queryClient.invalidateQueries({ queryKey: [sessionAssessmentQueryKey] });
    },
    onError: (error: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      toast.error(error.response?.data?.message || "Failed to add question");
    },
  });

  return {
    addQuestion: addQuestionMutation.mutate,
    isLoading: addQuestionMutation.isPending,
    isSuccess: addQuestionMutation.isSuccess,
    isError: addQuestionMutation.isError,
    error: addQuestionMutation.error,
  };
}

/**
 * Hook for adding multiple questions to an existing survey
 */
export function useAddQuestionsToSurvey() {
  const queryClient = useQueryClient();

  const addQuestionsMutation = useMutation({
    mutationFn: async ({
      surveyId,
      questions,
    }: {
      surveyId: string;
      questions: AssessmentQuestion[];
    }) => {
      const token = getCookie("token");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/survey/${surveyId}/questions`,
        questions,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Questions added successfully");
      // Invalidate session assessments to refresh data
      queryClient.invalidateQueries({ queryKey: [sessionAssessmentQueryKey] });
    },
    onError: (error: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      toast.error(error.response?.data?.message || "Failed to add questions");
    },
  });

  return {
    addQuestions: addQuestionsMutation.mutate,
    isLoading: addQuestionsMutation.isPending,
    isSuccess: addQuestionsMutation.isSuccess,
    isError: addQuestionsMutation.isError,
    error: addQuestionsMutation.error,
  };
}
