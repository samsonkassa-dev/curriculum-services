"use client"

import { AssessmentView } from "./assessment/assessmentView"

interface AssessmentComponentProps {
  trainingId: string
}

export function AssessmentComponent({ trainingId }: AssessmentComponentProps) {
  return <AssessmentView trainingId={trainingId} />
}
