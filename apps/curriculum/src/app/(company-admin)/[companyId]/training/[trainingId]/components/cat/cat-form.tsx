"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loading } from "@/components/ui/loading"

import { useCat } from "@/lib/hooks/useCat"
import { useBaseData } from "@/lib/hooks/useBaseData"
import { useModulesByTrainingId } from "@/lib/hooks/useModule"
import { useGetLessons } from "@/lib/hooks/useLesson"
import { catFormSchema, CatFormValues } from "./formSchemas"
import { toast } from "sonner"

// Type definition for assessment types fetched from API
interface AssessmentType {
  id: string
  name: string
  description: string
  assessmentSubType: string
}

interface CatFormProps {
  trainingId: string
  companyId: string
  onSuccess: () => void
  onCancel: () => void
  assessmentId?: string // For editing existing assessment
}

export function CatForm({ trainingId, companyId, onSuccess, onCancel, assessmentId }: CatFormProps) {
  // States
  const isEditing = !!assessmentId
  
  // Hooks
  const { createAssessment, isCreateLoading } = useCat()
  const { data: assessmentTypes = [], isLoading: isLoadingTypes } = useBaseData('assessment-type')
  
  // Form setup
  const form = useForm<CatFormValues>({
    resolver: zodResolver(catFormSchema),
    defaultValues: {
      name: "",
      description: "",
      assessmentLevel: "TRAINING",
      assessmentTypeId: "",
      parentId: trainingId, // Default to training ID
      moduleId: "",
      lessonId: "",
    },
    mode: "onChange"
  })
  
  // Watch assessment level and moduleId to control form behavior
  const assessmentLevel = form.watch("assessmentLevel")
  const selectedModuleId = form.watch("moduleId")
  
  // Fetch modules for this training (only when needed)
  const { data: modulesData, isLoading: isLoadingModules } = useModulesByTrainingId(
    trainingId,
    assessmentLevel === "MODULE" || assessmentLevel === "LESSON"
  )
  
  // Fetch lessons for selected module (only when needed)
  const { data: lessonsData, isLoading: isLoadingLessons } = useGetLessons(
    assessmentLevel === "LESSON" && selectedModuleId ? selectedModuleId : ""
  )
  
  // Update parentId when assessment level changes
  useEffect(() => {
    if (assessmentLevel === "TRAINING") {
      // For training level, parentId is the trainingId
      form.setValue("parentId", trainingId)
      
      // Clear module/lesson selections as they aren't relevant
      if (form.getValues("moduleId") !== "") {
        form.setValue("moduleId", "")
      }
      if (form.getValues("lessonId") !== "") {
        form.setValue("lessonId", "")
      }
    }
  }, [assessmentLevel, form, trainingId])
  
  // Handle module selection changing
  useEffect(() => {
    if (assessmentLevel === "MODULE" && selectedModuleId) {
      // For module level, parentId is the moduleId
      form.setValue("parentId", selectedModuleId)
      // Clear lesson selection
      if (form.getValues("lessonId") !== "") {
        form.setValue("lessonId", "")
      }
    }
  }, [assessmentLevel, selectedModuleId, form])
  
  // Handle lesson selection changing
  const selectedLessonId = form.watch("lessonId")
  useEffect(() => {
    if (assessmentLevel === "LESSON" && selectedLessonId) {
      // For lesson level, parentId is the lessonId
      form.setValue("parentId", selectedLessonId)
    }
  }, [assessmentLevel, selectedLessonId, form])
  
  // Form submission
  const onSubmit = async (values: CatFormValues) => {
    try {
      await createAssessment({
        name: values.name,
        description: values.description,
        assessmentTypeId: values.assessmentTypeId,
        assessmentLevel: values.assessmentLevel,
        parentId: values.parentId as string
      }, {
        onSuccess: () => {
          toast.success("Assessment created successfully")
          onSuccess()
        },
        onError: (error) => {
          toast.error("Failed to create assessment")
        }
      })
    } catch (error) {
      toast.error("Failed to create assessment")
    }
  }
  
  return (
    <div className="relative">
      <ScrollArea className="h-[65vh] md:h-[65vh] pr-4">
        <div className="px-4 py-2 pb-24">
          {isLoadingTypes ? (
            <div className="flex justify-center items-center h-32">
              <Loading />
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Assessment name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Provide a brief description of this assessment"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Assessment Type */}
                <FormField
                  control={form.control}
                  name="assessmentTypeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assessment Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select assessment type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {assessmentTypes.map((type: AssessmentType) => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Assessment Level */}
                <FormField
                  control={form.control}
                  name="assessmentLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assessment Level</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="TRAINING">Training</SelectItem>
                          <SelectItem value="MODULE">Module</SelectItem>
                          <SelectItem value="LESSON">Lesson</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Module Selection (shown if level is MODULE or LESSON) */}
                {(assessmentLevel === "MODULE" || assessmentLevel === "LESSON") && (
                  <FormField
                    control={form.control}
                    name="moduleId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Module</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select module" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {isLoadingModules ? (
                              <SelectItem value="loading" disabled>
                                Loading modules...
                              </SelectItem>
                            ) : modulesData?.modules?.length ? (
                              modulesData.modules.map((module) => (
                                <SelectItem key={module.id} value={module.id}>
                                  {module.name}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="none" disabled>
                                No modules found
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Lesson Selection (shown only if level is LESSON and module is selected) */}
                {assessmentLevel === "LESSON" && selectedModuleId && (
                  <FormField
                    control={form.control}
                    name="lessonId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Select Lesson</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select lesson" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {isLoadingLessons ? (
                              <SelectItem value="loading" disabled>
                                Loading lessons...
                              </SelectItem>
                            ) : lessonsData?.length ? (
                              lessonsData.map((lesson) => (
                                <SelectItem key={lesson.id} value={lesson.id}>
                                  {lesson.name}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="none" disabled>
                                No lessons found for this module
                              </SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </form>
            </Form>
          )}
        </div>
      </ScrollArea>
      
      {/* Fixed footer with buttons */}
      <div className="absolute bottom-0 left-0 right-0 py-4 px-6 bg-white border-t flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isCreateLoading}
        >
          Cancel
        </Button>
        <Button
          onClick={form.handleSubmit(onSubmit)}
          disabled={isCreateLoading}
          className="bg-brand text-white"
        >
          {isCreateLoading ? (isEditing ? "Updating..." : "Creating...") : (isEditing ? "Update" : "Create")}
        </Button>
      </div>
    </div>
  )
} 