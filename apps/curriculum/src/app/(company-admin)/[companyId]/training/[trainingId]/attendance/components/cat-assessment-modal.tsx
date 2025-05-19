"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, CheckCircle, FileQuestion } from "lucide-react"
import { 
  useSessionAssessments,
  useSubmitAssessmentAnswer,
  TrainingAssessment
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

interface CatAssessmentModalProps {
  sessionId: string
  studentId: string
  studentName: string
  currentAnswer?: string | null
  trigger: React.ReactNode
}

export default function CatAssessmentModal({
  sessionId,
  studentId,
  studentName,
  currentAnswer = "",
  trigger
}: CatAssessmentModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [fileLink, setFileLink] = useState(currentAnswer || "")
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>("")
  const [comment, setComment] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Fetch session assessments
  const { data: assessmentsData, isLoading: isLoadingAssessments } = useSessionAssessments(sessionId)
  const assessments = assessmentsData?.trainingAssessments || []

  // Get trainer profile for ID
  const { profile } = useProfile()
  const trainerId = profile.data?.id

  // Submit assessment answer mutation
  const { mutateAsync: submitAnswer } = useSubmitAssessmentAnswer()

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setFileLink(currentAnswer || "")
      setError(null)
      setSuccess(false)

      // Set first assessment as default when loaded
      if (assessments.length === 1) {
        setSelectedAssessmentId(assessments[0].id)
      }
    }
  }, [isOpen, currentAnswer, assessments])

  const handleSubmit = async (e: React.FormEvent) => {
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
  }

  const renderContent = () => {
    // Loading state
    if (isLoadingAssessments) {
      return (
        <div className="flex flex-col items-center justify-center py-6">
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-2" />
          <p className="text-gray-500">Loading assessments...</p>
        </div>
      )
    }

    // No assessments for this session
    if (!assessments || assessments.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <FileQuestion className="h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-700">No Assessments Available</h3>
          <p className="text-gray-500 mt-1 max-w-xs">
            There are no CAT assessments assigned to this session yet. Please assign assessments first.
          </p>
        </div>
      )
    }

    // Form for submitting assessment answer
    return (
      <form onSubmit={handleSubmit} className="space-y-4 py-2">
        {/* Assessment selection if more than one */}
        {assessments.length > 1 && (
          <div className="space-y-2">
            <Label htmlFor="assessment">Assessment</Label>
            <Select 
              value={selectedAssessmentId} 
              onValueChange={setSelectedAssessmentId}
            >
              <SelectTrigger id="assessment">
                <SelectValue placeholder="Select an assessment" />
              </SelectTrigger>
              <SelectContent>
                {assessments.map((assessment: TrainingAssessment) => (
                  <SelectItem key={assessment.id} value={assessment.id}>
                    {assessment.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Show assessment details if only one assessment or one is selected */}
        {(assessments.length === 1 || selectedAssessmentId) && (
          <div className="bg-gray-50 p-3 rounded-md border">
            <h4 className="font-medium">{assessments.length === 1 
              ? assessments[0].name 
              : assessments.find(a => a.id === selectedAssessmentId)?.name}</h4>
            <p className="text-xs text-gray-500 mt-1">{assessments.length === 1 
              ? assessments[0].description 
              : assessments.find(a => a.id === selectedAssessmentId)?.description}</p>
          </div>
        )}

        {/* File Link Field */}
        <div className="space-y-2">
          <Label htmlFor="fileLink">File Link</Label>
          <Input
            id="fileLink"
            placeholder="Enter file link"
            value={fileLink}
            onChange={e => setFileLink(e.target.value)}
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
            onChange={e => setComment(e.target.value)}
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
            disabled={isSubmitting || !fileLink || (assessments.length > 1 && !selectedAssessmentId)}
          >
            {isSubmitting ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</>
            ) : currentAnswer ? "Update Answer" : "Submit Answer"}
          </Button>
        </div>
      </form>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            CAT Assessment for {studentName}
          </DialogTitle>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  )
} 