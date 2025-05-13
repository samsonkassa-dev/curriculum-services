"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { SessionReportFormSchema, SessionReportFormValues } from "./session-report-schema"
import { SummaryOfTrainingStep } from "./summary-of-training-step"
import { LearnerFeedbackStep } from "./learner-feedback-step"
import { SelfReflectionStep } from "./self-reflection-step"
import { RecommendationsStep } from "./recommendations-step"
import { SupportingDocumentsStep } from "./supporting-documents-step"
import { useSubmitSessionReport, useGetSessionReport } from "@/lib/hooks/useReportAndAttendance"

interface SessionReportModalProps {
  isOpen: boolean
  onClose: () => void
  sessionId: string
  onReportStatusChange?: (hasReport: boolean) => void
  onSubmitStart?: () => void
}

export function SessionReportModal({ isOpen, onClose, sessionId, onReportStatusChange, onSubmitStart }: SessionReportModalProps) {
  const [step, setStep] = useState<number>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const formInitialized = useRef(false)
  
  const form = useForm<SessionReportFormValues>({
    resolver: zodResolver(SessionReportFormSchema),
    defaultValues: {
      topicsCovered: [""],
      significantObservations: [""],
      overallSatisfactionScore: 0,
      learnerFeedbackSummary: "",
      positiveFeedback: "",
      areasForImprovement: "",
      specificFeedbackExamples: "",
      teachingMethodEffectiveness: 0,
      trainerStrengths: "",
      trainerAreasForGrowth: "",
      trainerProfessionalGoals: "",
      curriculumRecommendations: "",
      deliveryMethodRecommendations: "",
      assessmentRecommendations: "",
      learnerSupportRecommendations: "",
      otherRecommendations: "",
      sessionReportFiles: [],
    },
  })

  const { data: sessionReport, isLoading: isLoadingReport } = useGetSessionReport(sessionId)
  const { mutateAsync: submitSessionReport } = useSubmitSessionReport()

  // Notify parent component when report exists
  useEffect(() => {
    if (sessionReport?.report && onReportStatusChange) {
      onReportStatusChange(true)
    }
  }, [sessionReport, onReportStatusChange])

  // Populate form with existing data if available
  useEffect(() => {
    if (sessionReport?.report && isOpen && !formInitialized.current) {
      const report = sessionReport.report
      
      form.reset({
        topicsCovered: report.topicsCovered || [""],
        significantObservations: report.significantObservations || [""],
        overallSatisfactionScore: report.overallSatisfactionScore || 0,
        learnerFeedbackSummary: report.learnerFeedbackSummary || "",
        positiveFeedback: report.positiveFeedback || "",
        areasForImprovement: report.areasForImprovement || "",
        specificFeedbackExamples: report.specificFeedbackExamples || "",
        teachingMethodEffectiveness: report.teachingMethodEffectiveness || 0,
        trainerStrengths: report.trainerStrengths || "",
        trainerAreasForGrowth: report.trainerAreasForGrowth || "",
        trainerProfessionalGoals: report.trainerProfessionalGoals || "",
        curriculumRecommendations: report.curriculumRecommendations || "",
        deliveryMethodRecommendations: report.deliveryMethodRecommendations || "",
        assessmentRecommendations: report.assessmentRecommendations || "",
        learnerSupportRecommendations: report.learnerSupportRecommendations || "",
        otherRecommendations: report.otherRecommendations || "",
        sessionReportFiles: [], // We don't populate files since we can't edit them
      })
      
      formInitialized.current = true
    }
  }, [sessionReport, form, isOpen])
  
  // Reset form initialization flag when modal is closed
  useEffect(() => {
    if (!isOpen) {
      formInitialized.current = false
    }
  }, [isOpen])

  const MAX_STEPS = 5

  const handleNext = async () => {
    // Get field names for current step to validate
    const fieldNamesForStep: Record<number, string[]> = {
      1: ["topicsCovered", "significantObservations"],
      2: [
        "overallSatisfactionScore", 
        "learnerFeedbackSummary", 
        "positiveFeedback", 
        "areasForImprovement", 
        "specificFeedbackExamples"
      ],
      3: [
        "teachingMethodEffectiveness", 
        "trainerStrengths", 
        "trainerAreasForGrowth", 
        "trainerProfessionalGoals"
      ],
      4: [
        "curriculumRecommendations", 
        "deliveryMethodRecommendations", 
        "assessmentRecommendations", 
        "learnerSupportRecommendations"
      ],
      5: ["sessionReportFiles"],
    }

    // Validate fields for current step
    const result = await form.trigger(fieldNamesForStep[step] as Array<keyof SessionReportFormValues>)
    
    if (result) {
      if (step < MAX_STEPS) {
        setStep(step + 1)
      } else {
        // Submit the form
        await handleSubmit()
      }
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      if (onSubmitStart) {
        onSubmitStart();
      }
      const values = form.getValues()
      
      // Ensure required fields are proper types
      const formData = {
        ...values,
        otherRecommendations: values.otherRecommendations || "",
        sessionReportFiles: values.sessionReportFiles || []
      }
      
      await submitSessionReport({
        sessionId,
        data: formData
      })
      
      // Notify parent that report now exists
      if (onReportStatusChange) {
        onReportStatusChange(true)
      }
      
      onClose()
    } catch (error) {
      console.error("Error submitting session report:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return "Summary of Training Sessions Conducted"
      case 2:
        return "Learner Feedback and Satisfaction"
      case 3:
        return "Self-Reflection on Teaching Practices"
      case 4:
        return "Recommendations for Future Training Sessions"
      case 5:
        return "Supporting Documents"
      default:
        return "Session Report"
    }
  }

  if (!isOpen) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center mb-8">
          <DialogTitle className="text-xl font-bold text-[#4D5464] pb-8">
            {isLoadingReport ? "Loading Report..." : (sessionReport?.report ? "View/Edit Session Report" : "Session Report")}
          </DialogTitle>
          
          <div className="flex items-center justify-center mt-6 pb-8">
            {Array.from({ length: MAX_STEPS }).map((_, index) => (
              <div key={index} className="flex items-center">
                {/* Step indicator */}
                <div 
                  className={`rounded-full w-8 h-8 flex items-center justify-center font-medium z-10
                    ${index + 1 === step 
                      ? "bg-white border-2 border-[#0B75FF] text-[#0B75FF]" 
                      : index + 1 < step 
                        ? "bg-[#0B75FF] text-white" 
                        : "bg-[#EFF0F6] text-[#6F6C90]"
                    }`}
                >
                  {index + 1}
                </div>
                
                {/* Connector line (except for last item) */}
                {index < MAX_STEPS - 1 && (
                  <div className="w-[45px] h-[2px] mx-2 relative">
                    <div className="absolute w-full h-full bg-[#EFF0F6]"></div>
                    {index + 1 < step && (
                      <div className="absolute w-full h-full bg-[#0B75FF]"></div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-[#4D5464] font-semibold text-lg pt-4">{getStepTitle()}</div>
        </DialogHeader>

        <div className="w-full">
          {isLoadingReport ? (
            <div className="text-center py-8">Loading report data...</div>
          ) : (
            <>
              {step === 1 && <SummaryOfTrainingStep form={form} />}
              {step === 2 && <LearnerFeedbackStep form={form} />}
              {step === 3 && <SelfReflectionStep form={form} />}
              {step === 4 && <RecommendationsStep form={form} />}
              {step === 5 && <SupportingDocumentsStep form={form} />}
            </>
          )}
        </div>

        <div className="flex justify-end gap-4 mt-8">
          {step > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              className="px-8"
              disabled={isSubmitting || isLoadingReport}
            >
              Back
            </Button>
          )}
          <Button
            type="button"
            onClick={handleNext}
            className="bg-[#0B75FF] hover:bg-blue-700 text-white px-8"
            disabled={isSubmitting || isLoadingReport}
          >
            {step === MAX_STEPS ? "Submit Report" : "Continue"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 