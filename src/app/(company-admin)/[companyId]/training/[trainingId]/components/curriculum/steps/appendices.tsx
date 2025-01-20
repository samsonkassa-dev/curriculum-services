"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { EditFormContainer } from "@/components/ui/edit-form-container"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

interface ApiError {
  message: string
}

interface AppendicesProps {
  trainingId: string
  initialData?: {
    code: string
    message: string
    appendices?: Array<{
      id: string
      definition: string
      trainingId: string
    }>
  } | null
  onSave: (data: { definition: string, trainingId: string }) => Promise<void>
  onCancel: () => void
}

export function Appendices({
  trainingId,
  initialData,
  onSave,
  onCancel
}: AppendicesProps) {
  const [appendices, setAppendices] = useState<string[]>(() => {
    if (initialData?.appendices?.length) {
      return initialData.appendices.map(app => app.definition)
    }
    return ['']
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const addAppendix = () => {
    setAppendices([...appendices, ''])
  }

  const updateAppendix = (index: number, value: string) => {
    const newAppendices = [...appendices]
    newAppendices[index] = value
    setAppendices(newAppendices)
  }

  const removeAppendix = (index: number) => {
    setAppendices(appendices.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    try {
      setIsSubmitting(true)
      const validAppendices = appendices.filter(app => app.trim() !== '')
      
      if (validAppendices.length > 0) {
        for (const appendix of validAppendices) {
          await onSave({
            definition: appendix,
            trainingId
          })
        }
      } else {
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
      title="Appendices"
      description="Enter a brief overview of this section's content to give users a clear understanding of what to enter."
    >
      <div className="space-y-8 pr-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Appendices</h2>
            <span className="text-xs text-blue-500">(Optional)</span>
          </div>

          {appendices.map((appendix, index) => (
            <div key={index} className="relative">
              <Input
                value={appendix}
                onChange={(e) => updateAppendix(index, e.target.value)}
                placeholder="Enter appendix"
                className="pr-10"
              />
              <div className="absolute right-10 top-1/2 -translate-y-1/2 h-full w-[1px] bg-gray-200" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeAppendix(index)}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-red-50 hover:bg-red-100 p-0"
              >
                <img src="/delete.svg" alt="delete" className="w-4 h-4" />
              </Button>
            </div>
          ))}

          <Button
            onClick={addAppendix}
            variant="link"
            className="text-brand"
          >
            + Add Appendices
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