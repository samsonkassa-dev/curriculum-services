/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EditFormContainer } from "@/components/ui/edit-form-container"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { BaseDataItem } from "@/types/base-data"


interface ModeDeliveryProps {
  trainingId: string
  initialData?: {
    deliveryTools: {
      id: string
      trainingId: string
      deliveryTools: Array<{
        id: string
        name: string
        description: string
      }>
    }
    code: string
    message: string
  } | null
  deliveryTools: BaseDataItem[]
  onSave: (data: { trainingId: string; deliveryToolIds: string[] }) => Promise<void>
  onCancel: () => void
}

export function ModeDelivery({ 
  trainingId, 
  initialData, 
  deliveryTools,
  onSave, 
  onCancel 
}: ModeDeliveryProps) {
  const [selectedTools, setSelectedTools] = useState<string[]>([])
  const [otherValue, setOtherValue] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)


  // Separate regular tools and Other option
  const regularTools = useMemo(() => deliveryTools, [deliveryTools])
  const otherTool = useMemo(() => ({ 
    id: 'other', 
    name: 'Other', 
    description: 'Other delivery mode' 
  }), [])

  // Update selections when initialData changes
  useEffect(() => {
    if (initialData?.deliveryTools?.deliveryTools) {
      const selectedIds = initialData.deliveryTools.deliveryTools.map(tool => tool.id)
      setSelectedTools(selectedIds)

      // If there was an "other" option saved, handle it
      const otherTool = initialData.deliveryTools.deliveryTools.find(
        tool => tool.name.toLowerCase() === 'other'
      )
      if (otherTool) {
        setSelectedTools(prev => [...prev, 'other'])
        setOtherValue(otherTool.description || '')
      }
    }
  }, [initialData])


  const handleSave = async () => {
    try {
      setIsSubmitting(true)
      await onSave({
        trainingId,
        deliveryToolIds: selectedTools.filter(id => id !== 'other')
      })
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToolChange = (toolId: string, checked: boolean) => {
    if (checked) {
      setSelectedTools(prev => [...prev, toolId])
    } else {
      setSelectedTools(prev => prev.filter(id => id !== toolId))
    }
  }

  return (
    <EditFormContainer
      title="Mode of Delivery"
      description="Enter a brief overview of this section's content to give users a clear understanding of what to enter."
    >
      <div className="space-y-6 pr-8">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">What is the primary mode of delivery for the training?</h2>
          
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 pt-2">
            {/* Left column */}
            <div className="space-y-4">
              {regularTools.slice(0, Math.ceil(regularTools.length / 2)).map((tool) => (
                <div key={tool.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={tool.id}
                    checked={selectedTools.includes(tool.id)}
                    onCheckedChange={(checked) => 
                      handleToolChange(tool.id, checked as boolean)
                    }
                  />
                  <label 
                    htmlFor={tool.id}
                    className="text-sm md:text-base text-gray-500 font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {tool.name}
                  </label>
                </div>
              ))}
            </div>

            {/* Right column */}
            <div className="space-y-4">
              {regularTools.slice(Math.ceil(regularTools.length / 2)).map((tool) => (
                <div key={tool.id} className="flex items-center space-x-3">
                  <Checkbox
                    id={tool.id}
                    checked={selectedTools.includes(tool.id)}
                    onCheckedChange={(checked) => 
                      handleToolChange(tool.id, checked as boolean)
                    }
                  />
                  <label 
                    htmlFor={tool.id}
                    className="text-sm md:text-base text-gray-500 font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {tool.name}
                  </label>
                </div>
              ))}

              {/* Other option - always at the end of right column */}
              <div className="flex items-center space-x-3">
                <Checkbox
                  id={otherTool.id}
                  checked={selectedTools.includes(otherTool.id)}
                  onCheckedChange={(checked) => 
                    handleToolChange(otherTool.id, checked as boolean)
                  }
                />
                <label 
                  htmlFor={otherTool.id}
                  className="text-sm md:text-base text-gray-500 font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {otherTool.name}
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Show Other input when "Other" is selected */}
        {selectedTools.includes('other') && (
          <div className="space-y-4 ">
            <h3 className="text-sm font-medium">If Others, Please Specify.</h3>
            <Input
              value={otherValue}
              onChange={(e) => setOtherValue(e.target.value)}
              placeholder="Please specify other delivery mode"
              className="max-w-md"
            />
          </div>
        )}

        <div className="flex justify-center gap-10 pt-8">
          <Button variant="outline" onClick={onCancel}>
            Back
          </Button>
          <Button 
            onClick={handleSave}
            className="bg-brand text-white"
            disabled={isSubmitting || selectedTools.length === 0 || (selectedTools.includes('other') && !otherValue.trim())}
          >
            {isSubmitting ? "Saving..."  : "Save and Continue"}
          </Button>
        </div>
      </div>
    </EditFormContainer>
  )
}
