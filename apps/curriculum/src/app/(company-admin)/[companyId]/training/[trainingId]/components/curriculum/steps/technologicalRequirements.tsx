/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { EditFormContainer } from "@/components/ui/edit-form-container"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { BaseDataItem } from "@/types/base-data"

interface TechnologicalRequirementsProps {
  trainingId: string
  initialData?: {
    code: string
    message: string
    technologicalRequirements: {
      id: string
      trainingId: string
      learnerTechnologicalRequirements: Array<{
        id: string
        name: string
        description: string
      }>
      instructorTechnologicalRequirements: Array<{
        id: string
        name: string
        description: string
      }>
    }
  } | null
  learnerRequirements: BaseDataItem[]
  instructorRequirements: BaseDataItem[]
  onSave: (data: { 
    trainingId: string
    learnerTechnologicalRequirementIds: string[]
    instructorTechnologicalRequirementIds: string[]
  }) => Promise<void>
  onCancel: () => void
}

export function TechnologicalRequirements({
  trainingId,
  initialData,
  learnerRequirements,
  instructorRequirements,
  onSave,
  onCancel
}: TechnologicalRequirementsProps) {
  console.log('initialData:', initialData)

  const [selectedLearnerTools, setSelectedLearnerTools] = useState<string[]>(() => {
    try {
      return initialData?.technologicalRequirements?.learnerTechnologicalRequirements?.map(req => req.id) || []
    } catch (error) {
      console.error('Error processing learner tools:', error)
      return []
    }
  })

  const [selectedInstructorTools, setSelectedInstructorTools] = useState<string[]>(() => {
    try {
      return initialData?.technologicalRequirements?.instructorTechnologicalRequirements?.map(req => req.id) || []
    } catch (error) {
      console.error('Error processing instructor tools:', error)
      return []
    }
  })

  const [learnerOtherValue, setLearnerOtherValue] = useState("")
  const [instructorOtherValue, setInstructorOtherValue] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSave = async () => {
    try {
      setIsSubmitting(true)
      await onSave({
        trainingId,
        learnerTechnologicalRequirementIds: selectedLearnerTools.filter(id => id !== 'other'),
        instructorTechnologicalRequirementIds: selectedInstructorTools.filter(id => id !== 'other')
      })
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLearnerToolChange = (toolId: string, checked: boolean) => {
    if (checked) {
      setSelectedLearnerTools(prev => [...prev, toolId])
    } else {
      setSelectedLearnerTools(prev => prev.filter(id => id !== toolId))
    }
  }

  const handleInstructorToolChange = (toolId: string, checked: boolean) => {
    if (checked) {
      setSelectedInstructorTools(prev => [...prev, toolId])
    } else {
      setSelectedInstructorTools(prev => prev.filter(id => id !== toolId))
    }
  }

  return (
    <EditFormContainer
      title="Technology Requirements"
      description="Enter a brief overview of this section's content to give users a clear understanding of what to enter."
    >
      <div className="space-y-8 pr-8">
        {/* For Learners Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">For Learners</h2>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            {learnerRequirements.map((tool) => (
              <div key={tool.id} className="flex items-center space-x-3">
                <Checkbox
                  id={`learner-${tool.id}`}
                  checked={selectedLearnerTools.includes(tool.id)}
                  onCheckedChange={(checked) =>
                    handleLearnerToolChange(tool.id, checked as boolean)
                  }
                />
                <label
                  htmlFor={`learner-${tool.id}`}
                  className="text-sm md:text-base text-gray-500 font-normal"
                >
                  {tool.name}
                </label>
              </div>
            ))}
            <div className="flex items-center space-x-3">
              <Checkbox
                id="learner-other"
                checked={selectedLearnerTools.includes("other")}
                onCheckedChange={(checked) =>
                  handleLearnerToolChange("other", checked as boolean)
                }
              />
              <label
                htmlFor="learner-other"
                className="text-sm md:text-base text-gray-500 font-normal"
              >
                Other
              </label>
            </div>
          </div>

          {selectedLearnerTools.includes("other") && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium">If Others, Please Specify.</h3>
              <Input
                value={learnerOtherValue}
                onChange={(e) => setLearnerOtherValue(e.target.value)}
                placeholder="Please specify other requirement"
                className="max-w-md"
              />
            </div>
          )}
        </div>

        {/* For Instructors Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">For Instructors</h2>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            {instructorRequirements.map((tool) => (
              <div key={tool.id} className="flex items-center space-x-3">
                <Checkbox
                  id={`instructor-${tool.id}`}
                  checked={selectedInstructorTools.includes(tool.id)}
                  onCheckedChange={(checked) =>
                    handleInstructorToolChange(tool.id, checked as boolean)
                  }
                />
                <label
                  htmlFor={`instructor-${tool.id}`}
                  className="text-sm md:text-base text-gray-500 font-normal"
                >
                  {tool.name}
                </label>
              </div>
            ))}
            <div className="flex items-center space-x-3">
              <Checkbox
                id="instructor-other"
                checked={selectedInstructorTools.includes("other")}
                onCheckedChange={(checked) =>
                  handleInstructorToolChange("other", checked as boolean)
                }
              />
              <label
                htmlFor="instructor-other"
                className="text-sm md:text-base text-gray-500 font-normal"
              >
                Other
              </label>
            </div>
          </div>

          {selectedInstructorTools.includes("other") && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium">
                If Others, Please Specify.
              </h3>
              <Input
                value={instructorOtherValue}
                onChange={(e) => setInstructorOtherValue(e.target.value)}
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
              (selectedLearnerTools.length === 0 &&
                selectedInstructorTools.length === 0) ||
              (selectedLearnerTools.includes("other") &&
                !learnerOtherValue.trim()) ||
              (selectedInstructorTools.includes("other") &&
                !instructorOtherValue.trim())
            }
          >
            {isSubmitting ? "Saving..." : "Save and Continue"}
          </Button>
        </div>
      </div>
    </EditFormContainer>
  );
} 