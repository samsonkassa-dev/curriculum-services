"use client"

import { ChevronRight, ChevronDown } from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

import { useBaseData } from "@/lib/hooks/useBaseData"
import { Loading } from "@/components/ui/loading"
import { AssessmentFormProvider, useAssessmentForm } from "@/contexts/AssessmentFormContext"
import { useUserRole } from "@/lib/hooks/useUserRole"

interface AssessmentMethodViewProps {
  moduleId: string
  onEdit: () => void
}

interface AssessmentMethod {
  id: string
  name: string
  description: string
}

function AssessmentMethodViewContent({ onEdit }: AssessmentMethodViewProps) {
  const { canEdit } = useUserRole()
  
  const { formData, hasAssessmentMethods } = useAssessmentForm()
  
  // Fetch assessment method types for each category
  const { data: genericMethods, isLoading: isLoadingGeneric } = useBaseData('assessment-type', { subType: 'GENERAL_FORMATIVE' })
  const { data: technologyMethods, isLoading: isLoadingTech } = useBaseData('assessment-type', { subType: 'TECHNOLOGY_SPECIFIC_FORMATIVE' })
  const { data: alternativeMethods, isLoading: isLoadingAlternative } = useBaseData('assessment-type', { subType: 'ALTERNATIVE_FORMATIVE' })

  if (isLoadingGeneric || isLoadingTech || isLoadingAlternative) {
    return <Loading />
  }

  // Helper function to get assessment method names from IDs
  const getMethodNames = (methodType: keyof typeof formData, methods: AssessmentMethod[] | undefined) => {
    if (!methods) return []
    
    if (methodType === 'subjectSpecificMethod') {
      return []
    }
    
    const selectedMethods = Object.entries(formData[methodType] || {})
      .filter(([_, selected]) => selected === true)
      .map(([id]) => id)
    
    return methods
      .filter(method => selectedMethods.includes(method.id))
      .map(method => method.name)
  }

  // Get selected generic formative assessment methods
  const selectedGenericMethods = getMethodNames('genericFormative', genericMethods)
  
  // Get selected technology formative assessment methods
  const selectedTechnologyMethods = getMethodNames('technologyFormative', technologyMethods)
  
  // Get selected alternative formative assessment methods
  const selectedAlternativeMethods = getMethodNames('alternativeFormative', alternativeMethods)

  // Check if any methods are selected for a section
  const hasGenericMethods = selectedGenericMethods.length > 0
  const hasTechMethods = selectedTechnologyMethods.length > 0
  const hasAlternativeMethods = selectedAlternativeMethods.length > 0
  const hasSubjectSpecific = formData.subjectSpecificMethod && formData.subjectSpecificMethod.trim() !== ''
  
  // Check if any assessment methods exist
  const hasAnyMethod = hasGenericMethods || hasTechMethods || hasAlternativeMethods || hasSubjectSpecific || hasAssessmentMethods
  
  // If no methods are available and user can't edit, show message
  if (!hasAnyMethod && !canEdit) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <p className="text-gray-500">No assessment methods available yet.</p>
      </div>
    )
  }

  // Render list of assessment methods
  const renderMethodList = (methods: string[]) => {
    if (methods.length === 0) return <p className="text-gray-500 italic">None selected</p>
    
    return (
      <ul className="list-disc pl-5">
        {methods.map((method, index) => (
          <li key={index} className="mb-1 text-gray-600 text-sm md:text-lg">{method}</li>
        ))}
      </ul>
    )
  }

  return (
    <div className="px-[7%] py-10 mb-10">
      <h1 className="text-md md:text-xl text-black mb-4 font-semibold">Assessment Methods</h1>

      <h2 className="text-md md:text-lg text-gray-500 font-normal mb-4">
        Methods used to evaluate learning progress and outcomes.
      </h2>

      <div className="space-y-4">
        <Accordion type="multiple" defaultValue={['genericFormative']} className="space-y-4">
          {/* Generic Formative Assessments Section */}
          <AccordionItem value="genericFormative" className="border-[0.5px] border-[#CED4DA] rounded-md">
            <AccordionTrigger className="bg-white data-[state=open]:bg-[#f7fbff] rounded-lg p-6 flex items-center justify-between hover:no-underline group">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-md md:text-xl">Generic Formative Assessments</span>
              </div>
              <div className="text-gray-400 flex gap-2">
                {canEdit && (
                  <img 
                    src="/edit.svg" 
                    alt="" 
                    className="w-5 h-5 cursor-pointer" 
                    onClick={(e) => {
                      e.stopPropagation()
                      onEdit()
                    }}
                  />
                )}
                <ChevronRight className="h-5 w-5 transition-transform group-data-[state=open]:hidden text-black" />
                <ChevronDown className="h-5 w-5 transition-transform hidden group-data-[state=open]:block text-black" />
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="bg-white p-6">
                {renderMethodList(selectedGenericMethods)}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Technology-Enhanced Formative Assessment Section */}
          <AccordionItem value="technologyFormative" className="border-[0.5px] border-[#CED4DA] rounded-md">
            <AccordionTrigger className="bg-white data-[state=open]:bg-[#f7fbff] rounded-lg p-6 flex items-center justify-between hover:no-underline group">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-md md:text-xl">Technology-Enhanced Formative Assessment</span>
              </div>
              <div className="text-gray-400 flex gap-2">
                {canEdit && (
                  <img 
                    src="/edit.svg" 
                    alt="" 
                    className="w-5 h-5 cursor-pointer" 
                    onClick={(e) => {
                      e.stopPropagation()
                      onEdit()
                    }}
                  />
                )}
                <ChevronRight className="h-5 w-5 transition-transform group-data-[state=open]:hidden text-black" />
                <ChevronDown className="h-5 w-5 transition-transform hidden group-data-[state=open]:block text-black" />
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="bg-white p-6">
                {renderMethodList(selectedTechnologyMethods)}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Subject-Specific Formative Assessment Section */}
          <AccordionItem value="subjectSpecific" className="border-[0.5px] border-[#CED4DA] rounded-md">
            <AccordionTrigger className="bg-white data-[state=open]:bg-[#f7fbff] rounded-lg p-6 flex items-center justify-between hover:no-underline group">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-md md:text-xl">Subject-Specific Formative Assessment</span>
              </div>
              <div className="text-gray-400 flex gap-2">
                {canEdit && (
                  <img 
                    src="/edit.svg" 
                    alt="" 
                    className="w-5 h-5 cursor-pointer" 
                    onClick={(e) => {
                      e.stopPropagation()
                      onEdit()
                    }}
                  />
                )}
                <ChevronRight className="h-5 w-5 transition-transform group-data-[state=open]:hidden text-black" />
                <ChevronDown className="h-5 w-5 transition-transform hidden group-data-[state=open]:block text-black" />
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="bg-white p-6">
                <p className="text-gray-600 text-sm md:text-lg">
                  {formData.subjectSpecificMethod || 'No subject-specific assessment method available'}
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Alternative Formative Assessments Section */}
          <AccordionItem value="alternativeFormative" className="border-[0.5px] border-[#CED4DA] rounded-md">
            <AccordionTrigger className="bg-white data-[state=open]:bg-[#f7fbff] rounded-lg p-6 flex items-center justify-between hover:no-underline group">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-md md:text-xl">Alternative Formative Assessments</span>
              </div>
              <div className="text-gray-400 flex gap-2">
                {canEdit && (
                  <img 
                    src="/edit.svg" 
                    alt="" 
                    className="w-5 h-5 cursor-pointer" 
                    onClick={(e) => {
                      e.stopPropagation()
                      onEdit()
                    }}
                  />
                )}
                <ChevronRight className="h-5 w-5 transition-transform group-data-[state=open]:hidden text-black" />
                <ChevronDown className="h-5 w-5 transition-transform hidden group-data-[state=open]:block text-black" />
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="bg-white p-6">
                {renderMethodList(selectedAlternativeMethods)}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  )
}

export function AssessmentMethodView({ moduleId, onEdit }: AssessmentMethodViewProps) {
  return (
    <AssessmentFormProvider moduleId={moduleId}>
      <AssessmentMethodViewContent moduleId={moduleId} onEdit={onEdit} />
    </AssessmentFormProvider>
  )
} 