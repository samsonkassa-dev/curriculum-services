"use client"

import { useState } from "react"
import { useAudienceProfile } from "@/lib/hooks/useAudienceProfile"
import { DefaultCreate } from "./defaultCreate"
import { AudienceProfileEdit } from "./audience-profile/audience-profile-edit"
import { AudienceProfileView } from "./audience-profile/audience-profile-view"
import { Loading } from "@/components/ui/loading"
import { useBaseData } from "@/lib/hooks/useBaseData"

interface AudienceProfileProps {
  trainingId: string
}

export function AudienceProfile({ trainingId }: AudienceProfileProps) {
  const [isEditing, setIsEditing] = useState(false)
  const { data: audienceProfile, isLoading } = useAudienceProfile(trainingId)
  const { data: learnerLevels, isLoading: isLoadingLearnerLevels } = useBaseData('learner-level')
  const { data: academicLevels, isLoading: isLoadingAcademicLevels } = useBaseData('academic-level')
  const { data: learnerStylePreferences, isLoading: isLoadingLearningStyles } = useBaseData('learner-style-preference')
  const userRole = localStorage.getItem("user_role")
  const canEdit = userRole === "ROLE_COMPANY_ADMIN" || userRole === "ROLE_CURRICULUM_ADMIN"

  const isEmptyProfile = !audienceProfile || (
    !audienceProfile.learnerLevel?.id &&
    !audienceProfile.academicLevel?.id &&
    (!audienceProfile.learnerStylePreferences || audienceProfile.learnerStylePreferences.length === 0) &&
    (!audienceProfile.priorKnowledgeList || audienceProfile.priorKnowledgeList.length === 0) &&
    !audienceProfile.professionalBackground
  )

  if (isLoading || isLoadingLearnerLevels || isLoadingAcademicLevels || isLoadingLearningStyles) {
    return <Loading />
  }

  if (isEditing && canEdit) {
    return (
      <AudienceProfileEdit
        trainingId={trainingId}
        initialData={audienceProfile || null}
        learnerLevels={learnerLevels || []}
        academicLevels={academicLevels || []}
        learnerStylePreferences={learnerStylePreferences || []}
        onSave={() => setIsEditing(false)}
        onCancel={() => setIsEditing(false)}
      />
    )
  }

  if (isEmptyProfile && canEdit) {
    return (
      <DefaultCreate 
        title="Create Audience Profile"
        trainingId={trainingId}
        onCreateClick={() => setIsEditing(true)}
      />
    )
  }

  if (isEmptyProfile) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <p className="text-gray-500">No audience profile available yet.</p>
      </div>
    )
  }

  return (
    <AudienceProfileView 
      audienceProfile={audienceProfile}
      onEdit={() => setIsEditing(true)}
      showEditButton={canEdit}
    />
  )
}