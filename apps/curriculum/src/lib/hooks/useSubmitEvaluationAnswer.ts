/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { getCookie } from "@curriculum-services/auth";
import { toast } from "sonner";

interface SubmitAnswerPayload {
  monitoringFormEntryId: string;
  answer: boolean;
}

async function submitEvaluationAnswer({ monitoringFormEntryId, answer }: SubmitAnswerPayload) {
  try {
    const token = getCookie('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Assuming a PATCH request to update the answer for a specific entry
    const response = await axios.patch(
      `${process.env.NEXT_PUBLIC_API}/monitoring-form/entry/${monitoringFormEntryId}/answer`, 
      { answer },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    // You might want to return something specific from the response if needed
    return response.data; 

  } catch (error: any) {
    console.log("Error submitting evaluation answer:", error);
    throw new Error(
      error?.response?.data?.message || "Failed to submit answer"
    );
  }
}

export function useSubmitEvaluationAnswer(formId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitEvaluationAnswer,
    onSuccess: (data, variables) => {
      toast.success("Answer submitted successfully!");
      // Optionally, invalidate queries to refetch data if the UI needs to update
      // based on the submission, e.g., refetching the evaluation detail
      queryClient.invalidateQueries({ queryKey: ["evaluationDetail", formId] });
      // You might also want to invalidate the specific entry if you have a query for it
      // queryClient.invalidateQueries({ queryKey: ["monitoringFormEntry", variables.monitoringFormEntryId] });
    },
    onError: (error: Error) => {
      toast.error("Failed to submit answer", {
        description: error.message || "Please try again later.",
      });
    },
  });
} 