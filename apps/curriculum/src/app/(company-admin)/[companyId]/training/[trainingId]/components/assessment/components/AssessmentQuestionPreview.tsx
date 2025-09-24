"use client"

import { useEffect, useMemo } from "react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type QuestionType = "RADIO" | "CHECKBOX"

interface ChoiceForm {
  choice: string
  choiceImage: string
  choiceImageFile?: File
  isCorrect: boolean
}

interface AssessmentEntryForm {
  question: string
  questionImage: string
  questionImageFile?: File
  questionType: QuestionType
  choices: ChoiceForm[]
  weight: number
}

interface AssessmentQuestionPreviewProps {
  question: AssessmentEntryForm
}

export function AssessmentQuestionPreview({ question }: AssessmentQuestionPreviewProps) {
  const correctChoices = question.choices.filter(c => c.isCorrect)
  
  // Create and cleanup object URLs for images
  const questionImageUrl = useMemo(() => {
    if (question.questionImageFile) {
      return URL.createObjectURL(question.questionImageFile)
    }
    return question.questionImage
  }, [question.questionImageFile, question.questionImage])

  const choiceImageUrls = useMemo(() => {
    return question.choices.map(choice => {
      if (choice.choiceImageFile) {
        return URL.createObjectURL(choice.choiceImageFile)
      }
      return choice.choiceImage
    })
  }, [question.choices])

  // Cleanup URLs when component unmounts or changes
  useEffect(() => {
    return () => {
      if (question.questionImageFile && questionImageUrl) {
        URL.revokeObjectURL(questionImageUrl)
      }
      choiceImageUrls.forEach((url, index) => {
        if (question.choices[index]?.choiceImageFile && url) {
          URL.revokeObjectURL(url)
        }
      })
    }
  }, [question.questionImageFile, question.choices, questionImageUrl, choiceImageUrls])
  
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="border-b pb-3">
          <h3 className="text-base font-semibold text-gray-900 mb-2">Question Preview</h3>
          <div className="flex items-center gap-3 text-xs text-gray-600">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
              {question.questionType === "RADIO" ? "Single Choice" : "Multiple Choice"}
            </span>
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
              Weight: {question.weight}
            </span>
          </div>
        </div>

        {/* Question */}
        <div>
          <p className="text-sm font-medium text-gray-900 mb-3 break-words">
            {question.question || "Enter your question..."}
          </p>
          
          {/* Question Image */}
          {questionImageUrl && (
            <div className="mb-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={questionImageUrl} 
                alt="Question image" 
                className="w-48 h-32 object-cover rounded border shadow-sm" 
              />
            </div>
          )}

          {/* Choices */}
          <div className="space-y-2">
            {question.choices.map((choice, index) => (
              <div 
                key={index} 
                className={cn(
                  "flex items-center gap-2 p-2 rounded border",
                  choice.isCorrect 
                    ? "border-green-200 bg-green-50" 
                    : "border-gray-200 bg-white"
                )}
              >
                {question.questionType === "RADIO" ? (
                  <div className={cn(
                    "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                    choice.isCorrect 
                      ? "border-green-500 bg-green-500" 
                      : "border-gray-300"
                  )}>
                    {choice.isCorrect && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                ) : (
                  <div className={cn(
                    "w-4 h-4 rounded border-2 flex items-center justify-center",
                    choice.isCorrect 
                      ? "border-green-500 bg-green-500" 
                      : "border-gray-300"
                  )}>
                    {choice.isCorrect && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                )}
                
                {/* Choice Image */}
                {choiceImageUrls[index] && (
                  <div className="mr-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={choiceImageUrls[index]} 
                      alt={`Choice ${index + 1} image`} 
                      className="w-16 h-12 object-cover rounded border" 
                    />
                  </div>
                )}
                
                <span className={cn(
                  "flex-1 text-sm break-words",
                  choice.isCorrect ? "font-medium text-green-800" : "text-gray-700"
                )}>
                  {choice.choice || `Choice ${index + 1}`}
                </span>
                {choice.isCorrect && (
                  <span className="text-xs px-1.5 py-0.5 bg-green-200 text-green-800 rounded-full">
                    Correct
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Answer Summary */}
        <div className="pt-3 border-t">
          <div className="text-xs text-gray-600">
            <p className="font-medium mb-1">Answer Summary:</p>
            {correctChoices.length > 0 ? (
              <ul className="space-y-1">
                {correctChoices.map((choice, index) => {
                  const originalIndex = question.choices.findIndex(c => c === choice)
                  return (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />
                      <span className="text-xs break-words">
                        {choice.choice || `Choice ${originalIndex + 1}`}
                      </span>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <p className="text-amber-600 text-xs">No correct answers selected</p>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
