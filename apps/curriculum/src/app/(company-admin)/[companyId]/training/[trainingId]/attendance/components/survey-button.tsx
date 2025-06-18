"use client"

import { Button } from "@/components/ui/button"
import { useState, useEffect, useRef } from "react"
import { SurveyModal } from "./survey-modal"
import { useTrainingSurveys, type TrainingSurvey, type SurveyType } from "@/lib/hooks/useStaticSurvey"
import { CheckCircle, Loader2, Edit } from "lucide-react"

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
  const [existingSurveyId, setExistingSurveyId] = useState<string | null>(null)
  const didInitialCheck = useRef(false)
  
  // Determine survey type based on session type
  const currentSurveyType: SurveyType = isPreSession ? "PRE" : "POST"
  
  // Fetch surveys to check if student has already submitted
  const { data: surveys, isLoading, refetch: refetchSurveys } = useTrainingSurveys(trainingId, studentId, currentSurveyType)
  
  // Reset state when studentId or session type changes
  useEffect(() => {
    setHasSurvey(false)
    setExistingSurveyId(null)
    didInitialCheck.current = false
  }, [studentId, isPreSession, currentSurveyType])
  
  // Check if survey exists for this student
  useEffect(() => {
    if (surveys !== undefined && !didInitialCheck.current) {
      // Find if student has already submitted a survey of the current type
      const existingSurvey = surveys.find((survey: TrainingSurvey) => 
        survey.traineeId === studentId && survey.surveyType === currentSurveyType
      )
      
      if (existingSurvey) {
        setHasSurvey(true)
        setExistingSurveyId(existingSurvey.id)
      } else {
        setHasSurvey(false)
        setExistingSurveyId(null)
      }
      
      didInitialCheck.current = true
    }
  }, [surveys, studentId, currentSurveyType])
  
  const handleSurveyStatusChange = (status: boolean) => {
    setHasSurvey(status)
    // Refetch surveys to get the latest data including the new survey ID
    refetchSurveys()
    // Close modal after status is updated
    setIsModalOpen(false)
    setIsSubmitting(false)
  }

  const handleOpenModal = async () => {
    // If editing existing survey, refetch to ensure we have latest data
    if (hasSurvey) {
      await refetchSurveys()
    }
    setIsModalOpen(true)
    setIsSubmitting(false)
  }

  const handleSubmitStart = () => {
    setIsSubmitting(true)
  }
  
  // Combine disabled state: component is disabled if explicitly disabled, or during loading/submitting
  // Note: we don't disable if hasSurvey is true, since we want to allow editing
  const isButtonDisabled = disabled || isLoading || isSubmitting
  
  // Button label changes based on pre/post session and whether survey exists
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
            <Edit className="h-4 w-4" />
            Edit {surveyType}
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
          existingSurveyId={existingSurveyId}
          onSurveyStatusChange={handleSurveyStatusChange}
          onSubmitStart={handleSubmitStart}
        />
      )}
    </>
  )
} 