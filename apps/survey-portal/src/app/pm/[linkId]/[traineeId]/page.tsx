/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
import { useEffect } from "react"
import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { getSurveyById, checkLinkValidity } from "@/lib/surveys"
import { decodeJWT, isTokenExpired } from "@curriculum-services/auth"

type AnswerRow = { questionId: string; question: string; answer: string | string[] }

export default function PMAnswersPage() {
  const params = useParams<{ linkId: string; traineeId: string }>()
  const linkId = params.linkId
  const traineeId = params.traineeId

  useEffect(() => {
    const token = document.cookie.split('; ').find(c => c.startsWith('token='))?.split('=')[1]
    const decoded = token ? decodeJWT(token) : null
    if (!decoded || isTokenExpired(decoded) || !decoded.role || !['ROLE_PROJECT_MANAGER','ROLE_TRAINING_ADMIN'].includes(decoded.role)) {
      window.location.href = '/'
    }
  }, [])

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
  const answers = { answers: [] as AnswerRow[] }

  if (!survey) return <div className="p-8">Loading...</div>

  return (
    <main className="max-w-3xl mx-auto p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">{survey.name} - Responses</h1>
      </header>
      <div className="space-y-4">
        {(answers?.answers as AnswerRow[] ?? []).map((a) => (
          <div key={a.questionId} className="bg-white border rounded p-4">
            <p className="font-medium mb-1">{a.question}</p>
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">{Array.isArray(a.answer) ? a.answer.join(', ') : a.answer}</pre>
          </div>
        ))}
      </div>
    </main>
  )
}


