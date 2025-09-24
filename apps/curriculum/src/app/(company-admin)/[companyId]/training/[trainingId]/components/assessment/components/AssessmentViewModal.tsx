"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { useAssessmentDetail, AssessmentSummary } from "@/lib/hooks/useAssessment"
import { Loading } from "@/components/ui/loading"
import { cn } from "@/lib/utils"

interface AssessmentViewModalProps {
  assessment: AssessmentSummary | null
  isOpen: boolean
  onClose: () => void
}

export function AssessmentViewModal({ assessment, isOpen, onClose }: AssessmentViewModalProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  
  // Fetch full assessment details
  const { data: assessmentData, isLoading } = useAssessmentDetail(assessment?.id || "")
  
  if (!assessment) return null
  
  const assessmentDetail = assessmentData?.assessment
  const allQuestions = assessmentDetail?.sections?.flatMap(section => 
    section.questions.map(question => ({
      ...question,
      sectionTitle: section.title,
      sectionDescription: section.description
    }))
  ) || []
  
  const currentQuestion = allQuestions[currentQuestionIndex]
  const totalQuestions = allQuestions.length
  
  const handlePrevious = () => {
    setCurrentQuestionIndex(prev => Math.max(0, prev - 1))
  }
  
  const handleNext = () => {
    setCurrentQuestionIndex(prev => Math.min(totalQuestions - 1, prev + 1))
  }
  
  const handleClose = () => {
    setCurrentQuestionIndex(0)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <DialogTitle className="text-lg font-semibold">
              {assessment.type === "PRE_POST" ? "Pre Training Assessment" : "CAT Assessment"}
            </DialogTitle>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <Loading />
          </div>
        ) : !currentQuestion ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <p className="text-gray-500">No questions found in this assessment.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {/* Section Header */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-900 mb-1 break-words whitespace-pre-wrap">
                {currentQuestion.sectionTitle}
              </h2>
              {currentQuestion.sectionDescription && (
                <p className="text-sm text-gray-600 break-words whitespace-pre-wrap">
                  {currentQuestion.sectionDescription}
                </p>
              )}
            </div>

            {/* Question */}
            <div className="mb-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-base font-medium text-gray-900 break-words whitespace-pre-wrap flex-1">
                  {currentQuestionIndex + 1}. {currentQuestion.question}
                </h3>
                <Badge variant="secondary" className="ml-4 flex-shrink-0">
                  {currentQuestion.weight} Point{currentQuestion.weight !== 1 ? 's' : ''}
                </Badge>
              </div>

              {/* Question Image */}
              {currentQuestion.questionImageUrl && (
                <div className="mb-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={currentQuestion.questionImageUrl}
                    alt="Question image"
                    className="w-48 h-32 object-cover rounded-lg border shadow-sm"
                  />
                </div>
              )}

              {/* Choices */}
              <div className="space-y-3">
                {currentQuestion.choices.map((choice, index) => (
                  <div 
                    key={choice.id}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg border",
                      choice.isCorrect 
                        ? "border-green-200 bg-green-50" 
                        : "border-gray-200 bg-white"
                    )}
                  >
                    {/* Radio/Checkbox indicator */}
                    {currentQuestion.questionType === "RADIO" ? (
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0",
                        choice.isCorrect 
                          ? "border-green-500 bg-green-500" 
                          : "border-gray-300"
                      )}>
                        {choice.isCorrect && (
                          <div className="w-2.5 h-2.5 rounded-full bg-white" />
                        )}
                      </div>
                    ) : (
                      <div className={cn(
                        "w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 flex-shrink-0",
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
                    {choice.choiceImageUrl && (
                      <div className="flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={choice.choiceImageUrl}
                          alt={`Choice ${index + 1} image`}
                          className="w-16 h-12 object-cover rounded border"
                        />
                      </div>
                    )}

                    {/* Choice Text */}
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm break-words whitespace-pre-wrap",
                        choice.isCorrect ? "font-medium text-green-800" : "text-gray-700"
                      )}>
                        {choice.choiceText || `Choice ${index + 1}`}
                      </p>
                    </div>

                    {/* Correct indicator */}
                    {choice.isCorrect && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs flex-shrink-0">
                        Correct
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation */}
            {totalQuestions > 1 && (
              <div className="flex items-center justify-between pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </Button>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    Question {currentQuestionIndex + 1} of {totalQuestions}
                  </span>
                </div>
                
                <Button
                  variant="outline"
                  onClick={handleNext}
                  disabled={currentQuestionIndex === totalQuestions - 1}
                  className="flex items-center gap-2"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
