"use client"

import { useState, useEffect, useRef } from "react"
import { OutlineSidebar } from "@/components/ui/outline-sidebar"
import { KeyConcepts } from "./moduleInformation/key-concepts"
import { LearningResource } from "./moduleInformation/learning-resource"
import { cn } from "@/lib/utils"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModuleInformationProvider, useModuleInformation } from "@/contexts/ModuleInformationContext"
import { useBaseData } from "@/lib/hooks/useBaseData"
import { Title } from "./moduleInformation/title"
import { TeachingStrategies } from "./moduleInformation/teaching-strategies"
import { InclusionStrategies } from "./moduleInformation/inclusion-strategies"
import { EstimatedDurations } from "./moduleInformation/estimated-durations"
import { ModuleReferences, ModuleReferencesHandle } from "./moduleInformation/references"
import { ModuleAppendices, ModuleAppendicesHandle } from "./moduleInformation/appendices"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { useParams } from "next/navigation"
import { toast } from "sonner"

interface ModuleInformationProps {
  moduleId: string
}

// Custom hook to check if a module has references
function useHasModuleReferences(moduleId: string) {
  return useQuery({
    queryKey: ['moduleReferencesCheck', moduleId],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token')
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/module/reference/${moduleId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return data?.references?.length > 0 || false
    },
    enabled: !!moduleId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false
  })
}

// Custom hook to check if a module has appendices
function useHasModuleAppendices(moduleId: string) {
  return useQuery({
    queryKey: ['moduleAppendicesCheck', moduleId],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token')
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/module/appendix/${moduleId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      return data?.appendices?.length > 0 || false
    },
    enabled: !!moduleId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false
  })
}

export function ModuleInformation({ moduleId }: ModuleInformationProps) {
  const [activeSection, setActiveSection] = useState("Key Concepts")
  const sections = [
    "Key Concepts",
    "Learning Resource",
    "Title",
    "Inclusion Strategies",
    "Teaching Strategies",
    "Estimated Duration",
    "References",
    "Appendices"
  ]

  return (
    <ModuleInformationProvider moduleId={moduleId}>
      <ModuleInformationContent 
        activeSection={activeSection} 
        setActiveSection={setActiveSection}
        sections={sections}
      />
    </ModuleInformationProvider>
  )
}

