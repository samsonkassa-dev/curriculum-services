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

interface LearnerFeedbackStepProps {
  form: UseFormReturn<SessionReportFormValues>
  readOnly?: boolean
}

export function LearnerFeedbackStep({ form, readOnly = false }: LearnerFeedbackStepProps) {
  const { register, formState: { errors }, setValue, watch } = form
  
  const satisfactionScore = watch("overallSatisfactionScore")

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label 
          htmlFor="overallSatisfactionScore" 
          className="text-base font-medium text-[#292827]"
        >
          Overall Satisfaction Score
        </Label>
        
        <Select 
          onValueChange={(value) => setValue("overallSatisfactionScore", parseInt(value))}
          value={satisfactionScore ? satisfactionScore.toString() : undefined}
          disabled={readOnly}
        >
          <SelectTrigger className="w-full border border-[#E4E4E4]">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 - Very Dissatisfied</SelectItem>
            <SelectItem value="2">2 - Dissatisfied</SelectItem>
            <SelectItem value="3">3 - Neutral</SelectItem>
            <SelectItem value="4">4 - Satisfied</SelectItem>
            <SelectItem value="5">5 - Very Satisfied</SelectItem>
          </SelectContent>
        </Select>
        
        {errors.overallSatisfactionScore && (
          <p className="text-sm text-red-500 mt-1">
            {errors.overallSatisfactionScore.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label 
          htmlFor="learnerFeedbackSummary" 
          className="text-base font-medium text-[#414554]"
        >
          Summary of Learner Feedback
        </Label>
        
        <Textarea
          id="learnerFeedbackSummary"
          {...register("learnerFeedbackSummary")}
          placeholder="Enter a summary of learner feedback"
          className={cn(
            "border border-[#DCDCDC] rounded-md resize-none h-32",
            errors.learnerFeedbackSummary && "border-red-500"
          )}
          disabled={readOnly}
        />
        
        {errors.learnerFeedbackSummary && (
          <p className="text-sm text-red-500 mt-1">
            {errors.learnerFeedbackSummary.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label 
          htmlFor="positiveFeedback" 
          className="text-base font-medium text-[#414554]"
        >
          Positive Feedback
        </Label>
        
        <Textarea
          id="positiveFeedback"
          {...register("positiveFeedback")}
          placeholder="Enter positive feedback"
          className={cn(
            "border border-[#DCDCDC] rounded-md resize-none h-32",
            errors.positiveFeedback && "border-red-500"
          )}
          disabled={readOnly}
        />
        
        {errors.positiveFeedback && (
          <p className="text-sm text-red-500 mt-1">
            {errors.positiveFeedback.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label 
          htmlFor="areasForImprovement" 
          className="text-base font-medium text-[#414554]"
        >
          Areas for Improvement
        </Label>
        
        <Textarea
          id="areasForImprovement"
          {...register("areasForImprovement")}
          placeholder="Enter areas for improvement"
          className={cn(
            "border border-[#DCDCDC] rounded-md resize-none h-32",
            errors.areasForImprovement && "border-red-500"
          )}
          disabled={readOnly}
        />
        
        {errors.areasForImprovement && (
          <p className="text-sm text-red-500 mt-1">
            {errors.areasForImprovement.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label 
          htmlFor="specificFeedbackExamples" 
          className="text-base font-medium text-[#414554]"
        >
          Specific Feedback Examples
        </Label>
        
        <Textarea
          id="specificFeedbackExamples"
          {...register("specificFeedbackExamples")}
          placeholder="Enter specific feedback examples"
          className={cn(
            "border border-[#DCDCDC] rounded-md resize-none h-32",
            errors.specificFeedbackExamples && "border-red-500"
          )}
          disabled={readOnly}
        />
        
        {errors.specificFeedbackExamples && (
          <p className="text-sm text-red-500 mt-1">
            {errors.specificFeedbackExamples.message}
          </p>
        )}
      </div>
    </div>
  )
} 