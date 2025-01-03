import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { StepProps } from '../types'

export function CreateTrainingStep1({ onNext }: StepProps) {
  const [title, setTitle] = useState('')

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold mb-2 text-center">
          What is the title of the training
        </h2>
        <p className="text-gray-500 text-sm text-center">
          Enter brief description about this question here
        </p>
      </div>

      <div className="flex flex-col max-w-xl mx-auto space-y-10 justify-center">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter training title"
          className="max-w-xl"
        />

        <Button 
          onClick={() => onNext({ title })}
          className="bg-blue-500 text-white px-8 w-[25%] mx-auto"
          disabled={!title.trim()}
        >
          Continue
        </Button>
      </div>
    </div>
  )
} 