function ModuleInformationContent({ 
  activeSection, 
  setActiveSection,
  sections 
}: { 
  activeSection: string
  setActiveSection: (section: string) => void
  sections: string[]
}) {
  const { formData, submitForm } = useModuleInformation()
  const { data: instructionalMethods, isLoading: instructionalMethodsLoading } = useBaseData('instructional-method')
  const { data: technologyIntegrations, isLoading: technologyIntegrationsLoading } = useBaseData('technology-integration')
  const params = useParams()
  const currentModuleId = params.moduleId as string
  const { data: hasReferences = false } = useHasModuleReferences(currentModuleId)
  const { data: hasAppendices = false } = useHasModuleAppendices(currentModuleId)
  const [isMobile, setIsMobile] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])

  // References for the component instances
  const referencesRef = useRef<ModuleReferencesHandle>(null);
  const appendicesRef = useRef<ModuleAppendicesHandle>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const renderMobileHeader = () => {
    if (!isMobile) return null
    
    if (showSidebar) {
      return (
        <div className="fixed top-0 left-0 right-0 bg-white z-[51] flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-medium">Module Information Outline</h2>
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
          <span>Module Information Outline</span>
        </Button>
      </div>
    )
  }

  const isStepCompleted = (step: string) => {
    switch (step) {
      case "Key Concepts":
        return Boolean(formData.keyConcepts?.trim())
      case "Learning Resource":
        return formData.primaryMaterials?.some(m => m.trim() !== '')
      case "Title":
        return Boolean(formData.instructionMethodIds?.length > 0) || 
               Boolean(formData.differentiationStrategies?.trim()) || 
               Boolean(formData.technologyIntegrationId)
      case "Teaching Strategies":
        return Boolean(formData.teachingStrategy?.trim())
      case "Inclusion Strategies":
        return Boolean(formData.inclusionStrategy?.trim())
      case "Estimated Duration":
        return Boolean(
          formData.duration > 0 && 
          formData.durationType !== undefined
        )
      case "References":
        return hasReferences
      case "Appendices":
        return hasAppendices
      default:
        return false
    }
  }

  // console.log(formData)

  const outlineGroups = [
    {
      title: "Introduction",
      items: [
        { 
          label: "Key Concepts", 
          isCompleted: isStepCompleted("Key Concepts") 
        },
        { 
          label: "Learning Resource", 
          isCompleted: isStepCompleted("Learning Resource") 
        },
      ]
    },
    {
      title: "Teaching Strategies and Methods",
      items: [
        { label: "Title", isCompleted: isStepCompleted("Title") },
        { label: "Inclusion Strategies", isCompleted: isStepCompleted("Inclusion Strategies") },
        { label: "Teaching Strategies", isCompleted: isStepCompleted("Teaching Strategies") },
      ]
    },
    {
      title: "Time Frame and Pacing Guide",
      items: [
          { label: "Estimated Duration", isCompleted: isStepCompleted("Estimated Duration") },
      ]
    },
    {
      title: "Additional Materials",
      items: [
          { label: "References", isCompleted: isStepCompleted("References") },
          { label: "Appendices", isCompleted: isStepCompleted("Appendices") },
      ]
    }
  ]

  const renderContent = () => {
    switch (activeSection) {
      case "Key Concepts":
        return <KeyConcepts />
      case "Learning Resource":
        return <LearningResource />
      case "Title":
        return <Title 
          instructionalMethods={instructionalMethods || []}
          technologyIntegrations={technologyIntegrations || []}
        />
      case "Teaching Strategies":
        return <TeachingStrategies />
      case "Inclusion Strategies":
        return <InclusionStrategies />
      case "Estimated Duration":
        return <EstimatedDurations />
      case "References":
        return <ModuleReferences ref={referencesRef} />
      case "Appendices":
        return <ModuleAppendices ref={appendicesRef} />
      default:
        return null
    }
  }

  const isLastStep = activeSection === sections[sections.length - 1]

  const handleNext = async () => {
    const currentIndex = sections.indexOf(activeSection)
    const nextIndex = currentIndex + 1
    const nextSection = sections[nextIndex]
    
    try {
      // Case 1: Last step (Appendices)
      if (isLastStep) {
        if (activeSection === "Appendices" && appendicesRef.current) {
          await appendicesRef.current.handleSave();
          toast.success('Module information completed successfully')
        }
      } 
      // Case 2: Going from Estimated Duration to References - save all module information
      else if (activeSection === "Estimated Duration" && nextSection === "References") {
        await submitForm() // Submit all module information at this point
        setCompletedSteps(prev => [...prev, activeSection])
        setActiveSection(nextSection)
      }
      // Case 3: References section - save references and move to Appendices
      else if (activeSection === "References" && referencesRef.current) {
        await referencesRef.current.handleSave();
        setCompletedSteps(prev => [...prev, activeSection])
        setActiveSection(nextSection)
      }
      // Case 4: Normal navigation within main module information
      else if (sections.indexOf(activeSection) < sections.indexOf("References")) {
        // For normal navigation between main module information sections,
        // just move to the next section without saving
        setCompletedSteps(prev => [...prev, activeSection])
        setActiveSection(nextSection)
      }
      // Case 5: Appendices - should never happen as it's handled in Case 1
      else if (activeSection === "Appendices" && appendicesRef.current) {
        await appendicesRef.current.handleSave();
        setCompletedSteps(prev => [...prev, activeSection])
        setActiveSection(nextSection)
      }
    } catch (error) {
      console.error("Error saving form:", error);
      // Error handling is done inside each handler
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
          isMobile 
            ? "fixed bg-white inset-0 z-50 pt-16 px-4 pb-4 overflow-y-auto" 
            : "w-[300px] shrink-0"
        )}>
          <OutlineSidebar
            title="Module Outline"
            groups={outlineGroups}
            activeItem={activeSection}
            onItemClick={(step) => {
              setActiveSection(step)
              if (isMobile) setShowSidebar(false)
            }}
          />
        </div>
      )}

      <div className={cn(
        "flex-1 max-w-3xl",
        isMobile && showSidebar ? "hidden" : "block"
      )}>
        {renderContent()}
        <div className="flex justify-center gap-6 md:gap-10 py-10">
          {activeSection !== "Key Concepts" && (
            <Button 
              variant="outline" 
              onClick={() => {
                const currentIndex = sections.indexOf(activeSection)
                setActiveSection(sections[currentIndex - 1])
              }}
              className="text-sm md:text-base"
            >
              Back
            </Button>
          )}
          <Button 
            onClick={handleNext}
            className="bg-brand text-white text-sm md:text-base"
          >
            {isLastStep ? 'Save All Changes' : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  )
} 