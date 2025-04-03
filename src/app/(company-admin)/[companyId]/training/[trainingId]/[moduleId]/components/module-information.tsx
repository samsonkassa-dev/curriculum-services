"use client"

import { useState } from "react"
import { ModuleInformationProvider, useModuleInformation } from "@/contexts/ModuleInformationContext"
import { ModuleInformationContent } from "./moduleInformation/module-information-content"
import { ModuleInformationView } from "./module-information-view"

interface ModuleInformationProps {
  moduleId: string
}

// Add this component to check if we have data in the context
function ModuleInformationWrapper({ moduleId }: ModuleInformationProps) {
  const [isEditing, setIsEditing] = useState(false)
  const userRole = localStorage.getItem("user_role")
  const canEdit = userRole === "ROLE_COMPANY_ADMIN" || userRole === "ROLE_CURRICULUM_ADMIN"
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

export function ModuleInformation({ moduleId }: ModuleInformationProps) {
  // Wrap the component with the provider to get access to the context
  return (
    <ModuleInformationProvider moduleId={moduleId}>
      <ModuleInformationWrapper moduleId={moduleId} />
    </ModuleInformationProvider>
  )
} 