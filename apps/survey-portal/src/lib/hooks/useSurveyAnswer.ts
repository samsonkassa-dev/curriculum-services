"use client"

import { useEffect, useMemo, useState } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { checkLinkValidity, submitSurveyAnswers, SurveyDetailDto } from "@/lib/surveys"

export type AnswerMap = Record<string, { selectedChoices?: string[]; textAnswer?: string; gridAnswers?: Record<string, string[]> }>

export function useSurveyAnswer(linkId: string | undefined) {
  const [answers, setAnswers] = useState<AnswerMap>({})
  const [showErrors, setShowErrors] = useState(false)
  const [alreadySubmitted, setAlreadySubmitted] = useState(false)

  const validity = useQuery({
    queryKey: ['survey', 'link-validity', linkId],
    queryFn: async () => await checkLinkValidity(linkId as string),
    enabled: Boolean(linkId),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  const embeddedSurvey: SurveyDetailDto | undefined = validity.data?.surveyLink?.survey
  const linkMeta = validity.data?.surveyLink
  const allEntries = useMemo(() => (embeddedSurvey?.sections ?? []).flatMap(s => s.questions), [embeddedSurvey])

  const setText = (entryId: string, value: string) => setAnswers(p => ({ ...p, [entryId]: { ...(p[entryId]||{}), textAnswer: value } }))
  const toggleChoice = (entryId: string, choice: string, multiple: boolean) => setAnswers(p => {
    const prev = p[entryId]?.selectedChoices || []
    const next = multiple ? (prev.includes(choice) ? prev.filter(c=>c!==choice) : [...prev, choice]) : [choice]
    return { ...p, [entryId]: { ...(p[entryId]||{}), selectedChoices: next } }
  })
  const setGrid = (entryId: string, row: string, col: string) => setAnswers(p => {
    const grid = p[entryId]?.gridAnswers || {}
    grid[row] = [col]
    return { ...p, [entryId]: { ...(p[entryId]||{}), gridAnswers: { ...grid } } }
  })

  const isAnswered = (q: typeof allEntries[number]): boolean => {
    const a = answers[q.id]
    if (!q.required) return true
    if (q.questionType === 'TEXT') return Boolean(a?.textAnswer && a.textAnswer.trim() !== '')
    if (q.questionType === 'RADIO') return Boolean(a?.selectedChoices && a.selectedChoices.length > 0)
    if (q.questionType === 'CHECKBOX') return Boolean(a?.selectedChoices && a.selectedChoices.length > 0)
    if (q.questionType === 'GRID') {
      const rows = q.rows || []
      if (!a?.gridAnswers) return false
      return rows.every(r => Array.isArray(a.gridAnswers?.[r]) && a.gridAnswers[r].length > 0)
    }
    return true
  }

  const canSubmit = useMemo(()=> {
    if (!allEntries.length) return false
    for (const q of allEntries) {
      const a = answers[q.id]
      if (q.required) {
        if (q.questionType === 'TEXT') {
          if (!a?.textAnswer?.trim()) return false
        } else if (q.questionType === 'RADIO') {
          if (!a?.selectedChoices || a.selectedChoices.length === 0) return false
        } else if (q.questionType === 'CHECKBOX') {
          if (!a?.selectedChoices || a.selectedChoices.length === 0) return false
        } else if (q.questionType === 'GRID') {
          const rows = q.rows || []
          if (!a?.gridAnswers) return false
          for (const r of rows) {
            if (!a.gridAnswers[r] || a.gridAnswers[r].length === 0) return false
          }
        }
      }
    }
    return true
  }, [answers, allEntries])

  const submit = useMutation({
    mutationFn: () => submitSurveyAnswers(linkId as string, {
      surveyAnswers: allEntries.map(q => ({
        surveyEntryId: q.id,
        selectedChoices: answers[q.id]?.selectedChoices,
        textAnswer: answers[q.id]?.textAnswer,
        gridAnswers: answers[q.id]?.gridAnswers,
      }))
    }),
    onSuccess: () => {
      toast.success("Survey submitted successfully")
      try {
        const answeredSurveyId = embeddedSurvey?.id || validity.data?.surveyLink?.surveyId
        const answeredTraineeId = linkMeta?.traineeId as string | undefined
        if (typeof window !== 'undefined' && (answeredSurveyId || answeredTraineeId)) {
          window.opener?.postMessage({ type: 'survey-answered', surveyId: answeredSurveyId, traineeId: answeredTraineeId }, '*')
        }
      } catch {}
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem('surveySubmitted', '1')
          if (linkId) localStorage.setItem(`survey_answered:${linkId}`, new Date().toISOString())
        } catch {}
      }
      setAlreadySubmitted(true)
    }
  })

  const submitWithValidation = () => {
    if (!canSubmit) {
      setShowErrors(true)
      toast.error('Please answer all required questions')
      return
    }
    submit.mutate()
  }

  useEffect(() => {
    if (!linkId) return
    try {
      const v = localStorage.getItem(`survey_answered:${linkId}`)
      if (v) setAlreadySubmitted(true)
    } catch {}
  }, [linkId])

  return {
    validity,
    embeddedSurvey,
    linkMeta,
    answers,
    setText,
    toggleChoice,
    setGrid,
    isAnswered,
    canSubmit,
    showErrors,
    setShowErrors,
    submit,
    submitWithValidation,
    alreadySubmitted,
  }
}


