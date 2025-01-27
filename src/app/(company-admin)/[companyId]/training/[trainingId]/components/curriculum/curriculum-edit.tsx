/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
"use client"

import { useState, useEffect, useMemo } from "react"
import { OutlineSidebar } from "@/components/ui/outline-sidebar"
import { cn } from "@/lib/utils"
import { X, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Prerequisites } from "./steps/prerequisites"
import { BaseItem, PrerequisiteData, PrerequisiteResponse } from "@/types/curriculum"
import { Objective, ObjectiveFormData } from "./steps/objective"
import { useObjective, useCreateObjective } from "@/lib/hooks/useObjective"
import { toast } from "sonner"
import { useCreateOutcome } from "@/lib/hooks/useOutcome"
import { ModeDelivery } from "./steps/modeDelivery"
import { useModeDelivery, useAddDeliveryTools } from "@/lib/hooks/useModeDelivery"
import { TechnologicalRequirements } from "./steps/technologicalRequirements"
import { useTechnologicalRequirements, useAddTechnologicalRequirements } from "@/lib/hooks/useTechnologicalRequirements"
import { useBaseData } from "@/lib/hooks/useBaseData"
import { TrainerQualifications } from "./steps/trainerQualifications"
import { useTrainerRequirements, useAddTrainerRequirements } from "@/lib/hooks/useTrainerRequirements"
import { References } from "./steps/references"
import { useReferences, useAddReference } from "@/lib/hooks/useReferences"
import { Appendices } from "./steps/appendices"
import { useAppendices, useAddAppendix } from "@/lib/hooks/useAppendices"
import { ExecutiveSummary } from "./steps/executiveSummary"
import { useExecutiveSummary, useAddExecutiveSummary } from "@/lib/hooks/useExecutiveSummary"



interface CurriculumEditProps {
  trainingId: string
  prerequisiteData: PrerequisiteResponse | null
  educationLevels: BaseItem[]
  languages: BaseItem[]
  workExperiences: BaseItem[]
  deliveryTools: BaseItem[]
  onPrerequisiteSave: (data: PrerequisiteData) => Promise<void>
  onObjectiveSave: (data: ObjectiveFormData) => Promise<void>
  onCancel: () => void
}

type Step = 
  | "Entry Requirements"
  | "Curriculum Objective"
  | "Mode of Delivery"
  | "Technological Requirements"
  | "Trainer Qualifications"
  | "References and Further Reading"
  | "Appendices"
  | "Executive Summary"

