"use client"

import { Button } from "@/components/ui/button"
import { useState, useEffect, useRef } from "react"
import { SessionReportModal } from "./reports"
import { useGetSessionReport } from "@/lib/hooks/useReportAndAttendance"
import { CheckCircle, Loader2 } from "lucide-react"

interface AddReportButtonProps {
  sessionId: string
  disabled?: boolean
}

export function AddReportButton({ sessionId, disabled = false }: AddReportButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [hasReport, setHasReport] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const didInitialCheck = useRef(false)
  
  const { data: sessionReport, isLoading } = useGetSessionReport(sessionId)
  
  // Reset state when sessionId changes
  useEffect(() => {
    setHasReport(false)
    didInitialCheck.current = false
  }, [sessionId])
  
  // Check if report exists when the component mounts or when report data changes
  useEffect(() => {
    if (sessionReport?.report && !didInitialCheck.current) {
      setHasReport(true)
      didInitialCheck.current = true
    }
  }, [sessionReport])
  
  const handleReportStatusChange = (status: boolean) => {
    setHasReport(status)
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
  
  // Combine disabled state: component is disabled if explicitly disabled, or if report exists, or during loading/submitting
  const isButtonDisabled = disabled || hasReport || isLoading || isSubmitting
  
  return (
    <>
      <Button 
        variant="outline"
        className={`h-9 ${hasReport ? "bg-green-100 text-green-700 hover:bg-green-200 border-green-300" : ""} ${disabled && !hasReport ? "opacity-60" : ""}`}
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
        ) : hasReport ? (
          <span className="text-sm flex items-center gap-1">
            <CheckCircle className="h-4 w-4" />
            Report Added
          </span>
        ) : (
          <span className="text-sm">Add Report</span>
        )}
      </Button>
      
      {isModalOpen && (
        <SessionReportModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          sessionId={sessionId}
          onReportStatusChange={handleReportStatusChange}
          onSubmitStart={handleSubmitStart}
        />
      )}
    </>
  )
} 