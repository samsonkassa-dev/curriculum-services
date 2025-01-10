/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { OutlineSidebar } from "@/components/ui/outline-sidebar"
import { EditFormContainer } from "@/components/ui/edit-form-container"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface OverviewEditProps {
  training: any // Type this properly based on your training interface
  onSave: (data: any) => void
  onCancel: () => void
}

export function OverviewEdit({ training, onSave, onCancel }: OverviewEditProps) {
  const outlineItems = [
    { label: "Title", isCompleted: true },
    { label: "Location", isCompleted: false },
    { label: "Duration", isCompleted: false },
    { label: "Target Audience", isCompleted: false },
    { label: "Purpose of the training", isCompleted: false },
  ]

  return (
    <div className="px-[7%] py-10 flex gap-8">
      <OutlineSidebar 
        title="Overview Outline"
        items={outlineItems}
        activeItem="Title"
      />

      <EditFormContainer
        title="Title"
        description="Enter a brief overview of this section's content to give users a clear understanding of what to enter."
      >
        <div className="space-y-6">
          <div>
            <Input 
              placeholder="Enter Title"
              className="max-w-md"
            />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={() => onSave({})} className="bg-brand text-white">
              Save Changes
            </Button>
          </div>
        </div>
      </EditFormContainer>
    </div>
  )
} 