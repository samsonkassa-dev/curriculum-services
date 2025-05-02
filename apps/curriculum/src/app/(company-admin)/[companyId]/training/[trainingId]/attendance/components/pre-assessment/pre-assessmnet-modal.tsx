"use client"

import { useState, useEffect } from "react"
import { Check, X, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { 
  useSessionAssessments, 
  useSubmitAssessmentAnswer, 
  AssessmentEntry 
} from "@/lib/hooks/useSessionAssesment"


interface PreAssessmentModalProps {
  sessionId: string
  studentId: string
  studentName: string
  trigger: React.ReactNode
  customTrigger?: React.ReactNode
}

const MAX_QUESTIONS_PER_GROUP = 4

export default function PreAssessmentModal({ 
  sessionId, 
  studentId, 
  studentName,
  trigger,
  customTrigger
}: PreAssessmentModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentGroup, setCurrentGroup] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasAnswered, setHasAnswered] = useState(false)

  // Fetch assessment data with traineeId parameter to get student-specific answers
  const { data, isLoading, error } = useSessionAssessments(sessionId, studentId)
  const { submitAnswer } = useSubmitAssessmentAnswer()
  
  const assessment = data?.preTrainingAssessment
  const questions = assessment?.preTrainingAssessmentEntries || []

  // Group questions into sets of MAX_QUESTIONS_PER_GROUP
  const questionGroups: AssessmentEntry[][] = []
  for (let i = 0; i < questions.length; i += MAX_QUESTIONS_PER_GROUP) {
    questionGroups.push(questions.slice(i, i + MAX_QUESTIONS_PER_GROUP))
  }

  // Check for answered questions and set state accordingly
  useEffect(() => {
    if (!questions.length || isLoading) return
    
    // Check if any questions have answers
    const answersFound: Record<string, string> = {}
    const answeredQuestions = questions.filter((q: AssessmentEntry) => {
      if (q.answer) {
        answersFound[q.id] = q.answer
        return true
      }
      return false
    })
    
    // Set states based on answered questions
    const hasAnyAnswers = answeredQuestions.length > 0
    setHasAnswered(hasAnyAnswers)
    
    // If there are answers, use them
    if (hasAnyAnswers) {
      setSelectedAnswers(answersFound)
    }
    
  }, [questions, isLoading])

  // Reset current group when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setCurrentGroup(0)
    }
  }, [isOpen])

  // Show "Review" instead of "Add" if assessment has been answered
  const displayMode = hasAnswered ? "review" : "add"

  const handleAnswerSelect = (questionId: string, choice: string) => {
    // Only allow changing answers in 'add' mode
    if (displayMode === 'add') {
      setSelectedAnswers(prev => ({
        ...prev,
        [questionId]: choice
      }))
    }
  }

  const handleSubmit = async () => {
    // Don't allow submission if already answered
    if (hasAnswered) {
      setIsOpen(false)
      return
    }
    
    setIsSubmitting(true)
    try {
      // Submit all answers
      const questionIds = Object.keys(selectedAnswers)
      for (const questionId of questionIds) {
        await submitAnswer({
          preTrainingAssessmentEntryId: questionId,
          answerData: {
            answer: selectedAnswers[questionId],
            traineeId: studentId
          }
        })
      }
      setHasAnswered(true)
      setIsOpen(false)
    } catch (error) {
      console.error("Error submitting assessment:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNext = () => {
    if (currentGroup < questionGroups.length - 1) {
      setCurrentGroup(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentGroup > 0) {
      setCurrentGroup(prev => prev - 1)
    }
  }

  // Check if current group's questions all have answers
  const isCurrentGroupComplete = () => {
    if (!questionGroups[currentGroup]) return false
    return questionGroups[currentGroup].every(q => !!selectedAnswers[q.id])
  }

  // Check if all questions have answers
  const isAssessmentComplete = () => {
    return questions.every((q: AssessmentEntry) => !!selectedAnswers[q.id])
  }

  // Custom trigger based on assessment status
  const renderTrigger = () => {
    if (customTrigger) {
      return customTrigger
    }
    
    if (isLoading) {
      return (
        <Button 
          variant="ghost" 
          className="text-blue-600 text-xs h-7 px-2 flex items-center gap-1"
          disabled
        >
          <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading
        </Button>
      )
    }
    
    if (hasAnswered) {
      return (
        <Button 
          variant="ghost" 
          className="text-green-600 text-xs h-7 px-2 flex items-center gap-1 hover:text-green-600 hover:bg-green-50"
        >
          <CheckCircle size={14} />
          Review Assessment
        </Button>
      )
    }
    
    return trigger
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {renderTrigger()}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {displayMode === "review" ? "Review Assessment" : "Pre-Training Assessment"} for {studentName}
          </DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            Loading assessment questions...
          </div>
        ) : error ? (
          <div className="p-4 text-red-500">
            Failed to load assessment questions. Please try again.
          </div>
        ) : questions.length === 0 ? (
          <div className="p-4">
            No assessment questions found for this session.
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {displayMode === "review" && (
              <div className="bg-green-50 p-3 rounded-md border border-green-100">
                <p className="text-green-700 text-sm flex items-center">
                  <CheckCircle size={16} className="mr-2" />
                  Assessment completed for this student. You are viewing the answers in read-only mode.
                </p>
              </div>
            )}
            
            {/* Progress indicator */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Group {currentGroup + 1} of {questionGroups.length}
              </p>
            </div>

            {/* Questions in current group */}
            <div className="space-y-6">
              {questionGroups[currentGroup]?.map((question, idx) => (
                <Card key={question.id} className="p-5">
                  <h3 className="text-lg font-medium mb-4">
                    <span className="inline-flex items-center justify-center w-7 h-7 bg-blue-100 text-blue-600 rounded-full mr-2 text-sm">
                      {currentGroup * MAX_QUESTIONS_PER_GROUP + idx + 1}
                    </span>
                    {question.question}
                  </h3>
                  <div className="space-y-3 pl-9">
                    {question.choices.map((choice: string, choiceIdx: number) => (
                      <div 
                        key={choiceIdx} 
                        className={`flex items-center gap-2 p-2 rounded-md ${displayMode === "review" ? '' : 'cursor-pointer'} ${
                          selectedAnswers[question.id] === choice 
                            ? 'bg-blue-50 border border-blue-200' 
                            : displayMode === "review" ? '' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => handleAnswerSelect(question.id, choice)}
                      >
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs border ${
                          selectedAnswers[question.id] === choice
                            ? 'border-blue-600 bg-blue-600 text-white'
                            : 'border-gray-300'
                        }`}>
                          {String.fromCharCode(65 + choiceIdx)}
                        </div>
                        <span>{choice}</span>
                        
                        {/* Show checkmark for selected answers in review mode */}
                        {displayMode === "review" && selectedAnswers[question.id] === choice && (
                          <Check size={16} className="ml-auto text-green-600" />
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentGroup === 0}
                className="flex items-center gap-1"
              >
                <ChevronLeft size={16} />
                Previous
              </Button>
              
              {currentGroup < questionGroups.length - 1 ? (
                <Button
                  onClick={handleNext}
                  disabled={displayMode === "add" && !isCurrentGroupComplete()}
                  className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Next
                  <ChevronRight size={16} />
                </Button>
              ) : displayMode === "review" ? (
                <Button
                  onClick={() => setIsOpen(false)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Close
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!isAssessmentComplete() || isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isSubmitting ? "Submitting..." : "Submit Assessment"}
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
