"use client"

import { Button } from "@/components/ui/button"
import { useState, useEffect, useRef } from "react"
import { SurveyModal } from "./survey-modal"
import { useTrainingSurveys } from "@/lib/hooks/useStaticSurvey"
import { CheckCircle, Loader2 } from "lucide-react"

interface SurveyButtonProps {
  trainingId: string
  studentId: string
  studentName: string
  isPreSession: boolean
  disabled?: boolean
}

export function SurveyButton({ trainingId, studentId, studentName, isPreSession, disabled = false }: SurveyButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [hasSurvey, setHasSurvey] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const didInitialCheck = useRef(false)
  
  // Fetch surveys to check if student has already submitted
  // Note: We're assuming surveys endpoint can filter by trainee ID. If not, we'll need to adjust this logic.
  const { data: surveyData, isLoading } = useTrainingSurveys(trainingId, 1, 100)
  
  // Reset state when studentId or session type changes
  useEffect(() => {
    setHasSurvey(false)
    didInitialCheck.current = false
  }, [studentId, isPreSession])
  
  // Check if survey exists for this student
  useEffect(() => {
    if (surveyData?.surveys && !didInitialCheck.current) {
      // Find if student has already submitted a survey
      const studentHasSurvey = surveyData.surveys.some(survey => 
        survey.traineeId === studentId
      )
      setHasSurvey(studentHasSurvey)
      didInitialCheck.current = true
    }
  }, [surveyData, studentId])
  
  const handleSurveyStatusChange = (status: boolean) => {
    setHasSurvey(status)
    // Close modal after status is updated
    setIsModalOpen(false)
    setIsSubmitting(false)
  }

  const handleOpenModal = () => {
    setIsModalOpen(true)
    setIsSubmitting(false)
  }

  const handleSubmitStart = () => {
    setIsSubmitting(true)
  }
  
  // Combine disabled state: component is disabled if explicitly disabled, or if survey exists, or during loading/submitting
  const isButtonDisabled = disabled || hasSurvey || isLoading || isSubmitting
  
  // Button label changes based on pre/post session
  const surveyType = isPreSession ? "Pre-Survey" : "Post-Survey"
  
  return (
    <>
      <Button 
        variant="outline"
        className={`h-9 ${hasSurvey ? "bg-green-100 text-green-700 hover:bg-green-200 border-green-300" : ""} ${disabled && !hasSurvey ? "opacity-60" : ""}`}
        onClick={handleOpenModal}
        disabled={isButtonDisabled}
      >
        {isLoading ? (
          <span className="text-sm flex items-center gap-1">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading...
          </span>
        ) : isSubmitting ? (
          <span className="text-sm flex items-center gap-1">
            <Loader2 className="h-4 w-4 animate-spin" />
            Submitting...
          </span>
        ) : hasSurvey ? (
          <span className="text-sm flex items-center gap-1">
            <CheckCircle className="h-4 w-4" />
            Survey Completed
          </span>
        ) : (
          <span className="text-sm">Add {surveyType}</span>
        )}
      </Button>
      
      {isModalOpen && (
        <SurveyModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          trainingId={trainingId}
          studentId={studentId}
          studentName={studentName}
          isPreSession={isPreSession}
          onSurveyStatusChange={handleSurveyStatusChange}
          onSubmitStart={handleSubmitStart}
        />
      )}
    </>
  )
} 