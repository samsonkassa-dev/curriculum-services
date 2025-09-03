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

export interface Choice {
  order: string
  choiceText: string
  choiceImageUrl: string | null
}

export interface SurveyEntryDto {
  id: string
  questionNumber: number
  question: string
  questionType: QuestionType
  questionImageUrl: string | null
  choices: Choice[]
  allowMultipleAnswers: boolean
  allowOtherAnswer: boolean
  rows: string[]
  parentQuestionNumber: number | null
  parentChoice: string | null
  followUp: boolean
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

export interface SurveyAnswersResponse {
  surveyId: string
  code: string
  count: number
  surveyAnswers: Array<{
    surveyAnswerId: string
    traineeId: string
    traineeName: string
    surveyEntryId: string
    question: string
    questionType: QuestionType
    selectedChoices: string[]
    textAnswer: string | null
    gridAnswers: Record<string, string[]>
  }>
  message: string
  traineeId: string
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

export async function fetchSurveyAnswers(surveyId: string, traineeId: string) {
  const { data } = await http.get<SurveyAnswersResponse>(`/survey/${surveyId}/answers/${traineeId}`)
  return data
}


