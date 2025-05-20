"use client"

import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useRef } from "react"
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
import { ScrollArea } from "@/components/ui/scroll-area"
import { Loading } from "@/components/ui/loading"
import { useBaseData } from "@/lib/hooks/useBaseData"
import { useCat, useAssessment } from "@/lib/hooks/useCat"
import { z } from "zod"
import { toast } from "sonner"
import { X } from "lucide-react"

// Schema for edit form (only editable fields)
const editFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  assessmentTypeId: z.string().min(1, "Assessment type is required"),
})

type EditFormValues = z.infer<typeof editFormSchema>

// Type definition for assessment types
interface AssessmentType {
  id: string
  name: string
  description: string
  assessmentSubType: string
}

interface EditCatDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  assessmentId: string
  trainingId: string
  companyId: string
}

export function EditCatDialog({
  isOpen,
  onOpenChange,
  assessmentId,
  trainingId,
  companyId
}: EditCatDialogProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const hasFormBeenReset = useRef(false)
  
  // Fetch assessment types and assessment details
  const { data: assessmentTypes = [], isLoading: isLoadingTypes } = useBaseData('assessment-type')
  const { data: assessmentData, isLoading: isLoadingAssessment } = useAssessment(assessmentId)
  const { updateAssessment } = useCat()
  
  // Form setup
  const form = useForm<EditFormValues>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      name: "",
      description: "",
      assessmentTypeId: "",
    },
    mode: "onChange"
  })
  
  // Update form values when assessment data is loaded
  useEffect(() => {
    if (assessmentData?.assessment && !hasFormBeenReset.current) {
      const { name, description, assessmentType } = assessmentData.assessment;
      form.reset({
        name,
        description,
        assessmentTypeId: assessmentType.id
      });
      hasFormBeenReset.current = true;
    }
  }, [assessmentData, form]);

  // Reset the ref when the dialog closes and reopens
  useEffect(() => {
    if (isOpen) {
      hasFormBeenReset.current = false;
    }
  }, [isOpen]);
  
  const onSubmit = async (values: EditFormValues) => {
    // Don't update state if already submitting
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      await updateAssessment({
        assessmentId,
        assessmentData: {
          name: values.name,
          description: values.description,
          assessmentTypeId: values.assessmentTypeId
        }
      }, {
        onSuccess: () => {
          toast.success("Assessment updated successfully");
          onOpenChange(false);
          router.refresh();
        },
        onError: (error) => {
          toast.error("Failed to update assessment");
        },
        onSettled: () => {
          setIsSubmitting(false);
        }
      });
    } catch (error) {
      toast.error("Failed to update assessment");
      setIsSubmitting(false);
    }
  }
  
  const isLoading = isLoadingAssessment || isLoadingTypes
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      // Only close if not submitting
      if (!isSubmitting) {
        onOpenChange(open);
      }
    }}>
      <DialogContent className="sm:max-w-[600px] max-h-[95vh] p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between w-full">
            <DialogTitle className="text-xl font-semibold">Edit Assessment</DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="relative">
          <ScrollArea className="h-[65vh] md:h-[65vh] pr-4">
            <div className="px-4 py-2 pb-24">
              {isLoading ? (
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
                    
                    {/* Display assessment level and parent info (non-editable) */}
                    {assessmentData?.assessment && (
                      <div className="space-y-2 border rounded-md p-4 bg-gray-50">
                        <h3 className="text-sm font-medium text-gray-500">Assessment Details (Cannot be edited)</h3>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-gray-500">Level:</div>
                          <div>{assessmentData.assessment.assessmentLevel}</div>
                          
                          {assessmentData.assessment.assessmentLevel === "TRAINING" && assessmentData.assessment.training && (
                            <>
                              <div className="text-gray-500">Training:</div>
                              <div>{assessmentData.assessment.training.title}</div>
                            </>
                          )}
                          
                          {assessmentData.assessment.assessmentLevel === "MODULE" && assessmentData.assessment.module && (
                            <>
                              <div className="text-gray-500">Module:</div>
                              <div>{assessmentData.assessment.module.name}</div>
                            </>
                          )}
                          
                          {assessmentData.assessment.assessmentLevel === "LESSON" && assessmentData.assessment.lesson && (
                            <>
                              <div className="text-gray-500">Lesson:</div>
                              <div>{assessmentData.assessment.lesson.name}</div>
                            </>
                          )}
                        </div>
                      </div>
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
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={form.handleSubmit(onSubmit)}
              disabled={isSubmitting || isLoading}
              className="bg-brand text-white"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 