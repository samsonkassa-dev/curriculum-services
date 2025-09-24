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
  }
}
