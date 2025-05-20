"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"
import { TrainingAssessment } from "@/lib/hooks/useTrainingAssessment"
import { useAssignAssessmentToSession } from "@/lib/hooks/useTrainingAssessment"
import { useSessions } from "@/lib/hooks/useSession"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface CatAssignSessionModalProps {
  isOpen: boolean
  onClose: () => void
  assessment: TrainingAssessment | null
}

export function AssignSessionModal({
  isOpen,
  onClose,
  assessment
}: CatAssignSessionModalProps) {
  const params = useParams()
  const trainingId = params.trainingId as string
  const [sessionId, setSessionId] = useState<string>("")
  const [error, setError] = useState<string | null>(null)

  // Fetch sessions for the current training
  const { data: sessionsData, isLoading: isLoadingSessions } = useSessions({
    trainingIds: [trainingId],
  })

  // Assign assessment to session mutation
  const { mutateAsync: assignToSession, isPending: isAssigning } = useAssignAssessmentToSession()

  // Reset selected session when modal opens
  useEffect(() => {
    if (isOpen) {
      setSessionId("")
      setError(null)
    }
  }, [isOpen])

  // Set initial session if assessment already has one assigned
  useEffect(() => {
    if (assessment?.sessionId) {
      setSessionId(assessment.sessionId)
    }
  }, [assessment])

  const handleSubmit = async () => {
    if (!sessionId) {
      setError("Please select a session")
      return
    }

    if (!assessment) return

    try {
      await assignToSession({
        assessmentId: assessment.id,
        assignData: {
          sessionId
        }
      })
      onClose()
    } catch (err) {
      setError("Failed to assign assessment to session")
      console.error("Error assigning assessment to session:", err)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>
            Assign Assessment to Session
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {assessment && (
            <div className="space-y-1">
              <Label>Assessment</Label>
              <div className="font-medium text-gray-900 border p-2 rounded-md bg-gray-50">
                {assessment.name}
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="session">
              Select Session <span className="text-red-500">*</span>
            </Label>
            
            <Select value={sessionId} onValueChange={setSessionId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a session" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingSessions ? (
                  <div className="flex items-center justify-center p-2">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Loading sessions...
                  </div>
                ) : sessionsData?.sessions && sessionsData.sessions.length > 0 ? (
                  sessionsData.sessions.map((session) => (
                    <SelectItem key={session.id} value={session.id}>
                      {session.name || `Session ${session.id}`}
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-gray-500">No sessions available</div>
                )}
              </SelectContent>
            </Select>
            
            {error && (
              <p className="text-red-500 text-xs mt-1">{error}</p>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            disabled={isAssigning}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isAssigning || isLoadingSessions}
            className="bg-[#0B75FF] hover:bg-[#0B75FF]/90 text-white"
          >
            {isAssigning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Assigning...
              </>
            ) : (
              "Assign Session"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 