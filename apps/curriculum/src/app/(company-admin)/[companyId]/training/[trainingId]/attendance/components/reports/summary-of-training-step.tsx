"use client"

import { UseFormReturn } from "react-hook-form"
import { SessionReportFormValues } from "./session-report-schema"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface SummaryOfTrainingStepProps {
  form: UseFormReturn<SessionReportFormValues>
}

export function SummaryOfTrainingStep({ form }: SummaryOfTrainingStepProps) {
  const { register, formState: { errors }, watch, setValue } = form
  
  const topicsCovered = watch("topicsCovered")
  const significantObservations = watch("significantObservations")

  const addTopic = () => {
    setValue("topicsCovered", [...topicsCovered, ""])
  }

  const removeTopic = (index: number) => {
    const updatedTopics = topicsCovered.filter((_, i) => i !== index)
    setValue("topicsCovered", updatedTopics.length ? updatedTopics : [""])
  }

  const addObservation = () => {
    setValue("significantObservations", [...significantObservations, ""])
  }

  const removeObservation = (index: number) => {
    const updatedObservations = significantObservations.filter((_, i) => i !== index)
    setValue("significantObservations", updatedObservations.length ? updatedObservations : [""])
  }

  return (
    <div className="space-y-6 w-full max-w-full">
      <div className="space-y-4 w-full">
        <Label
          htmlFor="topicsCovered"
          className="text-base font-medium text-[#414554]"
        >
          Topics Covered
        </Label>

        {topicsCovered.map((topic, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-full">
              <Input
                id={`topicsCovered[${index}]`}
                {...register(`topicsCovered.${index}`)}
                placeholder="Enter topic covered"
                className={cn(
                  "border border-[#E4E4E4] rounded-md",
                  errors.topicsCovered?.[index] && "border-red-500"
                )}
              />
            </div>

            {topicsCovered.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeTopic(index)}
                className="p-1 h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}

        <Button
          type="button"
          variant="ghost"
          onClick={addTopic}
          className="flex items-center text-[#0B75FF] hover:bg-blue-50 hover:text-blue-700 pl-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add more
        </Button>
      </div>

      <div className="space-y-4 w-full">
        <Label
          htmlFor="significantObservations"
          className="text-base font-medium text-[#414554]"
        >
          Significant Observation
        </Label>

        {significantObservations.map((observation, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-full">
              <Input
                id={`significantObservations[${index}]`}
                {...register(`significantObservations.${index}`)}
                placeholder="Enter significant observation"
                className={cn(
                  "border border-[#E4E4E4] rounded-md",
                  errors.significantObservations?.[index] && "border-red-500"
                )}
              />
            </div>

            {significantObservations.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeObservation(index)}
                className="p-1 h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}

        <Button
          type="button"
          variant="ghost"
          onClick={addObservation}
          className="flex items-center text-[#0B75FF] hover:bg-blue-50 hover:text-blue-700 pl-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add more
        </Button>
      </div>
    </div>
  );
} 