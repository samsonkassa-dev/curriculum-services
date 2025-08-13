"use client"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { getSurveyById, fetchSurveyAnswers } from "@/lib/surveys"
import { decodeJWT, isTokenExpired } from "@curriculum-services/auth"

export default function AnswersBySurveyAndTraineePage() {
  const router = useRouter()
  const { surveyId, traineeId } = useParams<{ surveyId: string; traineeId: string }>()

  // Auth gate: do NOT run queries until authenticated and role-allowed
  const [isAuthed, setIsAuthed] = useState(false)
  const [roleAllowed, setRoleAllowed] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    const token = typeof document !== 'undefined'
      ? document.cookie.split('; ').find(c => c.startsWith('token='))?.split('=')[1]
      : undefined
    const decoded = token ? decodeJWT(token) : null
    const ok = Boolean(decoded && !isTokenExpired(decoded))
    const allowed = Boolean(decoded?.role && ['ROLE_PROJECT_MANAGER','ROLE_TRAINER','ROLE_TRAINING_ADMIN'].includes(decoded.role))
    setIsAuthed(ok)
    setRoleAllowed(allowed)
    setAuthChecked(true)
  }, [])

  const surveyQ = useQuery({
    queryKey: ['survey', surveyId],
    queryFn: async () => (await getSurveyById(surveyId)).survey,
    enabled: Boolean(surveyId && isAuthed && roleAllowed),
  })

  const answersQ = useQuery({
    queryKey: ['survey', 'answers', surveyId, traineeId],
    queryFn: () => fetchSurveyAnswers(surveyId, traineeId),
    enabled: Boolean(surveyId && traineeId && isAuthed && roleAllowed),
  })

  // Redirect in effect to avoid setState during render warnings
  const [redirecting, setRedirecting] = useState(false)
  useEffect(() => {
    if (!authChecked) return
    if (!isAuthed) {
      setRedirecting(true)
      router.replace(`/login?redirect=/survey/answers/${surveyId}/${traineeId}`)
      return
    }
    if (isAuthed && !roleAllowed) {
      setRedirecting(true)
      router.replace(`/`)
      return
    }
    setRedirecting(false)
  }, [authChecked, isAuthed, roleAllowed, router, surveyId, traineeId])

  if (!authChecked || redirecting) return null

  if (!isAuthed || !roleAllowed) return null

  if (surveyQ.isLoading || answersQ.isLoading) return null
  if (!surveyQ.data || !answersQ.data) return null

  const survey = surveyQ.data
  const answers = answersQ.data

  return (
    <main className="max-w-3xl mx-auto p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">{survey.name} - Responses</h1>
        <p className="text-gray-600 text-sm mt-1">Trainee: {answers.surveyAnswers[0]?.traineeName || answers.traineeId}</p>
      </header>
      <div className="space-y-6">
        {survey.sections.map(section => (
          <section key={section.id} className="space-y-3">
            <h3 className="text-base font-semibold">{section.title}</h3>
            {section.questions.map((q, idx) => {
              const a = answers.surveyAnswers.find(x => x.surveyEntryId === q.id)
              const value = a?.textAnswer || (a?.selectedChoices?.join(', ') || '') || (a?.gridAnswers ? JSON.stringify(a.gridAnswers) : '')
              return (
                <div key={q.id} className="bg-white border rounded p-4">
                  <p className="font-medium mb-1"><span className="text-gray-500 mr-2">Q{idx+1}.</span>{q.question}</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{value || '—'}</p>
                </div>
              )
            })}
          </section>
        ))}
      </div>
    </main>
  )
}


