import { http } from "./http"

export type QuestionType = 'TEXT' | 'RADIO' | 'CHECKBOX' | 'GRID'

export interface LinkValidityResponse {
  code: string
  surveyLink: {
    survey?: SurveyDetailDto
    cohortId: string
    surveyId: string
    cohortName: string
    traineeId: string
    traineeName: string
    link: string
    expiryDate: string
    valid: boolean
  }
  message: string
}

export interface SurveyEntryDto {
  id: string
  question: string
  questionType: QuestionType
  choices: string[]
  allowMultipleAnswers: boolean
  allowOtherAnswer: boolean
  rows: string[]
  required: boolean
}

export interface SurveySectionDto {
  id: string
  title: string
  questions: SurveyEntryDto[]
}

export interface SurveyDetailDto {
  id: string
  name: string
  type: 'BASELINE' | 'ENDLINE' | 'OTHER'
  description: string
  sections: SurveySectionDto[]
}

export interface SurveyDetailResponse {
  code: string
  survey: SurveyDetailDto
  message: string
}

export async function checkLinkValidity(linkId: string) {
  const { data } = await http.get<LinkValidityResponse>(`/survey/check-link-validity/${linkId}`)
  return data
}

export async function getSurveyById(id: string) {
  const { data } = await http.get<SurveyDetailResponse>(`/survey/${id}`)
  return data
}

export async function submitSurveyAnswers(
  linkId: string,
  payload: {
    surveyAnswers: Array<{
      surveyEntryId: string
      selectedChoices?: string[]
      textAnswer?: string
      gridAnswers?: Record<string, string[]>
    }>
  }
) {
  const { data } = await http.post(`/survey/submit-survey-answers/${linkId}`, payload)
  return data
}


