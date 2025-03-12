import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SubModulesProps } from "./types"
import { ModuleLessons } from "./ModuleLessons"
import { LessonFormData } from "./types"
import { Module } from "@/types/module"

export function SubModules({
  moduleId,
  moduleDetails,
  expandedSubModules,
  canEdit,
  onSubModuleClick,
  onLessonClick,
  onSubModuleExpand,
  onEditLesson
}: SubModulesProps & {
  onEditLesson: (lesson: LessonFormData, module: Module, e: React.MouseEvent) => void
}) {
  if (!moduleDetails || moduleDetails.module.id !== moduleId) return null

  return moduleDetails.module.childModules.map((subModule, index) => {
    const isExpanded = expandedSubModules.includes(subModule.id)

    return (
      <div key={subModule.id} className="ml-8 border-l-2 border-gray-200 pl-4 mb-4">
        <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg cursor-pointer hover:bg-gray-100">
          <div className="flex items-center gap-2 flex-1" onClick={(e) => onSubModuleClick(subModule, e)}>
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
                onLessonClick(subModule, e)
              }}
              className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
            >
              Add Lesson
            </Button>
            <div
              role="button"
              className="p-1 hover:bg-gray-100 rounded-md transition-transform"
              onClick={(e) => onSubModuleExpand(subModule.id, e)}
            >
              <ChevronRight className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
            </div>
          </div>
        </div>
        {isExpanded && (
          <div className="mt-2 space-y-2 pl-4">
            <ModuleLessons
              moduleId={subModule.id}
              isSubModule={true}
              canEdit={canEdit}
              onEditLesson={onEditLesson}
            />
          </div>
        )}
      </div>
    )
  })
} 