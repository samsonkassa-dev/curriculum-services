"use client";

import { CheckboxAssessmentForm } from "./CheckboxAssessmentForm";

interface AssessmentMethod {
  id: string;
  name: string;
  description: string;
}

interface FormativeProps {
  assessmentMethods: AssessmentMethod[];
}

export function FormativeAssessment({ assessmentMethods }: FormativeProps) {
  return (
    <CheckboxAssessmentForm
      assessmentMethods={assessmentMethods}
      title="Formative Assessments"
      formKey="formative"
    />
  );
}
