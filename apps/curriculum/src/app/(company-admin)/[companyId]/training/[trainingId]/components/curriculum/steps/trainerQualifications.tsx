/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { EditFormContainer } from "@/components/ui/edit-form-container"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { BaseDataItem } from "@/types/base-data"

interface ApiError {
  message: string
}

interface TrainerQualificationsProps {
  trainingId: string
  initialData?: {
    code: string
    message: string
    trainerRequirements: {
      id: string
      trainingId: string
      trainerRequirements: Array<{
        id: string
        name: string
        description: string
      }>
    }
  } | null
  trainerRequirements: BaseDataItem[]
  onSave: (data: { 
    trainingId: string
    trainerRequirementIds: string[]
  }) => Promise<void>
  onCancel: () => void
}

export function TrainerQualifications({
  trainingId,
  initialData,
  trainerRequirements,
  onSave,
  onCancel
}: TrainerQualificationsProps) {
  const [selectedRequirements, setSelectedRequirements] = useState<string[]>(() => {
    try {
      return initialData?.trainerRequirements?.trainerRequirements?.map(req => req.id) || []
    } catch (error) {
      console.error('Error processing trainer requirements:', error)
      return []
    }
  })

  const [otherValue, setOtherValue] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleRequirementChange = (reqId: string, checked: boolean) => {
    if (checked) {
      setSelectedRequirements(prev => [...prev, reqId])
    } else {
      setSelectedRequirements(prev => prev.filter(id => id !== reqId))
    }
  }

  const handleSave = async () => {
    try {
      setIsSubmitting(true)
      await onSave({
        trainingId,
        trainerRequirementIds: selectedRequirements.filter(id => id !== "other")
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
      title="Trainer Qualifications"
      description="Enter a brief overview of this section's content to give users a clear understanding of what to enter."
    >
      <div className="space-y-8 pr-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Required Qualifications</h2>
            <span className="text-xs text-red-500">(Required)</span>
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            {trainerRequirements.map((req) => (
              <div key={req.id} className="flex items-center space-x-3">
                <Checkbox
                  id={req.id}
                  checked={selectedRequirements.includes(req.id)}
                  onCheckedChange={(checked) => 
                    handleRequirementChange(req.id, checked as boolean)
                  }
                />
                <label 
                  htmlFor={req.id}
                  className="text-sm md:text-base text-gray-500 font-normal"
                >
                  {req.name}
                </label>
              </div>
            ))}
            <div className="flex items-center space-x-3">
              <Checkbox
                id="other"
                checked={selectedRequirements.includes("other")}
                onCheckedChange={(checked) => 
                  handleRequirementChange("other", checked as boolean)
                }
              />
              <label 
                htmlFor="other"
                className="text-sm md:text-base text-gray-500 font-normal"
              >
                Other
              </label>
            </div>
          </div>

          {selectedRequirements.includes("other") && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium">If Others, Please Specify.</h3>
              <Input
                value={otherValue}
                onChange={(e) => setOtherValue(e.target.value)}
                placeholder="Please specify other requirement"
                className="max-w-md"
              />
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
            disabled={
              isSubmitting || 
              selectedRequirements.length === 0 ||
              (selectedRequirements.includes("other") && !otherValue.trim())
            }
          >
            {isSubmitting ? "Saving..." : "Save and Continue"}
          </Button>
        </div>
      </div>
    </EditFormContainer>
  )
}
