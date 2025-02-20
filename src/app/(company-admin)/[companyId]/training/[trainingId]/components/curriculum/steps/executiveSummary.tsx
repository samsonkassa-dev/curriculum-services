"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { EditFormContainer } from "@/components/ui/edit-form-container"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { useAIRecommendation } from "@/lib/hooks/useExecutiveSummary"

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
  
  const { data: aiData, isLoading: isLoadingAI, refetch } = useAIRecommendation(trainingId)

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

  const handleAddAISuggestion = () => {
    if (aiData?.response) {
      const cleanResponse = aiData.response
        .replace(/\*\*/g, '')
        .replace(/\[|\]/g, '')
        .replace(/\n/g, ' ')
      setSummary(cleanResponse)
    }
  }

  const formatAISuggestion = (text: string) => {
    return text
      .replace(/\*\*/g, '')
      .replace(/\[|\]/g, '')
      .split('\n')
      .filter(line => line.trim())
  }

  return (
    <EditFormContainer title="" description="">
      <div className="space-y-8 pr-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Executive Summary</h2>
            <span className="text-xs text-red-500">(Mandatory)</span>
          </div>

          <p className="text-gray-500 text-sm mb-4">
            Enter a brief overview of this section&apos;s content to give users a clear understanding of what to enter.
          </p>

          <Textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Enter executive summary"
            className="min-h-[200px]"
          />

          <div className="flex items-center gap-2 mt-4">
            <span className="text-sm text-brand font-semibold">AI Suggestion</span>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refetch()}
                className="p-0 h-auto"
              >
                <img src="/refresh.svg" alt="refresh" className="w-5 h-5" />
              </Button>
              <Button
                variant="link"
                size="sm"
                onClick={handleAddAISuggestion}
                className="text-brand p-0 h-auto hover:underline"
              >
                Click to add
              </Button>
            </div>
          </div>

          {aiData?.response && (
            <div className=" p-4 rounded-lg">
              <div className="text-sm text-gray-600 whitespace-pre-line">
                {isLoadingAI 
                  ? "Loading suggestion..." 
                  : formatAISuggestion(aiData.response).map((line, index) => (
                      <p key={index} className="mb-2">{line}</p>
                    ))
                }
              </div>
            </div>
          )}
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