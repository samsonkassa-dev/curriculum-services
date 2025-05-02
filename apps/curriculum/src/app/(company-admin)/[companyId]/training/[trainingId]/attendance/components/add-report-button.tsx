"use client"

import { Button } from "@/components/ui/button"
import { useState, useEffect, useRef } from "react"
import { SessionReportModal } from "./reports"
import { useGetSessionReport } from "@/lib/hooks/useReportAndAttendance"
import { CheckCircle } from "lucide-react"

interface AddReportButtonProps {
  sessionId: string
}

export function AddReportButton({ sessionId }: AddReportButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [hasReport, setHasReport] = useState(false)
  const didInitialCheck = useRef(false)
  
  const { data: sessionReport } = useGetSessionReport(sessionId)
  
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
  }
  
  return (
    <>
      <Button 
        variant="outline"
        className={`h-9 ${hasReport ? "bg-green-100 text-green-700 hover:bg-green-200 border-green-300" : ""}`}
        onClick={() => setIsModalOpen(true)}
        disabled={hasReport}
      >
        {hasReport ? (
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
        />
      )}
    </>
  )
} 