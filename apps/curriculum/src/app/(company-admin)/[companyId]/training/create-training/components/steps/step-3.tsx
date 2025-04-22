"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StepProps } from '../types'
import { durationSchema, DurationFormData, BaseItem } from '@/types/training-form'
import { useBaseData } from '@/lib/hooks/useBaseData'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from '@/lib/utils'

export function CreateTrainingStep3({ onNext, onBack, onCancel, initialData, isEditing = false }: StepProps) {
  // Fetch training types if not provided
  const { data: trainingTypes, isLoading: isLoadingTrainingTypes } = useBaseData(
    'training-type', 
    { enabled: !initialData?.preloadedTrainingTypes?.length }
  )

  // Use preloaded or fetched training types
  const allTrainingTypes = initialData?.preloadedTrainingTypes || trainingTypes || []

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<DurationFormData>({
    resolver: zodResolver(durationSchema),
    defaultValues: {
      duration: initialData?.duration || undefined,
      durationType: initialData?.durationType || 'DAYS',
      trainingTypeId: initialData?.trainingTypeId || '',
    }
  })

  const duration = watch('duration')
  const durationType = watch('durationType')
  const trainingTypeId = watch('trainingTypeId')

  const handleDurationTypeChange = (value: "DAYS" | "WEEKS" | "MONTHS" | "HOURS") => {
    setValue('durationType', value, { shouldValidate: true })
  }

  const handleTrainingTypeChange = (value: string) => {
    setValue('trainingTypeId', value, { shouldValidate: true })
  }

  const onSubmit = (data: DurationFormData) => {
    onNext(data)
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="lg:text-2xl md:text-xl text-lg font-semibold mb-2 text-center">
          What is the duration and type of this training?
        </h2>
        <p className="lg:text-sm md:text-xs text-xs text-gray-500 text-center mb-8">
          Enter brief description about this question here
        </p>
      </div>

      <div className="max-w-xl mx-auto space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Estimated duration</label>
            <Input
              type="number"
              min={1}
              {...register('duration', { valueAsNumber: true })}
              placeholder="Enter duration"
              className="text-sm md:text-md"
            />
            {errors.duration && (
              <p className="text-sm text-red-500">{errors.duration.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Duration type</label>
            <Select value={durationType} onValueChange={handleDurationTypeChange}>
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
            {errors.durationType && (
              <p className="text-sm text-red-500">{errors.durationType.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Training Type</label>
          <Select 
            value={trainingTypeId} 
            onValueChange={handleTrainingTypeChange}
            disabled={isLoadingTrainingTypes && !allTrainingTypes.length}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select training type" />
            </SelectTrigger>
            <SelectContent>
              {allTrainingTypes.map((type: BaseItem) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.trainingTypeId && (
            <p className="text-sm text-red-500">{errors.trainingTypeId.message}</p>
          )}
        </div>


        <div className="flex justify-between pt-8">
          {isEditing ? (
            <>
              <Button onClick={onBack} variant="outline" type="button">
                Back
              </Button>
              <div className="flex gap-2">
                {onCancel && (
                  <Button onClick={onCancel} variant="outline" type="button">
                    Cancel
                  </Button>
                )}
                <Button 
                  onClick={handleSubmit(onSubmit)}
                  className="bg-blue-500 text-white px-8"
                  disabled={!duration || !durationType || !trainingTypeId}
                  type="button"
                >
                  Continue
                </Button>
              </div>
            </>
          ) : (
            <>
              <Button onClick={onBack} variant="outline" type="button">
                Back
              </Button>
              <Button 
                onClick={handleSubmit(onSubmit)}
                className="bg-blue-500 text-white px-8"
                disabled={!duration || !durationType || !trainingTypeId}
                type="button"
              >
                Continue
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
} 