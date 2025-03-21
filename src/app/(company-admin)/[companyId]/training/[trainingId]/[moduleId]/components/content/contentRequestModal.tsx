"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { useModules } from "@/lib/hooks/useModule"
import { useGetLessons } from "@/lib/hooks/useLesson"
import { toast } from "sonner"
import { useParams } from "next/navigation"
import { Loader2, Info, AlertTriangle, BookOpen, FileType, Mail } from "lucide-react"

interface ContentRequestModalProps {
  isOpen: boolean
  onClose: () => void
  moduleId: string
}

interface ContentFormData {
  name: string
  description: string
  contentFileType: 'PDF' | 'VIDEO' | 'LINK'
  lessonId?: string
  email: string
}

export function ContentRequestModal({ 
  isOpen, 
  onClose,
  moduleId
}: ContentRequestModalProps) {
  const params = useParams()
  const [formData, setFormData] = useState<ContentFormData>({
    name: "",
    description: "",
    contentFileType: "PDF",
    email: ""
  })
  const [errors, setErrors] = useState<Partial<Record<keyof ContentFormData, string>>>({})
  
  // Reset form data when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: "",
        description: "",
        contentFileType: "PDF",
        email: "",
        lessonId: undefined
      })
      setErrors({})
    }
  }, [isOpen])

  // Fetch module details to get current module info
  const { data: moduleDetails, isLoading: isModuleLoading } = useModules(moduleId)
  
  // Fetch lessons for the current module
  const { data: lessonData, isLoading: isLessonsLoading } = useGetLessons(moduleId)
  
  const { mutateAsync: createContent, isPending: isCreating } = useCreateContent()

  const validateForm = () => {
    const newErrors: Partial<Record<keyof ContentFormData, string>> = {}
    
    if (!formData.name.trim()) newErrors.name = "Name is required"
    if (!formData.description.trim()) newErrors.description = "Description is required"
    if (!formData.contentFileType) newErrors.contentFileType = "File type is required"
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address"
    }
    
    // Lesson selection is required if lessons are available
    if (hasLessons && !formData.lessonId) {
      newErrors.lessonId = "Please select a lesson"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    try {
      await createContent({
        singleContentRequestDTO: [{
          name: formData.name,
          description: formData.description,
          contentFileType: formData.contentFileType
        }],
        email: formData.email,
        moduleId: moduleId,
        lessonId: formData.lessonId
      })
      toast.success("Content request submitted successfully")
      onClose()
    } catch (error) {
      toast.error("Failed to submit content request")
      console.error("Content request error:", error)
    }
  }

  // Check if we have lessons
  const hasLessons = lessonData && lessonData.length > 0
  
  // Get the current module/submodule name
  const moduleName = moduleDetails?.module?.name || "Current Module"
  const isSubModule = !!moduleDetails?.module?.parentModule
  const contextLabel = isSubModule ? "Sub-module" : "Module"

  // Determine if submit should be disabled
  const isSubmitDisabled = isCreating || !hasLessons || isLessonsLoading;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[850px] p-0 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="py-4 px-5 border-b bg-gray-50">
          <DialogTitle className="text-lg flex items-center gap-2">
            <FileType className="h-5 w-5 text-blue-500" />
            Request Content
          </DialogTitle>
        </DialogHeader>

        <div className="px-5 py-4">
          <div className="grid gap-4">
            {/* Module context information - combined with no lessons warning */}
            <div className={cn(
              "p-3 rounded-md border flex items-start gap-2 text-sm",
              !hasLessons && !isLessonsLoading 
                ? "bg-amber-50 border-amber-200" 
                : "bg-blue-50 border-blue-100"
            )}>
              {!hasLessons && !isLessonsLoading ? (
                <>
                  <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-amber-800">
                      No lessons available for <span className="font-semibold">{moduleName}</span>
                    </p>
                    <p className="text-amber-700 text-xs mt-0.5">
                      Please add lessons to this {contextLabel.toLowerCase()} before requesting content.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <p className="text-blue-700">
                    Creating content for <span className="font-medium">{contextLabel}:</span> {moduleName}
                  </p>
                </>
              )}
            </div>
          
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 flex items-center gap-1">
                  <span>Content Name</span> <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Enter content name"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                    if (errors.name) setErrors((prev) => ({ ...prev, name: "" }))
                  }}
                  className={cn("h-12", errors.name && "border-red-500")}
                  disabled={isSubmitDisabled}
                />
                {errors.name && (
                  <span className="text-xs text-red-500 mt-1 block">{errors.name}</span>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 flex items-center gap-1">
                  <span>Content Type</span> <span className="text-red-500">*</span>
                </label>
                <Select
                  value={formData.contentFileType}
                  onValueChange={(value: 'PDF' | 'VIDEO' | 'LINK') => {
                    setFormData((prev) => ({ ...prev, contentFileType: value }))
                    if (errors.contentFileType) setErrors((prev) => ({ ...prev, contentFileType: "" }))
                  }}
                  disabled={isSubmitDisabled}
                >
                  <SelectTrigger className={cn("h-12", errors.contentFileType && "border-red-500")}>
                    <SelectValue placeholder="Select file type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PDF">PDF</SelectItem>
                    <SelectItem value="VIDEO">Video</SelectItem>
                    <SelectItem value="LINK">Link</SelectItem>
                  </SelectContent>
                </Select>
                {errors.contentFileType && (
                  <span className="text-xs text-red-500 mt-1 block">{errors.contentFileType}</span>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 flex items-center gap-1">
                <span>Description</span> <span className="text-red-500">*</span>
              </label>
              <Textarea
                placeholder="Provide a detailed description of the content you need"
                value={formData.description}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                  if (errors.description) setErrors((prev) => ({ ...prev, description: "" }))
                }}
                className={cn("min-h-[80px]", errors.description && "border-red-500")}
                disabled={isSubmitDisabled}
              />
              {errors.description && (
                <span className="text-xs text-red-500 mt-1 block">{errors.description}</span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1.5 flex items-center gap-1">
                  <BookOpen className="h-4 w-4 text-gray-500" />
                  <span>Lesson</span> {hasLessons && <span className="text-red-500">*</span>}
                </label>
                {isLessonsLoading ? (
                  <div className="flex items-center gap-2 p-1.5 border rounded-md h-12">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Loading lessons...</span>
                  </div>
                ) : (
                  <Select
                    value={formData.lessonId}
                    onValueChange={(value) => {
                      setFormData((prev) => ({ ...prev, lessonId: value }))
                      if (errors.lessonId) setErrors((prev) => ({ ...prev, lessonId: "" }))
                    }}
                    disabled={!hasLessons}
                  >
                    <SelectTrigger className={cn("h-12", errors.lessonId && "border-red-500")}>
                      <SelectValue placeholder={hasLessons ? "Select a lesson" : "No lessons available"} />
                    </SelectTrigger>
                    <SelectContent>
                      {lessonData?.map((lesson) => (
                        <SelectItem key={lesson.id} value={lesson.id}>
                          {lesson.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {errors.lessonId && (
                  <span className="text-xs text-red-500 mt-1 block">{errors.lessonId}</span>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 flex items-center gap-1">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span>Content Developer Email</span> <span className="text-red-500">*</span>
                </label>
                <Input
                  type="email"
                  placeholder="developer@example.com"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                    if (errors.email) setErrors((prev) => ({ ...prev, email: "" }))
                  }}
                  className={cn("h-12", errors.email && "border-red-500")}
                  disabled={isSubmitDisabled}
                />
                {errors.email && (
                  <span className="text-xs text-red-500 mt-1 block">{errors.email}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="py-4 px-5">
          <Button variant="outline" onClick={onClose} size="default" className="mr-2">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitDisabled}
            size="default"
            className={cn(
              "text-white",
              isSubmitDisabled 
                ? "bg-gray-400 hover:bg-gray-400 cursor-not-allowed" 
                : "bg-blue-500 hover:bg-blue-600"
            )}
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : !hasLessons ? (
              'No Lessons Available'
            ) : (
              'Submit Request'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 