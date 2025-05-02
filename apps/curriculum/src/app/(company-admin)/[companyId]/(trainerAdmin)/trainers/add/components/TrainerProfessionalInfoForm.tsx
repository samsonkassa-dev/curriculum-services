"use client"

import { UseFormReturn } from "react-hook-form"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrainerFormValues } from "../page"
import { AcademicLevel, TrainingTag, Language } from "@/lib/hooks/useTrainers"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface TrainerProfessionalInfoFormProps {
  form: UseFormReturn<TrainerFormValues>
  trainingTags: TrainingTag[]
  academicLevels: AcademicLevel[]
  languages: Language[]
  disabled?: boolean
}

export function TrainerProfessionalInfoForm({ 
  form, 
  trainingTags,
  academicLevels,
  languages,
  disabled = false
}: TrainerProfessionalInfoFormProps) {
  const [openTagsPopover, setOpenTagsPopover] = useState(false);
  
  const handleSelectTrainingTag = (tagId: string) => {
    if (disabled) return;
    const currentTags = form.getValues("trainingTagIds") || [];
    const newTags = currentTags.includes(tagId)
      ? currentTags.filter(id => id !== tagId)
      : [...currentTags, tagId];
    
    form.setValue("trainingTagIds", newTags, { shouldValidate: true });
    // Don't close the popover to allow multiple selections
  };

  return (
    <div className="space-y-8">
      {/* Language Select */}
      <div className="space-y-2">
        <FormField
          control={form.control}
          name="languageId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[16px] font-medium text-gray-800">Primary Language</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""} disabled={disabled}>
                <FormControl>
                  <SelectTrigger className="h-12 border-[#E4E4E4] rounded-md">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {languages?.map((language) => (
                    <SelectItem key={language.id} value={language.id}>
                      {language.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Location */}
      <div className="space-y-2">
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[16px] font-medium text-gray-800">Location</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter your location" 
                  {...field} 
                  className="h-12 border-[#E4E4E4] rounded-md"
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Training Tags (Multi-select Popover) */}
      <div className="space-y-2">
        <div>
          <FormLabel className="text-[16px] font-medium text-gray-800">Training Tags</FormLabel>
          <p className="text-sm text-gray-500 mt-1">Select all training tags that apply to your expertise.</p>
        </div>
        <FormField
          control={form.control}
          name="trainingTagIds"
          render={({ field }) => (
            <FormItem>
              <Popover 
                open={openTagsPopover && !disabled} 
                onOpenChange={setOpenTagsPopover}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    type="button"
                    disabled={disabled}
                    className={cn(
                      "w-full justify-between py-6 border-[#E4E4E4] rounded-md",
                      disabled && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={(e) => {
                      if (!disabled) {
                        e.preventDefault();
                        setOpenTagsPopover(!openTagsPopover);
                      }
                    }}
                  >
                    <div className="flex flex-wrap gap-1 items-center">
                      {field.value && field.value.length > 0 ? (
                        <>
                          {field.value.map((id) => {
                            const tag = trainingTags?.find((tag) => tag.id === id);
                            return (
                              <Badge key={`tag-${id}`} variant="secondary">
                                {tag?.name || id}
                              </Badge>
                            );
                          })}
                        </>
                      ) : (
                        "Select training tags..."
                      )}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <div className="max-h-[300px] overflow-auto">
                    {trainingTags && trainingTags.length > 0 ? (
                      trainingTags.map((tag) => (
                        <div
                          key={tag.id}
                          className={cn(
                            "flex items-center px-4 py-2 text-sm cursor-pointer hover:bg-gray-100",
                            field.value?.includes(tag.id) && "bg-gray-100"
                          )}
                          onClick={() => handleSelectTrainingTag(tag.id)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              field.value?.includes(tag.id)
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {tag.name}
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-sm text-gray-500">
                        No training tags available
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Years of Training Experience */}
      <div className="space-y-2">
        <FormField
          control={form.control}
          name="experienceYears"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[16px] font-medium text-gray-800">Years of Training Experience</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min={0}
                  {...field}
                  onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                  className="h-12 border-[#E4E4E4] rounded-md"
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Courses Taught */}
      <div className="space-y-2">
        <FormField
          control={form.control}
          name="coursesTaught"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[16px] font-medium text-gray-800">Courses Taught</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter courses taught, separated by commas"
                  className="min-h-[100px] border-[#E4E4E4] rounded-md"
                  value={field.value?.join(", ") || ""}
                  onChange={e => {
                    const courses = e.target.value.split(",").map(item => item.trim()).filter(Boolean);
                    field.onChange(courses);
                  }}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Qualification Level */}
      <div className="space-y-2">
        <div>
          <FormLabel className="text-[16px] font-medium text-gray-800">Qualification Level & Certification</FormLabel>
          <p className="text-sm text-gray-500 mt-1">Select the certification awarded upon completion and its corresponding qualification level.</p>
        </div>
        <FormField
          control={form.control}
          name="academicLevelId"
          render={({ field }) => (
            <FormItem>
              <Select onValueChange={field.onChange} value={field.value || ""} disabled={disabled}>
                <FormControl>
                  <SelectTrigger className="h-12 border-[#E4E4E4] rounded-md">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {academicLevels?.map((level) => (
                    <SelectItem key={level.id} value={level.id}>
                      {level.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Certification Details */}
      <div className="space-y-2">
        <div>
          <FormLabel className="text-[16px] font-medium text-gray-800">Certification Details</FormLabel>
          <p className="text-sm text-gray-500 mt-1">List any relevant certifications</p>
        </div>
        <FormField
          control={form.control}
          name="certifications"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea 
                  placeholder="Enter certifications, separated by commas"
                  className="min-h-[100px] border-[#E4E4E4] rounded-md"
                  value={field.value?.join(", ") || ""}
                  onChange={e => {
                    const certifications = e.target.value.split(",").map(item => item.trim()).filter(Boolean);
                    field.onChange(certifications);
                  }}
                  disabled={disabled}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
} 