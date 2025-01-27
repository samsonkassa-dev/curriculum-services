"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ModuleAddModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { name: string; description: string }) => void
  isLoading?: boolean
  editData?: {
    id: string
    name: string
    description: string
  } | null
}

export function ModuleAddModal({ 
  isOpen, 
  onClose, 
  onSubmit,
  isLoading,
  editData 
}: ModuleAddModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  })

  const [errors, setErrors] = useState({
    name: '',
    description: ''
  })

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: editData?.name || "",
        description: editData?.description || ""
      })
    }
  }, [isOpen, editData])

  const handleClose = useCallback(() => {
    setFormData({ name: "", description: "" })
    onClose()
  }, [onClose])

  const validateForm = () => {
    const newErrors = {
      name: formData.name.trim() === '' ? 'Name is required' : '',
      description: formData.description.trim() === '' ? 'Description is required' : ''
    }
    setErrors(newErrors)
    return !Object.values(newErrors).some(error => error !== '')
  }

  const handleSubmit = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (validateForm()) {
      onSubmit(formData)
    }
  }, [formData, onSubmit])

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-w-[350px]">
        <DialogHeader>
          <DialogTitle>{editData ? 'Edit' : 'Create'} Module</DialogTitle>
        </DialogHeader>
        <hr className="my-1 -mx-6" />
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Module Name</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="type here"
              className={`w-full ${errors.name ? 'border-red-500' : ''}`}
            />
            {errors.name && <span className="text-red-500 text-sm">{errors.name}</span>}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="type here"
              className="w-full min-h-[100px]"
            />
          </div>
          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              className="bg-blue-500 text-white"
              disabled={isLoading}
            >
              {isLoading ? `${editData ? 'Updating...' : 'Creating...'}` : editData ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
