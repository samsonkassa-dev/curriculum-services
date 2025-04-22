"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { EditFormContainer } from "@/components/ui/edit-form-container"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

interface ApiError {
  message: string
}

interface ReferencesProps {
  trainingId: string
  initialData?: {
    code: string
    message: string
    references?: Array<{
      id: string
      definition: string
      trainingId: string
    }>
  } | null
  onSave: (data: { definition: string, trainingId: string }) => Promise<void>
  onCancel: () => void
}

export function References({
  trainingId,
  initialData,
  onSave,
  onCancel
}: ReferencesProps) {
  const [references, setReferences] = useState<string[]>(() => {
    if (initialData?.references?.length) {
      return initialData.references.map(ref => ref.definition)
    }
    return ['']
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const addReference = () => {
    setReferences([...references, ''])
  }

  const updateReference = (index: number, value: string) => {
    const newReferences = [...references]
    newReferences[index] = value
    setReferences(newReferences)
  }

  const removeReference = (index: number) => {
    setReferences(references.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    try {
      setIsSubmitting(true)
      // Filter out empty references
      const validReferences = references.filter(ref => ref.trim() !== '')
      
      // Only make API calls if there are valid references
      if (validReferences.length > 0) {
        for (const reference of validReferences) {
          await onSave({
            definition: reference,
            trainingId
          })
        }
      } else {
        // If no references, just call onSave with empty string to trigger navigation
        await onSave({
          definition: '',
          trainingId
        })
      }
    } catch (error: unknown) {
      const apiError = error as ApiError
      toast.error(apiError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <EditFormContainer
      title="References and Further Reading"
      description="Enter a brief overview of this section's content to give users a clear understanding of what to enter."
    >
      <div className="space-y-8 pr-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">References</h2>
            <span className="text-xs text-blue-500">(Optional)</span>
          </div>

          {references.map((reference, index) => (
            <div key={index} className="relative">
              <Input
                value={reference}
                onChange={(e) => updateReference(index, e.target.value)}
                placeholder="Enter reference"
                className="pr-10"
              />
              <div className="absolute right-10 top-1/2 -translate-y-1/2 h-full w-[1px] bg-gray-200" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeReference(index)}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-red-50 hover:bg-red-100 p-0"
              >
                <img src="/delete.svg" alt="delete" className="w-4 h-4" />
              </Button>
            </div>
          ))}

          <Button
            onClick={addReference}
            variant="link"
            className="text-brand"
          >
            + Add Reference
          </Button>
        </div>

        <div className="flex justify-center gap-10 pt-8">
          <Button variant="outline" onClick={onCancel}>
            Back
          </Button>
          <Button 
            onClick={handleSave}
            className="bg-brand text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save and Continue"}
          </Button>
        </div>
      </div>
    </EditFormContainer>
  )
} 