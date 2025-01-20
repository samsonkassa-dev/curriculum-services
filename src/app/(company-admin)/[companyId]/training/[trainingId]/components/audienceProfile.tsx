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

  const isEmptyProfile = !audienceProfile || (
    !audienceProfile.learnerLevelId &&
    !audienceProfile.academicLevelId &&
    (!audienceProfile.learningStylePreferenceIds || audienceProfile.learningStylePreferenceIds.length === 0) &&
    (!audienceProfile.priorKnowledgeList || audienceProfile.priorKnowledgeList.length === 0) &&
    !audienceProfile.professionalBackground
  )

  if (isLoading || isLoadingLearnerLevels || isLoadingAcademicLevels || isLoadingLearningStyles) {
    return <Loading />
  }

  if (isEditing) {
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

  if (isEmptyProfile) {
    return (
      <DefaultCreate 
        title="Create Audience Profile"
        trainingId={trainingId}
        onCreateClick={() => setIsEditing(true)}
      />
    )
  }

  return (
    <AudienceProfileView 
      audienceProfile={audienceProfile}
      onEdit={() => {}}
      showEditButton={false}
    />
  )
}