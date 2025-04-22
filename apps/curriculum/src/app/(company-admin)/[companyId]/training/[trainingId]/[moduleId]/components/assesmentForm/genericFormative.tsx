"use client"

import { CheckboxAssessmentForm } from "./CheckboxAssessmentForm"

interface AssessmentMethod {
  id: string
  name: string
  description: string
}

interface GenericFormativeProps {
  assessmentMethods: AssessmentMethod[]
}

export function GenericFormative({ assessmentMethods }: GenericFormativeProps) {
  return (
    <CheckboxAssessmentForm
      assessmentMethods={assessmentMethods}
      title="General Formative Assessments"
      formKey="genericFormative"
    />
  )
} 