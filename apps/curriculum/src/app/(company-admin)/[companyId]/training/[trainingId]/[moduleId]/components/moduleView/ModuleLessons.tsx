import { Ban, MoreVertical } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Module } from "@/types/module"
import { ModuleLessonsProps, LessonFormData } from "./types"
import { InstructionalMethod, TechnologyIntegration } from "@/lib/hooks/useLesson"

export function ModuleLessons({
  moduleId,
  isSubModule = false,
  lessons = [],
  canEdit,
  onEditLesson
}: ModuleLessonsProps) {
  if (lessons.length === 0) {
    return (
      <div className="flex items-center gap-2 p-4 bg-gray-50/50 rounded-md text-gray-500">
        <Ban className="h-4 w-4" />
        <span>No lessons added yet</span>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {lessons.map((lesson) => {
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
            onClick={(e) => onEditLesson(transformedLesson, { id: moduleId } as Module, e)}
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
                  <DropdownMenuItem onClick={(e) => onEditLesson(transformedLesson, { id: moduleId } as Module, e)}>
                    Edit
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        )
      })}
    </div>
  )
} 