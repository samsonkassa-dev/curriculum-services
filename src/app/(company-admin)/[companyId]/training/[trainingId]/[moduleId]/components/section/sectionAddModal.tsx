"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { X } from "lucide-react"

interface SectionAddModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: SectionFormData) => Promise<void>
}

interface SectionFormData {
  name: string
  topic: string
  creditHour: number
  description: string
}

export function SectionAddModal({ isOpen, onClose, onSubmit }: SectionAddModalProps) {
  const [formData, setFormData] = useState<SectionFormData>({
    name: "",
    topic: "",
    creditHour: 0,
    description: ""
  })

  const handleSubmit = async () => {
    await onSubmit(formData)
    onClose()
  }

  console.log('Modal rendered, isOpen:', isOpen)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0">
        <DialogHeader className="flex flex-row items-center justify-between border-b p-6">
          <DialogTitle>Create Section</DialogTitle>
        </DialogHeader>

        <div className="p-6">
          <div className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input 
                  placeholder="type here"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Topic</label>
                <Input 
                  placeholder="type here"
                  value={formData.topic}
                  onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Credit Hour</label>
                <Input 
                  type="number"
                  placeholder="type here"
                  value={formData.creditHour || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, creditHour: Number(e.target.value) }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Content Description</label>
                <Textarea 
                  placeholder="type here"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 p-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="text-white bg-blue-500 hover:bg-blue-600">
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}