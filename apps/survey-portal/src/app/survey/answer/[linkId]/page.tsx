"use client"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useSurveyAnswer } from "@/lib/hooks/useSurveyAnswer"

export default function SurveyAnswerPage() {
  const { linkId } = useParams<{ linkId: string }>()
  const {
    validity,
    embeddedSurvey,
    linkMeta,
    answers,
    setText,
    toggleChoice,
    setGrid,
    isAnswered,
    showErrors,
    submit,
    submitWithValidation,
    alreadySubmitted,
    visibleQuestions,
  } = useSurveyAnswer(linkId)

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
  if (alreadySubmitted) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-white border rounded-lg shadow-sm px-6 py-8 text-center max-w-md">
          <div className="mx-auto mb-3 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <span className="text-green-600 text-xl">✓</span>
          </div>
          <h2 className="text-lg font-semibold mb-1">You already submitted this survey</h2>
          <p className="text-sm text-gray-600">Thank you! Your response has been recorded.</p>
          <Link href="/" className="inline-block mt-3 text-sm text-blue-600 underline">Go back to home</Link>
        </div>
      </main>
    )
  }
  const survey = embeddedSurvey
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
        {survey.sections.map(section => {
          // Filter visible questions for this section
          const sectionQuestions = visibleQuestions.filter(q => 
            section.questions.some(sq => sq.id === q.id)
          )
          
          if (sectionQuestions.length === 0) return null
          
          return (
            <section key={section.id} className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-5 bg-blue-600 rounded" />
                <h2 className="text-lg font-semibold">{section.title}</h2>
              </div>
              {sectionQuestions.map((q) => (
                <div key={q.id} className="bg-white border rounded-lg p-5 shadow-sm space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-medium leading-6">
                        <span className="text-gray-500 mr-2">Q{q.questionNumber}.</span>
                        {q.question}
                        {q.required && <span className="text-red-500"> *</span>}
                        {q.followUp && <span className="text-blue-600 text-sm ml-2">(Follow-up)</span>}
                      </p>
                      {q.questionImageUrl && (
                        <div className="mt-3">
                          <img 
                            src={q.questionImageUrl} 
                            alt="Question image" 
                            className="max-w-full h-auto rounded border"
                          />
                        </div>
                      )}
                    </div>
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
                    {q.choices.sort((a, b) => a.order.localeCompare(b.order)).map(choice => (
                      <label key={choice.order} className="flex items-center gap-3 p-3 border rounded hover:bg-gray-50 cursor-pointer">
                        <input
                          type="radio"
                          name={q.id}
                          className="h-5 w-5 accent-blue-600"
                          checked={answers[q.id]?.selectedChoices?.includes(choice.order)}
                          onChange={()=>toggleChoice(q.id, choice.order, false)}
                        />
                        <div className="flex-1">
                          <span className="text-sm">{choice.order}. {choice.choiceText}</span>
                          {choice.choiceImageUrl && (
                            <div className="mt-2">
                              <img 
                                src={choice.choiceImageUrl} 
                                alt={`Choice ${choice.order} image`} 
                                className="max-w-full h-auto rounded border"
                              />
                            </div>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                )}

                {q.questionType === 'CHECKBOX' && (
                  <div className="grid sm:grid-cols-2 gap-2">
                    {q.choices.sort((a, b) => a.order.localeCompare(b.order)).map(choice => (
                      <label key={choice.order} className="flex items-center gap-3 p-3 border rounded hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          className="h-5 w-5 accent-blue-600"
                          checked={!!answers[q.id]?.selectedChoices?.includes(choice.order)}
                          onChange={()=>toggleChoice(q.id, choice.order, true)}
                        />
                        <div className="flex-1">
                          <span className="text-sm">{choice.order}. {choice.choiceText}</span>
                          {choice.choiceImageUrl && (
                            <div className="mt-2">
                              <img 
                                src={choice.choiceImageUrl} 
                                alt={`Choice ${choice.order} image`} 
                                className="max-w-full h-auto rounded border"
                              />
                            </div>
                          )}
                        </div>
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
                          {q.choices.sort((a, b) => a.order.localeCompare(b.order)).map(choice => 
                            <th key={choice.order} className="border px-3 py-2 text-sm font-medium text-gray-700">
                              {choice.order}. {choice.choiceText}
                            </th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {q.rows.map((r, ri) => (
                          <tr key={r} className={ri % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="border px-3 py-2 text-sm text-gray-700">{r}</td>
                            {q.choices.sort((a, b) => a.order.localeCompare(b.order)).map(choice => (
                              <td key={choice.order} className="border px-3 py-2 text-center">
                                <input
                                  type="radio"
                                  name={`${q.id}-${r}`}
                                  className="h-5 w-5 accent-blue-600"
                                  onChange={()=>setGrid(q.id, r, choice.order)}
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
          )
        })}
      </div>

      <div className="mt-8 flex justify-end">
        <button
          disabled={submit.isPending}
          className="px-5 py-2 rounded bg-blue-600 text-white disabled:opacity-60 shadow-sm"
          onClick={() => {
            submitWithValidation()
          }}
        >
          {submit.isPending ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </main>
  )
}


