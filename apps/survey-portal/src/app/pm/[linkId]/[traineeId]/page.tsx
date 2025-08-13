/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { getSurveyById, checkLinkValidity, fetchSurveyAnswers } from "@/lib/surveys"
import { decodeJWT, isTokenExpired } from "@curriculum-services/auth"

type AnswerRow = { questionId: string; question: string; answer: string | string[] }

export default function PMAnswersPage() {
  const params = useParams<{ linkId: string; traineeId: string }>()
  const router = useRouter()
  const linkId = params.linkId
  const traineeId = params.traineeId

  const [checked, setChecked] = useState(false)

  useEffect(() => {
    const token = document.cookie.split('; ').find(c => c.startsWith('token='))?.split('=')[1]
    const decoded = token ? decodeJWT(token) : null
    const allowedRoles = ['ROLE_PROJECT_MANAGER','ROLE_TRAINING_ADMIN']
    const isAuthed = Boolean(decoded && !isTokenExpired(decoded))
    const isAllowed = Boolean(isAuthed && decoded?.role && allowedRoles.includes(decoded.role))
    if (!isAuthed) {
      router.replace(`/login?redirect=/pm/${linkId}/${traineeId}`)
      setChecked(true)
      return
    }
    if (isAuthed && !isAllowed) {
      router.replace(`/`)
      setChecked(true)
      return
    }
    setChecked(true)
  }, [router, linkId, traineeId])

  const validity = useQuery({
    queryKey: ["survey-link", linkId],
    queryFn: () => checkLinkValidity(linkId),
    enabled: !!linkId,
  })
  const surveyId = validity.data?.surveyLink?.surveyId
  const { data: survey } = useQuery({
    queryKey: ["survey", surveyId],
    queryFn: async () => (await getSurveyById(surveyId as string)).survey,
    enabled: !!surveyId,
  })

  // Placeholder until PM answers endpoint is defined for this portal
  const answersQ = useQuery({
    queryKey: ['survey', 'answers', surveyId, traineeId],
    queryFn: () => fetchSurveyAnswers(surveyId as string, traineeId),
    enabled: Boolean(surveyId && traineeId),
  })

  if (!checked || !survey || answersQ.isLoading) return null

  return (
    <main className="max-w-3xl mx-auto p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">{survey.name} - Responses</h1>
      </header>
      <div className="space-y-6">
        {survey.sections.map(section => (
          <section key={section.id} className="space-y-3">
            <h3 className="text-base font-semibold">{section.title}</h3>
            {section.questions.map((q, idx) => {
              const a = answersQ.data?.surveyAnswers.find(x => x.surveyEntryId === q.id)
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


