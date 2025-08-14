"use client"

import { UseFormReturn } from "react-hook-form"
import { SessionReportFormValues } from "./session-report-schema"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface RecommendationsStepProps {
  form: UseFormReturn<SessionReportFormValues>
  readOnly?: boolean
}

export function RecommendationsStep({ form, readOnly = false }: RecommendationsStepProps) {
  const { register, formState: { errors } } = form

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label 
          htmlFor="curriculumRecommendations" 
          className="text-base font-medium text-[#414554]"
        >
          Curriculum and Content
        </Label>
        
        <Textarea
          id="curriculumRecommendations"
          {...register("curriculumRecommendations")}
          placeholder="Provide recommendations for curriculum and content improvement"
          className={cn(
            "border border-[#DCDCDC] rounded-md resize-none h-32",
            errors.curriculumRecommendations && "border-red-500"
          )}
          disabled={readOnly}
        />
        
        {errors.curriculumRecommendations && (
          <p className="text-sm text-red-500 mt-1">
            {errors.curriculumRecommendations.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label 
          htmlFor="deliveryMethodRecommendations" 
          className="text-base font-medium text-[#414554]"
        >
          Delivery Methods
        </Label>
        
        <Textarea
          id="deliveryMethodRecommendations"
          {...register("deliveryMethodRecommendations")}
          placeholder="Provide recommendations for delivery methods"
          className={cn(
            "border border-[#DCDCDC] rounded-md resize-none h-32",
            errors.deliveryMethodRecommendations && "border-red-500"
          )}
          disabled={readOnly}
        />
        
        {errors.deliveryMethodRecommendations && (
          <p className="text-sm text-red-500 mt-1">
            {errors.deliveryMethodRecommendations.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label 
          htmlFor="assessmentRecommendations" 
          className="text-base font-medium text-[#414554]"
        >
          Assessment
        </Label>
        
        <Textarea
          id="assessmentRecommendations"
          {...register("assessmentRecommendations")}
          placeholder="Provide recommendations for assessment methods"
          className={cn(
            "border border-[#DCDCDC] rounded-md resize-none h-32",
            errors.assessmentRecommendations && "border-red-500"
          )}
          disabled={readOnly}
        />
        
        {errors.assessmentRecommendations && (
          <p className="text-sm text-red-500 mt-1">
            {errors.assessmentRecommendations.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label 
          htmlFor="learnerSupportRecommendations" 
          className="text-base font-medium text-[#414554]"
        >
          Learner Support
        </Label>
        
        <Textarea
          id="learnerSupportRecommendations"
          {...register("learnerSupportRecommendations")}
          placeholder="Provide recommendations for learner support"
          className={cn(
            "border border-[#DCDCDC] rounded-md resize-none h-32",
            errors.learnerSupportRecommendations && "border-red-500"
          )}
          disabled={readOnly}
        />
        
        {errors.learnerSupportRecommendations && (
          <p className="text-sm text-red-500 mt-1">
            {errors.learnerSupportRecommendations.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label 
          htmlFor="otherRecommendations" 
          className="text-base font-medium text-[#414554]"
        >
          Other Recommendations
        </Label>
        
        <Textarea
          id="otherRecommendations"
          {...register("otherRecommendations")}
          placeholder="Provide any other recommendations"
          className={cn(
            "border border-[#DCDCDC] rounded-md resize-none h-32",
            errors.otherRecommendations && "border-red-500"
          )}
          disabled={readOnly}
        />
        
        {errors.otherRecommendations && (
          <p className="text-sm text-red-500 mt-1">
            {errors.otherRecommendations.message}
          </p>
        )}
      </div>
    </div>
  )
} 