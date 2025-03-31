'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { StepProps } from '../types'
import { titleRationaleSchema, TitleRationaleFormData } from '@/types/training-form'

export function CreateTrainingStep1({ onNext, initialData }: StepProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<TitleRationaleFormData>({
    resolver: zodResolver(titleRationaleSchema),
    defaultValues: {
      title: initialData?.title || '',
      rationale: initialData?.rationale || ''
    }
  })

  const title = watch('title')
  const rationale = watch('rationale')
  const onSubmit = (data: TitleRationaleFormData) => {
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

        <Button 
          onClick={handleSubmit(onSubmit)}
          className="bg-blue-500 text-white px-8 w-[25%] mx-auto"
          type="button"
          disabled={!title?.trim() || !rationale?.trim()}
        >
          Continue
        </Button>
      </div>
    </div>
  )
} 