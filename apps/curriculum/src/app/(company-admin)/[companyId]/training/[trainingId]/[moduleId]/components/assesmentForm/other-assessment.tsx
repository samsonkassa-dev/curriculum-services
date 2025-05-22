"use client";

import { CheckboxAssessmentForm } from "./CheckboxAssessmentForm";

interface AssessmentMethod {
  id: string;
  name: string;
  description: string;
}

interface OtherAssessmentProps {
  assessmentMethods: AssessmentMethod[];
}

export function OtherAssessment({ assessmentMethods }: OtherAssessmentProps) {
  return (
    <CheckboxAssessmentForm
      assessmentMethods={assessmentMethods}
      title="Other Assessments"
      formKey="other"
    />
  );
}
