"use client"

import { useState, Suspense } from "react"
import { ModuleInformationProvider, useModuleInformation } from "@/contexts/ModuleInformationContext"
import { ModuleInformationContent } from "./moduleInformation/module-information-content"
import { ModuleInformationView } from "./module-information-view"
import { Loading } from "@/components/ui/loading"
import { useUserRole } from "@/lib/hooks/useUserRole"

interface ModuleInformationProps {
  moduleId: string
}

// Add this component to check if we have data in the context
function ModuleInformationWrapper({ moduleId }: ModuleInformationProps) {
  const [isEditing, setIsEditing] = useState(false)
  const { canEdit } = useUserRole()
  const { hasModuleInformation } = useModuleInformation()
  
  // If the user has edit permissions and either:
  // 1. They're in edit mode, OR
  // 2. There's no module information data
  // Then show the form
  if (canEdit && (isEditing || !hasModuleInformation)) {
    return (
      <ModuleInformationContent 
        onSave={() => setIsEditing(false)}
        onCancel={() => setIsEditing(false)}
      />
    )
  }

  // Otherwise show the accordion view (when we have data)
  return (
    <ModuleInformationView 
      moduleId={moduleId}
      onEdit={() => setIsEditing(true)}
    />
  )
}

// Create a loading fallback component
const ModuleInformationFallback = () => (
  <div className="w-full p-6">
    <Loading />
  </div>
)

export function ModuleInformation({ moduleId }: ModuleInformationProps) {
  // Wrap the component with the provider to get access to the context
  return (
    <Suspense fallback={<ModuleInformationFallback />}>
      <ModuleInformationProvider moduleId={moduleId}>
        <ModuleInformationWrapper moduleId={moduleId} />
      </ModuleInformationProvider>
    </Suspense>
  )
} 