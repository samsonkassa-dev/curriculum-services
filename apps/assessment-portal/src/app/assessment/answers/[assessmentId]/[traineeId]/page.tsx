"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { assessmentService } from "@/lib/assessments"
import { decodeJWT, isTokenExpired } from "@curriculum-services/auth"

type AttemptSummary = {
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
  attemptStatus: string
}

type AttemptDetail = {
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
  attemptStatus: string
  assessmentAnswers: Array<{
    id: string
    traineeId: string
    traineeName: string
    assessmentEntryId: string
    question: string
    questionType: string
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

export default function AssessmentAnswersPage() {
  const router = useRouter()
  const { assessmentId, traineeId } = useParams<{ assessmentId: string; traineeId: string }>()
  const search = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : undefined
  const attemptTypeFilter = search?.get('attemptType') || undefined

  const [isAuthed, setIsAuthed] = useState(false)
  const [roleAllowed, setRoleAllowed] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)

  // Auth gate (mirror survey-portal)
  useEffect(() => {
    try {
      const token = typeof document !== 'undefined'
        ? document.cookie.split('; ').find(c => c.startsWith('token='))?.split('=')[1]
        : undefined
      const decoded = token ? decodeJWT(token) : null
      const ok = Boolean(decoded && !isTokenExpired(decoded))
      const allowed = Boolean(decoded?.role && ['ROLE_PROJECT_MANAGER','ROLE_TRAINER','ROLE_TRAINING_ADMIN','ROLE_COMPANY_ADMIN'].includes(decoded.role))
      setIsAuthed(ok)
      setRoleAllowed(allowed)
    } catch (error) {
      console.error('Auth check error:', error)
      setIsAuthed(false)
      setRoleAllowed(false)
    } finally {
      setAuthChecked(true)
    }
  }, [])

  // Fetch attempts for this assessment (server will identify tenant via token)
  const attemptsQ = useQuery({
    queryKey: ['assessment', 'attempts', assessmentId, traineeId],
    queryFn: async () => {
      const response = await assessmentService.getAttemptsByAssessment(assessmentId, traineeId)
      return (response.assessmentAttempts || []) as AttemptSummary[]
    },
    enabled: Boolean(assessmentId && traineeId && isAuthed && roleAllowed),
  })

  // Choose attempt to show: prefer latest GRADED/SUBMITTED for the target trainee, else latest attempt
  const chosenAttemptId = useMemo(() => {
    const all = attemptsQ.data || []
    if (!Array.isArray(all) || all.length === 0) return undefined
    
    let mine = all.filter(a => a?.traineeId === traineeId)
    if (attemptTypeFilter) {
      mine = mine.filter(a => a?.attemptType === attemptTypeFilter)
    }
    if (!mine.length) return undefined
    
    const byNumberDesc = [...mine].sort((a, b) => (b?.attemptNumber || 0) - (a?.attemptNumber || 0))
    const preferred = byNumberDesc.find(a => a?.attemptStatus === 'GRADED' || a?.submittedAt)
    const chosen = preferred || byNumberDesc[0]
    return chosen?.id
  }, [attemptsQ.data, traineeId, attemptTypeFilter])

  const detailQ = useQuery({
    queryKey: ['assessment', 'attempt-detail', chosenAttemptId],
    queryFn: async () => (await assessmentService.getAttemptDetail(chosenAttemptId as string)).assessmentAttempt as AttemptDetail,
    enabled: Boolean(chosenAttemptId && isAuthed && roleAllowed),
  })

  // Redirect in effect similar to survey-portal
  const [redirecting, setRedirecting] = useState(false)
  useEffect(() => {
    if (!authChecked) return
    if (!isAuthed) {
      setRedirecting(true)
      const redirectUrl = attemptTypeFilter 
        ? `/login?redirect=/assessment/answers/${assessmentId}/${traineeId}?attemptType=${attemptTypeFilter}`
        : `/login?redirect=/assessment/answers/${assessmentId}/${traineeId}`
      router.replace(redirectUrl)
      return
    }
    if (isAuthed && !roleAllowed) {
      setRedirecting(true)
      router.replace(`/`)
      return
    }
    setRedirecting(false)
  }, [authChecked, isAuthed, roleAllowed, router, assessmentId, traineeId, attemptTypeFilter])

  if (!authChecked || redirecting) return null
  if (!isAuthed || !roleAllowed) return null

  if (attemptsQ.isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-3" />
        <p className="text-gray-800">Loading attempts...</p>
      </main>
    )
  }

  if (attemptsQ.error) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <p className="text-red-600">Error loading attempts. Please try again.</p>
      </main>
    )
  }

  if (!attemptsQ.data || !Array.isArray(attemptsQ.data) || !(attemptsQ.data || []).some(a => a?.traineeId === traineeId)) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <p className="text-gray-800">No attempts found for this trainee.</p>
      </main>
    )
  }

  if (detailQ.isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-3" />
        <p className="text-gray-800">Loading answers...</p>
      </main>
    )
  }

  if (detailQ.error) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <p className="text-red-600">Error loading answer details. Please try again.</p>
      </main>
    )
  }

  if (!detailQ.data) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <p className="text-gray-800">No answer details found.</p>
      </main>
    )
  }

  const attempt = detailQ.data
  if (!attempt?.assessment || !attempt?.assessmentAnswers) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <p className="text-gray-800">Invalid assessment data.</p>
      </main>
    )
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <header className="mb-8 text-center">
        <h1 className="text-2xl font-bold">{attempt.assessment?.name || 'Assessment'} - Responses</h1>
        <p className="text-gray-600 text-sm mt-2">Trainee: {attempt.traineeName || traineeId || 'Unknown'}</p>
        <p className="text-gray-600 text-sm">
          Attempt {attempt.attemptNumber || 1} • {attempt.attemptStatus || 'N/A'}
          {attempt.percentage != null ? ` • ${attempt.percentage.toFixed(2)}%` : ''}
        </p>
      </header>

      <div className="space-y-6">
        {Array.isArray(attempt.assessmentAnswers) && attempt.assessmentAnswers.length > 0 ? (
          attempt.assessmentAnswers.map((ans, idx) => {
            if (!ans?.id) return null
            
            const isText = ans.questionType === 'TEXT'
            const anyChoices = Array.isArray(ans.selectedChoices) && ans.selectedChoices.length > 0
            
            return (
              <section key={ans.id} className="space-y-3">
                <div className="bg-white border rounded p-4">
                  <p className="font-medium mb-1">
                    <span className="text-gray-500 mr-2">Q{idx + 1}.</span>
                    {ans.question || 'No question text'}
                  </p>
                  {!isText && (
                    <div className="space-y-2 mt-2">
                      {anyChoices ? ans.selectedChoices.map((c, i) => {
                        if (!c) return null
                        return (
                          <div 
                            key={c.id || `choice-${i}`} 
                            className={`text-sm p-2 rounded border ${
                              c.isCorrect === false 
                                ? 'border-red-300 bg-red-50' 
                                : c.isCorrect === true 
                                ? 'border-green-300 bg-green-50' 
                                : 'border-gray-200'
                            }`}
                          >
                            {c.choiceText || 'No text'}
                            {c.isCorrect === false && <span className="ml-2 text-xs text-red-600">(Incorrect)</span>}
                            {c.isCorrect === true && <span className="ml-2 text-xs text-green-700">(Correct)</span>}
                          </div>
                        )
                      }) : (
                        <p className="text-sm text-gray-600">No answer provided</p>
                      )}
                    </div>
                  )}
                  {isText && (
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {ans.textAnswer || 'No answer provided'}
                    </p>
                  )}
                  {typeof ans.score === 'number' && (
                    <p className="text-xs text-gray-500 mt-2">
                      Score: {ans.score}
                      {typeof ans.questionWeight === 'number' ? ` / ${ans.questionWeight}` : ''}
                    </p>
                  )}
                </div>
              </section>
            )
          })
        ) : (
          <div className="text-center text-gray-600 py-8">
            No answers found for this attempt.
          </div>
        )}
      </div>
    </main>
  )
}


