/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useMemo, useEffect } from "react"
import { usePrerequisite, useCreatePrerequisite } from "@/lib/hooks/usePrerequisite"
import { useBaseData } from "@/lib/hooks/useBaseData"
import { DefaultCreate } from "./defaultCreate"
import { CurriculumEdit } from "./curriculum/curriculum-edit"
import { Loading } from "@/components/ui/loading"
import { toast } from "sonner"
import { PrerequisiteData } from "@/types/curriculum"
import { useObjective } from "@/lib/hooks/useObjective"
import { CurriculumView } from "./curriculum/curriculum-view"
import { ObjectiveFormData } from "./curriculum/steps/objective"
import { useModeDelivery } from "@/lib/hooks/useModeDelivery"
import { useTechnologicalRequirements } from "@/lib/hooks/useTechnologicalRequirements"
import { useTrainerRequirements } from "@/lib/hooks/useTrainerRequirements"
import { useReferences } from "@/lib/hooks/useReferences"
import { useAppendices } from "@/lib/hooks/useAppendices"
import { useExecutiveSummary } from "@/lib/hooks/useExecutiveSummary"

interface CurriculumProps {
  trainingId: string
}

export function Curriculum({ trainingId }: CurriculumProps) {
  const [isEditing, setIsEditing] = useState(false)
  // Add user role check
  const userRole = localStorage.getItem("user_role")
  const canEdit = userRole === "ROLE_COMPANY_ADMIN" || userRole === "ROLE_CURRICULUM_ADMIN"
  
  const { data: prerequisiteData, isLoading: isLoadingPrerequisite } = usePrerequisite(trainingId)
  const { data: objectiveData, isLoading: isLoadingObjective } = useObjective(trainingId)
  const { data: educationLevels, isLoading: isLoadingEducationLevels } = useBaseData('education-level')
  const { data: languages, isLoading: isLanguage } = useBaseData('language')
  const { data: workExperiences, isLoading: isLoadingWorkExperience } = useBaseData('work-experience')
  const {data: deliveryTools, isLoading: isLoadingDeliveryTools} = useBaseData('delivery-tool')
  const prerequisiteMutation = useCreatePrerequisite()
  const isEmptyCurriculum = !prerequisiteData


  const handleSave = async (data: PrerequisiteData) => {
    try {
      await prerequisiteMutation.mutateAsync(data)
      toast.success("Prerequisites saved successfully")
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleObjectiveSave = async (data: ObjectiveFormData) => {
    try {
      setIsEditing(false)
      toast.success("Objectives saved successfully")
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  // Add new hooks
  const { data: modeDeliveryData } = useModeDelivery(trainingId)
  const { data: techRequirementsData } = useTechnologicalRequirements(trainingId)
  const { data: trainerRequirementsData } = useTrainerRequirements(trainingId)
  const { data: referencesData } = useReferences(trainingId)
  const { data: appendicesData } = useAppendices(trainingId)
  const { data: executiveSummaryData } = useExecutiveSummary(trainingId)

  const isAllStepsComplete = useMemo(() => {
    return !!(
      prerequisiteData &&
      objectiveData?.generalObjective &&
      modeDeliveryData?.deliveryTools?.deliveryTools?.length &&
      (techRequirementsData?.technologicalRequirements?.learnerTechnologicalRequirements?.length ||
        techRequirementsData?.technologicalRequirements?.instructorTechnologicalRequirements?.length) &&
      trainerRequirementsData?.trainerRequirements?.trainerRequirements?.length &&
      (referencesData?.references?.length || appendicesData?.appendices?.length) &&
      executiveSummaryData?.executiveSummary
    )
  }, [
    prerequisiteData, objectiveData, modeDeliveryData, techRequirementsData,
    trainerRequirementsData, referencesData, appendicesData, executiveSummaryData
  ])

  // Force edit mode if any step is incomplete
  useEffect(() => {
    if (!isAllStepsComplete && !isEmptyCurriculum) {
      setIsEditing(true)
    }
  }, [isAllStepsComplete, isEmptyCurriculum])

  if (isEditing && canEdit) {
    return (
      <CurriculumEdit
        trainingId={trainingId}
        prerequisiteData={prerequisiteData || null}
        deliveryTools={deliveryTools || []}
        educationLevels={educationLevels || []}
        languages={languages || []}
        workExperiences={workExperiences || []}
        onPrerequisiteSave={handleSave}
        onObjectiveSave={handleObjectiveSave}
        onCancel={() => setIsEditing(false)}
      />
    )
  }

  if (isLoadingPrerequisite || isLoadingObjective || isLoadingEducationLevels || isLanguage || isLoadingWorkExperience || isLoadingDeliveryTools ) {
    return <Loading />
  }

  if (isEmptyCurriculum && canEdit) {
    return (
      <DefaultCreate 
        title="Create Curriculum"
        trainingId={trainingId}
        onCreateClick={() => setIsEditing(true)}
      />
    )
  }

  if (isEmptyCurriculum) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <p className="text-gray-500">No curriculum available yet.</p>
      </div>
    )
  }

  return (
    <CurriculumView 
      prerequisiteData={prerequisiteData}
      objectiveData={objectiveData || null}
      modeDeliveryData={modeDeliveryData || null}
      techRequirementsData={techRequirementsData || null}
      trainerRequirementsData={trainerRequirementsData || null}
      referencesData={referencesData || null}
      appendicesData={appendicesData || null}
      executiveSummaryData={executiveSummaryData || null}
      onEdit={() => setIsEditing(true)}
      showEditButton={canEdit}
    />
  )
}