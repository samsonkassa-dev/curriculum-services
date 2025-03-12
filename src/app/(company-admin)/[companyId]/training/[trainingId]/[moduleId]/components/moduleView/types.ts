import { Module } from "@/types/module"
import { Lesson as APILesson } from "@/lib/hooks/useLesson"

export interface LessonFormData {
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

export interface ModuleViewProps {
  modules: Module[]
  onAddClick: () => void
  onEditClick: (module: Module) => void
  canEdit?: boolean
  isLoading?: boolean
  error?: Error
}

export interface ModuleHeaderProps {
  title: string
  index: number
  module: Module
  canEdit: boolean
  onEditClick: (module: Module) => void
  onAssessmentClick: (moduleId: string, e: React.MouseEvent) => void
}

export interface ModuleLessonsProps {
  moduleId: string
  isSubModule?: boolean
  lessons?: APILesson[]
  canEdit: boolean
  onEditLesson: (lesson: LessonFormData, module: Module, e: React.MouseEvent) => void
}

export interface SubModulesProps {
  moduleId: string
  moduleDetails?: { module: Module & { childModules: Module[] } }
  expandedSubModules: string[]
  canEdit: boolean
  onSubModuleClick: (module: Module, e: React.MouseEvent) => void
  onLessonClick: (module: Module, e: React.MouseEvent) => void
  onSubModuleExpand: (subModuleId: string, e: React.MouseEvent) => void
} 