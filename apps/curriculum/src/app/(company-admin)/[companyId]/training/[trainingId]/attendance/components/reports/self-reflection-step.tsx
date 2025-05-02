"use client"

import { UseFormReturn } from "react-hook-form"
import { SessionReportFormValues } from "./session-report-schema"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"

interface SelfReflectionStepProps {
  form: UseFormReturn<SessionReportFormValues>
}

export function SelfReflectionStep({ form }: SelfReflectionStepProps) {
  const { register, formState: { errors }, setValue, watch } = form
  
  const teachingMethodEffectiveness = watch("teachingMethodEffectiveness")

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label 
          htmlFor="teachingMethodEffectiveness" 
          className="text-base font-medium text-[#414554]"
        >
          Effectiveness of Teaching Methods
        </Label>
        
        <Select 
          onValueChange={(value) => setValue("teachingMethodEffectiveness", parseInt(value))}
          defaultValue={teachingMethodEffectiveness ? teachingMethodEffectiveness.toString() : undefined}
        >
          <SelectTrigger className="w-full border border-[#E4E4E4]">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 - Not Effective</SelectItem>
            <SelectItem value="2">2 - Slightly Effective</SelectItem>
            <SelectItem value="3">3 - Moderately Effective</SelectItem>
            <SelectItem value="4">4 - Very Effective</SelectItem>
            <SelectItem value="5">5 - Extremely Effective</SelectItem>
          </SelectContent>
        </Select>
        
        {errors.teachingMethodEffectiveness && (
          <p className="text-sm text-red-500 mt-1">
            {errors.teachingMethodEffectiveness.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label 
          htmlFor="trainerStrengths" 
          className="text-base font-medium text-[#414554]"
        >
          Strengths
        </Label>
        
        <Textarea
          id="trainerStrengths"
          {...register("trainerStrengths")}
          placeholder="Describe your strengths as a trainer"
          className={cn(
            "border border-[#DCDCDC] rounded-md resize-none h-32",
            errors.trainerStrengths && "border-red-500"
          )}
        />
        
        {errors.trainerStrengths && (
          <p className="text-sm text-red-500 mt-1">
            {errors.trainerStrengths.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label 
          htmlFor="trainerAreasForGrowth" 
          className="text-base font-medium text-[#414554]"
        >
          Areas for Growth
        </Label>
        
        <Textarea
          id="trainerAreasForGrowth"
          {...register("trainerAreasForGrowth")}
          placeholder="Describe areas where you can improve as a trainer"
          className={cn(
            "border border-[#DCDCDC] rounded-md resize-none h-32",
            errors.trainerAreasForGrowth && "border-red-500"
          )}
        />
        
        {errors.trainerAreasForGrowth && (
          <p className="text-sm text-red-500 mt-1">
            {errors.trainerAreasForGrowth.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label 
          htmlFor="trainerProfessionalGoals" 
          className="text-base font-medium text-[#414554]"
        >
          Professional Development Goals
        </Label>
        
        <Textarea
          id="trainerProfessionalGoals"
          {...register("trainerProfessionalGoals")}
          placeholder="Describe your professional development goals as a trainer"
          className={cn(
            "border border-[#DCDCDC] rounded-md resize-none h-32",
            errors.trainerProfessionalGoals && "border-red-500"
          )}
        />
        
        {errors.trainerProfessionalGoals && (
          <p className="text-sm text-red-500 mt-1">
            {errors.trainerProfessionalGoals.message}
          </p>
        )}
      </div>
    </div>
  )
} 