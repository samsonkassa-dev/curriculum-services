"use client"

import { useParams} from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useGetEvaluationDetail } from "@/lib/hooks/useEvaluation"
import { Loading } from "@/components/ui/loading"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useUserRole } from "@/lib/hooks/useUserRole"
import { useSubmitEvaluationAnswer } from "@/lib/hooks/useSubmitEvaluationAnswer"
import { useEffect, useState } from "react"

export default function ViewEvaluationForm() {
  const params = useParams()
  const formId = params.formId as string
  const { data: form, isLoading: isLoadingForm } = useGetEvaluationDetail(formId)
  const { isMeExpert, isLoading: isLoadingRole } = useUserRole()
  const submitAnswerMutation = useSubmitEvaluationAnswer(formId)

  const [localAnswers, setLocalAnswers] = useState<Record<string, string | undefined>>({})

  useEffect(() => {
    if (form?.monitoringFormEntries) {
      const initialAnswers = form.monitoringFormEntries.reduce((acc, entry) => {
        if (typeof entry.answer === 'boolean') {
          acc[entry.id] = entry.answer === true ? 'yes' : 'no';
        } else {
          acc[entry.id] = undefined;
        }
        return acc
      }, {} as Record<string, string | undefined>)
      setLocalAnswers(initialAnswers)
    }
  }, [form])

  const handleAnswerChange = (entryId: string, value: string) => {
    setLocalAnswers(prev => ({ ...prev, [entryId]: value }))

    const answerBoolean = value === 'yes' ? true : false
    submitAnswerMutation.mutate({
      monitoringFormEntryId: entryId,
      answer: answerBoolean
    })
  }

  const isLoading = isLoadingForm || isLoadingRole

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading />
      </div>
    )
  }

  if (!form) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Form not found</p>
      </div>
    )
  }

  const groupedQuestions = form.monitoringFormEntries.reduce((acc, entry) => {
    const group = entry.outlineGroup || 'General'
    if (!acc[group]) {
      acc[group] = []
    }
    if (entry.id) {
      acc[group].push(entry)
    }
    return acc
  }, {} as Record<string, Array<typeof form.monitoringFormEntries[number] & { id: string }>>)

  return (
    <div className="min-h-screen py-[50px] bg-[#ffffff]">
      <div className="px-[7%] pt-7 text-sm flex items-center flex-wrap">
        <Link 
          href={`/${params.companyId}/training/${params.trainingId}?tab=evaluation`} 
          className="text-gray-600 hover:text-brand transition-colors font-medium flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Evaluations
        </Link>
      </div>

      <div className="px-[7%] py-10 max-w-[910px] mx-auto">
        <div className="space-y-6">
          {Object.entries(groupedQuestions).map(([groupName, questions], groupIndex) => (
            <div 
              key={groupIndex} 
              className="bg-[#fbfbfb] rounded-lg p-6 space-y-6"
            >
              <h2 className="text-lg font-semibold text-[#31302F]">{groupName}</h2>
              <div className="space-y-6">
                {questions.map((entry, questionIndex) => (
                  <div 
                    key={entry.id}
                    className="space-y-4"
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-[#99948E] font-medium w-6 pt-[3px]">
                        {questionIndex + 1}.
                      </span>
                      <div className="flex-1">
                        <p className="text-[#31302F] text-[18px] leading-[29px]">{entry.question}</p>
                      </div>
                    </div>
                    <div className="">
                      <RadioGroup 
                        value={localAnswers[entry.id] ?? ''}
                        onValueChange={(value) => handleAnswerChange(entry.id, value)}
                        className="flex gap-x-40"
                        disabled={!isMeExpert || submitAnswerMutation.isPending}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id={`yes-${entry.id}`} />
                          <Label 
                            htmlFor={`yes-${entry.id}`}
                            className="text-[#565555] text-base"
                          >
                            Yes
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id={`no-${entry.id}`} />
                          <Label 
                            htmlFor={`no-${entry.id}`}
                            className="text-[#565555] text-base"
                          >
                            No
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 