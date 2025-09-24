import { useEffect, useMemo, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { useAssessments, useDeleteAssessmentLink } from "@/lib/hooks/useAssessment"
import {
  useCreateCohortAssessmentLinks,
  useCreateTraineeAssessmentLinks,
  toExpiryMinutes,
  buildAssessmentPortalLink,
  useGetAssessmentLinks,
  useExtendAssessmentLink,
} from "@/lib/hooks/useAssessmentLinks"

export type ViewMode = 'all' | 'answered'

export function useCohortAssessmentLinks(trainingId: string, cohortId: string, traineeIds: string[]) {
  const [selectedAssessmentId, setSelectedAssessmentId] = useState("")
  const [viewMode, setViewMode] = useState<ViewMode>('all')
  const [linkType, setLinkType] = useState<'PRE_ASSESSMENT' | 'POST_ASSESSMENT'>('PRE_ASSESSMENT')
  const [expiryValue, setExpiryValue] = useState<number>(1)
  const [expiryUnit, setExpiryUnit] = useState<'minutes'|'hours'|'days'|'weeks'>('days')

  const { data: assessmentsRes } = useAssessments(trainingId)
  const assessments = (assessmentsRes?.assessments ?? []).map(a => ({ id: a.id, name: a.name }))

  const linksQuery = useGetAssessmentLinks(selectedAssessmentId || undefined, (traineeIds?.length ? traineeIds : undefined))
  
  // Derive answered status from links data (invalid links = answered trainees)
  const answeredIds = useMemo(() => {
    const answered = new Set<string>()
    if (linksQuery.data?.assessmentLinks) {
      for (const l of linksQuery.data.assessmentLinks) {
        if (l.traineeId && l.linkType === linkType && !l.valid) {
          answered.add(l.traineeId)
        }
      }
    }
    return answered
  }, [linksQuery.data, linkType])

  const traineeIdToMeta: Record<string, { fullLink: string; linkId: string; expiryDate?: string; valid: boolean; linkType: string }> = {}
  if (linksQuery.data?.assessmentLinks) {
    for (const l of linksQuery.data.assessmentLinks) {
      // Filter by current linkType selection to show only relevant links
      if (l.traineeId && l.link && l.linkType === linkType) {
        const full = buildAssessmentPortalLink(l.link)
        // Extract linkId from URL like "/assessment/answer/abc123/trainee456"
        const id = (l.link.split("/assessment/answer/")[1] || "").split("/")[0]
        traineeIdToMeta[l.traineeId] = { 
          fullLink: full, 
          linkId: id, 
          expiryDate: l.expiryDate, 
          valid: Boolean(l.valid),
          linkType: l.linkType
        }
      }
    }
  }

  const { mutate: createCohortLinks } = useCreateCohortAssessmentLinks()
  const { mutate: createTraineeLinks } = useCreateTraineeAssessmentLinks()
  const { mutate: extendLinkMutate } = useExtendAssessmentLink()
  const { mutate: deleteLinkMutate } = useDeleteAssessmentLink()

  const generateForCohort = (cohortId: string) => {
    if (!selectedAssessmentId) return
    const expiryMinutes = toExpiryMinutes(expiryValue, expiryUnit)
    createCohortLinks({ assessmentId: selectedAssessmentId, cohortIds: [cohortId], linkType, expiryMinutes })
  }

  const generateForMultipleCohorts = (cohortIds: string[]) => {
    if (!selectedAssessmentId) return
    const expiryMinutes = toExpiryMinutes(expiryValue, expiryUnit)
    createCohortLinks({ assessmentId: selectedAssessmentId, cohortIds, linkType, expiryMinutes })
  }

  const generateForTrainee = (traineeId: string) => {
    if (!selectedAssessmentId) return
    const expiryMinutes = toExpiryMinutes(expiryValue, expiryUnit)
    createTraineeLinks({ assessmentId: selectedAssessmentId, cohortId, traineeIds: [traineeId], linkType, expiryMinutes })
  }

  const extendLink = (args: { linkId: string; byValue: number; byUnit: 'minutes'|'hours'|'days'|'weeks' }) => {
    const expiryMinutes = toExpiryMinutes(args.byValue, args.byUnit)
    extendLinkMutate({ linkId: args.linkId, expiryMinutes })
  }

  const deleteLink = (linkId: string) => deleteLinkMutate(linkId)

  const base = process.env.NEXT_PUBLIC_ASSESSMENTPORTAL || "http://localhost:3002"
  const getAnswersLink = (assessmentId?: string, traineeId?: string) => 
    (assessmentId && traineeId ? `${base}/assessment/answers/${assessmentId}/${traineeId}` : undefined)

  const queryClient = useQueryClient()
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const d = event.data as { type?: string; assessmentId?: string; traineeId?: string }
      if (d?.type === 'assessment-answered') {
        queryClient.invalidateQueries({ queryKey: ["assessment", "answered-trainees", selectedAssessmentId] })
        queryClient.invalidateQueries({ queryKey: ["assessment", "answer-links"] })
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [queryClient, selectedAssessmentId])

  return {
    selectedAssessmentId,
    setSelectedAssessmentId,
    viewMode,
    setViewMode,
    linkType,
    setLinkType,
    expiryValue,
    setExpiryValue,
    expiryUnit,
    setExpiryUnit,
    assessments,
    answeredIds,
    answeredLoading: linksQuery.isLoading, // Now derived from links query
    traineeIdToMeta,
    linksLoading: linksQuery.isLoading,
    refetchAnswered: linksQuery.refetch, // Refetch links to update answered status
    refetchLinks: linksQuery.refetch,
    generateForCohort,
    generateForMultipleCohorts,
    generateForTrainee,
    extendLink,
    deleteLink,
    getAnswersLink,
  }
}
