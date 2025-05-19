"use client"

import { useState, useEffect } from "react"
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
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"

interface AssignSessionModalProps {
  isOpen: boolean
  onClose: () => void
  assessment: TrainingAssessment
  trainingId: string
  isSubmitting: boolean
  onAssignSession: (sessionId: string) => Promise<void>
}

export function AssignSessionModal({
  isOpen,
  onClose,
  assessment,
  trainingId,
  isSubmitting,
  onAssignSession
}: AssignSessionModalProps) {
  const [sessionId, setSessionId] = useState("")
  const [error, setError] = useState<string | null>(null)
  // Simulate loading sessions
  const isLoading = false
  const sessions = [
    { id: "session1", title: "Morning Session", sessionDate: new Date("2023-12-01") },
    { id: "session2", title: "Afternoon Session", sessionDate: new Date("2023-12-02") },
    { id: "session3", title: "Evening Session", sessionDate: new Date("2023-12-03") }
  ]

  useEffect(() => {
    // If assessment already has a sessionId, preselect it
    if (assessment.sessionId) {
      setSessionId(assessment.sessionId)
    }
  }, [assessment])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!sessionId) {
      setError("Please select a session")
      return
    }
    
    setError(null)
    await onAssignSession(sessionId)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            Assign Assessment to Session
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>
              Assessment
            </Label>
            <div className="text-sm font-medium text-gray-700 p-2 border rounded-md bg-gray-50">
              {assessment.name}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="sessionId">
              Session <span className="text-red-500">*</span>
            </Label>
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Loading sessions...</span>
              </div>
            ) : (
              <Select 
                value={sessionId} 
                onValueChange={setSessionId}
              >
                <SelectTrigger 
                  id="sessionId"
                  className={error ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select a session" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {sessions.map((session) => (
                      <SelectItem key={session.id} value={session.id}>
                        {session.title || "Untitled Session"} {session.sessionDate && `(${session.sessionDate.toLocaleDateString()})`}
                      </SelectItem>
                    ))}
                    {!sessions.length && (
                      <SelectItem value="" disabled>
                        No sessions available
                      </SelectItem>
                    )}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
            {error && (
              <p className="text-red-500 text-xs mt-1">{error}</p>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting || isLoading}
              className="bg-[#0B75FF] hover:bg-[#0B75FF]/90 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Assigning...
                </>
              ) : (
                "Assign to Session"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 