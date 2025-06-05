"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, CheckCircle, FileQuestion, AlertCircle } from "lucide-react"
import { 
  useTrainingAssessments,
  useSubmitAssessmentAnswer,
  useTrainingAssessment,
  TrainingAssessment,
  TrainingAssessmentWithAnswer
} from "@/lib/hooks/useTrainingAssessment"
import { useProfile } from "@/lib/hooks/useProfile"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

interface AssessmentModalProps {
  trainingId: string
  studentId: string
  studentName: string
  assessmentType: 'PRE' | 'POST' // Determines which type of assessments to fetch
  trigger: React.ReactNode
}

export default function AssessmentModal({
  trainingId,
  studentId,
  studentName,
  assessmentType,
  trigger
}: AssessmentModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [fileLink, setFileLink] = useState("")
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>("")
  const [comment, setComment] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Fetch the single training assessment by type (there's only one PRE and one POST per training)
  const { data: assessmentData, isLoading: isLoadingAssessment, error: assessmentError } = useTrainingAssessments(
    trainingId, 
    { type: assessmentType }
  )
  
  // Extract the single assessment from the response
  const assessment = assessmentData?.trainingAssessments?.[0] as TrainingAssessmentWithAnswer

  // Get trainer profile for ID
  const { profile } = useProfile()
  const trainerId = profile.data?.id

  // Submit assessment answer mutation
  const { mutateAsync: submitAnswer } = useSubmitAssessmentAnswer()

  // Memoized derived values
  const modalTitle = useMemo(() => {
    return assessmentType === 'PRE' 
      ? `Pre-Assessment for ${studentName}`
      : `Post-Assessment for ${studentName}`
  }, [assessmentType, studentName])

  const assessmentLabel = useMemo(() => {
    return assessmentType === 'PRE' ? 'Pre-Assessment' : 'Post-Assessment'
  }, [assessmentType])

  const noAssessmentsMessage = useMemo(() => {
    return assessmentType === 'PRE'
      ? "There are no pre-assessments assigned to this training yet. Please assign assessments first."
      : "There are no post-assessments assigned to this training yet. Please assign assessments first."
  }, [assessmentType])

  // Reset state when modal opens
  const resetModalState = useCallback(() => {
    setError(null)
    setSuccess(false)
    setFileLink("")
    setComment("")
    setSelectedAssessmentId("")
  }, [])

  // Modal open/close handler
  const handleModalOpenChange = useCallback((open: boolean) => {
    setIsOpen(open)
    if (!open) {
      resetModalState()
    }
  }, [resetModalState])

  // Set the assessment ID when assessment loads
  useEffect(() => {
    if (assessment && assessment.id) {
      setSelectedAssessmentId(assessment.id)
      setFileLink(assessment.answerFileLink || "")
      setComment(assessment.comment || "")
    }
  }, [assessment])

  // Event handlers
  const handleFileLinkChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFileLink(e.target.value)
  }, [])

  const handleCommentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value)
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedAssessmentId) {
      setError("Please select an assessment")
      return
    }
    
    if (!fileLink) {
      setError("Please enter a file link")
      return
    }
    
    if (!trainerId) {
      setError("Unable to identify trainer")
      return
    }

    setIsSubmitting(true)
    setError(null)
    setSuccess(false)
    
    try {
      await submitAnswer({
        assessmentId: selectedAssessmentId,
        answerData: {
          answerFileLink: fileLink,
          comment: comment,
          traineeId: studentId
        }
      })
      setSuccess(true)
      setTimeout(() => setIsOpen(false), 1200)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to submit answer"
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }, [selectedAssessmentId, fileLink, trainerId, comment, studentId, submitAnswer])

  // Memoized render content
  const renderContent = useMemo(() => {
    // Loading state
    if (isLoadingAssessment) {
      return (
        <div className="flex flex-col items-center justify-center py-6">
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-2" />
          <p className="text-gray-500">Loading {assessmentType.toLowerCase()}-assessment...</p>
        </div>
      )
    }

    // Show error if there's an error fetching assessment
    if (assessmentError) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-700">Error Loading Assessment</h3>
          <p className="text-red-500 mt-1 max-w-xs text-xs">
            {assessmentError.message}
          </p>
        </div>
      )
    }

    // No assessment for this training
    if (!assessment) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <FileQuestion className="h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-700">No {assessmentLabel} Available</h3>
          <p className="text-gray-500 mt-1 max-w-xs">
            {noAssessmentsMessage}
          </p>
        </div>
      )
    }

    // Form for submitting assessment answer
    return (
      <form onSubmit={handleSubmit} className="space-y-4 py-2 px-5">
        {/* Assessment details */}
        <div className="bg-gray-50 p-4 rounded-md border">
          <h4 className="font-medium text-lg">{assessment.name}</h4>
          <p className="text-sm text-gray-600 mt-1">{assessment.description}</p>
          
          {/* Show assessment file link if available */}
          {assessment.fileLink && (
            <div className="mt-3 text-sm flex items-center">
              <span className="text-gray-600 mr-2">Assessment file:</span>
              <a 
                href={assessment.fileLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline truncate"
              >
                {assessment.fileLink}
              </a>
            </div>
          )}
          
          {/* Show if this assessment already has an answer */}
          {assessment.answerFileLink && (
            <div className="mt-3 text-sm flex items-center">
              <Badge variant="secondary" className="bg-green-50 text-green-700">
                Answer already submitted
              </Badge>
            </div>
          )}
        </div>

        {/* File Link Field */}
        <div className="space-y-2">
          <Label htmlFor="fileLink">Answer File Link</Label>
          <Input
            id="fileLink"
            placeholder="Enter the answer file link"
            value={fileLink}
            onChange={handleFileLinkChange}
            disabled={isSubmitting || success}
          />
        </div>

        {/* Comment Field */}
        <div className="space-y-2">
          <Label htmlFor="comment">Comment (Optional)</Label>
          <Textarea
            id="comment"
            placeholder="Add a comment about this student's assessment..."
            value={comment}
            onChange={handleCommentChange}
            disabled={isSubmitting || success}
            rows={3}
          />
        </div>

        {/* Error and Success Messages */}
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        {success && (
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <CheckCircle size={16} /> Answer submitted successfully!
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-[#0B75FF] hover:bg-[#0B75FF]/90 text-white"
            disabled={isSubmitting || !fileLink || !selectedAssessmentId}
          >
            {isSubmitting ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</>
            ) : assessment.answerFileLink ? "Update Answer" : "Submit Answer"}
          </Button>
        </div>
      </form>
    )
  }, [
    isLoadingAssessment,
    assessment,
    assessmentType,
    assessmentLabel,
    noAssessmentsMessage,
    selectedAssessmentId,
    fileLink,
    handleFileLinkChange,
    comment,
    handleCommentChange,
    isSubmitting,
    success,
    error,
    handleSubmit
  ])

  return (
    <Dialog open={isOpen} onOpenChange={handleModalOpenChange}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {modalTitle}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh]">
          {renderContent}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
} 