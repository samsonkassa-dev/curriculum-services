"use client"
import { useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useQuery, useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { checkLinkValidity, submitSurveyAnswers, SurveyDetailDto } from "@/lib/surveys"

type AnswerMap = Record<string, { selectedChoices?: string[]; textAnswer?: string; gridAnswers?: Record<string, string[]> }>

export default function SurveyAnswerPage() {
  const { linkId } = useParams<{ linkId: string }>()
  const router = useRouter()

  const validity = useQuery({
    queryKey: ['survey', 'link-validity', linkId],
    queryFn: async () => await checkLinkValidity(linkId),
    enabled: Boolean(linkId),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  })

  const embeddedSurvey: SurveyDetailDto | undefined = validity.data?.surveyLink?.survey
  const linkMeta = validity.data?.surveyLink

  const [answers, setAnswers] = useState<AnswerMap>({})
  const [showErrors, setShowErrors] = useState(false)

  const setText = (entryId: string, value: string) => setAnswers(p => ({ ...p, [entryId]: { ...(p[entryId]||{}), textAnswer: value } }))
  const toggleChoice = (entryId: string, choice: string, multiple: boolean) => setAnswers(p => {
    const prev = p[entryId]?.selectedChoices || []
    const next = multiple ? (prev.includes(choice) ? prev.filter(c=>c!==choice) : [...prev, choice]) : [choice]
    return { ...p, [entryId]: { ...(p[entryId]||{}), selectedChoices: next } }
  })
  const setGrid = (entryId: string, row: string, col: string) => setAnswers(p => {
    const grid = p[entryId]?.gridAnswers || {}
    // single selection per row
    grid[row] = [col]
    return { ...p, [entryId]: { ...(p[entryId]||{}), gridAnswers: { ...grid } } }
  })

  const sections = embeddedSurvey?.sections ?? []
  const allEntries = useMemo(()=> sections.flatMap(s=>s.questions), [sections])

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
    mutationFn: () => submitSurveyAnswers(linkId, {
      surveyAnswers: allEntries.map(q => ({
        surveyEntryId: q.id,
        selectedChoices: answers[q.id]?.selectedChoices,
        textAnswer: answers[q.id]?.textAnswer,
        gridAnswers: answers[q.id]?.gridAnswers,
      }))
    }),
    onSuccess: () => {
      toast.success("Survey submitted successfully")
      router.push("/")
    },
    onError: (e: unknown) => {
      const err = e as { classification?: { message?: string }, message?: string }
      toast.error(err?.classification?.message ?? err?.message ?? "Failed to submit survey")
    }
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

  if (validity.isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-3" />
        <p className="text-gray-800">Checking link...</p>
      </main>
    )
  }
  if (!validity.data?.surveyLink?.valid) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <p className="text-red-600 text-base">This link has expired.</p>
      </main>
    )
  }
  const survey: SurveyDetailDto | undefined = embeddedSurvey
  if (!survey) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-3" />
        <p className="text-gray-800">Loading survey...</p>
      </main>
    )
  }

  return (
    <main className="max-w-3xl mx-auto p-6">
      <header className="mb-6">
        <div className="bg-white border rounded-lg p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold">{survey.name}</h1>
              {survey.description && <p className="text-gray-600 mt-1">{survey.description}</p>}
            </div>
            {linkMeta && (
              <div className="text-sm text-gray-700">
                <div><span className="font-medium">Trainee:</span> {linkMeta.traineeName}</div>
                <div><span className="font-medium">Cohort:</span> {linkMeta.cohortName}</div>
                <div className="text-gray-500">Expires: {new Date(linkMeta.expiryDate).toLocaleString()}</div>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="space-y-6">
        {survey.sections.map(section => (
          <section key={section.id} className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-5 bg-blue-600 rounded" />
              <h2 className="text-lg font-semibold">{section.title}</h2>
            </div>
            {section.questions.map((q, idx) => (
              <div key={q.id} className="bg-white border rounded-lg p-5 shadow-sm space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <p className="font-medium leading-6">
                    <span className="text-gray-500 mr-2">Q{idx + 1}.</span>
                    {q.question}
                    {q.required && <span className="text-red-500"> *</span>}
                  </p>
                  {!q.required && <span className="text-xs text-gray-500">Optional</span>}
                </div>

                {q.questionType === 'TEXT' && (
                  <textarea
                    className="w-full border rounded px-3 py-2 min-h-28 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Type your answer here"
                    onChange={(e)=>setText(q.id, e.target.value)}
                  />
                )}

                {q.questionType === 'RADIO' && (
                  <div className="grid sm:grid-cols-2 gap-2">
                    {q.choices.map(c => (
                      <label key={c} className="flex items-center gap-3 p-3 border rounded hover:bg-gray-50 cursor-pointer">
                        <input
                          type="radio"
                          name={q.id}
                          className="h-5 w-5 accent-blue-600"
                          onChange={()=>toggleChoice(q.id, c, false)}
                        />
                        <span className="text-sm">{c}</span>
                      </label>
                    ))}
                  </div>
                )}

                {q.questionType === 'CHECKBOX' && (
                  <div className="grid sm:grid-cols-2 gap-2">
                    {q.choices.map(c => (
                      <label key={c} className="flex items-center gap-3 p-3 border rounded hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          className="h-5 w-5 accent-blue-600"
                          checked={!!answers[q.id]?.selectedChoices?.includes(c)}
                          onChange={()=>toggleChoice(q.id, c, true)}
                        />
                        <span className="text-sm">{c}</span>
                      </label>
                    ))}
                  </div>
                )}

                {q.questionType === 'GRID' && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full border rounded overflow-hidden">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="border px-3 py-2 text-left text-sm font-medium text-gray-700">Row</th>
                          {q.choices.map(c => <th key={c} className="border px-3 py-2 text-sm font-medium text-gray-700">{c}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {q.rows.map((r, ri) => (
                          <tr key={r} className={ri % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="border px-3 py-2 text-sm text-gray-700">{r}</td>
                            {q.choices.map(c => (
                              <td key={c} className="border px-3 py-2 text-center">
                                <input
                                  type="radio"
                                  name={`${q.id}-${r}`}
                                  className="h-5 w-5 accent-blue-600"
                                  onChange={()=>setGrid(q.id, r, c)}
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {q.required && showErrors && !isAnswered(q) && (
                  <p className="text-sm text-red-600">This question is required.</p>
                )}
              </div>
            ))}
          </section>
        ))}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          disabled={submit.isPending}
          className="px-5 py-2 rounded bg-blue-600 text-white disabled:opacity-60 shadow-sm"
          onClick={() => {
            if (!canSubmit) {
              setShowErrors(true)
              toast.error('Please answer all required questions')
              return
            }
            submit.mutate()
          }}
        >
          {submit.isPending ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </main>
  )
}


