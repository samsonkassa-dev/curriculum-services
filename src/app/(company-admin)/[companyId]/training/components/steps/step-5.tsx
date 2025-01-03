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
  isSubmitting?: boolean
}

export function CreateTrainingStep5({ onNext, onBack, isSubmitting }: Step5Props) {
  const { data: trainingPurposes, isLoading } = useBaseData('training-purpose')
  const [selectedPurposeId, setSelectedPurposeId] = useState<string>('')

  const safePurposes = trainingPurposes || []

  const handleSubmit = () => {
    onNext({
      trainingPurposeIds: [selectedPurposeId]
    })
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold mb-2 text-center">
          What is the purpose for the training?
        </h2>
        <p className="text-gray-500 text-sm text-center mb-8">
          Enter brief description about this question here
        </p>
      </div>

      <div className="max-w-xl mx-auto space-y-6">
        <div className="space-y-2">
          <Select
            value={selectedPurposeId}
            onValueChange={setSelectedPurposeId}
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
          <Button onClick={onBack} variant="outline">
            Back
          </Button>
          <Button 
            onClick={handleSubmit}
            className="bg-blue-500 text-white px-8"
            disabled={!selectedPurposeId || isSubmitting}
          >
            Create Training
          </Button>
        </div>
      </div>
    </div>
  )
} 