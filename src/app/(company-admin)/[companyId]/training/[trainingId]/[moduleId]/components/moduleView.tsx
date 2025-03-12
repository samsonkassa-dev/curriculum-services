"use client"

import { useState, useCallback } from "react"
import { ChevronRight, ChevronDown, MoreVertical, Ban } from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Module } from "@/types/module"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import { ModuleAddModal } from "./moduleAddModal"
import { LessonAddModal } from "./section/lessonAddModal"
import { useCreateModule, useModules } from "@/lib/hooks/useModule"
import { useGetLessons, useUpdateLesson, Lesson as APILesson, InstructionalMethod, TechnologyIntegration } from "@/lib/hooks/useLesson"

// Type for the form data
interface LessonFormData {
  id?: string
  name: string
  description: string
  objective: string
  duration: number
  durationType: "HOURS" | "DAYS" | "WEEKS" | "MONTHS"
  moduleId: string
  instructionalMethodIds: string[]
  technologyIntegrationIds: string[]
}

interface ModuleViewProps {
  modules: Module[]
  onAddClick: () => void
  onEditClick: (module: Module) => void
  canEdit?: boolean
  isLoading?: boolean
  error?: Error
}

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
  const { mutateAsync: updateLesson } = useUpdateLesson()

  // Fetch module details when accordion is opened
  const { data: moduleDetails } = useModules(
    expandedModules.length > 0 ? expandedModules[0] : ""
  )

  // Fetch lessons for the expanded module
  const { data: mainModuleLessons } = useGetLessons(
    expandedModules.length > 0 ? expandedModules[0] : ""
  )

  // Fetch lessons for expanded sub-modules - now using an object to store multiple sub-module lessons
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

  const renderHeader = useCallback((title: string, index: number, module: Module) => (
    <div className="bg-white data-[state=open]:bg-[#f7fbff] rounded-lg m-6 flex items-center justify-between hover:no-underline group">
      <div 
        className="flex items-center gap-3 flex-1 cursor-pointer" 
        onClick={(e) => handleAssessmentClick(module.id, e)}
      >
        <span className="font-semibold text-md md:text-xl">
          Module {index + 1} - {title}
        </span>
      </div>
      <div className="text-gray-400 flex items-center gap-2">
        {canEdit && (
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <div 
                role="button"
                tabIndex={0}
                className="hover:bg-gray-100 h-8 w-8 p-0 rounded-md flex items-center justify-center cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4 " />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEditClick(module)}>
                Edit
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <AccordionTrigger className="p-1 hover:bg-gray-100 rounded-md data-[state=open]:rotate-180 transition-transform">
          <ChevronDown className="h-5 w-5 text-black" />
        </AccordionTrigger>
      </div>
    </div>
  ), [onEditClick, handleAssessmentClick, canEdit])

  const renderLessons = useCallback((moduleId: string, isSubModule: boolean = false) => {
    // Log for debugging
    console.log('Rendering lessons for moduleId:', moduleId, 'isSubModule:', isSubModule)
    console.log('Main module lessons:', mainModuleLessons)
    console.log('Sub module lessons:', subModuleLessons)

    const moduleLessons = isSubModule ? subModuleLessons : mainModuleLessons
    
    if (!moduleLessons || moduleLessons.length === 0) {
      return (
        <div className="flex items-center gap-2 p-4 bg-gray-50/50 rounded-md text-gray-500">
          <Ban className="h-4 w-4" />
          <span>No lessons added yet</span>
        </div>
      )
    }

    return moduleLessons.map((lesson: APILesson) => {
      // Transform API lesson to form data format
      const transformedLesson: LessonFormData = {
        id: lesson.id,
        name: lesson.name,
        description: lesson.description,
        objective: lesson.objective,
        duration: lesson.duration,
        durationType: lesson.durationType,
        moduleId: lesson.moduleId,
        instructionalMethodIds: lesson.instructionalMethods.map((method: InstructionalMethod) => method.id),
        technologyIntegrationIds: lesson.technologyIntegrations.map((tech: TechnologyIntegration) => tech.id)
      }

      return (
        <div
          key={lesson.id}
          className="flex items-center justify-between p-4 bg-gray-50 rounded-md cursor-pointer hover:bg-gray-100"
          onClick={(e) => handleEditLesson(transformedLesson, { id: moduleId } as Module, e)}
        >
          <div className="flex flex-col">
            <span className="font-medium">{lesson.name}</span>
            <span className="text-sm text-gray-500">{lesson.objective}</span>
          </div>
          {canEdit && (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <div
                  role="button"
                  tabIndex={0}
                  className="hover:bg-gray-100 h-8 w-8 p-0 rounded-md flex items-center justify-center cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => handleEditLesson(transformedLesson, { id: moduleId } as Module, e)}>
                  Edit
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      )
    })
  }, [mainModuleLessons, subModuleLessons, canEdit, handleEditLesson])

  const renderSubModules = useCallback((moduleId: string) => {
    if (!moduleDetails || moduleDetails.module.id !== moduleId) return null

    return moduleDetails.module.childModules.map((subModule, index) => {
      const isExpanded = expandedSubModules.includes(subModule.id)

      return (
        <div key={subModule.id} className="ml-8 border-l-2 border-gray-200 pl-4 mb-4">
          <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg cursor-pointer hover:bg-gray-100">
            <div className="flex items-center gap-2 flex-1" onClick={(e) => handleSubModuleClick(subModule, e)}>
              <span className="font-medium">
                Sub-module {index + 1} - {subModule.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  handleLessonClick(subModule, e)
                }}
                className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
              >
                Add Lesson
              </Button>
              <div
                role="button"
                className="p-1 hover:bg-gray-100 rounded-md transition-transform"
                onClick={(e) => handleSubModuleExpand(subModule.id, e)}
              >
                <ChevronRight className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
              </div>
            </div>
          </div>
          {isExpanded && (
            <div className="mt-2 space-y-2 pl-4">
              {renderLessons(subModule.id, true)}
            </div>
          )}
        </div>
      )
    })
  }, [moduleDetails, expandedSubModules, handleSubModuleClick, handleLessonClick, handleSubModuleExpand, renderLessons])

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
          {modules.map((module, index) => (
            <AccordionItem
              key={module.id}
              value={module.id}
              className="border-[0.5px] border-[#CED4DA] rounded-md"
            >
              {renderHeader(module.name, index, module)}
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
                  <div className="space-y-2">
                    {renderLessons(module.id)}
                  </div>

                  {/* Sub-modules section */}
                  {renderSubModules(module.id)}
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