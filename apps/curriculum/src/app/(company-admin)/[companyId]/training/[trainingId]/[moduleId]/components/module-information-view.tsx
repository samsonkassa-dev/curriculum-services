"use client"

import React from "react"
import { ChevronRight, ChevronDown } from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { useState } from "react"
import { useBaseData } from "@/lib/hooks/useBaseData"
import { useModuleInformation } from "@/contexts/ModuleInformationContext"
import { useReferences } from "@/lib/hooks/useReferences"
import { useAppendices } from "@/lib/hooks/useAppendices"
import { useUserRole } from "@/lib/hooks/useUserRole"

interface ModuleInformationViewProps {
  moduleId: string
  onEdit: () => void
}

function ModuleInformationViewContent({ moduleId, onEdit }: ModuleInformationViewProps) {
  const { canEdit } = useUserRole()
  
  const { formData, hasModuleInformation } = useModuleInformation()
  const { data: instructionalMethods } = useBaseData('instructional-method')
  const { data: technologyIntegrations } = useBaseData('technology-integration')
  const { data: referencesData } = useReferences(moduleId)
  const { data: appendicesData } = useAppendices(moduleId)
  
  const [methods, setMethods] = React.useState(new Map())
  const [technologies, setTechnologies] = React.useState(new Map())
  
  const hasReferences = referencesData?.references && referencesData.references.length > 0
  const hasAppendices = appendicesData?.appendices && appendicesData.appendices.length > 0

  // If no module information is available, show appropriate UI
  if (!hasModuleInformation) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <p className="text-gray-500">No module information available yet.</p>
      </div>
    )
  }

  // Helper function to find method names by IDs
  const getMethodNames = (methodIds: string[] = []) => {
    if (!instructionalMethods || methodIds.length === 0) return 'None selected'
    
    return methodIds.map(id => {
      const method = instructionalMethods.find((m: { id: string; name: string }) => m.id === id)
      return method ? method.name : id
    }).join(', ')
  }

  // Helper function to find technology integration name by ID
  const getTechnologyName = (techId: string) => {
    if (!techId || !technologyIntegrations) return 'None selected'
    
    const tech = technologyIntegrations.find((t: { id: string; name: string }) => t.id === techId)
    return tech ? tech.name : techId
  }

  // Format duration with type
  const formatDuration = (duration?: number, durationType?: string) => {
    if (!duration || !durationType) return 'Not specified'
    return `${duration} ${durationType.toLowerCase()}`
  }

  // Render function for lists or strings
  const renderContent = (content: string[] | string | null | undefined) => {
    if (!content) return 'No data available'
    
    if (Array.isArray(content)) {
      if (content.length === 0) return 'No data available'
      
      return (
        <ul className="list-disc pl-5">
          {content.map((item, index) => (
            <li key={index} className="mb-1">{item}</li>
          ))}
        </ul>
      )
    }
    
    return content
  }

  return (
    <div className="px-[7%] py-10 mb-10">
      <h1 className="text-md md:text-xl text-black mb-4 font-semibold">Module Information</h1>

      <h2 className="text-md md:text-lg text-gray-500 font-normal mb-4">
        Detailed information about the module&apos;s content, teaching methods, and resources.
      </h2>

      <div className="space-y-4">
        <Accordion type="multiple" defaultValue={['keyConcepts']} className="space-y-4">
          {/* Key Concepts Section */}
          <AccordionItem value="keyConcepts" className="border-[0.5px] border-[#CED4DA] rounded-md">
            <AccordionTrigger className="bg-white data-[state=open]:bg-[#f7fbff] rounded-lg p-6 flex items-center justify-between hover:no-underline group">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-md md:text-xl">Key Concepts</span>
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
                  {formData.keyConcepts || 'No key concepts available'}
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Learning Resources Section */}
          <AccordionItem value="learningResources" className="border-[0.5px] border-[#CED4DA] rounded-md">
            <AccordionTrigger className="bg-white data-[state=open]:bg-[#f7fbff] rounded-lg p-6 flex items-center justify-between hover:no-underline group">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-md md:text-xl">Learning Resources</span>
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
                <div className="space-y-4">
                  <div>
                    <h3 className="text-gray-700 font-medium mb-2">Primary Materials</h3>
                    {renderContent(formData.primaryMaterials)}
                  </div>
                  <div>
                    <h3 className="text-gray-700 font-medium mb-2">Secondary Materials</h3>
                    {renderContent(formData.secondaryMaterials)}
                  </div>
                  <div>
                    <h3 className="text-gray-700 font-medium mb-2">Digital Tools</h3>
                    {renderContent(formData.digitalTools)}
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Instructional Methods Section */}
          <AccordionItem value="instructionalMethods" className="border-[0.5px] border-[#CED4DA] rounded-md">
            <AccordionTrigger className="bg-white data-[state=open]:bg-[#f7fbff] rounded-lg p-6 flex items-center justify-between hover:no-underline group">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-md md:text-xl">Instructional Methods</span>
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
                <div className="space-y-4">
                  <div>
                    <h3 className="text-gray-700 font-medium mb-2">Methods</h3>
                    <p className="text-gray-600 text-sm md:text-lg">
                      {getMethodNames(formData.instructionMethodIds || [])}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-gray-700 font-medium mb-2">Technology Integration</h3>
                    <p className="text-gray-600 text-sm md:text-lg">
                      {getTechnologyName(formData.technologyIntegrationId || '')}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-gray-700 font-medium mb-2">Differentiation Strategies</h3>
                    <p className="text-gray-600 text-sm md:text-lg">
                      {formData.differentiationStrategies || 'No differentiation strategies available'}
                    </p>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Teaching Strategies Section */}
          <AccordionItem value="teachingStrategies" className="border-[0.5px] border-[#CED4DA] rounded-md">
            <AccordionTrigger className="bg-white data-[state=open]:bg-[#f7fbff] rounded-lg p-6 flex items-center justify-between hover:no-underline group">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-md md:text-xl">Teaching Strategies</span>
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
                  {formData.teachingStrategy || 'No teaching strategies available'}
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Inclusion Strategies Section */}
          <AccordionItem value="inclusionStrategies" className="border-[0.5px] border-[#CED4DA] rounded-md">
            <AccordionTrigger className="bg-white data-[state=open]:bg-[#f7fbff] rounded-lg p-6 flex items-center justify-between hover:no-underline group">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-md md:text-xl">Inclusion Strategies</span>
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
                  {formData.inclusionStrategy || 'No inclusion strategies available'}
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Estimated Duration Section */}
          <AccordionItem value="estimatedDuration" className="border-[0.5px] border-[#CED4DA] rounded-md">
            <AccordionTrigger className="bg-white data-[state=open]:bg-[#f7fbff] rounded-lg p-6 flex items-center justify-between hover:no-underline group">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-md md:text-xl">Estimated Duration</span>
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
                  {formatDuration(formData.duration, formData.durationType)}
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* References Section - Only show if references exist */}
          {hasReferences && (
            <AccordionItem value="references" className="border-[0.5px] border-[#CED4DA] rounded-md">
              <AccordionTrigger className="bg-white data-[state=open]:bg-[#f7fbff] rounded-lg p-6 flex items-center justify-between hover:no-underline group">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-md md:text-xl">References</span>
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
                    References are added in the module information editor.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Appendices Section - Only show if appendices exist */}
          {hasAppendices && (
            <AccordionItem value="appendices" className="border-[0.5px] border-[#CED4DA] rounded-md">
              <AccordionTrigger className="bg-white data-[state=open]:bg-[#f7fbff] rounded-lg p-6 flex items-center justify-between hover:no-underline group">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-md md:text-xl">Appendices</span>
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
                    Appendices are added in the module information editor.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </div>
    </div>
  )
}

export function ModuleInformationView(props: ModuleInformationViewProps) {
  return <ModuleInformationViewContent {...props} />
} 