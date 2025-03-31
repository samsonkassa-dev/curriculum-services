"use client"

import { CheckboxAssessmentForm } from "./CheckboxAssessmentForm"

interface AssessmentMethod {
  id: string
  name: string
  description: string
}

interface TechnologyFormativeProps {
  assessmentMethods: AssessmentMethod[]
}

export function TechnologyFormative({ assessmentMethods }: TechnologyFormativeProps) {
  return (
    <CheckboxAssessmentForm
      assessmentMethods={assessmentMethods}
      title="Technology-Enhanced Formative Assessments"
      formKey="technologyFormative"
      description="This section details the specific technology tools used to support teaching and learning."
    />
  )
} 