import { Ban, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Module } from "@/types/module"
import { ModuleLessonsProps, LessonFormData } from "./types"
import { InstructionalMethod, TechnologyIntegration } from "@/lib/hooks/useLesson"

export function ModuleLessons({
  moduleId,
  isSubModule = false,
  lessons = [],
  canEdit,
  onEditLesson,
  onDeleteLesson
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
            className="flex items-center justify-between p-4 bg-gray-50 rounded-md hover:bg-gray-100"
          >
            <div 
              className="flex flex-col flex-1 cursor-pointer"
              onClick={(e) => onEditLesson(transformedLesson, { id: moduleId } as Module, e)}
            >
              <span className="font-medium">{lesson.name}</span>
              <span className="text-sm text-gray-500">{lesson.objective}</span>
            </div>
            {canEdit && (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditLesson(transformedLesson, { id: moduleId } as Module, e);
                  }}
                  className="h-8 w-8 p-0 text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                {onDeleteLesson && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteLesson(transformedLesson, moduleId);
                    }}
                    className="h-8 w-8 p-0 text-gray-600 hover:text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
} 