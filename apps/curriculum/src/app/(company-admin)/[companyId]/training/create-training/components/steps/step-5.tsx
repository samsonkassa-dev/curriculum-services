"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useBaseData } from '@/lib/hooks/useBaseData'

interface BaseItem {
  id: string
  name: string
  description: string
}

interface Step5Props {
  onNext: (data: { trainingPurposeIds: string[] }) => void
  onBack: () => void
  onCancel?: () => void
  isSubmitting?: boolean
  initialData?: { 
    trainingPurposeIds?: string[] 
    preloadedTrainingPurposes?: BaseItem[]
  }
  isEditing?: boolean
}

export function CreateTrainingStep5({ onNext, onBack, onCancel, isSubmitting, initialData, isEditing = false }: Step5Props) {
  // Only fetch if not preloaded
  const { data: trainingPurposes, isLoading } = useBaseData(
    'training-purpose', 
    { enabled: !initialData?.preloadedTrainingPurposes?.length }
  )
  
  const [selectedPurposeId, setSelectedPurposeId] = useState<string>(
    initialData?.trainingPurposeIds?.[0] || ''
  )

  // Use preloaded data or fetched data
  const safePurposes = initialData?.preloadedTrainingPurposes?.length
    ? initialData.preloadedTrainingPurposes
    : trainingPurposes || []

  const handleSubmit = () => {
    onNext({
      trainingPurposeIds: [selectedPurposeId]
    })
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="lg:text-2xl md:text-xl text-lg font-semibold mb-2 text-center">
          What is the purpose for the training?
        </h2>
        <p className="lg:text-sm md:text-xs text-xs text-gray-500 text-center mb-8">
          Enter brief description about this question here
        </p>
      </div>

      <div className="max-w-xl mx-auto space-y-6">
        <div className="space-y-2">
          <Select
            value={selectedPurposeId}
            onValueChange={setSelectedPurposeId}
            disabled={isLoading && !initialData?.preloadedTrainingPurposes?.length}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select purpose" />
            </SelectTrigger>
            <SelectContent>
              {safePurposes.map((item: BaseItem) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-between pt-8">
          {isEditing ? (
            <>
              <Button onClick={onBack} variant="outline">
                Back
              </Button>
              <div className="flex gap-2">
                {onCancel && (
                  <Button onClick={onCancel} variant="outline">
                    Cancel
                  </Button>
                )}
                <Button 
                  onClick={handleSubmit}
                  className="bg-blue-500 text-white px-8"
                  disabled={!selectedPurposeId || isSubmitting}
                >
                  {isSubmitting ? 'Editing...' : 'Edit Training'}
                </Button>
              </div>
            </>
          ) : (
            <>
              <Button onClick={onBack} variant="outline">
                Back
              </Button>
              <Button 
                onClick={handleSubmit}
                className="bg-blue-500 text-white px-8"
                disabled={!selectedPurposeId || isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Training'}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
} 