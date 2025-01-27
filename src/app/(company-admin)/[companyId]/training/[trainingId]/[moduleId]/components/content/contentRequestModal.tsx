"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCreateContent } from "@/lib/hooks/useContent"
import { useSectionsByModuleId } from "@/lib/hooks/useSection"
import { toast } from "sonner"
import { useParams } from "next/navigation"
interface ContentRequestModalProps {
  isOpen: boolean
  onClose: () => void
  moduleId: string
}

interface ContentFormData {
  name: string
  description: string
  contentFileType: 'PDF' | 'VIDEO' | 'LINK'
  sectionId?: string
  lessonId?: string
  email: string
}

export function ContentRequestModal({ 
  isOpen, 
  onClose,
  moduleId
}: ContentRequestModalProps) {
  const [formData, setFormData] = useState<ContentFormData>({
    name: "",
    description: "",
    contentFileType: "PDF",
    email: ""
  })
  const [errors, setErrors] = useState<Partial<Record<keyof ContentFormData, boolean>>>({})

  const { data: sectionsData } = useSectionsByModuleId(moduleId)
  const { mutateAsync: createContent } = useCreateContent()

  const validateForm = () => {
    const newErrors: Partial<Record<keyof ContentFormData, boolean>> = {}
    
    if (!formData.name.trim()) newErrors.name = true
    if (!formData.description.trim()) newErrors.description = true
    if (!formData.contentFileType) newErrors.contentFileType = true
    if (!formData.sectionId) newErrors.sectionId = true
    if (!formData.lessonId) newErrors.lessonId = true
    if (!formData.email.trim()) newErrors.email = true

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Please fill in all required fields')
      return
    }

    await createContent({
      singleContentRequestDTO: [{
        name: formData.name,
        description: formData.description,
        contentFileType: formData.contentFileType
      }],
      email: formData.email,
      moduleId,
      lessonId: formData.lessonId
    })
    onClose()
  }

  const hasNoSections = !sectionsData?.sections?.length
  const hasNoLessons = formData.sectionId && 
    !sectionsData?.sections.find(s => s.id === formData.sectionId)?.lessons.length

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] p-0">
        <DialogHeader className="p-6 border-b">
          <DialogTitle>Request Module Content</DialogTitle>
        </DialogHeader>

        <div className="p-6">
          <div className="grid gap-6">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Name <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Module"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                    setErrors((prev) => ({ ...prev, name: false }))
                  }}
                  className={cn(!!errors.name && "border-red-500")}
                />
                {errors.name && (
                  <span className="text-xs text-red-500 mt-1">Name is required</span>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Input
                  placeholder="this is a description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">File Type</label>
                <Select
                  value={formData.contentFileType}
                  onValueChange={(value: 'PDF' | 'VIDEO' | 'LINK') =>
                    setFormData((prev) => ({ ...prev, contentFileType: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select file type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PDF">PDF</SelectItem>
                    <SelectItem value="VIDEO">Video</SelectItem>
                    <SelectItem value="LINK">Link</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Choose Section <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.sectionId}
                  onValueChange={(value) => {
                    setFormData((prev) => ({ 
                      ...prev, 
                      sectionId: value,
                      lessonId: undefined
                    }))
                    setErrors((prev) => ({ ...prev, sectionId: false }))
                  }}
                >
                  <SelectTrigger className={cn(!!errors.sectionId && "border-red-500")}>
                    <SelectValue placeholder="Select Section" />
                  </SelectTrigger>
                  <SelectContent>
                    {hasNoSections ? (
                      <SelectItem value="no-sections" disabled>
                        No sections available
                      </SelectItem>
                    ) : (
                      sectionsData?.sections.map((section) => (
                        <SelectItem key={section.id} value={section.id}>
                          {section.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {errors.sectionId && (
                  <span className="text-xs text-red-500 mt-1">Section is required</span>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Choose Lesson <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.lessonId}
                  onValueChange={(value) => {
                    setFormData((prev) => ({ ...prev, lessonId: value }))
                    setErrors((prev) => ({ ...prev, lessonId: false }))
                  }}
                  disabled={Boolean(!formData.sectionId || hasNoLessons)}
                >
                  <SelectTrigger className={cn(!!errors.lessonId && "border-red-500")}>
                    <SelectValue placeholder="Select Lesson" />
                  </SelectTrigger>
                  <SelectContent>
                    {hasNoLessons ? (
                      <SelectItem value="no-lessons" disabled>
                        No lessons available
                      </SelectItem>
                    ) : (
                      sectionsData?.sections
                        .find(s => s.id === formData.sectionId)
                        ?.lessons.map((lesson) => (
                          <SelectItem key={lesson.id} value={lesson.id}>
                            {lesson.name}
                          </SelectItem>
                        ))
                    )}
                  </SelectContent>
                </Select>
                {errors.lessonId && (
                  <span className="text-xs text-red-500 mt-1">Lesson is required</span>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-base font-medium mb-4">Please Invite Content Developer</h3>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Email <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="enter email address of user"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                    setErrors((prev) => ({ ...prev, email: false }))
                  }}
                  className={cn(!!errors.email && "border-red-500")}
                />
                {errors.email && (
                  <span className="text-xs text-red-500 mt-1">Email is required</span>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={handleSubmit}
                className="bg-blue-500 hover:bg-blue-600 text-white"
                disabled={Boolean(
                  hasNoSections ||
                  hasNoLessons ||
                  !formData.name.trim() ||
                  !formData.description.trim() ||
                  !formData.contentFileType ||
                  !formData.sectionId ||
                  !formData.lessonId ||
                  !formData.email.trim()
                )}
              >
                Send request
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 