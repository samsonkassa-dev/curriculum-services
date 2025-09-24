import { useMutation, useQuery } from '@tanstack/react-query'
import { assessmentService, AssessmentAnswer } from '../assessments'

export function useAssessment(linkId: string) {
  return useQuery({
    queryKey: ['assessment', linkId],
    queryFn: () => assessmentService.getAssessment(linkId),
    enabled: !!linkId
  })
}

export function useSubmitAssessment() {
  return useMutation({
    mutationFn: ({ linkId, traineeId, answers }: {
      linkId: string
      traineeId: string
      answers: AssessmentAnswer[]
    }) => assessmentService.submitAssessment(linkId, traineeId, answers)
  })
}

export function useAssessmentAnswers(assessmentId: string, traineeId: string) {
  return useQuery({
    queryKey: ['assessmentAnswers', assessmentId, traineeId],
    queryFn: () => assessmentService.getAssessmentAnswers(assessmentId, traineeId),
    enabled: !!assessmentId && !!traineeId
  })
}
