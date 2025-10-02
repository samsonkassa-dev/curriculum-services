import { api } from './http'

export interface Assessment {
  id: string
  title: string
  description?: string
  questions: AssessmentQuestion[]
  timeLimit?: number
  status: 'draft' | 'published' | 'closed'
}

export interface AssessmentQuestion {
  id: string
  type: 'multiple-choice' | 'text' | 'checkbox' | 'radio'
  question: string
  options?: string[]
  required: boolean
  order: number
}

export interface AssessmentAnswer {
  questionId: string
  answer: string | string[]
}

export interface AssessmentSubmission {
  assessmentId: string
  traineeId: string
  answers: AssessmentAnswer[]
  submittedAt: string
  score?: number
}

export const assessmentService = {
  async getAssessment(linkId: string): Promise<Assessment> {
    const response = await api.get(`/assessments/link/${linkId}`)
    return response.data
  },

  async submitAssessment(linkId: string, traineeId: string, answers: AssessmentAnswer[]): Promise<void> {
    await api.post(`/assessments/link/${linkId}/submit`, {
      traineeId,
      answers
    })
  },

  async getAssessmentAnswers(assessmentId: string, traineeId: string): Promise<AssessmentSubmission> {
    const response = await api.get(`/assessments/${assessmentId}/answers/${traineeId}`)
    return response.data
  },

  // New API: Get assessment attempts (returns list of actual attempts, not summary)
  async getAttemptsByAssessment(assessmentId: string, traineeId?: string) {
    const params = new URLSearchParams()
    if (traineeId) params.append('traineeId', traineeId)
    const url = `/assessment-attempt/assessment/${assessmentId}${params.toString() ? `?${params}` : ''}`
    
    const response = await api.get<{
      code: string
      assessmentAttempts?: Array<{
        id: string
        assessment: {
          id: string
          name: string
          type: string
          description: string | null
          duration: number
          maxAttempts: number
          approvalStatus: string
          sectionCount: number
          timed: boolean
        }
        traineeId: string
        traineeName: string
        attemptType: string
        attemptNumber: number
        startedAt: string
        submittedAt: string | null
        score: number | null
        maxScore: number | null
        percentage: number | null
        attemptStatus: 'IN_PROGRESS' | 'SUBMITTED' | 'GRADED' | string
      }>
      count: number
      message: string
    }>(url)
    
    return response.data
  },

  // New API: Attempt details with answers (auth required)
  async getAttemptDetail(attemptId: string) {
    const { data } = await api.get<{
      code: string
      assessmentAttempt: {
        id: string
        assessment: {
          id: string
          name: string
          type: string
          description: string | null
          duration: number
          maxAttempts: number
          approvalStatus: string
          sectionCount: number
          timed: boolean
        }
        traineeId: string
        traineeName: string
        attemptType: string
        attemptNumber: number
        startedAt: string
        submittedAt: string | null
        score: number | null
        maxScore: number | null
        percentage: number | null
        attemptStatus: 'IN_PROGRESS' | 'SUBMITTED' | 'GRADED' | string
        assessmentAnswers: Array<{
          id: string
          traineeId: string
          traineeName: string
          assessmentEntryId: string
          question: string
          questionType: 'RADIO' | 'CHECKBOX' | 'TEXT' | 'GRID' | string
          questionWeight: number
          selectedChoices: Array<{
            id: string
            choiceText: string
            choiceImageUrl: string | null
            isCorrect: boolean | null
          }>
          textAnswer: string | null
          score: number | null
        }>
      }
      message: string
    }>(`/assessment-attempt/${attemptId}`)
    return data
  }
}
