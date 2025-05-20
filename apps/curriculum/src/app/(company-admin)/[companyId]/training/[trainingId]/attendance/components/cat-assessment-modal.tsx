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
import { Loader2, CheckCircle, FileQuestion, AlertCircle } from "lucide-react"
import { 
  useSessionAssessments,
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
  const [filledAssessments, setFilledAssessments] = useState<string[]>([])

  // Fetch session assessments
  const { data: assessmentsData, isLoading: isLoadingAssessments } = useSessionAssessments(sessionId)
  const assessments = assessmentsData?.trainingAssessments || []

  // Fetch individual assessment details when selected (with student-specific data)
  const { data: assessmentDetailData, isLoading: isLoadingAssessmentDetail } = useTrainingAssessment(
    selectedAssessmentId, 
    selectedAssessmentId ? studentId : undefined
  )
  const assessmentDetail = assessmentDetailData?.trainingAssessment as TrainingAssessmentWithAnswer

  // Get trainer profile for ID
  const { profile } = useProfile()
  const trainerId = profile.data?.id

  // Submit assessment answer mutation
  const { mutateAsync: submitAnswer } = useSubmitAssessmentAnswer()

  // Reset state when modal opens and load filled assessments
  useEffect(() => {
    if (isOpen) {
      setError(null)
      setSuccess(false)

      // Identify which assessments already have answers from this student
      const filled: string[] = []
      
      // We'll initialize with empty arrays to avoid issues
      setFilledAssessments([])
      
      // Set first assessment as default when loaded (if none are selected)
      if (assessments.length === 1 && !selectedAssessmentId) {
        setSelectedAssessmentId(assessments[0].id)
      }
    }
  }, [isOpen, assessments, selectedAssessmentId])

  // When assessment details are loaded or changed, update form fields
  useEffect(() => {
    if (assessmentDetail) {
      // Set file link and comment from the loaded assessment
      setFileLink(assessmentDetail.answerFileLink || "")
      setComment(assessmentDetail.comment || "")
      
      // Mark this assessment as filled if it has an answer
      if (assessmentDetail.answerFileLink) {
        setFilledAssessments(prev => 
          prev.includes(assessmentDetail.id) ? prev : [...prev, assessmentDetail.id]
        )
      }
    }
  }, [assessmentDetail])

  // Handle assessment selection change
  const handleAssessmentChange = (assessmentId: string) => {
    setSelectedAssessmentId(assessmentId)
    setError(null)
    setSuccess(false)
  }

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
      
      // Add this assessment to the filled list
      setFilledAssessments(prev => 
        prev.includes(selectedAssessmentId) ? prev : [...prev, selectedAssessmentId]
      )
      
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
      <form onSubmit={handleSubmit} className="space-y-4 py-2 px-5">
        {/* Assessment selection */}
        <div className="space-y-2">
          <Label htmlFor="assessment">Assessment</Label>
          <Select 
            value={selectedAssessmentId} 
            onValueChange={handleAssessmentChange}
          >
            <SelectTrigger id="assessment" className="">
              <SelectValue placeholder="Select an assessment" />
            </SelectTrigger>
            <SelectContent>
              {assessments.map((assessment: TrainingAssessment) => (
                <SelectItem key={assessment.id} value={assessment.id} className="flex items-center">
                  <div className="flex items-center gap-2">
                    {assessment.name}
                    {filledAssessments.includes(assessment.id) && (
                      <Badge variant="secondary" className="ml-2 bg-green-50 text-green-700 text-[10px]">
                        Filled
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Show assessment details if one is selected */}
        {selectedAssessmentId && (
          <div className="bg-gray-50 p-3 rounded-md border">
            {isLoadingAssessmentDetail ? (
              <div className="flex items-center justify-center py-3">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm text-gray-500">Loading assessment details...</span>
              </div>
            ) : assessmentDetail ? (
              <>
                <h4 className="font-medium">{assessmentDetail.name}</h4>
                <p className="text-xs text-gray-500 mt-1">{assessmentDetail.description}</p>
                
                {/* Show assessment file link if available */}
                {assessmentDetail.fileLink && (
                  <div className="mt-2 text-xs flex items-center">
                    <span className="text-gray-600 mr-1">Assessment file:</span>
                    <a 
                      href={assessmentDetail.fileLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline truncate"
                    >
                      {assessmentDetail.fileLink}
                    </a>
                  </div>
                )}
                
                {/* Show if this assessment already has an answer */}
                {filledAssessments.includes(assessmentDetail.id) && (
                  <div className="mt-2 text-xs flex items-center">
                    <Badge variant="secondary" className="bg-green-50 text-green-700">
                      Answer already submitted
                    </Badge>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center justify-center py-3">
                <AlertCircle className="h-4 w-4 text-amber-500 mr-2" />
                <span className="text-sm text-gray-500">Could not load assessment details</span>
              </div>
            )}
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
            disabled={isSubmitting || success || isLoadingAssessmentDetail}
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
            disabled={isSubmitting || success || isLoadingAssessmentDetail}
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
            disabled={isSubmitting || !fileLink || !selectedAssessmentId || isLoadingAssessmentDetail}
          >
            {isSubmitting ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</>
            ) : filledAssessments.includes(selectedAssessmentId) ? "Update Answer" : "Submit Answer"}
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
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            CAT Assessment for {studentName}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh]">
          {renderContent()}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
} 