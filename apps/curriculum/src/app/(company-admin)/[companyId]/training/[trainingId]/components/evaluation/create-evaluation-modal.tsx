"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"

interface CreateEvaluationFormModalProps {
  isOpen: boolean
  onClose: () => void
  trainingId: string
}

export function CreateEvaluationFormModal({
  isOpen,
  onClose,
  trainingId
}: CreateEvaluationFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formType, setFormType] = useState<'pre' | 'post'>('pre')
  const [isRequired, setIsRequired] = useState(true)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // TODO: Implement form creation logic
      onClose()
    } catch (error) {
      console.error('Failed to create evaluation form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Evaluation Form</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Form Title</Label>
            <Input
              id="title"
              placeholder="Enter form title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter form description"
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-3">
            <Label>Form Type</Label>
            <RadioGroup
              value={formType}
              onValueChange={(value) => setFormType(value as 'pre' | 'post')}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pre" id="pre" />
                <Label htmlFor="pre" className="font-normal">Pre-Training Evaluation</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="post" id="post" />
                <Label htmlFor="post" className="font-normal">Post-Training Evaluation</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="required" 
              checked={isRequired}
              onCheckedChange={(checked) => setIsRequired(checked as boolean)}
            />
            <Label htmlFor="required" className="font-normal">
              Required for Training Completion
            </Label>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              {isSubmitting ? "Creating..." : "Create Form"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 