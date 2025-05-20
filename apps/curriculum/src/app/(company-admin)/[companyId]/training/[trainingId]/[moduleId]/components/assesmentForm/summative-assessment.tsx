"use client";

import { CheckboxAssessmentForm } from "./CheckboxAssessmentForm";

interface AssessmentMethod {
  id: string;
  name: string;
  description: string;
}

interface SummativeProps {
  assessmentMethods: AssessmentMethod[];
}

export function SummativeAssessment({ assessmentMethods }: SummativeProps) {
  return (
    <CheckboxAssessmentForm
      assessmentMethods={assessmentMethods}
      title="Summative Assessments"
      formKey="summative"
    />
  );
}
