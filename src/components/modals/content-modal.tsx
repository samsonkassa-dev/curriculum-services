"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useState } from "react"

interface ContentModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: { link: string; referenceLink: string }) => void
  defaultValues?: { link: string; referenceLink: string }
  mode?: 'add' | 'edit'
}

export function ContentModal({ 
  isOpen, 
  onClose, 
  onSave, 
  defaultValues,
  mode = 'add' 
}: ContentModalProps) {
  const [formData, setFormData] = useState({
    link: defaultValues?.link || "",
    referenceLink: defaultValues?.referenceLink || "",
  })

  const handleSubmit = () => {
    onSave(formData)
    setFormData({ link: "", referenceLink: "" }) // Reset form after submit
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl max-w-[330px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            {mode === 'add' ? 'Add Content Link' : 'Edit Content Link'}
          </DialogTitle>
        </DialogHeader>
        <hr className="border-[#f2f2f2] border-[1px] -mx-6" />
        <div className="flex flex-col gap-4">
          <div className="flex flex-row gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Content Link</label>
              <Input
                placeholder="Enter content link"
                value={formData.link}
                onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Reference Link</label>
              <Input
                placeholder="Enter reference link"
                value={formData.referenceLink}
                onChange={(e) => setFormData(prev => ({ ...prev, referenceLink: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex justify-center gap-7 pt-6">
            <Button
              onClick={onClose}
              variant="outline"
              className="px-8 text-brand border-brand"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="px-8 bg-brand text-white hover:bg-brand/90"
            >
              {mode === 'add' ? 'Save' : 'Update'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 