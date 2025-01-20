"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { EditFormContainer } from "@/components/ui/edit-form-container"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

interface ApiError {
  message: string
}

interface ExecutiveSummaryProps {
  trainingId: string
  initialData?: {
    code: string
    executiveSummary: string
    message: string
  } | null
  onSave: (data: { executiveSummary: string, trainingId: string }) => Promise<void>
  onCancel: () => void
}

export function ExecutiveSummary({
  trainingId,
  initialData,
  onSave,
  onCancel
}: ExecutiveSummaryProps) {
  const [summary, setSummary] = useState(initialData?.executiveSummary || '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSave = async () => {
    if (!summary.trim()) {
      toast.error("Executive summary is required")
      return
    }

    try {
      setIsSubmitting(true)
      await onSave({
        executiveSummary: summary.trim(),
        trainingId
      })
    } catch (error: unknown) {
      const apiError = error as ApiError
      toast.error(apiError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <EditFormContainer
      title=""
      description=""
    >
      <div className="space-y-8 pr-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Executive Summary</h2>
            <span className="text-xs text-red-500">(Mandatory)</span>
          </div>

          <p className="text-gray-500 text-sm mb-4 w-full">
            Enter a brief overview of this section&apos;s content to give users a clear understanding of what to enter.
          </p>

          <Textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Enter executive summary"
            className="min-h-[200px]"
          />
        </div>

        <div className="flex justify-center gap-10 pt-8">
          <Button variant="outline" onClick={onCancel}>
            Back
          </Button>
          <Button 
            onClick={handleSave}
            className="bg-brand text-white"
            disabled={isSubmitting || !summary.trim()}
          >
            {isSubmitting ? "Saving..." : "Save and Continue"}
          </Button>
        </div>
      </div>
    </EditFormContainer>
  )
} 