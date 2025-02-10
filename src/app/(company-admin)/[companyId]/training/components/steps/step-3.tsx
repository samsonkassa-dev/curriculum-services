"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { StepProps } from '../types'

type DurationType = 'DAYS' | 'WEEKS' | 'MONTHS'

interface Step3Data {
  duration: number
  durationType: DurationType
}

export function CreateTrainingStep3({ onNext, onBack, initialData }: StepProps) {
  const [duration, setDuration] = useState<string>(
    initialData?.duration?.toString() || ''
  )
  const [durationType, setDurationType] = useState<DurationType>(
    initialData?.durationType || 'DAYS'
  )

  const handleSubmit = () => {
    onNext({
      duration: parseInt(duration),
      durationType
    })
  }

  const isValid = duration && parseInt(duration) > 0

  return (
    <div className="space-y-8">
      <div>
        <h2 className="lg:text-2xl md:text-xl text-lg font-semibold mb-2 text-center">
          What is the duration of this training?
        </h2>
        <p className="lg:text-sm md:text-xs text-xs text-gray-500 text-center mb-8">
          Enter brief description about this question here
        </p>
      </div>

      <div className="max-w-xl mx-auto space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Estimated duration</label>
          <Input
            type="number"
            min="1"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="Enter duration"
            className="text-sm md:text-md"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Duration type</label>
          <Select
            value={durationType}
            onValueChange={(value: DurationType) => setDurationType(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select duration type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DAYS">Days</SelectItem>
              <SelectItem value="WEEKS">Weeks</SelectItem>
              <SelectItem value="MONTHS">Months</SelectItem>
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
            disabled={!isValid}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  )
} 