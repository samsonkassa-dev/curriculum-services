"use client"

import { CheckboxAssessmentForm } from "./CheckboxAssessmentForm"

interface AssessmentMethod {
  id: string
  name: string
  description: string
}

interface AlternativeFormativeProps {
  assessmentMethods: AssessmentMethod[]
}

export function AlternativeFormative({ assessmentMethods }: AlternativeFormativeProps) {
  return (
    <CheckboxAssessmentForm
      assessmentMethods={assessmentMethods}
      title="Alternative Formative Assessments"
      formKey="alternativeFormative"
    />
  )
} 