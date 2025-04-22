"use client"

import { useState, Suspense } from "react"
import { AssessmentFormProvider, useAssessmentForm } from "@/contexts/AssessmentFormContext"
import { AssessmentMethodContent } from "./assesmentForm/assessment-method-content"
import { AssessmentMethodView } from "./assessment-method-view"
import { Loading } from "@/components/ui/loading"
import { useUserRole } from "@/lib/hooks/useUserRole"

interface AssessmentMethodProps {
  moduleId: string
}

// Add this component to check if we have data in the context
function AssessmentMethodWrapper({ moduleId }: AssessmentMethodProps) {
  const [isEditing, setIsEditing] = useState(false)
  const { canEdit } = useUserRole()
  const { hasAssessmentMethods } = useAssessmentForm()
  
  // If the user has edit permissions and either:
  // 1. They're in edit mode, OR
  // 2. There's no assessment data
  // Then show the form
  if (canEdit && (isEditing || !hasAssessmentMethods)) {
    return (
      <AssessmentMethodContent 
        moduleId={moduleId}
        onSave={() => setIsEditing(false)}
        onCancel={() => setIsEditing(false)}
      />
    )
  }

  // Otherwise show the accordion view (when we have data)
  return (
    <AssessmentMethodView 
      moduleId={moduleId}
      onEdit={() => setIsEditing(true)}
    />
  )
}

// Create a loading fallback component
const AssessmentMethodFallback = () => (
  <div className="w-full p-6">
    <Loading />
  </div>
)

export function AssessmentMethod({ moduleId }: AssessmentMethodProps) {
  // Wrap the component with the provider to get access to the context
  return (
    <Suspense fallback={<AssessmentMethodFallback />}>
      <AssessmentFormProvider moduleId={moduleId}>
        <AssessmentMethodWrapper moduleId={moduleId} />
      </AssessmentFormProvider>
    </Suspense>
  )
}    