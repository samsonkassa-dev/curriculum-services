import { useEffect, useMemo, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useSurveys } from "@/lib/hooks/useSurvey"
import { useAnsweredTrainees } from "@/lib/hooks/useSurveyAnswers"
import {
  useCreateCohortAnswerLinks,
  useCreateTraineeAnswerLinks,
  toExpiryMinutes,
  buildPortalLink,
  useGetAnswerLinks,
  useExtendAnswerLink,
  useDeleteAnswerLink,
} from "@/lib/hooks/useSurveyLinks"

export type ViewMode = 'all' | 'answered'

export function useCohortSurveyLinks(trainingId: string, traineeIds: string[]) {
  const [selectedSurveyId, setSelectedSurveyId] = useState("")
  const [viewMode, setViewMode] = useState<ViewMode>('all')
  const [expiryValue, setExpiryValue] = useState<number>(1)
  const [expiryUnit, setExpiryUnit] = useState<'minutes'|'hours'|'days'|'weeks'>('days')

  const { data: surveysRes } = useSurveys(trainingId)
  const surveys = (surveysRes?.surveys ?? []).map(s => ({ id: s.id, name: s.name }))

  const answeredQuery = useAnsweredTrainees(selectedSurveyId || undefined)
  const answeredIds = useMemo(() => new Set((answeredQuery.data?.trainees || []).map(t => t.id)), [answeredQuery.data])

  const linksQuery = useGetAnswerLinks(selectedSurveyId || undefined, (traineeIds?.length ? traineeIds : undefined))
  const traineeIdToMeta: Record<string, { fullLink: string; linkId: string; expiryDate?: string; valid: boolean }> = {}
  if (linksQuery.data?.surveyLinks) {
    for (const l of linksQuery.data.surveyLinks) {
      if (l.traineeId && l.link) {
        const full = buildPortalLink(l.link)
        const id = (l.link.split("/survey/answer/")[1] || "").split("/")[0]
        traineeIdToMeta[l.traineeId] = { fullLink: full, linkId: id, expiryDate: l.expiryDate, valid: Boolean(l.valid) }
      }
    }
  }

  const { mutate: createCohortLinks } = useCreateCohortAnswerLinks()
  const { mutate: createTraineeLinks } = useCreateTraineeAnswerLinks()
  const { mutate: extendLinkMutate } = useExtendAnswerLink()
  const { mutate: deleteLinkMutate } = useDeleteAnswerLink()

  const generateForCohort = (cohortId: string) => {
    if (!selectedSurveyId) return
    const expiryMinutes = toExpiryMinutes(expiryValue, expiryUnit)
    createCohortLinks({ surveyId: selectedSurveyId, cohortId, expiryMinutes })
  }

  const generateForTrainee = (traineeId: string) => {
    if (!selectedSurveyId) return
    const expiryMinutes = toExpiryMinutes(expiryValue, expiryUnit)
    createTraineeLinks({ surveyId: selectedSurveyId, traineeIds: [traineeId], expiryMinutes })
  }

  const extendLink = (args: { linkId: string; byValue: number; byUnit: 'minutes'|'hours'|'days'|'weeks' }) => {
    const expiryMinutes = toExpiryMinutes(args.byValue, args.byUnit)
    extendLinkMutate({ linkId: args.linkId, expiryMinutes })
  }

  const deleteLink = (linkId: string) => deleteLinkMutate({ linkId })

  const base = process.env.NEXT_PUBLIC_SURVEY_PORTAL_URL || "https://curriculum-services-survey-portal.vercel.app"
  const getAnswersLink = (surveyId?: string, traineeId?: string) => (surveyId && traineeId ? `${base}/survey/answers/${surveyId}/${traineeId}` : undefined)

  const queryClient = useQueryClient()
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const d = event.data as { type?: string; surveyId?: string; traineeId?: string }
      if (d?.type === 'survey-answered') {
        queryClient.invalidateQueries({ queryKey: ["survey", "answered-trainees", selectedSurveyId] })
        queryClient.invalidateQueries({ queryKey: ["survey", "answer-links"] })
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [queryClient, selectedSurveyId])

  return {
    selectedSurveyId,
    setSelectedSurveyId,
    viewMode,
    setViewMode,
    expiryValue,
    setExpiryValue,
    expiryUnit,
    setExpiryUnit,
    surveys,
    answeredIds,
    answeredLoading: answeredQuery.isLoading,
    traineeIdToMeta,
    linksLoading: linksQuery.isLoading,
    refetchAnswered: answeredQuery.refetch,
    refetchLinks: linksQuery.refetch,
    generateForCohort,
    generateForTrainee,
    extendLink,
    deleteLink,
    getAnswersLink,
  }
}


