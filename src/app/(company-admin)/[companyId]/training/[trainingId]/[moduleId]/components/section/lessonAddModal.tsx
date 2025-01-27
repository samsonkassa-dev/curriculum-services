"use client"

import { useState, useEffect } from "react"
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

interface LessonAddModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: LessonFormData) => Promise<void>
  initialData?: LessonFormData // For edit mode
  isEdit?: boolean
}

interface LessonFormData {
  name: string
  description: string
}

export function LessonAddModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData,
  isEdit = false 
}: LessonAddModalProps) {
  console.log('Modal initialData:', initialData) // Debug log
  
  const [formData, setFormData] = useState<LessonFormData>(() => {
    console.log('Setting initial form data:', initialData) // Debug log
    return initialData || {
      name: "",
      description: "",
    }
  })

  // Add useEffect to update form when initialData changes
  useEffect(() => {
    if (initialData) {
      console.log('Updating form data:', initialData) // Debug log
      setFormData(initialData)
    }
  }, [initialData])

  const handleSubmit = async () => {
    await onSubmit(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] p-0">
        <DialogHeader className="flex flex-row items-center justify-between border-b p-6">
          <DialogTitle>{isEdit ? "Edit Lesson" : "Create Lesson"}</DialogTitle>
        </DialogHeader>

        <div className="p-6">
          <div className="grid gap-6">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Lesson Name</label>
                <Input
                  placeholder="Enter lesson name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Enter lesson description"
                  value={formData.description}
                  className="min-h-[100px]"
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="flex justify-center gap-4 pt-4">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="text-white bg-blue-500 hover:bg-blue-600"
              >
                {isEdit ? "Save Changes" : "Save"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 