"use client"

import { useState, useEffect } from "react"
import { OutlineSidebar } from "@/components/ui/outline-sidebar"
import { cn } from "@/lib/utils"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AssessmentFormProvider, useAssessmentForm } from "@/contexts/AssessmentFormContext"
import { GenericFormative } from "./assesmentForm/genericFormative"
import { useBaseData } from "@/lib/hooks/useBaseData"
import { Loading } from "@/components/ui/loading"
import { TechnologyFormative } from "./assesmentForm/technologyFormative"
import { AlternativeFormative } from "./assesmentForm/alternativeFormative"
import { SubjectFormative } from "./assesmentForm/subjectFormative"

interface AssessmentMethodProps {
  sectionId: string
}

export function AssessmentMethod({ sectionId }: AssessmentMethodProps) {
  return (
    <AssessmentFormProvider sectionId={sectionId}>
      <AssessmentMethodContent sectionId={sectionId} />
    </AssessmentFormProvider>
  )
}

function AssessmentMethodContent({ sectionId }: { sectionId: string }) {
  const [activeSection, setActiveSection] = useState("Generic Formative Assessments")
  const [isMobile, setIsMobile] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)
  const { formData, submitForm } = useAssessmentForm()

  // Fetch assessment methods for each type
  const { data: genericMethods, isLoading: isLoadingGeneric } = useBaseData('assessment-type', {
    subType: 'GENERAL_FORMATIVE'
  })
  const { data: technologyMethods, isLoading: isLoadingTech } = useBaseData('assessment-type', {
    subType: 'TECHNOLOGY_SPECIFIC_FORMATIVE'
  })
  const { data: alternativeMethods, isLoading: isLoadingAlternative } = useBaseData('assessment-type', {
    subType: 'ALTERNATIVE_FORMATIVE'
  })

  const sections = [
    "Generic Formative Assessments",
    "Technology-Enhanced Formative Assessment",
    "Subject-Specific Formative Assessment",
    "Alternative Formative Assessments"
  ]

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const isStepCompleted = (step: string) => {
    switch (step) {
      case "Generic Formative Assessments":
        return Object.values(formData.genericFormative || {}).some(value => value === true)
      case "Technology-Enhanced Formative Assessment":
        return Object.values(formData.technologyFormative || {}).some(value => value === true)
      case "Subject-Specific Formative Assessment":
        return Boolean(formData.subjectSpecificMethod?.trim())
      case "Alternative Formative Assessments":
        return Object.values(formData.alternativeFormative || {}).some(value => value === true)
      default:
        return false
    }
  }

  const renderMobileHeader = () => {
    if (!isMobile) return null
    
    if (showSidebar) {
      return (
        <div className="fixed top-0 left-0 right-0 bg-white z-[51] flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-medium">Assessment Method</h2>
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
          <span>Assessment Method</span>
        </Button>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeSection) {
      case "Generic Formative Assessments":
        return <GenericFormative assessmentMethods={genericMethods || []} />
      case "Technology-Enhanced Formative Assessment":
        return <TechnologyFormative assessmentMethods={technologyMethods || []} />
      case "Subject-Specific Formative Assessment":
        return <SubjectFormative />
      case "Alternative Formative Assessments":
        return <AlternativeFormative assessmentMethods={alternativeMethods || []} />
      default:
        return null
    }
  }

  const outlineGroups = [
    {
      title: "",
      items: sections.map(section => ({
        label: section,
        isCompleted: isStepCompleted(section)
      }))
    }
  ]

  const isLastStep = activeSection === sections[sections.length - 1]

  const handleNext = async () => {
    const currentIndex = sections.indexOf(activeSection)
    if (isLastStep) {
      await submitForm()
    } else {
      setActiveSection(sections[currentIndex + 1])
    }
  }

  if (isLoadingGeneric || isLoadingTech || isLoadingAlternative) {
    return <Loading />
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
            title="Assessment Method"
            groups={outlineGroups}
            activeItem={activeSection}
            onItemClick={(section) => {
              setActiveSection(section)
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
        <div className="flex justify-center gap-6 md:gap-10 mt-8">
          {activeSection !== sections[0] && (
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
            {isLastStep ? 'Save Changes' : 'Continue'}
          </Button>
        </div>
      </div>
    </div>
  )
}    