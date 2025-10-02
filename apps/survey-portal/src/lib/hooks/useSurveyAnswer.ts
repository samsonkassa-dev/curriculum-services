"use client"

import { useEffect, useMemo, useState } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { checkLinkValidity, submitSurveyAnswers, SurveyDetailDto } from "@/lib/surveys"

export type AnswerMap = Record<string, { selectedChoices?: string[]; textAnswer?: string; gridAnswers?: Record<string, string[]> }>

export function useSurveyAnswer(linkId: string | undefined) {
  const [answers, setAnswers] = useState<AnswerMap>(() => {
    // Try to restore answers from localStorage on mount
    if (typeof window !== 'undefined' && linkId) {
      try {
        const saved = localStorage.getItem(`survey_draft:${linkId}`)
        if (saved) {
          const restored = JSON.parse(saved) as AnswerMap
          const count = Object.keys(restored).length
          if (count > 0) {
            // Delay toast to avoid SSR issues
            setTimeout(() => {
              toast.info(`Restored ${count} saved answer${count === 1 ? '' : 's'}`)
            }, 100)
          }
          return restored
        }
      } catch (error) {
        console.error('Failed to restore survey answers:', error)
      }
    }
    return {}
  })
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
  
  // Filter questions based on follow-up logic
  const visibleQuestions = useMemo(() => {
    if (!allEntries.length) return []
    
    return allEntries.filter(question => {
      if (!question.followUp) return true
      
      // This is a follow-up question, check if parent answer matches
      if (!question.parentQuestionNumber || !question.parentChoice) return true
      
      const parentQuestion = allEntries.find(q => q.questionNumber === question.parentQuestionNumber)
      if (!parentQuestion) return true
      
      const parentAnswer = answers[parentQuestion.id]
      if (!parentAnswer?.selectedChoices) return false
      
      return parentAnswer.selectedChoices.includes(question.parentChoice)
    })
  }, [allEntries, answers])

  const setText = (entryId: string, value: string) => setAnswers(p => {
    const updated = { ...p, [entryId]: { ...(p[entryId]||{}), textAnswer: value } }
    // Save to localStorage
    if (typeof window !== 'undefined' && linkId) {
      try {
        localStorage.setItem(`survey_draft:${linkId}`, JSON.stringify(updated))
      } catch (error) {
        console.error('Failed to save survey draft:', error)
      }
    }
    return updated
  })
  
  const toggleChoice = (entryId: string, choiceOrder: string, multiple: boolean) => setAnswers(p => {
    const prev = p[entryId]?.selectedChoices || []
    const next = multiple ? (prev.includes(choiceOrder) ? prev.filter(c=>c!==choiceOrder) : [...prev, choiceOrder]) : [choiceOrder]
    const updated = { ...p, [entryId]: { ...(p[entryId]||{}), selectedChoices: next } }
    // Save to localStorage
    if (typeof window !== 'undefined' && linkId) {
      try {
        localStorage.setItem(`survey_draft:${linkId}`, JSON.stringify(updated))
      } catch (error) {
        console.error('Failed to save survey draft:', error)
      }
    }
    return updated
  })
  
  const setGrid = (entryId: string, row: string, choiceOrder: string) => setAnswers(p => {
    const grid = p[entryId]?.gridAnswers || {}
    grid[row] = [choiceOrder]
    const updated = { ...p, [entryId]: { ...(p[entryId]||{}), gridAnswers: { ...grid } } }
    // Save to localStorage
    if (typeof window !== 'undefined' && linkId) {
      try {
        localStorage.setItem(`survey_draft:${linkId}`, JSON.stringify(updated))
      } catch (error) {
        console.error('Failed to save survey draft:', error)
      }
    }
    return updated
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
    if (!visibleQuestions.length) return false
    for (const q of visibleQuestions) {
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
  }, [answers, visibleQuestions])

  const submit = useMutation({
    mutationFn: () => submitSurveyAnswers(linkId as string, {
      surveyAnswers: visibleQuestions.map(q => ({
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
          if (linkId) {
            localStorage.setItem(`survey_answered:${linkId}`, new Date().toISOString())
            // Clear the draft after successful submission
            localStorage.removeItem(`survey_draft:${linkId}`)
          }
        } catch {}
      }
      setAlreadySubmitted(true)
    },
    onError: (error) => {
      toast.error('Failed to submit survey. Your answers are saved and you can try again.')
      console.error('Survey submission error:', error)
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
    allEntries,
    visibleQuestions,
  }
}