export function CurriculumEdit({ 
  trainingId, 
  prerequisiteData,
  educationLevels,
  languages,
  workExperiences,
  deliveryTools,
  onPrerequisiteSave, 
  onObjectiveSave,
  onCancel 
}: CurriculumEditProps) {
  const [activeStep, setActiveStep] = useState<Step>("Entry Requirements")
  const [completedSteps, setCompletedSteps] = useState<Step[]>([])
  const [isMobile, setIsMobile] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)

  const objectiveMutation = useCreateObjective()
  const { data: objectiveData } = useObjective(trainingId)

  const outcomeMutation = useCreateOutcome()

  const { data: modeDeliveryData } = useModeDelivery(trainingId)
  const addDeliveryTools = useAddDeliveryTools()

  const { data: techRequirementsData } = useTechnologicalRequirements(trainingId)
  const addTechRequirements = useAddTechnologicalRequirements()

  // Fetch learner and instructor requirements
  const { data: learnerRequirements } = useBaseData('technological-requirement', { type: 'LEARNER' })
  const { data: instructorRequirements } = useBaseData('technological-requirement', { type: 'INSTRUCTOR' })
  const { data: trainerRequirementsData } = useTrainerRequirements(trainingId)
  const addTrainerRequirements = useAddTrainerRequirements()

  // Add the base data fetch
  const { data: trainerRequirements } = useBaseData('trainer-requirement')

  // Add references hooks
  const { data: referencesData } = useReferences(trainingId)
  const addReference = useAddReference()

  // Add appendices hooks
  const { data: appendicesData } = useAppendices(trainingId)
  const addAppendix = useAddAppendix()

  // Add executive summary hooks
  const { data: executiveSummaryData } = useExecutiveSummary(trainingId)
  const addExecutiveSummary = useAddExecutiveSummary()

  const outlineGroups = useMemo(() => [
    {
      title: "Prerequisites",
      items: [
        { 
          label: "Entry Requirements", 
          isCompleted: !!prerequisiteData || completedSteps.includes("Entry Requirements")
        }
      ]
    },
    {
      title: "Objective and Outcome",
      items: [
        { 
          label: "Curriculum Objective", 
          isCompleted: !!objectiveData?.generalObjective || completedSteps.includes("Curriculum Objective")
        }
      ]
    },
    {
      title: "Implementation and Delivery",
      items: [
        { 
          label: "Mode of Delivery", 
          isCompleted: !!modeDeliveryData?.deliveryTools?.deliveryTools?.length || 
            completedSteps.includes("Mode of Delivery")
        },
        {
          label: "Technological Requirements",
          isCompleted: !!(
            techRequirementsData?.technologicalRequirements?.learnerTechnologicalRequirements?.length ||
            techRequirementsData?.technologicalRequirements?.instructorTechnologicalRequirements?.length
          ) || completedSteps.includes("Technological Requirements")
        },
        {
          label: "Trainer Qualifications",
          isCompleted: !!(
            trainerRequirementsData?.trainerRequirements?.trainerRequirements?.length
          ) || completedSteps.includes("Trainer Qualifications")
        }
      ]
    },
    {
      title: "References & Appendices",
      items: [
        {
          label: "References and Further Reading",
          isCompleted: !!referencesData?.references?.length || 
            completedSteps.includes("References and Further Reading")
        },
        {
          label: "Appendices",
          isCompleted: !!appendicesData?.appendices?.length || 
            completedSteps.includes("Appendices")
        }
      ]
    },
    {
      title: "Executive Summary",
      items: [
        {
          label: "Executive Summary",
          isCompleted: !!executiveSummaryData?.executiveSummary || 
            completedSteps.includes("Executive Summary")
        }
      ]
    }
  ], [prerequisiteData, objectiveData, completedSteps, modeDeliveryData, techRequirementsData, trainerRequirementsData, referencesData, appendicesData, executiveSummaryData])

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const findFirstIncompleteSection = () => {
      for (const group of outlineGroups) {
        for (const item of group.items) {
          if (!item.isCompleted) {
            return item.label
          }
        }
      }
      return outlineGroups[0].items[0].label
    }

    setActiveStep(findFirstIncompleteSection() as Step)
  }, [outlineGroups])

  const renderMobileHeader = () => {
    if (!isMobile) return null
    
    if (showSidebar) {
      return (
        <div className="fixed top-0 left-0 right-0 bg-white z-[51] flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-medium">Curriculum Outline</h2>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setShowSidebar(false)}
            className="hover:bg-transparent"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      )
    }

    return (
      <div className="flex items-center gap-2 mb-6">
        <Button 
          variant="ghost"
          className="text-brand flex items-center gap-2 hover:bg-transparent hover:text-brand p-0"
          onClick={() => setShowSidebar(true)}
        >
          <Menu className="h-5 w-5" />
          <span>Curriculum Outline</span>
        </Button>
      </div>
    )
  }

  const handlePrerequisiteSave = async (data: PrerequisiteData) => {
    try {
      if (!prerequisiteData) {
        await onPrerequisiteSave(data)
      }
      setCompletedSteps(prev => [...prev, "Entry Requirements"])
      setActiveStep("Curriculum Objective")
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleObjectiveSave = async (data: ObjectiveFormData) => {
    try {
      if (!objectiveData?.generalObjective) {
        let specificObjectiveId: string | undefined

        // Save general objective
        if (data.generalObjective) {
          await objectiveMutation.mutateAsync({
            data: {
              definition: data.generalObjective,
              trainingId
            },
            isGeneral: true
          })
        }

        // Save specific objective and get its ID
        if (data.specificObjective) {
          const result = await objectiveMutation.mutateAsync({
            data: {
              definition: data.specificObjective,
              trainingId
            },
            isGeneral: false
          })
          specificObjectiveId = result.id
        }

        // Save outcome if we have both specific objective and outcome
        if (specificObjectiveId && data.outcome) {
          await outcomeMutation.mutateAsync({
            definition: data.outcome,
            trainingId,
            objectiveId: specificObjectiveId
          })
        }
      }
      setCompletedSteps(prev => [...prev, "Curriculum Objective"])
      setActiveStep("Mode of Delivery")
    } catch (error) {
      toast.error("Failed to save objectives")
    }
  }

  const handleModeDeliverySave = async (data: any) => {
    try {
      if (!modeDeliveryData?.deliveryTools?.deliveryTools?.length) {
        await addDeliveryTools.mutateAsync(data)
      }
      setCompletedSteps(prev => [...prev, "Mode of Delivery"])
      setActiveStep("Technological Requirements")
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleTechRequirementsSave = async (data: { 
    trainingId: string
    learnerTechnologicalRequirementIds: string[]
    instructorTechnologicalRequirementIds: string[]
  }) => {
    try {
      await addTechRequirements.mutateAsync(data)
      setCompletedSteps(prev => [...prev, "Technological Requirements"])
      setActiveStep("Trainer Qualifications")
      toast.success("Technological requirements saved successfully")
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleTrainerRequirementsSave = async (data: { 
    trainingId: string
    trainerRequirementIds: string[]
  }) => {
    try {
      await addTrainerRequirements.mutateAsync(data)
      setCompletedSteps(prev => [...prev, "Trainer Qualifications"])
      setActiveStep("References and Further Reading")
      toast.success("Trainer qualifications saved successfully")
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  // Add handler for references
  const handleReferenceSave = async (data: { 
    definition: string
    trainingId: string 
  }) => {
    try {
      if (data.definition) {  // Only make API call if there's a definition
        await addReference.mutateAsync(data)
      }
      setCompletedSteps(prev => [...prev, "References and Further Reading"])
      setActiveStep("Appendices")
      toast.success("References saved successfully")
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  // Add handler for appendices
  const handleAppendixSave = async (data: { 
    definition: string
    trainingId: string 
  }) => {
    try {
      if (data.definition) {
        await addAppendix.mutateAsync(data)
      }
      setCompletedSteps(prev => [...prev, "Appendices"])
      setActiveStep("Executive Summary")
      toast.success("Appendices saved successfully")
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  // Add handler for executive summary
  const handleExecutiveSummarySave = async (data: { 
    executiveSummary: string
    trainingId: string 
  }) => {
    try {
      await addExecutiveSummary.mutateAsync(data)
      setCompletedSteps(prev => [...prev, "Executive Summary"])
      onCancel() // This will take us back to the training details page
      toast.success("Executive summary saved successfully")
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const renderStepContent = () => {
    switch (activeStep) {
      case "Entry Requirements":
        const formattedPrerequisiteData = prerequisiteData ? {
          languageId: prerequisiteData.language?.id || "",
          educationLevelId: prerequisiteData.educationLevel?.id || "",
          specificCourseList: prerequisiteData.specificCourseList || [],
          trainingId: prerequisiteData.trainingId,
          certifications: prerequisiteData.certifications || "",
          licenses: prerequisiteData.licenses || "",
          workExperienceId: prerequisiteData.workExperience?.id || "",
          specificPrerequisites: prerequisiteData.specificPrerequisites || []
        } : null

        return (
          <Prerequisites 
            trainingId={trainingId}
            initialData={formattedPrerequisiteData}
            educationLevels={educationLevels}
            languages={languages}
            workExperiences={workExperiences}
            onSave={handlePrerequisiteSave}
            onCancel={onCancel}
          />
        )
      case "Curriculum Objective":
        return (
          <Objective 
            trainingId={trainingId}
            initialData={objectiveData}
            onSave={handleObjectiveSave}
            onCancel={() => setActiveStep("Entry Requirements")}
          />
        )
      case "Mode of Delivery":
        return (
          <ModeDelivery
            trainingId={trainingId}
            initialData={modeDeliveryData || null}
            deliveryTools={deliveryTools}
            onSave={handleModeDeliverySave}
            onCancel={() => setActiveStep("Curriculum Objective")}
          />
        )
      case "Technological Requirements":
        return (
          <TechnologicalRequirements
            trainingId={trainingId}
            initialData={techRequirementsData || null}
            learnerRequirements={learnerRequirements || []}
            instructorRequirements={instructorRequirements || []}
            onSave={handleTechRequirementsSave}
            onCancel={() => setActiveStep("Mode of Delivery")}
          />
        )
      case "Trainer Qualifications":
        return (
          <TrainerQualifications
            trainingId={trainingId}
            initialData={trainerRequirementsData || null}
            trainerRequirements={trainerRequirements || []}
            onSave={handleTrainerRequirementsSave}
            onCancel={() => setActiveStep("Technological Requirements")}
          />
        )
      case "References and Further Reading":
        return (
          <References
            trainingId={trainingId}
            initialData={referencesData || null}
            onSave={handleReferenceSave}
            onCancel={() => setActiveStep("Trainer Qualifications")}
          />
        )
      case "Appendices":
        return (
          <Appendices
            trainingId={trainingId}
            initialData={appendicesData || null}
            onSave={handleAppendixSave}
            onCancel={() => setActiveStep("References and Further Reading")}
          />
        )
      case "Executive Summary":
        return (
          <ExecutiveSummary
            trainingId={trainingId}
            initialData={executiveSummaryData || null}
            onSave={handleExecutiveSummarySave}
            onCancel={() => setActiveStep("Appendices")}
          />
        )
      // Add other step components here
      default:
        return null
    }
  }

  return (
    <div className={cn(
      "px-[7%] py-10",
      isMobile ? "block" : "flex gap-8"
    )}>
      {renderMobileHeader()}
      
      {(!isMobile || showSidebar) && (
        <div className={cn(
          "",
          isMobile ? "fixed bg-white inset-0 z-50 pt-16 px-4 pb-4" : "w-[300px]"
        )}>
          <OutlineSidebar 
            title="Curriculum Outline"
            groups={outlineGroups}
            activeItem={activeStep}
            onItemClick={(step) => {
              setActiveStep(step as Step)
              if (isMobile) setShowSidebar(false)
            }}
          />
        </div>
      )}

      <div className="flex-1">
        {renderStepContent()}
      </div>
    </div>
  )
}
