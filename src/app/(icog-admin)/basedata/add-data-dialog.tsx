"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Loader2 } from "lucide-react"
import { useState } from "react"
import { BaseDataItem } from "@/types/base-data"
import { Textarea } from "@/components/ui/textarea"

interface AddDataDialogProps {
  onAddData?: (data: { name: string; description: string }) => void;
  onUpdateData?: (data: { name: string; description: string }) => void;
  initialData?: BaseDataItem;
  isLoading?: boolean;
  mode?: 'add' | 'edit';
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AddDataDialog({ 
  onAddData, 
  onUpdateData,
  initialData,
  isLoading,
  mode = 'add',
  open,
  onOpenChange
}: AddDataDialogProps) {
  const [name, setName] = useState(initialData?.name || "")
  const [description, setDescription] = useState(initialData?.description || "")
  const [dialogOpen, setDialogOpen] = useState(false)

  const actualOpen = open ?? dialogOpen;
  const actualOnOpenChange = onOpenChange ?? setDialogOpen;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (mode === 'edit' && onUpdateData) {
      onUpdateData({ name, description })
    } else if (onAddData) {
      onAddData({ name, description })
    }
    actualOnOpenChange(false)
  }

  return (
    <Dialog open={actualOpen} onOpenChange={actualOnOpenChange}>
      {mode === 'add' && (
        <DialogTrigger asChild className="">
          <Button variant="ghost" className="text-blue-500 hover:text-blue-600 hover:bg-blue-50">
            <Plus className="h-4 w-4 mr-2" />
            Add Data
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="w-full max-w-2xl p-0">
        <DialogHeader className="px-6 pt-6 border-b-[0.3px] border-[#CED4DA] pb-4">
          <DialogTitle>{mode === 'add' ? 'Add Row' : 'Edit Row'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 p-10">
          <div className="grid gap-2 px-5">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name"
              className="h-9"
            />
          </div>
          <div className="grid gap-2 px-5 pt-5">
            <Label htmlFor="description">Description</Label>
            <Textarea
                id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
              className="min-h-[80px] resize-none"
            />
          </div>
          <div className="flex justify-center gap-5 mt-8">
            <Button type="button" variant="outline" onClick={() => actualOnOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-brand text-white hover:bg-brand/90">
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              {mode === 'add' ? 'Save' : 'Update'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 