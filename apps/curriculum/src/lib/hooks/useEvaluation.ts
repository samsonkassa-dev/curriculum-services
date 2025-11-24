import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query"
import axios, { AxiosError } from "axios"
import { getCookie } from "@curriculum-services/auth"
import { 
  CreateEvaluationPayload, 
  EvaluationResponse, 
  ApiErrorResponse,
  EvaluationEntryForm,
  EvaluationChoiceForm
} from "./evaluation-types"
import { toast } from "sonner"

// Re-export types
export * from "./evaluation-types"

// =============================================================================
// GET HOOKS
// =============================================================================

export function useGetEvaluations(trainingId: string) {
  return useQuery({
    queryKey: ['evaluation', trainingId],
    queryFn: async () => {
      const token = getCookie('token')
      const response = await axios.get<EvaluationResponse>(
        `${process.env.NEXT_PUBLIC_API}/monitoring-form/training/${trainingId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return response.data
    }
  })
}

export function useGetEvaluationDetail(formId: string) {
  return useQuery({
    queryKey: ['evaluation-detail', formId],
    queryFn: async () => {
      const token = getCookie('token')
      // Note: Response type might need adjustment based on actual API response for detail
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/monitoring-form/${formId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return response.data.monitoringForm
    }
  })
}

// =============================================================================
// MUTATION HOOKS
// =============================================================================

export function useCreateEvaluation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      data, 
      trainingId 
    }: { 
      data: CreateEvaluationPayload; 
      trainingId: string 
    }) => {
      const token = getCookie('token')
      
      const formData = new FormData()
      
      // Top-level fields
      formData.append('formType', data.formType)
      
      // Sections
      data.sections.forEach((section, si) => {
        formData.append(`sections[${si}].title`, section.title)
        formData.append(`sections[${si}].description`, section.description)
        
        // Entries (Questions) - use 'entries' for POST, backend converts to monitoringFormEntries
        section.entries.forEach((entry, ei) => {
          formData.append(`sections[${si}].entries[${ei}].clientId`, entry.clientId)
          
          formData.append(`sections[${si}].entries[${ei}].question`, entry.question)
          formData.append(`sections[${si}].entries[${ei}].questionType`, entry.questionType)
          formData.append(`sections[${si}].entries[${ei}].isFollowUp`, String(entry.isFollowUp))
          
          // Question Image - access from form data which has the file properties
          const entryForm = entry as EvaluationEntryForm
          if (entryForm.questionImageFile instanceof File) {
            formData.append(`sections[${si}].entries[${ei}].questionImage`, entryForm.questionImageFile)
          } else if (entry.questionImage) {
             formData.append(`sections[${si}].entries[${ei}].questionImage`, entry.questionImage)
          }

          // Follow-up logic - include all fields for completeness
          if (entry.isFollowUp) {
            if (entry.parentQuestionClientId) {
              formData.append(`sections[${si}].entries[${ei}].parentQuestionClientId`, entry.parentQuestionClientId)
            }
            if (entry.parentQuestionId) {
              formData.append(`sections[${si}].entries[${ei}].parentQuestionId`, entry.parentQuestionId)
            }
            
            // Handle trigger choice client IDs
            if (entry.triggerChoiceClientIds && entry.triggerChoiceClientIds.length > 0) {
              entry.triggerChoiceClientIds.forEach((id, idx) => {
                formData.append(`sections[${si}].entries[${ei}].triggerChoiceClientIds[${idx}]`, id)
              })
            }
            
            // Handle trigger choice server IDs (for editing existing evaluations)
            if (entry.triggerChoiceIds && entry.triggerChoiceIds.length > 0) {
              entry.triggerChoiceIds.forEach((id, idx) => {
                formData.append(`sections[${si}].entries[${ei}].triggerChoiceIds[${idx}]`, id)
              })
            }
          }

          // Choices (only for RADIO and CHECKBOX question types)
          if (entry.choices && entry.choices.length > 0) {
            entry.choices.forEach((choice, ci) => {
              formData.append(`sections[${si}].entries[${ei}].choices[${ci}].clientId`, choice.clientId)
              formData.append(`sections[${si}].entries[${ei}].choices[${ci}].choiceText`, choice.choiceText)
              
              // Choice Image - access from form data which has the file properties
              const choiceForm = choice as EvaluationChoiceForm
              if (choiceForm.choiceImageFile instanceof File) {
                formData.append(`sections[${si}].entries[${ei}].choices[${ci}].choiceImage`, choiceForm.choiceImageFile)
              } else if (choice.choiceImage) {
                formData.append(`sections[${si}].entries[${ei}].choices[${ci}].choiceImage`, choice.choiceImage)
              }
              
              // Handle nested follow-up question if it exists
              if (choiceForm.hasFollowUp && choiceForm.followUpQuestion) {
                const followUpQ = choiceForm.followUpQuestion;
                formData.append(`sections[${si}].entries[${ei}].choices[${ci}].followUpQuestion.clientId`, followUpQ.clientId);
                formData.append(`sections[${si}].entries[${ei}].choices[${ci}].followUpQuestion.question`, followUpQ.question);
                formData.append(`sections[${si}].entries[${ei}].choices[${ci}].followUpQuestion.questionType`, followUpQ.questionType);
                formData.append(`sections[${si}].entries[${ei}].choices[${ci}].followUpQuestion.isFollowUp`, String(followUpQ.isFollowUp));
                
                if (followUpQ.questionImageFile instanceof File) {
                  formData.append(`sections[${si}].entries[${ei}].choices[${ci}].followUpQuestion.questionImage`, followUpQ.questionImageFile);
                } else if (followUpQ.questionImage) {
                  formData.append(`sections[${si}].entries[${ei}].choices[${ci}].followUpQuestion.questionImage`, followUpQ.questionImage);
                }

                // Follow-up question's choices
                (followUpQ.choices || []).forEach((fChoice, fci) => {
                  formData.append(`sections[${si}].entries[${ei}].choices[${ci}].followUpQuestion.choices[${fci}].clientId`, fChoice.clientId);
                  formData.append(`sections[${si}].entries[${ei}].choices[${ci}].followUpQuestion.choices[${fci}].choiceText`, fChoice.choiceText);
                  if (fChoice.choiceImageFile instanceof File) {
                    formData.append(`sections[${si}].entries[${ei}].choices[${ci}].followUpQuestion.choices[${fci}].choiceImage`, fChoice.choiceImageFile);
                  } else if (fChoice.choiceImage) {
                    formData.append(`sections[${si}].entries[${ei}].choices[${ci}].followUpQuestion.choices[${fci}].choiceImage`, fChoice.choiceImage);
                  }
                });

                // Follow-up question's parent/trigger details
                if (followUpQ.parentQuestionClientId) {
                  formData.append(`sections[${si}].entries[${ei}].choices[${ci}].followUpQuestion.parentQuestionClientId`, followUpQ.parentQuestionClientId);
                }
                if (followUpQ.triggerChoiceClientIds) {
                  followUpQ.triggerChoiceClientIds.forEach((id, idx) => {
                    formData.append(`sections[${si}].entries[${ei}].choices[${ci}].followUpQuestion.triggerChoiceClientIds[${idx}]`, id);
                  });
                }
                if (followUpQ.parentQuestionId) {
                  formData.append(`sections[${si}].entries[${ei}].choices[${ci}].followUpQuestion.parentQuestionId`, followUpQ.parentQuestionId);
                }
                if (followUpQ.triggerChoiceIds) {
                  followUpQ.triggerChoiceIds.forEach((id, idx) => {
                    formData.append(`sections[${si}].entries[${ei}].choices[${ci}].followUpQuestion.triggerChoiceIds[${idx}]`, id);
                  });
                }
              }
            })
          }
        })
      })

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/monitoring-form/training/${trainingId}`,
        formData,
        {
          headers: { 
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}` 
          }
        }
      )
      return response.data
    },
    onSuccess: (data, variables) => {
      toast.success("Success", { 
        description: data.message || "Evaluation form created successfully" 
      })
      
      queryClient.invalidateQueries({ 
        queryKey: ['evaluation', variables.trainingId] 
      })
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      let errorMessage = "Failed to create evaluation form. Please try again."
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }
      
      toast.error("Error", {
        description: errorMessage
      })
    }
  })
}
