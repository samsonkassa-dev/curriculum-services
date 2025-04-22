"use client"

import { useState, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { ModuleAddModal } from "../moduleAddModal"
import { LessonAddModal } from "../lessonAddModal"
import { useCreateModule, useModules } from "@/lib/hooks/useModule"
import { useGetLessons } from "@/lib/hooks/useLesson"
import { ModuleHeader } from "./ModuleHeader"
import { ModuleLessons } from "./ModuleLessons"
import { SubModules } from "./SubModules"
import { ModuleViewProps, LessonFormData } from "./types"
import { Module } from "@/types/module"

export function ModuleView({ 
  modules, 
  onAddClick, 
  onEditClick,
  canEdit = false,
  error 
}: ModuleViewProps) {
  const router = useRouter()
  const params = useParams()
  const [showSubModuleModal, setShowSubModuleModal] = useState(false)
  const [showLessonModal, setShowLessonModal] = useState(false)
  const [selectedModule, setSelectedModule] = useState<Module | null>(null)
  const [selectedLesson, setSelectedLesson] = useState<LessonFormData | null>(null)
  const [expandedModules, setExpandedModules] = useState<string[]>([])
  const [expandedSubModules, setExpandedSubModules] = useState<string[]>([])
  const { mutateAsync: createModule, isPending: isCreating } = useCreateModule()

  // Fetch module details when accordion is opened
  const { data: moduleDetails } = useModules(
    expandedModules.length > 0 ? expandedModules[0] : ""
  )

  // Fetch lessons for the expanded module
  const { data: mainModuleLessons } = useGetLessons(
    expandedModules.length > 0 ? expandedModules[0] : ""
  )

  // Fetch lessons for expanded sub-modules
  const expandedSubModuleId = expandedSubModules[0]
  const { data: subModuleLessons } = useGetLessons(expandedSubModuleId || "")

  const handleAccordionChange = (value: string) => {
    setExpandedModules(value ? [value] : [])
    setExpandedSubModules([]) // Reset sub-module expansion when main module changes
  }

  const handleSubModuleExpand = useCallback((subModuleId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setExpandedSubModules(prev => 
      prev.includes(subModuleId) ? prev.filter(id => id !== subModuleId) : [subModuleId]
    )
  }, [])

  const handleAssessmentClick = useCallback((moduleId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    router.push(`/${params.companyId}/training/${params.trainingId}/${moduleId}`)
  }, [router, params.companyId, params.trainingId])

  const handleSubModuleClick = useCallback((module: Module, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedModule(module)
    setShowSubModuleModal(true)
  }, [])

  const handleLessonClick = useCallback((module: Module, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedModule(module)
    setShowLessonModal(true)
  }, [])

  const handleEditLesson = useCallback((lesson: LessonFormData, module: Module, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedLesson(lesson)
    setSelectedModule(module)
    setShowLessonModal(true)
  }, [])

  const handleCreateSubModule = async (data: { name: string; description: string }) => {
    if (!selectedModule) return

    try {
      await createModule({
        ...data,
        trainingId: params.trainingId as string,
        moduleId: selectedModule.id
      })
      setShowSubModuleModal(false)
      setSelectedModule(null)
    } catch (error) {
      console.error("Failed to create sub-module:", error)
    }
  }

  if (error) {
    return <div className="text-red-500">Error loading modules: {error.message}</div>
  }

  return (
    <div className="px-[7%] py-10 mb-10">
      <h1 className="text-md md:text-xl text-black mb-4 font-semibold">
        Modules
      </h1>
      <h2 className="text-md md:text-lg text-gray-500 font-normal mb-4">
        A concise summary of the course modules, outlining their content and
        structure
      </h2>

      <div className="space-y-4">
        <Accordion
          type="single"
          collapsible
          defaultValue=""
          className="space-y-4"
          onValueChange={handleAccordionChange}
          value={expandedModules[0]}
        >
          {modules.map((module) => (
            <AccordionItem
              key={module.id}
              value={module.id}
              className="border-[0.5px] border-[#CED4DA] rounded-md"
            >
              <ModuleHeader
                title={module.name}
                module={module}
                canEdit={canEdit}
                onEditClick={onEditClick}
                onAssessmentClick={handleAssessmentClick}
              />
              <AccordionContent>
                <div className="p-6 space-y-4">
                  <div className="flex flex-wrap gap-4">
                    <div
                      onClick={(e) => handleAssessmentClick(module.id, e)}
                      className="inline-flex font-semibold items-center gap-2 text-brand hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md cursor-pointer"
                    >
                      <Image
                        src="/modulePlus.svg"
                        alt="Add Assessment"
                        width={16}
                        height={20}
                      />
                      <span>Assessment Methods</span>
                    </div>

                    <div
                      onClick={(e) => handleSubModuleClick(module, e)}
                      className="inline-flex font-semibold items-center gap-2 text-brand hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md cursor-pointer"
                    >
                      <Image
                        src="/modulePlus.svg"
                        alt="Add Sub Module"
                        width={16}
                        height={20}
                      />
                      <span>Sub Module</span>
                    </div>

                    <div
                      onClick={(e) => handleLessonClick(module, e)}
                      className="inline-flex font-semibold items-center gap-2 text-brand hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-md cursor-pointer"
                    >
                      <Image
                        src="/modulePlus.svg"
                        alt="Add Lesson"
                        width={16}
                        height={20}
                      />
                      <span>Lesson</span>
                    </div>
                  </div>

                  {/* Main module lessons */}
                  <ModuleLessons
                    moduleId={module.id}
                    lessons={mainModuleLessons}
                    canEdit={canEdit}
                    onEditLesson={handleEditLesson}
                  />

                  {/* Sub-modules section */}
                  <SubModules
                    moduleId={module.id}
                    moduleDetails={moduleDetails}
                    expandedSubModules={expandedSubModules}
                    canEdit={canEdit}
                    onSubModuleClick={handleSubModuleClick}
                    onLessonClick={handleLessonClick}
                    onSubModuleExpand={handleSubModuleExpand}
                    onEditLesson={handleEditLesson}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {canEdit && (
        <Button
          variant="ghost"
          className="w-full border-2 border-dashed rounded-lg py-8 text-blue-500 hover:text-blue-600 bg-[#fbfbfb] hover:bg-blue-50/50 mt-4 justify-start pl-6"
          onClick={onAddClick}
        >
          <Image
            src="/modulePlus.svg"
            alt="Add Module"
            width={16}
            height={20}
          />
          <span className="font-semibold">Module</span>
        </Button>
      )}

      <ModuleAddModal 
        isOpen={showSubModuleModal}
        onClose={() => {
          setShowSubModuleModal(false)
          setSelectedModule(null)
        }}
        onSubmit={handleCreateSubModule}
        isLoading={isCreating}
        mode="submodule"
      />

      {selectedModule && (
        <LessonAddModal 
          isOpen={showLessonModal}
          onClose={() => {
            setShowLessonModal(false)
            setSelectedModule(null)
            setSelectedLesson(null)
          }}
          moduleId={selectedModule.id}
          initialData={selectedLesson as LessonFormData}
          isEdit={!!selectedLesson}
        />
      )}
    </div>
  )
} 