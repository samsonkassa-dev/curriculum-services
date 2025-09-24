"use client"

import { useEffect, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

type QuestionType = "RADIO" | "CHECKBOX"

interface ChoiceForm {
  id?: string
  choice: string
  choiceImage: string
  choiceImageFile?: File
  isCorrect: boolean
}

interface AssessmentEntryForm {
  id?: string
  question: string
  questionImage: string
  questionImageFile?: File
  questionType: QuestionType
  choices: ChoiceForm[]
  weight: number
}

interface ReadOnlyQuestionViewProps {
  question: AssessmentEntryForm
}

export function ReadOnlyQuestionView({ question }: ReadOnlyQuestionViewProps) {
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
    <Card className="w-full">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Question Preview</h3>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-gray-100 text-gray-700">
              {question.questionType === "RADIO" ? "Single Choice" : "Multiple Choice"}
            </Badge>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Weight: {question.weight}
            </Badge>
          </div>
        </div>
        
        <div className="space-y-4">
        {/* Question Text */}
        <div>
          <h3 className="font-medium text-gray-900 mb-3 break-words whitespace-pre-wrap">
            {question.question || "Enter your question..."}
          </h3>
          
          {/* Question Image */}
          {questionImageUrl && (
            <div className="mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={questionImageUrl} 
                alt="Question image" 
                className="w-48 h-32 object-cover rounded border shadow-sm" 
              />
            </div>
          )}
        </div>

        {/* Choices */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Answer Choices:</h4>
          {question.choices.map((choice, index) => (
            <div 
              key={index} 
              className={`flex items-center gap-3 p-3 rounded border ${
                choice.isCorrect 
                  ? "border-green-200 bg-green-50" 
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              {/* Choice Indicator */}
              <div className={`w-4 h-4 rounded ${
                question.questionType === "RADIO" ? "rounded-full" : "rounded-sm"
              } border-2 ${
                choice.isCorrect 
                  ? "border-green-500 bg-green-500" 
                  : "border-gray-300 bg-white"
              } flex items-center justify-center`}>
                {choice.isCorrect && (
                  <div className={`w-2 h-2 bg-white ${
                    question.questionType === "RADIO" ? "rounded-full" : "rounded-sm"
                  }`} />
                )}
              </div>
              
              {/* Choice Image */}
              {choiceImageUrls[index] && (
                <div className="flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={choiceImageUrls[index]} 
                    alt={`Choice ${index + 1} image`} 
                    className="w-16 h-12 object-cover rounded border" 
                  />
                </div>
              )}
              
              {/* Choice Text */}
              <span className={`flex-1 text-sm break-words whitespace-pre-wrap ${
                choice.isCorrect ? "font-medium text-green-800" : "text-gray-700"
              }`}>
                {choice.choice || `Choice ${index + 1}`}
              </span>
              
              {/* Correct Badge */}
              {choice.isCorrect && (
                <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                  Correct
                </Badge>
              )}
            </div>
          ))}
        </div>

        {/* Answer Summary */}
        <div className="pt-3 border-t">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Answer Summary:</h4>
          {correctChoices.length > 0 ? (
            <div className="space-y-1">
              {correctChoices.map((choice, index) => {
                const originalIndex = question.choices.findIndex(c => c === choice)
                return (
                  <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                    <span>{choice.choice || `Choice ${originalIndex + 1}`}</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-amber-600">No correct answers selected</p>
          )}
        </div>
        </div>
      </div>
    </Card>
  )
}
