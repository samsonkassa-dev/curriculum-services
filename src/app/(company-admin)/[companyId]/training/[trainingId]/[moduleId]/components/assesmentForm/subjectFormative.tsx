"use client"

import { useAssessmentForm } from "@/contexts/AssessmentFormContext"
import { EditFormContainer } from "@/components/ui/edit-form-container"
import { Textarea } from "@/components/ui/textarea"

export function SubjectFormative() {
  const { formData, updateFormData } = useAssessmentForm()

  return (
    <EditFormContainer title="" description="">
      <div className="space-y-8 pr-0 md:pr-8">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm md:text-base font-semibold">Subject-Specific Formative Assessments</h2>
            <span className="text-[10px] md:text-xs text-red-500">
              (Mandatory)
            </span>
          </div>
          <p className="text-[12px] text-[#99948E]">
            This section details the specific technology tools used to support teaching and learning.
          </p>

          <div className="mt-4">
            <Textarea
              value={formData.subjectSpecificMethod || ''}
              onChange={(e) => updateFormData("subjectSpecificMethod", '', e.target.value)}
              placeholder="Enter subject-specific assessment method"
              className="min-h-[100px] text-sm"
            />
          </div>
        </div>
      </div>
    </EditFormContainer>
  )
} 