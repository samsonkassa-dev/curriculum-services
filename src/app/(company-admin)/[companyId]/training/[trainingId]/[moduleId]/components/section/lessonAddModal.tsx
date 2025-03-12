"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useBaseData } from "@/lib/hooks/useBaseData"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCreateLesson, useUpdateLesson } from "@/lib/hooks/useLesson"

interface BaseItem {
  id: string
  name: string
  description: string
}

interface LessonAddModalProps {
  isOpen: boolean
  onClose: () => void
  moduleId: string
  initialData?: LessonFormData
  isEdit?: boolean
}

interface LessonFormData {
  id?: string
  name: string
  objective: string
  description: string
  duration: number
  durationType: "HOURS" | "DAYS" | "WEEKS" | "MONTHS"
  moduleId: string
  instructionalMethodIds: string[]
  technologyIntegrationIds: string[]
}

export function LessonAddModal({ 
  isOpen, 
  onClose, 
  moduleId,
  initialData,
  isEdit = false 
}: LessonAddModalProps) {
  const { data: instructionalMethods } = useBaseData('instructional-method')
  const { data: technologyIntegrations } = useBaseData('technology-integration')
  const { mutateAsync: createLesson } = useCreateLesson()
  const { mutateAsync: updateLesson } = useUpdateLesson()
  
  const [formData, setFormData] = useState<LessonFormData>(() => {
    return initialData || {
      name: "",
      objective: "",
      description: "",
      duration: 0,
      durationType: "HOURS",
      moduleId: moduleId,
      instructionalMethodIds: [],
      technologyIntegrationIds: []
    }
  })

  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    }
  }, [initialData])

  useEffect(() => {
    setFormData(prev => ({ ...prev, moduleId }))
  }, [moduleId])

  const handleSubmit = async () => {
    try {
      if (isEdit && initialData?.id) {
        await updateLesson({
          lessonId: initialData.id,
          data: formData
        })
      } else {
        await createLesson(formData)
      }
      onClose()
    } catch (error) {
      console.error("Failed to create lesson:", error)
    }
  }

  // Handle instructional method selection
  const handleInstructionalMethodChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      instructionalMethodIds: prev.instructionalMethodIds.includes(value)
        ? prev.instructionalMethodIds.filter(id => id !== value)
        : [...prev.instructionalMethodIds, value]
    }))
  }

  // Handle technology integration selection
  const handleTechnologyIntegrationChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      technologyIntegrationIds: prev.technologyIntegrationIds.includes(value)
        ? prev.technologyIntegrationIds.filter(id => id !== value)
        : [...prev.technologyIntegrationIds, value]
    }))
  }

  // Safe arrays to prevent errors
  const safeInstructionalMethods = instructionalMethods || []
  const safeTechnologyIntegrations = technologyIntegrations || []

  // Get names for selected methods and techs for display
  const selectedMethodNames = formData.instructionalMethodIds
    .map(id => safeInstructionalMethods.find((m: BaseItem) => m.id === id)?.name)
    .filter(Boolean)
    .join(", ")

  const selectedTechNames = formData.technologyIntegrationIds
    .map(id => safeTechnologyIntegrations.find((t: BaseItem) => t.id === id)?.name)
    .filter(Boolean)
    .join(", ")

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-w-[350px] p-0">
        <DialogHeader className="flex flex-row items-center justify-between border-b p-6">
          <DialogTitle>{isEdit ? "Edit Lesson" : "Create Lesson"}</DialogTitle>
        </DialogHeader>

        <div className="p-6 max-h-[80vh] overflow-y-auto">
          <div className="grid gap-6">
            {/* First row - Name and Objective side by side */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Lesson Name</label>
                <Input
                  placeholder="Enter lesson name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Objective</label>
                <Input
                  placeholder="Enter lesson objective"
                  value={formData.objective}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, objective: e.target.value }))
                  }
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Enter lesson description"
                value={formData.description}
                className="min-h-[100px]"
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </div>

            {/* Duration and Duration Type side by side */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Duration</label>
                <Input
                  type="number"
                  placeholder="Enter duration"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, duration: parseInt(e.target.value) || 0 }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Duration Type</label>
                <Select
                  value={formData.durationType}
                  onValueChange={(value: "HOURS" | "DAYS" | "WEEKS" | "MONTHS") =>
                    setFormData((prev) => ({ ...prev, durationType: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HOURS">Hours</SelectItem>
                    <SelectItem value="DAYS">Days</SelectItem>
                    <SelectItem value="WEEKS">Weeks</SelectItem>
                    <SelectItem value="MONTHS">Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Instructional Methods and Technology Integrations side by side */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Instructional Methods</label>
                <Select 
                  value={formData.instructionalMethodIds[0] || ""}
                  onValueChange={handleInstructionalMethodChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select instructional methods">
                      {formData.instructionalMethodIds.length > 0 ? (
                        <div className="flex flex-wrap gap-1 py-0.5">
                          {formData.instructionalMethodIds.map(id => {
                            const method = safeInstructionalMethods.find((m: BaseItem) => m.id === id)
                            return method ? (
                              <Badge key={id} variant="pending" className="rounded-sm text-xs">
                                {method.name}
                              </Badge>
                            ) : null
                          })}
                        </div>
                      ) : null}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {safeInstructionalMethods.length > 0 ? (
                      safeInstructionalMethods.map((method: BaseItem) => (
                        <SelectItem 
                          key={method.id} 
                          value={method.id}
                          className="flex items-center justify-between"
                        >
                          {method.name}
                          {formData.instructionalMethodIds.includes(method.id) && (
                            <Check className="h-4 w-4 ml-2" />
                          )}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>
                        No instructional methods available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Technology Integrations</label>
                <Select 
                  value={formData.technologyIntegrationIds[0] || ""}
                  onValueChange={handleTechnologyIntegrationChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select technology integrations">
                      {formData.technologyIntegrationIds.length > 0 ? (
                        <div className="flex flex-wrap gap-1 py-0.5">
                          {formData.technologyIntegrationIds.map(id => {
                            const tech = safeTechnologyIntegrations.find((t: BaseItem) => t.id === id)
                            return tech ? (
                              <Badge key={id} variant="pending" className="rounded-sm text-xs">
                                {tech.name}
                              </Badge>
                            ) : null
                          })}
                        </div>
                      ) : null}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {safeTechnologyIntegrations.length > 0 ? (
                      safeTechnologyIntegrations.map((tech: BaseItem) => (
                        <SelectItem 
                          key={tech.id} 
                          value={tech.id}
                          className="flex items-center justify-between"
                        >
                          {tech.name}
                          {formData.technologyIntegrationIds.includes(tech.id) && (
                            <Check className="h-4 w-4 ml-2" />
                          )}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>
                        No technology integrations available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="text-white bg-blue-500 hover:bg-blue-600"
              >
                {isEdit ? "Save Changes" : "Save"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 