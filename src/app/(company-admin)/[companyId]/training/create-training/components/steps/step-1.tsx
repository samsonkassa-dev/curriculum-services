'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { StepProps } from '../types'
import { titleRationaleSchema, TitleRationaleFormData, BaseItem } from '@/types/training-form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useBaseData } from '@/lib/hooks/useBaseData'

interface ExtendedTitleRationaleFormData extends TitleRationaleFormData {
  trainingTypeId?: string;
}

export function CreateTrainingStep1({ onNext, onBack, onCancel, initialData, isEditing = false }: StepProps) {
  // Fetch training types if not provided in initialData
  const { data: trainingTypes, isLoading } = useBaseData(
    'training-type', 
    { enabled: !initialData?.preloadedTrainingTypes?.length }
  )

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<ExtendedTitleRationaleFormData>({
    resolver: zodResolver(titleRationaleSchema),
    defaultValues: {
      title: initialData?.title || '',
      rationale: initialData?.rationale || '',
      trainingTypeId: initialData?.trainingTypeId || ''
    }
  })

  // Use preloaded or fetched training types
  const allTrainingTypes = initialData?.preloadedTrainingTypes || trainingTypes || []
  const trainingTypeId = watch('trainingTypeId')

  const title = watch('title')
  const rationale = watch('rationale')
  
  const handleTrainingTypeChange = (value: string) => {
    setValue('trainingTypeId', value)
  }

  const onSubmit = (data: ExtendedTitleRationaleFormData) => {
    onNext(data)
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="lg:text-2xl md:text-xl text-lg font-semibold mb-2 text-center">
          What is the title and rationale of the training?
        </h2>
        <p className="lg:text-sm md:text-xs text-xs text-gray-500 text-center">
          Enter brief description about this question here
        </p>
      </div>

      <div className="flex flex-col max-w-xl mx-auto space-y-10 justify-center">
        <div className="space-y-2">
          <label className="text-sm font-medium">Training Title</label>
          <Input
            {...register('title')}
            placeholder="Enter a descriptive title for the training"
            className="max-w-xl text-sm md:text-md"
          />
          {errors.title && (
            <p className="text-sm text-red-500">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Training Rationale</label>
          <Input
            {...register('rationale')}
            placeholder="Explain the purpose and goals of this training"
            className="max-w-xl text-sm md:text-md"
          />
          {errors.rationale && (
            <p className="text-sm text-red-500">{errors.rationale.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Training Type</label>
          <Select 
            value={trainingTypeId} 
            onValueChange={handleTrainingTypeChange}
            disabled={isLoading && !allTrainingTypes.length}
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
        </div>

        {isEditing ? (
          <div className="flex justify-between pt-8 w-full">
            <div>
              {onBack && (
                <Button 
                  onClick={onBack} 
                  variant="outline" 
                  type="button"
                >
                  Back
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              {onCancel && (
                <Button 
                  onClick={onCancel} 
                  variant="outline" 
                  type="button"
                >
                  Cancel
                </Button>
              )}
              <Button 
                onClick={handleSubmit(onSubmit)}
                className="bg-blue-500 text-white px-8"
                type="button"
                disabled={!title?.trim() || !rationale?.trim() || !trainingTypeId}
              >
                Continue
              </Button>
            </div>
          </div>
        ) : (
          <Button 
            onClick={handleSubmit(onSubmit)}
            className="bg-blue-500 text-white px-8 w-[25%] mx-auto"
            type="button"
            disabled={!title?.trim() || !rationale?.trim() || !trainingTypeId}
          >
            Continue
          </Button>
        )}
      </div>
    </div>
  )
} 